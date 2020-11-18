// @flow

import React, { useEffect, useState } from 'react';

import styled from 'styled-components';
import { Colors, Typography } from 'lattice-ui-kit';
import { DateTime } from 'luxon';

const { PURPLES, NEUTRALS } = Colors;

const Grid = styled.div`
  display: grid;
  grid-template-columns: ${(props) => `${props.gridRatios[0]}fr ${props.gridRatios[1]}fr`};
  align-items: center;
`;

const Wrapper = styled.div`
    padding: 20px 0;
    margin-bottom: 10px;
    position: sticky;
    top: 0;
    z-index: 10;
    background: white;
`;

const ProgressIndicator = styled.div`
  border-top-style: solid;
  border-top-width: 5px;
  border-top-color: ${(props) => props.color};
`;

const ProgressLabelWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 5px;
`;

const validateDateTimes = (dateTimes :Array<?DateTime>) => {
  const isValid = dateTimes.map((dateTime) => dateTime && dateTime.isValid);
  return isValid.every((value) => value);
};

type Props = {
  dayStartTime :?DateTime;
  dayEndTime :?DateTime;
  currentTime :?DateTime;
}

const ProgressBar = ({ dayStartTime, dayEndTime, currentTime } :Props) => {

  const [completedRatio, setCompletedRatio] = useState([0, 1]);

  const dateTimes = [dayStartTime, dayEndTime, currentTime];

  const isValidDateTimes = validateDateTimes(dateTimes);

  useEffect(() => {
    if (isValidDateTimes) {
      // $FlowFixMe
      const dayDiff :Object = dayEndTime.diff(dayStartTime).toObject();
      // $FlowFixMe
      const currentDiff :Object = currentTime.diff(dayStartTime).toObject();

      const totalTime = dayDiff.milliseconds;
      const timeCompleted = currentDiff.milliseconds;

      const ratio = [
        timeCompleted / totalTime,
        (totalTime - timeCompleted) / totalTime
      ];

      if (ratio.every((val) => val >= 0)) {
        setCompletedRatio(ratio);
      }
    }
  }, [dayStartTime, dayEndTime, currentTime, isValidDateTimes]);

  if (!isValidDateTimes) {
    return null;
  }

  const isCompleted = completedRatio[0] === 1;
  const zeroProgress = completedRatio[0] === 0;

  const labelGridRatio = (completedRatio[0] === 0 || completedRatio[1] === 0) ? [1, 2] : completedRatio;

  return (
    <Wrapper>
      <Grid gridRatios={completedRatio}>
        <ProgressIndicator color={PURPLES[1]} />
        <ProgressIndicator color={NEUTRALS[4]} />
      </Grid>
      <Grid gridRatios={labelGridRatio}>
        <ProgressLabelWrapper>
          <Typography
              variant="overline">
            {dayStartTime.toLocaleString(DateTime.TIME_SIMPLE)}
          </Typography>
        </ProgressLabelWrapper>
        <ProgressLabelWrapper>
          {

            <Typography
                variant="overline">
              {!isCompleted && !zeroProgress && currentTime.toLocaleString(DateTime.TIME_SIMPLE)}
            </Typography>

          }
          {
            <Typography
                align="right"
                variant="overline">
              {dayEndTime.toLocaleString(DateTime.TIME_SIMPLE)}
            </Typography>
          }
        </ProgressLabelWrapper>
      </Grid>
    </Wrapper>
  );
};

export default ProgressBar;
