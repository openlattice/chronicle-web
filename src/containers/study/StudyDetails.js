/*
 * @flow
 */

import React, { useState } from 'react';

import styled from 'styled-components';
import { faBell, faBellSlash } from '@fortawesome/pro-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Map } from 'immutable';
import {
  Card,
  CardSegment,
  Colors,
  EditButton,
} from 'lattice-ui-kit';
import { useDispatch } from 'react-redux';

import StudyDetailsModal from '../studies/components/StudyDetailsModal';
import { PROPERTY_TYPE_FQNS } from '../../core/edm/constants/FullyQualifiedNames';
import { resetRequestState } from '../../core/redux/ReduxActions';
import { isNonEmptyString } from '../../utils/LangUtils';
import { UPDATE_STUDY } from '../studies/StudiesActions';

const {
  STUDY_DESCRIPTION,
  STUDY_EMAIL,
  STUDY_GROUP,
  STUDY_ID,
  STUDY_VERSION
} = PROPERTY_TYPE_FQNS;

const { NEUTRALS, GREEN_2 } = Colors;

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
    color: ${NEUTRALS[0]};
    font-size: 16px;
    font-weight: 500;
    margin: 0 0 3px 0;
    padding: 0;
  }

  > p {
    color: ${(props) => (props.missingValue ? NEUTRALS[1] : NEUTRALS[0])};
    font-size: 15px;
    font-style: ${(props) => (props.missingValue ? 'italic' : 'normal')};
    font-weight: 300;
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

const DetailsHeaderWrapper = styled.div`
  display: flex;
  justify-content: flex-start;
  margin-bottom: 5px;
  align-items: center;
`;

const NotificationIconWrapper = styled.div`
  margin-left: 30px;
  display: flex;
  align-items: center;
  padding: 0 3px;
  > h3 {
    margin: 0 0 0 10px;
    font-weight: 400;
    font-size: 15px;
  }
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

  const studyDescription = study.getIn([STUDY_DESCRIPTION, 0]);
  const studyUUID = study.getIn([STUDY_ID, 0]);
  const studyVersion = study.getIn([STUDY_VERSION, 0]);
  const studyEmail = study.getIn([STUDY_EMAIL, 0]);
  const studyGroup = study.getIn([STUDY_GROUP, 0]);

  const notificationIcon = notificationsEnabled ? faBell : faBellSlash;

  const closeEditModal = () => {
    setEditModalVisible(false);
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
    <DetailsHeaderWrapper>
      <EditButton mode="primary" onClick={openEditModal}>
        Edit Details
      </EditButton>

      <NotificationIconWrapper>
        <StyledFontAwesome icon={notificationIcon} color={GREEN_2} />
        <h3> Daily Notifications </h3>
      </NotificationIconWrapper>
    </DetailsHeaderWrapper>
  );

  return (
    <Card>
      <CardSegment vertical>
        {renderEditButton()}
        <MainInfoContainer>
          {renderAbout()}
          {renderContactInfo()}
        </MainInfoContainer>
        <StudyDetailsModal
            handleOnCloseModal={closeEditModal}
            notificationsEnabled={notificationsEnabled}
            isVisible={editModalVisible}
            study={study} />
      </CardSegment>
    </Card>
  );
};
export default StudyDetails;
