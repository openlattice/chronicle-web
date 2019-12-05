/*
 * @flow
 */
const ID_PARAM :':id' = ':id';
const ROOT :string = '/';
const STUDIES :string = '/studies';
const STUDY :string = `${STUDIES}/${ID_PARAM}`;

export {
  ROOT,
  STUDIES,
  ID_PARAM,
  STUDY
};
