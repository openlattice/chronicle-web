/*
 * @flow
 */

const ASSOCIATION_ENTITY_SET_NAMES = {
  PARTICIPATED_IN: 'chronicle_participated_in',
  HAS_ES_NAME: 'chronicle_has',
  PART_OF_ES_NAME: 'chronicle_partof',
  RESPONDS_WITH_ES_NAME: 'chronicle_respondswith',
  ADDRESSES_ES_NAME: 'chronicle_addresses'
};

const ENTITY_SET_NAMES_LIST = [];
Object.keys(ASSOCIATION_ENTITY_SET_NAMES).forEach((name :string) => {
  ENTITY_SET_NAMES_LIST.push(ASSOCIATION_ENTITY_SET_NAMES[name]);
});

export {
  ASSOCIATION_ENTITY_SET_NAMES,
  ENTITY_SET_NAMES_LIST,
};
