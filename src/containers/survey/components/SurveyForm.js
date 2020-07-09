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
import { createSurveyFormSchema } from '../utils';

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
  userAppsData :Map;
  participantId :string;
  studyId :UUID;
  submitSurveyRS :?RequestState;
};

const SurveyTable = ({
  userAppsData,
  participantId,
  studyId,
  submitSurveyRS
} :Props) => {

  const rootDispatch = useDispatch();

  const [errorModalVisible, setErrorModalVisible] = useState(false);

  const { uiSchema, schema } = createSurveyFormSchema(userAppsData);

  useEffect(() => {
    setErrorModalVisible(submitSurveyRS === RequestStates.FAILURE);
  }, [errorModalVisible, setErrorModalVisible, submitSurveyRS]);

  const handleOnSubmit = ({ formData } :Object) => {
    rootDispatch(submitSurvey({
      participantId,
      studyId,
      formData,
      userAppsData
    }));
  };

  const hideErrorModal = () => {
    setErrorModalVisible(false);
    rootDispatch(resetRequestState(SUBMIT_SURVEY));
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
                    schema={schema}
                    isSubmitting={submitSurveyRS === RequestStates.PENDING}
                    uiSchema={uiSchema}
                    onSubmit={handleOnSubmit} />
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

export default SurveyTable;
