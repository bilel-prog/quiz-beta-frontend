import { QuestionType } from '../enums/question-types.enum';

export interface BaseQuestion {
  id?: number;
  questionText: string;
  questionType: QuestionType;
  testId?: number;
  points?: number;
  timeLimit?: number;
}

export interface MultipleChoiceQuestion extends BaseQuestion {
  questionType: QuestionType.MULTIPLE_CHOICE_SINGLE | QuestionType.MULTIPLE_CHOICE_MULTIPLE | QuestionType.MULTIPLE_CHOICE_BEST;
  options: string[];
  correctAnswers: string[]; // For multiple choice, can be multiple
}

export interface TrueFalseQuestion extends BaseQuestion {
  questionType: QuestionType.TRUE_FALSE;
  correctAnswer: boolean;
}

export interface YesNoQuestion extends BaseQuestion {
  questionType: QuestionType.YES_NO;
  correctAnswer: boolean;
}

export interface FillInTheBlankQuestion extends BaseQuestion {
  questionType: QuestionType.FILL_IN_THE_BLANK | QuestionType.FILL_IN_THE_BLANK_PHRASE;
  correctAnswers: string[]; // Multiple acceptable answers
  caseSensitive?: boolean;
  exactMatch?: boolean;
}

export interface MatchingQuestion extends BaseQuestion {
  questionType: QuestionType.MATCHING | QuestionType.MATCHING_ONE_TO_MANY;
  leftColumn: MatchingItem[];
  rightColumn: MatchingItem[];
  correctMatches: { leftId: string; rightId: string }[];
}

export interface MatchingItem {
  id: string;
  text: string;
  imageUrl?: string;
}

export interface SequencingQuestion extends BaseQuestion {
  questionType: QuestionType.SEQUENCING | QuestionType.ORDERING_CHRONOLOGICAL;
  items: SequencingItem[];
  correctOrder: string[]; // Array of item IDs in correct order
}

export interface SequencingItem {
  id: string;
  text: string;
  imageUrl?: string;
}

export interface ShortAnswerQuestion extends BaseQuestion {
  questionType: QuestionType.SHORT_ANSWER;
  maxLength?: number;
  keywords?: string[]; // Keywords for auto-grading
  sampleAnswer?: string;
}

export interface EssayQuestion extends BaseQuestion {
  questionType: QuestionType.ESSAY;
  minLength?: number;
  maxLength?: number;
  rubric?: string[];
  gradingCriteria?: string;
}

// Union type for all question types
export type Question = 
  | MultipleChoiceQuestion 
  | TrueFalseQuestion 
  | YesNoQuestion 
  | FillInTheBlankQuestion 
  | MatchingQuestion 
  | SequencingQuestion 
  | ShortAnswerQuestion 
  | EssayQuestion;

// Legacy support for current question format
export interface LegacyQuestion {
  id?: number;
  questionText: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctAnswer: string;
  testId?: number;
}

// Answer interfaces
export interface QuestionAnswer {
  questionId: number;
  questionType: QuestionType;
  answer: any; // Type varies by question type
  timeSpent?: number;
}

export interface MultipleChoiceAnswer extends QuestionAnswer {
  questionType: QuestionType.MULTIPLE_CHOICE_SINGLE | QuestionType.MULTIPLE_CHOICE_MULTIPLE | QuestionType.MULTIPLE_CHOICE_BEST;
  answer: string | string[]; // Single string for single choice, array for multiple
}

export interface TrueFalseAnswer extends QuestionAnswer {
  questionType: QuestionType.TRUE_FALSE | QuestionType.YES_NO;
  answer: boolean;
}

export interface FillInTheBlankAnswer extends QuestionAnswer {
  questionType: QuestionType.FILL_IN_THE_BLANK | QuestionType.FILL_IN_THE_BLANK_PHRASE;
  answer: string;
}

export interface MatchingAnswer extends QuestionAnswer {
  questionType: QuestionType.MATCHING | QuestionType.MATCHING_ONE_TO_MANY;
  answer: { leftId: string; rightId: string }[];
}

export interface SequencingAnswer extends QuestionAnswer {
  questionType: QuestionType.SEQUENCING | QuestionType.ORDERING_CHRONOLOGICAL;
  answer: string[]; // Array of item IDs in user's order
}

export interface SubjectiveAnswer extends QuestionAnswer {
  questionType: QuestionType.SHORT_ANSWER | QuestionType.ESSAY;
  answer: string;
}
