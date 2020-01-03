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

export {
  ENROLLMENT_STATUS,
  PARTICIPANT_ACTIONS,
  PARTICIPANTS_PREFIX
};
