
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { AssignedAssessment } from "@/types/assessment";

type StatusUpdateFunction = (assessmentId: string, status: string, userId: string) => Promise<boolean>;

export const useAssessmentStatusUpdate = (
  onStatusUpdate: (assessmentId: string, newStatus: string) => void
) => {
  const [updatingAssessment, setUpdatingAssessment] = useState<string | null>(null);

  const updateAssessmentStatus: StatusUpdateFunction = async (assessmentId, newStatus, userId) => {
    // Prevent multiple clicks
    if (updatingAssessment) return false;
    
    setUpdatingAssessment(assessmentId);
    console.log(`Updating assessment ${assessmentId} to status: ${newStatus}`);
    
    try {
      // First verify the current status to make sure we're updating from the correct state
      const expectedCurrentStatus = newStatus === 'STARTED' ? 'ASSIGNED' : 'STARTED';
      
      const { data: currentData, error: checkError } = await supabase
        .from('assessment_assignments')
        .select('status')
        .eq('id', assessmentId)
        .single();

      if (checkError) {
        console.error('Error checking assessment status:', checkError);
        toast.error('Failed to verify assessment status');
        return false;
      }

      console.log("Current assessment status:", currentData?.status);
      
      if (currentData?.status !== expectedCurrentStatus) {
        console.log(`Assessment is not in ${expectedCurrentStatus} state, current state:`, currentData?.status);
        toast.error(`Assessment cannot be ${newStatus === 'STARTED' ? 'started' : 'submitted'} (current status: ${currentData?.status})`);
        return false;
      }

      // Use RLS-compliant update by including user_id in the where clause
      const { data, error } = await supabase
        .from('assessment_assignments')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', assessmentId)
        .eq('user_id', userId) // Ensure RLS compatibility
        .select();

      if (error) {
        console.error(`Error updating assessment to ${newStatus}:`, error);
        toast.error(`Failed to update assessment: ${error.message}`);
        return false;
      }

      console.log("Update response:", data);
      
      if (!data || data.length === 0) {
        console.error('No rows were updated');
        toast.error(`Failed to update assessment: No rows updated`);
        return false;
      }
      
      console.log(`Assessment status successfully updated to ${newStatus}`);
      
      // Update local state via callback
      onStatusUpdate(assessmentId, newStatus);
      
      const actionName = newStatus === 'STARTED' ? 'Started' : 'Submitted';
      toast.success(`${actionName} assessment`);
      return true;
    } catch (error) {
      console.error(`Error updating assessment to ${newStatus}:`, error);
      toast.error(`An error occurred while updating the assessment`);
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
