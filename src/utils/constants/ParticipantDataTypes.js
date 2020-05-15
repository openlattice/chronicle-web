// @flow

type ParticipantDataTypeEnum = {|
  APP_USAGE :'App Usage';
  PREPROCESSED :'Preprocessed';
  RAW :'Raw';
|};

type ParticipantDataType = $Values<ParticipantDataTypeEnum>

const ParticipantDataTypes :{|...ParticipantDataTypeEnum |} = Object.freeze({
  APP_USAGE: 'App Usage',
  PREPROCESSED: 'Preprocessed',
  RAW: 'Raw'
});

export type { ParticipantDataType };
export default ParticipantDataTypes;
