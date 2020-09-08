// @flow

import React, {
  useEffect,
  useState
} from 'react';

import styled from 'styled-components';
import { Map } from 'immutable';
import { Form } from 'lattice-fabricate';
import {
  Card,
  CardSegment,
  Colors,
  StyleUtils,
} from 'lattice-ui-kit';
import { useDispatch } from 'react-redux';
import { RequestStates } from 'redux-reqseq';
import type { RequestState } from 'redux-reqseq';

import SubmissionFailureModal from './SubmissionFailureModal';

import { resetRequestState } from '../../../core/redux/ReduxActions';
import { SUBMIT_SURVEY, submitSurvey } from '../SurveyActions';
import { SURVEY_INSTRUCTION_TEXT } from '../constants';
import { createInitialFormData, createSurveyFormSchema } from '../utils';

const { media } = StyleUtils;
const { NEUTRAL } = Colors;

const StyledCard = styled(Card)`
  ${media.phone`
    padding: 10px;
  `}
`;

const StyledCardSegment = styled(CardSegment)`
  ${media.phone`
    margin: 0 10px 0 10px;
  `}
`;

const NoAppsFound = styled.h4`
  font-weight: 400;
  font-size: 15px;
  text-align: center;
`;

const InstructionText = styled.span`
  color: ${NEUTRAL.N700};
  line-height: 1.8;
  font-size: 15px;
`;

type Props = {
  organizationId ?:UUID;
  participantId :string;
  studyId :UUID;
  submitSurveyRS :?RequestState;
  userAppsData :Map;
};

const SurveyForm = ({
  organizationId,
  participantId,
  studyId,
  submitSurveyRS,
  userAppsData,
} :Props) => {

  const dispatch = useDispatch();

  const [errorModalVisible, setErrorModalVisible] = useState(false);

  const { uiSchema, schema } = createSurveyFormSchema(userAppsData);
  const initialFormData = createInitialFormData(userAppsData);

  useEffect(() => {
    setErrorModalVisible(submitSurveyRS === RequestStates.FAILURE);
  }, [errorModalVisible, setErrorModalVisible, submitSurveyRS]);

  const handleOnSubmit = ({ formData } :Object) => {
    dispatch(submitSurvey({
      formData,
      organizationId,
      participantId,
      studyId,
      userAppsData
    }));
  };

  const hideErrorModal = () => {
    setErrorModalVisible(false);
    dispatch(resetRequestState(SUBMIT_SURVEY));
  };

  return (
    <StyledCard>
      {
        userAppsData.isEmpty()
          ? (
            <StyledCardSegment noBleed>
              <NoAppsFound>
                No apps found. Please try refreshing the page.
              </NoAppsFound>
            </StyledCardSegment>
          ) : (
            <>
              <StyledCardSegment noBleed>
                <InstructionText>
                  {SURVEY_INSTRUCTION_TEXT}
                </InstructionText>
                <Form
                    formData={initialFormData}
                    isSubmitting={submitSurveyRS === RequestStates.PENDING}
                    onSubmit={handleOnSubmit}
                    schema={schema}
                    uiSchema={uiSchema} />
              </StyledCardSegment>
            </>
          )
      }
      <SubmissionFailureModal
          handleOnClose={hideErrorModal}
          isVisible={errorModalVisible} />
    </StyledCard>
  );
};

SurveyForm.defaultProps = {
  organizationId: undefined
};

export default SurveyForm;
