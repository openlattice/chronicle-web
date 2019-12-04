export const ENTITY_SETS = {
  CHRONICLE_USERS: 'chronicle_users',
  CHRONICLE_STUDIES: 'chronicle_study',
  APPLICATION_DATA: 'chronicle_app_data',
  CHRONICLE_RESEARCHERS: 'chronicle_researchers',
  CHRONICLE_DEVICES: 'chronicle_device',
  PARTICIPANTS_PREFIX: 'chronicle_participants_',
  PREPROCESSED_DATA: 'chronicle_preprocessed_app_data',

  // association entity sets
  RECORDED_BY: 'chronicle_recorded_by',
  USED_BY: 'chronicle_used_by',
  PARTICIPATED_IN: 'chronicle_participated_in'
};

export const PROPERTY_TYPES = {
  // person
  PERSON_ID: 'nc.SubjectIdentification',
  PARTICIPANT_ID: 'justice.xref',
  RESEARCHER_ID: 'justice.xref',
  FIRST_NAME: 'nc.PersonGivenName',
  LAST_NAME: 'nc.PersonSurName',

  // study
  STUDY_ID: 'general.stringid',
  STUDY_NAME: 'general.fullname',
  STUDY_GROUP: 'sharing.name',
  STUDY_EMAIL: 'contact.Email',
  STUDY_DESCRIPTION: 'diagnosis.Description',
  STUDY_VERSION: 'ol.version',

  // device
  DEVICE_ID: 'general.stringid',
  ANDROID_VERSION: 'ol.version',
  DEVICE_MODEL: 'vehicle.model',

  // data
  APP_LOG_ID: 'general.stringid',
  APP_NAME: 'general.fullname',
  APP_USAGE_TYPE: 'ol.recordtype',

  // logging
  LOG_ID: 'general.stringid',
  DATE_LOGGED: 'ol.datelogged',
  USER: 'nc.SystemUserName',
  LATITUDE: 'location.latitude',
  LONGITUDE: 'location.longitude',
  ALTITUDE: 'ol.altitude',

  // other
  STATUS: 'ol.status',
  TIMESTAMP: 'date.completeddatetime',
  UUID: 'general.stringid'
};

export const GENERAL_STRING_ID_PT_ID = 'ee3a7573-aa70-4afb-814d-3fad27cda988';

export const SEARCH_PREFIX = 'entity';
