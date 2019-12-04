
import { newRequestSequence } from 'redux-reqseq';
import type { RequestSequence } from 'redux-reqseq';

const GET_STUDIES :'GET_STUDIES' = 'GET_STUDIES';
const getStudies :RequestSequence = newRequestSequence(GET_STUDIES);

const GET_STUDIES_PERMISSIONS: 'GET_STUDIES_PERMISSIONS' = 'GET_STUDIES_PERMISSIONS';
const getStudiesPermissions: RequestSequence = newRequestSequence(GET_STUDIES_PERMISSIONS);

export {
  GET_STUDIES,
  GET_STUDIES_PERMISSIONS,
  getStudiesPermissions,
  getStudies
}
