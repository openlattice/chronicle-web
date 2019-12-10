/*
 * @flow
 */
import React, { Component } from 'react';

import styled from 'styled-components';
import { Map } from 'immutable';
import {
  ActionModal
} from 'lattice-ui-kit';
import { connect } from 'react-redux';
import { RequestStates } from 'redux-reqseq';
import type { RequestState } from 'redux-reqseq';

import CreateStudyForm from './CreateStudyForm';

import { CREATE_STUDY } from '../StudiesActions';

type Props = {
  handleOnCloseModal :Function;
  isVisible :boolean;
  requestStates:{
    CREATE_STUDY :RequestState
  }
};

type State = {
  data :Object;
  isSubmitting :boolean;
}


const ModalBodyWrapper = styled.div`
  min-width: 440px;
`;

const initialFormDataState :Object = {
  description: '',
  email: '',
  group: '',
  name: '',
  version: '',
};
class CreateStudyModal extends Component<Props, State> {
  constructor(props :Props) {
    super(props);
    this.state = {
      data: { ...initialFormDataState },
      isSubmitting: false
    };
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

  requestStateComponents = () => {
    const { data, isSubmitting } = this.state;

    const components = {
      [RequestStates.STANDBY]: (
        <ModalBodyWrapper>
          <CreateStudyForm
              formData={data}
              handleOnChange={this.handleOnChange}
              isSubmitting={isSubmitting} />
        </ModalBodyWrapper>
      ),
      [RequestStates.FAILURE]: (
        <ModalBodyWrapper>
          <span> Failed to create a new study. Please try again </span>
        </ModalBodyWrapper>
      )
    };
    return components;
  }

  render() {
    const { isVisible, handleOnCloseModal, requestStates } = this.props;
    return (
      <ActionModal
          isVisible={isVisible}
          onClose={handleOnCloseModal}
          requestState={requestStates[CREATE_STUDY]}
          requestStateComponents={this.requestStateComponents()}
          textPrimary="Create"
          textSecondary="Cancel"
          textTitle="Create Study" />
    );
  }
}

const mapStateToProps = (state :Map) => ({
  requestStates: {
    [CREATE_STUDY]: state.getIn(['studies', CREATE_STUDY, 'requestState'])
  }
});

// $FlowFixMe
export default connect(mapStateToProps)(CreateStudyModal);
