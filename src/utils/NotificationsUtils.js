// @flow

const getPartOfAssociationEntitySetName = (studyId :UUID) => {
  const entityNamePrefix = 'chronicle_partof_';
  return `${entityNamePrefix}${studyId}`;
};

const getNotificationsEntitySetName = (studyId :UUID) => {
  const entityNamePrefix = 'chronicle_notifications_';
  return `${entityNamePrefix}${studyId}`;
};

export {
  getNotificationsEntitySetName,
  getPartOfAssociationEntitySetName
};
