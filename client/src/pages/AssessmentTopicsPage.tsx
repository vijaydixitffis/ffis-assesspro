
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
import { FileQuestion, MessageCircleQuestion } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

interface Topic {
  id: string;
  title: string;
  description: string;
  sequence_number: number;
  status?: string | null;
}

export default function AssessmentTopicsPage() {
  const { assessmentId } = useParams<{ assessmentId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [topics, setTopics] = useState<Topic[]>([]);
  const [assessmentTitle, setAssessmentTitle] = useState("");
  const [isLoading, setIsLoading] = useState(true);

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
        const assignmentId = assignmentData.id;
        
        // For each topic, check if there's a corresponding topic assignment
        const topicsWithStatus = await Promise.all(topicsData.map(async (topic) => {
          const { data: topicAssignmentData, error: topicAssignmentError } = await supabase
            .from('topic_assignments')
            .select('status')
            .eq('topic_id', topic.id)
            .eq('user_id', user?.id)
            .eq('assessment_assignment_id', assignmentId)
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

  const handleAnswerQuestions = (topicId: string) => {
    navigate(`/topic-questions/${topicId}`);
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
    </div>
  );
}
