/*
 * @flow
 */

type ParticipantDataTypeEnum = {|
  APP_USAGE :'APP_USAGE';
  PREPROCESSED :'PREPROCESSED';
  RAW :'RAW';
|};

type ParticipantDataType = $Values<ParticipantDataTypeEnum>

const ParticipantDataTypes :{|...ParticipantDataTypeEnum |} = Object.freeze({
  APP_USAGE: 'APP_USAGE',
  PREPROCESSED: 'PREPROCESSED',
  RAW: 'RAW'
});

export type { ParticipantDataType };
export default ParticipantDataTypes;
