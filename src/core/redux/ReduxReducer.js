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
import surveyReducer from '../../containers/survey/SurveyReducer';
import questionnareReducer from '../../containers/questionnaire/QuestionnaireReducer';

export default function reduxReducer(routerHistory :any) {

  return combineReducers({
    app: appReducer,
    appsData: surveyReducer,
    auth: AuthReducer,
    edm: edmReducer,
    permissions: permissionsReducer,
    questionnaire: questionnareReducer,
    router: connectRouter(routerHistory),
    studies: studiesReducer,
  });
}
