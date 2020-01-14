// @flow

import { DataProcessingUtils } from 'lattice-fabricate';

import { PROPERTY_TYPE_FQNS } from '../../../core/edm/constants/FullyQualifiedNames';
import { getParticipantsEntitySetName } from '../../../utils/ParticipantUtils';

const { PERSON_ID } = PROPERTY_TYPE_FQNS;

const { getEntityAddressKey, getPageSectionKey } = DataProcessingUtils;

const getFormSchema = (studyId :string) => {
  const participantsEntitySetName = getParticipantsEntitySetName(studyId);

  const dataSchema = {
    properties: {
      [getPageSectionKey(1, 1)]: {
        properties: {
          [getEntityAddressKey(0, participantsEntitySetName, PERSON_ID)]: {
            title: 'Participant ID',
            type: 'string'
          }
        },
        required: [
          getEntityAddressKey(0, participantsEntitySetName, PERSON_ID)
        ],
        title: '',
        type: 'object'
      }
    },
    title: '',
    type: 'object'
  };

  const uiSchema = {
    [getPageSectionKey(1, 1)]: {
      classNames: 'column-span-12 grid-container',
      [getEntityAddressKey(0, participantsEntitySetName, PERSON_ID)]: {
        classNames: 'column-span-12'
      }
    }
  };
  return { dataSchema, uiSchema };
};

export default getFormSchema;
