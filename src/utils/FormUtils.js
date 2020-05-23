// @flow

import {
  List,
  Map,
  getIn,
  setIn
} from 'immutable';
import { DataProcessingUtils } from 'lattice-fabricate';

import { getParticipantsEntitySetName } from './ParticipantUtils';

import { PROPERTY_TYPE_FQNS } from '../core/edm/constants/FullyQualifiedNames';

const { getEntityAddressKey, getPageSectionKey, parseEntityAddressKey } = DataProcessingUtils;

const PAGE_SECTION_PREFIX = 'page';
const { NOTIFICATION_ENABLED, PERSON_ID } = PROPERTY_TYPE_FQNS;
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

const createFormDataFromStudyEntity = (dataSchema :Object, notificationsEnabled :boolean, study :Map) => {
  let formData = {};

  if (!dataSchema || !study) {
    return {};
  }

  // a study object does not have NOTIFICATION_DESCRIPTION property
  const updatedStudy = study.set(NOTIFICATION_ENABLED, [notificationsEnabled]);

  const { properties } = dataSchema;
  const pageSectionKeys = Object.keys(properties).filter((key) => key.startsWith(PAGE_SECTION_PREFIX));

  pageSectionKeys.forEach((pageSectionKey) => {
    const addressKeys = getIn(properties, [pageSectionKey, 'properties'], {});

    Object.keys(addressKeys).forEach((addressKey) => {
      const { propertyTypeFQN } = parseEntityAddressKey(addressKey);
      const propertyValue = updatedStudy.getIn([propertyTypeFQN, 0]);

      formData = setIn(formData, [pageSectionKey, addressKey], propertyValue);
    });
  });

  return formData;
};

/* returns true if there is a participantId is found in the given participants
 * @param participants: immutable Map object mapping participant entitykey ids to metadata, for example
 * {
      p1_entity_key: {
        nc.SubjectIdentification: ['value1'],
        openlattice.@id: ['value2'],
        ol.status: ['value2']
      },
      p2_entity_key: {
        nc.SubjectIdentification: ['value3'],
        openlattice.@id: ['value4'],
        ol.status: ['value5']
      }
 * }
 */
const containsParticipantId = (participantId :string, participants :Map) => {
  const participantIds :List = participants.valueSeq().map(((participant :Map) => participant.getIn([PERSON_ID, 0])));
  return participantIds.includes(participantId.trim());
};

// custom react-jsonschema-form validation
// ref: https://react-jsonschema-form.readthedocs.io/en/latest/validation/#custom-error-messages
const validateAddParticipantForm = (formData :Object, errors :Object, participants :Map, studyId :UUID) => {
  const participantsEntitySetName = getParticipantsEntitySetName(studyId);

  const pageSectionKey = getPageSectionKey(1, 1);
  const entityAddressKey = getEntityAddressKey(0, participantsEntitySetName, PERSON_ID);
  const participantId :string = getIn(formData, [pageSectionKey, entityAddressKey]);

  if (containsParticipantId(participantId, participants)) {
    errors[pageSectionKey][entityAddressKey].addError('Participant ID should be unique.');
  }

  return errors;
};

export {
  containsParticipantId,
  createFormDataFromStudyEntity,
  validateAddParticipantForm
};
