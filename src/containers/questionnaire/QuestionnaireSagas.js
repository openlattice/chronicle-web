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
  fromJS
} from 'immutable';
import { Constants } from 'lattice';
import {
  EntitySetsApiActions,
  EntitySetsApiSagas,
  SearchApiActions,
  SearchApiSagas
} from 'lattice-sagas';
import { DateTime } from 'luxon';
import type { SequenceAction } from 'redux-reqseq';

import {
  DOWNLOAD_QUESTIONNAIRE_RESPONSES,
  GET_QUESTIONNAIRE,
  GET_QUESTIONNAIRE_RESPONSES,
  GET_STUDY_QUESTIONNAIRES,
  SUBMIT_QUESTIONNAIRE,
  downloadQuestionnaireResponses,
  getQuestionnaire,
  getQuestionnaireResponses,
  getStudyQuestionnaires,
  submitQuestionnaire,
} from './QuestionnaireActions';
import { getCsvFileName, getQuestionAnswerMapping } from './utils/utils';

import Logger from '../../utils/Logger';
import * as ChronicleApi from '../../utils/api/ChronicleApi';
import { selectEntitySetId } from '../../core/edm/EDMUtils';
import { ASSOCIATION_ENTITY_SET_NAMES, ENTITY_SET_NAMES } from '../../core/edm/constants/EntitySetNames';
import { PROPERTY_TYPE_FQNS } from '../../core/edm/constants/FullyQualifiedNames';
import { getParticipantsEntitySetName } from '../../utils/ParticipantUtils';
import { QUESTIONNAIRE_REDUX_CONSTANTS } from '../../utils/constants/ReduxConstants';

const { searchEntityNeighborsWithFilter } = SearchApiActions;
const { searchEntityNeighborsWithFilterWorker } = SearchApiSagas;
const { getEntitySetId } = EntitySetsApiActions;
const { getEntitySetIdWorker } = EntitySetsApiSagas;

const { OPENLATTICE_ID_FQN } = Constants;
const {
  QUESTIONNAIRE_QUESTIONS,
  QUESTIONNAIRE_RESPONSES,
  QUESTION_ANSWERS_MAP,
} = QUESTIONNAIRE_REDUX_CONSTANTS;

const {
  DATE_TIME_FQN,
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

/*
 *
 * QuestionnaireActions.submitQuestionnaire()
 *
 */

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

/*
 *
 * QuestionnaireActions.getStudyQuestionnaires()
 *
 */

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

      // create mapping from questionEKID -> questionId -> question details
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

/*
 *
 * QuestionnaireActions.getQuestionnaireResponses()
 *
 */

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

    // console.log(response.data);
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

function* getQuestionnaireResponsesWatcher() :Generator<*, *, *> {
  yield takeEvery(GET_QUESTIONNAIRE_RESPONSES, getQuestionnaireResponsesWorker);
}

/*
 *
 * QuestionnaireActions.downloadQuestionnaireResponses()
 *
 */

function* downloadQuestionnaireResponsesWorker(action :SequenceAction) :Generator<*, *, *> {
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
      type: 'application/json'
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

function* downloadQuestionnaireResponsesWatcher() :Generator<*, *, *> {
  yield takeEvery(DOWNLOAD_QUESTIONNAIRE_RESPONSES, downloadQuestionnaireResponsesWorker);
}

export {
  downloadQuestionnaireResponsesWatcher,
  getQuestionnaireResponsesWatcher,
  getQuestionnaireWatcher,
  getStudyQuestionnairesWatcher,
  submitQuestionnaireWatcher
};
