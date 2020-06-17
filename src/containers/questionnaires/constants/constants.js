// @flow

import { faTrashAlt, faEdit } from '@fortawesome/pro-regular-svg-icons';

import QuestionnaireStatuses from './questionnaireStatus';

const { ACTIVE, NOT_ACTIVE } = QuestionnaireStatuses;

const STATUS_SELECT_OPTIONS = [
  { label: 'Active', value: ACTIVE },
  { label: 'Not Active', value: NOT_ACTIVE }
];

const DELETE = 'DELETE';
const EDIT = 'EDIT';

const TABLE_ROW_ACTIONS = [
  { action: DELETE, icon: faTrashAlt },
  { action: EDIT, icon: faEdit }
];

// questionnaire buidler pages
const ABOUT_PAGE = 'aboutPage';
const QUESTIONS_PAGE = 'questions';
const SCHEDULER_PAGE = 'scheduler';
const CONFIRMATION_PAGE = 'confirmation';

const QUESTIONNAIRE_FORM_PAGES = {
  ABOUT_PAGE, QUESTIONS_PAGE, SCHEDULER_PAGE, CONFIRMATION_PAGE
};

// days of week
const DAYS_OF_WEEK = {
  SU: 'Sunday',
  MO: 'Monday',
  TU: 'Tuesday',
  WE: 'Wednesday',
  TH: 'Thursday',
  FR: 'Friday',
  SA: 'Saturday'
};

export {
  DAYS_OF_WEEK,
  QUESTIONNAIRE_FORM_PAGES,
  STATUS_SELECT_OPTIONS,
  TABLE_ROW_ACTIONS
};
