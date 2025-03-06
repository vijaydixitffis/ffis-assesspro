
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Play, Upload } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { AssignedAssessment } from "@/types/assessment";

interface AssessmentActionButtonsProps {
  assessment: AssignedAssessment;
  userId: string;
  onStatusUpdate: (assessmentId: string, newStatus: string) => void;
}

export const AssessmentActionButtons = ({ 
  assessment, 
  userId,
  onStatusUpdate 
}: AssessmentActionButtonsProps) => {
  const navigate = useNavigate();
  const [updatingAssessment, setUpdatingAssessment] = useState<string | null>(null);

  const handleStartAssessment = async () => {
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

      // Fix: Use RLS-compliant update by including user_id in the where clause
      const { data, error } = await supabase
        .from('assessment_assignments')
        .update({ 
          status: 'STARTED',
          updated_at: new Date().toISOString()
        })
        .eq('id', assessment.id)
        .eq('user_id', userId) // Ensure RLS compatibility
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
      
      // Update local state via callback
      onStatusUpdate(assessment.id, 'STARTED');

      toast.success(`Started assessment: ${assessment.assessment_title}`);
      
      // After successful update, navigate to the assessment topics page
      navigate(`/assessment-topics/${assessment.assessment_id}`);
    } catch (error) {
      console.error('Error starting assessment:', error);
      toast.error('An error occurred while starting the assessment');
    } finally {
      setUpdatingAssessment(null);
    }
  };

  const handleSubmitAssessment = async () => {
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

      // Fix: Use RLS-compliant update by including user_id in the where clause
      const { data, error } = await supabase
        .from('assessment_assignments')
        .update({ 
          status: 'COMPLETED',
          updated_at: new Date().toISOString()
        })
        .eq('id', assessment.id)
        .eq('user_id', userId) // Ensure RLS compatibility
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

      // Update local state via callback
      onStatusUpdate(assessment.id, 'COMPLETED');

      toast.success(`Assessment submitted: ${assessment.assessment_title}`);
    } catch (error) {
      console.error('Error submitting assessment:', error);
      toast.error('An error occurred while submitting the assessment');
    } finally {
      setUpdatingAssessment(null);
    }
  };

  return (
    <div className="flex space-x-2">
      <Button 
        size="sm" 
        onClick={handleStartAssessment}
        disabled={assessment.status !== 'ASSIGNED' || updatingAssessment === assessment.id}
        className={updatingAssessment === assessment.id ? "opacity-70 cursor-not-allowed" : ""}
      >
        <Play className="mr-1 h-4 w-4" />
        {updatingAssessment === assessment.id && assessment.status === 'ASSIGNED' ? 'Starting...' : 'Start'}
      </Button>
      <Button 
        size="sm" 
        variant="secondary"
        onClick={handleSubmitAssessment}
        disabled={assessment.status !== 'STARTED' || updatingAssessment === assessment.id}
        className={updatingAssessment === assessment.id ? "opacity-70 cursor-not-allowed" : ""}
      >
        <Upload className="mr-1 h-4 w-4" />
        {updatingAssessment === assessment.id && assessment.status === 'STARTED' ? 'Submitting...' : 'Submit'}
      </Button>
    </div>
  );
};
