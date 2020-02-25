// @flow

type AppUserTypeEnum = {|
  PARENT :'parent';
  CHILD :'child';
  PARENT_AND_CHILD :'parent_and_child';
|};

const AppUserTypes :{|...AppUserTypeEnum|} = Object.freeze({
  PARENT: 'parent',
  CHILD: 'child',
  PARENT_AND_CHILD: 'parent_and_child',
});

type AppUserType = $Values<typeof AppUserTypes>;

export type { AppUserType };
export default AppUserTypes;
