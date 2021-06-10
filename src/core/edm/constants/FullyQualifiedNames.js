/*
 * @flow
 */

import { Models } from 'lattice';

const { FQN } = Models;

const PROPERTY_TYPE_FQNS = {
  // study
  DELETE_FQN: FQN.of('ol.delete'),
  FULL_NAME_FQN: FQN.of('general.fullname'),
  STUDY_DESCRIPTION: FQN.of('diagnosis.Description'),
  STUDY_EMAIL: FQN.of('contact.Email'),
  STUDY_GROUP: FQN.of('sharing.name'),
  STUDY_ID: FQN.of('general.stringid'),
  STUDY_VERSION: FQN.of('ol.version'),

  // study participants:
  PERSON_ID: FQN.of('nc.SubjectIdentification'),
  STATUS: FQN.of('ol.status'),

  // survey
  DATE_ENROLLED: FQN.of('ol.datetimestart'),
  USER_FQN: FQN.of('ol.user'),

  // metadata
  DATETIME_START_FQN: FQN.of('ol.datetimestart'),
  DATETIME_END_FQN: FQN.of('ol.datetimeend'),
  DATE_LOGGED: FQN.of('ol.recordeddate'),
  EVENT_COUNT: FQN.of('ol.eventcount'),

  // notifications
  ID_FQN: FQN.of('ol.id'),
  NOTIFICATION_ENABLED: FQN.of('ol.status'),

  // survey
  ACTIVE_FQN: FQN.of('ol.active'),
  CODE_FQN: FQN.of('ol.code'),
  COMPLETED_DATE_TIME_FQN: FQN.of('date.completeddatetime'),
  DATE_TIME_FQN: FQN.of('ol.datetime'),
  DESCRIPTION_FQN: FQN.of('ol.description'),
  NAME_FQN: FQN.of('ol.name'),
  RRULE_FQN: FQN.of('ol.rrule'),
  TITLE_FQN: FQN.of('ol.title'),
  VALUES_FQN: FQN.of('ol.values'),
  VARIABLE_FQN: FQN.of('ol.variable'),
};

/* eslint-disable import/prefer-default-export */
export {
  PROPERTY_TYPE_FQNS,
};
/* eslint-enable */
