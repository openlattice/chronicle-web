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
  fromJS
} from 'immutable';
import {
  EntitySetsApiActions,
  EntitySetsApiSagas,
  SearchApiActions,
  SearchApiSagas
} from 'lattice-sagas';
import type { SequenceAction } from 'redux-reqseq';

import {
  GET_QUESTIONNAIRE,
  GET_QUESTIONNAIRE_RESPONSES,
  GET_STUDY_QUESTIONNAIRES,
  SUBMIT_QUESTIONNAIRE,
  getQuestionnaire,
  getQuestionnaireResponses,
  getStudyQuestionnaires,
  submitQuestionnaire,
} from './QuestionnaireActions';
import { getQuestionAnswerMapping } from './utils/utils';

import Logger from '../../utils/Logger';
import * as ChronicleApi from '../../utils/api/ChronicleApi';
import { selectEntitySetId } from '../../core/edm/EDMUtils';
import { ASSOCIATION_ENTITY_SET_NAMES, ENTITY_SET_NAMES } from '../../core/edm/constants/EntitySetNames';
import { PROPERTY_TYPE_FQNS } from '../../core/edm/constants/FullyQualifiedNames';
import { getParticipantsEntitySetName } from '../../utils/ParticipantUtils';

const { searchEntityNeighborsWithFilter } = SearchApiActions;
const { searchEntityNeighborsWithFilterWorker } = SearchApiSagas;
const { getEntitySetId } = EntitySetsApiActions;
const { getEntitySetIdWorker } = EntitySetsApiSagas;

const {
  DATE_TIME_FQN,
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
 * QuestionnaireActions.getQuestionnaire()
 *
 */
function* getQuestionnaireWorker(action :SequenceAction) :Generator<*, *, *> {
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

function* getQuestionnaireWatcher() :Generator<*, *, *> {
  yield takeEvery(GET_QUESTIONNAIRE, getQuestionnaireWorker);
}

function* submitQuestionnaireWorker(action :SequenceAction) :Generator<*, *, *> {
  try {
    yield put(submitQuestionnaire.request(action.id));

    const { formData, participantId, studyId } = action.value;
    const questionAnswerMapping = getQuestionAnswerMapping(formData);

    const response = yield call(ChronicleApi.submitQuestionnaire, studyId, participantId, questionAnswerMapping);
    if (!response.data) throw new Error('Submission failed');

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

function* submitQuestionnaireWatcher() :Generator<*, *, *> {
  yield takeEvery(SUBMIT_QUESTIONNAIRE, submitQuestionnaireWorker);
}

function* getStudyQuestionnairesWorker(action :SequenceAction) :Generator<*, *, *> {
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
        const details = neighbor.get('neighborDetails');

        mutator.set(neighborId, details);
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

      // create mapping from questionEKID -> list of questions
      fromJS(response.data).forEach((value, key) => {
        const questions = value.map((question) => question.get('neighborDetails'));
        questionnaireToQuestionsMap.set(key, questions);
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

function* getStudyQuestionnairesWatcher() :Generator<*, *, *> {
  yield takeEvery(GET_STUDY_QUESTIONNAIRES, getStudyQuestionnairesWorker);
}

function* getQuestionnaireResponsesWorker(action :SequenceAction) :Generator<*, *, *> {
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
    const answerValuesMap = Map().withMutations((mutator) => {
      fromJS(response.data).forEach((neighbors :List) => {
        neighbors.forEach((neighbor) => {
          const answerEKID = neighbor.get('neighborId');

          mutator.set(answerEKID, fromJS({
            [VALUES_FQN.toString()]: neighbor.getIn(['neighborDetails', VALUES_FQN, 0]),
            [DATE_TIME_FQN.toString()]: neighbor.getIn(['associationDetails', DATE_TIME_FQN, 0])
          }));
        });
      });
    });

    /*
     * STEP 2: filtered search to get questions associated with answers
     */

    const answerIdToQuestionIdMap = Map().asMutable();

    if (!answerValuesMap.isEmpty()) {
      response = yield call(
        searchEntityNeighborsWithFilterWorker,
        searchEntityNeighborsWithFilter({
          entitySetId: answersESID,
          filter: {
            destinationEntitySetIds: [questionsESID],
            edgeEntitySetIds: [addressesESID],
            entityKeyIds: answerValuesMap.keySeq().toJS(),
            sourceEntitySetIds: [answersESID]
          },
        })
      );
      if (response.error) throw response.error;

      // create mapping from answerEKID -> question
      // each answer is mapped to only one question, so we only explore the first neighbor
      fromJS(response.data).forEach((neighbors, key) => {
        answerIdToQuestionIdMap.set(key, neighbors.first().get('neighborId'));
      });
    }

    yield put(getQuestionnaireResponses.success(action.id, {
      answerIdToQuestionIdMap: answerIdToQuestionIdMap.asImmutable(),
      answerValuesMap,
      participantEKID
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

function* getQuestionnaireResponsesWatcher() :Generator<*, *, *> {
  yield takeEvery(GET_QUESTIONNAIRE_RESPONSES, getQuestionnaireResponsesWorker);
}

export {
  getQuestionnaireResponsesWatcher,
  getQuestionnaireWatcher,
  getStudyQuestionnairesWatcher,
  submitQuestionnaireWatcher,
};
