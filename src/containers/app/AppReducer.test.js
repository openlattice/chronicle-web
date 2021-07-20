import { Map } from 'immutable';
import { ReduxConstants } from 'lattice-utils';
import { RequestStates } from 'redux-reqseq';

import reducer from './AppReducer';
import {
  GET_APP_SETTINGS,
  GET_CONFIGS,
  INITIALIZE_APPLICATION,
  initializeApplication
} from './AppActions';

import { APP_REDUX_CONSTANTS } from '../../utils/constants/ReduxConstants';

const {
  APP_MODULES_ORG_LIST_MAP,
  ENTITY_SET_IDS_BY_ORG_ID,
  ORGS,
  SELECTED_ORG_ID,
  SETTINGS,
} = APP_REDUX_CONSTANTS;

const { REQUEST_STATE } = ReduxConstants;

const MOCK_APP_NAME = 'TestApp';
const MOCK_ERR_STATUS = 500;
const MOCK_ERR_RESPONSE = {
  response: {
    status: MOCK_ERR_STATUS,
  },
};

describe('AppReducer', () => {

  const INITIAL_STATE = reducer(undefined, { type: '__TEST__' });

  test('INITIAL_STATE', () => {
    expect(INITIAL_STATE).toBeInstanceOf(Map);
    expect(INITIAL_STATE.toJS()).toEqual({
      [GET_APP_SETTINGS]: { [REQUEST_STATE]: RequestStates.STANDBY },
      [GET_CONFIGS]: { [REQUEST_STATE]: RequestStates.STANDBY },
      [INITIALIZE_APPLICATION]: { [REQUEST_STATE]: RequestStates.STANDBY },
      [SETTINGS]: {},
      [APP_MODULES_ORG_LIST_MAP]: {},
      [ENTITY_SET_IDS_BY_ORG_ID]: {},
      [ORGS]: {},
      [SELECTED_ORG_ID]: '',
    });
  });

  describe(INITIALIZE_APPLICATION, () => {

    test(initializeApplication.REQUEST, () => {

      const { id } = initializeApplication();
      const requestAction = initializeApplication.request(id, MOCK_APP_NAME);
      const state = reducer(INITIAL_STATE, requestAction);
      expect(state.getIn([INITIALIZE_APPLICATION, REQUEST_STATE])).toEqual(RequestStates.PENDING);
    });

    test(initializeApplication.SUCCESS, () => {

      const { id } = initializeApplication();
      const requestAction = initializeApplication.request(id, MOCK_APP_NAME);
      let state = reducer(INITIAL_STATE, requestAction);
      state = reducer(state, initializeApplication.success(id));
      expect(state.getIn([INITIALIZE_APPLICATION, REQUEST_STATE])).toEqual(RequestStates.SUCCESS);
    });

    test(initializeApplication.FAILURE, () => {

      const { id } = initializeApplication();
      const requestAction = initializeApplication.request(id, MOCK_APP_NAME);
      let state = reducer(INITIAL_STATE, requestAction);
      state = reducer(state, initializeApplication.failure(id, MOCK_ERR_RESPONSE));
      expect(state.getIn([INITIALIZE_APPLICATION, REQUEST_STATE])).toEqual(RequestStates.FAILURE);
    });

    test(initializeApplication.FINALLY, () => {

      const { id } = initializeApplication();
      let state = reducer(INITIAL_STATE, initializeApplication.request(id, MOCK_APP_NAME));
      state = reducer(state, initializeApplication.success(id));
      state = reducer(state, initializeApplication.finally(id));
      expect(state.getIn([INITIALIZE_APPLICATION, REQUEST_STATE])).toEqual(RequestStates.SUCCESS);
    });

  });

});
