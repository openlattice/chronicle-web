/*
 * @flow
 */

import React, { useEffect, useState } from 'react';

import styled from 'styled-components';
import { faBell, faBellSlash } from '@fortawesome/pro-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Map } from 'immutable';
import {
  Button,
  Card,
  CardSegment,
  Colors
} from 'lattice-ui-kit';
import { LangUtils, useBoolean, useRequestState } from 'lattice-utils';
import { useDispatch } from 'react-redux';
import { RequestStates } from 'redux-reqseq';

import DeleteStudyModal from './components/DeleteStudyModal';

import StudyDetailsModal from '../studies/components/StudyDetailsModal';
import * as Routes from '../../core/router/Routes';
import { PROPERTY_TYPE_FQNS } from '../../core/edm/constants/FullyQualifiedNames';
import { resetRequestState } from '../../core/redux/ReduxActions';
import { goToRoute } from '../../core/router/RoutingActions';
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

const DetailsWrapper = styled.div`
  align-items: flex-start;
  display: flex;
  flex-direction: column;
  font-size: 15px;
  margin: 0 15px 15px 0;

  :last-child {
    margin-bottom: 0;
  }

  > h4 {
    color: ${NEUTRAL.N800};
    font-size: 16px;
    font-weight: 500;
    margin: 0 0 3px 0;
    padding: 0;
  }

  > p {
    color: ${(props) => (props.missingValue ? NEUTRAL.N600 : NEUTRAL.N700)};
    font-size: 15px;
    font-style: ${(props) => (props.missingValue ? 'italic' : 'normal')};
    font-weight: 400;
    margin: 0;
    padding: 0;
    word-break: break-word;
  }
`;

const MainInfoContainer = styled.div`
  display: flex;
  padding: 15px 0;
`;

const AboutWrapper = styled.div`
  display: flex;
  flex-direction: column;
  flex: 0 0 66.6%;
`;

const ContactWrapper = styled.div`
  display: flex;
  flex-direction: column;
  flex: 0 0 33.3%;
`;

const NotificationIconWrapper = styled.div`
  margin-bottom: 5px;
  display: flex;
  align-items: center;
  padding: 0 3px;

  > h3 {
    margin: 0 0 0 10px;
    font-weight: 400;
    font-size: 15px;
  }
`;

const ButtonGrid = styled.div`
  display: grid;
  grid-gap: 20px;
  grid-template-columns: auto auto;
  margin-top: 20px;
  text-align: center;
`;

const StyledFontAwesome = styled(FontAwesomeIcon)`
  font-size: 22px;
`;

type DetailProps = {
  label :string;
  missingValue?:boolean;
  placeholder?:string;
  value :string;
}

const DetailWrapper = ({
  label,
  missingValue,
  placeholder,
  value,
}:DetailProps) => {
  const detailValue = missingValue ? placeholder : value;

  return (
    <DetailsWrapper missingValue={missingValue}>
      <h4>
        { label }
      </h4>
      <p>
        { detailValue }
      </p>
    </DetailsWrapper>
  );
};

DetailWrapper.defaultProps = {
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

  useEffect(() => {
    if (deleteStudyRS === RequestStates.SUCCESS) {
      setTimeout(() => {
        dispatch(removeStudyOnDelete(studyUUID));
        dispatch(goToRoute(Routes.ROOT));
        dispatch(resetRequestState(DELETE_STUDY));
      }, 2000);
    }
  }, [deleteStudyRS, dispatch, studyUUID]);

  const notificationIcon = notificationsEnabled ? faBell : faBellSlash;

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

  const renderAbout = () => (
    <AboutWrapper>
      <DetailWrapper
          label="Description"
          missingValue={!isNonEmptyString(studyDescription)}
          placeholder="No description"
          value={studyDescription} />
      <DetailWrapper
          label="UUID"
          value={studyUUID} />
      <DetailWrapper
          label="Version"
          missingValue={!isNonEmptyString(studyVersion)}
          placeholder="No version"
          value={studyVersion} />
    </AboutWrapper>
  );

  const renderContactInfo = () => (
    <ContactWrapper>
      <DetailWrapper
          label="Email"
          value={studyEmail} />
      <DetailWrapper
          label="Group"
          missingValue={!isNonEmptyString(studyGroup)}
          placeholder="No group"
          value={studyGroup} />
    </ContactWrapper>
  );

  const renderEditButton = () => (
    <NotificationIconWrapper>
      <StyledFontAwesome icon={notificationIcon} color={notificationsEnabled ? GREEN.G300 : NEUTRAL.N300} />
      <h3> Daily Notifications </h3>
    </NotificationIconWrapper>
  );

  return (
    <Card>
      <CardSegment vertical>
        {renderEditButton()}
        <MainInfoContainer>
          {renderAbout()}
          {renderContactInfo()}
        </MainInfoContainer>

        <ButtonGrid>
          <Button
              color="secondary"
              onClick={openEditModal}>
            Edit Details
          </Button>
          <Button
              color="error"
              onClick={showDeleteModal}>
            Delete Study
          </Button>
        </ButtonGrid>
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
      </CardSegment>
    </Card>
  );
};
export default StudyDetails;
