/*
 * @flow
 */

import { List, Map, fromJS } from 'immutable';
import { Models } from 'lattice';
import { RequestStates } from 'redux-reqseq';
import type {
  EntityTypeObject,
  FQN,
  PropertyTypeObject,
} from 'lattice';
import type { SequenceAction } from 'redux-reqseq';

import {
  CREATE_PARTICIPANTS_ENTITY_SET,
  GET_ALL_ENTITY_SET_IDS,
  GET_EDM_TYPES,
  GET_PARTICIPANTS_ENTITY_SET_IDS,
  createParticipantsEntitySet,
  getAllEntitySetIds,
  getEntityDataModelTypes,
  getParticipantsEntitySetsIds
} from './EDMActions';

import Logger from '../../utils/Logger';

const LOG :Logger = new Logger('EDMReducer');
const { FullyQualifiedName } = Models;

const {
  EntityTypeBuilder,
  PropertyTypeBuilder,
} = Models;

const INITIAL_STATE :Map<*, *> = fromJS({
  [CREATE_PARTICIPANTS_ENTITY_SET]: {
    requestState: RequestStates.STANDBY
  },
  [GET_EDM_TYPES]: {
    requestState: RequestStates.STANDBY,
  },
  [GET_PARTICIPANTS_ENTITY_SET_IDS]: {
    requestState: RequestStates.STANDBY
  },

  entitySetIds: Map(),
  entityTypes: List(),
  entityTypesIndexMap: Map(),
  propertyTypes: List(),
  propertyTypesIndexMap: Map(),
  propertyTypesFqnIdMap: Map()
});

export default function edmReducer(state :Map<*, *> = INITIAL_STATE, action :Object) {

  switch (action.type) {

    case getEntityDataModelTypes.case(action.type): {
      const seqAction :SequenceAction = action;
      return getEntityDataModelTypes.reducer(state, action, {
        REQUEST: () => state
          .setIn([GET_EDM_TYPES, 'requestState'], RequestStates.PENDING)
          .setIn([GET_EDM_TYPES, seqAction.id], seqAction),
        SUCCESS: () => {

          const rawEntityTypes :EntityTypeObject[] = seqAction.value.entityTypes;
          const entityTypes :List = List().asMutable();
          const entityTypesIndexMap :Map = Map().asMutable();

          rawEntityTypes.forEach((et :EntityTypeObject, index :number) => {
            try {
              const entityType = new EntityTypeBuilder()
                .setBaseType(et.baseType)
                .setCategory(et.category)
                .setDescription(et.description)
                .setId(et.id)
                .setKey(et.key)
                .setPropertyTags(et.propertyTags)
                .setPropertyTypes(et.properties)
                .setSchemas(et.schemas)
                .setShards(et.shards)
                .setTitle(et.title)
                .setType(et.type)
                .build();
              entityTypes.push(entityType.toImmutable());
              entityTypesIndexMap.set(entityType.id, index);
              entityTypesIndexMap.set(entityType.type, index);
            }
            catch (e) {
              LOG.error(seqAction.type, e);
              LOG.error(seqAction.type, et);
            }
          });

          const rawPropertyTypes :PropertyTypeObject[] = seqAction.value.propertyTypes;
          const propertyTypes :List = List().asMutable();
          const propertyTypesIndexMap :Map = Map().asMutable();
          const propertyTypesFqnIdMap :Map = Map().asMutable();

          rawPropertyTypes.forEach((pt :PropertyTypeObject, index :number) => {
            try {
              const propertyType = new PropertyTypeBuilder()
                .setAnalyzer(pt.analyzer)
                .setDataType(pt.datatype)
                .setDescription(pt.description)
                .setEnumValues(pt.enumValues)
                .setId(pt.id)
                .setIndexType(pt.indexType)
                .setMultiValued(pt.multiValued)
                .setPii(pt.pii)
                .setSchemas(pt.schemas)
                .setTitle(pt.title)
                .setType(pt.type)
                .build();

              const typeFqn :FQN = new FullyQualifiedName(propertyType.type);
              propertyTypesFqnIdMap.set(typeFqn, propertyType.id);
              propertyTypes.push(propertyType.toImmutable());
              propertyTypesIndexMap.set(propertyType.id, index);
              propertyTypesIndexMap.set(propertyType.type, index);
            }
            catch (e) {
              LOG.error(seqAction.type, e);
              LOG.error(seqAction.type, pt);
            }
          });

          return state
            .set('entityTypes', entityTypes.asImmutable())
            .set('entityTypesIndexMap', entityTypesIndexMap.asImmutable())
            .set('propertyTypes', propertyTypes.asImmutable())
            .set('propertyTypesFqnIdMap', propertyTypesFqnIdMap.asImmutable())
            .set('propertyTypesIndexMap', propertyTypesIndexMap.asImmutable())
            .setIn([GET_EDM_TYPES, 'requestState'], RequestStates.SUCCESS);
        },
        FAILURE: () => state
          .set('entityTypes', List())
          .set('entityTypesIndexMap', Map())
          .set('propertyTypes', List())
          .set('propertyTypesFqnIdMap', Map())
          .set('propertyTypesIndexMap', Map())
          .setIn([GET_EDM_TYPES, 'requestState'], RequestStates.FAILURE),
        FINALLY: () => state
          .deleteIn([GET_EDM_TYPES, seqAction.id]),
      });
    }

    case getAllEntitySetIds.case(action.type): {
      const seqAction :SequenceAction = action;
      return getAllEntitySetIds.reducer(state, action, {
        REQUEST: () => state.setIn([GET_ALL_ENTITY_SET_IDS, 'requestState'], RequestStates.PENDING),
        FAILURE: () => state.setIn([GET_ALL_ENTITY_SET_IDS, 'requestState'], RequestStates.FAILURE),
        SUCCESS: () => state
          .set('entitySetIds', fromJS(seqAction.value))
          .setIn([GET_ALL_ENTITY_SET_IDS, 'requestState'], RequestStates.SUCCESS)
      });
    }

    case getParticipantsEntitySetsIds.case(action.type): {
      const seqAction :SequenceAction = action;
      // console.log(seqAction.value);
      return getParticipantsEntitySetsIds.reducer(state, action, {
        REQUEST: () => state.setIn([GET_PARTICIPANTS_ENTITY_SET_IDS, 'requestState'], RequestStates.PENDING),
        FAILURE: () => state.setIn([GET_PARTICIPANTS_ENTITY_SET_IDS, 'requestState'], RequestStates.FAILURE),
        SUCCESS: () => state
          .setIn([GET_PARTICIPANTS_ENTITY_SET_IDS, 'requestState'], RequestStates.SUCCESS)
          .set('participantEntitySetIds', fromJS(seqAction.value))
      });
    }

    case createParticipantsEntitySet.case(action.type): {
      const seqAction :SequenceAction = action;
      return createParticipantsEntitySet.reducer(state, action, {
        REQUEST: () => state.setIn([CREATE_PARTICIPANTS_ENTITY_SET, 'requestState'], RequestStates.PENDING),
        FAILURE: () => state.setIn([CREATE_PARTICIPANTS_ENTITY_SET, 'requestState'], RequestStates.FAILURE),
        SUCCESS: () => {
          const { entitySetName, entitySetId } = seqAction.value;
          const updatedMap = state.get('participantEntitySetIds').set(entitySetName, entitySetId);
          return state
            .setIn([CREATE_PARTICIPANTS_ENTITY_SET, 'requestState'], RequestStates.SUCCESS)
            .set('participantEntitySetIds', updatedMap);
        }
      });
    }

    default:
      return state;
  }
}
