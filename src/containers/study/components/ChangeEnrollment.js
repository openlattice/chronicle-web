// @flow

import React from 'react';

import { ActionModal, Colors } from 'lattice-ui-kit';
import { RequestStates } from 'redux-reqseq';
import type { RequestState } from 'redux-reqseq';

import EnrollmentStatuses from '../../../utils/constants/EnrollmentStatus';

const { ENROLLED } = EnrollmentStatuses;
const { NEUTRAL } = Colors;

type Props = {
  enrollmentStatus :string;
  handleOnChangeEnrollment :() => void;
  handleOnClose :() => void;
  isVisible :boolean;
  participantId :UUID;
  requestState :?RequestState;
}

const ChangeEnrollment = ({
  enrollmentStatus,
  handleOnChangeEnrollment,
  handleOnClose,
  isVisible,
  participantId,
  requestState
} :Props) => {

  let action = enrollmentStatus === ENROLLED ? 'pause' : 'resume';
  const completedAction = enrollmentStatus === ENROLLED ? 'resumed' : 'paused';

  const requestStateComponents = {
    [RequestStates.STANDBY]: (
      <div>
        <span> Are you sure you want to </span>
        { action }
        <span> collecting data on </span>
        <span style={{ color: NEUTRAL.N900, fontWeight: 500 }}>
          { participantId }
        </span>
        <span>?</span>
      </div>
    ),
    [RequestStates.SUCCESS]: (
      <div>
        <span> Successfully </span>
        { completedAction }
        <span> collecting data on participant. </span>
      </div>
    ),
    [RequestStates.FAILURE]: (
      <div>
        <span> Failed to </span>
        { action}
        <span> collecting data on participant. Please try again. </span>
      </div>
    )
  };

  action = action.charAt(0).toUpperCase() + action.substr(1);
  return (
    <ActionModal
        isVisible={isVisible}
        onClickPrimary={handleOnChangeEnrollment}
        onClose={handleOnClose}
        requestState={requestState}
        requestStateComponents={requestStateComponents}
        shouldCloseOnEscape={false}
        shouldCloseOnOutsideClick={false}
        textPrimary="Yes"
        textSecondary="No"
        textTitle={`${action} Enrollment`} />
  );
};

export default ChangeEnrollment;
