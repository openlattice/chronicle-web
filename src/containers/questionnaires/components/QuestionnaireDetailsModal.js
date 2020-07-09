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

const HorizontalList = styled.ul`
  padding: 0;

  > li {
    display: inline;
    padding: 12px 20px;
    font-size: 14px;
    background-color: ${NEUTRALS[5]};
    color: ${NEUTRALS[0]};
    margin-right: 10px;
  }
`;

const SectionPane = styled.div`
  border-bottom: 1px solid ${NEUTRALS[4]};
  padding-bottom: 30px;
  margin-bottom: 30px;

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
  isModalVisible :boolean;
  onCloseModal :() => void;
  title :string;
  description :string;
  rruleSet :string;
  questionnaireEKID :UUID;
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
                <li key={day}>
                  {day}
                </li>
              ))
            }
          </HorizontalList>
          <h5>Time</h5>
          <HorizontalList>
            {
              times.map((time) => (
                <li key={time}>
                  {time}
                </li>
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
