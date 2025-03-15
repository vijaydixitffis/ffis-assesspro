
import React from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

interface Answer {
  id: string;
  text: string;
  is_correct: boolean | null;
  marks: string | null;
}

interface MultipleChoiceQuestionProps {
  questionId: string;
  answers: Answer[];
  selectedAnswer: string;
  onAnswerSelect: (questionId: string, answerId: string) => void;
}

export function MultipleChoiceQuestion({
  questionId,
  answers,
  selectedAnswer,
  onAnswerSelect
}: MultipleChoiceQuestionProps) {
  return (
    <RadioGroup 
      value={selectedAnswer || ""} 
      onValueChange={(value) => onAnswerSelect(questionId, value)}
      className="space-y-3"
    >
      {answers.map((answer) => (
        <div key={answer.id} className="flex items-start space-x-2 p-2 rounded-md hover:bg-muted">
          <RadioGroupItem value={answer.id} id={answer.id} />
          <Label htmlFor={answer.id} className="cursor-pointer flex-1">
            {answer.text}
          </Label>
        </div>
      ))}
    </RadioGroup>
  );
}
