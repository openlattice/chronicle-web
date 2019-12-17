// @flow

import { DataProcessingUtils } from 'lattice-fabricate';
import type { FQN } from 'lattice';

import { ENTITY_SET_NAMES } from '../../../core/edm/constants/EntitySetNames';
import { PROPERTY_TYPE_FQNS } from '../../../core/edm/constants/FullyQualifiedNames';

const { getEntityAddressKey, getPageSectionKey } = DataProcessingUtils;
const { CHRONICLE_STUDIES } = ENTITY_SET_NAMES;
const {
  STUDY_DESCRIPTION,
  STUDY_EMAIL,
  STUDY_GROUP,
  STUDY_NAME,
  STUDY_VERSION
} = PROPERTY_TYPE_FQNS;

const entityTitleMap = {
  [STUDY_DESCRIPTION.toString()]: 'Edit Study Description',
  [STUDY_EMAIL.toString()]: 'Edit Email',
  [STUDY_GROUP.toString()]: 'Edit Study Group',
  [STUDY_NAME.toString()]: 'Edit Study Name',
  [STUDY_VERSION.toString()]: 'Edit Version',
};

const getFormSchema = (propertyTypeFqn :FQN) => {

  const dataSchema = {
    properties: {
      [getPageSectionKey(1, 1)]: {
        properties: {
          [getEntityAddressKey(0, CHRONICLE_STUDIES, propertyTypeFqn)]: {
            title: entityTitleMap[propertyTypeFqn.toString()],
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
      [getEntityAddressKey(0, CHRONICLE_STUDIES, propertyTypeFqn)]: {
        classNames: 'column-span-12',
        'ui:widget': propertyTypeFqn === STUDY_DESCRIPTION ? 'textarea' : 'text'
      }
    }
  };

  return { dataSchema, uiSchema };
};

export default getFormSchema;
