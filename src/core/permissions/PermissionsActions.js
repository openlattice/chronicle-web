// @flow

import { newRequestSequence } from 'redux-reqseq';
import type { RequestSequence } from 'redux-reqseq';

const GET_DELETE_PERMISSION :'GET_DELETE_PERMISSION' = 'GET_DELETE_PERMISSION';
const getDeletePermission :RequestSequence = newRequestSequence(GET_DELETE_PERMISSION);

const GET_STUDY_AUTHORIZATIONS :'GET_STUDY_AUTHORIZATIONS' = 'GET_STUDY_AUTHORIZATIONS';
const getStudyAuthorizations :RequestSequence = newRequestSequence(GET_STUDY_AUTHORIZATIONS);

const UPDATE_ES_PERMISSIONS :'UPDATE_ES_PERMISSIONS' = 'UPDATE_ES_PERMISSIONS';
const updateEntitySetPermissions :RequestSequence = newRequestSequence(UPDATE_ES_PERMISSIONS);

export {
  GET_DELETE_PERMISSION,
  GET_STUDY_AUTHORIZATIONS,
  UPDATE_ES_PERMISSIONS,
  getDeletePermission,
  getStudyAuthorizations,
  updateEntitySetPermissions,
};
