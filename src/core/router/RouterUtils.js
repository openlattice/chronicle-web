/*
 * @flow
 */

import type { Match } from 'react-router';

const getIdFromMatch = (match :Match) => match.params.id;

export default getIdFromMatch;
