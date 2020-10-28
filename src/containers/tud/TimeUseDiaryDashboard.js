// @flow

import React, { useState } from 'react';

import {
  Card,
  CardSegment,
} from 'lattice-ui-kit';
import { Map, List } from 'immutable';
import { useRequestState, ReduxUtils } from 'lattice-utils';
import { useDispatch, useSelector } from 'react-redux';
import type { RequestState } from 'redux-reqseq';

import SearchPanel from './components/SearchPanel';
import SummaryHeader from './components/SummaryHeader';
import SummaryListComponent from './components/SummaryListComponent';
import {
  GET_SUBMISSIONS_BY_DATE,
  getSubmissionsByDate,
  downloadTudResponses
} from './TimeUseDiaryActions';

import { TUD_REDUX_CONSTANTS } from '../../utils/constants/ReduxConstants';

const { SUBMISSIONS_BY_DATE } = TUD_REDUX_CONSTANTS;

const { isPending } = ReduxUtils;

type Props = {
  studyEKID :?UUID;
  studyId :UUID;
};

const TimeUseDiaryDashboard = ({ studyEKID, studyId } :Props) => {
  const dispatch = useDispatch();

  const [dates, setDates] = useState({
    startDate: undefined,
    endDate: undefined
  });

  // selectors
  const getSubmissionsByDateRS :?RequestState = useRequestState(['tud', GET_SUBMISSIONS_BY_DATE]);
  const submissionsByDate = useSelector((state) => state.getIn(['tud', SUBMISSIONS_BY_DATE], Map()));

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
        startDate,
        studyEKID,
        studyId
      }));
    }
  };

  const handleDownload = (entities :List) => {
    dispatch(downloadTudResponses({
      entities,
      studyId
    }));
  };

  // const on

  // TODO: spinner when fetching,
  // error message if something goes wrong
  // hide this when nothing has been searched yet?
  // Placeholder message when no data for given date range

  return (
    <Card>
      <CardSegment>
        <SearchPanel
            endDate={dates.endDate}
            isLoading={isPending(getSubmissionsByDateRS)}
            onGetSubmissions={handleOnGetSubmissions}
            onSetDate={onSetDate}
            startDate={dates.startDate} />
      </CardSegment>

      <CardSegment>
        {
          !submissionsByDate.isEmpty() && (
            <>
              <SummaryHeader />
              <div>
                {
                  submissionsByDate.entrySeq().map(([key, entities]) => (
                    <SummaryListComponent
                        key={key}
                        date={key}
                        entities={entities}
                        onDownloadData={handleDownload}>
                      {key}
                    </SummaryListComponent>
                  ))
                }
              </div>
            </>
          )
        }
      </CardSegment>
    </Card>
  );
};

export default TimeUseDiaryDashboard;
