// @flow

// study enrollment status
const ENROLLMENT_STATUS = {
  ENROLLED: 'enrolled',
  NOT_ENROLLED: 'not_enrolled'
};

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
  ENROLLMENT_STATUS,
  PARTICIPANTS_PREFIX,
  PARTICIPANT_ACTIONS,
  STUDY_LOGIN_ROOT
};
