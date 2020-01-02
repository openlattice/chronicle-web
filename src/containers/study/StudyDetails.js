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

import CreateStudyModal from '../studies/components/CreateStudyModal';
import { PROPERTY_TYPE_FQNS } from '../../core/edm/constants/FullyQualifiedNames';
import { resetRequestState } from '../../core/redux/ReduxActions';
import { isEmptyString } from '../../utils/LangUtils';
import { UPDATE_STUDY } from '../studies/StudiesActions';

const {
  STUDY_DESCRIPTION,
  STUDY_EMAIL,
  STUDY_ID,
  STUDY_GROUP,
  STUDY_VERSION
} = PROPERTY_TYPE_FQNS;

const { NEUTRALS } = Colors;

const DetailWrapper = styled.div`
  display: flex;
  flex-direction: column;
  font-size: 15px;
  line-height: 1.7;
  margin-bottom: 15px;
  margin-right: 15px;

  > h4 {
    color: ${NEUTRALS[0]};
    font-size: 15px;
    font-weight: 600;
    letter-spacing: 1.5px;
    margin-bottom: 3px;
    margin-top: 0;
    padding: 0;
    text-transform: uppercase;
  }

  > p {
    color: ${(props) => (props.isEmptyString ? NEUTRALS[1] : NEUTRALS[0])};
    font-size: 15px;
    font-style: ${(props) => (props.isEmptyString ? 'italic' : 'normal')};
    font-weight: 400;
    margin: 0;
    padding: 0;
  }
`;

const DetailsContainer = styled.div`
  border-top: 1px solid ${NEUTRALS[3]};
  display: flex;
  margin-top: 10px;
  padding-top: 10px;
`;

const About = styled.div`
  display: flex;
  flex-direction: column;
  flex: 0 0 80%;
`;

const Contact = styled.div`
  display: flex;
  flex-direction: column;
  flex: 0 0 20%;
`;

const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;

  > h3 {
    font-size: 22px;
    font-weight: 500;
    margin: 0;
    padding: 0;
  }
`;

type Props = {
  study :Map
}

const StudyDetails = ({ study } :Props) => {

  const description = study.getIn([STUDY_DESCRIPTION, 0]);
  const uuid = study.getIn([STUDY_ID, 0]);
  const version = study.getIn([STUDY_VERSION, 0]);
  const email = study.getIn([STUDY_EMAIL, 0]);
  const group = study.getIn([STUDY_GROUP, 0]);

  const dispatch = useDispatch();
  const [editModalVisible, setEditModalVisible] = useState(false);

  const renderAbout = () => (
    <About>
      <DetailWrapper isEmptyString={!description || isEmptyString(description)}>
        <h4> Description </h4>
        <p>
          {
            !description || isEmptyString(description) ? 'No description' : description
          }
        </p>
      </DetailWrapper>

      <DetailWrapper>
        <h4> UUID </h4>
        <p>
          { uuid }
        </p>
      </DetailWrapper>

      <DetailWrapper isEmptyString={!version || isEmptyString(version)}>
        <h4> Version </h4>
        <p>
          {
            !version || isEmptyString(version) ? 'No version' : version
          }
        </p>
      </DetailWrapper>
    </About>
  );

  const renderContactInfo = () => (
    <Contact>
      <DetailWrapper>
        <h4> Email </h4>
        <p>
          { email }
        </p>
      </DetailWrapper>
      <DetailWrapper isEmptyString={!group || isEmptyString(group)}>
        <h4> Group </h4>
        <p>
          {
            !group || isEmptyString(group) ? 'No group' : group
          }
        </p>
      </DetailWrapper>
    </Contact>
  );

  const closeEditModal = () => {
    setEditModalVisible(false);
  };

  const openEditModal = () => {
    setEditModalVisible(true);

    dispatch(resetRequestState(UPDATE_STUDY));
  };

  return (
    <>
      <SectionHeader>
        <h3> Study Details </h3>
        <EditButton mode="secondary" onClick={openEditModal}>
          Edit Details
        </EditButton>
      </SectionHeader>
      <DetailsContainer>
        {renderAbout()}
        {renderContactInfo()}
      </DetailsContainer>
      <CreateStudyModal
          editMode
          handleOnCloseModal={closeEditModal}
          isVisible={editModalVisible}
          study={study} />
    </>
  );
};
export default StudyDetails;
