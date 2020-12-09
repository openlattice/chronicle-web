// @flow
import { Map, getIn, setIn } from 'immutable';
import { Constants } from 'lattice';
import { DataProcessingUtils } from 'lattice-fabricate';

import { STUDIES } from '../../../core/edm/constants/EntityTemplateNames';

const {
  getPageSectionKey,
  getEntityAddressKey,
  processEntityData
} = DataProcessingUtils;

const { OPENLATTICE_ID_FQN } = Constants;

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

/* eslint-disable import/prefer-default-export */
export {
  constructEntityFromFormData
};
/* eslint-enable */
