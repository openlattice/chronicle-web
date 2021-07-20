// @flow

const STUDIES_REDUX_CONSTANTS = {
  NOTIFICATIONS_EKID: 'notificationsEKID',
  NOTIFICATIONS_ENABLED_STUDIES: 'notificationsEnabledStudies',
  PARTICIPANTS: 'participants',
  PARTICIPATED_IN_EKID: 'participatedInEKID',
  PART_OF_ASSOCIATION_EKID_MAP: 'partOfAssociationEKIDMap',
  STUDIES: 'studies',
  TIMEOUT: 'timeout',
  TIME_USE_DIARY_STUDIES: 'timeUseDiaryStudies',
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
  SETTINGS: 'settings',
};

const TUD_REDUX_CONSTANTS = {
  SUBMISSIONS_BY_DATE: 'submissionsByDate'
};

const PERMISSIONS_REDUX_CONSTANTS = {
  HAS_DELETE_PERMISSION: 'hasDeletePermission'
};

const REDUCERS = {
  APPS_DATA: 'appsData',
  APP: 'app'
};

export {
  APP_REDUX_CONSTANTS,
  PERMISSIONS_REDUX_CONSTANTS,
  QUESTIONNAIRE_REDUX_CONSTANTS,
  REDUCERS,
  STUDIES_REDUX_CONSTANTS,
  TUD_REDUX_CONSTANTS
};
