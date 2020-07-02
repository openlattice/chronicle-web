// @flow

import FS from 'file-saver';
import Papa from 'papaparse';
import {
  call,
  put,
  select,
  takeEvery
} from '@redux-saga/core/effects';
import {
  List,
  Map,
  Set,
  fromJS,
  get,
  getIn,
  setIn,
} from 'immutable';
import { Constants, Types } from 'lattice';
import { DataProcessingUtils } from 'lattice-fabricate';
import {
  DataApiActions,
  DataApiSagas,
  EntitySetsApiActions,
  EntitySetsApiSagas,
  SearchApiActions,
  SearchApiSagas,
} from 'lattice-sagas';
import { Logger } from 'lattice-utils';
import { DateTime } from 'luxon';
import type { Saga } from '@redux-saga/core';
import type { SequenceAction } from 'redux-reqseq';

import {
  CHANGE_ACTIVE_STATUS,
  CREATE_QUESTIONNAIRE,
  DELETE_QUESTIONNAIRE,
  DOWNLOAD_QUESTIONNAIRE_RESPONSES,
  GET_QUESTIONNAIRE,
  GET_QUESTIONNAIRE_RESPONSES,
  GET_STUDY_QUESTIONNAIRES,
  SUBMIT_QUESTIONNAIRE,
  changeActiveStatus,
  createQuestionnaire,
  deleteQuestionnaire,
  downloadQuestionnaireResponses,
  getQuestionnaire,
  getQuestionnaireResponses,
  getStudyQuestionnaires,
  submitQuestionnaire,
} from './QuestionnaireActions';
import { getCsvFileName, getQuestionAnswerMapping } from './utils';

import * as ChronicleApi from '../../utils/api/ChronicleApi';
import { selectEntitySetId, selectPropertyTypeId } from '../../core/edm/EDMUtils';
import { ASSOCIATION_ENTITY_SET_NAMES, ENTITY_SET_NAMES } from '../../core/edm/constants/EntitySetNames';
import { PROPERTY_TYPE_FQNS } from '../../core/edm/constants/FullyQualifiedNames';
import { submitDataGraph } from '../../core/sagas/data/DataActions';
import { submitDataGraphWorker } from '../../core/sagas/data/DataSagas';
import { getParticipantsEntitySetName } from '../../utils/ParticipantUtils';
import { QUESTIONNAIRE_REDUX_CONSTANTS } from '../../utils/constants/ReduxConstants';
import { createQuestionnaireAssociations, createRecurrenceRuleSetFromFormData } from '../questionnaires/utils';

const { searchEntityNeighborsWithFilter } = SearchApiActions;
const { searchEntityNeighborsWithFilterWorker } = SearchApiSagas;
const { getEntitySetId } = EntitySetsApiActions;
const { getEntitySetIdWorker } = EntitySetsApiSagas;
const { deleteEntityAndNeighborDataWorker, updateEntityDataWorker } = DataApiSagas;
const { deleteEntityAndNeighborData, updateEntityData } = DataApiActions;

const { DeleteTypes, UpdateTypes } = Types;

const {
  getPageSectionKey,
  getEntityAddressKey,
  processAssociationEntityData,
  processEntityData
} = DataProcessingUtils;

const { OPENLATTICE_ID_FQN } = Constants;
const {
  QUESTIONNAIRE_QUESTIONS,
  QUESTIONNAIRE_RESPONSES,
  QUESTION_ANSWERS_MAP,
} = QUESTIONNAIRE_REDUX_CONSTANTS;

const {
  ACTIVE_FQN,
  DATE_TIME_FQN,
  RRULE_FQN,
  TITLE_FQN,
  VALUES_FQN
} = PROPERTY_TYPE_FQNS;

const {
  ANSWERS_ES_NAME,
  CHRONICLE_STUDIES,
  QUESTIONNAIRE_ES_NAME,
  QUESTIONS_ES_NAME
} = ENTITY_SET_NAMES;

const {
  ADDRESSES_ES_NAME,
  PART_OF_ES_NAME,
  RESPONDS_WITH_ES_NAME
} = ASSOCIATION_ENTITY_SET_NAMES;

const LOG = new Logger('QuestionnaireSagas');

/*
 *
 * QuestionnaireActions.changeActiveStatus()
 *
 */
function* changeActiveStatusWorker(action :SequenceAction) :Saga<*> {
  try {
    yield put(changeActiveStatus.request(action.id));

    const { activeStatus, studyEKID, questionnaireEKID } = action.value;

    const questionnaireESID = yield select(selectEntitySetId(QUESTIONNAIRE_ES_NAME));
    const activePTID = yield select(selectPropertyTypeId(ACTIVE_FQN));

    const response = yield call(updateEntityDataWorker, updateEntityData({
      entitySetId: questionnaireESID,
      entities: {
        [questionnaireEKID]: {
          [activePTID]: [!activeStatus]
        }
      },
      updateType: UpdateTypes.PARTIAL_REPLACE
    }));
    if (response.error) throw response.error;

    yield put(changeActiveStatus.success(action.id, {
      activeStatus, studyEKID, questionnaireEKID
    }));
  }
  catch (error) {
    LOG.error(action.type, error);
    yield put(changeActiveStatus.failure(action.id));
  }
  finally {
    yield put(changeActiveStatus.finally(action.id));
  }
}

function* changeActiveStatusWatcher() :Saga<*> {
  yield takeEvery(CHANGE_ACTIVE_STATUS, changeActiveStatusWorker);
}

/*
 *
 * QuestionnaireActions.deleteQuestionnaire()
 *
 */

function* deleteQuestionnaireWorker(action :SequenceAction) :Saga<*> {
  try {
    yield put(deleteQuestionnaire.request(action.id));

    const { studyEKID, questionnaireEKID } = action.value;

    const questionnaireESID = yield select(selectEntitySetId(QUESTIONNAIRE_ES_NAME));
    const questionsESID = yield select(selectEntitySetId(QUESTIONS_ES_NAME));

    const neighborFilter = {
      entityKeyIds: [questionnaireEKID],
      destinationEntitySetIds: [],
      sourceEntitySetIds: [questionsESID]
    };

    const response = yield call(deleteEntityAndNeighborDataWorker, deleteEntityAndNeighborData({
      entitySetId: questionnaireESID,
      filter: neighborFilter,
      deleteType: DeleteTypes.HARD
    }));

    if (response.error) throw response.error;

    yield put(deleteQuestionnaire.success(action.id, {
      studyEKID,
      questionnaireEKID
    }));
  }
  catch (error) {
    LOG.error(action.type, error);
    yield put(deleteQuestionnaire.failure(action.id));
  }
  finally {
    yield put(deleteQuestionnaire.finally(action.id));
  }
}

function* deleteQuestionnaireWatcher() :Saga<*> {
  yield takeEvery(DELETE_QUESTIONNAIRE, deleteQuestionnaireWorker);
}

function constructEntitiesFromFormData(formData, entityKeyIds, entitySetIds, propertyTypeIds :Map) {
  const questionnaireESID = entitySetIds.get(QUESTIONNAIRE_ES_NAME);
  const questionsESID = entitySetIds.get(QUESTIONS_ES_NAME);

  const questionnaireEKID = getIn(entityKeyIds, [questionnaireESID, 0]);
  const questionEKIDS = get(entityKeyIds, questionsESID);

  // update form data
  let updatedFormData = setIn(
    formData,
    [getPageSectionKey(1, 1), getEntityAddressKey(0, QUESTIONNAIRE_ES_NAME, OPENLATTICE_ID_FQN)],
    questionnaireEKID
  );

  questionEKIDS.forEach((questionEKID, index) => {
    updatedFormData = setIn(
      updatedFormData,
      [getPageSectionKey(2, 1), index, getEntityAddressKey(-1, QUESTIONS_ES_NAME, OPENLATTICE_ID_FQN)],
      questionEKID
    );
  });

  let result = processEntityData(
    updatedFormData,
    entitySetIds,
    propertyTypeIds.map((id, fqn) => fqn)
  );

  // set id property on questionnaire entity (required by LUK table)
  result = setIn(result, [questionnaireESID, 0, 'id'], questionnaireEKID);

  const questionEntities = get(result, questionsESID);
  const questionnaireEntity = getIn(result, [questionnaireESID, 0]);

  return { questionEntities, questionnaireEntity };
}

/*
 *
 * QuestionnaireActions.createQuestionnaire()
 *
 */

function* createQuestionnaireWorker(action :SequenceAction) :Saga<*> {
  try {
    yield put(createQuestionnaire.request(action.id));

    const { studyEKID } = action.value;
    let { formData } = action.value;

    const entitySetIds = yield select((state) => state.getIn(['edm', 'entitySetIds']));
    const propertyTypeIds = yield select((state) => state.getIn(['edm', 'propertyTypeIds']));

    // generate rrule from form data
    const rruleSet = createRecurrenceRuleSetFromFormData(formData);

    // update formdata with rrule
    let psk = getPageSectionKey(1, 1);
    let eak = getEntityAddressKey(0, QUESTIONNAIRE_ES_NAME, RRULE_FQN);
    formData = setIn(formData, [psk, eak], rruleSet);

    // set ol.active to true
    eak = getEntityAddressKey(0, QUESTIONNAIRE_ES_NAME, ACTIVE_FQN);
    formData = setIn(formData, [psk, eak], true);

    // remove scheduler from form data
    psk = getPageSectionKey(3, 1);
    delete formData[psk];

    // remove questionType key from form data
    psk = getPageSectionKey(2, 1);
    formData[psk].forEach((item) => {
      /* eslint-disable-next-line no-param-reassign */
      delete item.questionType;
    });

    const entityData = processEntityData(
      formData,
      entitySetIds,
      propertyTypeIds
    );

    // associations
    const associations = createQuestionnaireAssociations(formData, studyEKID);
    const associationEntityData = processAssociationEntityData(
      associations,
      entitySetIds,
      propertyTypeIds
    );

    const response = yield call(submitDataGraphWorker, submitDataGraph({ associationEntityData, entityData }));
    if (response.error) throw response.error;

    // reconstruct entity
    const { entityKeyIds } = response.data;
    const {
      questionEntities,
      questionnaireEntity
    } = constructEntitiesFromFormData(formData, entityKeyIds, entitySetIds, propertyTypeIds);

    yield put(createQuestionnaire.success(action.id, {
      questionEntities,
      questionnaireEntity,
      studyEKID
    }));

  }
  catch (error) {
    yield put(createQuestionnaire.failure(action.id));
    LOG.error(action.type, error);
  }
  finally {
    yield put(createQuestionnaire.finally(action.id));
  }
}

function* createQuestionnaireWatcher() :Saga<*> {
  yield takeEvery(CREATE_QUESTIONNAIRE, createQuestionnaireWorker);
}

/*
 *
 * QuestionnaireActions.getQuestionnaire()
 *
 */
function* getQuestionnaireWorker(action :SequenceAction) :Saga<*> {
  try {
    yield put(getQuestionnaire.request(action.id));

    const { studyId, questionnaireId } = action.value;

    const response = yield call(ChronicleApi.getQuestionnaire, studyId, questionnaireId);
    if (response.error) throw response.error;

    yield put(getQuestionnaire.success(action.id, fromJS(response.data)));
  }
  catch (error) {
    LOG.error(action.type, error);
    yield put(getQuestionnaire.failure(action.id));
  }
  finally {
    yield put(getQuestionnaire.finally(action.id));
  }
}

function* getQuestionnaireWatcher() :Saga<*> {
  yield takeEvery(GET_QUESTIONNAIRE, getQuestionnaireWorker);
}

/*
 *
 * QuestionnaireActions.submitQuestionnaire()
 *
 */

function* submitQuestionnaireWorker(action :SequenceAction) :Saga<*> {
  try {
    yield put(submitQuestionnaire.request(action.id));

    const { formData, participantId, studyId } = action.value;
    const questionAnswerMapping = getQuestionAnswerMapping(formData);

    const response = yield call(ChronicleApi.submitQuestionnaire, studyId, participantId, questionAnswerMapping);
    if (response.error) throw response.error;

    yield put(submitQuestionnaire.success(action.id));

  }
  catch (error) {
    LOG.error(action.type, error);
    yield put(submitQuestionnaire.failure(action.id));
  }
  finally {
    yield put(submitQuestionnaire.finally(action.id));
  }
}

function* submitQuestionnaireWatcher() :Saga<*> {
  yield takeEvery(SUBMIT_QUESTIONNAIRE, submitQuestionnaireWorker);
}

/*
 *
 * QuestionnaireActions.getStudyQuestionnaires()
 *
 */

function* getStudyQuestionnairesWorker(action :SequenceAction) :Saga<*> {
  try {
    yield put(getStudyQuestionnaires.request(action.id));

    const studyEKID = action.value;

    const questionnaireESID = yield select(selectEntitySetId(QUESTIONNAIRE_ES_NAME));
    const partOfESID = yield select(selectEntitySetId(PART_OF_ES_NAME));
    const studyESID = yield select(selectEntitySetId(CHRONICLE_STUDIES));
    const questionsESID = yield select(selectEntitySetId(QUESTIONS_ES_NAME));

    /*
     * STEP 1: filtered search to get questionnaires neighboring study
     */

    let response = yield call(
      searchEntityNeighborsWithFilterWorker,
      searchEntityNeighborsWithFilter({
        entitySetId: studyESID,
        filter: {
          destinationEntitySetIds: [studyESID],
          edgeEntitySetIds: [partOfESID],
          entityKeyIds: [studyEKID],
          sourceEntitySetIds: [questionnaireESID]
        }
      })
    );
    if (response.error) throw response.error;

    // create questionnaireId -> questionnaire details map
    const studyQuestionnaires = Map().withMutations((mutator) => {
      fromJS(response.data).get(studyEKID, List()).forEach((neighbor) => {
        const neighborId = neighbor.get('neighborId');
        const details = neighbor.get('neighborDetails').asMutable();
        details.set('id', neighborId); // needed by LUK table

        mutator.set(neighborId, details.asImmutable());
      });
    });

    /*
     * STEP 2: filtered search to get questions neighboring questionnaires
     */

    const questionnaireToQuestionsMap = Map().asMutable();

    if (!studyQuestionnaires.isEmpty()) {
      response = yield call(
        searchEntityNeighborsWithFilterWorker,
        searchEntityNeighborsWithFilter({
          entitySetId: questionnaireESID,
          filter: {
            destinationEntitySetIds: [questionnaireESID],
            edgeEntitySetIds: [partOfESID],
            entityKeyIds: studyQuestionnaires.keySeq().toJS(),
            sourceEntitySetIds: [questionsESID]
          }
        })
      );
      if (response.error) throw response.error;

      // create mapping from questionEKID -> questionId -> question details
      fromJS(response.data).forEach((neighbors :List, questionnaireEKID :UUID) => {
        const questions = neighbors.map((question) => question.get('neighborDetails'));
        questionnaireToQuestionsMap.set(questionnaireEKID, questions);
      });
    }

    yield put(getStudyQuestionnaires.success(action.id, {
      questionnaireToQuestionsMap: questionnaireToQuestionsMap.asImmutable(),
      studyQuestionnaires,
      studyEKID
    }));

  }
  catch (error) {
    LOG.error(action.type, error);
    yield put(getStudyQuestionnaires.failure(action.id));
  }
  finally {
    yield put(getStudyQuestionnaires.finally(action.id));
  }
}

function* getStudyQuestionnairesWatcher() :Saga<*> {
  yield takeEvery(GET_STUDY_QUESTIONNAIRES, getStudyQuestionnairesWorker);
}

/*
 *
 * QuestionnaireActions.getQuestionnaireResponses()
 *
 */

function* getQuestionnaireResponsesWorker(action :SequenceAction) :Saga<*> {
  try {
    yield put(getQuestionnaireResponses.request(action.id));

    const { participantEKID, studyId } = action.value;

    const answersESID = yield select(selectEntitySetId(ANSWERS_ES_NAME));
    const addressesESID = yield select(selectEntitySetId(ADDRESSES_ES_NAME));
    const questionsESID = yield select(selectEntitySetId(QUESTIONS_ES_NAME));
    const respondsWithESID = yield select(selectEntitySetId(RESPONDS_WITH_ES_NAME));

    const participantESName = getParticipantsEntitySetName(studyId);
    let response = yield call(getEntitySetIdWorker, getEntitySetId(participantESName));
    if (response.error) throw response.error;

    const participantESID = response.data;

    /*
     * STEP 1: filtered search to get answers neighboring participant
     */

    response = yield call(
      searchEntityNeighborsWithFilterWorker,
      searchEntityNeighborsWithFilter({
        entitySetId: participantESID,
        filter: {
          destinationEntitySetIds: [answersESID],
          edgeEntitySetIds: [respondsWithESID],
          entityKeyIds: [participantEKID],
          sourceEntitySetIds: [participantESID]
        },
      })
    );
    if (response.error) throw response.error;

    // create a map of answerID -> answer value & timestamp.

    const answersById = Map().withMutations((mutator) => {
      fromJS(response.data).forEach((neighbors :List) => {
        neighbors.forEach((neighbor) => {
          const answerEKID = neighbor.get('neighborId');
          mutator.set(answerEKID, fromJS({
            [VALUES_FQN.toString()]: [neighbor.getIn(['neighborDetails', VALUES_FQN, 0])],
            [DATE_TIME_FQN.toString()]: [neighbor.getIn(['associationDetails', DATE_TIME_FQN, 0])]
          }));
        });
      });
    });

    /*
     * STEP 2: filtered search to get questions associated with answers
     */

    const questionAnswersMap = Map().asMutable();
    const answerQuestionIdMap = Map().asMutable();

    if (!answersById.isEmpty()) {
      response = yield call(
        searchEntityNeighborsWithFilterWorker,
        searchEntityNeighborsWithFilter({
          entitySetId: answersESID,
          filter: {
            destinationEntitySetIds: [questionsESID],
            edgeEntitySetIds: [addressesESID],
            entityKeyIds: answersById.keySeq().toJS(),
            sourceEntitySetIds: [answersESID]
          },
        })
      );
      if (response.error) throw response.error;

      // create map question id -> set of answers associated
      // each answer has at most one question associated, so we explore the first neighbor
      fromJS(response.data).forEach((neighbors :List, answerId :UUID) => {
        const questionId = neighbors.first().get('neighborId');

        answerQuestionIdMap.set(answerId, questionId);
        questionAnswersMap.updateIn([questionId], Set(), (result) => result.add(answerId));
      });
    }

    yield put(getQuestionnaireResponses.success(action.id, {
      answerQuestionIdMap: answerQuestionIdMap.asImmutable(),
      answersById,
      participantEKID,
      questionAnswersMap: questionAnswersMap.asImmutable()
    }));
  }
  catch (error) {
    LOG.error(action.type, error);
    yield put(getQuestionnaireResponses.failure(action.id));
  }
  finally {
    yield put(getQuestionnaireResponses.finally(action.id));
  }
}

function* getQuestionnaireResponsesWatcher() :Saga<*> {
  yield takeEvery(GET_QUESTIONNAIRE_RESPONSES, getQuestionnaireResponsesWorker);
}

/*
 *
 * QuestionnaireActions.downloadQuestionnaireResponses()
 *
 */

function* downloadQuestionnaireResponsesWorker(action :SequenceAction) :Saga<*> {
  try {
    yield put(downloadQuestionnaireResponses.request(action.id));

    const {
      questionnaireId,
      participantEKID,
      participantId,
      questionnaireName
    } = action.value;
    const questions = yield select(
      (state) => state.getIn(['questionnaire', QUESTIONNAIRE_QUESTIONS, questionnaireId], List())
    );
    const answersById = yield select(
      (state) => state.getIn(['questionnaire', QUESTIONNAIRE_RESPONSES, participantEKID], Map())
    );
    const questionAnswersMap = yield select((state) => state.getIn(['questionnaire', QUESTION_ANSWERS_MAP], Map()));

    let csvData :Object[] = [];

    questions.forEach((question) => {
      const questionId = question.getIn([OPENLATTICE_ID_FQN, 0]);
      const answerIds :Set<UUID> = questionAnswersMap.get(questionId);

      answerIds.forEach((answerId) => {
        const csvObject :Object = {};
        const date = answersById.getIn([answerId, DATE_TIME_FQN, 0]);
        csvObject.Question = question.getIn([TITLE_FQN, 0]);
        csvObject.Answer = answersById.getIn([answerId, VALUES_FQN, 0]);
        csvObject.Date = date;

        csvData.push(csvObject);
      });
    });

    csvData = csvData
      .sort((row1 :Object, row2 :Object) => {
        if (row1.Date > row2.Date) return 1;
        if (row1.Date < row2.Date) return -1;
        return 0;
      }).map((row) => {
        const result = row;
        result.Date = DateTime.fromISO(row.Date).toLocaleString(DateTime.DATETIME_SHORT_WITH_SECONDS);
        return result;
      });

    const csv = Papa.unparse(csvData);
    const blob = new Blob([csv], {
      type: 'text/csv'
    });
    FS.saveAs(blob, getCsvFileName(questionnaireName, participantId));

    yield put(downloadQuestionnaireResponses.success(action.id));
  }
  catch (error) {
    LOG.error(action.type);
    yield put(downloadQuestionnaireResponses.failure(action.id));
  }
  finally {
    yield put(downloadQuestionnaireResponses.finally(action.id));
  }
}

function* downloadQuestionnaireResponsesWatcher() :Saga<*> {
  yield takeEvery(DOWNLOAD_QUESTIONNAIRE_RESPONSES, downloadQuestionnaireResponsesWorker);
}

export {
  changeActiveStatusWatcher,
  createQuestionnaireWatcher,
  deleteQuestionnaireWatcher,
  downloadQuestionnaireResponsesWatcher,
  getQuestionnaireResponsesWatcher,
  getQuestionnaireWatcher,
  getStudyQuestionnairesWatcher,
  submitQuestionnaireWatcher,
};
