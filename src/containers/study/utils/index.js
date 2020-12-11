// @flow

const getParticipantLoginLink = (orgId :UUID, studyId :UUID, participantId :UUID) => {
  const rootUrl = 'https://openlattice.com/chronicle/login';

  return `${rootUrl}?organizationId=${orgId}&studyId=${studyId}&participantId=${participantId}`;
};

const getTimeUseDiaryLink = (orgId :UUID, studyId :UUID, participantId :UUID) => {
  const rootUrl = 'https://openlattice.com/chronicle/#/time-use-diary';

  return `${rootUrl}?organizationId=${orgId}&studyId=${studyId}&participantId=${participantId}`;
};

/* eslint-disable import/prefer-default-export */
export {
  getParticipantLoginLink,
  getTimeUseDiaryLink
};
/* eslint-enable */
