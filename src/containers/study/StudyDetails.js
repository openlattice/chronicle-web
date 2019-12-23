/*
 * @flow
 */

import React from 'react';

import styled from 'styled-components';
import { Map } from 'immutable';
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
  STUDY_ID,
  STUDY_GROUP,
  STUDY_VERSION
} = PROPERTY_TYPE_FQNS;

const { NEUTRALS } = Colors;
const CardGrid = styled.div`
  display: grid;
  grid-gap: 30px;
  grid-template-columns: 1fr 1fr;
  margin-top: 50px;

  ${Card} {
    cursor: default;
    display: flex;
    flex-direction: column;
    min-width: 0;
  }
`;

const CardTitle = styled.h4`
  color: ${NEUTRALS[0]};
  font-size: 18px;
  font-weight: 500;
  margin-bottom: 30px;
  text-transform: uppercase;
`;

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
    <Card>
      <CardSegment vertical noBleed>
        <CardTitle>
          About
        </CardTitle>

        <DetailWrapper>
          <h4> UUID </h4>
          <p>
            {
              study.getIn([STUDY_ID, 0])
            }
          </p>
        </DetailWrapper>

        <DetailWrapper>
          <h4> Description </h4>
          <EditableDetail propertyFqn={STUDY_DESCRIPTION} value={study.getIn([STUDY_DESCRIPTION, 0])} />
        </DetailWrapper>

        <DetailWrapper>
          <h4> Version </h4>
          <EditableDetail propertyFqn={STUDY_VERSION} value={study.getIn([STUDY_VERSION, 0])} />
        </DetailWrapper>
      </CardSegment>
    </Card>
  );

  const renderContactCard = () => (
    <Card>
      <CardSegment vertical noBleed>
        <CardTitle>
          Contact info
        </CardTitle>
        <DetailWrapper>
          <h4> Email </h4>
          <EditableDetail propertyFqn={STUDY_EMAIL} value={study.getIn([STUDY_EMAIL, 0])} />
        </DetailWrapper>
        <DetailWrapper>
          <h4> Group </h4>
          <EditableDetail propertyFqn={STUDY_GROUP} value={study.getIn([STUDY_GROUP, 0])} />
        </DetailWrapper>
      </CardSegment>
    </Card>
  );

  return (
    <CardGrid>
      {renderAboutCard()}
      {renderContactCard()}
    </CardGrid>
  );
};
export default StudyDetails;
