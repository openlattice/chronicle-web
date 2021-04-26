// @flow

import React from 'react';

import { Typography } from 'lattice-ui-kit';
import { useTranslation } from 'react-i18next';

import TranslationKeys from '../constants/TranslationKeys';

const SurveyIntro = () => {
  const { t } = useTranslation();

  return (
    <Typography gutterBottom variant="body2">
      {t(TranslationKeys.INTRO_TEXT)}
    </Typography>
  );
};

export default SurveyIntro;
