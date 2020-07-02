// @flow

// questionnaire question types
type QuestionTypeEnum = {|
  TEXT_ENTRY:'Text entry';
  MULTIPLE_CHOICE:'Multiple choice';
|};

type QuestionType = $Values<QuestionTypeEnum>;

const QuestionTypes :{|...QuestionTypeEnum |} = Object.freeze({
  TEXT_ENTRY: 'Text entry',
  MULTIPLE_CHOICE: 'Multiple choice'
});

export type { QuestionType };
export default QuestionTypes;
