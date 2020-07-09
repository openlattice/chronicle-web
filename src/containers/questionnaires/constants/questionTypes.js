// @flow

// questionnaire question types
type QuestionTypeEnum = {|
  MULTIPLE_CHOICE :'Multiple choice';
  TEXT_ENTRY :'Text entry';
|};

type QuestionType = $Values<QuestionTypeEnum>;

const QuestionTypes :{|...QuestionTypeEnum |} = Object.freeze({
  MULTIPLE_CHOICE: 'Multiple choice',
  TEXT_ENTRY: 'Text entry'
});

export type { QuestionType };
export default QuestionTypes;
