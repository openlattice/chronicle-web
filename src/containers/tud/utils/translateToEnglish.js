// @flow
import { getIn } from 'immutable';

export default function translateToEnglish(
  key :string,
  val :Array<string> | string,
  language :string,
  translationLookup :Object
) :Array<Object> {
  if (language === 'en') {
    return Array.isArray(val) ? val : [val];
  }

  if (!Array.isArray(val)) {
    return [getIn(translationLookup, [key, val], val)];
  }

  return val.map((item) => getIn(translationLookup, [key, item], item));
}
