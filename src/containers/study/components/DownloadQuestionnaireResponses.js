// @flow

import React, { useState, useEffect } from 'react';

import {
  Modal,
  Sizes,
  Select,
  Colors,
  Button
} from 'lattice-ui-kit';
import { useDispatch } from 'react-redux';
import styled from 'styled-components';
import {
  getStudyQuestionnaires,
  getQuestionnaireResponses
} from '../../questionnaire/QuestionnaireActions';

const { APP_CONTENT_WIDTH } = Sizes;
const { NEUTRALS } = Colors;

const ModalWrapper = styled.div`
  width: ${APP_CONTENT_WIDTH}px;
  min-height: 400px;
`;

const HeaderWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  width: 100%;
  border-bottom: 1px solid ${NEUTRALS[4]};
  padding-bottom: 30px;
`;

const SelectWrapper = styled.div`
  width: 250px;

  > h5 {
    color: ${NEUTRALS[0]};
    font-size: 14px;
    font-weight: normal;
    margin-bottom: 5px;
    padding: 0;
  }
`;

const surveys = [
  { label: 'First Questionnaire lskdfslfksf sf', value: '9isidf' },
  { label: 'Second Questionnaire', value: '9isidf' },
  { label: 'Third Questionnaire', value: '9isidf' },
];

const dateOptions = [
  { label: '5/22/2020, 6:01 AM', value: '9isidf' },
  { label: '6/22/2020, 10:09 AM', value: '9isidf' },
  { label: '7/24/2020, 11:09 AM', value: '9isidf' },
];

type HeaderProps = {
  studyEntityKeyId :UUID;
  studyId :UUID;
  participantEKID :UUID;
}

const Header = (props :HeaderProps) => {
  const dispatch = useDispatch();

  const {
    studyEntityKeyId,
    studyId,
    participantEKID
  } = props;

  const [selectedSurvey, setSelectedSurvey] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);

  useEffect(() => {
    dispatch(getStudyQuestionnaires(studyEntityKeyId));
    dispatch(getQuestionnaireResponses({
      participantEKID,
      studyId
    }));
  }, [dispatch, participantEKID, studyEntityKeyId, studyId]);

  const handleSelectDate = (selectedValue) => {
    setSelectedDate(selectedValue);
  };

  const handleOnChange = (selectedVal) => {
    setSelectedSurvey(selectedVal);
  };

  return (
    <HeaderWrapper>
      <SelectWrapper>
        <h5> Select Questionnaire </h5>
        <Select
            options={surveys}
            value={selectedSurvey}
            onChange={handleOnChange} />
      </SelectWrapper>
      <SelectWrapper>
        <h5> Select Date </h5>
        <Select
            options={dateOptions}
            value={selectedDate}
            onChange={handleSelectDate} />
      </SelectWrapper>
      <div>
        <Button
            mode="primary">
          Download All
        </Button>
      </div>
    </HeaderWrapper>
  );
};

type Props = {
  isModalOpen :boolean;
  onCloseModal :() => void;
  studyEntityKeyId :UUID;
  studyId :UUID;
  participantEKID :UUID;
}
/* eslint-disable react/jsx-props-no-spreading */
const DownloadQuestionnaireResponses = (props :Props) => {
  const { isModalOpen, onCloseModal } = props;
  return (
    <Modal
        isVisible={isModalOpen}
        onClose={onCloseModal}
        textSecondary="Close"
        textTitle="Download Questionnaire Responses">
      <ModalWrapper>
        <Header {...props} />
      </ModalWrapper>
    </Modal>
  );
};

/* eslint-enable */

export default DownloadQuestionnaireResponses;
