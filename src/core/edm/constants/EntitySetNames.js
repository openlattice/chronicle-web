/*
 * @flow
 */

const ASSOCIATION_ENTITY_SET_NAMES = {
  PARTICIPATED_IN: 'chronicle_participated_in',
  HAS: 'chronicle_has',
  CHRONICLE_PARTOF: 'chronicle_partof'
};

const ENTITY_SET_NAMES = {
  APPLICATION_DATA: 'chronicle_app_data',
  CHRONICLE_DEVICES: 'chronicle_device',
  CHRONICLE_STUDIES: 'chronicle_study',
  PREPROCESSED_DATA: 'chronicle_preprocessed_app_data',
  CHRONICLE_METADATA: 'chronicle_metadata',
  CHRONICLE_NOTIFICATIONS: 'chronicle_notifications',
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
