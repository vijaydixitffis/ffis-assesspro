
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
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
import { FileQuestion } from "lucide-react";
import { toast } from "sonner";

interface Topic {
  id: string;
  title: string;
  description: string;
  sequence_number: number;
}

export default function AssessmentTopicsPage() {
  const { assessmentId } = useParams<{ assessmentId: string }>();
  const { user } = useAuth();
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

      setTopics(data || []);
    } catch (error) {
      console.error('Error in fetch operation:', error);
      toast.error('An error occurred while loading topics');
    } finally {
      setIsLoading(false);
    }
  }

  const handleAnswerQuestions = (topicId: string) => {
    toast.info(`Navigate to answer questions for topic: ${topicId}`);
    // Implementation for navigating to questions would go here
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <DashboardNav />
      
      <main className="flex-1 overflow-auto p-6">
        <div className="container mx-auto max-w-7xl animate-in">
          <div className="mb-8">
            <h1 className="text-2xl font-semibold tracking-tight">Topics of Assessment</h1>
            <p className="text-muted-foreground">
              {assessmentTitle ? `Viewing topics for "${assessmentTitle}"` : 'Loading assessment details...'}
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
                      <TableCell className="text-right">
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleAnswerQuestions(topic.id)}
                          title="Answer Questions"
                        >
                          <FileQuestion className="h-5 w-5" />
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
