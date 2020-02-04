// @flow

const TABLE_HEADERS = [
  {
    key: 'app',
    label: 'App',
    sortable: false,
    cellStyle: {
      width: '40%',
      fontWeight: 500
    }
  },
  {
    key: 'parent',
    label: 'Parent',
    sortable: false,
    cellStyle: {
      textAlign: 'center',
      fontWeight: 500,
      overflow: 'hidden'
    }
  },
  {
    key: 'child',
    label: 'Child',
    sortable: false,
    cellStyle: {
      textAlign: 'center',
      fontWeight: 500,
    }
  },
  {
    key: 'both',
    label: 'Parent and Child',
    sortable: false,
    cellStyle: {
      textAlign: 'center',
      fontWeight: 500,
      wordBreak: 'break-word'
    }
  }
];

export default TABLE_HEADERS;
