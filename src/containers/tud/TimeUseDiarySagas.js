// @flow

import {
  call,
  put,
  select,
  takeEvery
} from '@redux-saga/core/effects';
import {
  List,
  Map,
  fromJS,
  get,
  getIn
} from 'immutable';
import { Constants } from 'lattice';
import {
  DataApiActions,
  DataApiSagas,
  SearchApiActions,
  SearchApiSagas
} from 'lattice-sagas';
import { DataUtils, Logger } from 'lattice-utils';
import { DateTime } from 'luxon';
import type { Saga } from '@redux-saga/core';
import type { WorkerResponse } from 'lattice-sagas';
import type { SequenceAction } from 'redux-reqseq';

import DataTypes from './constants/DataTypes';
import {
  DOWNLOAD_SUMMARIZED_DATA,
  DOWNLOAD_TUD_DATA,
  GET_SUBMISSIONS_BY_DATE,
  SUBMIT_TUD_DATA,
  downloadRawData,
  downloadSummarizedData,
  downloadTudData,
  getSubmissionsByDate,
  submitTudData,
} from './TimeUseDiaryActions';
import {
  createSubmitRequestBody,
  exportRawDataToCsvFile,
  exportSummarizedDataToCsvFile,
  getOutputFileName
} from './utils';

import * as AppModules from '../../utils/constants/AppModules';
import * as ChronicleApi from '../../utils/api/ChronicleApi';
import {
  selectESIDByCollection,
  selectEntitySetsByModule,
  selectPropertyTypeId
} from '../../core/edm/EDMUtils';
import {
  ADDRESSES,
  ANSWER,
  PARTICIPANTS,
  QUESTION,
  REGISTERED_FOR,
  RESPONDS_WITH,
  SUBMISSION,
  SUMMARY_SET,
  TIME_RANGE
} from '../../core/edm/constants/EntityTemplateNames';
import { PROPERTY_TYPE_FQNS } from '../../core/edm/constants/FullyQualifiedNames';

const LOG = new Logger('TimeUseDiarySagas');

const { getEntitySetDataWorker } = DataApiSagas;
const { getEntitySetData } = DataApiActions;
const { searchEntityNeighborsWithFilterWorker } = SearchApiSagas;
const { searchEntityNeighborsWithFilter } = SearchApiActions;

const { getEntityKeyId, getPropertyValue } = DataUtils;

const { OPENLATTICE_ID_FQN } = Constants;

const {
  DATETIME_END_FQN,
  DATETIME_START_FQN,
  DATE_TIME_FQN,
  ID_FQN,
  PERSON_ID,
  VALUES_FQN,
  VARIABLE_FQN,
} = PROPERTY_TYPE_FQNS;

function* submitTudDataWorker(action :SequenceAction) :Saga<*> {
  try {
    yield put(submitTudData.request(action.id));
    const {
      familyId,
      formData,
      organizationId,
      participantId,
      studyId,
      waveId,
      language,
      translationData
    } = action.value;

    const requestBody = createSubmitRequestBody(formData, familyId, waveId, language, translationData);

    const response = yield call(ChronicleApi.submitTudData, organizationId, studyId, participantId, requestBody);
    if (response.error) throw response.error;

    yield put(submitTudData.success(action.id));
  }
  catch (error) {
    LOG.error(action.type, error);
    yield put(submitTudData.failure(action.id));
  }
  finally {
    yield put(submitTudData.finally(action.id));
  }
}

function* submitTudDataWatcher() :Saga<*> {
  yield takeEvery(SUBMIT_TUD_DATA, submitTudDataWorker);
}

function* getSubmissionsByDateWorker(action :SequenceAction) :Saga<*> {
  try {
    yield put(getSubmissionsByDate.request(action.id));

    const {
      endDate,
      startDate,
    } = action.value;

    const participantsESID = yield select(selectESIDByCollection(PARTICIPANTS, AppModules.CHRONICLE_CORE));

    const personPTID = yield select(selectPropertyTypeId(PERSON_ID));
    const participantsRes = yield call(getEntitySetDataWorker, getEntitySetData(
      {
        entitySetId: participantsESID,
        propertyTypeIds: [personPTID]
      }
    ));
    if (participantsRes.error) throw participantsRes.error;
    const participants :Object = participantsRes.data.reduce((result, entity) => ({
      [getIn(entity, [OPENLATTICE_ID_FQN, 0])]: getIn(entity, [PERSON_ID, 0]),
      ...result
    }), {});

    const participantEKIDs :UUID[] = participantsRes.data.map(getEntityKeyId);

    const submissionESID = yield select(selectESIDByCollection(SUBMISSION, AppModules.QUESTIONNAIRES));
    const respondsWithESID = yield select(selectESIDByCollection(RESPONDS_WITH, AppModules.QUESTIONNAIRES));

    // filtered neighbor entity search on participants entity set to get submissions
    const searchFilter = {
      destinationEntitySetIds: [submissionESID],
      edgeEntitySetIds: [respondsWithESID],
      entityKeyIds: participantEKIDs,
      sourceEntitySetIds: [participantsESID]
    };

    const response = yield call(
      searchEntityNeighborsWithFilterWorker,
      searchEntityNeighborsWithFilter({
        entitySetId: participantsESID,
        filter: searchFilter,
      })
    );
    if (response.error) throw response.error;

    // group results by date
    const adjustedStartDate = DateTime.fromISO(startDate).set({ hour: 0, minute: 0 });
    const adjustedEndDate = DateTime.fromISO(endDate).set({ hour: 23, minute: 59 });

    const submissionsByDate = Map().withMutations((mutator) => {
      fromJS(response.data).forEach((neighbors :List, participantEKID :UUID) => {
        // only consider results that are between startDate & endDate
        neighbors.forEach((neighbor :Map) => {

          const date = DateTime.fromISO(neighbor.getIn(['associationDetails', DATE_TIME_FQN, 0]));
          // $FlowFixMe
          if (date.diff(adjustedStartDate, 'hours').toObject().hours > 0
          // $FlowFixMe
            && date.diff(adjustedEndDate, 'hours').toObject().hours < 0) {

            const dateStr = date.toLocaleString(DateTime.DATE_SHORT);

            const neighborDetails = neighbor.get('neighborDetails');
            const entity = fromJS({
              [OPENLATTICE_ID_FQN]: getPropertyValue(neighborDetails, OPENLATTICE_ID_FQN),
              [PERSON_ID.toString()]: [get(participants, participantEKID)],
              [ID_FQN.toString()]: [participantEKID],
              [DATE_TIME_FQN.toString()]: getPropertyValue(neighborDetails, DATE_TIME_FQN)
            });
            mutator.update(dateStr, List(), (list) => list.push(entity));
          }
        });
      });
    });

    yield put(getSubmissionsByDate.success(action.id, submissionsByDate));

  }
  catch (error) {
    LOG.error(action.type, error);
    yield put(getSubmissionsByDate.failure(action.id));
  }
  finally {
    yield put(getSubmissionsByDate.finally(action.id));
  }
}

function* getSubmissionsByDateWatcher() :Saga<*> {
  yield takeEvery(GET_SUBMISSIONS_BY_DATE, getSubmissionsByDateWorker);
}

function* downloadSummarizedDataWorker(action :SequenceAction) :Saga<WorkerResponse> {
  let workerResponse = {};
  try {
    yield put(downloadSummarizedData.request(action.id));

    const {
      date,
      endDate,
      entities,
      startDate,
    } = action.value;

    const submissionIds = entities.map((entity) => entity.get(OPENLATTICE_ID_FQN)).flatten();
    const submissionMetadata = Map(entities.map((entity) => [entity.getIn([OPENLATTICE_ID_FQN, 0]), entity]));

    // entity set ids
    const surveyEntitySets :Map = yield select(selectEntitySetsByModule(AppModules.QUESTIONNAIRES));

    const submissionESID = surveyEntitySets.get(SUBMISSION);
    const registeredForESID = surveyEntitySets.get(REGISTERED_FOR);
    const summarysetESID = surveyEntitySets.get(SUMMARY_SET);

    // filtered search on submissions
    const filter = {
      destinationEntitySetIds: [submissionESID],
      edgeEntitySetIds: [registeredForESID],
      entityKeyIds: submissionIds,
      sourceEntitySetIds: [summarysetESID]
    };

    const response = yield call(
      searchEntityNeighborsWithFilterWorker,
      searchEntityNeighborsWithFilter({
        entitySetId: submissionESID,
        filter,
      })
    );
    if (response.error) throw response.error;

    // create submissionEKID -> ol.variable -> ol.value map
    const summaryData = Map().withMutations((mutator) => {
      fromJS(response.data).forEach((neighbors, submissionId) => {
        neighbors.forEach((neighbor) => {
          const neighborDetails = neighbor.get('neighborDetails');
          const variable = getPropertyValue(neighborDetails, [VARIABLE_FQN, 0]);
          const value = getPropertyValue(neighborDetails, [VALUES_FQN, 0]);
          mutator.setIn([submissionId, variable], value);
        });
      });
    });

    const outputFilename = getOutputFileName(date, startDate, endDate, DataTypes.SUMMARIZED);
    exportSummarizedDataToCsvFile(summaryData, submissionMetadata, outputFilename);

    workerResponse = { data: null };
    yield put(downloadSummarizedData.success(action.id));
  }
  catch (error) {
    workerResponse = { error };
    LOG.error(action.type, error);
    yield put(downloadSummarizedData.failure(action.id));
  }
  finally {
    yield put(downloadSummarizedData.finally(action.id));
  }

  return workerResponse;
}

function* downloadSummarizedDataWatcher() :Saga<*> {
  yield takeEvery(DOWNLOAD_SUMMARIZED_DATA, downloadSummarizedDataWorker);
}

function* downloadRawDataWorker(action :SequenceAction) :Saga<WorkerResponse> {
  let workerResponse = {};
  const {
    dataType,
    date,
    endDate,
    entities,
    startDate,
  } = action.value;
  try {
    yield put(downloadRawData.request(action.id));

    const submissionIds = entities.map((entity) => entity.get(OPENLATTICE_ID_FQN)).flatten();
    const submissionMetadata = Map(entities.map((entity) => [entity.getIn([OPENLATTICE_ID_FQN, 0]), entity]));

    // entity set ids
    const surveyEntitySets :Map = yield select(selectEntitySetsByModule(AppModules.QUESTIONNAIRES));

    const submissionESID = surveyEntitySets.get(SUBMISSION);
    const answersESID = surveyEntitySets.get(ANSWER);
    const registeredForESID = surveyEntitySets.get(REGISTERED_FOR);
    const questionsESID = surveyEntitySets.get(QUESTION);
    const timeRangeESID = surveyEntitySets.get(TIME_RANGE);
    const addressesESID = surveyEntitySets.get(ADDRESSES);

    // filtered neighbor search on submission es to get answers
    let searchFilter = {
      destinationEntitySetIds: [],
      edgeEntitySetIds: [registeredForESID],
      entityKeyIds: submissionIds.toJS(),
      sourceEntitySetIds: [answersESID]
    };

    let response = yield call(
      searchEntityNeighborsWithFilterWorker,
      searchEntityNeighborsWithFilter({
        entitySetId: submissionESID,
        filter: searchFilter,
      })
    );
    if (response.error) throw response.error;

    // const answersMap = {}; // { answerId -> {ol.values: }}
    const answerSubmissionIdMap = Map().asMutable(); // answerId -> submissionId

    const answersMap = Map().withMutations((mutator :Map) => {
      fromJS(response.data).forEach((neighbors :List, submissionId :UUID) => {
        neighbors.forEach((neighbor :Map) => {
          const entity = neighbor.get('neighborDetails');
          const values = getPropertyValue(entity, VALUES_FQN, List());
          const answerId = getEntityKeyId(entity);

          mutator.set(answerId, values);
          answerSubmissionIdMap.set(answerId, submissionId);
        });
      });
    });

    // filtered search on answers to get time range data
    searchFilter = {
      destinationEntitySetIds: [timeRangeESID],
      edgeEntitySetIds: [registeredForESID],
      entityKeyIds: answersMap.keySeq().toJS(),
      sourceEntitySetIds: []
    };
    response = yield call(
      searchEntityNeighborsWithFilterWorker,
      searchEntityNeighborsWithFilter({
        entitySetId: answersESID,
        filter: searchFilter,
      })
    );
    if (response.error) throw response.error;

    const answerIdTimeRangeIdMap = Map().asMutable(); // answerId -> submissionId
    const timeRangeValues = Map().withMutations((mutator :Map) => { // submission -> timeRangeId -> { start:, end: }
      fromJS(response.data).forEach((neighbors :List, answerId :UUID) => {

        // each answer has a single registeredFor edge to timerange
        const neighbor = neighbors.first().get('neighborDetails');
        const timeRangeId = getEntityKeyId(neighbor);

        // if timerange neighbor has endtime & startime properties, this is a valid timeRange
        if (neighbor.has(DATETIME_END_FQN) && neighbor.has(DATETIME_START_FQN)) {
          const submissionId = answerSubmissionIdMap.get(answerId);
          answerIdTimeRangeIdMap.set(answerId, timeRangeId);

          mutator
            .setIn([submissionId, timeRangeId, DATETIME_START_FQN], neighbor.get(DATETIME_START_FQN))
            .setIn([submissionId, timeRangeId, DATETIME_END_FQN], neighbor.get(DATETIME_END_FQN));
        }
      });
    });

    // filtered search on answers to get questions
    searchFilter = {
      destinationEntitySetIds: [questionsESID],
      edgeEntitySetIds: [addressesESID],
      entityKeyIds: answersMap.keySeq().toJS(),
      sourceEntitySetIds: []
    };
    response = yield call(
      searchEntityNeighborsWithFilterWorker,
      searchEntityNeighborsWithFilter({
        entitySetId: answersESID,
        filter: searchFilter,
      })
    );
    if (response.error) throw response.error;

    const timeRangeQuestionAnswerMap = Map().asMutable(); // submissionId -> timeRangeId -> question code -> answerId
    const nonTimeRangeQuestionAnswerMap = Map().asMutable(); // submissionId -> question code -> answerID

    fromJS(response.data).forEach((neighbors :List, answerId :UUID) => {
      // each answer has a single addresses edge to question
      const submissionId = answerSubmissionIdMap.get(answerId);
      const timeRangeId = answerIdTimeRangeIdMap.get(answerId);

      const neighbor = neighbors.first().get('neighborDetails');
      const questionCode = neighbor.getIn([ID_FQN, 0]);

      if (timeRangeId) {
        timeRangeQuestionAnswerMap.setIn([submissionId, timeRangeId, questionCode], answerId);
      }
      else {
        nonTimeRangeQuestionAnswerMap.setIn([submissionId, questionCode], answerId);
      }
    });

    const outputFileName = getOutputFileName(date, startDate, endDate, dataType);

    exportRawDataToCsvFile(
      dataType,
      outputFileName,
      submissionMetadata,
      answersMap,
      nonTimeRangeQuestionAnswerMap,
      timeRangeQuestionAnswerMap,
      timeRangeValues
    );
    workerResponse = { data: null };
    yield put(downloadRawData.success(action.id));
  }
  catch (error) {
    workerResponse = { error };
    LOG.error(action.type, error);
    yield put(downloadRawData.failure(action.id));
  }
  finally {
    yield put(downloadRawData.finally(action.id));
  }

  return workerResponse;
}

function* downloadTudDataWorker(action :SequenceAction) :Saga<*> {
  try {
    const {
      dataType,
      date,
      endDate,
      entities,
      startDate
    } = action.value;

    yield put(downloadTudData.request(action.id, { date, dataType }));

    let response;
    if (dataType === DataTypes.SUMMARIZED) {
      response = yield call(downloadSummarizedDataWorker, downloadSummarizedData({
        date,
        endDate,
        entities,
        startDate,
      }));
    }
    else {
      response = yield call(downloadRawDataWorker, downloadRawData({
        dataType,
        date,
        endDate,
        entities,
        startDate,
      }));
      if (response.error) throw response.error;

      yield put(downloadTudData.success(action.id, { date, dataType }));
    }
  }
  catch (error) {
    LOG.error(action.type, error);
    yield put(downloadTudData.failure(action.id));
  }

  finally {
    yield put(downloadTudData.finally(action.id));
  }
}

function* downloadTudDataWatcher() :Saga<*> {
  yield takeEvery(DOWNLOAD_TUD_DATA, downloadTudDataWorker);
}

export {
  downloadSummarizedDataWatcher,
  downloadTudDataWatcher,
  getSubmissionsByDateWatcher,
  submitTudDataWatcher,
};
