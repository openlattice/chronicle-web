// @flow

import axios from 'axios';
import { Types } from 'lattice';
import { AuthUtils } from 'lattice-auth';

import {
  getAppSettingsUrl,
  getDeleteParticipantPath,
  getDeleteStudyUrl,
  getEnrollmentStatusUrl,
  getParticipantUserAppsUrl,
  getQuestionnaireUrl,
  getSubmitQuestionnaireUrl,
  getSubmitTudDataUrl
} from '../AppUtils';
import { CHRONICLE_CORE, DATA_COLLECTION, QUESTIONNAIRES } from '../constants/AppModules';

const { DeleteTypes } = Types;

const CAFE_ORG_ID :UUID = '7349c446-2acc-4d14-b2a9-a13be39cff93';

/*
 * `GET chronicle/study/participant/data/<study_id>/<participant_id>/apps`
 *
 * Fetch neighbors of participant_id associated by chroncile_user_apps.
 *s
 * response data:
      [
        {
          entityDetails: {
            FQN1: [value1],
            FQN2: [value2]
         },
         associationDetails: {
            FQN3: [value3],
            FQN4: [value4]
         },
        }
      ]
 */
function getParticipantAppsUsageData(date :string, participantId :string, studyId :UUID, orgId :UUID = CAFE_ORG_ID) {
  return new Promise<*>((resolve, reject) => {
    const url = getParticipantUserAppsUrl(participantId, studyId, orgId);
    if (!url) return reject(new Error('Invalid Url'));

    return axios({
      method: 'get',
      params: { date },
      url,
    }).then((result) => resolve(result))
      .catch((error) => reject(error));
  });
}

/*
 * `POST chronicle/study/participant/data/<study_id>/<participant_id>/apps`
 *
 * Update chronicle_used_by associations with app user type (parent, child, parent_and_child)
 *
 *
 * requestBody:
    {
      EKID_1: {
        FQN1: [value1],
        FQN2: [value2]
      },
      EKID_1: {
        FQN1: [value3],
        FQN2: [value4]
      },
    }
 */

function updateAppsUsageAssociationData(
  organizationId :UUID = CAFE_ORG_ID, studyId :UUID, participantId :string, requestBody :Object
) {
  return new Promise<*>((resolve, reject) => {

    const url = getParticipantUserAppsUrl(participantId, studyId, organizationId);
    if (!url) return reject(new Error('Invalid Url'));

    return axios({
      method: 'post',
      data: requestBody,
      url,
    }).then((result) => resolve(result))
      .catch((error) => reject(error));
  });
}

// delete a participant and neighbors
function deleteStudyParticipant(orgId :UUID = CAFE_ORG_ID, participantId :string, studyId :UUID) {
  return new Promise<*>((resolve, reject) => {

    const url = getDeleteParticipantPath(orgId, participantId, studyId);
    if (!url) return reject(new Error('Invalid Url'));

    const authToken = AuthUtils.getAuthToken() ?? '';

    return axios({
      method: 'delete',
      url,
      headers: { Authorization: `Bearer ${authToken}` },
      params: { type: DeleteTypes.HARD }
    }).then((result) => resolve(result))
      .catch((error) => reject(error));
  });
}

/*
 * 'GET chronicle/study/<studyId>/questionnaire/<questionnaireEKID>'
 *
 * Retrieve questionnaire details and associated questions
 * response data:
   {
     questionnaireDetails: {
       FQN1: [value1],
       FQN2: [value2]
     },
     questions: [
        {
          FQN3 [value]
          FQN4: [value]
        }
     ]
   }
 */
function getQuestionnaire(orgId :UUID = CAFE_ORG_ID, studyId :UUID, questionnaireEKID :UUID) {
  return new Promise<*>((resolve, reject) => {
    const url = getQuestionnaireUrl(orgId, studyId, questionnaireEKID);
    if (!url) return reject(new Error('Invalid url'));

    return axios({
      method: 'get',
      url
    }).then((result) => resolve(result))
      .catch((error) => reject(error));
  });
}

function submitQuestionnaire(
  orgId :UUID = CAFE_ORG_ID, studyId :UUID, participantId :UUID, questionAnswerMapping :Object
) {
  return new Promise<*>((resolve, reject) => {
    const url = getSubmitQuestionnaireUrl(orgId, studyId, participantId);
    if (!url) return reject(new Error('Invalid url'));

    return axios({
      method: 'post',
      url,
      data: questionAnswerMapping
    }).then((result) => resolve(result))
      .catch((error) => reject(error));
  });
}

/*
 * POST chronicle/study/<studyId>/<participantId>/time-use-diary
 *
 * Submit time use diary survey data
 */
function submitTudData(organizationId :UUID, studyId :UUID, participantId :string, requestBody :Object) {
  return new Promise<*>((resolve, reject) => {
    const url = getSubmitTudDataUrl(organizationId, studyId, participantId);
    if (!url) return reject(new Error('Invalid url'));

    return axios({
      data: requestBody,
      method: 'post',
      url,
    }).then((result) => resolve(result))
      .catch((error) => reject(error));
  });
}

function deleteStudy(orgId :UUID, studyId :UUID) {
  return new Promise<*>((resolve, reject) => {

    const url = getDeleteStudyUrl(orgId, studyId);
    if (!url) return reject(new Error('Invalid url'));

    const authToken = AuthUtils.getAuthToken() || '';

    return axios({
      headers: { Authorization: `Bearer ${authToken}` },
      method: 'delete',
      params: { type: DeleteTypes.HARD },
      url,
    }).then((result) => resolve(result))
      .catch((error) => reject(error));
  });
}

function verifyTudLink(organizationId :UUID, studyId :UUID, participantId :string) {
  return new Promise<*>((resolve, reject) => {
    const url = getEnrollmentStatusUrl(organizationId, studyId, participantId);

    if (!url) return reject(new Error('Invalid url'));

    return axios({
      method: 'get',
      url
    }).then((result) => resolve(result))
      .catch((error) => reject(error));
  });
}

function getAppSettings(organizationId :UUID, appName :string) {
  return new Promise<*>((resolve, reject) => {
    const chronicleApps = new Set([CHRONICLE_CORE, DATA_COLLECTION, QUESTIONNAIRES]);
    if (!chronicleApps.has(appName)) {
      return reject(new Error(`${appName} is not a valid chronicle app`));
    }
    const url = getAppSettingsUrl(organizationId);
    if (!url) return reject(new Error('invalid url'));

    return axios({
      method: 'get',
      url,
      params: { appName }
    }).then((result) => resolve(result))
      .catch((error) => reject(error));
  });
}

export {
  deleteStudy,
  deleteStudyParticipant,
  getAppSettings,
  getParticipantAppsUsageData,
  getQuestionnaire,
  submitQuestionnaire,
  submitTudData,
  updateAppsUsageAssociationData,
  verifyTudLink,
};
