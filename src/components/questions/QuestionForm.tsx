import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { QuestionFormProps, QuestionType, QUESTION_TYPES, Answer } from './types';
import { supabase } from '@/integrations/supabase/client';
import { Trash2 } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';

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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  const [multipleChoiceAnswers, setMultipleChoiceAnswers] = useState<Answer[]>([
    { text: '', is_correct: false, marks: '' },
    { text: '', is_correct: false, marks: '' },
    { text: '', is_correct: false, marks: '' },
    { text: '', is_correct: false, marks: '' }
  ]);
  
  const [yesNoAnswers, setYesNoAnswers] = useState<Answer[]>([
    { text: 'Yes', is_correct: false, marks: '' },
    { text: 'No', is_correct: false, marks: '' }
  ]);
  
  const [freeTextMarks, setFreeTextMarks] = useState<string>('');

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
              marks: answer.marks || ''
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
                marks: answer.marks || ''
              };
            });
            setYesNoAnswers(updatedYesNoAnswers);
          }
        } else if (questionType === 'free_text') {
          setFreeTextMarks(data[0]?.marks || '');
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
    if (questionText.trim().length < 5) {
      setError('Question must be at least 5 characters');
      return false;
    }

    if (questionType === 'multiple_choice') {
      const filledAnswers = multipleChoiceAnswers.filter(a => a.text.trim() !== '');
      if (filledAnswers.length < 2) {
        setError('At least two answer options are required');
        return false;
      }
      
      const filledMarks = filledAnswers.filter(a => a.marks && a.marks.trim() !== '');
      if (filledMarks.length > 0 && filledMarks.length < filledAnswers.length) {
        setError('Either provide marks for all answers or leave all blank');
        return false;
      }
    } else if (questionType === 'yes_no') {
      if (yesNoAnswers[0].text.trim() === '' || yesNoAnswers[1].text.trim() === '') {
        setError('Both Yes and No answers must be provided');
        return false;
      }
      
      const filledMarks = yesNoAnswers.filter(a => a.marks && a.marks.trim() !== '');
      if (filledMarks.length > 0 && filledMarks.length < yesNoAnswers.length) {
        setError('Either provide marks for all answers or leave all blank');
        return false;
      }
    } else if (questionType === 'free_text') {
      if (!freeTextMarks) {
        setError('Please provide marks for the free text answer');
        return false;
      }
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
      };
      
      let questionId = question?.id;
      
      if (questionId) {
        const { error: updateError } = await supabase
          .from('questions')
          .update({ 
            question: questionData.question,
            is_active: questionData.is_active,
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
          marks: answer.marks || null
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
        marks: answer.marks || null
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
          marks: freeTextMarks
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

      <div>
        <Label>Question Type</Label>
        {question?.id ? (
          <Input
            value={questionType === 'multiple_choice' ? 'Multiple Choice' : 
                  questionType === 'yes_no' ? 'Yes/No' : 'Free Text'}
            disabled
            className="w-[180px] bg-muted"
          />
        ) : (
          <Select 
            value={questionType} 
            onValueChange={(value) => setQuestionType(value as QuestionType)}
            disabled={!!question?.id}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="multiple_choice">Multiple Choice</SelectItem>
              <SelectItem value="yes_no">Yes/No</SelectItem>
              <SelectItem value="free_text">Free Text</SelectItem>
            </SelectContent>
          </Select>
        )}
      </div>

      {questionType === 'multiple_choice' && (
        <div className="space-y-4">
          <Label>Answer Options (Exactly 4)</Label>
          {multipleChoiceAnswers.map((answer, index) => (
            <div key={index} className="flex items-start gap-2 p-3 border rounded-md">
              <div className="flex-1 space-y-2">
                <Label htmlFor={`option-${index}`}>Option {index + 1}</Label>
                <Input
                  id={`option-${index}`}
                  placeholder={`Option ${index + 1}`}
                  value={answer.text}
                  onChange={(e) => handleMultipleChoiceAnswerChange(index, 'text', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`marks-${index}`}>Marks</Label>
                <Input
                  id={`marks-${index}`}
                  className="w-20"
                  placeholder="Marks"
                  value={answer.marks || ''}
                  onChange={(e) => handleMultipleChoiceAnswerChange(index, 'marks', e.target.value)}
                />
              </div>
              <div className="flex flex-col items-center mt-7 ml-2">
                <div className="flex items-center gap-2">
                  <Switch
                    id={`correct-${index}`}
                    checked={answer.is_correct === true}
                    onCheckedChange={(checked) => handleMultipleChoiceAnswerChange(index, 'is_correct', checked)}
                  />
                  <Label htmlFor={`correct-${index}`}>Correct</Label>
                </div>
              </div>
            </div>
          ))}
          <p className="text-sm text-muted-foreground">Note: Marking a correct answer is optional</p>
        </div>
      )}

      {questionType === 'yes_no' && (
        <div className="space-y-4">
          <Label>Yes/No Options</Label>
          {yesNoAnswers.map((answer, index) => (
            <div key={index} className="flex items-start gap-2 p-3 border rounded-md">
              <div className="flex-1 space-y-2">
                <Label htmlFor={`yesno-option-${index}`}>
                  {index === 0 ? 'Yes Option Text' : 'No Option Text'}
                </Label>
                <Input
                  id={`yesno-option-${index}`}
                  placeholder={index === 0 ? 'Yes text' : 'No text'}
                  value={answer.text}
                  onChange={(e) => handleYesNoAnswerChange(index, 'text', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`yesno-marks-${index}`}>Marks</Label>
                <Input
                  id={`yesno-marks-${index}`}
                  className="w-20"
                  placeholder="Marks"
                  value={answer.marks || ''}
                  onChange={(e) => handleYesNoAnswerChange(index, 'marks', e.target.value)}
                />
              </div>
              <div className="flex flex-col items-center mt-7 ml-2">
                <div className="flex items-center gap-2">
                  <Switch
                    id={`yesno-correct-${index}`}
                    checked={answer.is_correct === true}
                    onCheckedChange={(checked) => handleYesNoAnswerChange(index, 'is_correct', checked)}
                  />
                  <Label htmlFor={`yesno-correct-${index}`}>Correct</Label>
                </div>
              </div>
            </div>
          ))}
          <p className="text-sm text-muted-foreground">Note: Marking a correct answer is optional</p>
        </div>
      )}

      {questionType === 'free_text' && (
        <div className="space-y-2">
          <Label htmlFor="freeTextMarks">Marks</Label>
          <Input
            id="freeTextMarks"
            placeholder="Enter marks for correct answer"
            value={freeTextMarks}
            onChange={(e) => setFreeTextMarks(e.target.value)}
            className="w-32"
          />
        </div>
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
