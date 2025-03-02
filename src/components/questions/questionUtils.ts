import { supabase } from '@/integrations/supabase/client';
import { Answer, QuestionType } from './types';
import { toast } from 'sonner';

export const validateAnswers = (answers: Answer[], questionType: QuestionType) => {
  // Check if we have at least 1 answer for free_text or 2 for other types
  if (questionType === 'free_text' && answers.length < 1) {
    toast.error('Free text questions must have at least 1 answer');
    return false;
  }
  
  if (questionType !== 'free_text' && answers.length < 2) {
    toast.error('Questions must have at least 2 options');
    return false;
  }

  // Check if all answers have text
  const emptyAnswers = answers.filter(a => !a.text.trim());
  if (emptyAnswers.length > 0) {
    toast.error('All answers must have text');
    return false;
  }

  return true;
};

export const saveQuestion = async (
  values: { question: string; type: QuestionType; is_active: boolean },
  answers: Answer[],
  isEditing: boolean, 
  questionId: string | undefined, 
  topicId: string, 
  userId: string
) => {
  try {
    // Log the answers to help debug
    console.log('Submitting with answers:', answers);
    
    let finalQuestionId = questionId;
    
    if (isEditing) {
      // Update existing question
      const { error } = await supabase
        .from('questions')
        .update({
          question: values.question,
          type: values.type,
          is_active: values.is_active
        })
        .eq('id', questionId);
      
      if (error) {
        console.error('Error updating question:', error);
        toast.error(`Failed to update question: ${error.message}`);
        return null;
      }
      
      // Delete existing answers
      const { error: deleteError } = await supabase
        .from('answers')
        .delete()
        .eq('question_id', questionId);
      
      if (deleteError) {
        console.error('Error deleting answers:', deleteError);
        toast.error(`Error removing old answers: ${deleteError.message}`);
        return null;
      }
    } else {
      // Create new question
      console.log('Creating new question with type:', values.type);
      const { data, error } = await supabase
        .from('questions')
        .insert({
          question: values.question,
          type: values.type,
          is_active: values.is_active,
          topic_id: topicId,
          created_by: userId
        })
        .select('id');
      
      if (error) {
        console.error('Error creating question:', error);
        toast.error(`Failed to create question: ${error.message}`);
        return null;
      }
      
      if (!data || data.length === 0) {
        console.error('No question ID returned after insert');
        toast.error('Failed to get question ID');
        return null;
      }
      
      finalQuestionId = data[0].id;
    }
    
    // Ensure we have a question ID before inserting answers
    if (!finalQuestionId) {
      console.error('Missing question ID');
      toast.error('Error saving question: No question ID available');
      return null;
    }
    
    // Process answers to insert with proper is_correct values (can now be null)
    const answersToInsert = answers.map(answer => ({
      text: answer.text,
      // Keep the is_correct value as is (including null)
      is_correct: answer.is_correct,
      marks: answer.marks || '0',
      question_id: finalQuestionId
    }));
    
    console.log('Inserting answers:', answersToInsert);
    
    // Insert answers
    const { error: answersError } = await supabase
      .from('answers')
      .insert(answersToInsert);
    
    if (answersError) {
      console.error('Error inserting answers:', answersError);
      toast.error(`Failed to save answers: ${answersError.message}`);
      
      // If this is a new question and answers failed, we should delete the question to avoid orphaned data
      if (!isEditing) {
        await supabase.from('questions').delete().eq('id', finalQuestionId);
      }
      return null;
    }
    
    toast.success(isEditing ? 'Question updated successfully' : 'Question created successfully');
    
    return finalQuestionId;
  } catch (error) {
    const err = error as Error;
    console.error('Error saving question:', err);
    toast.error(`Unexpected error: ${err.message}`);
    return null;
  }
};

export const setDefaultAnswers = (type: QuestionType): Answer[] => {
  if (type === 'yes_no') {
    return [
      { text: 'Yes', is_correct: true, marks: '1' },
      { text: 'No', is_correct: false, marks: '0' }
    ];
  } else if (type === 'multiple_choice') {
    return [
      { text: 'Option 1', is_correct: true, marks: '1' },
      { text: 'Option 2', is_correct: false, marks: '0' }
    ];
  } else if (type === 'free_text') {
    return [{ text: 'Correct answer', is_correct: null, marks: '1' }];
  }
  return [];
};
