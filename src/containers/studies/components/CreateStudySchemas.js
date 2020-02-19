/*
 * @flow
 */

import { Constants } from 'lattice';
import { DataProcessingUtils } from 'lattice-fabricate';

import { ENTITY_SET_NAMES } from '../../../core/edm/constants/EntitySetNames';
import { PROPERTY_TYPE_FQNS } from '../../../core/edm/constants/FullyQualifiedNames';
import { getNotificationsEntitySetName } from '../../../utils/NotificationsUtils';

const { getEntityAddressKey, getPageSectionKey } = DataProcessingUtils;
const { OPENLATTICE_ID_FQN } = Constants;
const {
  STUDY_DESCRIPTION,
  STUDY_EMAIL,
  STUDY_GROUP,
  STUDY_ID,
  STUDY_NAME,
  STUDY_VERSION,
  NOTIFICATION_DESCRIPTION
} = PROPERTY_TYPE_FQNS;
const { CHRONICLE_STUDIES } = ENTITY_SET_NAMES;

const getFormSchema = (studyId :UUID) => {
  const notificationEntitySetName = getNotificationsEntitySetName(studyId);

  const dataSchema = {
    properties: {
      [getPageSectionKey(1, 1)]: {
        properties: {
          [getEntityAddressKey(0, CHRONICLE_STUDIES, STUDY_NAME)]: {
            title: 'Study Name',
            type: 'string'
          },
          [getEntityAddressKey(0, CHRONICLE_STUDIES, STUDY_DESCRIPTION)]: {
            title: 'Description',
            type: 'string'
          },
          [getEntityAddressKey(0, CHRONICLE_STUDIES, STUDY_GROUP)]: {
            title: 'Study Group',
            type: 'string'
          },
          [getEntityAddressKey(0, CHRONICLE_STUDIES, STUDY_VERSION)]: {
            title: 'Study Version',
            type: 'string'
          },
          [getEntityAddressKey(0, CHRONICLE_STUDIES, STUDY_EMAIL)]: {
            title: 'Contact Email',
            type: 'string'
          },

          [getEntityAddressKey(0, CHRONICLE_STUDIES, STUDY_ID)]: {
            title: '',
            type: 'string'
          },
          [getEntityAddressKey(0, CHRONICLE_STUDIES, OPENLATTICE_ID_FQN)]: {
            title: '',
            type: 'string'
          },
          [getEntityAddressKey(0, notificationEntitySetName, NOTIFICATION_DESCRIPTION)]: {
            title: 'Enable daily notifications',
            type: 'boolean'
          },
        },
        required: [
          getEntityAddressKey(0, CHRONICLE_STUDIES, STUDY_NAME),
          getEntityAddressKey(0, CHRONICLE_STUDIES, STUDY_EMAIL)
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
      [getEntityAddressKey(0, CHRONICLE_STUDIES, STUDY_NAME)]: {
        classNames: 'column-span-12'
      },
      [getEntityAddressKey(0, CHRONICLE_STUDIES, STUDY_DESCRIPTION)]: {
        classNames: 'column-span-12',
        'ui:widget': 'textarea'
      },
      [getEntityAddressKey(0, CHRONICLE_STUDIES, STUDY_GROUP)]: {
        classNames: 'column-span-12'
      },
      [getEntityAddressKey(0, CHRONICLE_STUDIES, STUDY_VERSION)]: {
        classNames: 'column-span-12'
      },
      [getEntityAddressKey(0, CHRONICLE_STUDIES, STUDY_EMAIL)]: {
        classNames: 'column-span-12'
      },
      [getEntityAddressKey(0, CHRONICLE_STUDIES, STUDY_ID)]: {
        classNames: 'hidden'
      },
      [getEntityAddressKey(0, CHRONICLE_STUDIES, OPENLATTICE_ID_FQN)]: {
        classNames: 'hidden'
      },
      [getEntityAddressKey(0, notificationEntitySetName, NOTIFICATION_DESCRIPTION)]: {
        classNames: 'column-span-12'
      }
    },
  };

  return { dataSchema, uiSchema };
};

export default getFormSchema;
