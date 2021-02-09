// @flow
import {
  List,
  Map,
  getIn,
  setIn
} from 'immutable';
import { Constants, Models } from 'lattice';
import { DataProcessingUtils } from 'lattice-fabricate';

import { STUDIES } from '../../../core/edm/constants/EntityTemplateNames';
import { PROPERTY_TYPE_FQNS } from '../../../core/edm/constants/FullyQualifiedNames';

const {
  getPageSectionKey,
  getEntityAddressKey,
  processEntityData
} = DataProcessingUtils;

const { OPENLATTICE_ID_FQN } = Constants;

const { FQN } = Models;

const { DATETIME_START_FQN } = PROPERTY_TYPE_FQNS;

const constructEntityFromFormData = (
  entitySetIds :Map,
  propertyTypeIds :Map,
  formData :Object,
  studyEntityKeyId :UUID
) => {
  const newFormData = setIn(
    formData,
    [getPageSectionKey(1, 1), getEntityAddressKey(0, STUDIES, OPENLATTICE_ID_FQN)],
    studyEntityKeyId,
  );
  const entityData = processEntityData(newFormData, entitySetIds, propertyTypeIds.map((id, fqn) => fqn));

  const studyEntitySetId :UUID = entitySetIds.get(STUDIES);
  return getIn(entityData, [studyEntitySetId, 0]);
};

const getMinDateFromMetadata = (metadata :Map<UUID, Map<FQN, List<UUID>>>, participantEKID :UUID) => {
  const dateValues = metadata.getIn([participantEKID, DATETIME_START_FQN], List());
  const minDate = dateValues.min();

  if (minDate) {
    return List.of(minDate);
  }
  return minDate;
};

export {
  constructEntityFromFormData,
  getMinDateFromMetadata
};
