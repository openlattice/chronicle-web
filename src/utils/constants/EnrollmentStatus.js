// @flow

// study enrollment status
type EnrollmentStatusEnum = {|
  DELETE :'DELETE';
  ENROLLED :'ENROLLED';
  NOT_ENROLLED :'NOT_ENROLLED';
|};

type EnrollmentStatus = $Values<EnrollmentStatusEnum>;

const EnrollmentStatuses :{|...EnrollmentStatusEnum |} = Object.freeze({
  DELETE: 'DELETE',
  ENROLLED: 'ENROLLED',
  NOT_ENROLLED: 'NOT_ENROLLED'
});

export type { EnrollmentStatus };
export default EnrollmentStatuses;
