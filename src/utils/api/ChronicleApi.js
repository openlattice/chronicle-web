// @flow

import axios from 'axios';

/*
 * send GET request to chronicle server to get neighbors of participant_id
 * associated by chroncile_user_apps.
 * @param url: chronicle/study/participant/data/<study_id>/<participant_id>/apps
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
const getParticipantAppsUsageData = (url :string) => new Promise<*>((resolve, reject) => {
  axios({
    method: 'get',
    url,
  }).then((result) => resolve(result))
    .catch((error) => reject(error));
});


/* send POST request to update chronicle_used_by associations
 * @param url: chronicle/study/participant/data/<study_id>/<participant_id>/apps
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

const updateAppsUsageAssociationData = (url :string, requestBody :Object) => new Promise<*>((resolve, reject) => {
  axios({
    method: 'post',
    data: requestBody,
    url,
  }).then((result) => resolve(result))
    .catch((error) => reject(error));
});


export {
  getParticipantAppsUsageData,
  updateAppsUsageAssociationData
};
