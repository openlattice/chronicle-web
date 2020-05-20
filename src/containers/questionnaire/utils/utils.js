// @flow

import {
  List,
  Map,
} from 'immutable';
import { Constants } from 'lattice';
import { DataProcessingUtils } from 'lattice-fabricate';

import { PROPERTY_TYPE_FQNS } from '../../../core/edm/constants/FullyQualifiedNames';

const { getEntityAddressKey } = DataProcessingUtils;
const { TITLE, VALUES_FQN } = PROPERTY_TYPE_FQNS;
const { OPENLATTICE_ID_FQN } = Constants;

export const getQuestionnaireQuestionsESName = (studyId :UUID) => `chronicle_questionnaire_questions_${studyId}`;

export const getQuestionnaireESName = (studyId :UUID) => `chronicle_questionnaires_${studyId}`;

export const getQuestionnaireAnswersESName = (studyId :UUID) => `chronicle_questionnaire_answers_${studyId}`;

export const getSchemaProperties = (questions :List, studyId :UUID) => {

  const questionESName = getQuestionnaireQuestionsESName(studyId);
  const properties = Map().withMutations((mutator) => {
    questions.forEach((question) => {
      const entityKeyId = question.getIn([OPENLATTICE_ID_FQN, 0]);
      const addressKey = getEntityAddressKey(entityKeyId, questionESName, VALUES_FQN);

      mutator
        .setIn([addressKey, 'title'], question.getIn([TITLE, 0]))
        .setIn([addressKey, 'type'], 'string');

      const answerChoices = question.get(VALUES_FQN, List());
      if (!answerChoices.isEmpty()) {
        mutator.setIn([addressKey, 'enum'], answerChoices.map((choice) => String(choice)));
      }
    });
  });

  return properties.toJS();
};

export const getUiSchemaOptions = (schemaProperties :Object) => {
  const result = Map().withMutations((mutator) => {
    Object.keys(schemaProperties).forEach((property) => {
      mutator
        .setIn([property, 'classNames'], 'column-span-12')
        .setIn([property, 'ui:widget'], 'radio')
        .setIn([property, 'ui:options', 'row'], true)
        .setIn([property, 'ui:options', 'mode'], 'button');
    });
  });

  return result.toJS();
};
