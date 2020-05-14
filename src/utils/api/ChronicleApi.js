// @flow

import axios from 'axios';

import { getParticipantUserAppsUrl } from '../AppUtils';

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


export {
  getParticipantAppsUsageData,
  updateAppsUsageAssociationData
};
