// @flow

const TABLE_HEADERS = [
  {
    key: 'app',
    label: 'App',
    sortable: false,
    cellStyle: {
      width: '40%',
      fontSize: '15px',
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
      fontSize: '15px',
      wordWrap: 'normal'
    }
  },
  {
    key: 'child',
    label: 'Child',
    sortable: false,
    cellStyle: {
      textAlign: 'center',
      fontWeight: 500,
      fontSize: '15px',
      wordWrap: 'normal'
    }
  },
  {
    key: 'both',
    label: 'Parent & Child',
    sortable: false,
    cellStyle: {
      textAlign: 'center',
      fontWeight: 500,
      fontSize: '15px',
      wordWrap: 'normal'
    }
  }
];

export default TABLE_HEADERS;
