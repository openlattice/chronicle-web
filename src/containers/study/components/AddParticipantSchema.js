// @flow

import { DataProcessingUtils } from 'lattice-fabricate';

import { PROPERTY_TYPE_FQNS, APP_TYPE_FQNS } from '../../../core/edm/constants/FullyQualifiedNames';

const { PERSON_ID } = PROPERTY_TYPE_FQNS;
const { PERSON_APP_TYPE_FQN } = APP_TYPE_FQNS;

const { getEntityAddressKey, getPageSectionKey } = DataProcessingUtils;

const dataSchema = {
  properties: {
    [getPageSectionKey(1, 1)]: {
      properties: {
        [getEntityAddressKey(0, PERSON_APP_TYPE_FQN, PERSON_ID)]: {
          title: 'Participant ID',
          type: 'string'
        }
      },
      required: [
        getEntityAddressKey(0, PERSON_APP_TYPE_FQN, PERSON_ID)
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
    [getEntityAddressKey(0, PERSON_APP_TYPE_FQN, PERSON_ID)]: {
      classNames: 'column-span-12'
    }
  }
};

export {
  dataSchema,
  uiSchema
};
