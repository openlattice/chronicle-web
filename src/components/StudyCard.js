/*
 * @flow
 */

import React, { Component } from 'react';

import styled from 'styled-components';
import { faUsers } from '@fortawesome/pro-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Map } from 'immutable';
import {
  Card,
  CardHeader,
  CardSegment,
  Colors
} from 'lattice-ui-kit';

const { NEUTRALS } = Colors;

const StudyName = styled.h2`
  font-size: 18px;
  font-weight: normal;
  margin: 0;
  padding: 0;
`;

/* stylelint-disable value-no-vendor-prefix, property-no-vendor-prefix */
const StudyDescription = styled.p`
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
  color: ${NEUTRALS[1]};
  display: -webkit-box;
  font-size: 14px;
  font-weight: normal;
  margin: 0;
  overflow-wrap: break-word;
  overflow: hidden;
  padding: 0;
  text-overflow: ellipsis;
`;
/* stylelint-disable */

const StudySummary = styled.div`
  align-items: center;
  display: flex;
  justify-content: space-between;
  width: 100%;

  ${StudyName} {
    flex: 0 0 70%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
`;

const StudyParticipants = styled.div`
  align-items: center;
  color: ${NEUTRALS[0]};
  display: flex;
  font-size: 15px;
  justify-content: flex-end;
`;

const ParticipantsIcon = styled(FontAwesomeIcon).attrs({
  icon: faUsers
})`
  margin-right: 10px;
  color: ${NEUTRALS[1]};
`;

type Props = {
  study :Map<*, *>;
}

//  TODO : get the number of participants for a study;
class StudyCard extends Component<Props> {
  handleCardClick = () => {
    // to implement this
  }
  render() {
    const { study } = this.props;
    const numParticipants = 3; // TODO: change this to the actual number of participants
    return (
      <Card onClick={this.handleCardClick} data-study-id={study.id}>
        <CardHeader>
          <StudySummary>
            <StudyName>
              {study.name}
            </StudyName>
            <StudyParticipants>
              <ParticipantsIcon />
              {numParticipants}
            </StudyParticipants>
          </StudySummary>

        </CardHeader>
        <CardSegment>
          <StudyDescription>
            {study.description}
          </StudyDescription>
        </CardSegment>
      </Card>
    );
  }
}

export default StudyCard;
