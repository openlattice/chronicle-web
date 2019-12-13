/*
 * @flow
 */

import React from 'react';

import styled from 'styled-components';
import {
  Card,
  CardSegment,
  Colors,
} from 'lattice-ui-kit';

import EditableDetail from './components/EditableDetail';

import { PROPERTY_TYPE_FQNS } from '../../core/edm/constants/FullyQualifiedNames';

const {
  STUDY_DESCRIPTION,
  STUDY_EMAIL,
  STUDY_GROUP
} = PROPERTY_TYPE_FQNS;

const { NEUTRALS } = Colors;
const CardGrid = styled.div`
  margin-top: 50px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-gap: 30px;

  ${Card}{
    display: flex;
    flex-direction: column;
    min-width: 0;
  }
`;

const CardTitle = styled.h4`
  color: ${NEUTRALS[0]};
  font-size: 18px;
  margin: 0;
  font-weight: 500;
  margin-bottom: 20px;
  text-transform: uppercase;
`;

const DetailWrapper = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: 20px;
  font-size: 15px;
  line-height: 1.7;
  >h4 {
    font-size: 15px;
    font-weight: 400;
    margin: 0;
    color: ${NEUTRALS[1]};
    margin-right: 10px;
    text-transform: uppercase;
  }

  >p {
    margin: 5px 0 0 0;
  }
`;


const AboutCard = () => {
  // const onEditDescription = () => {};
  const description = 'i hate on the whole l;dfkg;kdfl;gk;dfkgl;dfgdf peolel.';

  return (
    <Card>
      <CardSegment vertical noBleed>
        <CardTitle>
          About
        </CardTitle>

        <DetailWrapper>
          <h4> UUID </h4>
          <p> 4b8fe7f9-c43d-44fe-80ba-51926ebc6531 </p>
        </DetailWrapper>

        <DetailWrapper>
          <h4> Description </h4>
          <EditableDetail propertyFqn={STUDY_DESCRIPTION} value={description} />
        </DetailWrapper>
      </CardSegment>
    </Card>
  );
};

const ContactCard = () => {
  const email = 'alfonce.starfish@gmail.com';
  const group = '333';
  return (
    <Card>
      <CardSegment vertical noBleed>
        <CardTitle>
          Contact info
        </CardTitle>
        <DetailWrapper>
          <h4> Email </h4>
          <EditableDetail propertyFqn={STUDY_EMAIL} value={email} />
        </DetailWrapper>

        <DetailWrapper>
          <h4> Group </h4>
          <EditableDetail propertyFqn={STUDY_GROUP} value={group} />
        </DetailWrapper>
      </CardSegment>
    </Card>
  );
};

const StudyDetails = () => {
  return (
    <CardGrid>
      <AboutCard />
      <ContactCard />
    </CardGrid>
  );
};
export default StudyDetails;
