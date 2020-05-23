/*
 * @flow
 */

const ASSOCIATION_ENTITY_SET_NAMES = {
  PARTICIPATED_IN: 'chronicle_participated_in',
  PART_OF_ES_NAME: 'chronicle_partof',
  RESPONDS_WITH_ES_NAME: 'chronicle_respondswith',
  ADDRESSES_ES_NAME: 'chronicle_addresses'
};

const ENTITY_SET_NAMES = {
  APPLICATION_DATA: 'chronicle_app_data',
  CHRONICLE_DEVICES: 'chronicle_device',
  CHRONICLE_STUDIES: 'chronicle_study',
  PREPROCESSED_DATA: 'chronicle_preprocessed_app_data',
  CHRONICLE_NOTIFICATIONS: 'chronicle_notifications',
  QUESTIONNAIRE_ES_NAME: 'chronicle_questionnaires',
  QUESTIONS_ES_NAME: 'chronicle_questions',
  ANSWERS_ES_NAME: 'chronicle_answers',
};

const ENTITY_SET_NAMES_LIST = [];
Object.keys(ASSOCIATION_ENTITY_SET_NAMES).forEach((name :string) => {
  ENTITY_SET_NAMES_LIST.push(ASSOCIATION_ENTITY_SET_NAMES[name]);
});
Object.keys(ENTITY_SET_NAMES).forEach((name :string) => {
  ENTITY_SET_NAMES_LIST.push(ENTITY_SET_NAMES[name]);
});


export {
  ASSOCIATION_ENTITY_SET_NAMES,
  ENTITY_SET_NAMES,
  ENTITY_SET_NAMES_LIST,
};
