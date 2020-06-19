/*
 * @flow
 */

import { Models } from 'lattice';

const { FullyQualifiedName } = Models;

const ASSOCIATION_ENTITY_TYPE_FQNS = {
  PART_OF: new FullyQualifiedName('ol.partof'),
  RESPONDS_WITH_FQN: new FullyQualifiedName('ol.respondswith')
};
const ENTITY_TYPE_FQNS = {
  PERSON: new FullyQualifiedName('general.person'),
  NOTIFICATION: new FullyQualifiedName('ol.notification'),
  SURVEY_FQN: new FullyQualifiedName('ol.survey'),
  ANSWER_FQN: new FullyQualifiedName('ol.answer'),
  QUESTION_FQN: new FullyQualifiedName('ol.question')
};

const PROPERTY_TYPE_FQNS = {
  // study
  STUDY_DESCRIPTION: new FullyQualifiedName('diagnosis.Description'),
  STUDY_EMAIL: new FullyQualifiedName('contact.Email'),
  STUDY_GROUP: new FullyQualifiedName('sharing.name'),
  STUDY_ID: new FullyQualifiedName('general.stringid'),
  STUDY_NAME: new FullyQualifiedName('general.fullname'),
  STUDY_VERSION: new FullyQualifiedName('ol.version'),

  // study participants:
  PERSON_ID: new FullyQualifiedName('nc.SubjectIdentification'),
  STATUS: new FullyQualifiedName('ol.status'),

  // survey
  DATE_ENROLLED: new FullyQualifiedName('ol.datetimestart'),
  USER_FQN: new FullyQualifiedName('ol.user'),

  // metadata
  DATE_FIRST_PUSHED: new FullyQualifiedName('ol.recordeddate'),
  DATE_LAST_PUSHED: new FullyQualifiedName('ol.datetimeend'),
  DATE_LOGGED: new FullyQualifiedName('ol.datelogged'),
  EVENT_COUNT: new FullyQualifiedName('ol.eventcount'),

  // notifications
  ID_FQN: new FullyQualifiedName('ol.id'),
  NOTIFICATION_ENABLED: new FullyQualifiedName('ol.status'),

  // survey
  NAME_FQN: new FullyQualifiedName('ol.name'),
  DESCRIPTION_FQN: new FullyQualifiedName('ol.description'),
  VALUES_FQN: new FullyQualifiedName('ol.values'),
  DATE_TIME_FQN: new FullyQualifiedName('ol.datetime'),
  TITLE_FQN: new FullyQualifiedName('ol.title')
};

export {
  ASSOCIATION_ENTITY_TYPE_FQNS,
  ENTITY_TYPE_FQNS,
  PROPERTY_TYPE_FQNS,
};
