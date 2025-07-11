import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { AssessmentTopicCard } from './AssessmentTopicCard';
import { AssessmentQuestionInterface } from './AssessmentQuestionInterface';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';
import { toast } from 'sonner';
import { CheckCircle, Award, TrendingUp, X } from 'lucide-react';

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

interface AssessmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  assignmentId: string;
  assessmentId: string;
  assessmentTitle: string;
  onComplete: () => void;
}

export function AssessmentModal({
  isOpen,
  onClose,
  assignmentId,
  assessmentId,
  assessmentTitle,
  onComplete
}: AssessmentModalProps) {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [currentView, setCurrentView] = useState<'topics' | 'questions'>('topics');
  const [currentTopicIndex, setCurrentTopicIndex] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, { answerId?: string; textAnswer?: string }>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionId, setSubmissionId] = useState<string | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (isOpen) {
      fetchAssessmentData();
    }
  }, [isOpen, assessmentId]);

  const fetchAssessmentData = async () => {
    try {
      setIsLoading(true);
      
      // Fetch topics with questions
      const { data: topicsData, error: topicsError } = await supabase
        .from('topics')
        .select(`
          id,
          title,
          description,
          sequence_number,
          questions (
            id,
            question,
            type,
            sequence_number,
            answers (
              id,
              text,
              is_correct,
              marks
            )
          )
        `)
        .eq('assessment_id', assessmentId)
        .eq('is_active', true)
        .order('sequence_number');

      if (topicsError) {
        console.error('Error fetching topics:', topicsError);
        toast.error('Failed to load assessment topics');
        return;
      }

      // Sort questions within each topic
      const sortedTopics = topicsData.map(topic => ({
        ...topic,
        questions: topic.questions
          .filter(q => q.type !== null)
          .sort((a, b) => a.sequence_number - b.sequence_number)
          .map(q => ({
            ...q,
            answers: q.answers.sort((a, b) => parseInt(a.marks || '0') - parseInt(b.marks || '0'))
          }))
      }));

      setTopics(sortedTopics);
      
      // Check if there's an existing submission
      await checkExistingSubmission();
    } catch (error) {
      console.error('Error fetching assessment data:', error);
      toast.error('Failed to load assessment data');
    } finally {
      setIsLoading(false);
    }
  };

  const checkExistingSubmission = async () => {
    try {
      const { data: submissionData, error: submissionError } = await supabase
        .from('assessment_submissions')
        .select('id, status')
        .eq('assignment_id', assignmentId)
        .eq('user_id', user?.id)
        .single();

      if (submissionError && submissionError.code !== 'PGRST116') {
        console.error('Error checking existing submission:', submissionError);
        return;
      }

      if (submissionData) {
        setSubmissionId(submissionData.id);
        if (submissionData.status === 'COMPLETED') {
          setIsCompleted(true);
        }
        // Load existing answers
        await loadExistingAnswers(submissionData.id);
      }
    } catch (error) {
      console.error('Error checking existing submission:', error);
    }
  };

  const loadExistingAnswers = async (submissionId: string) => {
    try {
      const { data: answersData, error: answersError } = await supabase
        .from('assessment_answers')
        .select('question_id, answer_id, text_answer')
        .eq('submission_id', submissionId);

      if (answersError) {
        console.error('Error loading existing answers:', answersError);
        return;
      }

      const existingAnswers: Record<string, { answerId?: string; textAnswer?: string }> = {};
      answersData.forEach(answer => {
        existingAnswers[answer.question_id] = {
          answerId: answer.answer_id || undefined,
          textAnswer: answer.text_answer || undefined
        };
      });

      setAnswers(existingAnswers);
    } catch (error) {
      console.error('Error loading existing answers:', error);
    }
  };

  const handleTopicClick = (topicIndex: number) => {
    setCurrentTopicIndex(topicIndex);
    setCurrentQuestionIndex(0);
    setCurrentView('questions');
  };

  const handleBackToTopics = () => {
    setCurrentView('topics');
  };

  const handleAnswerChange = (questionId: string, answerId?: string, textAnswer?: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: { answerId, textAnswer }
    }));
  };

  const handleNext = () => {
    const currentTopic = topics[currentTopicIndex];
    if (currentQuestionIndex < currentTopic.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleCompleteAssessment = async () => {
    if (isSubmitting || isCompleted) return;

    setIsSubmitting(true);
    try {
      let currentSubmissionId = submissionId;

      // Create submission if it doesn't exist
      if (!currentSubmissionId) {
        const { data: newSubmission, error: submissionError } = await supabase
          .from('assessment_submissions')
          .insert({
            assignment_id: assignmentId,
            user_id: user?.id,
            status: 'IN_PROGRESS',
            started_at: new Date().toISOString()
          })
          .select('id')
          .single();

        if (submissionError) {
          console.error('Error creating submission:', submissionError);
          toast.error('Failed to create assessment submission');
          return;
        }

        currentSubmissionId = newSubmission.id;
        setSubmissionId(currentSubmissionId);
      }

      // Save all answers
      for (const [questionId, answer] of Object.entries(answers)) {
        if (answer.answerId || answer.textAnswer) {
          const { error: answerError } = await supabase
            .from('assessment_answers')
            .upsert({
              submission_id: currentSubmissionId,
              question_id: questionId,
              answer_id: answer.answerId || null,
              text_answer: answer.textAnswer || null
            }, {
              onConflict: 'submission_id, question_id'
            });

          if (answerError) {
            console.error('Error saving answer:', answerError);
            toast.error('Failed to save some answers');
            return;
          }
        }
      }

      // Mark submission as completed
      const { error: updateError } = await supabase
        .from('assessment_submissions')
        .update({
          status: 'COMPLETED',
          completed_at: new Date().toISOString()
        })
        .eq('id', currentSubmissionId);

      if (updateError) {
        console.error('Error completing submission:', updateError);
        toast.error('Failed to complete assessment');
        return;
      }

      // Update assignment status
      const { error: assignmentError } = await supabase
        .from('assessment_assignments')
        .update({
          status: 'COMPLETED'
        })
        .eq('id', assignmentId);

      if (assignmentError) {
        console.error('Error updating assignment status:', assignmentError);
        // Don't return here, as the assessment is still completed
      }

      setIsCompleted(true);
      toast.success('Assessment completed successfully!');
      onComplete();
      onClose();
    } catch (error) {
      console.error('Error completing assessment:', error);
      toast.error('Failed to complete assessment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getTopicProgress = (topic: Topic) => {
    const topicQuestions = topic.questions;
    const answeredQuestions = topicQuestions.filter(q => answers[q.id]);
    return {
      completed: answeredQuestions.length,
      total: topicQuestions.length,
      percentage: topicQuestions.length > 0 ? (answeredQuestions.length / topicQuestions.length) * 100 : 0
    };
  };

  const getOverallProgress = () => {
    const totalQuestions = topics.reduce((sum, topic) => sum + topic.questions.length, 0);
    const answeredQuestions = Object.keys(answers).length;
    return {
      completed: answeredQuestions,
      total: totalQuestions,
      percentage: totalQuestions > 0 ? (answeredQuestions / totalQuestions) * 100 : 0
    };
  };

  const isLastTopic = currentTopicIndex === topics.length - 1;
  const allTopicsCompleted = topics.every(topic => {
    const progress = getTopicProgress(topic);
    return progress.completed === progress.total;
  });

  if (isLoading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Loading Assessment...</DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center h-40">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-sm text-gray-600">Loading assessment data...</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>{assessmentTitle}</span>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        {currentView === 'topics' ? (
          <div className="space-y-6">
            <div className="text-center">
              <div className="mb-4">
                <Progress value={getOverallProgress().percentage} className="w-full" />
                <p className="text-sm text-gray-600 mt-2">
                  {getOverallProgress().completed} of {getOverallProgress().total} questions completed
                </p>
              </div>
            </div>

            <div className="grid gap-4">
              {topics.map((topic, index) => {
                const progress = getTopicProgress(topic);
                return (
                  <AssessmentTopicCard
                    key={topic.id}
                    topic={{
                      id: topic.id,
                      title: topic.title,
                      description: topic.description,
                      sequence_number: topic.sequence_number,
                      questionCount: progress.total,
                      completedCount: progress.completed,
                      status: progress.completed === progress.total ? 'completed' : 
                              progress.completed > 0 ? 'in_progress' : 'not_started'
                    }}
                    onClick={() => handleTopicClick(index)}
                  />
                );
              })}
            </div>

            {allTopicsCompleted && (
              <div className="text-center">
                <Card className="bg-green-50 border-green-200">
                  <CardContent className="pt-6">
                    <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-green-800 mb-2">
                      All Topics Completed!
                    </h3>
                    <p className="text-green-700 mb-4">
                      You have answered all questions. Ready to submit your assessment?
                    </p>
                    <Button 
                      onClick={handleCompleteAssessment}
                      disabled={isSubmitting || isCompleted}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      {isSubmitting ? 'Submitting...' : 'Submit Assessment'}
                    </Button>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        ) : (
          <AssessmentQuestionInterface
            topic={topics[currentTopicIndex]}
            questions={topics[currentTopicIndex].questions}
            currentQuestionIndex={currentQuestionIndex}
            answers={answers}
            onAnswerChange={handleAnswerChange}
            onNext={handleNext}
            onPrevious={handlePrevious}
            onBackToTopics={handleBackToTopics}
            onCompleteAssessment={handleCompleteAssessment}
            isLastTopic={isLastTopic}
            isSubmitting={isSubmitting}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}