/*
 * @flow
 */

import React, { useEffect, useState } from 'react';

import styled from 'styled-components';
import { faBell, faBellSlash } from '@fortawesome/pro-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Map } from 'immutable';
import {
  // $FlowFixMe
  Box,
  Button,
  Card,
  CardSegment,
  Colors,
  // $FlowFixMe
  Grid,
  Typography
} from 'lattice-ui-kit';
import { LangUtils, useBoolean, useRequestState } from 'lattice-utils';
import { useDispatch } from 'react-redux';
import { RequestStates } from 'redux-reqseq';

import DeleteStudyModal from './components/DeleteStudyModal';

import StudyDetailsModal from '../studies/components/StudyDetailsModal';
import { PROPERTY_TYPE_FQNS } from '../../core/edm/constants/FullyQualifiedNames';
import { resetRequestState } from '../../core/redux/ReduxActions';
import { DELETE_STUDY, UPDATE_STUDY, removeStudyOnDelete } from '../studies/StudiesActions';

const { isNonEmptyString } = LangUtils;

const {
  STUDY_DESCRIPTION,
  STUDY_EMAIL,
  STUDY_GROUP,
  STUDY_ID,
  STUDY_VERSION
} = PROPERTY_TYPE_FQNS;

const { NEUTRAL, GREEN } = Colors;

const StyledFontAwesome = styled(FontAwesomeIcon)`
  font-size: 22px;
`;

type StudyDetailsItemProps = {
  label :string;
  missingValue?:boolean;
  placeholder?:string;
  value :string;
}

const StudyDetailsItem = ({
  label,
  missingValue,
  placeholder,
  value,
} :StudyDetailsItemProps) => {
  const detailValue = missingValue ? placeholder : value;

  return (
    <Box mb={2}>
      <Typography variant="h5">
        { label }
      </Typography>
      {
        missingValue ? (
          <Box fontStyle="italic">
            <Typography color="textSecondary">
              { detailValue }
            </Typography>
          </Box>
        ) : (
          <Typography>
            { detailValue }
          </Typography>
        )
      }
    </Box>
  );
};

StudyDetailsItem.defaultProps = {
  placeholder: undefined,
  missingValue: false
};

type Props = {
  notificationsEnabled :boolean;
  study :Map;
}

const StudyDetails = ({ study, notificationsEnabled } :Props) => {
  const dispatch = useDispatch();
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [isDeleteModalVisible, showDeleteModal, hideDeleteModal] = useBoolean(false);

  const deleteStudyRS = useRequestState(['studies', DELETE_STUDY]);

  const studyDescription = study.getIn([STUDY_DESCRIPTION, 0]);
  const studyUUID = study.getIn([STUDY_ID, 0]);
  const studyVersion = study.getIn([STUDY_VERSION, 0]);
  const studyEmail = study.getIn([STUDY_EMAIL, 0]);
  const studyGroup = study.getIn([STUDY_GROUP, 0]);

  const notificationIcon = notificationsEnabled ? faBell : faBellSlash;

  // After deleting study, redirect to root
  useEffect(() => {
    if (deleteStudyRS === RequestStates.SUCCESS) {
      setTimeout(() => {
        dispatch(removeStudyOnDelete(studyUUID));
        dispatch(resetRequestState(DELETE_STUDY));
      }, 2000);
    }
  }, [deleteStudyRS, dispatch, studyUUID]);

  const closeEditModal = () => {
    setEditModalVisible(false);
  };

  const onCloseDeleteModal = () => {
    hideDeleteModal();
    dispatch(resetRequestState(DELETE_STUDY));
  };

  const openEditModal = () => {
    // clear any previous state
    dispatch(resetRequestState(UPDATE_STUDY));

    setEditModalVisible(true);
  };

  const DetailsHeader = () => (
    <Box display="flex" alignItems="center">
      <StyledFontAwesome icon={notificationIcon} color={notificationsEnabled ? GREEN.G300 : NEUTRAL.N300} />
      <Box ml={1}>
        <Typography color="textSecondary" variant="button"> Daily Notifications </Typography>
      </Box>
    </Box>
  );

  return (
    <Card>
      <CardSegment>
        <DetailsHeader />
        <Box mt={3}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <StudyDetailsItem
                  label="Description"
                  missingValue={!isNonEmptyString(studyDescription)}
                  placeholder="No description"
                  value={studyDescription} />
              <StudyDetailsItem
                  label="UUID"
                  value={studyUUID} />
              <StudyDetailsItem
                  label="Version"
                  missingValue={!isNonEmptyString(studyVersion)}
                  placeholder="No version"
                  value={studyVersion} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <StudyDetailsItem
                  label="Email"
                  value={studyEmail} />
              <StudyDetailsItem
                  label="Group"
                  missingValue={!isNonEmptyString(studyGroup)}
                  placeholder="No group"
                  value={studyGroup} />
            </Grid>

            <Grid container item xs={12} spacing={3}>
              <Grid item xs={6}>
                <Button
                    color="secondary"
                    fullWidth
                    onClick={openEditModal}>
                  Edit Details
                </Button>
              </Grid>

              <Grid item xs={6}>
                <Button
                    color="secondary"
                    fullWidth
                    onClick={showDeleteModal}>
                  Delete Study
                </Button>
              </Grid>
            </Grid>
          </Grid>
          <StudyDetailsModal
              handleOnCloseModal={closeEditModal}
              notificationsEnabled={notificationsEnabled}
              isVisible={editModalVisible}
              study={study} />
          <DeleteStudyModal
              isVisible={isDeleteModalVisible}
              onClose={onCloseDeleteModal}
              requestState={deleteStudyRS || RequestStates.STANDBY}
              study={study} />
        </Box>
      </CardSegment>
    </Card>
  );
};
export default StudyDetails;
