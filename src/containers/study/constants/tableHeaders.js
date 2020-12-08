// @flow

import { PROPERTY_TYPE_FQNS } from '../../../core/edm/constants/FullyQualifiedNames';

const {
  DATETIME_START_FQN,
  DATETIME_END_FQN,
  EVENT_COUNT,
  PERSON_ID
} = PROPERTY_TYPE_FQNS;
const TABLE_HEADERS = [
  {
    key: PERSON_ID,
    label: 'Participant ID',
    cellStyle: {
      width: '20%',
      fontWeight: 600
    }
  },
  {
    key: DATETIME_START_FQN,
    label: 'First Data Received',
    cellStyle: {
      width: '22%',
      fontWeight: 600
    }
  },
  {
    key: DATETIME_END_FQN,
    label: 'Last Data Received',
    cellStyle: {
      width: '22%',
      fontWeight: 600
    }
  },
  {
    key: EVENT_COUNT,
    label: 'Days collected',
    cellStyle: {
      width: '18%',
      textAlign: 'center',
      fontWeight: 600
    }
  },
  {
    key: 'actions',
    label: 'Actions',
    sortable: false,
    cellStyle: {
      textAlign: 'center',
      fontWeight: 600
    }
  },
];

export default TABLE_HEADERS;
