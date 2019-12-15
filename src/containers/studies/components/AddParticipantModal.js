// @flow
import React from 'react';

import { ActionModal } from 'lattice-ui-kit';

type Props = {
  isVisible :boolean;
  onCloseModal :() => void;
  studyId :string; // needs to be UUID?
}

const AddParticipantModal = (props :Props) => {
  const { isVisible, studyId, onCloseModal } = props;

  return (
    <ActionModal
        isVisible={isVisible}
        onClose={onCloseModal}
        shouldCloseOnEscape={false}
        shouldCloseOnOutsideClick={false}
        textPrimary="Create"
        textSecondary="Cancel"
        textTitle="Add Participant" />
  );
};

const mapStateToProps = (state) => ({
  
})
export default AddParticipantModal;
