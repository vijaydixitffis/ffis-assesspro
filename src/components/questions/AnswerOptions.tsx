
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Trash, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { Answer, QuestionType } from './types';

interface AnswerOptionsProps {
  answers: Answer[];
  setAnswers: React.Dispatch<React.SetStateAction<Answer[]>>;
  questionType: QuestionType;
}

export default function AnswerOptions({ 
  answers, 
  setAnswers, 
  questionType 
}: AnswerOptionsProps) {
  
  // Ensure we always have the right number of options for multiple choice
  useEffect(() => {
    if (questionType === 'multiple_choice' && answers.length < 4) {
      const currentLength = answers.length;
      const newAnswers = [...answers];
      
      // Add empty answers until we have 4
      for (let i = currentLength; i < 4; i++) {
        newAnswers.push({ text: '', is_correct: false, marks: '0', comment: null });
      }
      
      setAnswers(newAnswers);
    }
  }, [questionType, answers.length, setAnswers]);
  
  const removeAnswer = (index: number) => {
    setAnswers(prevAnswers => {
      const newAnswers = [...prevAnswers];
      newAnswers.splice(index, 1);
      // Add a new empty option to maintain 4 options
      if (questionType === 'multiple_choice' && newAnswers.length < 4) {
        newAnswers.push({ text: '', is_correct: false, marks: '0', comment: null });
      }
      return newAnswers;
    });
  };

  const updateAnswer = (index: number, field: keyof Answer, value: any) => {
    setAnswers(prevAnswers => {
      const newAnswers = [...prevAnswers];
      newAnswers[index] = { ...newAnswers[index], [field]: value };
      
      return newAnswers;
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Answer Options</h3>
      </div>

      <div className="space-y-3">
        {answers.map((answer, index) => (
          <Card key={index}>
            <CardContent className="pt-4">
              <div className="flex flex-col space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {questionType !== 'free_text' && (
                      <>
                        <Switch
                          checked={answer.is_correct === true}
                          onCheckedChange={(checked) => updateAnswer(index, 'is_correct', checked)}
                        />
                        <Label>
                          {answer.is_correct === true ? 'Correct answer' : 'Incorrect answer'}
                        </Label>
                      </>
                    )}
                    {questionType === 'free_text' && (
                      <Label>Answer Text</Label>
                    )}
                  </div>
                  {questionType === 'multiple_choice' && (
                    <div className="text-sm text-muted-foreground">
                      Option {index + 1} of 4
                    </div>
                  )}
                </div>

                <div className="flex gap-4">
                  <div className="flex-1">
                    <Label htmlFor={`answer-${index}`}>Answer Text</Label>
                    <Input
                      id={`answer-${index}`}
                      value={answer.text}
                      onChange={(e) => updateAnswer(index, 'text', e.target.value)}
                      placeholder="Enter answer text"
                      disabled={questionType === 'yes_no'}
                    />
                  </div>
                  <div className="w-24">
                    <Label htmlFor={`marks-${index}`}>Marks</Label>
                    <Input
                      id={`marks-${index}`}
                      value={answer.marks || '0'}
                      onChange={(e) => updateAnswer(index, 'marks', e.target.value)}
                      placeholder="Marks"
                      type="number"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {questionType === 'free_text' && (
          <div className="text-sm text-muted-foreground italic">
            For free text questions, provide the exact correct answer text that will be used for scoring.
          </div>
        )}
      </div>
    </div>
  );
}
