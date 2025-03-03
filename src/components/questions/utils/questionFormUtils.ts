
import { QuestionType, Answer } from '../types';

export const validateQuestionForm = (
  questionText: string,
  questionType: QuestionType,
  multipleChoiceAnswers: Answer[],
  yesNoAnswers: Answer[],
  freeTextMarks: string
): { isValid: boolean; error: string } => {
  if (questionText.trim().length < 5) {
    return { isValid: false, error: 'Question must be at least 5 characters' };
  }

  if (questionType === 'multiple_choice') {
    const filledAnswers = multipleChoiceAnswers.filter(a => a.text.trim() !== '');
    if (filledAnswers.length < 2) {
      return { isValid: false, error: 'At least two answer options are required' };
    }
    
    const filledMarks = filledAnswers.filter(a => a.marks && a.marks.trim() !== '');
    if (filledMarks.length > 0 && filledMarks.length < filledAnswers.length) {
      return { isValid: false, error: 'Either provide marks for all answers or leave all blank' };
    }
  } else if (questionType === 'yes_no') {
    if (yesNoAnswers[0].text.trim() === '' || yesNoAnswers[1].text.trim() === '') {
      return { isValid: false, error: 'Both Yes and No answers must be provided' };
    }
    
    const filledMarks = yesNoAnswers.filter(a => a.marks && a.marks.trim() !== '');
    if (filledMarks.length > 0 && filledMarks.length < yesNoAnswers.length) {
      return { isValid: false, error: 'Either provide marks for all answers or leave all blank' };
    }
  } else if (questionType === 'free_text') {
    if (!freeTextMarks) {
      return { isValid: false, error: 'Please provide marks for the free text answer' };
    }
  }

  return { isValid: true, error: '' };
};
