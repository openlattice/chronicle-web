// @flow
import { List, Map } from 'immutable';

const getAppNameFromUserAppsEntity = (entity :Map) => {
  const titleFQNValues :List = entity.getIn(['entityDetails', 'ol.title'], List());
  if (titleFQNValues.isEmpty()) return '';

  const result = titleFQNValues.find((value) => !value.includes('.'));
  if (result) return result;
  return titleFQNValues.first();
};

/* eslint-disable import/prefer-default-export */
export {
  getAppNameFromUserAppsEntity
};
/* eslint-enable */
