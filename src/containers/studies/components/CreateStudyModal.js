/*
 * @flow
 */
import React, { Component } from 'react';

import {
  ActionModal
} from 'lattice-ui-kit';

type Props = {
  isVisible :boolean;
  handleOnCloseModal :Function;
};

class CreateStudyModal extends Component<Props> {
  componentDidMount() {

  }
  handleOnCreateStudy = () => {

  }
  render() {
    const { isVisible, handleOnCloseModal } = this.props;
    return (
      <ActionModal
          onClickPrimary={this.handleOnCreateStudy}
          onClose={handleOnCloseModal}
          textPrimary="Create"
          textSecondary="Cancel"
          textTitle="New Study"
          isVisible={isVisible} />
    );
  }
}
export default CreateStudyModal;
