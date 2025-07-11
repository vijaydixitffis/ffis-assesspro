
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Answer } from '../types';

interface YesNoAnswersProps {
  answers: Answer[];
  onChange: (index: number, field: keyof Answer, value: any) => void;
}

const YesNoAnswers: React.FC<YesNoAnswersProps> = ({ answers, onChange }) => {
  return (
    <div className="space-y-4">
      <Label>Yes/No Options</Label>
      {answers.map((answer, index) => (
        <div key={index} className="flex items-start gap-2 p-3 border rounded-md">
          <div className="flex-1 space-y-2">
            <Label htmlFor={`yesno-option-${index}`}>
              {index === 0 ? 'Yes Option Text' : 'No Option Text'}
            </Label>
            <Input
              id={`yesno-option-${index}`}
              placeholder={index === 0 ? 'Yes text' : 'No text'}
              value={answer.text}
              onChange={(e) => onChange(index, 'text', e.target.value)}
            />
            <Label htmlFor={`yesno-comment-${index}`}>Comment (Optional)</Label>
            <Textarea
              id={`yesno-comment-${index}`}
              placeholder="Optional comment"
              className="h-20"
              value={answer.comment || ''}
              onChange={(e) => onChange(index, 'comment', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor={`yesno-marks-${index}`}>Marks</Label>
            <Input
              id={`yesno-marks-${index}`}
              className="w-20"
              placeholder="Marks"
              value={answer.marks || ''}
              onChange={(e) => onChange(index, 'marks', e.target.value)}
            />
          </div>
          <div className="flex flex-col items-center mt-7 ml-2">
            <div className="flex items-center gap-2">
              <Switch
                id={`yesno-correct-${index}`}
                checked={answer.is_correct === true}
                onCheckedChange={(checked) => onChange(index, 'is_correct', checked)}
              />
              <Label htmlFor={`yesno-correct-${index}`}>Correct</Label>
            </div>
          </div>
        </div>
      ))}
      <p className="text-sm text-muted-foreground">Note: Marking a correct answer is optional</p>
    </div>
  );
};

export default YesNoAnswers;
