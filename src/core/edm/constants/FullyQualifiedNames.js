/*
 * @flow
 */

import { Models } from 'lattice';

const { FullyQualifiedName } = Models;

const ASSOCIATION_ENTITY_TYPE_FQNS = {
  PART_OF: new FullyQualifiedName('ol.partof'),
};
const ENTITY_TYPE_FQNS = {
  PERSON: new FullyQualifiedName('general.person'),
  NOTIFICATION: new FullyQualifiedName('ol.notification')
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
  TITLE: new FullyQualifiedName('ol.title'),
  DATE_ENROLLED: new FullyQualifiedName('ol.datetimestart'),
  USER_FQN: new FullyQualifiedName('ol.user'),

  // metadata
  DATE_FIRST_PUSHED: new FullyQualifiedName('ol.recordeddate'),
  DATE_LAST_PUSHED: new FullyQualifiedName('ol.datetimeend'),
  EVENT_COUNT: new FullyQualifiedName('ol.eventcount'),

  // notifications
  NOTIFICATION_ID: new FullyQualifiedName('ol.id'),
  NOTIFICATION_DESCRIPTION: new FullyQualifiedName('ol.description'),
  NOTIFICATION_ENABLED: new FullyQualifiedName('ol.status'),
  ID_FQN: new FullyQualifiedName('ol.id'),
};

export {
  ASSOCIATION_ENTITY_TYPE_FQNS,
  ENTITY_TYPE_FQNS,
  PROPERTY_TYPE_FQNS,
};
