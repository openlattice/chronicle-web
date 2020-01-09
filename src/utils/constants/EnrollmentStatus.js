// @flow

// study enrollment status
type EnrollmentStatusEnum = {|
  ENROLLED:'ENROLLED';
  NOT_ENROLLED:'NOT_ENROLLED';
|};

type EnrollmentStatus = $Values<EnrollmentStatusEnum>;

const EnrollmentStatuses :{|...EnrollmentStatusEnum |} = Object.freeze({
  ENROLLED: 'ENROLLED',
  NOT_ENROLLED: 'NOT_ENROLLED'
});

export type { EnrollmentStatus };
export default EnrollmentStatuses;
