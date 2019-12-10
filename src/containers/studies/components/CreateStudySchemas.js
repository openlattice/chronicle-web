import { DataProcessingUtils } from 'lattice-fabricate';

import { PROPERTY_TYPE_FQNS } from '../../../core/edm/constants/FullyQualifiedNames';

const { getEntityAddressKey, getPageSectionKey } = DataProcessingUtils;
const {
  STUDY_EMAIL,
  STUDY_ID,
  STUDY_NAME,
  STUDY_DESCRIPTION,
  STUDY_GROUP,
  STUDY_VERSION
} = PROPERTY_TYPE_FQNS;

const dataSchema = {
  properties: {
    [getPageSectionKey(1, 1)]: {
      properties: {
        [getEntityAddressKey(0, STUDY_ID, STUDY_NAME)]: {
          title: 'Study Name',
          type: 'string'
        },
        [getEntityAddressKey(0, STUDY_ID, STUDY_DESCRIPTION)]: {
          title: 'Description',
          type: 'string'
        },
        [getEntityAddressKey(0, STUDY_ID, STUDY_GROUP)]: {
          title: 'Study Group',
          type: 'string'
        },
        [getEntityAddressKey(0, STUDY_ID, STUDY_VERSION)]: {
          title: 'Study Version',
          type: 'string'
        },
        [getEntityAddressKey(0, STUDY_ID, STUDY_EMAIL)]: {
          title: 'Contact Email',
          type: 'string'
        }
      },
      type: 'object',
      title: ''
    }
  },
  type: 'object',
  title: ''
};

const uiSchema = {
  [getPageSectionKey(1, 1)]: {
    classNames: 'column-span-12 grid-container',
    [getEntityAddressKey(0, STUDY_ID, STUDY_NAME)]: {
      classNames: 'column-span-12'
    },
    [getEntityAddressKey(0, STUDY_ID, STUDY_DESCRIPTION)]: {
      classNames: 'column-span-12'
    },
    [getEntityAddressKey(0, STUDY_ID, STUDY_GROUP)]: {
      classNames: 'column-span-12'
    },
    [getEntityAddressKey(0, STUDY_ID, STUDY_VERSION)]: {
      classNames: 'column-span-12'
    },
    [getEntityAddressKey(0, STUDY_ID, STUDY_EMAIL)]: {
      classNames: 'column-span-12'
    },
  }
};

export {
  dataSchema,
  uiSchema
};
