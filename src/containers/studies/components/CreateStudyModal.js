/*
 * @flow
 */
import React, { Component } from 'react';

import styled from 'styled-components';
import { Map } from 'immutable';
import {
  Modal
} from 'lattice-ui-kit';
import { connect } from 'react-redux';
import { RequestStates } from 'redux-reqseq';
import type { RequestState } from 'redux-reqseq';

import CreateStudyForm from './CreateStudyForm';

import { CREATE_STUDY } from '../StudiesActions';

type Props = {
  isVisible :boolean;
  handleOnCloseModal :Function;
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

  resetFormData = () => {
    this.setState({
      data: { ...initialFormDataState }
    });
    // TODO : decide if to cancel if still submitting
  }

  handleOnSubmit = ({ formData } :Object) => {
    // this is where we submit data;
    // need to maintain state of the data what data to displ
    // need to dispatch an action to submit the data
    console.log(formData);
    this.setState({
      isSubmitting: true
    });
  }
  getRequestStateComponents = () => {
    const { requestStates } = this.props;
    const { data, isSubmitting } = this.state;
    switch (requestStates[CREATE_STUDY]) {
      case RequestStates.PENDING:
      case RequestStates.STANDBY:
        return (
          <ModalBodyWrapper>
            <CreateStudyForm
                formData={data}
                handleOnChange={this.handleOnChange}
                handleOnSubmit={this.handleOnSubmit}
                isSubmitting={isSubmitting}
                resetData={this.resetFormData} />
          </ModalBodyWrapper>
        );
      case RequestStates.FAILURE:
        return (
          <ModalBodyWrapper>
            <span> Failed to create a new study. Please try again </span>
          </ModalBodyWrapper>
        );
      default:
        return null;
    }
  }

  render() {
    const { isVisible, handleOnCloseModal } = this.props;
    return (
      <Modal
          isVisible={isVisible}
          onClose={handleOnCloseModal}
          textTitle="Create Study">
        {this.getRequestStateComponents()}
      </Modal>
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
