
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

interface FreeTextAnswerProps {
  marks: string;
  comment: string;
  onMarksChange: (value: string) => void;
  onCommentChange: (value: string) => void;
}

const FreeTextAnswer: React.FC<FreeTextAnswerProps> = ({ 
  marks, 
  comment, 
  onMarksChange, 
  onCommentChange 
}) => {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="freeTextMarks">Marks</Label>
        <Input
          id="freeTextMarks"
          placeholder="Enter marks for correct answer"
          value={marks}
          onChange={(e) => onMarksChange(e.target.value)}
          className="w-32"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="freeTextComment">Comment (Optional)</Label>
        <Textarea
          id="freeTextComment"
          placeholder="Optional comment"
          className="h-20"
          value={comment || ''}
          onChange={(e) => onCommentChange(e.target.value)}
        />
      </div>
    </div>
  );
};

export default FreeTextAnswer;
