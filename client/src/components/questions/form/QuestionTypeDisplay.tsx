
import React from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { QuestionType, QUESTION_TYPES } from '../types';

interface QuestionTypeDisplayProps {
  questionType: QuestionType;
  onQuestionTypeChange: (type: QuestionType) => void;
  isEditing: boolean;
}

const QuestionTypeDisplay: React.FC<QuestionTypeDisplayProps> = ({
  questionType,
  onQuestionTypeChange,
  isEditing,
}) => {
  return (
    <div>
      <Label>Question Type</Label>
      {isEditing ? (
        <Input
          value={
            questionType === 'multiple_choice'
              ? 'Multiple Choice'
              : questionType === 'yes_no'
              ? 'Yes/No'
              : 'Free Text'
          }
          disabled
          className="w-full bg-muted"
        />
      ) : (
        <Select 
          value={questionType} 
          onValueChange={(value) => onQuestionTypeChange(value as QuestionType)}
          disabled={isEditing}
        >
          <SelectTrigger className="w-full">
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
  );
};

export default QuestionTypeDisplay;
