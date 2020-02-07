// @flow

import React, { useState } from 'react';

import styled from 'styled-components';
import { List, Set } from 'immutable';
import {
  Button,
  Card,
  CardSegment,
  StyleUtils,
  Table,
  Modal
} from 'lattice-ui-kit';
import { useDispatch } from 'react-redux';
import { RequestStates } from 'redux-reqseq';
import type { RequestState } from 'redux-reqseq';

import TABLE_HEADERS from './utils/TableHeaders';
import TableRow from './components/TableRow';
import { submitSurvey } from './SurveyActions';

import { PROPERTY_TYPE_FQNS } from '../../core/edm/constants/FullyQualifiedNames';


const { PERSON_ID } = PROPERTY_TYPE_FQNS;
const { media } = StyleUtils;

const SubmitButtonWrapper = styled.div`
  margin-top: 20px;
  text-align: end;
`;

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

const ModalWrapper = styled.div`
  width: 400px;
`;

const NoAppsFound = styled.h4`
  font-weight: 400;
  font-size: 15px;
  text-align: center;
`;

type Props = {
  data :List;
  participantId :string;
  studyId :UUID;
  submitRequestState :RequestState;
};

const SurveyTable = ({
  data,
  participantId,
  studyId,
  submitRequestState
} :Props) => {

  const dispatch = useDispatch();
  const [appsData, setAppsData] = useState(data);
  const [successModalOpen, setSuccessModalOpen] = useState(false);

  const handleOnSubmit = () => {
    dispatch(submitSurvey({
      participantId,
      studyId,
      appsData
    }));
  };

  const handleOnChange = (event :SyntheticInputEvent<HTMLInputElement>) => {
    const { currentTarget } = event;
    const { dataset } = currentTarget;
    const { neighborId, usertypeId } = dataset;

    const updatedApps = appsData.updateIn(
      [neighborId, 'associationDetails', PERSON_ID],
      Set(),
      (users) => {
        if (users.has(usertypeId)) {
          return users.delete(usertypeId);
        }
        return users.add(usertypeId);
      }
    );

    setAppsData(updatedApps);
  };

  const displaySuccessModal = () => (
    <Modal
        isVisible={successModalOpen}
        onClose={() => setSuccessModalOpen(false)}
        textSecondary="Close"
        textTitle="Submission Successful">
      <ModalWrapper>
          Thank you for submitting
      </ModalWrapper>
    </Modal>
  );

  const components = {
    Row: ({ data: rowData } :any) => (
      <TableRow data={rowData} handleOnChange={handleOnChange} />
    )
  };

  return (
    <StyledCard>
      <StyledCardSegment vertical noBleed>
        {
          appsData.length === 0
            ? (
              <NoAppsFound>
                No apps found. Please try refreshing the page.
              </NoAppsFound>
            )
            : (
              <>
                <Table
                    data={appsData.valueSeq().toJS()}
                    components={components}
                    headers={TABLE_HEADERS} />

                <SubmitButtonWrapper>
                  <Button
                      isLoading={submitRequestState === RequestStates.SUCCESS}
                      mode="primary"
                      onClick={handleOnSubmit}>
                      Submit Survey
                  </Button>
                  { displaySuccessModal() }
                </SubmitButtonWrapper>
              </>
            )
        }

      </StyledCardSegment>
    </StyledCard>
  );
};

export default SurveyTable;
