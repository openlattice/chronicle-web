// @flow

import { newRequestSequence } from 'redux-reqseq';
import type { RequestSequence } from 'redux-reqseq';

const SUBMIT_TUD_DATA :'SUBMIT_TUD_DATA' = 'SUBMIT_TUD_DATA';
const submitTudData :RequestSequence = newRequestSequence(SUBMIT_TUD_DATA);

const GET_SUBMISSIONS_BY_DATE :'GET_SUBMISSIONS_BY_DATE' = 'GET_SUBMISSIONS_BY_DATE';
const getSubmissionsByDate :RequestSequence = newRequestSequence(GET_SUBMISSIONS_BY_DATE);

const DOWNLOAD_DAILY_TUD_DATA :'DOWNLOAD_DAILY_TUD_DATA' = 'DOWNLOAD_DAILY_TUD_DATA';
const downloadDailyTudData :RequestSequence = newRequestSequence(DOWNLOAD_DAILY_TUD_DATA);

const DOWNLOAD_ALL_TUD_DATA :'DOWNLOAD_ALL_TUD_DATA' = 'DOWNLOAD_ALL_TUD_DATA';
const downloadAllTudData :RequestSequence = newRequestSequence(DOWNLOAD_ALL_TUD_DATA);

const VERIFY_TUD_LINK :'VERIFY_TUD_LINK' = 'VERIFY_TUD_LINK';
const verifyTudLink :RequestSequence = newRequestSequence(VERIFY_TUD_LINK);

export {
  DOWNLOAD_ALL_TUD_DATA,
  DOWNLOAD_DAILY_TUD_DATA,
  GET_SUBMISSIONS_BY_DATE,
  SUBMIT_TUD_DATA,
  VERIFY_TUD_LINK,
  downloadAllTudData,
  downloadDailyTudData,
  getSubmissionsByDate,
  submitTudData,
  verifyTudLink,
};
