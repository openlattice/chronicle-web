// @flow

import { DataProcessingUtils } from 'lattice-fabricate';

import { PARTICIPANTS } from '../../../core/edm/constants/EntityTemplateNames';
import { PROPERTY_TYPE_FQNS } from '../../../core/edm/constants/FullyQualifiedNames';

const { PERSON_ID } = PROPERTY_TYPE_FQNS;

const { getEntityAddressKey, getPageSectionKey } = DataProcessingUtils;

const dataSchema = {
  properties: {
    [getPageSectionKey(1, 1)]: {
      properties: {
        [getEntityAddressKey(0, PARTICIPANTS, PERSON_ID)]: {
          title: 'Participant ID',
          type: 'string'
        }
      },
      required: [
        getEntityAddressKey(0, PARTICIPANTS, PERSON_ID)
      ],
      title: '',
      type: 'object'
    }
  },
  title: '',
  type: 'object'
};

const uiSchema = {
  [getPageSectionKey(1, 1)]: {
    classNames: 'column-span-12 grid-container',
    [getEntityAddressKey(0, PARTICIPANTS, PERSON_ID)]: {
      classNames: 'column-span-12'
    }
  }
};

export {
  dataSchema,
  uiSchema
};
