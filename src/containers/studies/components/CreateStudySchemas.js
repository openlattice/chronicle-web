/*
 * @flow
 */

import { Constants } from 'lattice';
import { DataProcessingUtils } from 'lattice-fabricate';
import { v4 as uuid } from 'uuid';

import { STUDIES } from '../../../core/edm/constants/CollectionTemplateNames';
import { PROPERTY_TYPE_FQNS } from '../../../core/edm/constants/FullyQualifiedNames';

const { getEntityAddressKey, getPageSectionKey } = DataProcessingUtils;
const { OPENLATTICE_ID_FQN } = Constants;
const {
  STUDY_DESCRIPTION,
  STUDY_EMAIL,
  STUDY_GROUP,
  STUDY_ID,
  FULL_NAME_FQN,
  STUDY_VERSION,
  NOTIFICATION_ENABLED
} = PROPERTY_TYPE_FQNS;

const dataSchema = {
  properties: {
    [getPageSectionKey(1, 1)]: {
      properties: {
        [getEntityAddressKey(0, STUDIES, FULL_NAME_FQN)]: {
          title: 'Study Name',
          type: 'string'
        },
        [getEntityAddressKey(0, STUDIES, STUDY_DESCRIPTION)]: {
          title: 'Description',
          type: 'string'
        },
        [getEntityAddressKey(0, STUDIES, STUDY_GROUP)]: {
          title: 'Study Group',
          type: 'string'
        },
        [getEntityAddressKey(0, STUDIES, STUDY_VERSION)]: {
          title: 'Study Version',
          type: 'string'
        },
        [getEntityAddressKey(0, STUDIES, STUDY_EMAIL)]: {
          title: 'Contact Email',
          type: 'string'
        },

        [getEntityAddressKey(0, STUDIES, STUDY_ID)]: {
          title: '',
          type: 'string',
          default: uuid()
        },
        [getEntityAddressKey(0, STUDIES, OPENLATTICE_ID_FQN)]: {
          title: '',
          type: 'string'
        },
        [getEntityAddressKey(0, STUDIES, NOTIFICATION_ENABLED)]: {
          title: 'Enable daily notifications',
          type: 'boolean'
        },
      },
      required: [
        getEntityAddressKey(0, STUDIES, FULL_NAME_FQN),
        getEntityAddressKey(0, STUDIES, STUDY_EMAIL)
      ],
      type: 'object',
      title: ''
    },
  },
  type: 'object',
  title: ''
};

const uiSchema = {
  [getPageSectionKey(1, 1)]: {
    classNames: 'column-span-12 grid-container',
    [getEntityAddressKey(0, STUDIES, FULL_NAME_FQN)]: {
      classNames: 'column-span-12'
    },
    [getEntityAddressKey(0, STUDIES, STUDY_DESCRIPTION)]: {
      classNames: 'column-span-12',
      'ui:widget': 'textarea'
    },
    [getEntityAddressKey(0, STUDIES, STUDY_GROUP)]: {
      classNames: 'column-span-6'
    },
    [getEntityAddressKey(0, STUDIES, STUDY_VERSION)]: {
      classNames: 'column-span-6'
    },
    [getEntityAddressKey(0, STUDIES, STUDY_EMAIL)]: {
      classNames: 'column-span-12'
    },
    [getEntityAddressKey(0, STUDIES, STUDY_ID)]: {
      classNames: 'hidden'
    },
    [getEntityAddressKey(0, STUDIES, OPENLATTICE_ID_FQN)]: {
      classNames: 'hidden'
    },
    [getEntityAddressKey(0, STUDIES, NOTIFICATION_ENABLED)]: {
      classNames: 'column-span-12'
    }
  },
};

export { dataSchema, uiSchema };
