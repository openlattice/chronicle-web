/*
 * @flow
 */

import React, { Component } from 'react';

import styled from 'styled-components';
import { Map } from 'immutable';
import {
  Card,
  CardSegment,
  Colors
} from 'lattice-ui-kit';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import type { RequestSequence } from 'redux-reqseq';

import * as Routes from '../../../core/router/Routes';
import { PROPERTY_TYPE_FQNS } from '../../../core/edm/constants/FullyQualifiedNames';
import { goToRoute } from '../../../core/router/RoutingActions';

const { STUDY_DESCRIPTION, STUDY_NAME, STUDY_ID } = PROPERTY_TYPE_FQNS;
const { NEUTRAL } = Colors;

const StudyName = styled.h2`
  font-size: 20px;
  font-weight: 400;
  margin: 0 0 20px 0;
  overflow: hidden;
  padding: 0;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

/* stylelint-disable value-no-vendor-prefix, property-no-vendor-prefix */
const StudyDescription = styled.p`
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
  color: ${NEUTRAL.N600};
  display: -webkit-box;
  font-size: 16px;
  line-height: 1.5;
  margin: 0;
  overflow-wrap: break-word;
  overflow: hidden;
  padding: 0;
  text-overflow: ellipsis;
`;
/* stylelint-enable */

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
      <Card onClick={this.handleCardClick} data-study-id={study.getIn([STUDY_ID, 0])}>
        <CardSegment vertical>
          <StudyName>
            {study.getIn([STUDY_NAME, 0])}
          </StudyName>
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
