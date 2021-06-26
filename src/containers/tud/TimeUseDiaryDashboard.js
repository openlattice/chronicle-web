// @flow

import React, { useEffect, useState } from 'react';

import { List, Map } from 'immutable';
import {
  Card,
  CardSegment,
  Spinner,
  Typography
} from 'lattice-ui-kit';
import { ReduxConstants, ReduxUtils, useRequestState } from 'lattice-utils';
import { useDispatch, useSelector } from 'react-redux';
import type { RequestState } from 'redux-reqseq';

import SearchPanel from './components/SearchPanel';
import SummaryHeader from './components/SummaryHeader';
import SummaryListComponent from './components/SummaryListComponent';
import {
  DOWNLOAD_ALL_TUD_DATA,
  DOWNLOAD_DAILY_TUD_DATA,
  GET_SUBMISSIONS_BY_DATE,
  downloadAllTudData,
  downloadDailyTudData,
  getSubmissionsByDate
} from './TimeUseDiaryActions';
import type { DataType } from './constants/DataTypes';

import BasicErrorComponent from '../shared/BasicErrorComponent';
import { resetRequestState } from '../../core/redux/ReduxActions';
import { TUD_REDUX_CONSTANTS } from '../../utils/constants/ReduxConstants';

const { SUBMISSIONS_BY_DATE } = TUD_REDUX_CONSTANTS;

const { REQUEST_STATE } = ReduxConstants;

const {
  isFailure,
  isPending,
  isStandby,
  isSuccess,
} = ReduxUtils;

type Props = {
  participants :Map;
};

const TimeUseDiaryDashboard = ({ participants } :Props) => {
  const dispatch = useDispatch();

  const [dates, setDates] = useState({
    startDate: undefined,
    endDate: undefined
  });

  // selectors
  const downloadAllDataRS :?RequestState = useRequestState(['tud', DOWNLOAD_ALL_TUD_DATA]);
  const getSubmissionsByDateRS :?RequestState = useRequestState(['tud', GET_SUBMISSIONS_BY_DATE]);
  const submissionsByDate = useSelector((state) => state.getIn(['tud', SUBMISSIONS_BY_DATE], Map()));
  const downloadStates = useSelector((state) => state.getIn(['tud', DOWNLOAD_DAILY_TUD_DATA, REQUEST_STATE], Map()));

  // reset state on dismount
  useEffect(() => () => {
    dispatch(resetRequestState(GET_SUBMISSIONS_BY_DATE));
  }, [dispatch]);

  const onSetDate = (name :string, value :string) => {
    setDates({
      ...dates,
      [name]: value,
    });
  };

  const handleOnGetSubmissions = () => {
    const { startDate, endDate } = dates;

    if (startDate && endDate) {
      dispatch(getSubmissionsByDate({
        endDate,
        participants,
        startDate,
      }));
    }
  };

  const handleDownload = (entities :?List, date :?string, dataType :DataType) => {
    const { endDate, startDate } = dates;

    if (!date) {
      // download all
      dispatch(downloadAllTudData({
        entities: submissionsByDate.toList().flatten(true),
        dataType,
        endDate,
        startDate
      }));
    }
    else {
      dispatch(downloadDailyTudData({
        dataType,
        date,
        endDate,
        entities,
        startDate,
      }));
    }
  };

  const errorMsg = 'An error occurred while loading time use diary data.'
    + ' Please try reloading the page or contact support if the issue persists';

  return (
    <Card>
      <CardSegment>
        <SearchPanel
            endDate={dates.endDate}
            getSubmissionsRS={getSubmissionsByDateRS}
            onGetSubmissions={handleOnGetSubmissions}
            onSetDate={onSetDate}
            startDate={dates.startDate} />
      </CardSegment>

      {
        !isStandby(getSubmissionsByDateRS) && (
          <CardSegment>
            {
              isPending(getSubmissionsByDateRS) && (
                <Spinner size="2x" />
              )
            }
            {
              isFailure(getSubmissionsByDateRS) && (
                <BasicErrorComponent>
                  <Typography variant="body2">
                    { errorMsg }
                  </Typography>
                </BasicErrorComponent>
              )
            }
            {
              isSuccess(getSubmissionsByDateRS) && (
                <>
                  {
                    submissionsByDate.isEmpty() ? (
                      <Typography>
                        No submissions found for the selected date range.
                      </Typography>
                    ) : (
                      <>
                        <SummaryHeader
                            onDownloadData={handleDownload}
                            downloadAllDataRS={downloadAllDataRS} />
                        <div>
                          {
                            submissionsByDate.entrySeq().sort().map(([key, entities]) => (
                              <SummaryListComponent
                                  date={key}
                                  downloadRS={downloadStates.get(key, Map())}
                                  entities={entities}
                                  key={key}
                                  onDownloadData={handleDownload}>
                                {key}
                              </SummaryListComponent>
                            ))
                          }
                        </div>
                      </>
                    )
                  }
                </>
              )
            }
          </CardSegment>
        )
      }
    </Card>
  );
};

export default TimeUseDiaryDashboard;
