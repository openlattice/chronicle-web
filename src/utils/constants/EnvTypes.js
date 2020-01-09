// @flow

type EnvTypeEnum = {|
  PRODUCTION:'production';
  STAGING:'staging';
  LOCAL:'local';
|};

type EnvType = $Values<EnvTypeEnum>;

const EnvTypes :{|...EnvTypeEnum|} = Object.freeze({
  PRODUCTION: 'production',
  STAGING: 'staging',
  LOCAL: 'local',
});

export type { EnvType };
export default EnvTypes;
