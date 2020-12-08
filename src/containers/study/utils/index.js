// @flow

const getParticipantLoginLink = (orgId :UUID, studyId :UUID, participantId :UUID) => {
  const rootUrl = 'https://openlattice.com/chronicle/login';

  return `${rootUrl}?organizationId=${orgId}&studyId=${studyId}&participantId=${participantId}`;
};

/* eslint-disable import/prefer-default-export */
export {
  getParticipantLoginLink
};
/* eslint-enable */
