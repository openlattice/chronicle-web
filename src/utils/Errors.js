/*
 * @flow
 */

const ERR_ACTION_VALUE_NOT_DEFINED :string = 'invalid parameter: action.value is required and must be defined';
const ERR_ACTION_VALUE_TYPE :string = 'invalid parameter: action.value is the incorrect type';
const ERR_INVALID_ACTION :string = 'invalid parameter: action must be a valid SequenceAction';
const ERR_INVALID_ROUTE :string = 'invalid route: a route must be a non-empty string that starts with "/"';
const ERR_WORKER_SAGA :string = 'caught exception in worker saga';
const ERR_MISSING_CORE_MODULE :string = 'core module not installed';

export {
  ERR_ACTION_VALUE_NOT_DEFINED,
  ERR_ACTION_VALUE_TYPE,
  ERR_INVALID_ACTION,
  ERR_INVALID_ROUTE,
  ERR_MISSING_CORE_MODULE,
  ERR_WORKER_SAGA,
};
