// @flow

type AppUserTypeEnum = {|
  PARENT :'parent';
  CHILD :'child';
  PARENT_AND_CHILD :'parent_and_child';
|};

type AppUserType = $Values<AppUserTypeEnum>;

const AppUserTypes :{|...AppUserTypeEnum|} = Object.freeze({
  PARENT: 'parent',
  CHILD: 'child',
  PARENT_AND_CHILD: 'parent_and_child',
});

export type { AppUserType };
export default AppUserTypes;
