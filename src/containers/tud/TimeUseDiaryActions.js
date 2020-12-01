// @flow

import { newRequestSequence } from 'redux-reqseq';
import type { RequestSequence } from 'redux-reqseq';

const SUBMIT_TUD_DATA :'SUBMIT_TUD_DATA' = 'SUBMIT_TUD_DATA';
const submitTudData :RequestSequence = newRequestSequence(SUBMIT_TUD_DATA);

const GET_SUBMISSIONS_BY_DATE :'GET_SUBMISSIONS_BY_DATE' = 'GET_SUBMISSIONS_BY_DATE';
const getSubmissionsByDate :RequestSequence = newRequestSequence(GET_SUBMISSIONS_BY_DATE);

const DOWNLOAD_TUD_RESPONSES :'DOWNLOAD_TUD_RESPONSES' = 'DOWNLOAD_TUD_RESPONSES';
const downloadTudResponses :RequestSequence = newRequestSequence(DOWNLOAD_TUD_RESPONSES);

export {
  DOWNLOAD_TUD_RESPONSES,
  GET_SUBMISSIONS_BY_DATE,
  SUBMIT_TUD_DATA,
  downloadTudResponses,
  getSubmissionsByDate,
  submitTudData,
};
