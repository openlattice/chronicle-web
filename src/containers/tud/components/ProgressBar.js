// @flow

import React, { useEffect, useState } from 'react';

import styled from 'styled-components';
import { Colors, Typography } from 'lattice-ui-kit';
import { DateTime } from 'luxon';

const { PURPLES, NEUTRALS, ORANGE } = Colors;

const Grid = styled.div`
  align-items: center;
  display: grid;
  grid-template-columns: ${(props) => `${props.completedRatio}fr auto`};
`;

const Wrapper = styled.div`
    background: white;
    margin-bottom: 10px;
    padding: 20px 0;
    position: sticky;
    top: 0;
    z-index: 10;
`;

const ProgressIndicator = styled.div`
  border-top-color: ${(props) => props.color};
  border-top-style: solid;
  border-top-width: 5px;
`;

const ProgressLabelWrapper = styled.div`
  align-items: center;
  display: flex;
  justify-content: space-between;
  padding-top: 5px;

  :last-of-type {
    padding-left: 10px;
  }
`;

const validateDateTimes = (dateTimes :Array<?DateTime>) => {
  const isValid = dateTimes.map((dateTime) => dateTime && dateTime.isValid);
  return isValid.every((value) => value);
};

type Props = {
  currentTime :?DateTime;
  dayEndTime :?DateTime;
  dayStartTime :?DateTime;
  is12hourFormat :boolean;
  isDayActivityPage :boolean;
}

const ProgressBar = (props :Props) => {

  const {
    currentTime,
    dayEndTime,
    dayStartTime,
    is12hourFormat,
    isDayActivityPage,
  } = props;

  const [completedRatio, setCompletedRatio] = useState(0);
  const [isOutOfRange, setIsOutOfRange] = useState(true);

  useEffect(() => {
    if (validateDateTimes([dayStartTime, dayEndTime, currentTime])) {
      // $FlowFixMe
      const totalTimeDiff :Object = dayEndTime.diff(dayStartTime).toObject().milliseconds;
      // $FlowFixMe
      const completed :Object = currentTime.diff(dayStartTime).toObject().milliseconds;

      let ratio = [
        completed / totalTimeDiff,
        (totalTimeDiff - completed) / totalTimeDiff
      ];

      const isValid = ratio.every((val) => val >= 0);
      setIsOutOfRange(isValid);

      if (ratio[0] < 0) ratio = [0, 1];
      if (ratio[1] < 0) ratio = [1, 0];

      setCompletedRatio(ratio[0]);
    }
  }, [dayStartTime, dayEndTime, currentTime]);

  if (!isDayActivityPage) {
    return null;
  }

  const formatTime = (input :?DateTime) => {
    if (!validateDateTimes([input])) return null;

    return is12hourFormat
      // $FlowFixMe
      ? input.toLocaleString(DateTime.TIME_SIMPLE)
      // $FlowFixMe
      : input.toLocaleString(DateTime.TIME_24_SIMPLE);
  };

  const isCompleted = completedRatio === 1;
  const zeroProgress = completedRatio === 0;

  return (
    <Wrapper>
      <Grid completedRatio={completedRatio}>
        <ProgressIndicator color={isOutOfRange ? PURPLES[1] : ORANGE.O300} />
        <ProgressIndicator color={isOutOfRange ? NEUTRALS[3] : ORANGE.O300} />
      </Grid>
      <Grid completedRatio={completedRatio}>
        <ProgressLabelWrapper>
          <Typography
              noWrap
              variant="overline">
            {formatTime(dayStartTime)}
          </Typography>
        </ProgressLabelWrapper>
        <ProgressLabelWrapper>
          {

            <Typography
                noWrap
                variant="overline">
              {!isCompleted && !zeroProgress && formatTime(currentTime)}
            </Typography>

          }
          {
            <Typography
                align="right"
                noWrap
                variant="overline">
              {formatTime(dayEndTime)}
            </Typography>
          }
        </ProgressLabelWrapper>
      </Grid>
    </Wrapper>
  );
};

export default ProgressBar;
