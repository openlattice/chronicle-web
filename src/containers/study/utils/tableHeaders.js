// @flow

import { PROPERTY_TYPE_FQNS } from '../../../core/edm/constants/FullyQualifiedNames';

const { PERSON_ID, DATE_ENROLLED } = PROPERTY_TYPE_FQNS;
const TABLE_HEADERS = [
  {
    key: PERSON_ID,
    label: 'Participant ID',
    cellStyle: {
      width: '45%',
    }
  },
  {
    key: DATE_ENROLLED,
    label: 'Enrollment Date',
    cellStyle: {
      width: '40%',
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
