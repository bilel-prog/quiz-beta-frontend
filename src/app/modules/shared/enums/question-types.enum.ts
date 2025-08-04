export enum QuestionType {
  // Objective Questions (Closed-Ended)
  MULTIPLE_CHOICE_SINGLE = 'MULTIPLE_CHOICE_SINGLE',
  MULTIPLE_CHOICE_MULTIPLE = 'MULTIPLE_CHOICE_MULTIPLE', 
  MULTIPLE_CHOICE_BEST = 'MULTIPLE_CHOICE_BEST',
  TRUE_FALSE = 'TRUE_FALSE',
  YES_NO = 'YES_NO',
  FILL_IN_THE_BLANK = 'FILL_IN_THE_BLANK',
  FILL_IN_THE_BLANK_PHRASE = 'FILL_IN_THE_BLANK_PHRASE',
  MATCHING = 'MATCHING',
  MATCHING_ONE_TO_MANY = 'MATCHING_ONE_TO_MANY',
  SEQUENCING = 'SEQUENCING',
  ORDERING_CHRONOLOGICAL = 'ORDERING_CHRONOLOGICAL',
  
  // Subjective Questions (Open-Ended)
  SHORT_ANSWER = 'SHORT_ANSWER',
  ESSAY = 'ESSAY'
}

export interface QuestionTypeInfo {
  type: QuestionType;
  label: string;
  description: string;
  category: 'objective' | 'subjective';
  icon: string;
}

export const QUESTION_TYPES: QuestionTypeInfo[] = [
  // Objective Questions
  {
    type: QuestionType.MULTIPLE_CHOICE_SINGLE,
    label: 'Multiple Choice (Single Answer)',
    description: 'One correct answer from multiple options',
    category: 'objective',
    icon: 'check-circle'
  },
  {
    type: QuestionType.MULTIPLE_CHOICE_MULTIPLE,
    label: 'Multiple Choice (Multiple Answers)',
    description: 'Multiple correct answers possible',
    category: 'objective',
    icon: 'check-square'
  },
  {
    type: QuestionType.MULTIPLE_CHOICE_BEST,
    label: 'Multiple Choice (Best Answer)',
    description: 'Choose the best answer from options',
    category: 'objective',
    icon: 'star'
  },
  {
    type: QuestionType.TRUE_FALSE,
    label: 'True/False',
    description: 'Binary choice - true or false',
    category: 'objective',
    icon: 'swap'
  },
  {
    type: QuestionType.YES_NO,
    label: 'Yes/No',
    description: 'Binary choice - yes or no',
    category: 'objective',
    icon: 'question-circle'
  },
  {
    type: QuestionType.FILL_IN_THE_BLANK,
    label: 'Fill in the Blank (Word)',
    description: 'Complete with a single word',
    category: 'objective',
    icon: 'edit'
  },
  {
    type: QuestionType.FILL_IN_THE_BLANK_PHRASE,
    label: 'Fill in the Blank (Phrase)',
    description: 'Complete with a phrase or sentence',
    category: 'objective',
    icon: 'form'
  },
  {
    type: QuestionType.MATCHING,
    label: 'Matching (One-to-One)',
    description: 'Match items from two columns',
    category: 'objective',
    icon: 'link'
  },
  {
    type: QuestionType.MATCHING_ONE_TO_MANY,
    label: 'Matching (One-to-Many)',
    description: 'One item matches multiple options',
    category: 'objective',
    icon: 'share-alt'
  },
  {
    type: QuestionType.SEQUENCING,
    label: 'Sequencing/Ordering',
    description: 'Arrange items in correct order',
    category: 'objective',
    icon: 'ordered-list'
  },
  {
    type: QuestionType.ORDERING_CHRONOLOGICAL,
    label: 'Chronological Ordering',
    description: 'Arrange events in time order',
    category: 'objective',
    icon: 'clock-circle'
  },
  
  // Subjective Questions
  {
    type: QuestionType.SHORT_ANSWER,
    label: 'Short Answer',
    description: 'Brief explanations (1-3 sentences)',
    category: 'subjective',
    icon: 'message'
  },
  {
    type: QuestionType.ESSAY,
    label: 'Essay Question',
    description: 'Long-form responses and analysis',
    category: 'subjective',
    icon: 'file-text'
  }
];
