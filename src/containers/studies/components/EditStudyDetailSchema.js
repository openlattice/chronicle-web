// @flow
import { DataProcessingUtils } from 'lattice-fabricate';
import { Models } from 'lattice';

import { ENTITY_SET_NAMES } from '../../../core/edm/constants/EntitySetNames';
import { PROPERTY_TYPE_FQNS } from '../../../core/edm/constants/FullyQualifiedNames';

const { STUDY_DESCRIPTION } = PROPERTY_TYPE_FQNS;
const { getPageSectionKey, getEntityAddressKey } = DataProcessingUtils;
const { CHRONICLE_STUDIES } = ENTITY_SET_NAMES;

const { FullyQualifiedName } = Models;

const getFormSchema = (propertyTypeFqn :FullyQualifiedName) => {

  const dataSchema = {
    properties: {
      [getPageSectionKey(1, 1)]: {
        properties: {
          [getEntityAddressKey(0, CHRONICLE_STUDIES, propertyTypeFqn)]: {
            title: '',
            type: 'string'
          },
          title: '',
          type: 'object'
        }
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
      }
    }
  };
  return { uiSchema, dataSchema };
};

export default getFormSchema;
