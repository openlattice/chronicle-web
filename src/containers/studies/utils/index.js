// @flow
import {
  List,
  Map,
} from 'immutable';
import { Models } from 'lattice';

import { PROPERTY_TYPE_FQNS } from '../../../core/edm/constants/FullyQualifiedNames';

const { FQN } = Models;

const { DATETIME_START_FQN } = PROPERTY_TYPE_FQNS;

const getMinDateFromMetadata = (metadata :Map<UUID, Map<FQN, List<UUID>>>, participantEKID :UUID) => {
  const dateValues = metadata.getIn([participantEKID, DATETIME_START_FQN], List());
  const minDate = dateValues.min();

  if (minDate) {
    return List.of(minDate);
  }
  return minDate;
};

/* eslint-disable import/prefer-default-export */
export {
  getMinDateFromMetadata
};

/* eslint-enable */
