// @flow

import { Map } from 'immutable';
import type { FQN } from 'lattice';

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

const selectEntitySetId = (esName :string) => (state :Map) => state.getIn(['edm', 'entitySetIds', esName]);

export {
  selectEntityType,
  selectEntityTypeId,
  selectEntitySetId,
  selectPropertyTypeId
};
