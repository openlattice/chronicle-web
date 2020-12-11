// @flow

type DataTypeEnum = {|
  DAYTIME :'DayTime',
  NIGHTTIME :'NightTime'
|};

type DataType = $Values<DataTypeEnum>;

const DataTypes :{|...DataTypeEnum |} = Object.freeze({
  DAYTIME: 'DayTime',
  NIGHTTIME: 'NightTime'
});

export type { DataType };
export default DataTypes;
