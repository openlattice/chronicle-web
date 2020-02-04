/*
 * @flow
 */

import { connectRouter } from 'connected-react-router/immutable';
import { AuthReducer } from 'lattice-auth';
import { combineReducers } from 'redux-immutable';

import appReducer from '../../containers/app/AppReducer';
import edmReducer from '../edm/EDMReducer';
import studiesReducer from '../../containers/studies/StudiesReducer';
import surveyReducer from '../../containers/survey/SurveyReducer';

export default function reduxReducer(routerHistory :any) {

  return combineReducers({
    app: appReducer,
    auth: AuthReducer,
    edm: edmReducer,
    router: connectRouter(routerHistory),
    studies: studiesReducer,
    userApps: surveyReducer
  });
}
