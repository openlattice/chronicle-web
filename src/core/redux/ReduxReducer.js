/*
 * @flow
 */

import { connectRouter } from 'connected-react-router/immutable';
import { AuthReducer } from 'lattice-auth';
import { combineReducers } from 'redux-immutable';

import appReducer from '../../containers/app/AppReducer';
import edmReducer from '../edm/EDMReducer';
import permissionsReducer from '../permissions/PermissionsReducer';
import studiesReducer from '../../containers/studies/StudiesReducer';

export default function reduxReducer(routerHistory :any) {

  return combineReducers({
    app: appReducer,
    auth: AuthReducer,
    edm: edmReducer,
    permissions: permissionsReducer,
    router: connectRouter(routerHistory),
    studies: studiesReducer,
  });
}
