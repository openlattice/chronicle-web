// @flow

import { Map } from 'immutable';
import type { FQN } from 'lattice';

import { CHRONICLE_CORE, DATA_COLLECTION, QUESTIONNAIRES } from '../../utils/constants/AppModules';
import { APP_REDUX_CONSTANTS } from '../../utils/constants/ReduxConstants';

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

  const result = Map().withMutations((mutator) => {
    [CHRONICLE_CORE, DATA_COLLECTION, QUESTIONNAIRES].forEach((moduleName) => {
      mutator.merge(state.getIn(['app', ENTITY_SET_IDS_BY_ORG_ID, moduleName, selectedOrgId], Map()));
    });
  });
  return result;
};

const getSelectedOrgId = () => (state :Map) => state.getIn(['app', SELECTED_ORG_ID]);

export {
  getSelectedOrgEntitySetIds,
  getSelectedOrgId,
  selectESIDByCollection,
  selectEntitySetId,
  selectEntityType,
  selectEntityTypeId,
  selectPropertyTypeId,
  selectPropertyTypeIds,
};
