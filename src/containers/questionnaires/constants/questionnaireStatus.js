// @flow

// questionnaire status
type QuestionnaireStatusEnum = {|
  ACTIVE :'ACTIVE';
  NOT_ACTIVE :'NOT_ACTIVE';
|};

type QuestionnaireStatus = $Values<QuestionnaireStatusEnum>;

const QuestionnaireStatuses :{|...QuestionnaireStatusEnum |} = Object.freeze({
  ACTIVE: 'ACTIVE',
  NOT_ACTIVE: 'NOT_ACTIVE'
});

export type { QuestionnaireStatus };
export default QuestionnaireStatuses;
