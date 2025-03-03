
import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { QuestionFormProps, QuestionType, Answer } from './types';
import { supabase } from '@/integrations/supabase/client';
import MultipleChoiceAnswers from './form/MultipleChoiceAnswers';
import YesNoAnswers from './form/YesNoAnswers';
import FreeTextAnswer from './form/FreeTextAnswer';
import QuestionTypeDisplay from './form/QuestionTypeDisplay';
import { validateQuestionForm } from './utils/questionFormUtils';

const QuestionForm: React.FC<QuestionFormProps> = ({ 
  question, 
  initialQuestionType,
  topicId, 
  userId, 
  onClose 
}) => {
  const [questionText, setQuestionText] = useState(question?.question || '');
  const [questionType, setQuestionType] = useState<QuestionType>(
    initialQuestionType || question?.type || 'multiple_choice'
  );
  const [isActive, setIsActive] = useState(question?.is_active ?? true);
  const [sequenceNumber, setSequenceNumber] = useState<number>(question?.sequence_number || 0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  const [multipleChoiceAnswers, setMultipleChoiceAnswers] = useState<Answer[]>([
    { text: '', is_correct: false, marks: '', comment: '' },
    { text: '', is_correct: false, marks: '', comment: '' },
    { text: '', is_correct: false, marks: '', comment: '' },
    { text: '', is_correct: false, marks: '', comment: '' }
  ]);
  
  const [yesNoAnswers, setYesNoAnswers] = useState<Answer[]>([
    { text: 'Yes', is_correct: false, marks: '', comment: '' },
    { text: 'No', is_correct: false, marks: '', comment: '' }
  ]);
  
  const [freeTextMarks, setFreeTextMarks] = useState<string>('');
  const [freeTextComment, setFreeTextComment] = useState<string>('');

  useEffect(() => {
    if (question?.id) {
      fetchAnswers(question.id);
    }
  }, [question?.id]);

  const fetchAnswers = async (questionId: string) => {
    try {
      const { data, error } = await supabase
        .from('answers')
        .select('*')
        .eq('question_id', questionId);

      if (error) throw error;

      if (data && data.length > 0) {
        if (questionType === 'multiple_choice') {
          const existingAnswers = data.slice(0, 4);
          const newAnswers = [...multipleChoiceAnswers];
          
          existingAnswers.forEach((answer, index) => {
            newAnswers[index] = {
              id: answer.id,
              text: answer.text,
              is_correct: answer.is_correct || false,
              marks: answer.marks || '',
              comment: answer.comment || ''
            };
          });
          
          setMultipleChoiceAnswers(newAnswers);
        } else if (questionType === 'yes_no') {
          const updatedYesNoAnswers = [...yesNoAnswers];
          
          if (data.length >= 2) {
            data.slice(0, 2).forEach((answer, index) => {
              updatedYesNoAnswers[index] = {
                id: answer.id,
                text: answer.text,
                is_correct: answer.is_correct || false,
                marks: answer.marks || '',
                comment: answer.comment || ''
              };
            });
            setYesNoAnswers(updatedYesNoAnswers);
          }
        } else if (questionType === 'free_text') {
          setFreeTextMarks(data[0]?.marks || '');
          setFreeTextComment(data[0]?.comment || '');
        }
      }
    } catch (e) {
      console.error('Error fetching answers:', e);
      toast.error('Failed to load answers');
    }
  };

  const handleMultipleChoiceAnswerChange = (index: number, field: keyof Answer, value: any) => {
    setMultipleChoiceAnswers(prevAnswers => {
      const newAnswers = [...prevAnswers];
      newAnswers[index] = { ...newAnswers[index], [field]: value };
      
      if (field === 'is_correct' && value === true) {
        newAnswers.forEach((answer, i) => {
          if (i !== index) {
            newAnswers[i] = { ...answer, is_correct: false };
          }
        });
      }
      
      return newAnswers;
    });
  };

  const handleYesNoAnswerChange = (index: number, field: keyof Answer, value: any) => {
    setYesNoAnswers(prevAnswers => {
      const newAnswers = [...prevAnswers];
      newAnswers[index] = { ...newAnswers[index], [field]: value };
      
      if (field === 'is_correct' && value === true) {
        newAnswers.forEach((answer, i) => {
          if (i !== index) {
            newAnswers[i] = { ...answer, is_correct: false };
          }
        });
      }
      
      return newAnswers;
    });
  };

  const validateForm = () => {
    const validation = validateQuestionForm(
      questionText,
      questionType,
      multipleChoiceAnswers,
      yesNoAnswers,
      freeTextMarks
    );
    
    if (!validation.isValid) {
      setError(validation.error);
      return false;
    }
    
    setError('');
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    
    try {
      const questionData = {
        question: questionText,
        type: questionType,
        is_active: isActive,
        topic_id: topicId,
        created_by: userId,
        sequence_number: sequenceNumber
      };
      
      let questionId = question?.id;
      
      if (questionId) {
        const { error: updateError } = await supabase
          .from('questions')
          .update({ 
            question: questionData.question,
            is_active: questionData.is_active,
            sequence_number: questionData.sequence_number
          })
          .eq('id', questionId);

        if (updateError) throw updateError;
      } else {
        const { data: newQuestion, error: insertError } = await supabase
          .from('questions')
          .insert(questionData)
          .select();

        if (insertError) throw insertError;
        questionId = newQuestion?.[0].id;
      }

      if (questionId) {
        if (questionType === 'multiple_choice') {
          await handleMultipleChoiceAnswers(questionId);
        } else if (questionType === 'yes_no') {
          await handleYesNoAnswers(questionId);
        } else if (questionType === 'free_text') {
          await handleFreeTextAnswer(questionId);
        }
      }

      toast.success('Question saved successfully!');
      onClose();
    } catch (e: any) {
      setError(e.message || 'Failed to save question');
      toast.error(e.message || 'Failed to save question');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMultipleChoiceAnswers = async (questionId: string) => {
    try {
      const { error: deleteError } = await supabase
        .from('answers')
        .delete()
        .eq('question_id', questionId);
      
      if (deleteError) throw deleteError;

      const validAnswers = multipleChoiceAnswers
        .filter(answer => answer.text.trim() !== '')
        .map(answer => ({
          question_id: questionId,
          text: answer.text,
          is_correct: answer.is_correct,
          marks: answer.marks || null,
          comment: answer.comment || null
        }));

      if (validAnswers.length > 0) {
        const { error: insertError } = await supabase
          .from('answers')
          .insert(validAnswers);
        
        if (insertError) throw insertError;
      }
    } catch (e) {
      console.error('Error saving multiple choice answers:', e);
      throw e;
    }
  };

  const handleYesNoAnswers = async (questionId: string) => {
    try {
      const { error: deleteError } = await supabase
        .from('answers')
        .delete()
        .eq('question_id', questionId);
      
      if (deleteError) throw deleteError;

      const answers = yesNoAnswers.map(answer => ({
        question_id: questionId,
        text: answer.text,
        is_correct: answer.is_correct,
        marks: answer.marks || null,
        comment: answer.comment || null
      }));

      const { error: insertError } = await supabase
        .from('answers')
        .insert(answers);
      
      if (insertError) throw insertError;
    } catch (e) {
      console.error('Error saving yes/no answers:', e);
      throw e;
    }
  };

  const handleFreeTextAnswer = async (questionId: string) => {
    try {
      const { error: deleteError } = await supabase
        .from('answers')
        .delete()
        .eq('question_id', questionId);
      
      if (deleteError) throw deleteError;

      const { error: insertError } = await supabase
        .from('answers')
        .insert({
          question_id: questionId,
          text: 'Free text answer',
          is_correct: null,
          marks: freeTextMarks,
          comment: freeTextComment || null
        });
      
      if (insertError) throw insertError;
    } catch (e) {
      console.error('Error saving free text answer:', e);
      throw e;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <Label htmlFor="question">Question</Label>
        <Input
          id="question"
          type="text"
          value={questionText}
          onChange={(e) => setQuestionText(e.target.value)}
          placeholder="Enter question text"
        />
      </div>

      <div className="flex gap-6">
        <div className="w-1/2">
          <QuestionTypeDisplay
            questionType={questionType}
            onQuestionTypeChange={setQuestionType}
            isEditing={!!question?.id}
          />
        </div>
        
        <div className="w-1/2">
          <Label htmlFor="sequenceNumber">Sequence Number</Label>
          <Input
            id="sequenceNumber"
            type="number"
            min="0"
            value={sequenceNumber}
            onChange={(e) => setSequenceNumber(parseInt(e.target.value) || 0)}
            placeholder="Enter sequence number"
          />
        </div>
      </div>

      {questionType === 'multiple_choice' && (
        <MultipleChoiceAnswers 
          answers={multipleChoiceAnswers} 
          onChange={handleMultipleChoiceAnswerChange} 
        />
      )}

      {questionType === 'yes_no' && (
        <YesNoAnswers 
          answers={yesNoAnswers} 
          onChange={handleYesNoAnswerChange} 
        />
      )}

      {questionType === 'free_text' && (
        <FreeTextAnswer
          marks={freeTextMarks}
          comment={freeTextComment}
          onMarksChange={setFreeTextMarks}
          onCommentChange={setFreeTextComment}
        />
      )}

      <div className="flex items-center space-x-2">
        <Switch
          id="active"
          checked={isActive}
          onCheckedChange={(checked) => setIsActive(checked)}
        />
        <Label htmlFor="active">Active</Label>
      </div>

      {error && <p className="text-red-500">{error}</p>}

      <div className="flex justify-end space-x-2">
        <Button variant="ghost" onClick={onClose}>Cancel</Button>
        <Button disabled={isSubmitting} onClick={handleSubmit}>
          {isSubmitting ? 'Saving...' : 'Save Question'}
        </Button>
      </div>
    </div>
  );
};

export default QuestionForm;
