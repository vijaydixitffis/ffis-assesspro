
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Answer } from '../types';

interface MultipleChoiceAnswersProps {
  answers: Answer[];
  onChange: (index: number, field: keyof Answer, value: any) => void;
}

const MultipleChoiceAnswers: React.FC<MultipleChoiceAnswersProps> = ({ answers, onChange }) => {
  return (
    <div className="space-y-4">
      <Label>Answer Options (Exactly 4)</Label>
      {answers.map((answer, index) => (
        <div key={index} className="flex items-start gap-2 p-3 border rounded-md">
          <div className="flex-1 space-y-2">
            <Label htmlFor={`option-${index}`}>Option {index + 1}</Label>
            <Input
              id={`option-${index}`}
              placeholder={`Option ${index + 1}`}
              value={answer.text}
              onChange={(e) => onChange(index, 'text', e.target.value)}
            />
            <Label htmlFor={`comment-${index}`}>Comment (Optional)</Label>
            <Textarea
              id={`comment-${index}`}
              placeholder="Optional comment"
              className="h-20"
              value={answer.comment || ''}
              onChange={(e) => onChange(index, 'comment', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor={`marks-${index}`}>Marks</Label>
            <Input
              id={`marks-${index}`}
              className="w-20"
              placeholder="Marks"
              value={answer.marks || ''}
              onChange={(e) => onChange(index, 'marks', e.target.value)}
            />
          </div>
          <div className="flex flex-col items-center mt-7 ml-2">
            <div className="flex items-center gap-2">
              <Switch
                id={`correct-${index}`}
                checked={answer.is_correct === true}
                onCheckedChange={(checked) => onChange(index, 'is_correct', checked)}
              />
              <Label htmlFor={`correct-${index}`}>Correct</Label>
            </div>
          </div>
        </div>
      ))}
      <p className="text-sm text-muted-foreground">Note: Marking a correct answer is optional</p>
    </div>
  );
};

export default MultipleChoiceAnswers;
