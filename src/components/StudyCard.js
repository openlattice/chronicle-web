import React, { Component } from 'react';
import {
  Card,
  CardHeader,
  CardSegment,
  Colors
} from 'lattice-ui-kit';
import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUsers } from '@fortawesome/pro-solid-svg-icons';

const { NEUTRALS } = Colors;

const StudyName = styled.h2`
  font-size: 18px;
  font-weight: normal;
  margin: 0;
  padding: 0;
`

const StudyDescription = styled.p`
  font-size: 14px;
  color: ${NEUTRALS[1]};
  font-weight: normal;
  margin: 0;
  overflow:hidden;
  overflow-wrap: break-word;
  padding: 0;
  text-overflow: ellipsis;

  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
`;

const StudySummary = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  ${StudyName} {
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    flex: 0 0 70%;
  }
`;

const StudyParticipants = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: center;
  color: ${NEUTRALS[0]};
  font-size: 15px;

`
const ParticipantsIcon = styled(FontAwesomeIcon).attrs({
  icon: faUsers
})`
  margin-right: 10px;
  color: ${NEUTRALS[1]};
`
//TODO : get the number of participants for a study;
class StudyCard extends Component {
  render() {
    const { study, handleCardClick } = this.props;
    const numParticipants = 3; //// TODO: change this to the actual number of participants
    return (
      <Card onClick = {(event) => handleCardClick(event)} data-study-id = {study.id} >
        <CardHeader>
          <StudySummary>
            <StudyName>
              {study.name}
            </StudyName>
            <StudyParticipants>
              <ParticipantsIcon/>
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
    )
  }
}

export default StudyCard;
