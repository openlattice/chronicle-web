// @flow

import React from 'react';

import {
  AppContainerWrapper,
  AppContentWrapper,
  AppHeaderWrapper,
} from 'lattice-ui-kit';

import QuestionnaireForm from './components/QuestionnaireForm';

import OpenLatticeIcon from '../../assets/images/ol_icon.png';

const TimeUseDiaryContainer = () => (
  <AppContainerWrapper>
    <AppHeaderWrapper appIcon={OpenLatticeIcon} appTitle="Chronicle" />
    <AppContentWrapper>
      <QuestionnaireForm />
    </AppContentWrapper>
  </AppContainerWrapper>
);
export default TimeUseDiaryContainer;
