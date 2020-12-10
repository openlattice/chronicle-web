// @flow
import { useSelector } from 'react-redux';

import { Map } from 'immutable';

import { APP_REDUX_CONSTANTS } from '../../../utils/constants/ReduxConstants';

import { QUESTIONNAIRES } from '../../../utils/constants/AppModules';

const { SELECTED_ORG_ID, ENTITY_SET_IDS_BY_ORG_ID } = APP_REDUX_CONSTANTS;

// return true if selected org has questionnaires module installed
const useHasQuestionnairesModule = () :Boolean => {
  const selectedOrgId = useSelector((state) => state.getIn(['app', SELECTED_ORG_ID]));
  const config :Map = useSelector((state) => state.getIn(['app', ENTITY_SET_IDS_BY_ORG_ID, QUESTIONNAIRES], Map()));

  return config.has(selectedOrgId);
};

export default useHasQuestionnairesModule;
