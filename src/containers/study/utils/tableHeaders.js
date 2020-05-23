// @flow

import { PROPERTY_TYPE_FQNS } from '../../../core/edm/constants/FullyQualifiedNames';

const { PERSON_ID, DATE_ENROLLED, DATE_ENROLLED_BIS } = PROPERTY_TYPE_FQNS;
const TABLE_HEADERS = [
  {
    key: PERSON_ID,
    label: 'Participant ID',
    cellStyle: {
      width: '25%',
    }
  },
  {
    key: DATE_ENROLLED,
    label: 'Enrollment Date',
    cellStyle: {
      width: '25%',
    }
  },
  {
    key: DATE_ENROLLED_BIS,
    label: 'Enrollment Date Bis',
    cellStyle: {
      width: '25%'
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
