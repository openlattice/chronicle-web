/*
 * @flow
 */

import React, { Component } from 'react';

import styled from 'styled-components';
import { faUsers } from '@fortawesome/pro-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Map } from 'immutable';
import { Constants } from 'lattice';
import {
  Card,
  CardHeader,
  CardSegment,
  Colors
} from 'lattice-ui-kit';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import type { RequestSequence } from 'redux-reqseq';

import * as Routes from '../../../core/router/Routes';
import { PROPERTY_TYPE_FQNS } from '../../../core/edm/constants/FullyQualifiedNames';
import { goToRoute } from '../../../core/router/RoutingActions';

// import Logger from '../../../utils/Logger';
// import { isValidUUID } from '../../../utils/ValidationUtils';

const { OPENLATTICE_ID_FQN } = Constants;
const { STUDY_DESCRIPTION, STUDY_NAME } = PROPERTY_TYPE_FQNS;
const { NEUTRALS } = Colors;
// const LOG = new Logger('StudyLogger');

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
/* stylelint-enable */

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
  actions:{
    goToRoute :RequestSequence
  };
}

class StudyCard extends Component<Props> {
  handleCardClick = (event :SyntheticEvent<HTMLElement>) => {
    // since the entityKeyIds are a bunch of zeros we may want to use the STUDY_ID
    // value for the URL
    const { actions } = this.props;
    const { currentTarget } = event;
    const { dataset } = currentTarget;
    const { studyId } = dataset;
    actions.goToRoute(Routes.STUDY.replace(Routes.ID_PARAM, studyId));
  }

  render() {
    const { study } = this.props;
    const numParticipants = 3; // TODO: change this to the actual number of participants
    return (
      <Card onClick={this.handleCardClick} data-study-id={study.getIn([OPENLATTICE_ID_FQN, 0])}>
        <CardHeader>
          <StudySummary>
            <StudyName>
              {study.getIn([STUDY_NAME, 0])}
            </StudyName>
            <StudyParticipants>
              <ParticipantsIcon />
              {numParticipants}
            </StudyParticipants>
          </StudySummary>

        </CardHeader>
        <CardSegment>
          <StudyDescription>
            {study.getIn([STUDY_DESCRIPTION, 0])}
          </StudyDescription>
        </CardSegment>
      </Card>
    );
  }
}

const mapDispatchToProps = (dispatch :() => void) => ({
  actions: bindActionCreators({
    goToRoute
  }, dispatch)
});

// $FlowFixMe
export default connect(null, mapDispatchToProps)(StudyCard);
