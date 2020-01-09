// @flow

type ParticipantActionTypesEnum = {|
  DELETE:'delete';
  DOWNLOAD:'download';
  LINK:'link';
  TOGGLE_ENROLLMENT:'toggle_enrollment';
|};

type ParticipantActionType = $Values<ParticipantActionTypesEnum>;

const ParticipantActionTypes :{|...ParticipantActionTypesEnum|} = Object.freeze({
  DELETE: 'delete',
  DOWNLOAD: 'download',
  LINK: 'link',
  TOGGLE_ENROLLMENT: 'toggle_enrollment'
});

export type { ParticipantActionType };
export default ParticipantActionTypes;
