/*
 * @flow
 */

import React, { useEffect } from 'react';

import { AuthActions, AuthUtils } from 'lattice-auth';
import {
  AppContainerWrapper,
  AppContentWrapper,
  AppHeaderWrapper,
  AppNavigationWrapper,
  Spinner,
} from 'lattice-ui-kit';
import { LangUtils, useRequestState } from 'lattice-utils';
import { useDispatch } from 'react-redux';
import {
  Redirect,
  Route,
  Switch,
  withRouter,
} from 'react-router';
import { NavLink } from 'react-router-dom';
import { RequestStates } from 'redux-reqseq';
import type { RequestState } from 'redux-reqseq';

import * as AppActions from './AppActions';
import { initializeApplication } from './AppActions';

import BasicErrorComponent from '../shared/BasicErrorComponent';
import OpenLatticeIcon from '../../assets/images/ol_icon.png';
import StudiesContainer from '../studies/StudiesContainer';
import StudyDetailsContainer from '../study/StudyDetailsContainer';
import * as Routes from '../../core/router/Routes';

const { isNonEmptyString } = LangUtils;

const { INITIALIZE_APPLICATION } = AppActions;

const AppContainer = () => {
  const dispatch = useDispatch();

  const initializeApplicationRS :?RequestState = useRequestState(['app', INITIALIZE_APPLICATION]);

  useEffect(() => {
    dispatch(initializeApplication());
  }, [dispatch]);

  const logout = () => {
    dispatch(AuthActions.logout());

    // TODO: tracking
    // if (isFunction(gtag)) {
    //   gtag('config', GOOGLE_TRACKING_ID, { user_id: undefined, send_page_view: false });
    // }
  };

  const renderAppContent = () => {
    if (initializeApplicationRS === RequestStates.SUCCESS) {
      return (
        <Switch>
          <Route path={Routes.STUDY} component={StudyDetailsContainer} />
          <Route path={Routes.STUDIES} component={StudiesContainer} />
          <Redirect to={Routes.STUDIES} />
        </Switch>
      );
    }

    return (
      <AppContentWrapper>
        {
          initializeApplicationRS === RequestStates.FAILURE
            ? <BasicErrorComponent />
            : <Spinner size="2x" />
        }
      </AppContentWrapper>
    );
  };

  const userInfo = AuthUtils.getUserInfo();
  let user = null;
  if (isNonEmptyString(userInfo.name)) {
    user = userInfo.name;
  }
  else if (isNonEmptyString(userInfo.email)) {
    user = userInfo.email;
  }

  return (
    <AppContainerWrapper>
      <AppHeaderWrapper appIcon={OpenLatticeIcon} appTitle="Chronicle" logout={logout} user={user}>
        <AppNavigationWrapper>
          <NavLink to={Routes.STUDIES} />
          <NavLink to={Routes.STUDIES}> Studies </NavLink>
        </AppNavigationWrapper>
      </AppHeaderWrapper>
      <AppContentWrapper>
        { renderAppContent() }
      </AppContentWrapper>
    </AppContainerWrapper>
  );
};

// $FlowFixMe
export default withRouter(AppContainer);
