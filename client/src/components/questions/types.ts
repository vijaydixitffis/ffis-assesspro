export type QuestionType = 'multiple_choice' | 'yes_no' | 'free_text';

export interface Answer {
  id: string;
  text: string;
  is_correct: boolean | null;
  marks: string | null;
}

export interface Question {
  id: string;
  question: string;
  type: QuestionType;
  is_active: boolean;
  sequence_number: number;
  answers: Answer[];
}

export interface Topic {
  id: string;
  title: string;
  description: string;
  assessment_id: string;
  sequence_number: number;
  is_active: boolean;
}