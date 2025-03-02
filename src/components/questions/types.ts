
import { z } from 'zod';

// Ensure these values exactly match the database constraint
export const QUESTION_TYPES = ['multiple_choice', 'yes_no', 'free_text'] as const;
export type QuestionType = typeof QUESTION_TYPES[number];

// Update the schema to match the database constraints
export const questionSchema = z.object({
  question: z.string().min(5, 'Question must be at least 5 characters'),
  // Use the strict type that matches the database constraint
  type: z.enum(QUESTION_TYPES),
  is_active: z.boolean().default(true),
  sequence_number: z.number().optional(),
});

export type QuestionFormValues = z.infer<typeof questionSchema>;

export interface Answer {
  id?: string;
  text: string;
  is_correct: boolean | null;
  marks: string | null;
}

export interface QuestionFormProps {
  question?: {
    id: string;
    question: string;
    type: QuestionType;
    is_active: boolean;
    sequence_number?: number;
    answers?: Answer[];
  };
  initialQuestionType?: QuestionType;
  topicId: string;
  userId: string;
  onClose: () => void;
}
