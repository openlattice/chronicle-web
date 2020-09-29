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
import qs from 'qs';
import { useLocation } from 'react-router';

import QuestionnaireForm from './components/QuestionnaireForm';

import OpenLatticeIcon from '../../assets/images/ol_icon.png';

const TimeUseDiaryContainer = () => {
  const location = useLocation();
  const queryParams = qs.parse(location.search, { ignoreQueryPrefix: true });

  // $FlowFixMe
  const { participantId, studyId } :{ participantId :string, studyId :UUID } = queryParams;

  return (
    <AppContainerWrapper>
      <AppHeaderWrapper appIcon={OpenLatticeIcon} appTitle="Chronicle" />
      <AppContentWrapper>
        <Card>
          <CardSegment>
            <Paged
                render={(pagedProps) => (
                  <QuestionnaireForm
                      pagedProps={pagedProps}
                      participantId={participantId}
                      studyId={studyId} />
                )} />
          </CardSegment>
        </Card>
      </AppContentWrapper>
    </AppContainerWrapper>
  );
};

export default TimeUseDiaryContainer;
