// @flow

import React from 'react';

import { Paged } from 'lattice-fabricate';
import {
  AppContainerWrapper,
  AppContentWrapper,
  AppHeaderWrapper,
  Card,
  CardSegment
} from 'lattice-ui-kit';

import QuestionnaireForm from './components/QuestionnaireForm';

import OpenLatticeIcon from '../../assets/images/ol_icon.png';

const TimeUseDiaryContainer = () => (
  <AppContainerWrapper>
    <AppHeaderWrapper appIcon={OpenLatticeIcon} appTitle="Chronicle" />
    <AppContentWrapper>
      <Card>
        <CardSegment>
          <Paged
              render={(pagedProps) => <QuestionnaireForm pagedProps={pagedProps} />} />
        </CardSegment>
      </Card>
    </AppContentWrapper>
  </AppContainerWrapper>
);
export default TimeUseDiaryContainer;
