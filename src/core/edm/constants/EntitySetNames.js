/*
 * @flow
 */

const ASSOCIATION_ENTITY_SET_NAMES = {
  PARTICIPATED_IN: 'chronicle_participated_in',
  RECORDED_BY: 'chronicle_recorded_by',
  USED_BY: 'chronicle_used_by',
};

const ENTITY_SET_NAMES = {
  APPLICATION_DATA: 'chronicle_app_data',
  CHRONICLE_DEVICES: 'chronicle_device',
  CHRONICLE_STUDIES: 'chronicle_study',
};

const PARTICIPANTS_PREFIX = 'chronicle_participants_';

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
  PARTICIPANTS_PREFIX
};
