
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { AssignedAssessment } from "@/types/assessment";

type StatusUpdateFunction = (assessmentId: string, status: string) => Promise<boolean>;

export const useAssessmentStatusUpdate = (
  onStatusUpdate: (assessmentId: string, newStatus: string) => void
) => {
  const [updatingAssessment, setUpdatingAssessment] = useState<string | null>(null);

  const updateAssessmentStatus: StatusUpdateFunction = async (assignmentId, newStatus) => {
    if (updatingAssessment) return false;
    
    setUpdatingAssessment(assignmentId);
    console.log(`Attempting to update assignment with ID: ${assignmentId} to status: ${newStatus}`);
    
    try {
      // First verify the current status
      const expectedCurrentStatus = newStatus === 'STARTED' ? 'ASSIGNED' : 'STARTED';
      
      // Use maybeSingle instead of single to avoid the error when no rows are found
      const { data: currentData, error: checkError } = await supabase
        .from('assessment_assignments')
        .select('status, user_id, assessment_id')
        .eq('id', assignmentId)
        .maybeSingle();

      if (checkError) {
        console.error('Error checking assessment status:', checkError);
        toast.error('Failed to verify assessment status');
        return false;
      }

      console.log("Current assessment data:", currentData);

      if (!currentData) {
        console.error('Assessment not found');
        toast.error('Assessment not found');
        return false;
      }
      
      if (currentData.status !== expectedCurrentStatus) {
        console.log(`Assessment status mismatch - current: ${currentData.status}, expected: ${expectedCurrentStatus}`);
        toast.error(`Assessment cannot be ${newStatus === 'STARTED' ? 'started' : 'submitted'} (current status: ${currentData.status})`);
        return false;
      }

      // Update assessment status using only the assignment ID
      console.log('Attempting to update assessment with ID:', assignmentId);

      const { data: updateData, error: updateError } = await supabase
        .from('assessment_assignments')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', assignmentId)
        .select()
        .maybeSingle();

      if (updateError) {
        console.error(`Error updating assessment to ${newStatus}:`, updateError);
        toast.error(`Failed to update assessment: ${updateError.message}`);
        return false;
      }

      if (!updateData) {
        console.error('No rows were updated - Update response:', updateData);
        toast.error(`Failed to update assessment: No matching assessment found`);
        return false;
      }
      
      console.log(`Assessment ${assignmentId} successfully updated to ${newStatus}`);
      
      onStatusUpdate(assignmentId, newStatus);
      
      const actionName = newStatus === 'STARTED' ? 'Started' : 'Submitted';
      toast.success(`${actionName} assessment`);
      return true;
    } catch (error) {
      console.error(`Error updating assessment to ${newStatus}:`, error);
      toast.error(`An unexpected error occurred while updating the assessment`);
      return false;
    } finally {
      setUpdatingAssessment(null);
    }
  };

  return {
    updatingAssessment,
    updateAssessmentStatus
  };
};
