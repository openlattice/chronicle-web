// @flow

import React, { useEffect, useState } from 'react';

import qs from 'qs';
import { DataProcessingUtils, Paged } from 'lattice-fabricate';
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
import { PAGE_NUMBERS } from './constants/GeneralConstants';
import { PROPERTY_CONSTS } from './constants/SchemaConstants';
import { createFormSchema } from './utils';

import BasicModal from '../shared/BasicModal';
import OpenLatticeIcon from '../../assets/images/ol_icon.png';
import SubmissionSuccessful from '../shared/SubmissionSuccessful';

const { getPageSectionKey } = DataProcessingUtils;

const TimeUseDiaryContainer = () => {
  const location = useLocation();
  const queryParams = qs.parse(location.search, { ignoreQueryPrefix: true });

  const {
    familyId,
    organizationId,
    participantId,
    studyId,
    waveId,
  } :{
    familyId :string,
    organizationId :UUID,
    participantId :string,
    studyId :UUID,
    waveId :string,
    // $FlowFixMe
  } = queryParams;

  const initFormSchema = createFormSchema({}, 0);

  const [formSchema, setFormSchema] = useState(initFormSchema); // {schema, uiSchema}
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [page, setPage] = useState(0);
  const [formData, setFormData] = useState({});

  // selectors
  const submitRequestState :?RequestState = useRequestState(['tud', SUBMIT_TUD_DATA]);

  useEffect(() => {
    if (submitRequestState === RequestStates.FAILURE) {
      setIsModalVisible(true);
    }
  }, [submitRequestState]);

  /* eslint-disable react-hooks/exhaustive-deps */
  useEffect(() => {
    const newSchema = createFormSchema(formData, page);
    setFormSchema(newSchema);
  }, [page]);
  /* eslint-enable */

  useEffect(() => {
    if (page === PAGE_NUMBERS.PRE_SURVEY_PAGE) {
      const dayOfWeekInput = document.getElementById(
        `root_${getPageSectionKey(page, 0)}_${PROPERTY_CONSTS.DAY_OF_WEEK}`
      );
      const label = dayOfWeekInput?.previousSibling;
      if (label) {
        // $FlowFixMe
        label.innerHTML = 'We would like you to think about your child\'s day and complete the time use diary'
          + ' for <i>yesterday</i>. What day of the week was <i>yesterday</i>?';
      }
    }
  }, [page, formSchema]);

  const onPageChange = (currPage, currFormData) => {
    setPage(currPage);
    setFormData(currFormData);
  };

  const updateFormState = (schema, uiSchema, currFormData) => {
    setFormData(currFormData);
    setFormSchema({
      uiSchema,
      schema
    });
  };

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
                      initialFormData={formData}
                      onPageChange={onPageChange}
                      page={page}
                      render={(pagedProps) => (
                        <QuestionnaireForm
                            familyId={familyId}
                            formSchema={formSchema}
                            initialFormData={formData}
                            organizationId={organizationId}
                            pagedProps={pagedProps}
                            participantId={participantId}
                            studyId={studyId}
                            submitRequestState={submitRequestState}
                            updateFormState={updateFormState}
                            waveId={waveId} />
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
