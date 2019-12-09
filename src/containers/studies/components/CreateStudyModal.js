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

type State = {
  data :Object;
}

const ModalWrapper = styled.div`
  min-width: 440px;
`;

class CreateStudyModal extends Component<Props, State> {
  constructor(props :Props) {
    super(props);
    this.state = {
      data: {
        description: '',
        email: '',
        group: '',
        name: '',
        version: '',
      }
    };
  }
  componentDidMount() {

  }

  handleOnChange = ({ formData } :Object) => {
    this.setState({
      data: {
        description: formData.description || '',
        email: formData.email || '',
        group: formData.group || '',
        name: formData.name || '',
        version: formData.version || ''
      }
    });
  }
  getRequestStateComponents = () => {
    const { data } = this.state;
    const requestStateComponents = {
      [RequestStates.STANDBY]: (
        <ModalWrapper>
          <CreateStudyForm formData={data} handleOnChange={this.handleOnChange} />
        </ModalWrapper>
      ),
      [RequestStates.FAILURE]: (
        <ModalWrapper>
          <span> Failed to create a new study. Please try again </span>
        </ModalWrapper>
      )
    };
    return requestStateComponents;
  }
  handleOnCreateStudy = () => {
    // this is where we submit data;
    // need to maintain state of the data what data to displ
  }
  render() {
    const { isVisible, handleOnCloseModal, requestStates } = this.props;

    return (
      <ActionModal
          onClickPrimary={this.handleOnCreateStudy}
          onClose={handleOnCloseModal}
          requestState={requestStates[CREATE_STUDY]}
          requestStateComponents={this.getRequestStateComponents()}
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
