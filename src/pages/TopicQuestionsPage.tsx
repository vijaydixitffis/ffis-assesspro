
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/auth";
import { DashboardNav } from "@/components/DashboardNav";
import { Button } from "@/components/ui/button";
import { QuestionCard } from "@/components/questions/QuestionCard";
import { NoSubmissionWarning } from "@/components/questions/NoSubmissionWarning";
import { useTopicQuestions } from "@/hooks/useTopicQuestions";
import { useTopicSubmission } from "@/hooks/useTopicSubmission";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export default function TopicQuestionsPage() {
  const { topicId } = useParams<{ topicId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedAnswers, setSelectedAnswers] = useState<{ [key: string]: string }>({});
  const [textAnswers, setTextAnswers] = useState<{ [key: string]: string }>({});
  const [topicAssignment, setTopicAssignment] = useState<any>(null);
  
  const { 
    questions, 
    topic, 
    isLoading, 
    assessmentState, 
    error, 
    submission,
    retryFetching
  } = useTopicQuestions(topicId, user?.id);
  
  const { isSubmitting, submitAnswers } = useTopicSubmission();

  // Fetch or create the topic assignment on load
  useEffect(() => {
    if (topicId && user?.id && topic?.assessment_id && assessmentState === 'STARTED') {
      fetchOrCreateTopicAssignment();
    }
  }, [topicId, user?.id, topic, assessmentState]);

  const fetchOrCreateTopicAssignment = async () => {
    if (!topicId || !user?.id || !topic) return;
    
    try {
      // First check if there's an existing assignment for this topic and user
      const { data: assignmentData, error: assignmentError } = await supabase
        .from('assessment_assignments')
        .select('id')
        .eq('assessment_id', topic.assessment_id)
        .eq('user_id', user.id)
        .eq('status', 'STARTED')
        .maybeSingle();
      
      if (assignmentError) {
        console.error('Error fetching assessment assignment:', assignmentError);
        return;
      }
      
      if (!assignmentData) {
        console.error('No active assessment assignment found');
        return;
      }
      
      // Now check if there's an existing topic assignment
      const { data: topicAssignmentData, error: topicAssignmentError } = await supabase
        .from('topic_assignments')
        .select('*')
        .eq('topic_id', topicId)
        .eq('user_id', user.id)
        .eq('assessment_assignment_id', assignmentData.id)
        .maybeSingle();
      
      if (topicAssignmentError) {
        console.error('Error fetching topic assignment:', topicAssignmentError);
        return;
      }
      
      // If no assignment exists, create one
      if (!topicAssignmentData) {
        const { data: newAssignment, error: createError } = await supabase
          .from('topic_assignments')
          .insert({
            topic_id: topicId,
            user_id: user.id,
            assessment_assignment_id: assignmentData.id,
            status: 'ASSIGNED'
          })
          .select()
          .single();
        
        if (createError) {
          console.error('Error creating topic assignment:', createError);
          return;
        }
        
        setTopicAssignment(newAssignment);
      } else {
        setTopicAssignment(topicAssignmentData);
        
        // If the topic is already started, update the status
        if (topicAssignmentData.status === 'ASSIGNED') {
          const { error: updateError } = await supabase
            .from('topic_assignments')
            .update({ 
              status: 'STARTED',
              started_at: new Date().toISOString()
            })
            .eq('id', topicAssignmentData.id);
          
          if (updateError) {
            console.error('Error updating topic assignment status:', updateError);
          } else {
            setTopicAssignment({
              ...topicAssignmentData,
              status: 'STARTED',
              started_at: new Date().toISOString()
            });
          }
        }
      }
    } catch (error) {
      console.error('Error in fetchOrCreateTopicAssignment:', error);
    }
  };

  const handleAnswerSelect = (questionId: string, answerId: string) => {
    setSelectedAnswers({
      ...selectedAnswers,
      [questionId]: answerId
    });
  };

  const handleTextAnswerChange = (questionId: string, text: string) => {
    setTextAnswers({
      ...textAnswers,
      [questionId]: text
    });
  };

  const handleSubmitAnswers = async () => {
    if (assessmentState !== 'STARTED') {
      toast.error("Cannot submit answers. The assessment must be in STARTED state.");
      return;
    }
    
    const success = await submitAnswers(questions, selectedAnswers, textAnswers, submission, topic);
    
    if (success && topicAssignment) {
      // Update topic assignment status to COMPLETED
      const { error: updateError } = await supabase
        .from('topic_assignments')
        .update({ 
          status: 'COMPLETED',
          completed_at: new Date().toISOString()
        })
        .eq('id', topicAssignment.id);
      
      if (updateError) {
        console.error('Error updating topic assignment status:', updateError);
        toast.error("Failed to update topic status");
      } else {
        toast.success("Topic completed successfully!");
        // Refresh the topic assignment data
        retryFetching();
      }
    }
  };

  const isAssessmentStarted = assessmentState === 'STARTED';
  const isTopicCompleted = topicAssignment?.status === 'COMPLETED';

  return (
    <div className="flex h-screen overflow-hidden">
      <DashboardNav />
      
      <main className="flex-1 overflow-auto p-6">
        <div className="container mx-auto max-w-3xl animate-in">
          <div className="mb-8 flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">
                {topic ? topic.title : 'Loading Topic...'}
              </h1>
              <p className="text-muted-foreground">
                Answer all questions to complete this topic
              </p>
            </div>
            
            {topicAssignment && (
              <Badge variant={topicAssignment.status === 'COMPLETED' ? 'success' : 'secondary'}>
                {topicAssignment.status}
              </Badge>
            )}
          </div>
          
          {isLoading ? (
            <div className="flex justify-center p-8">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            </div>
          ) : error ? (
            <div className="rounded-lg border border-destructive p-4 text-destructive">
              <p>{error}</p>
            </div>
          ) : questions.length === 0 ? (
            <div className="rounded-lg border border-dashed p-8 text-center">
              <p className="text-muted-foreground">No questions found for this topic.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {questions.map((question, index) => (
                <QuestionCard
                  key={question.id}
                  question={question}
                  index={index}
                  selectedAnswers={selectedAnswers}
                  textAnswers={textAnswers}
                  onAnswerSelect={handleAnswerSelect}
                  onTextAnswerChange={handleTextAnswerChange}
                />
              ))}

              <div className="flex justify-end mt-4">
                <Button 
                  variant="outline" 
                  className="mr-2"
                  onClick={() => navigate(`/assessment-topics/${topic?.assessment_id}`)}
                >
                  Back to Topics
                </Button>
                <Button 
                  onClick={handleSubmitAnswers} 
                  disabled={isSubmitting || !isAssessmentStarted || isTopicCompleted}
                >
                  {isSubmitting ? "Submitting..." : isTopicCompleted ? "Already Completed" : "Submit Answers"}
                </Button>
              </div>

              {!isAssessmentStarted && <NoSubmissionWarning />}
              {isTopicCompleted && (
                <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-green-800 mt-4">
                  <p>You have already completed this topic.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
