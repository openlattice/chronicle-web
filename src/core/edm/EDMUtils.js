// @flow

import { Map } from 'immutable';
import type { FQN } from 'lattice';

const selectEntityTypeId = (entityTypeFQN :FQN) => (state :Map) => {
  const entityTypeIndex :number = state.getIn(['edm', 'entityTypesIndexMap', entityTypeFQN]);
  return state.getIn(['edm', 'entityTypes', entityTypeIndex, 'id']);
};

const selectEntityType = (entityTypeFQN :FQN) => (state :Map) => {

  const entityTypes = state
    .getIn(['edm', 'entityTypes'])
    .filter((entityType) => entityType.get('type').equals(Map(entityTypeFQN)));
  return entityTypes.first();
};

export {
  selectEntityType,
  selectEntityTypeId
};
