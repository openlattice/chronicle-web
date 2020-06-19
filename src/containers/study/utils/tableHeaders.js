// @flow

import { PROPERTY_TYPE_FQNS } from '../../../core/edm/constants/FullyQualifiedNames';

const {
  DATE_FIRST_PUSHED,
  DATE_LAST_PUSHED,
  EVENT_COUNT,
  PERSON_ID
} = PROPERTY_TYPE_FQNS;
const TABLE_HEADERS = [
  {
    key: PERSON_ID,
    label: 'Participant ID',
    cellStyle: {
      width: '18%',
    }
  },
  {
    key: DATE_FIRST_PUSHED,
    label: 'First Data Received',
    cellStyle: {
      width: '22%',
    }
  },
  {
    key: DATE_LAST_PUSHED,
    label: 'Last Data Received',
    cellStyle: {
      width: '22%'
    }
  },
  {
    key: EVENT_COUNT,
    label: 'Days collected',
    cellStyle: {
      width: '18%',
      textAlign: 'center',
    }
  },
  {
    key: 'actions',
    label: 'Actions',
    sortable: false,
    cellStyle: {
      textAlign: 'center',
    }
  },
];

export default TABLE_HEADERS;
