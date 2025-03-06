
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type StatusUpdateFunction = (assignmentId: string, status: string) => Promise<boolean>;

export const useAssessmentStatusUpdate = (
  onStatusUpdate: (assignmentId: string, newStatus: string) => void
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
        .eq('id', assignmentId)  // Using assignment ID (primary key)
        .maybeSingle();

      if (checkError) {
        console.error('Error checking assignment status:', checkError);
        toast.error('Failed to verify assignment status');
        return false;
      }

      console.log("Current assignment data:", currentData);

      if (!currentData) {
        console.error('Assignment not found');
        toast.error('Assignment not found');
        return false;
      }
      
      if (currentData.status !== expectedCurrentStatus) {
        console.log(`Assignment status mismatch - current: ${currentData.status}, expected: ${expectedCurrentStatus}`);
        toast.error(`Assignment cannot be ${newStatus === 'STARTED' ? 'started' : 'submitted'} (current status: ${currentData.status})`);
        return false;
      }

      // Update assignment status using the assignment ID (primary key)
      console.log('Updating assignment with ID:', assignmentId);

      const { data: updateData, error: updateError } = await supabase
        .from('assessment_assignments')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', assignmentId)  // Using assignment ID (primary key)
        .select()
        .maybeSingle();

      if (updateError) {
        console.error(`Error updating assignment to ${newStatus}:`, updateError);
        toast.error(`Failed to update assignment: ${updateError.message}`);
        return false;
      }

      if (!updateData) {
        console.error('No rows were updated - Update response:', updateData);
        toast.error(`Failed to update assignment: No matching assignment found`);
        return false;
      }
      
      console.log(`Assignment ${assignmentId} successfully updated to ${newStatus}`);
      
      onStatusUpdate(assignmentId, newStatus);
      
      const actionName = newStatus === 'STARTED' ? 'Started' : 'Submitted';
      toast.success(`${actionName} assessment`);
      return true;
    } catch (error) {
      console.error(`Error updating assignment to ${newStatus}:`, error);
      toast.error(`An unexpected error occurred while updating the assignment`);
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
