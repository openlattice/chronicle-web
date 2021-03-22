// @flow

import { DataProcessingUtils } from 'lattice-fabricate';

import TranslationKeys from '../constants/TranslationKeys';
import { PROPERTY_CONSTS } from '../constants/SchemaConstants';

const { getPageSectionKey } = DataProcessingUtils;
const { CLOCK_FORMAT } = PROPERTY_CONSTS;

const createSchema = (trans :(string, ?Object) => void) => ({
  type: 'object',
  title: '',
  properties: {
    [getPageSectionKey(0, 0)]: {
      type: 'object',
      title: '',
      properties: {
        [CLOCK_FORMAT]: {
          title: trans(TranslationKeys.CHOOSE_FORMAT),
          type: 'number',
          enum: [12, 24],
          enumNames: trans(TranslationKeys.CLOCK_FORMATS, { returnObjects: true }),
          default: 12
        },
      },
      required: [CLOCK_FORMAT]
    }
  }
});

const uiSchema = {
  [getPageSectionKey(0, 0)]: {
    classNames: 'column-span-12 grid-container',
    [CLOCK_FORMAT]: {
      classNames: 'column-span-12',
    },
  }
};

export {
  createSchema,
  uiSchema
};
