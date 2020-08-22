/*
 * @flow
 */

import { Models } from 'lattice';

const { FQN } = Models;

const ASSOCIATION_ENTITY_TYPE_FQNS = {
  PART_OF: FQN.of('ol.partof'),
  RESPONDS_WITH_FQN: FQN.of('ol.respondswith')
};

const ENTITY_TYPE_FQNS = {
  PERSON: FQN.of('general.person'),
  NOTIFICATION: FQN.of('ol.notification'),
  SURVEY_FQN: FQN.of('ol.survey'),
  ANSWER_FQN: FQN.of('ol.answer'),
  QUESTION_FQN: FQN.of('ol.question')
};

const PROPERTY_TYPE_FQNS = {
  // study
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
  DATE_FIRST_PUSHED: FQN.of('ol.datetimestart'),
  DATE_LAST_PUSHED: FQN.of('ol.datetimeend'),
  DATE_LOGGED: FQN.of('ol.recordeddate'),
  EVENT_COUNT: FQN.of('ol.eventcount'),

  // notifications
  ID_FQN: FQN.of('ol.id'),
  NOTIFICATION_ENABLED: FQN.of('ol.status'),

  // survey
  ACTIVE_FQN: FQN.of('ol.active'),
  COMPLETED_DATE_TIME_FQN: FQN.of('date.completeddatetime'),
  DATE_TIME_FQN: FQN.of('ol.datetime'),
  DESCRIPTION_FQN: FQN.of('ol.description'),
  NAME_FQN: FQN.of('ol.name'),
  RRULE_FQN: FQN.of('ol.rrule'),
  TITLE_FQN: FQN.of('ol.title'),
  VALUES_FQN: FQN.of('ol.values'),
};

const APP_TYPE_FQNS = {
  ADDRESSES_APP_TYPE_FQN: FQN.of('app.addresses'),
  ANSWER_APP_TYPE_FQN: FQN.of('app.answer'),
  HAS_APP_TYPE_FQN: FQN.of('app.has'),
  METADATA_APP_TYPE_FQN: FQN.of('app.metadata'),
  NOTIFICATION_APP_TYPE_FQN: FQN.of('app.notification'),
  PARTICIPATED_IN_APP_TYPE_FQN: FQN.of('app.participatedin'),
  PART_OF_APP_TYPE_FQN: FQN.of('app.partof'),
  PERSON_APP_TYPE_FQN: FQN.of('app.person'),
  QUESTION_APP_TYPE_FQN: FQN.of('app.question'),
  RESPONDSWITH_APP_TYPE_FQN: FQN.of('app.respondswith'),
  STUDY_APP_TYPE_FQN: FQN.of('app.study'),
  SURVEY_APP_TYPE_FQN: FQN.of('app.survey'),
};

export {
  APP_TYPE_FQNS,
  ASSOCIATION_ENTITY_TYPE_FQNS,
  ENTITY_TYPE_FQNS,
  PROPERTY_TYPE_FQNS,
};
