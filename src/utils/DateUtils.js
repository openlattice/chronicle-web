// @flow
import { DateTime } from 'luxon';

// @return 10/20/2020, 1:30 PM
const getDateTimeFromIsoDate = (isoDate :string) => {
  const date :DateTime = DateTime.fromISO(isoDate);
  if (date.isValid) {
    return date.toLocaleString(DateTime.DATETIME_SHORT);
  }
  return null;
};

const getFullDateFromIsoDate = (isoDate :string) => {
  const date :DateTime = DateTime.fromISO(isoDate);
  if (date.isValid) {
    return date.toLocaleString(DateTime.DATE_FULL);
  }
  return null;
};

export {
  getDateTimeFromIsoDate,
  getFullDateFromIsoDate
};
