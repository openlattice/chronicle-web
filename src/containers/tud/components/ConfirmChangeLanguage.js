// @flow

import React from 'react';

// $FlowFixMe
import { Box, Modal, Typography } from 'lattice-ui-kit';
import TranslationKeys from '../constants/TranslationKeys';

type Props = {
  handleOnClose :() => void;
  handleOnConfirmChange :() => void;
  isVisible :boolean;
  trans :(string, ?Object) => string;
}
const ConfirmChangeLanguage = ({
  handleOnClose,
  handleOnConfirmChange,
  isVisible,
  trans,
} :Props) => (
  <Modal
      isVisible={isVisible}
      onClose={handleOnClose}
      shouldCloseOnEscape={false}
      shouldCloseOnOutsideClick={false}
      onClickPrimary={handleOnConfirmChange}
      onClickSecondary={handleOnClose}
      textPrimary={trans(TranslationKeys.CHANGE_LANGUAGE)}
      textSecondary={trans(TranslationKeys.BTN_CANCEL)}
      textTitle={trans(TranslationKeys.CHANGE_LANGUAGE)}>
    <Box maxWidth="600px">
      <Typography gutterBottom>{trans(TranslationKeys.CHANGE_LANGUAGE_WARNING)}</Typography>
    </Box>
  </Modal>
);

export default ConfirmChangeLanguage;
