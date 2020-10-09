// @flow

import React from 'react';
import { faQuestionCircle } from '@fortawesome/pro-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button, Colors } from 'lattice-ui-kit';
import styled from 'styled-components';

const { NEUTRAL } = Colors;

const ButtonWrapper = styled(Button)`
  bottom: 16px;
  position: fixed;
  right: 16px;
  width: 200px;
`;

const StyledIcon = styled(FontAwesomeIcon)`
  font-size: 15px;
`;

const ContactSupportButton = () => (
  <ButtonWrapper
      href="https://support.openlattice.com/servicedesk/customer/portal/1"
      startIcon={<StyledIcon color={NEUTRAL.N900} fixedWidth icon={faQuestionCircle} />}
      target="_blank"
      variant="outlined">
    Contact Support
  </ButtonWrapper>
);

export default ContactSupportButton;
