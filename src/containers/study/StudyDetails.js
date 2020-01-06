/*
 * @flow
 */

import React, { useState } from 'react';

import styled from 'styled-components';
import { Map } from 'immutable';
import {
  Colors,
  EditButton
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

const { NEUTRALS } = Colors;

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
    font-weight: 400;
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
  flex: 0 0 80%;
`;

const ContactWrapper = styled.div`
  display: flex;
  flex-direction: column;
  flex: 0 0 20%;
`;

const EditButtonWrapper = styled.div`
  display: flex;
  justify-content: flex-start;
  padding-bottom: 5px;
  border-bottom: 1px dashed ${NEUTRALS[3]};
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
  study :Map
}

const StudyDetails = ({ study } :Props) => {

  const studyDescription = study.getIn([STUDY_DESCRIPTION, 0]);
  const studyUUID = study.getIn([STUDY_ID, 0]);
  const studyVersion = study.getIn([STUDY_VERSION, 0]);
  const studyEmail = study.getIn([STUDY_EMAIL, 0]);
  const studyGroup = study.getIn([STUDY_GROUP, 0]);

  const dispatch = useDispatch();
  const [editModalVisible, setEditModalVisible] = useState(false);

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
    <EditButtonWrapper>
      <EditButton mode="positive" onClick={openEditModal}>
        Edit Details
      </EditButton>
    </EditButtonWrapper>
  );

  return (
    <>
      {renderEditButton()}
      <MainInfoContainer>
        {renderAbout()}
        {renderContactInfo()}
      </MainInfoContainer>
      <StudyDetailsModal
          handleOnCloseModal={closeEditModal}
          isVisible={editModalVisible}
          study={study} />
    </>
  );
};
export default StudyDetails;
