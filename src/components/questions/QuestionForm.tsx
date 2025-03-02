import React, { useState } from 'react';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface QuestionFormProps {
  onSubmit: (questionData: { question: string; type: "multiple_choice" | "yes_no" | "free_text"; is_active: boolean }) => Promise<void>;
  initialQuestion?: string;
  initialType?: "multiple_choice" | "yes_no" | "free_text";
  initialIsActive?: boolean;
  onCancel: () => void;
}

const QuestionForm: React.FC<QuestionFormProps> = ({ onSubmit, initialQuestion = '', initialType = 'multiple_choice', initialIsActive = true, onCancel }) => {
  const [question, setQuestion] = useState(initialQuestion);
  const [questionType, setQuestionType] = useState<"multiple_choice" | "yes_no" | "free_text">(initialType);
  const [isActive, setIsActive] = useState(initialIsActive);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError('');
    
    try {
      const questionData = {
        question: question,
        type: questionType,
        is_active: isActive
      } as { question: string; type: "multiple_choice" | "yes_no" | "free_text"; is_active: boolean };
      
      await onSubmit(questionData);
      toast.success('Question saved successfully!');
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
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Enter question text"
        />
      </div>

      <div>
        <Label>Question Type</Label>
        <Select value={questionType} onValueChange={(value) => setQuestionType(value as "multiple_choice" | "yes_no" | "free_text")}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="multiple_choice">Multiple Choice</SelectItem>
            <SelectItem value="yes_no">Yes/No</SelectItem>
            <SelectItem value="free_text">Free Text</SelectItem>
          </SelectContent>
        </Select>
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
        <Button variant="ghost" onClick={onCancel}>Cancel</Button>
        <Button disabled={isSubmitting} onClick={handleSubmit}>
          {isSubmitting ? 'Saving...' : 'Save Question'}
        </Button>
      </div>
    </div>
  );
};

export default QuestionForm;
