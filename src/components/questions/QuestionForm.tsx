
import React, { useState } from 'react';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { QuestionFormProps, QuestionType, QUESTION_TYPES } from './types';
import { supabase } from '@/integrations/supabase/client';

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

  const handleSubmit = async () => {
    if (questionText.trim().length < 5) {
      setError('Question must be at least 5 characters');
      return;
    }

    setIsSubmitting(true);
    setError('');
    
    try {
      const questionData = {
        question: questionText,
        type: questionType,
        is_active: isActive,
        topic_id: topicId,
        created_by: userId,
      };
      
      if (question?.id) {
        // Update existing question
        const { error: updateError } = await supabase
          .from('questions')
          .update({ 
            question: questionData.question,
            is_active: questionData.is_active,
          })
          .eq('id', question.id);

        if (updateError) throw updateError;
      } else {
        // Create new question
        const { error: insertError } = await supabase
          .from('questions')
          .insert(questionData);

        if (insertError) throw insertError;
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

  return (
    <div className="space-y-4">
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
