// @flow

import {
  call,
  put,
  select,
  takeEvery
} from '@redux-saga/core/effects';
import merge from 'lodash/merge';
import {
  List,
  Map,
  getIn,
  fromJS,
  get
} from 'immutable';
import { Constants } from 'lattice';
import {
  DataApiActions,
  DataApiSagas,
  EntitySetsApiActions,
  EntitySetsApiSagas,
  SearchApiActions,
  SearchApiSagas
} from 'lattice-sagas';
import { DataUtils, Logger } from 'lattice-utils';
import { DateTime } from 'luxon';
import type { Saga } from '@redux-saga/core';
import type { SequenceAction } from 'redux-reqseq';

import {
  DOWNLOAD_TUD_RESPONSES,
  GET_SUBMISSIONS_BY_DATE,
  SUBMIT_TUD_DATA,
  downloadTudResponses,
  getSubmissionsByDate,
  submitTudData,
} from './TimeUseDiaryActions';
import { createSubmitRequestBody } from './utils';

import * as ChronicleApi from '../../utils/api/ChronicleApi';
import { selectEntitySetId, selectPropertyTypeId } from '../../core/edm/EDMUtils';
import { ASSOCIATION_ENTITY_SET_NAMES, ENTITY_SET_NAMES } from '../../core/edm/constants/EntitySetNames';
import { PROPERTY_TYPE_FQNS } from '../../core/edm/constants/FullyQualifiedNames';
import { getParticipantsEntitySetName } from '../../utils/ParticipantUtils';

const LOG = new Logger('TimeUseDiarySagas');

const { getEntitySetDataWorker } = DataApiSagas;
const { getEntitySetData } = DataApiActions;
const { getEntitySetId } = EntitySetsApiActions;
const { getEntitySetIdWorker } = EntitySetsApiSagas;
const { searchEntityNeighborsWithFilterWorker } = SearchApiSagas;
const { searchEntityNeighborsWithFilter } = SearchApiActions;

const { getEntityKeyId } = DataUtils;

const { OPENLATTICE_ID_FQN } = Constants;

const {
  PERSON_ID,
  ID_FQN,
  DATE_TIME_FQN,
} = PROPERTY_TYPE_FQNS;

const {
  QUESTIONS_ES_NAME,
  ANSWERS_ES_NAME,
  TIMERANGE_ES_NAME,
  SUBMISSION_ES_NAME
} = ENTITY_SET_NAMES;
const {
  ADDRESSES_ES_NAME,
  RESPONDS_WITH_ES_NAME,
  REGISTERED_FOR_ES,
} = ASSOCIATION_ENTITY_SET_NAMES;

function* submitTudDataWorker(action :SequenceAction) :Saga<*> {
  try {
    yield put(submitTudData.request(action.id));
    const {
      formData,
      participantId,
      studyId,
    } = action.value;

    const requestBody = createSubmitRequestBody(formData);

    const response = yield call(ChronicleApi.submitTudData, studyId, participantId, requestBody);
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
      studyId,
    } = action.value;

    const participantsES = getParticipantsEntitySetName(studyId);
    const entitySetIdRes = yield call(getEntitySetIdWorker, getEntitySetId(participantsES));
    if (entitySetIdRes.error) throw entitySetIdRes.error;
    const participantsESID = entitySetIdRes.data;

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

    const participantEKIDs :UUID[] = participantsRes.data.map((entity) => getEntityKeyId(entity));

    const submissionESID = yield select(selectEntitySetId(SUBMISSION_ES_NAME));
    const respondsWithESID = yield select(selectEntitySetId(RESPONDS_WITH_ES_NAME));

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

            const entity = fromJS({
              [participantsES]: {
                [PERSON_ID.toString()]: get(participants, participantEKID),
                [ID_FQN.toString()]: participantEKID,
              },
              [SUBMISSION_ES_NAME]: {
                [OPENLATTICE_ID_FQN]: neighbor.get('neighborId')
              }
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

function* downloadTudResponsesWorker(action :SequenceAction) :Saga<*> {
  try {
    yield put(downloadTudResponses.request(action.id));

    const { entities, studyId } = action.value;

    const participantsES = getParticipantsEntitySetName(studyId);
    const submissionIds = entities.map((entity) => entity.get(SUBMISSION_ES_NAME).get(OPENLATTICE_ID_FQN));

    // entity set ids
    const submissionESID = yield select(selectEntitySetId(SUBMISSION_ES_NAME));
    const answersESID = yield select(selectEntitySetId(ANSWERS_ES_NAME));
    const registeredForESID = yield select(selectEntitySetId(REGISTERED_FOR_ES));
    const questionsESID = yield select(selectEntitySetId(QUESTIONS_ES_NAME));
    const timeRangeESID = yield select(selectEntitySetId(TIMERANGE_ES_NAME));
    const addressesESID = yield select(selectEntitySetId(ADDRESSES_ES_NAME));

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

    const submissionIdAnswersMap = {}; // { submissionId: list(answerIds)}
    const answersMap = {}; // { answerId -> {ol.values: }}

    Object.entries(response.data).forEach(([submissionId :UUID, neighbors:UUID[]]) => {
      // $FlowFixMe
      const answerIds :UUID[] = neighbors.map((neighbor) => getIn(
        neighbor, ['neighborDetails', OPENLATTICE_ID_FQN, 0]
      ));
      submissionIdAnswersMap[submissionId] = answerIds;
      // $FlowFixMe
      const answers = neighbors.reduce((obj, neighbor) => {
        const answerId = get(neighbor, 'neighborId');
        return {
          [answerId]: get(neighbor, 'neighborDetails'),
          ...obj
        };
      }, {});
      merge(answersMap, answers);
    });

    // filtered search on answers to get questions
    searchFilter = {
      destinationEntitySetIds: [timeRangeESID, questionsESID],
      edgeEntitySetIds: [registeredForESID, addressesESID],
      entityKeyIds: Object.keys(answersMap),
      sourceEntitySetIds: []
    };
    response = yield call(
      searchEntityNeighborsWithFilterWorker,
      searchEntityNeighborsWithFilter({
        entitySetId: answersESID,
        filter: searchFilter,
      })
    );
    //

  }
  catch (error) {
    LOG.error(action.type, error);
    yield put(downloadTudResponses.failure(action.id));
  }
  finally {
    yield put(downloadTudResponses.finally(action.id));
  }
}

function* downloadTudResponsesWatcher() :Saga<*> {
  yield takeEvery(DOWNLOAD_TUD_RESPONSES, downloadTudResponsesWorker);
}

export {
  submitTudDataWatcher,
  getSubmissionsByDateWatcher,
  downloadTudResponsesWatcher
};
