/*
 * @flow
 */


import type { Match } from 'react-router';

const getIdFromMatch = (match :Match) :?string => {

  const {
    params: {
      id = null,
    } = {},
  } = match;

  return id;
};

export {
  getIdFromMatch,
};
