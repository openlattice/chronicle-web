// @flow

const NOTIFICATIONS_PREFIX :'chronicle_notifications_' = 'chronicle_notifications_';
const PART_OF_PREFIX :'chronicle_partof_' = 'chronicle_partof_';

const getNotificationsEntitySetName = (studyId :UUID) => `${NOTIFICATIONS_PREFIX}${studyId}`;
const getPartOfAssociationEntitySetName = (studyId :UUID) => `${PART_OF_PREFIX}${studyId}`;

export {
  getNotificationsEntitySetName,
  getPartOfAssociationEntitySetName,
};
