// @flow

type DataTypeEnum = {|
  DAYTIME :'DayTime',
  NIGHTTIME :'NightTime',
  SUMMARIZED :'Summarized',
|};

type DataType = $Values<DataTypeEnum>;

const DataTypes :{|...DataTypeEnum |} = Object.freeze({
  DAYTIME: 'DayTime',
  NIGHTTIME: 'NightTime',
  SUMMARIZED: 'Summarized'
});

export type { DataType };
export default DataTypes;
