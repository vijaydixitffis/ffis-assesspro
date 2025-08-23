import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { AssessmentTopicCard } from './AssessmentTopicCard';
import { AssessmentQuestionInterface } from './AssessmentQuestionInterface';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';
import { toast } from 'sonner';
import { CheckCircle, Award, TrendingUp, BookOpen } from 'lucide-react';

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

interface AssessmentTakingInterfaceProps {
  assignmentId: string;
  assessmentId: string;
  assessmentTitle: string;
  onComplete: () => void;
}

export function AssessmentTakingInterface({
  assignmentId,
  assessmentId,
  assessmentTitle,
  onComplete
}: AssessmentTakingInterfaceProps) {
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
    fetchAssessmentData();
  }, [assessmentId]);

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
        throw topicsError;
      }

      // Sort questions and answers within each topic
      const sortedTopics = topicsData?.map(topic => ({
        ...topic,
        questions: topic.questions
          .sort((a, b) => a.sequence_number - b.sequence_number)
          .map(question => ({
            ...question,
            answers: question.answers.sort((a, b) => a.text.localeCompare(b.text))
          }))
      })) || [];

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
      const { data: existingSubmission, error } = await supabase
        .from('assessment_submissions')
        .select('id, status, submitted_answers')
        .eq('assignment_id', assignmentId)
        .eq('user_id', user?.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (existingSubmission) {
        setSubmissionId(existingSubmission.id);
        
        if (existingSubmission.status === 'completed') {
          setIsCompleted(true);
        }

        // Load existing answers
        if (existingSubmission.submitted_answers) {
          const existingAnswers: Record<string, { answerId?: string; textAnswer?: string }> = {};
          
          for (const answer of existingSubmission.submitted_answers) {
            existingAnswers[answer.question_id] = {
              answerId: answer.answer_id,
              textAnswer: answer.text_answer
            };
          }
          
          setAnswers(existingAnswers);
        }
      }
    } catch (error) {
      console.error('Error checking existing submission:', error);
    }
  };

  const getTopicProgress = (topic: Topic) => {
    const answeredQuestions = topic.questions.filter(q => answers[q.id]).length;
    return {
      questionCount: topic.questions.length,
      completedCount: answeredQuestions,
      status: answeredQuestions === 0 ? 'not_started' : 
              answeredQuestions === topic.questions.length ? 'completed' : 'in_progress'
    };
  };

  const getTotalProgress = () => {
    const totalQuestions = topics.reduce((sum, topic) => sum + topic.questions.length, 0);
    const answeredQuestions = Object.keys(answers).length;
    const completedTopics = topics.filter(topic => 
      getTopicProgress(topic).status === 'completed'
    ).length;
    
    return {
      totalQuestions,
      answeredQuestions,
      completedTopics,
      percentage: totalQuestions > 0 ? (answeredQuestions / totalQuestions) * 100 : 0
    };
  };

  const handleTopicSelect = (topicIndex: number) => {
    setCurrentTopicIndex(topicIndex);
    setCurrentQuestionIndex(0);
    setCurrentView('questions');
  };

  const handleAnswerChange = (questionId: string, answerId?: string, textAnswer?: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: { answerId, textAnswer }
    }));
    
    // Auto-save answers
    saveAnswers(questionId, answerId, textAnswer);
  };

  const saveAnswers = async (questionId: string, answerId?: string, textAnswer?: string) => {
    try {
      // Create submission if it doesn't exist
      if (!submissionId) {
        const { data: newSubmission, error: submissionError } = await supabase
          .from('assessment_submissions')
          .insert({
            assignment_id: assignmentId,
            user_id: user?.id,
            status: 'in_progress',
            submitted_answers: []
          })
          .select()
          .single();

        if (submissionError) throw submissionError;
        setSubmissionId(newSubmission.id);
      }

      // Update the submitted_answers array
      const currentAnswers = Object.entries(answers).map(([qId, answer]) => ({
        question_id: qId,
        answer_id: answer.answerId || null,
        text_answer: answer.textAnswer || null
      }));

      // Add the new answer
      const newAnswer = {
        question_id: questionId,
        answer_id: answerId || null,
        text_answer: textAnswer || null
      };

      const updatedAnswers = [
        ...currentAnswers.filter(a => a.question_id !== questionId),
        newAnswer
      ];

      // Update submission
      const { error: updateError } = await supabase
        .from('assessment_submissions')
        .update({
          submitted_answers: updatedAnswers,
          updated_at: new Date().toISOString()
        })
        .eq('id', submissionId);

      if (updateError) throw updateError;

    } catch (error) {
      console.error('Error saving answers:', error);
      toast.error('Failed to save answer');
    }
  };

  const handleCompleteAssessment = async () => {
    try {
      setIsSubmitting(true);

      if (!submissionId) {
        toast.error('No submission found');
        return;
      }

      // Update submission status to completed
      const { error: updateError } = await supabase
        .from('assessment_submissions')
        .update({
          status: 'completed',
          submitted_at: new Date().toISOString()
        })
        .eq('id', submissionId);

      if (updateError) throw updateError;

      // Update assignment status
      const { error: assignmentError } = await supabase
        .from('assessment_assignments')
        .update({
          status: 'completed'
        })
        .eq('id', assignmentId);

      if (assignmentError) throw assignmentError;

      setIsCompleted(true);
      toast.success('Assessment completed successfully!');

    } catch (error) {
      console.error('Error completing assessment:', error);
      toast.error('Failed to complete assessment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNext = () => {
    const currentTopic = topics[currentTopicIndex];
    console.log('handleNext called:', {
      currentTopicIndex,
      currentQuestionIndex,
      totalTopics: topics.length,
      questionsInCurrentTopic: currentTopic?.questions?.length
    });
    
    if (!currentTopic || !currentTopic.questions) {
      console.error('Current topic or questions are undefined');
      return;
    }
    
    if (currentQuestionIndex < currentTopic.questions.length - 1) {
      console.log('Moving to next question');
      setCurrentQuestionIndex(prev => prev + 1);
    } else if (currentTopicIndex < topics.length - 1) {
      console.log('Moving to next topic');
      setCurrentTopicIndex(prev => prev + 1);
      setCurrentQuestionIndex(0);
    } else {
      console.log('Already at last question of last topic');
    }
  };

  const handlePrevious = () => {
    console.log('handlePrevious called:', {
      currentTopicIndex,
      currentQuestionIndex,
      totalTopics: topics.length
    });
    
    if (currentQuestionIndex > 0) {
      console.log('Moving to previous question');
      setCurrentQuestionIndex(prev => prev - 1);
    } else if (currentTopicIndex > 0) {
      console.log('Moving to previous topic');
      setCurrentTopicIndex(prev => {
        const prevTopic = topics[prev - 1];
        setCurrentQuestionIndex(prevTopic.questions.length - 1);
        return prev - 1;
      });
    } else {
      console.log('Already at first question of first topic');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading assessment...</p>
        </div>
      </div>
    );
  }

  if (isCompleted) {
    const progress = getTotalProgress();
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-6">
        <div className="max-w-4xl mx-auto p-6 text-center">
        <div className="mb-8">
          <div className="w-20 h-20 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Award className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Assessment Completed!</h1>
          <p className="text-gray-600 dark:text-gray-300">Thank you for completing the {assessmentTitle}</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 mb-6">
         <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600 mb-1">
                  {progress.answeredQuestions}
                </div>
                <div className="text-sm text-gray-600">Questions Answered</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600 mb-1">
                  {progress.completedTopics}
                </div>
                <div className="text-sm text-gray-600">Topics Completed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600 mb-1">
                  {Math.round(progress.percentage)}%
                </div>
                <div className="text-sm text-gray-600">Progress</div>
              </div>
            </div>
         </div>
       </div>

        <p className="text-sm text-gray-500">Use the menu on the left to navigate to other sections</p>
        </div>
      </div>
    );
  }

  if (currentView === 'questions') {
    const currentTopic = topics[currentTopicIndex];
    const isLastTopic = currentTopicIndex === topics.length - 1;
    
    console.log('Rendering questions view:', {
      currentTopicIndex,
      currentQuestionIndex,
      currentTopic: currentTopic?.title,
      isLastTopic,
      totalTopics: topics.length
    });
    
    // Safety check - if current topic doesn't exist, go back to topics view
    if (!currentTopic) {
      console.error('Current topic is undefined, returning to topics view');
      setCurrentView('topics');
      return null;
    }
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-6">
        <div className="container mx-auto px-4">
          <AssessmentQuestionInterface
            topic={currentTopic}
            questions={currentTopic.questions}
            currentQuestionIndex={currentQuestionIndex}
            answers={answers}
            onAnswerChange={handleAnswerChange}
            onNext={handleNext}
            onPrevious={handlePrevious}
            onBackToTopics={() => setCurrentView('topics')}
            onCompleteAssessment={handleCompleteAssessment}
            isLastTopic={isLastTopic}
            isSubmitting={isSubmitting}
          />
        </div>
      </div>
    );
  }

  // Topics overview
  const progress = getTotalProgress();
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-6">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg flex items-center justify-center">
              <BookOpen className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{assessmentTitle}</h1>
          </div>
          <p className="text-gray-600 dark:text-gray-300">Evaluate your capabilities across key domains</p>
        </div>

        {/* Overall Progress */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 mb-8">
          <div className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-emerald-600" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Overall Progress</h2>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span>Complete all categories to get your assessment</span>
                <span className="font-medium">
                  {progress.answeredQuestions}/{progress.totalQuestions} questions answered
                </span>
              </div>
              <Progress value={progress.percentage} className="h-3" />
              <div className="flex items-center justify-between text-sm text-gray-600">
                <span>{Math.round(progress.percentage)}% Complete</span>
                <span>{progress.completedTopics}/{topics.length} Categories Done</span>
              </div>
            </div>
          </div>
        </div>

        {/* Topic Cards */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {topics.map((topic, index) => {
            const topicProgress = getTopicProgress(topic);
            
            return (
              <AssessmentTopicCard
                key={topic.id}
                topic={{
                  ...topic,
                  ...topicProgress
                }}
                onClick={() => handleTopicSelect(index)}
                isCurrentTopic={index === currentTopicIndex}
              />
            );
          })}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center gap-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-6">
          {progress.answeredQuestions > 0 && (
            <Button variant="outline" onClick={() => setCurrentView('questions')}>
              Continue Assessment
            </Button>
          )}
          
          {progress.completedTopics === topics.length && (
            <Button onClick={handleCompleteAssessment} disabled={isSubmitting}>
              {isSubmitting ? 'Submitting...' : 'Submit Assessment'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}