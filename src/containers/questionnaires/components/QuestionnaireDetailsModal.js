// @flow

import React from 'react';

import styled from 'styled-components';
import { List } from 'immutable';
import { Form } from 'lattice-fabricate';
import { Colors, Modal } from 'lattice-ui-kit';
import { useSelector } from 'react-redux';

import { QUESTIONNAIRE_REDUX_CONSTANTS } from '../../../utils/constants/ReduxConstants';
import { createSchema, getSchemaProperties, getUiSchemaOptions } from '../../questionnaire/utils';
import { getWeekDaysAndTimesFromRruleSet } from '../utils';

const { QUESTIONNAIRE_QUESTIONS } = QUESTIONNAIRE_REDUX_CONSTANTS;
const { NEUTRALS } = Colors;

const HorizontalList = styled.div`
  display: grid;
  grid-gap: 20px;
  grid-template-columns: repeat(auto-fill, 110px);

  > span {
    background-color: ${NEUTRALS[5]};
    color: ${NEUTRALS[0]};
    text-align: center;
    font-size: 14px;
    padding: 12px 20px;
  }
`;

const SectionPane = styled.div`
  border-bottom: 1px solid ${NEUTRALS[4]};
  margin-bottom: 30px;
  padding-bottom: 30px;

  :last-of-type {
    border-bottom: 0;
  }

  h2 {
    font-size: 20px;
    font-weight: 500;
    margin: 0;
  }

  h5 {
    color: ${NEUTRALS[1]};
    font-size: 14px;
    font-weight: normal;
    margin: 16px 0 0 0;
  }

  p {
    margin: 0;
  }
`;

const Wrapper = styled.div`
  width: 650px;
`;

type Props = {
  description :string;
  isModalVisible :boolean;
  onCloseModal :() => void;
  questionnaireEKID :UUID;
  rruleSet :string;
  title :string;
};

const QuestionnaireDetailsModal = (props :Props) => {
  const {
    description,
    isModalVisible,
    onCloseModal,
    questionnaireEKID,
    rruleSet,
    title
  } = props;

  const questions = useSelector(
    (state) => state.getIn(['questionnaire', QUESTIONNAIRE_QUESTIONS, questionnaireEKID], List())
  );

  const schemaProperties = getSchemaProperties(questions);

  const uiSchemaOptions = getUiSchemaOptions(schemaProperties);
  const { schema, uiSchema } = createSchema(schemaProperties, uiSchemaOptions);

  const [weekDays, times] = getWeekDaysAndTimesFromRruleSet(rruleSet);

  return (
    <Modal isVisible={isModalVisible} onClose={onCloseModal} textTitle="Questionnaire Details">
      <Wrapper>
        <SectionPane>
          <h2>About</h2>
          <h5>Title</h5>
          <p>
            {title}
          </p>
          <h5>Description</h5>
          <p>
            {description}
          </p>
        </SectionPane>

        <SectionPane>
          <h2> Notifications Schedule </h2>
          <h5>Days of the Week </h5>
          <HorizontalList>
            {
              weekDays.map((day) => (
                <span key={day}>
                  {day}
                </span>
              ))
            }
          </HorizontalList>
          <h5>Time</h5>
          <HorizontalList>
            {
              times.map((time) => (
                <span key={time}>
                  {time}
                </span>
              ))
            }
          </HorizontalList>
        </SectionPane>

        <SectionPane>
          <h2> Questions </h2>
          <br />
          <Form
              disabled
              hideSubmit
              noPadding
              schema={schema}
              uiSchema={uiSchema} />
        </SectionPane>
      </Wrapper>

    </Modal>
  );
};

export default QuestionnaireDetailsModal;
