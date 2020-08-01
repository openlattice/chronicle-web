// @flow

import { DataProcessingUtils } from 'lattice-fabricate';

const { getPageSectionKey } = DataProcessingUtils;

const createSchema = (pageNum :number) => ({
  [getPageSectionKey(pageNum, 1)]: {
    type: 'object',
    title: '',
    properties: {

    }
  }
});

const createUiSchema = (pageNum :number) => ({
  [getPageSectionKey(pageNum, 1)]: {
    classNames: 'column-span-12 grid-container'
  }
});

export {
  createSchema,
  createUiSchema
};
