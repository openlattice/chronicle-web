/*
 * @flow
 */

import React, { useState } from 'react';

import { Constants } from 'lattice';
import {
  // $FlowFixMe
  Box,
  Button,
  // $FlowFixMe
  Grid,
  Spinner,
  Typography
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
      <Box mb={2}>
        <Grid container spacing={3}>
          <Grid item xs={6}>
            <Box fontWeight="fontWeightNormal" fontSize={28}>
              Studies
            </Box>
          </Grid>
          <Grid container item xs={6} justify="flex-end">
            <Button color="primary" onClick={openCreateStudyModal}> Create Study </Button>
          </Grid>
        </Grid>
      </Box>
      {
        studies.isEmpty()
          ? (
            <Typography variant="body2" align="center">
              Sorry, no studies were found. Please try refreshing the page, or contact support.
            </Typography>
          )
          : (
            <Grid container spacing={3}>
              {
                studies.valueSeq().map((study) => (
                  <Grid item xs={12} sm={6} key={study.getIn([OPENLATTICE_ID_FQN, 0])}>
                    <StudyCard study={study} />
                  </Grid>
                ))
              }
            </Grid>
          )
      }
      <StudyDetailsModal
          handleOnCloseModal={() => setCreateStudyModalVisible(false)}
          isVisible={createStudyModalVisible} />
    </>
  );
};

export default StudiesContainer;
