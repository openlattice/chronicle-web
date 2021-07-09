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
  OrderedSet,
  fromJS,
  getIn
} from 'immutable';
import { Constants } from 'lattice';
import { SearchApiActions, SearchApiSagas } from 'lattice-sagas';
import { DataUtils, Logger } from 'lattice-utils';
import { DateTime } from 'luxon';
import type { Saga } from '@redux-saga/core';
import type { WorkerResponse } from 'lattice-sagas';
import type { SequenceAction } from 'redux-reqseq';

import DataTypes from './constants/DataTypes';
import {
  DOWNLOAD_ALL_TUD_DATA,
  DOWNLOAD_DAILY_TUD_DATA,
  GET_SUBMISSIONS_BY_DATE,
  SUBMIT_TUD_DATA,
  VERIFY_TUD_LINK,
  downloadAllTudData,
  downloadDailyTudData,
  getSubmissionsByDate,
  submitTudData,
  verifyTudLink,
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

function* verifyTudLinkWorker(action :SequenceAction) :Saga<*> {
  try {
    yield put(verifyTudLink.request(action.id));

    const { organizationId, participantId, studyId } = action.value;

    const response = yield call(ChronicleApi.verifyTudLink, organizationId, studyId, participantId);
    const isValidLink = response.data === 'ENROLLED' || response.data === 'NOT_ENROLLED';

    if (isValidLink) {
      yield put(verifyTudLink.success(action.id));
    }
    else {
      throw new Error('Invalid TUD link');
    }
  }
  catch (error) {
    LOG.error(action.type, error);
    yield put(verifyTudLink.failure(action.id));
  }
  finally {
    yield put(verifyTudLink.finally(action.id));
  }
}

function* verifyTudLinkWatcher() :Saga<*> {
  yield takeEvery(VERIFY_TUD_LINK, verifyTudLinkWorker);
}

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
      participants,
      endDate,
      startDate,
    } = action.value;

    const participantsESID = yield select(selectESIDByCollection(PARTICIPANTS, AppModules.CHRONICLE_CORE));

    const participantEKIDs :UUID[] = participants.keySeq().toJS();

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
              [PERSON_ID.toString()]: [getIn(participants, [participantEKID, PERSON_ID, 0])],
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

function* downloadSummarizedData(entities, outputFilename) :Saga<WorkerResponse> {
  let workerResponse = {};
  try {

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
      entityKeyIds: submissionIds.toJS(),
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

    const csvHeaders = OrderedSet().asMutable();

    // create submissionEKID -> ol.variable -> ol.value map
    const summaryData = Map().withMutations((mutator) => {
      fromJS(response.data).forEach((neighbors, submissionId) => {
        neighbors.forEach((neighbor) => {
          const neighborDetails = neighbor.get('neighborDetails');
          const variable = getPropertyValue(neighborDetails, [VARIABLE_FQN, 0]);
          const value = getPropertyValue(neighborDetails, [VALUES_FQN, 0]);
          mutator.setIn([submissionId, variable], value);
          csvHeaders.add(variable);
        });
      });
    });

    exportSummarizedDataToCsvFile(summaryData, submissionMetadata, csvHeaders.asImmutable(), outputFilename);

    workerResponse = { data: {} };
  }
  catch (error) {
    workerResponse = { error };
  }

  return workerResponse;
}

function* downloadRawData(dataType, entities, outputFilename) :Saga<WorkerResponse> {
  let workerResponse = {};

  try {

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

    exportRawDataToCsvFile(
      dataType,
      outputFilename,
      submissionMetadata,
      answersMap,
      nonTimeRangeQuestionAnswerMap,
      timeRangeQuestionAnswerMap,
      timeRangeValues
    );
    workerResponse = { data: null };
  }
  catch (error) {
    workerResponse = { error };
  }

  return workerResponse;
}

function* downloadDailyTudDataWorker(action :SequenceAction) :Saga<*> {
  const {
    dataType,
    date,
    endDate,
    entities,
    startDate
  } = action.value;
  try {
    yield put(downloadDailyTudData.request(action.id, { date, dataType }));

    const outputFilename = getOutputFileName(date, startDate, endDate, dataType);

    let response;
    if (dataType === DataTypes.SUMMARIZED) {
      response = yield call(
        downloadSummarizedData,
        entities,
        outputFilename
      );
    }
    else {
      response = yield call(
        downloadRawData,
        dataType,
        entities,
        outputFilename
      );
    }

    if (response.error) throw response.error;
    yield put(downloadDailyTudData.success(action.id, { date, dataType }));
  }
  catch (error) {
    LOG.error(action.type, error);
    yield put(downloadDailyTudData.failure(action.id, { date, dataType }));
  }

  finally {
    yield put(downloadDailyTudData.finally(action.id));
  }
}

function* downloadDailyTudDataWatcher() :Saga<*> {
  yield takeEvery(DOWNLOAD_DAILY_TUD_DATA, downloadDailyTudDataWorker);
}

function* downloadAllTudDataWorker(action :SequenceAction) :Saga<*> {
  try {
    yield put(downloadAllTudData.request(action.id));

    const {
      dataType,
      date,
      endDate,
      entities,
      startDate
    } = action.value;

    const outputFilename = getOutputFileName(date, startDate, endDate, dataType);

    let response;
    if (dataType === DataTypes.SUMMARIZED) {
      response = yield call(
        downloadSummarizedData,
        entities,
        outputFilename
      );
    }
    else {
      response = yield call(
        downloadRawData,
        dataType,
        entities,
        outputFilename
      );
    }

    if (response.error) throw response.error;
    yield put(downloadAllTudData.success(action.id));
  }

  catch (error) {
    LOG.error(action.type, error);
    yield put(downloadAllTudData.failure(action.id));
  }
  finally {
    yield put(downloadAllTudData.finally(action.id));
  }
}

function* downloadAllTudDataWatcher() :Saga<*> {
  yield takeEvery(DOWNLOAD_ALL_TUD_DATA, downloadAllTudDataWorker);
}

export {
  downloadAllTudDataWatcher,
  downloadDailyTudDataWatcher,
  getSubmissionsByDateWatcher,
  submitTudDataWatcher,
  verifyTudLinkWatcher,
};
