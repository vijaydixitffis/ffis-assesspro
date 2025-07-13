import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, CheckCircle } from 'lucide-react';

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
}

interface AssessmentQuestionInterfaceProps {
  topic: Topic;
  questions: Question[];
  currentQuestionIndex: number;
  answers: Record<string, { answerId?: string; textAnswer?: string }>;
  onAnswerChange: (questionId: string, answerId?: string, textAnswer?: string) => void;
  onNext: () => void;
  onPrevious: () => void;
  onBackToTopics: () => void;
  onCompleteAssessment: () => void;
  isLastTopic: boolean;
  isSubmitting: boolean;
}

export function AssessmentQuestionInterface({
  topic,
  questions,
  currentQuestionIndex,
  answers,
  onAnswerChange,
  onNext,
  onPrevious,
  onBackToTopics,
  onCompleteAssessment,
  isLastTopic,
  isSubmitting
}: AssessmentQuestionInterfaceProps) {
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');
  const [textAnswer, setTextAnswer] = useState<string>('');

  const currentQuestion = questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === questions.length - 1;
  const isFirstQuestion = currentQuestionIndex === 0;

  const answeredQuestions = questions.filter(q => answers[q.id]).length;
  const progressPercentage = questions.length > 0 ? (answeredQuestions / questions.length) * 100 : 0;

  useEffect(() => {
    if (currentQuestion) {
      const existingAnswer = answers[currentQuestion.id];
      if (existingAnswer) {
        setSelectedAnswer(existingAnswer.answerId || '');
        setTextAnswer(existingAnswer.textAnswer || '');
      } else {
        setSelectedAnswer('');
        setTextAnswer('');
      }
    }
  }, [currentQuestion, answers]);

  const handleAnswerSelect = (answerId: string) => {
    setSelectedAnswer(answerId);
    onAnswerChange(currentQuestion.id, answerId, undefined);
  };

  const handleTextChange = (text: string) => {
    setTextAnswer(text);
    onAnswerChange(currentQuestion.id, undefined, text);
  };

  const isCurrentQuestionAnswered = () => {
    if (!currentQuestion) return false;
    const answer = answers[currentQuestion.id];
    
    if (currentQuestion.type === 'free_text') {
      return answer?.textAnswer?.trim() !== '';
    } else {
      return answer?.answerId !== undefined;
    }
  };

  const renderAnswerInput = () => {
    if (!currentQuestion) return null;

    switch (currentQuestion.type) {
      case 'free_text':
        return (
          <div className="space-y-4">
            <Label htmlFor="text-answer" className="text-sm font-medium">
              Your Answer
            </Label>
            <Textarea
              id="text-answer"
              value={textAnswer}
              onChange={(e) => handleTextChange(e.target.value)}
              placeholder="Please provide your detailed answer..."
              className="min-h-[120px]"
            />
          </div>
        );

      case 'multiple_choice':
      case 'yes_no':
        return (
          <RadioGroup value={selectedAnswer} onValueChange={handleAnswerSelect}>
            <div className="grid gap-4">
              {currentQuestion.answers.map((answer) => (
                <div key={answer.id} className="flex items-center space-x-3">
                  <RadioGroupItem 
                    value={answer.id} 
                    id={`answer-${answer.id}`}
                    className="text-blue-600"
                  />
                  <Label 
                    htmlFor={`answer-${answer.id}`}
                    className="flex-1 cursor-pointer text-sm font-medium leading-relaxed"
                  >
                    {answer.text}
                  </Label>
                </div>
              ))}
            </div>
          </RadioGroup>
        );

      default:
        return null;
    }
  };

  if (!currentQuestion) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          onClick={onBackToTopics}
          className="flex items-center gap-2"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Topics
        </Button>
        
        <div className="flex items-center gap-4">
          <Badge variant="outline">
            Topic {topic.sequence_number}
          </Badge>
          <div className="text-sm text-gray-600">
            Question {currentQuestionIndex + 1} of {questions.length}
          </div>
        </div>
      </div>

      {/* Progress */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium">{topic.title}</span>
          <span className="text-gray-600">
            {answeredQuestions}/{questions.length} answered
          </span>
        </div>
        <Progress value={progressPercentage} className="h-2" />
      </div>

      {/* Question Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg leading-relaxed">
            {currentQuestion.question}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {renderAnswerInput()}
          
          {/* Navigation */}
          <div className="flex items-center justify-between pt-4 border-t">
            <Button
              variant="outline"
              onClick={onPrevious}
              disabled={isFirstQuestion}
              className="flex items-center gap-2"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </Button>

            <div className="flex items-center gap-2">
              {isCurrentQuestionAnswered() && (
                <CheckCircle className="w-4 h-4 text-green-600" />
              )}
              <span className="text-sm text-gray-600">
                {isCurrentQuestionAnswered() ? 'Answered' : 'Not answered'}
              </span>
            </div>

            {isLastQuestion ? (
              isLastTopic ? (
                <Button
                  onClick={onCompleteAssessment}
                  disabled={isSubmitting}
                  className="flex items-center gap-2"
                >
                  {isSubmitting ? 'Submitting...' : 'Complete Assessment'}
                </Button>
              ) : (
                <Button
                  onClick={() => {
                    console.log('Next Topic button clicked');
                    onNext();
                  }}
                  className="flex items-center gap-2"
                >
                  Next Topic
                  <ChevronRight className="w-4 h-4" />
                </Button>
              )
            ) : (
              <Button
                onClick={() => {
                  console.log('Next button clicked');
                  onNext();
                }}
                className="flex items-center gap-2"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Question Navigator */}
      <div className="flex flex-wrap gap-2 justify-center">
        {questions.map((_, index) => (
          <button
            key={index}
            onClick={() => {
              // Allow navigation to specific question
              const diff = index - currentQuestionIndex;
              if (diff > 0) {
                for (let i = 0; i < diff; i++) {
                  onNext();
                }
              } else if (diff < 0) {
                for (let i = 0; i < Math.abs(diff); i++) {
                  onPrevious();
                }
              }
            }}
            className={`w-8 h-8 rounded-full text-sm font-medium transition-all ${
              index === currentQuestionIndex
                ? 'bg-blue-600 text-white'
                : answers[questions[index].id]
                ? 'bg-green-100 text-green-700 border border-green-300'
                : 'bg-gray-100 text-gray-600 border border-gray-300 hover:bg-gray-200'
            }`}
          >
            {index + 1}
          </button>
        ))}
      </div>
    </div>
  );
}