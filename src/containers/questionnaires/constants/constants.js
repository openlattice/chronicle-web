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

export {
  STATUS_SELECT_OPTIONS,
  TABLE_ROW_ACTIONS
};
