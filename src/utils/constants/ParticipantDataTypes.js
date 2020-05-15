// @flow

type ParticipantDataTypeEnum = {|
  RAW :'Raw';
  PREPROCESSED :'Preprocessed';
  APP_USAGE :'App Usage';
|};

type ParticipantDataType = $Values<ParticipantDataTypeEnum>

const ParticipantDataTypes :{|...ParticipantDataTypeEnum |} = Object.freeze({
  RAW: 'Raw',
  PREPROCESSED: 'Preprocessed',
  APP_USAGE: 'App Usage'
});

export type { ParticipantDataType };
export default ParticipantDataTypes;
