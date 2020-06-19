/*
 * @flow
 */

type ParticipantDataTypeEnum = {|
  APP_USAGE :'APP_USAGE';
  PREPROCESSED :'PREPROCESSED';
  RAW :'RAW';
  QUESTIONNAIRE_RESPONSES :'QUESTIONNAIRE_RESPONSES'
|};

type ParticipantDataType = $Values<ParticipantDataTypeEnum>

const ParticipantDataTypes :{|...ParticipantDataTypeEnum |} = Object.freeze({
  APP_USAGE: 'APP_USAGE',
  PREPROCESSED: 'PREPROCESSED',
  RAW: 'RAW',
  QUESTIONNAIRE_RESPONSES: 'QUESTIONNAIRE_RESPONSES'
});

export type { ParticipantDataType };
export default ParticipantDataTypes;
