
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { MultipleChoiceQuestion } from "./MultipleChoiceQuestion";
import { FreeTextQuestion } from "./FreeTextQuestion";
import { QuestionType } from "./types";

interface Answer {
  id: string;
  text: string;
  is_correct: boolean | null;
  marks: string | null;
}

interface Question {
  id: string;
  question: string;
  type: QuestionType;
  answers: Answer[];
}

interface QuestionCardProps {
  question: Question;
  index: number;
  selectedAnswers: { [key: string]: string };
  textAnswers: { [key: string]: string };
  onAnswerSelect: (questionId: string, answerId: string) => void;
  onTextAnswerChange: (questionId: string, text: string) => void;
}

export function QuestionCard({
  question,
  index,
  selectedAnswers,
  textAnswers,
  onAnswerSelect,
  onTextAnswerChange
}: QuestionCardProps) {
  return (
    <Card key={question.id} className="overflow-hidden">
      <CardContent className="p-6">
        <h3 className="text-lg font-medium mb-4">
          <span className="inline-flex items-center justify-center bg-primary text-primary-foreground rounded-full w-6 h-6 mr-2">
            {index + 1}
          </span>
          {question.question}
        </h3>
        
        {question.type === 'multiple_choice' && (
          <MultipleChoiceQuestion 
            questionId={question.id}
            answers={question.answers}
            selectedAnswer={selectedAnswers[question.id] || ""}
            onAnswerSelect={onAnswerSelect}
          />
        )}
        
        {question.type === 'yes_no' && (
          <MultipleChoiceQuestion 
            questionId={question.id}
            answers={question.answers}
            selectedAnswer={selectedAnswers[question.id] || ""}
            onAnswerSelect={onAnswerSelect}
          />
        )}
        
        {question.type === 'free_text' && (
          <FreeTextQuestion
            questionId={question.id}
            textAnswer={textAnswers[question.id] || ""}
            onTextAnswerChange={onTextAnswerChange}
          />
        )}
      </CardContent>
    </Card>
  );
}
