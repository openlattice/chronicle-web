// @flow

import { newRequestSequence } from 'redux-reqseq';
import type { RequestSequence } from 'redux-reqseq';

const SUBMIT_TUD_DATA :'SUBMIT_TUD_DATA' = 'SUBMIT_TUD_DATA';
const submitTudData :RequestSequence = newRequestSequence(SUBMIT_TUD_DATA);

const GET_SUBMISSIONS_BY_DATE :'GET_SUBMISSIONS_BY_DATE' = 'GET_SUBMISSIONS_BY_DATE';
const getSubmissionsByDate :RequestSequence = newRequestSequence(GET_SUBMISSIONS_BY_DATE);

const DOWNLOAD_TUD_DATA :'DOWNLOAD_TUD_DATA' = 'DOWNLOAD_TUD_DATA';
const downloadTudData :RequestSequence = newRequestSequence(DOWNLOAD_TUD_DATA);

const DOWNLOAD_ALL_DATA :'DOWNLOAD_ALL_DATA' = 'DOWNLOAD_ALL_DATA';
const downloadAllData :RequestSequence = newRequestSequence(DOWNLOAD_ALL_DATA);

export {
  DOWNLOAD_ALL_DATA,
  DOWNLOAD_TUD_DATA,
  GET_SUBMISSIONS_BY_DATE,
  SUBMIT_TUD_DATA,
  downloadAllData,
  downloadTudData,
  getSubmissionsByDate,
  submitTudData,
};
