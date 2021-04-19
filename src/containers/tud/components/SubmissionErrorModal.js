// @flow

import React from 'react';

// $FlowFixMe
import { Box, Modal, Typography } from 'lattice-ui-kit';
import TranslationKeys from '../constants/TranslationKeys';

type Props = {
  handleOnClose :() => void;
  isVisible :boolean;
  trans :(string, ?Object) => string;
}
const SubmissionErrorModal = ({
  handleOnClose,
  isVisible,
  trans,
} :Props) => (
  <Modal
      isVisible={isVisible}
      onClose={handleOnClose}
      shouldCloseOnEscape={false}
      shouldCloseOnOutsideClick={false}
      onClickSecondary={handleOnClose}
      textSecondary={trans(TranslationKeys.BTN_CLOSE)}
      textTitle={trans(TranslationKeys.SUBMISSION_ERROR_TITLE)}>
    <Box maxWidth="600px">
      <Typography gutterBottom>{trans(TranslationKeys.ERROR_SUBMIT)}</Typography>
    </Box>
  </Modal>
);

export default SubmissionErrorModal;
