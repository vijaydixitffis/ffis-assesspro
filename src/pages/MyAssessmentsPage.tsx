
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
  scope: string;
}

export default function MyAssessmentsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [assessments, setAssessments] = useState<AssignedAssessment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingAssessment, setUpdatingAssessment] = useState<string | null>(null);

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
          scope,
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
        assigned_at: item.assigned_at,
        scope: item.scope || ''
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
    // Prevent multiple clicks
    if (updatingAssessment) return;
    
    setUpdatingAssessment(assessment.id);
    console.log("Starting assessment with ID:", assessment.id);
    
    try {
      // First verify the current status to make sure we're updating from ASSIGNED state
      const { data: currentData, error: checkError } = await supabase
        .from('assessment_assignments')
        .select('status')
        .eq('id', assessment.id)
        .single();

      if (checkError) {
        console.error('Error checking assessment status:', checkError);
        toast.error('Failed to verify assessment status');
        return;
      }

      console.log("Current assessment status:", currentData?.status);
      
      if (currentData?.status !== 'ASSIGNED') {
        console.log("Assessment is not in ASSIGNED state, current state:", currentData?.status);
        toast.error(`Assessment cannot be started (current status: ${currentData?.status})`);
        return;
      }

      // Update the assessment status to STARTED
      const { data, error } = await supabase
        .from('assessment_assignments')
        .update({ 
          status: 'STARTED',
          updated_at: new Date().toISOString()
        })
        .eq('id', assessment.id)
        .select();

      if (error) {
        console.error('Error starting assessment:', error);
        toast.error(`Failed to start assessment: ${error.message}`);
        return;
      }

      console.log("Update response:", data);
      
      if (!data || data.length === 0) {
        console.error('No rows were updated');
        toast.error('Failed to start assessment: No rows updated');
        return;
      }
      
      console.log("Assessment status successfully updated to STARTED");
      
      // Update local state
      setAssessments(prevAssessments => 
        prevAssessments.map(a => 
          a.id === assessment.id ? { ...a, status: 'STARTED' } : a
        )
      );

      toast.success(`Started assessment: ${assessment.assessment_title}`);
      
      // Fetch the updated data to confirm changes
      await fetchAssignedAssessments();
      
      // After successful update, navigate to the assessment topics page
      navigate(`/assessment-topics/${assessment.assessment_id}`);
    } catch (error) {
      console.error('Error starting assessment:', error);
      toast.error('An error occurred while starting the assessment');
    } finally {
      setUpdatingAssessment(null);
    }
  };

  const handleSubmitAssessment = async (assessment: AssignedAssessment) => {
    // Prevent multiple clicks
    if (updatingAssessment) return;
    
    setUpdatingAssessment(assessment.id);
    console.log("Submitting assessment with ID:", assessment.id);
    
    try {
      // First verify current status is STARTED
      const { data: currentData, error: checkError } = await supabase
        .from('assessment_assignments')
        .select('status')
        .eq('id', assessment.id)
        .single();

      if (checkError) {
        console.error('Error checking assessment status:', checkError);
        toast.error('Failed to verify assessment status');
        return;
      }

      console.log("Current assessment status:", currentData?.status);
      
      if (currentData?.status !== 'STARTED') {
        console.log("Assessment is not in STARTED state, current state:", currentData?.status);
        toast.error(`Assessment cannot be submitted (current status: ${currentData?.status})`);
        return;
      }

      // Update the assessment status to COMPLETED
      const { data, error } = await supabase
        .from('assessment_assignments')
        .update({ 
          status: 'COMPLETED',
          updated_at: new Date().toISOString()
        })
        .eq('id', assessment.id)
        .select();

      if (error) {
        console.error('Error submitting assessment:', error);
        toast.error(`Failed to submit assessment: ${error.message}`);
        return;
      }

      console.log("Update response for submission:", data);
      
      if (!data || data.length === 0) {
        console.error('No rows were updated for submission');
        toast.error('Failed to submit assessment: No rows updated');
        return;
      }

      console.log("Assessment status successfully updated to COMPLETED");

      // Update local state
      setAssessments(prevAssessments => 
        prevAssessments.map(a => 
          a.id === assessment.id ? { ...a, status: 'COMPLETED' } : a
        )
      );

      // Fetch the updated data to confirm changes
      await fetchAssignedAssessments();

      toast.success(`Assessment submitted: ${assessment.assessment_title}`);
    } catch (error) {
      console.error('Error submitting assessment:', error);
      toast.error('An error occurred while submitting the assessment');
    } finally {
      setUpdatingAssessment(null);
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
                    <TableHead>Scope</TableHead>
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
                        <Badge 
                          variant={assessment.status === 'COMPLETED' ? 'success' : 'default'}
                        >
                          {assessment.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{assessment.scope}</TableCell>
                      <TableCell>{formatDate(assessment.assigned_at)}</TableCell>
                      <TableCell>{formatDate(assessment.due_date)}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button 
                            size="sm" 
                            onClick={() => handleStartAssessment(assessment)}
                            disabled={assessment.status !== 'ASSIGNED' || updatingAssessment === assessment.id}
                            className={updatingAssessment === assessment.id ? "opacity-70 cursor-not-allowed" : ""}
                          >
                            <Play className="mr-1 h-4 w-4" />
                            {updatingAssessment === assessment.id && assessment.status === 'ASSIGNED' ? 'Starting...' : 'Start'}
                          </Button>
                          <Button 
                            size="sm" 
                            variant="secondary"
                            onClick={() => handleSubmitAssessment(assessment)}
                            disabled={assessment.status !== 'STARTED' || updatingAssessment === assessment.id}
                            className={updatingAssessment === assessment.id ? "opacity-70 cursor-not-allowed" : ""}
                          >
                            <Upload className="mr-1 h-4 w-4" />
                            {updatingAssessment === assessment.id && assessment.status === 'STARTED' ? 'Submitting...' : 'Submit'}
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
