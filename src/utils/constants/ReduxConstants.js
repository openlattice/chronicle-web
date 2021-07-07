// @flow

const STUDIES_REDUX_CONSTANTS = {
  GLOBAL_NOTIFICATIONS_EKID: 'globalNotificationsEKID',
  NOTIFICATIONS_ENABLED_STUDIES: 'notificationsEnabledStudies',
  PARTICIPATED_IN_EKID: 'participatedInEKID',
  PART_OF_ASSOCIATION_EKID_MAP: 'partOfAssociationEKIDMap',
  STUDIES: 'studies',
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

const TUD_REDUX_CONSTANTS = {
  SUBMISSIONS_BY_DATE: 'submissionsByDate'
};

const PERMISSIONS_REDUX_CONSTANTS = {
  HAS_DELETE_PERMISSION: 'hasDeletePermission',
  PERMISSIONS: 'permissions'
};

export {
  PERMISSIONS_REDUX_CONSTANTS,
  QUESTIONNAIRE_REDUX_CONSTANTS,
  STUDIES_REDUX_CONSTANTS,
  TUD_REDUX_CONSTANTS,
};
