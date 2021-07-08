// @flow

const getBaseUrl = () => (
  window.location.href.split('#')[0]
);

const getParticipantLoginLink = (orgId :UUID, studyId :UUID, participantId :string) => {
  const rootUrl = 'https://openlattice.com/chronicle/login';

  return `${rootUrl}?organizationId=${orgId}&studyId=${studyId}&participantId=${participantId}`;
};

const getTimeUseDiaryLink = (orgId :UUID, studyId :UUID, participantId :string) => (
  `${getBaseUrl()}#/time-use-diary`
  + `?organizationId=${orgId}`
  + `&studyId=${studyId}&participantId=${participantId}`
);

const getAppUsageLink = (orgId :UUID, studyId :UUID, participantId :string) => (
  `${getBaseUrl()}#/survey`
  + `?organizationId=${orgId}`
  + `&studyId=${studyId}&participantId=${participantId}`
);

export {
  getAppUsageLink,
  getParticipantLoginLink,
  getTimeUseDiaryLink
};
