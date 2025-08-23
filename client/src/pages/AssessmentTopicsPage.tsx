
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/auth";
import { DashboardNav } from "@/components/DashboardNav";
import { supabase } from "@/integrations/supabase/client";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { FileQuestion, MessageCircleQuestion, ArrowLeft, Play, Clock, CheckCircle2, BookOpen } from "lucide-react";
import { getTopicIcon } from "@/utils/iconUtils";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { QuestionsModal } from "@/components/assessment/QuestionsModal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Database } from "lucide-react";

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
  icon?: string | null;
  status?: string | null;
  questions?: Question[];
}

export default function AssessmentTopicsPage() {
  const { assessmentId } = useParams<{ assessmentId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [topics, setTopics] = useState<Topic[]>([]);
  const [assessmentTitle, setAssessmentTitle] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [isQuestionsModalOpen, setIsQuestionsModalOpen] = useState(false);
  const [assignmentId, setAssignmentId] = useState<string | null>(null);
  const [allAnswers, setAllAnswers] = useState<Record<string, { answerId?: string; textAnswer?: string }>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (assessmentId && user?.id) {
      fetchAssessmentDetails();
      fetchTopics();
    }
  }, [assessmentId, user]);

  async function fetchAssessmentDetails() {
    try {
      const { data, error } = await supabase
        .from('assessments')
        .select('title')
        .eq('id', assessmentId)
        .single();

      if (error) {
        console.error('Error fetching assessment details:', error);
        toast.error('Failed to load assessment details');
        return;
      }

      setAssessmentTitle(data.title);
    } catch (error) {
      console.error('Error in fetch operation:', error);
      toast.error('An error occurred while loading assessment details');
    }
  }

  async function fetchTopics() {
    setIsLoading(true);
    try {
      // First get the assignment for this assessment
      const { data: assignmentData, error: assignmentError } = await supabase
        .from('assessment_assignments')
        .select('id')
        .eq('assessment_id', assessmentId)
        .eq('user_id', user?.id)
        .maybeSingle();

      if (assignmentError) {
        console.error('Error fetching assessment assignment:', assignmentError);
        toast.error('Failed to load assessment assignment');
      }

      // Fetch topics
      const { data, error } = await supabase
        .from('topics')
        .select('id, title, description, sequence_number, icon')
        .eq('assessment_id', assessmentId)
        .eq('is_active', true)
        .order('sequence_number', { ascending: true });

      if (error) {
        console.error('Error fetching topics:', error);
        toast.error('Failed to load topics');
        return;
      }

      // In fetchTopics, filter out topics with missing required fields before setTopics
      const topicsData = (data || []).filter(
        (t: any) => t && t.id && t.title && t.description && t.sequence_number !== null && t.sequence_number !== undefined
      );
      
      // If we have an assignment, fetch topic status for each topic
      if (assignmentData) {
        setAssignmentId(assignmentData.id);
        // Fetch the user's submission for this assessment
        const { data: submission, error: submissionError } = await supabase
          .from('assessment_submissions')
          .select('id')
          .eq('user_id', user.id)
          .eq('assessment_id', assessmentId)
          .maybeSingle();
        if (!submission || submissionError) {
          console.error('No submission found for user/assessment', submissionError);
          setTopics(topicsData);
          return;
        }
        // For each topic, check if there's a corresponding topic assignment
        const topicsWithStatus = await Promise.all(topicsData.map(async (topic) => {
          const { data: topicAssignmentData, error: topicAssignmentError } = await supabase
            .from('topic_assignments')
            .select('status')
            .eq('topic_id', topic.id)
            .eq('submission_id', submission.id)
            .maybeSingle();
          if (topicAssignmentError) {
            console.error('Error fetching topic assignment:', topicAssignmentError);
            return { ...topic, status: null };
          }
          return { 
            ...topic, 
            status: topicAssignmentData?.status || null 
          };
        }));
        setTopics(topicsWithStatus);
      } else {
        // No assignment, just set topics without status
        setTopics(topicsData);
      }
    } catch (error) {
      console.error('Error in fetch operation:', error);
      toast.error('An error occurred while loading topics');
    } finally {
      setIsLoading(false);
    }
  }

  const handleAnswerQuestions = async (topicId: string) => {
    try {
      // Fetch topic with questions
      const { data: topicData, error: topicError } = await supabase
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
        .eq('id', topicId)
        .single();

      if (topicError) {
        console.error('Error fetching topic with questions:', topicError);
        toast.error('Failed to load topic questions');
        return;
      }

      // Sort questions and answers
      if (!topicData || !topicData.id || !topicData.title || !topicData.description || topicData.sequence_number === null || topicData.sequence_number === undefined) {
        toast.error('Invalid topic data received');
        return;
      }
      const sortedTopic = {
        ...topicData,
        sequence_number: topicData.sequence_number ?? 0, // ensure number
        questions: (topicData.questions || [])
          .filter(q => q.type !== null && q.sequence_number !== null && q.sequence_number !== undefined && q.id && q.question)
          .map(q => ({
            ...q,
            sequence_number: q.sequence_number ?? 0, // ensure number
            answers: (q.answers || []).sort((a, b) => parseInt((a.marks ?? '0').toString()) - parseInt((b.marks ?? '0').toString()))
          }))
          .sort((a, b) => a.sequence_number - b.sequence_number)
      };
      setSelectedTopic(sortedTopic as Topic);
      setIsQuestionsModalOpen(true);
    } catch (error) {
      console.error('Error fetching topic questions:', error);
      toast.error('Failed to load topic questions');
    }
  };

  const handleAnswerChange = (questionId: string, answerId?: string, textAnswer?: string) => {
    setAllAnswers(prev => ({
      ...prev,
      [questionId]: { answerId, textAnswer }
    }));
  };

  const handleCompleteAssessment = async () => {
    try {
      setIsSubmitting(true);

      if (!assignmentId || !user?.id) {
        toast.error('Missing required data');
        return;
      }

      // Create or update submission (get submissionData)
      const { data: submissionData, error: submissionError } = await supabase
        .from('assessment_submissions')
        .upsert({
          assignment_id: assignmentId,
          assessment_id: assessmentId,
          user_id: user.id
        } as any)
        .select('id')
        .single();
      if (submissionError || !submissionData) {
        toast.error('Failed to create or fetch submission');
        return;
      }

      // Fetch all topics for the assessment
      const { data: topicsData, error: topicsError } = await supabase
        .from('topics')
        .select('id')
        .eq('assessment_id', assessmentId);
      if (topicsError) {
        toast.error('Failed to fetch topics for scoring');
        return;
      }
      const topicIds = (topicsData || []).map(t => t.id);
      // Fetch all questions for those topics
      const { data: questionsData, error: questionsError } = await supabase
        .from('questions')
        .select('id, topic_id, answers(id, marks)')
        .in('topic_id', topicIds);
      if (questionsError) {
        toast.error('Failed to fetch questions for scoring');
        return;
      }
      // Build a map for quick lookup
      const questionMap: Record<string, any> = {};
      (questionsData || []).forEach(q => {
        questionMap[q.id] = q;
      });
      let totalScore = 0;
      let maxScore = 0;
      // Save all answers
      for (const [questionId, answer] of Object.entries(allAnswers)) {
        let answerScore = 10;
        let questionMax = 10;
        const question = questionMap[questionId];
        if (question) {
          // Find the selected answer's marks
          if (answer.answerId) {
            const selected = (question.answers || []).find((a: any) => a.id === answer.answerId);
            if (selected && selected.marks != null) {
              answerScore = parseFloat(selected.marks) || 10;
            }
          }
          // Find the max marks for this question
          if (question.answers && question.answers.length > 0) {
            questionMax = Math.max(...question.answers.map((a: any) => parseFloat(a.marks) || 10));
          }
        }
        totalScore += answerScore;
        maxScore += questionMax;
        if (answer.answerId || answer.textAnswer) {
          const { error: answerError } = await supabase
            .from('submitted_answers')
            .upsert({
              submission_id: submissionData.id,
              question_id: questionId,
              answer_id: answer.answerId || null,
              text_answer: answer.textAnswer || null,
              score: answerScore
            });
          if (answerError) {
            console.error('Error saving answer:', answerError);
          }
        }
      }

      // Update submission with calculated scores and status 'submitted'
      if (!user?.id || !assessmentId || !assignmentId) {
        console.error('Missing IDs for submission:', { userId: user?.id, assessmentId, assignmentId });
        toast.error('Missing required IDs for submission');
        return;
      }
      const { error: updateError } = await supabase
        .from('assessment_submissions')
        .update({
          score: totalScore,
          max_score: maxScore,
          status: 'submitted'
        })
        .eq('assignment_id', assignmentId)
        .eq('user_id', user.id)
        .eq('assessment_id', assessmentId);
      if (updateError) {
        console.error('Failed to update assessment submission:', updateError, { userId: user.id, assessmentId, assignmentId });
        toast.error('Failed to update assessment submission');
        return;
      }

      // Update assignment status to 'completed'
      const { error: assignmentError } = await supabase
        .from('assessment_assignments')
        .update({ status: 'completed' })
        .eq('id', assignmentId);
      if (assignmentError) {
        console.error('Error updating assignment status:', assignmentError, { assignmentId });
        toast.error('Failed to update assignment status');
      }

      toast.success('Assessment completed successfully!');
      navigate('/my-assessments');
    } catch (error) {
      console.error('Error completing assessment:', error);
      toast.error('Failed to complete assessment');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Add onNextTopic handler
  const handleNextTopic = async () => {
    if (!selectedTopic || !selectedTopic.id) return;
    const currentIndex = topics.findIndex(t => t.id === selectedTopic.id);
    if (currentIndex === -1 || currentIndex === topics.length - 1) return;
    const nextTopic = topics[currentIndex + 1];
    if (!nextTopic || !nextTopic.id) return;
    // Fetch next topic with questions (reuse handleAnswerQuestions logic)
    await handleAnswerQuestions(nextTopic.id);
  };

  const getStatusBadge = (status: string | null | undefined) => {
    if (!status) return null;
    
    const variant = 
      status === 'COMPLETED' ? 'success' : 
      status === 'STARTED' ? 'secondary' : 
      'outline';
    
    return <Badge variant={variant}>{status}</Badge>;
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gradient-to-br from-emerald-50 via-white to-teal-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <DashboardNav />
      
      <main className="flex-1 overflow-auto p-6">
        <div className="container mx-auto max-w-7xl animate-in">
          <div className="space-y-6">
            {/* Enhanced Header */}
            <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-lg p-6 text-white shadow-lg">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                  <BookOpen className="h-6 w-6" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold">
                    {assessmentTitle ? assessmentTitle : 'Loading assessment...'}
                  </h1>
                  <p className="text-emerald-100 text-sm">Select a topic to answer questions</p>
                </div>
              </div>
            </div>
            
            {isLoading ? (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-12">
                <div className="flex justify-center">
                  <div className="text-center space-y-4">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent mx-auto"></div>
                    <p className="text-gray-600 dark:text-gray-400">Loading assessment topics...</p>
                  </div>
                </div>
              </div>
            ) : topics.length === 0 ? (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-12 text-center">
                <Database className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600 dark:text-gray-400 text-lg">No topics found for this assessment.</p>
                <p className="text-gray-500 dark:text-gray-500 text-sm mt-2">Contact your administrator to add topics.</p>
              </div>
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-6">
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {topics.map((topic) => {
                    const IconComponent = getTopicIcon(topic.icon, topic.title);
                    const isCompleted = topic.status === 'COMPLETED';
                    const isStarted = topic.status === 'STARTED';
                    
                    return (
                      <Card 
                        key={topic.id} 
                        className={`group relative overflow-hidden transition-all duration-200 hover:shadow-lg hover:scale-[1.02] cursor-pointer border-2 ${
                          isCompleted 
                            ? 'border-green-200 bg-green-50/50 dark:border-green-800 dark:bg-green-900/20' 
                            : isStarted 
                              ? 'border-blue-200 bg-blue-50/50 dark:border-blue-800 dark:bg-blue-900/20' 
                              : 'border-gray-200 hover:border-blue-300 dark:border-gray-700 dark:hover:border-blue-600'
                        }`}
                        onClick={() => handleAnswerQuestions(topic.id)}
                      >
                        <CardHeader className="pb-4">
                          <div className="flex items-center justify-between">
                            <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                              isCompleted 
                                ? 'bg-green-500 text-white' 
                                : isStarted 
                                  ? 'bg-blue-500 text-white' 
                                  : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300 group-hover:bg-blue-500 group-hover:text-white'
                            } transition-colors duration-200`}>
                              {isCompleted ? (
                                <CheckCircle2 className="h-6 w-6" />
                              ) : (
                                <IconComponent className="h-6 w-6" />
                              )}
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className="text-xs font-medium text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                                #{topic.sequence_number}
                              </span>
                              {getStatusBadge(topic.status)}
                            </div>
                          </div>
                          <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            {topic.title}
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed mb-4">
                            {topic.description.length > 120 
                              ? `${topic.description.substring(0, 120)}...` 
                              : topic.description}
                          </p>
                          
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
                              <Clock className="h-3 w-3" />
                              <span>Click to start</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Play className="h-4 w-4 text-blue-500 group-hover:text-blue-600 transition-colors" />
                              <span className="text-xs text-blue-500 group-hover:text-blue-600 font-medium">
                                Answer Questions
                              </span>
                            </div>
                          </div>
                        </CardContent>
                        
                        {/* Hover effect overlay */}
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                      </Card>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Questions Modal */}
      <QuestionsModal
        isOpen={isQuestionsModalOpen}
        onClose={() => setIsQuestionsModalOpen(false)}
        topic={selectedTopic}
        assignmentId={assignmentId ?? ''}
        isLastTopic={selectedTopic && selectedTopic.id ? topics.findIndex(t => t.id === selectedTopic.id) === topics.length - 1 : false}
        allAnswers={allAnswers}
        onAnswerChange={handleAnswerChange}
        onCompleteAssessment={handleCompleteAssessment}
        isSubmitting={isSubmitting}
        onNextTopic={handleNextTopic}
      />
    </div>
  );
}
