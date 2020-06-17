// @flow

import axios from 'axios';

import { getParticipantUserAppsUrl, getQuestionnaireUrl, getSubmitQuestionnaireUrl } from '../AppUtils';

/*
 * `GET chronicle/study/participant/data/<study_id>/<participant_id>/apps`
 *
 * Fetch neighbors of participant_id associated by chroncile_user_apps.
 *
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
function getParticipantAppsUsageData(date :string, participantId :string, studyId :UUID) {
  return new Promise<*>((resolve, reject) => {
    const url = getParticipantUserAppsUrl(participantId, studyId);
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

function updateAppsUsageAssociationData(participantId :string, studyId :UUID, requestBody :Object) {
  return new Promise<*>((resolve, reject) => {

    const url = getParticipantUserAppsUrl(participantId, studyId);
    if (!url) return reject(new Error('Invalid Url'));

    return axios({
      method: 'post',
      data: requestBody,
      url,
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

function getQuestionnaire(studyId :UUID, questionnaireEKID :UUID) {
  return new Promise<*>((resolve, reject) => {
    const url = getQuestionnaireUrl(studyId, questionnaireEKID);
    if (!url) return reject(new Error('Invalid url'));

    return axios({
      method: 'get',
      url
    }).then((result) => resolve(result))
      .catch((error) => reject(error));
  });
}

function submitQuestionnaire(studyId :UUID, participantId :UUID, questionAnswerMapping :Object) {
  return new Promise<*>((resolve, reject) => {
    const url = getSubmitQuestionnaireUrl(studyId, participantId);
    if (!url) return reject(new Error('Invalid url'));

    return axios({
      method: 'post',
      url,
      data: questionAnswerMapping
    }).then((result) => resolve(result))
      .catch((error) => reject(error));
  });
}

export {
  getParticipantAppsUsageData,
  updateAppsUsageAssociationData,
  getQuestionnaire,
  submitQuestionnaire
};
