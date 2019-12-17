/*
 * @flow
 */

import { newRequestSequence } from 'redux-reqseq';
import type { RequestSequence } from 'redux-reqseq';

const GET_EDM_TYPES :'GET_EDM_TYPES' = 'GET_EDM_TYPES';
const getEntityDataModelTypes :RequestSequence = newRequestSequence(GET_EDM_TYPES);

const GET_ALL_ENTITY_SET_IDS :'GET_ALL_ENTITY_SET_IDS' = 'GET_ALL_ENTITY_SET_IDS';
const getAllEntitySetIds :RequestSequence = newRequestSequence(GET_ALL_ENTITY_SET_IDS);

const GET_PARTICIPANTS_ENTITY_SET_IDS :'GET_PARTICIPANTS_ENTITY_SET_IDS' = 'GET_PARTICIPANTS_ENTITY_SET_IDS';
const getParticipantsEntitySetsIds :RequestSequence = newRequestSequence(GET_PARTICIPANTS_ENTITY_SET_IDS);

export {
  GET_PARTICIPANTS_ENTITY_SET_IDS,
  GET_ALL_ENTITY_SET_IDS,
  GET_EDM_TYPES,
  getAllEntitySetIds,
  getEntityDataModelTypes,
  getParticipantsEntitySetsIds
};
