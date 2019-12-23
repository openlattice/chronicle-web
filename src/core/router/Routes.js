/*
 * @flow
 */
const ID_PARAM :':id' = ':id';
const ROOT :string = '/';
const LOGIN :string = '/login';
const STUDIES :string = '/studies';
const STUDY :string = `${STUDIES}/${ID_PARAM}`;
const PARTICIPANTS :string = `${STUDIES}/${ID_PARAM}/participants`;

export {
  ID_PARAM,
  LOGIN,
  PARTICIPANTS,
  ROOT,
  STUDIES,
  STUDY
};
