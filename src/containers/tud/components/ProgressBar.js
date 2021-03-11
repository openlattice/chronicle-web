// @flow

import React, { useEffect, useState } from 'react';

import styled from 'styled-components';
// $FlowFixMe
import { Typography, LinearProgress } from 'lattice-ui-kit';
import { DateTime } from 'luxon';

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

const ProgressLabelWrapper = styled.div`
  align-items: center;
  display: flex;
  justify-content: space-between;
  padding-top: 5px;

  :last-of-type {
    padding-left: 10px;
  }
`;

const validateDateTimes = (dateTimes :Array<?DateTime>) => (
  dateTimes.every((dateTime :?DateTime) => dateTime && dateTime.isValid)
);

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

  useEffect(() => {
    if (validateDateTimes([dayStartTime, dayEndTime, currentTime])) {
      // $FlowFixMe
      const totalTimeDiff :number = dayEndTime.diff(dayStartTime).toObject().milliseconds;
      // $FlowFixMe
      const completed :number = currentTime.diff(dayStartTime).toObject().milliseconds;

      let ratio = [
        completed / totalTimeDiff,
        (totalTimeDiff - completed) / totalTimeDiff
      ];

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
      <LinearProgress variant="determinate" value={completedRatio * 100} />
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
