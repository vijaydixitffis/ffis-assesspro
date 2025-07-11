
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
import { FileQuestion, MessageCircleQuestion, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { QuestionsModal } from "@/components/assessment/QuestionsModal";

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
        .select('id, title, description, sequence_number')
        .eq('assessment_id', assessmentId)
        .eq('is_active', true)
        .order('sequence_number', { ascending: true });

      if (error) {
        console.error('Error fetching topics:', error);
        toast.error('Failed to load topics');
        return;
      }

      const topicsData = data || [];
      
      // If we have an assignment, fetch topic status for each topic
      if (assignmentData) {
        setAssignmentId(assignmentData.id);
        
        // For each topic, check if there's a corresponding topic assignment
        const topicsWithStatus = await Promise.all(topicsData.map(async (topic) => {
          const { data: topicAssignmentData, error: topicAssignmentError } = await supabase
            .from('topic_assignments')
            .select('status')
            .eq('topic_id', topic.id)
            .eq('user_id', user?.id)
            .eq('assessment_assignment_id', assignmentData.id)
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
      const sortedTopic = {
        ...topicData,
        questions: topicData.questions
          .filter(q => q.type !== null)
          .sort((a, b) => a.sequence_number - b.sequence_number)
          .map(q => ({
            ...q,
            answers: q.answers.sort((a, b) => parseInt(a.marks || '0') - parseInt(b.marks || '0'))
          }))
      };

      setSelectedTopic(sortedTopic);
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
    if (!assignmentId) return;
    
    setIsSubmitting(true);
    try {
      // Create or update submission
      const { data: submissionData, error: submissionError } = await supabase
        .from('assessment_submissions')
        .upsert({
          assignment_id: assignmentId,
          user_id: user?.id,
          status: 'COMPLETED',
          completed_at: new Date().toISOString()
        })
        .select('id')
        .single();

      if (submissionError) {
        console.error('Error creating submission:', submissionError);
        toast.error('Failed to submit assessment');
        return;
      }

      // Save all answers
      for (const [questionId, answer] of Object.entries(allAnswers)) {
        if (answer.answerId || answer.textAnswer) {
          const { error: answerError } = await supabase
            .from('assessment_answers')
            .upsert({
              submission_id: submissionData.id,
              question_id: questionId,
              answer_id: answer.answerId || null,
              text_answer: answer.textAnswer || null
            });

          if (answerError) {
            console.error('Error saving answer:', answerError);
          }
        }
      }

      // Update assignment status
      const { error: assignmentError } = await supabase
        .from('assessment_assignments')
        .update({ status: 'COMPLETED' })
        .eq('id', assignmentId);

      if (assignmentError) {
        console.error('Error updating assignment status:', assignmentError);
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

  const handleBackToAssessments = () => {
    navigate('/my-assessments');
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
    <div className="flex h-screen overflow-hidden">
      <DashboardNav />
      
      <main className="flex-1 overflow-auto p-6">
        <div className="container mx-auto max-w-7xl animate-in">
          <div className="mb-8">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleBackToAssessments}
              className="mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to My Assessments
            </Button>
            <h1 className="text-2xl font-semibold tracking-tight">
              {assessmentTitle ? assessmentTitle : 'Loading assessment...'}
            </h1>
            <p className="text-muted-foreground">
              Select a topic to answer questions
            </p>
          </div>
          
          {isLoading ? (
            <div className="flex justify-center p-8">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            </div>
          ) : topics.length === 0 ? (
            <div className="rounded-lg border border-dashed p-8 text-center">
              <p className="text-muted-foreground">No topics found for this assessment.</p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-16">Sequence</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="w-24">Status</TableHead>
                    <TableHead className="w-24 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topics.map((topic) => (
                    <TableRow key={topic.id}>
                      <TableCell>{topic.sequence_number}</TableCell>
                      <TableCell className="font-medium">{topic.title}</TableCell>
                      <TableCell>
                        {topic.description.length > 100 
                          ? `${topic.description.substring(0, 100)}...` 
                          : topic.description}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(topic.status)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleAnswerQuestions(topic.id)}
                          title="Answer Questions"
                        >
                          <MessageCircleQuestion className="h-5 w-5" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </main>

      {/* Questions Modal */}
      <QuestionsModal
        isOpen={isQuestionsModalOpen}
        onClose={() => setIsQuestionsModalOpen(false)}
        topic={selectedTopic}
        assignmentId={assignmentId || ''}
        isLastTopic={selectedTopic ? topics.indexOf(selectedTopic) === topics.length - 1 : false}
        allAnswers={allAnswers}
        onAnswerChange={handleAnswerChange}
        onCompleteAssessment={handleCompleteAssessment}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}
