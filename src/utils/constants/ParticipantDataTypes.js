// @flow

type ParticipantDataTypeEnum = {|
  RAW :'Raw';
  PREPROCESSED :'Preprocessed'
|};

type ParticipantDataType = $Values<ParticipantDataTypeEnum>

const ParticipantDataTypes :{|...ParticipantDataTypeEnum |} = Object.freeze({
  RAW: 'Raw',
  PREPROCESSED: 'Preprocessed'
});

export type { ParticipantDataType };
export default ParticipantDataTypes;
