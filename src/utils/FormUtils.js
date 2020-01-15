// @flow

import { Map, getIn, setIn } from 'immutable';
import { DataProcessingUtils } from 'lattice-fabricate';

const { parseEntityAddressKey } = DataProcessingUtils;

const PAGE_SECTION_PREFIX = 'page';

/*
 * returns a FormData object similar to this
 *  {
 *     "page1_section1": {
 *       "0__@@__ESN1__@@__FQN1": "value1",
 *       "0__@@__ESN1__@@__FQN2": "value2",
 *     },
 *     "page1_section2": {
 *       "0__@@__ESN2__@@__FQN3": "value3",
 *       "0__@@__ESN2__@@__FQN4": "value4",
 *     }
 *   }
 * @param study: immutable Map object, for example:
 *  {
      FQN1: ["value1"],
      FQN2: ["value2"],
      FQN3: ["value3"],
      FQN4: ["value4"],
    }
 *
 * @param dataSchema: schema for Fabricate's Form component
 *
 */

const createFormDataFromStudyEntity = (dataSchema :Object, study :Map) => {
  let formData = {};

  if (!dataSchema || !study) {
    return {};
  }

  const { properties } = dataSchema;
  const pageSectionKeys = Object.keys(properties).filter((key) => key.startsWith(PAGE_SECTION_PREFIX));

  pageSectionKeys.forEach((pageSectionKey) => {
    const addressKeys = getIn(properties, [pageSectionKey, 'properties'], {});
    Object.keys(addressKeys).forEach((addressKey) => {
      const { propertyTypeFQN } = parseEntityAddressKey(addressKey);
      const propertyValue = study.getIn([propertyTypeFQN, 0]);
      formData = setIn(formData, [pageSectionKey, addressKey], propertyValue);
    });
  });

  return formData;
};

export default createFormDataFromStudyEntity;
