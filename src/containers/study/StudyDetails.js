/*
 * @flow
 */

import React from 'react';

import styled from 'styled-components';
import { Map } from 'immutable';
import {
  Button,
  Colors,
} from 'lattice-ui-kit';

import { PROPERTY_TYPE_FQNS } from '../../core/edm/constants/FullyQualifiedNames';

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
  margin-bottom: 10px;
  margin-top: 10px;

  > h4 {
    color: ${NEUTRALS[1]};
    font-size: 14px;
    font-weight: 400;
    letter-spacing: 1.8px;
    margin-right: 10px;
    text-transform: uppercase;
  }

  > p {
    margin: 5px 0 0 0;
  }
`;


type Props = {
  study :Map
}

const StudyDetails = ({ study } :Props) => {
  const renderAboutCard = () => (
    <About>
      <DetailWrapper>
        <h4> Description </h4>
        <p>
          { study.getIn([STUDY_DESCRIPTION, 0]) }
        </p>
      </DetailWrapper>

      <DetailWrapper>
        <h4> UUID </h4>
        <p>
          { study.getIn([STUDY_ID, 0]) }
        </p>
      </DetailWrapper>

      <DetailWrapper>
        <h4> Version </h4>
        <p>
          { study.getIn([STUDY_VERSION, 0]) }
        </p>
      </DetailWrapper>
    </About>
  );

  const DetailsContainer = styled.div`
    display: flex;
    margin-top: 10px;
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

  const EditButton = styled(Button)`
    align-self: flex-start;
    margin-top: 20px;
  `;

  const renderContactCard = () => (
    <Contact>
      <DetailWrapper>
        <h4> Email </h4>
        <p>
          { study.getIn([STUDY_EMAIL, 0]) }
        </p>
      </DetailWrapper>
      <DetailWrapper>
        <h4> Group </h4>
        <p>
          { study.getIn([STUDY_GROUP, 0]) }
        </p>
      </DetailWrapper>
    </Contact>
  );

  return (
    <>
      <EditButton mode="primary">
        Edit Details
      </EditButton>
      <DetailsContainer>
        {renderAboutCard()}
        {renderContactCard()}
      </DetailsContainer>
    </>
  );
};
export default StudyDetails;
