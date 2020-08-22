// @flow

const STUDIES_REDUX_CONSTANTS = {
  GLOBAL_NOTIFICATIONS_EKID: 'globalNotificationsEKID',
  NOTIFICATIONS_ENABLED_STUDIES: 'notificationsEnabledStudies',
  PARTICIPATED_IN_EKID: 'participatedInEKID',
  PART_OF_ASSOCIATION_EKID_MAP: 'partOfAssociationEKIDMap',
  STUDIES: 'studies',
  TIMEOUT: 'timeout',
};

const QUESTIONNAIRE_REDUX_CONSTANTS = {
  ANSWER_QUESTION_ID_MAP: 'answerQuestionIdMap',
  QUESTIONNAIRE_DATA: 'questionnaireData',
  QUESTIONNAIRE_QUESTIONS: 'questionnaireQuestions',
  QUESTIONNAIRE_RESPONSES: 'questionnaireResponses',
  QUESTION_ANSWERS_MAP: 'answersToQuestionsMap',
  STUDY_QUESTIONNAIRES: 'studyQuestionnaires'
};

const APP_REDUX_CONSTANTS = {
  APP_MODULES_ORG_LIST_MAP: 'appModulesOrgListMap',
  ENTITY_SET_IDS_BY_ORG_ID: 'entitySetIdsByOrgId',
  ORGS: 'orgs',
  SELECTED_ORG_ID: 'selectedOrgId',
};

export {
  APP_REDUX_CONSTANTS,
  QUESTIONNAIRE_REDUX_CONSTANTS,
  STUDIES_REDUX_CONSTANTS,
};
