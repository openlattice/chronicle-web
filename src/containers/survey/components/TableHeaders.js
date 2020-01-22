// @flow

const TABLE_HEADERS = [
  {
    key: 'app',
    label: 'App',
    sortable: false,
    cellStyle: {
      width: '50%'
    }
  },
  {
    key: 'parent',
    label: 'Parent',
    sortable: false,
    cellStyle: {
      textAlign: 'center',
    }
  },
  {
    key: 'child',
    label: 'Child',
    sortable: false,
    cellStyle: {
      textAlign: 'center',
    }
  },
  {
    key: 'both',
    label: 'Parent and Child',
    sortable: false,
    cellStyle: {
      textAlign: 'center',
    }
  }
];

export default TABLE_HEADERS;
