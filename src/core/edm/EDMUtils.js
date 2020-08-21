// @flow

import { Map } from 'immutable';
import type { FQN } from 'lattice';

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

const selectESIDByAppTypeFqn = (appTypeFqn :FQN) => (state :Map) => {
  const selectedOrgId = state.getIn(['app', SELECTED_ORG_ID]);

  return state.getIn(['app', ENTITY_SET_IDS_BY_ORG_ID, selectedOrgId, appTypeFqn]);
};

const selectPropertyTypeIds = () => (state :Map) => state.getIn(['edm', 'propertyTypeIds']);

const selectEntitySetId = (esName :string) => (state :Map) => state.getIn(['edm', 'entitySetIds', esName]);

const selectEntitySetIdsByOrgId = () => (state :Map) => {
  const selectedOrgId = state.getIn(['app', SELECTED_ORG_ID]);
  return state.getIn(['app', ENTITY_SET_IDS_BY_ORG_ID, selectedOrgId]);
};

export {
  selectESIDByAppTypeFqn,
  selectEntitySetId,
  selectEntitySetIdsByOrgId,
  selectEntityType,
  selectEntityTypeId,
  selectPropertyTypeId,
  selectPropertyTypeIds,
};
