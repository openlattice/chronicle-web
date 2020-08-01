// @flow

import { DataProcessingUtils } from 'lattice-fabricate';

import { EATING_ACTIVITY_CONSTS } from '../../constants/SchemaConstants';

const {
  ADULT_MEDIA,
  BG_AUDIO,
  BG_AUDIO_TYPE,
  BG_TV,
  BG_TV_AGE,
  CAREGIVER,
  LOCATION,
  MEDIA,
} = EATING_ACTIVITY_CONSTS;

const { getPageSectionKey } = DataProcessingUtils;

const createSchema = (pageNum :number) => ({
  [getPageSectionKey(pageNum, 1)]: {
    type: 'object',
  }
});


const createUiSchema = (pageNum :number) => ({

})

export {
  createSchema,
  createUiSchema
};
