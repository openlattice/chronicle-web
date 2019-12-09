/*
 * @flow
 */
import React, { Component } from 'react';

import { Map } from 'immutable';
import { connect } from 'react-redux';
import { RequestStates } from 'redux-reqseq';
import type { RequestState } from 'redux-reqseq';
import styled from 'styled-components';
import {
  ActionModal
} from 'lattice-ui-kit';
import { CREATE_STUDY } from '../StudiesActions';
import CreateStudyForm from './CreateStudyForm';

type Props = {
  isVisible :boolean;
  handleOnCloseModal :Function;
  requestStates:{
    CREATE_STUDY :RequestState
  }
};

const ModalWrapper = styled.div`
  min-width: 400px;
`;

const requestStateComponents = {
  [RequestStates.STANDBY]: (
    <ModalWrapper>
      <CreateStudyForm />
    </ModalWrapper>
  ),
  [RequestStates.FAILURE]: (
    <ModalWrapper>
      <span> Failed to create a new study. Please try again </span>
    </ModalWrapper>
  )
};

class CreateStudyModal extends Component<Props> {
  componentDidMount() {

  }
  handleOnCreateStudy = () => {

  }
  render() {
    const { isVisible, handleOnCloseModal, requestStates } = this.props;
    return (
      <ActionModal
          onClickPrimary={this.handleOnCreateStudy}
          onClose={handleOnCloseModal}
          requestState={requestStates[CREATE_STUDY]}
          requestStateComponents={requestStateComponents}
          textPrimary="Create"
          textSecondary="Cancel"
          textTitle="New Study"
          isVisible={isVisible} />
    );
  }
}

const mapStateToProps = (state :Map) => ({
  requestStates: {
    [CREATE_STUDY]: state.getIn([CREATE_STUDY, 'requestState'])
  }
});

// $FlowFixMe
export default connect(mapStateToProps)(CreateStudyModal);
