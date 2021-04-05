// @flow

import React from 'react';

import styled from 'styled-components';
import {
  // $FlowFixMe
  Box,
  Colors,
  Select,
  StyleUtils,
  Typography
} from 'lattice-ui-kit';

import OpenLatticeIcon from '../../../assets/images/ol_icon.png';
import SUPPORTED_LANGUAGES from '../constants/SupportedLanguages';

const languageOptions = SUPPORTED_LANGUAGES.map((lng) => ({ value: lng.code, label: lng.language }));

const { media } = StyleUtils;

const { NEUTRAL } = Colors;

const Wrapper = styled.div`
  align-items: center;
  background-color: #fff;
  border-bottom: 1px solid ${NEUTRAL.N100};
  display: flex;
  justify-content: space-between;
  min-height: 60px;
  padding: 0 32px;

  a {
    align-items: center;
    display: flex;
    justify-content: center;
    text-decoration: none;
  }

  h1 {
    color: ${NEUTRAL.N700};
    font-size: 14px;
    font-weight: 600;
  }

  img {
    height: 26px;
    margin-right: 10px;
  }

  ${media.phone`
      padding: 0 20px;
  `}
`;

type Props = {
  onChangeLanguage :(lng :Object) => void;
  selectedLanguage :Object;
};

const HeaderComponent = ({
  onChangeLanguage,
  selectedLanguage,
} :Props) => (
  <Wrapper>
    <nav>
      <a href={window.location.href}>
        <img src={OpenLatticeIcon} alt="OpenLattice Icon" />
        <Typography variant="h1"> Chronicle </Typography>
      </a>
    </nav>
    <Box minWidth="200px">
      <Select
          onChange={onChangeLanguage}
          options={languageOptions}
          value={selectedLanguage} />
    </Box>
  </Wrapper>
);

export default HeaderComponent;
