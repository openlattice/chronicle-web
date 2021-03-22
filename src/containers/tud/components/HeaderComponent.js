// @flow

import React from 'react';

import styled from 'styled-components';
import {
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
  background-color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid ${NEUTRAL.N100};
  padding: 0 32px;
  min-height: 60px;

  a {
    display: flex;
    align-items: center;
    justify-content: center;
    text-decoration: none;
  }

  h1 {
    font-size: 14px;
    font-weight: 600;
    color: ${NEUTRAL.N700};
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
  selectedLanguage :Object;
  onChangeLanguage :(lng :Object) => void;
};

const HeaderComponent = ({
  selectedLanguage,
  onChangeLanguage
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
          value={selectedLanguage}
          onChange={onChangeLanguage}
          options={languageOptions} />
    </Box>
  </Wrapper>
);

export default HeaderComponent;
