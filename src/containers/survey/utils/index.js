// @flow
import {
  List,
  Map,
  get,
} from 'immutable';
import { Constants } from 'lattice';
import { DateTime } from 'luxon';

import AppUsageFreqTypes from '../../../utils/constants/AppUsageFreqTypes';
import { PROPERTY_TYPE_FQNS } from '../../../core/edm/constants/FullyQualifiedNames';
import type { AppUsageFreqType } from '../../../utils/constants/AppUsageFreqTypes';

const { OPENLATTICE_ID_FQN } = Constants;
const { DATE_TIME_FQN, TITLE_FQN, USER_FQN } = PROPERTY_TYPE_FQNS;

const getAppNameFromUserAppsEntity = (entity :Map) => {
  const titleFQNValues :List = entity.getIn(['entityDetails', 'ol.title'], List());
  if (titleFQNValues.isEmpty()) return '';

  const result = titleFQNValues.find((value) => !value.includes('.'));
  if (result) return result;
  return titleFQNValues.first();
};

const getAppUsageDate = (appData :Map) => {
  const date = appData.getIn(['associationDetails', DATE_TIME_FQN, 0]);
  return DateTime.fromISO(date).toLocaleString(DateTime.TIME_SIMPLE);
};

const createSurveyFormSchema = (userApps :Map, appUsageFreqType :AppUsageFreqType) => {
  const schemaProperties :Object = userApps.map((app) => ({
    title: app.getIn(['entityDetails', TITLE_FQN, 0]),
    description: appUsageFreqType === AppUsageFreqTypes.HOURLY ? getAppUsageDate(app) : 'Select all that apply',
    type: 'array',
    uniqueItems: true,
    minItems: 1,
    items: {
      type: 'string',
      enum: ['Parent alone', 'Child alone', 'Parent and child together', 'Other family member']
    }
  })).toJS();

  /* eslint-disable no-param-reassign, no-unused-vars */
  const uiSchemaObjects = Object.entries(schemaProperties).reduce((result, [key, val]) => {
    result[key] = {
      classNames: 'column-span-12',
      'ui:widget': 'checkboxes',
      'ui:options': {
        mode: 'button',
        noneText: "I don't know",
        row: true,
        withNone: true,
      }
    };
    return result;
  }, {});
  /* eslint-enable */

  const uiSchema = {
    classNames: 'column-span-12',
    ...uiSchemaObjects
  };

  const schema = {
    type: 'object',
    title: '',
    properties: {
      ...schemaProperties
    }
  };

  return {
    schema,
    uiSchema
  };
};

const createInitialFormData = (userApps :Map) => userApps
  .map((app) => app.getIn(['associationDetails', USER_FQN], List()))
  .toJS();

const createSubmissionData = (formData :Object) => {
  const entities = Object.entries(formData).map(([entityKeyId, selectedUsers]) => ({
    [OPENLATTICE_ID_FQN]: entityKeyId,
    [USER_FQN.toString()]: selectedUsers
  }));

  /* eslint-disable no-param-reassign */
  return entities.reduce((result, entity) => {
    const entityKeyId = get(entity, OPENLATTICE_ID_FQN);
    delete entity[OPENLATTICE_ID_FQN];
    result[entityKeyId] = entity;
    return result;
  }, {});
  /* eslint-enable */
};

const getMinimumDate = (dates :List) => dates
  .map((date) => DateTime.fromISO(date)).filter((date) => date.isValid).min();

export {
  getMinimumDate,
  createInitialFormData,
  createSubmissionData,
  createSurveyFormSchema,
  getAppNameFromUserAppsEntity
};
