// @flow

import { DataProcessingUtils } from 'lattice-fabricate';

const { getPageSectionKey } = DataProcessingUtils;

export default function createSchema(schemaProperties :Object, uiSchemaOptions :Object) {

  const schema = {
    title: '',
    type: 'object',
    properties: {
      [getPageSectionKey(1, 1)]: {
        title: '',
        type: 'object',
        properties: {
          ...schemaProperties
        },
        required: Object.keys(schemaProperties)
      }
    }
  };

  const uiSchema = {
    [getPageSectionKey(1, 1)]: {
      classNames: 'column-span-12 grid-container',
      ...uiSchemaOptions
    }
  };

  return { schema, uiSchema };
}
