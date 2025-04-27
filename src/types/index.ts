// Generic database types
export interface BaseEntity {
  id: string;
  created_at?: string;
  updated_at?: string;
}

// Assessment types
export interface Assessment extends BaseEntity {
  title: string;
  description: string;
  is_active: boolean;
  created_by: string;
}

// Topic types
export interface Topic extends BaseEntity {
  title: string;
  description: string;
  assessment_id: string;
  sequence_number: number;
  is_active: boolean;
}

// Question types
export interface Question extends BaseEntity {
  question: string;
  type: 'multiple_choice' | 'yes_no' | 'free_text';
  topic_id: string;
  sequence_number: number;
  is_active: boolean;
}

// Answer types
export interface Answer extends BaseEntity {
  text: string;
  is_correct: boolean;
  marks: string | number;
  comment: string | null;
  question_id?: string;
}

// User types
export interface User extends BaseEntity {
  email: string;
  role: 'admin' | 'client';
  full_name: string;
  is_active: boolean;
}

// Form event types
export interface FormChangeEvent extends React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement> {
  target: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
}

// Common handler types
export type ChangeHandler = (e: FormChangeEvent) => void;
export type SubmitHandler = (e: React.FormEvent) => void;
