/*
 * @flow
 */

import React, { Component } from 'react';

import styled from 'styled-components';
import { Map } from 'immutable';
import {
  Card,
  CardSegment,
  Typography
} from 'lattice-ui-kit';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import type { RequestSequence } from 'redux-reqseq';

import * as Routes from '../../../core/router/Routes';
import { PROPERTY_TYPE_FQNS } from '../../../core/edm/constants/FullyQualifiedNames';
import { goToRoute } from '../../../core/router/RoutingActions';

const { STUDY_DESCRIPTION, FULL_NAME_FQN, STUDY_ID } = PROPERTY_TYPE_FQNS;

const StyledCard = styled(Card)`
  height: 100%;
`;

type Props = {
  study :Map<*, *>;
  actions:{
    goToRoute :RequestSequence
  };
}

class StudyCard extends Component<Props> {
  handleCardClick = (event :SyntheticEvent<HTMLElement>) => {
    const { actions } = this.props;
    const { currentTarget } = event;
    const { dataset } = currentTarget;
    const { studyId } = dataset;

    actions.goToRoute(Routes.STUDY.replace(Routes.ID_PARAM, studyId));
  }

  render() {
    const { study } = this.props;
    return (
      <StyledCard onClick={this.handleCardClick} data-study-id={study.getIn([STUDY_ID, 0])}>
        <CardSegment vertical>
          <Typography variant="h4" gutterBottom>
            {study.getIn([FULL_NAME_FQN, 0])}
          </Typography>
          <Typography>
            {study.getIn([STUDY_DESCRIPTION, 0])}
          </Typography>
        </CardSegment>
      </StyledCard>
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
