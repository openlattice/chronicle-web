// @flow

const getParticipantLoginLink = (studyId :UUID, participantId :UUID) => {
  const rootUrl = 'https://openlattice.com/chronicle/login?studyId=';
  return `${rootUrl}${studyId}&participantId=${participantId}`;
};

const getParticipantsEntitySetName = (studyId :UUID) => {
  const participantsPrefix = 'chronicle_participants_';
  return `${participantsPrefix}${studyId}`;
};

export {
  getParticipantLoginLink,
  getParticipantsEntitySetName
};
