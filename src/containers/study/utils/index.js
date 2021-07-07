// @flow

const getParticipantLoginLink = (orgId :UUID, studyId :UUID, participantId :string) => {
  const rootUrl = 'https://openlattice.com/chronicle/login';

  return `${rootUrl}?organizationId=${orgId}&studyId=${studyId}&participantId=${participantId}`;
};

const getTimeUseDiaryLink = (orgId :UUID, studyId :UUID, participantId :string) => {
  const rootUrl = 'https://openlattice.com/chronicle/#/time-use-diary';

  return `${rootUrl}?organizationId=${orgId}&studyId=${studyId}&participantId=${participantId}`;
};

const getAppUsageLink = (orgId :UUID, studyId :UUID, participantId :string) => {
  const rootUrl = 'https://openlattice.com/chronicle/#/survey';
  return `${rootUrl}?organizationId=${orgId}&studyId=${studyId}&participantId=${participantId}`;
};

export {
  getAppUsageLink,
  getParticipantLoginLink,
  getTimeUseDiaryLink
};
