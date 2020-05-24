// @flow

import { PROPERTY_TYPE_FQNS } from '../../../core/edm/constants/FullyQualifiedNames';

const {
  PERSON_ID, DATE_ENROLLED, DATE_LAST_PUSHED, EVENT_COUNT
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
    key: DATE_ENROLLED,
    label: 'Enrollment Date',
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
      textAligh: 'center',
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
