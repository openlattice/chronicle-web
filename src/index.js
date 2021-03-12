/*
 * @flow
 */

import React from 'react';
import ReactDOM from 'react-dom';

import LatticeAuth from 'lattice-auth';
import { ConnectedRouter } from 'connected-react-router/immutable';
import {
  Colors,
  LatticeLuxonUtils,
  MuiPickersUtilsProvider,
  StylesProvider,
  // $FlowFixMe
  ThemeProvider,
  lightTheme,
} from 'lattice-ui-kit';
import { normalize } from 'polished';
import { Provider } from 'react-redux';
import { Route, Switch } from 'react-router';
import { createGlobalStyle } from 'styled-components';

import AppContainer from './containers/app/AppContainer';
import QuestionnaireContainer from './containers/questionnaire/QuestionnaireContainer';
import TimeUseDiaryContainer from './containers/tud/TimeUseDiaryContainer';
import SurveyContainer from './containers/survey/SurveyContainer';
import initializeReduxStore from './core/redux/ReduxStore';
import initializeRouterHistory from './core/router/RouterHistory';
import * as Routes from './core/router/Routes';

// injected by Webpack.DefinePlugin
declare var __AUTH0_CLIENT_ID__ :string;
declare var __AUTH0_DOMAIN__ :string;

const { AuthRoute, AuthUtils } = LatticeAuth;
const { NEUTRALS, NEUTRAL } = Colors;

/* eslint-disable */
// TODO: move into core/styles
const NormalizeCSS = createGlobalStyle`
  ${normalize()}
`;

const GlobalStyle = createGlobalStyle`
  @supports (font-variation-settings: normal) {
    html {
      font-family: 'Inter var', sans-serif;
    }
  }

  html,
  body {
    background-color: ${NEUTRALS[7]};
    color: ${NEUTRAL.N900};
    font-family: 'Inter', sans-serif;
    line-height: 1.5;
    height: 100%;
    width: 100%;
  }

  * {
    box-sizing: border-box;
  }

  *::before,
  *::after {
    box-sizing: border-box;
  }

  #app {
    display: block;
    height: 100%;
    width: 100%;
  }
`;
/* eslint-enable */

/*
 * !!! MUST HAPPEN FIRST !!!
 */

LatticeAuth.configure({
  auth0ClientId: __AUTH0_CLIENT_ID__,
  auth0Domain: __AUTH0_DOMAIN__,
  authToken: AuthUtils.getAuthToken(),
});

/*
 * !!! MUST HAPPEN FIRST !!!
 */

const routerHistory = initializeRouterHistory();
const reduxStore = initializeReduxStore(routerHistory);

const APP_ROOT_NODE = document.getElementById('app');
if (APP_ROOT_NODE) {
  ReactDOM.render(
    <Provider store={reduxStore}>
      <ThemeProvider theme={lightTheme}>
        <MuiPickersUtilsProvider utils={LatticeLuxonUtils}>
          <StylesProvider injectFirst>
            <>
              <ConnectedRouter history={routerHistory}>
                <Switch>
                  <Route path={Routes.TUD} component={TimeUseDiaryContainer} />
                  <Route path={Routes.SURVEY} component={SurveyContainer} />
                  <Route path={Routes.QUESTIONNAIRE} component={QuestionnaireContainer} />
                  <Route path={Routes.TUD} component={TimeUseDiaryContainer} />
                  <AuthRoute redirectToLogin path={Routes.ROOT} component={AppContainer} />
                </Switch>
              </ConnectedRouter>
              <NormalizeCSS />
              <GlobalStyle />
            </>
          </StylesProvider>
        </MuiPickersUtilsProvider>
      </ThemeProvider>
    </Provider>,
    APP_ROOT_NODE
  );
}
