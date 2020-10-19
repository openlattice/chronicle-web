/*
 * @flow
 */

import React, { useState } from 'react';

import styled from 'styled-components';
import { Constants } from 'lattice';
import {
  Button,
  Spinner
} from 'lattice-ui-kit';
import { useRequestState } from 'lattice-utils';
import { useDispatch, useSelector } from 'react-redux';
import { RequestStates } from 'redux-reqseq';
import type { RequestState } from 'redux-reqseq';

import StudyCard from './components/StudyCard';
import StudyDetailsModal from './components/StudyDetailsModal';
import { CREATE_STUDY, GET_STUDIES } from './StudiesActions';

import BasicErrorComponent from '../shared/BasicErrorComponent';
import { resetRequestState } from '../../core/redux/ReduxActions';

const { OPENLATTICE_ID_FQN } = Constants;

const ContainerHeader = styled.section`
  display: flex;
  justify-content: space-between;
  margin: 20px 0;

  > h1 {
    cursor: default;
    font-size: 28px;
    font-weight: normal;
    margin: 0;
    padding: 0;
  }
`;

const CardGrid = styled.div`
  display: grid;
  grid-gap: 30px;
  grid-template-columns: 1fr 1fr;
`;

const CenterText = styled.div`
  text-align: center;
`;

const StudiesContainer = () => {

  const dispatch = useDispatch();
  const [createStudyModalVisible, setCreateStudyModalVisible] = useState(false);

  const studies = useSelector((state) => state.getIn(['studies', 'studies']));

  const getStudiesRS :?RequestState = useRequestState(['studies', GET_STUDIES]);

  const openCreateStudyModal = () => {
    // necessary after a successful or failed CREATE_STUDY action
    dispatch(resetRequestState(CREATE_STUDY));
    setCreateStudyModalVisible(true);
  };

  if (getStudiesRS === RequestStates.PENDING) {
    return (
      <Spinner size="2x" />
    );
  }

  if (getStudiesRS === RequestStates.FAILURE) {
    return (
      <BasicErrorComponent />
    );
  }

  return (
    <>
      <ContainerHeader>
        <h1> Studies </h1>
        <Button color="primary" onClick={openCreateStudyModal}> Create Study </Button>
      </ContainerHeader>
      {
        studies.isEmpty()
          ? (
            <CenterText>
              Sorry, no studies were found. Please try refreshing the page, or contact support.
            </CenterText>
          )
          : (
            <CardGrid>
              {
                studies.valueSeq().map((study) => (
                  <StudyCard key={study.getIn([OPENLATTICE_ID_FQN, 0])} study={study} />
                ))
              }
            </CardGrid>
          )
      }
      <StudyDetailsModal
          handleOnCloseModal={() => setCreateStudyModalVisible(false)}
          isVisible={createStudyModalVisible} />
    </>
  );
};

export default StudiesContainer;
