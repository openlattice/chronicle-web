// @flow

import { Map } from 'immutable';
import type { FQN } from 'lattice';
import merge from 'lodash/merge';

import { APP_REDUX_CONSTANTS } from '../../utils/constants/ReduxConstants';
import { CHRONICLE_CORE, DATA_COLLECTION, QUESTIONNAIRES } from '../../utils/constants/AppModules';

const { SELECTED_ORG_ID, ENTITY_SET_IDS_BY_ORG_ID } = APP_REDUX_CONSTANTS;

const selectEntityTypeId = (entityTypeFQN :FQN) => (state :Map) => {
  const entityTypeIndex :number = state.getIn(['edm', 'entityTypesIndexMap', entityTypeFQN]);
  return state.getIn(['edm', 'entityTypes', entityTypeIndex, 'id']);
};

const selectEntityType = (entityTypeFQN :FQN) => (state :Map) => {
  const entityTypeIndex :number = state.getIn(['edm', 'entityTypesIndexMap', entityTypeFQN]);
  return state.getIn(['edm', 'entityTypes', entityTypeIndex]);
};

const selectPropertyTypeId = (propertyTypeFQN :FQN) => (state :Map) => {
  return state.getIn(['edm', 'propertyTypeIds', propertyTypeFQN]);
};

const selectESIDByCollection = (template :string, moduleName :string) => (state :Map) => {
  const selectedOrgId = state.getIn(['app', SELECTED_ORG_ID]);

  return state.getIn(['app', ENTITY_SET_IDS_BY_ORG_ID, moduleName, selectedOrgId, template]);
};

const selectPropertyTypeIds = () => (state :Map) => state.getIn(['edm', 'propertyTypeIds']);

const selectEntitySetId = (esName :string) => (state :Map) => state.getIn(['edm', 'entitySetIds', esName]);

const getSelectedOrgEntitySetIds = () => (state :Map) => {
  const selectedOrgId = state.getIn(['app', SELECTED_ORG_ID]);
  let result = Map().asMutable();

  [CHRONICLE_CORE, DATA_COLLECTION, QUESTIONNAIRES].forEach((moduleName) => {
    result = result.merge(state.getIn(['app', ENTITY_SET_IDS_BY_ORG_ID, moduleName, selectedOrgId], Map()));
  });
  return result.asImmutable();
};

export {
  selectESIDByCollection,
  selectEntitySetId,
  getSelectedOrgEntitySetIds,
  selectEntityType,
  selectEntityTypeId,
  selectPropertyTypeId,
  selectPropertyTypeIds,
};
