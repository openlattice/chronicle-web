/*
 * @flow
 */

import React, { Component } from 'react';

import { Map } from 'immutable';
import { AuthActions, AuthUtils } from 'lattice-auth';
import {
  AppContainerWrapper,
  AppContentWrapper,
  AppHeaderWrapper,
  AppNavigationWrapper,
  Sizes,
  Spinner,
} from 'lattice-ui-kit';
import { LangUtils, ReduxConstants } from 'lattice-utils';
import { connect } from 'react-redux';
import {
  Redirect,
  Route,
  Switch,
  withRouter,
} from 'react-router';
import { NavLink } from 'react-router-dom';
import { bindActionCreators } from 'redux';
import { RequestStates } from 'redux-reqseq';
import type { RequestSequence, RequestState } from 'redux-reqseq';

import * as AppActions from './AppActions';

import BasicErrorComponent from '../shared/BasicErrorComponent';
import OpenLatticeIcon from '../../assets/images/ol_icon.png';
import StudiesContainer from '../studies/StudiesContainer';
import StudyDetailsContainer from '../study/StudyDetailsContainer';
import * as Routes from '../../core/router/Routes';

const { isNonEmptyString } = LangUtils;
const { REQUEST_STATE } = ReduxConstants;

const { INITIALIZE_APPLICATION } = AppActions;
const { APP_CONTENT_WIDTH } = Sizes;

type Props = {
  actions :{
    initializeApplication :RequestSequence;
    logout :() => void;
  };
  requestStates :{
    INITIALIZE_APPLICATION :RequestState;
  };
};

class AppContainer extends Component<Props> {

  componentDidMount() {

    const { actions } = this.props;
    actions.initializeApplication();
  }

  logout = () => {

    const { actions } = this.props;
    actions.logout();

    // TODO: tracking
    // if (isFunction(gtag)) {
    //   gtag('config', GOOGLE_TRACKING_ID, { user_id: undefined, send_page_view: false });
    // }
  }

  renderAppContent = () => {

    const { requestStates } = this.props;

    if (requestStates[INITIALIZE_APPLICATION] === RequestStates.SUCCESS) {
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
          requestStates[INITIALIZE_APPLICATION] === RequestStates.FAILURE
            ? <BasicErrorComponent />
            : <Spinner size="2x" />
        }
      </AppContentWrapper>
    );
  }

  render() {

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
        <AppHeaderWrapper appIcon={OpenLatticeIcon} appTitle="Chronicle" logout={this.logout} user={user}>
          <AppNavigationWrapper>
            <NavLink to={Routes.STUDIES} />
            <NavLink to={Routes.STUDIES}> Studies </NavLink>
          </AppNavigationWrapper>
        </AppHeaderWrapper>
        <AppContentWrapper contentWidth={APP_CONTENT_WIDTH}>
          { this.renderAppContent() }
        </AppContentWrapper>
      </AppContainerWrapper>
    );
  }
}

const mapStateToProps = (state :Map<*, *>) => ({
  requestStates: {
    [INITIALIZE_APPLICATION]: state.getIn(['app', INITIALIZE_APPLICATION, REQUEST_STATE]),
  }
});

const mapActionsToProps = (dispatch :Function) => ({
  actions: bindActionCreators({
    initializeApplication: AppActions.initializeApplication,
    logout: AuthActions.logout,
  }, dispatch)
});

// $FlowFixMe
export default withRouter(
  connect(mapStateToProps, mapActionsToProps)(AppContainer)
);
