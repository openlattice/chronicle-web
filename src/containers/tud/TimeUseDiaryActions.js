// @flow

import { newRequestSequence } from 'redux-reqseq';
import type { RequestSequence } from 'redux-reqseq';

const SUBMIT_TUD_DATA :'SUBMIT_TUD_DATA' = 'SUBMIT_TUD_DATA';
const submitTudData :RequestSequence = newRequestSequence(SUBMIT_TUD_DATA);

export {
  SUBMIT_TUD_DATA,
  submitTudData
};
