
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/auth";
import { DashboardNav } from "@/components/DashboardNav";
import { supabase } from "@/integrations/supabase/client";
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Play, Upload } from "lucide-react";
import { toast } from "sonner";

// Define assessment type
interface AssignedAssessment {
  id: string;
  assessment_id: string;
  assessment_title: string;
  status: string;
  due_date: string | null;
  assigned_at: string | null;
}

export default function MyAssessmentsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [assessments, setAssessments] = useState<AssignedAssessment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      fetchAssignedAssessments();
    }
  }, [user]);

  async function fetchAssignedAssessments() {
    setIsLoading(true);
    try {
      // Fetch assessments assigned to the current user with the assessment title
      const { data, error } = await supabase
        .from('assessment_assignments')
        .select(`
          id,
          assessment_id,
          status,
          due_date,
          assigned_at,
          assessments:assessment_id (title)
        `)
        .eq('user_id', user?.id);

      if (error) {
        console.error('Error fetching assessments:', error);
        toast.error('Failed to load your assessments');
        return;
      }

      // Transform the data to include assessment title
      const formattedAssessments = data.map(item => ({
        id: item.id,
        assessment_id: item.assessment_id,
        assessment_title: item.assessments.title,
        status: item.status,
        due_date: item.due_date,
        assigned_at: item.assigned_at
      }));

      setAssessments(formattedAssessments);
    } catch (error) {
      console.error('Error in fetch operation:', error);
      toast.error('An error occurred while loading assessments');
    } finally {
      setIsLoading(false);
    }
  }

  const handleStartAssessment = async (assessment: AssignedAssessment) => {
    console.log("Starting assessment:", assessment.id);
    try {
      // Update the assessment status to STARTED
      const { error } = await supabase
        .from('assessment_assignments')
        .update({ status: 'STARTED' })
        .eq('id', assessment.id);

      if (error) {
        console.error('Error starting assessment:', error);
        toast.error('Failed to start assessment: ' + error.message);
        return;
      }

      // Update local state
      setAssessments(assessments.map(a => 
        a.id === assessment.id ? { ...a, status: 'STARTED' } : a
      ));

      toast.success(`Started assessment: ${assessment.assessment_title}`);
      
      // Navigate to the assessment topics page
      navigate(`/assessment-topics/${assessment.assessment_id}`);
    } catch (error) {
      console.error('Error starting assessment:', error);
      toast.error('An error occurred while starting the assessment');
    }
  };

  const handleSubmitAssessment = async (assessment: AssignedAssessment) => {
    console.log("Submitting assessment:", assessment.id);
    try {
      // Update the assessment status to COMPLETED
      const { error } = await supabase
        .from('assessment_assignments')
        .update({ status: 'COMPLETED' })
        .eq('id', assessment.id);

      if (error) {
        console.error('Error submitting assessment:', error);
        toast.error('Failed to submit assessment: ' + error.message);
        return;
      }

      // Update local state
      setAssessments(assessments.map(a => 
        a.id === assessment.id ? { ...a, status: 'COMPLETED' } : a
      ));

      toast.success(`Assessment submitted: ${assessment.assessment_title}`);
    } catch (error) {
      console.error('Error submitting assessment:', error);
      toast.error('An error occurred while submitting the assessment');
    }
  };

  // Format date to be more readable
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <DashboardNav />
      
      <main className="flex-1 overflow-auto p-6">
        <div className="container mx-auto max-w-7xl animate-in">
          <div className="mb-8">
            <h1 className="text-2xl font-semibold tracking-tight">My Assessments</h1>
            <p className="text-muted-foreground">
              View and manage your assigned assessments
            </p>
          </div>
          
          {isLoading ? (
            <div className="flex justify-center p-8">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            </div>
          ) : assessments.length === 0 ? (
            <div className="rounded-lg border border-dashed p-8 text-center">
              <p className="text-muted-foreground">No assessments have been assigned to you yet.</p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableCaption>A list of all your assigned assessments.</TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead>Assessment</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Assigned Date</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {assessments.map((assessment) => (
                    <TableRow key={assessment.id}>
                      <TableCell className="font-medium">{assessment.assessment_title}</TableCell>
                      <TableCell>
                        <Badge>{assessment.status}</Badge>
                      </TableCell>
                      <TableCell>{formatDate(assessment.assigned_at)}</TableCell>
                      <TableCell>{formatDate(assessment.due_date)}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button 
                            size="sm" 
                            onClick={() => handleStartAssessment(assessment)}
                            disabled={assessment.status !== 'ASSIGNED'}
                          >
                            <Play className="mr-1 h-4 w-4" />
                            Start
                          </Button>
                          <Button 
                            size="sm" 
                            variant="secondary"
                            onClick={() => handleSubmitAssessment(assessment)}
                            disabled={assessment.status !== 'STARTED'}
                          >
                            <Upload className="mr-1 h-4 w-4" />
                            Submit
                          </Button>
                        </div>
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
