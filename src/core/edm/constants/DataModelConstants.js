// @flow

// actions on study participants
const PARTICIPANT_ACTIONS = {
  DELETE: 'delete',
  DOWNLOAD: 'download',
  LINK: 'link',
  TOGGLE_ENROLLMENT: 'toggle_enrollment'
};

const PARTICIPANTS_PREFIX = 'chronicle_participants_';

const STUDY_LOGIN_ROOT = 'https://openlattice.com/chronicle/login?studyId=';

export {
  PARTICIPANTS_PREFIX,
  PARTICIPANT_ACTIONS,
  STUDY_LOGIN_ROOT
};
