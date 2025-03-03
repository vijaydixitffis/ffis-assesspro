
import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { QuestionFormProps, QuestionType, QUESTION_TYPES, Answer } from './types';
import { supabase } from '@/integrations/supabase/client';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Plus, Trash2 } from 'lucide-react';
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
  
  // Answer related states
  const [multipleChoiceAnswers, setMultipleChoiceAnswers] = useState<Answer[]>([
    { text: '', is_correct: false, marks: null },
    { text: '', is_correct: false, marks: null }
  ]);
  const [yesNoCorrectAnswer, setYesNoCorrectAnswer] = useState<'yes' | 'no' | null>(null);
  const [yesNoMarks, setYesNoMarks] = useState<string>('');
  const [freeTextMarks, setFreeTextMarks] = useState<string>('');

  // Load existing answers when editing
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
          setMultipleChoiceAnswers(data);
        } else if (questionType === 'yes_no') {
          const yesAnswer = data.find(a => a.text.toLowerCase() === 'yes');
          const noAnswer = data.find(a => a.text.toLowerCase() === 'no');
          
          if (yesAnswer && yesAnswer.is_correct) {
            setYesNoCorrectAnswer('yes');
          } else if (noAnswer && noAnswer.is_correct) {
            setYesNoCorrectAnswer('no');
          }
          
          // Set marks from either the correct answer or the first one
          const correctAnswer = data.find(a => a.is_correct === true);
          setYesNoMarks(correctAnswer?.marks || data[0]?.marks || '');
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
      return newAnswers;
    });
  };

  const handleSetCorrectAnswer = (index: number) => {
    setMultipleChoiceAnswers(prevAnswers => {
      return prevAnswers.map((answer, i) => ({
        ...answer,
        is_correct: i === index
      }));
    });
  };

  const addMultipleChoiceAnswer = () => {
    if (multipleChoiceAnswers.length < 8) {
      setMultipleChoiceAnswers([...multipleChoiceAnswers, { text: '', is_correct: false, marks: null }]);
    }
  };

  const removeMultipleChoiceAnswer = (index: number) => {
    if (multipleChoiceAnswers.length > 2) {
      setMultipleChoiceAnswers(multipleChoiceAnswers.filter((_, i) => i !== index));
    }
  };

  const validateForm = () => {
    if (questionText.trim().length < 5) {
      setError('Question must be at least 5 characters');
      return false;
    }

    if (questionType === 'multiple_choice') {
      // Check if at least two answers are provided
      const filledAnswers = multipleChoiceAnswers.filter(a => a.text.trim() !== '');
      if (filledAnswers.length < 2) {
        setError('At least two answer options are required');
        return false;
      }

      // Check if a correct answer is selected
      const hasCorrectAnswer = multipleChoiceAnswers.some(a => a.is_correct === true);
      if (!hasCorrectAnswer) {
        setError('Please select a correct answer');
        return false;
      }
    } else if (questionType === 'yes_no') {
      if (!yesNoCorrectAnswer) {
        setError('Please select the correct answer (Yes or No)');
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
        // Update existing question
        const { error: updateError } = await supabase
          .from('questions')
          .update({ 
            question: questionData.question,
            is_active: questionData.is_active,
          })
          .eq('id', questionId);

        if (updateError) throw updateError;
      } else {
        // Create new question
        const { data: newQuestion, error: insertError } = await supabase
          .from('questions')
          .insert(questionData)
          .select();

        if (insertError) throw insertError;
        questionId = newQuestion?.[0].id;
      }

      // Handle answers based on question type
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
      // Delete existing answers for this question
      const { error: deleteError } = await supabase
        .from('answers')
        .delete()
        .eq('question_id', questionId);
      
      if (deleteError) throw deleteError;

      // Filter out empty answers
      const validAnswers = multipleChoiceAnswers
        .filter(answer => answer.text.trim() !== '')
        .map(answer => ({
          question_id: questionId,
          text: answer.text,
          is_correct: answer.is_correct,
          marks: answer.is_correct ? answer.marks : null
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
      // Delete existing answers
      const { error: deleteError } = await supabase
        .from('answers')
        .delete()
        .eq('question_id', questionId);
      
      if (deleteError) throw deleteError;

      // Create Yes/No answers
      const answers = [
        {
          question_id: questionId,
          text: 'Yes',
          is_correct: yesNoCorrectAnswer === 'yes',
          marks: yesNoCorrectAnswer === 'yes' ? yesNoMarks : null
        },
        {
          question_id: questionId,
          text: 'No',
          is_correct: yesNoCorrectAnswer === 'no',
          marks: yesNoCorrectAnswer === 'no' ? yesNoMarks : null
        }
      ];

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
      // Delete existing answers
      const { error: deleteError } = await supabase
        .from('answers')
        .delete()
        .eq('question_id', questionId);
      
      if (deleteError) throw deleteError;

      // Create a placeholder answer for free text with marks
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
          // For existing questions, just show the type as text
          <Input
            value={questionType === 'multiple_choice' ? 'Multiple Choice' : 
                  questionType === 'yes_no' ? 'Yes/No' : 'Free Text'}
            disabled
            className="w-[180px] bg-muted"
          />
        ) : (
          // For new questions, show the dropdown
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

      {/* Answer options based on question type */}
      {questionType === 'multiple_choice' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Answer Options</Label>
            <Button 
              type="button" 
              size="sm" 
              variant="outline" 
              onClick={addMultipleChoiceAnswer}
              disabled={multipleChoiceAnswers.length >= 8}
            >
              <Plus className="mr-1 h-4 w-4" /> Add Option
            </Button>
          </div>
          {multipleChoiceAnswers.map((answer, index) => (
            <div key={index} className="flex items-start gap-2">
              <div className="flex-1">
                <Input
                  placeholder={`Option ${index + 1}`}
                  value={answer.text}
                  onChange={(e) => handleMultipleChoiceAnswerChange(index, 'text', e.target.value)}
                />
              </div>
              <div className="flex items-center gap-2">
                <Button 
                  type="button" 
                  size="sm" 
                  variant={answer.is_correct ? "default" : "outline"}
                  onClick={() => handleSetCorrectAnswer(index)}
                >
                  Correct
                </Button>
                {answer.is_correct && (
                  <Input
                    className="w-20"
                    placeholder="Marks"
                    value={answer.marks || ''}
                    onChange={(e) => handleMultipleChoiceAnswerChange(index, 'marks', e.target.value)}
                  />
                )}
                {multipleChoiceAnswers.length > 2 && (
                  <Button 
                    type="button" 
                    size="sm" 
                    variant="ghost" 
                    onClick={() => removeMultipleChoiceAnswer(index)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {questionType === 'yes_no' && (
        <div className="space-y-4">
          <Label>Correct Answer</Label>
          <RadioGroup 
            value={yesNoCorrectAnswer || ''} 
            onValueChange={(value) => setYesNoCorrectAnswer(value as 'yes' | 'no')}
            className="flex items-center space-x-4"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="yes" id="yes" />
              <Label htmlFor="yes">Yes</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="no" id="no" />
              <Label htmlFor="no">No</Label>
            </div>
          </RadioGroup>
          <div>
            <Label htmlFor="yesNoMarks">Marks</Label>
            <Input
              id="yesNoMarks"
              placeholder="Enter marks for correct answer"
              value={yesNoMarks}
              onChange={(e) => setYesNoMarks(e.target.value)}
              className="w-32"
            />
          </div>
        </div>
      )}

      {questionType === 'free_text' && (
        <div>
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
        <Label htmlFor="active">Active</Label>
        <Switch
          id="active"
          checked={isActive}
          onCheckedChange={(checked) => setIsActive(checked)}
        />
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
