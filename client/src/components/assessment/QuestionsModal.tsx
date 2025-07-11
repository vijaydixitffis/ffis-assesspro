import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AssessmentQuestionInterface } from './AssessmentQuestionInterface';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';
import { toast } from 'sonner';
import { X } from 'lucide-react';

interface Answer {
  id: string;
  text: string;
  is_correct: boolean | null;
  marks: string | null;
}

interface Question {
  id: string;
  question: string;
  type: 'multiple_choice' | 'yes_no' | 'free_text';
  sequence_number: number;
  answers: Answer[];
}

interface Topic {
  id: string;
  title: string;
  description: string;
  sequence_number: number;
  questions: Question[];
}

interface QuestionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  topic: Topic | null;
  assignmentId: string;
  isLastTopic: boolean;
  allAnswers: Record<string, { answerId?: string; textAnswer?: string }>;
  onAnswerChange: (questionId: string, answerId?: string, textAnswer?: string) => void;
  onCompleteAssessment: () => void;
  isSubmitting: boolean;
}

export function QuestionsModal({
  isOpen,
  onClose,
  topic,
  assignmentId,
  isLastTopic,
  allAnswers,
  onAnswerChange,
  onCompleteAssessment,
  isSubmitting
}: QuestionsModalProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const { user } = useAuth();

  // Reset question index when topic changes
  useEffect(() => {
    if (topic) {
      setCurrentQuestionIndex(0);
    }
  }, [topic]);

  const handleNext = () => {
    if (topic && currentQuestionIndex < topic.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleBackToTopics = () => {
    onClose();
  };

  if (!topic) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>{topic.title}</span>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <AssessmentQuestionInterface
            topic={topic}
            questions={topic.questions}
            currentQuestionIndex={currentQuestionIndex}
            answers={allAnswers}
            onAnswerChange={onAnswerChange}
            onNext={handleNext}
            onPrevious={handlePrevious}
            onBackToTopics={handleBackToTopics}
            onCompleteAssessment={onCompleteAssessment}
            isLastTopic={isLastTopic}
            isSubmitting={isSubmitting}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}