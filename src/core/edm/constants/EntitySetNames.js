/*
 * @flow
 */

const ASSOCIATION_ENTITY_SET_NAMES = {
  ADDRESSES_ES_NAME: 'chronicle_addresses',
  HAS_ES_NAME: 'chronicle_has',
  PARTICIPATED_IN: 'chronicle_participated_in',
  PART_OF_ES_NAME: 'chronicle_partof',
  REGISTERED_FOR_ES: 'chronicle_registered_for',
  RESPONDS_WITH_ES_NAME: 'chronicle_respondswith',
};

const ENTITY_SET_NAMES = {
  ANSWERS_ES_NAME: 'chronicle_answers',
  APPLICATION_DATA: 'chronicle_app_data',
  CHRONICLE_DEVICES: 'chronicle_device',
  CHRONICLE_METADATA: 'chronicle_metadata',
  CHRONICLE_NOTIFICATIONS: 'chronicle_notifications',
  CHRONICLE_STUDIES: 'chronicle_study',
  PREPROCESSED_DATA: 'chronicle_preprocessed_app_data',
  QUESTIONNAIRE_ES_NAME: 'chronicle_questionnaires',
  QUESTIONS_ES_NAME: 'chronicle_questions',
  SUBMISSION_ES_NAME: 'chronicle_submission',
  TIMERANGE_ES_NAME: 'chronicle_timerange',
};

const ENTITY_SET_NAMES_LIST = [];
Object.keys(ASSOCIATION_ENTITY_SET_NAMES).forEach((name :string) => {
  ENTITY_SET_NAMES_LIST.push(ASSOCIATION_ENTITY_SET_NAMES[name]);
});

export {
  ASSOCIATION_ENTITY_SET_NAMES,
  ENTITY_SET_NAMES_LIST,
  ENTITY_SET_NAMES
};
