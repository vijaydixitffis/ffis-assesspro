
import React from "react";
import { Textarea } from "@/components/ui/textarea";

interface FreeTextQuestionProps {
  questionId: string;
  textAnswer: string;
  onTextAnswerChange: (questionId: string, text: string) => void;
}

export function FreeTextQuestion({
  questionId,
  textAnswer,
  onTextAnswerChange
}: FreeTextQuestionProps) {
  return (
    <Textarea
      placeholder="Type your answer here..."
      value={textAnswer || ""}
      onChange={(e) => onTextAnswerChange(questionId, e.target.value)}
      className="min-h-[100px]"
    />
  );
}
