// @flow

import React, { useEffect, useState } from 'react';

import qs from 'qs';
import { Paged } from 'lattice-fabricate';
import {
  AppContainerWrapper,
  AppContentWrapper,
  AppHeaderWrapper,
  Card,
  CardSegment,
  Typography
} from 'lattice-ui-kit';
import { useRequestState } from 'lattice-utils';
import { useLocation } from 'react-router';
import { RequestStates } from 'redux-reqseq';
import type { RequestState } from 'redux-reqseq';

import QuestionnaireForm from './components/QuestionnaireForm';
import { SUBMIT_TUD_DATA } from './TimeUseDiaryActions';

import BasicModal from '../shared/BasicModal';
import OpenLatticeIcon from '../../assets/images/ol_icon.png';
import SubmissionSuccessful from '../shared/SubmissionSuccessful';

const TimeUseDiaryContainer = () => {
  const location = useLocation();

  const queryParams = qs.parse(location.search, { ignoreQueryPrefix: true });
  const {
    organizationId,
    participantId,
    studyId
  } :{
    organizationId :UUID,
    participantId :string,
    studyId :UUID
    // $FlowFixMe
  } = queryParams;

  const [isModalVisible, setIsModalVisible] = useState(false);

  // selectors
  const submitRequestState :?RequestState = useRequestState(['tud', SUBMIT_TUD_DATA]);

  useEffect(() => {
    if (submitRequestState === RequestStates.FAILURE) {
      setIsModalVisible(true);
    }
  }, [submitRequestState]);

  return (
    <AppContainerWrapper>
      <AppHeaderWrapper appIcon={OpenLatticeIcon} appTitle="Chronicle" />
      <AppContentWrapper>
        <BasicModal
            handleOnClose={() => setIsModalVisible(false)}
            isVisible={isModalVisible}
            title="Submission Error">
          <p> An error occurred while trying to submit survey. Please try again later. </p>
        </BasicModal>
        {
          submitRequestState === RequestStates.SUCCESS
            ? (
              <SubmissionSuccessful>
                <Typography variant="body2">
                  Thank you for completing the Time Use Diary survey. Your responses have been recorded.
                </Typography>
              </SubmissionSuccessful>
            )
            : (
              <Card>
                <CardSegment>
                  <Paged
                      render={(pagedProps) => (
                        <QuestionnaireForm
                            organizationId={organizationId}
                            pagedProps={pagedProps}
                            participantId={participantId}
                            studyId={studyId}
                            submitRequestState={submitRequestState} />
                      )} />
                </CardSegment>
              </Card>
            )
        }
      </AppContentWrapper>
    </AppContainerWrapper>
  );
};

export default TimeUseDiaryContainer;
