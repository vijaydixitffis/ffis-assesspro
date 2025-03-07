
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function useAssessmentStatusUpdate(
  onStatusUpdate: (assignmentId: string, newStatus: string) => void
) {
  const [updatingAssessment, setUpdatingAssessment] = useState<string | null>(null);

  const updateAssessmentStatus = async (assignmentId: string, newStatus: string): Promise<boolean> => {
    setUpdatingAssessment(assignmentId);
    
    try {
      console.log(`Updating assignment ${assignmentId} to status ${newStatus}`);
      
      // Enhanced debugging: Log the update payload
      const updatePayload = { status: newStatus };
      console.log('Update payload:', updatePayload);
      
      // Before update, check if record exists and log its current state
      const { data: existingRecord, error: checkError } = await supabase
        .from('assessment_assignments')
        .select('*')
        .eq('id', assignmentId)
        .single();
      
      if (checkError) {
        console.error('Error fetching record before update:', checkError);
        toast.error(`Failed to find assessment: ${checkError.message}`);
        return false;
      } else {
        console.log('Existing record before update:', existingRecord);
      }
      
      // Get current user session to confirm we're authenticated
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        console.error('No active session found - user is not authenticated');
        toast.error('Authentication required to update assessment status');
        return false;
      }
      
      console.log('Authenticated as user:', session.user.id);
      
      // Perform the update with clear error handling
      const { error } = await supabase
        .from('assessment_assignments')
        .update(updatePayload)
        .eq('id', assignmentId);
      
      if (error) {
        console.error('Supabase Error updating assessment status:', error);
        console.error('Error details:', JSON.stringify(error, null, 2));
        toast.error(`Error updating assessment status: ${error.message}`);
        return false;
      }
      
      console.log('Successfully sent update request');
      
      // Verify the update by fetching the record again
      const { data: updatedRecord, error: fetchError } = await supabase
        .from('assessment_assignments')
        .select('*')
        .eq('id', assignmentId)
        .single();
        
      if (fetchError) {
        console.error('Error fetching updated record:', fetchError);
        // If we couldn't verify the update, we'll still notify but log the issue
        onStatusUpdate(assignmentId, newStatus);
        toast.success(`Assessment status updated to ${newStatus}`);
        return true;
      }
      
      console.log('Record after update:', updatedRecord);
      
      if (updatedRecord.status !== newStatus) {
        console.error(`Update verification failed: Expected status ${newStatus} but got ${updatedRecord.status}`);
        toast.error('Status update failed to persist');
        return false;
      }
      
      // Notify parent component of the status change
      onStatusUpdate(assignmentId, newStatus);
      toast.success(`Assessment status updated to ${newStatus}`);
      return true;
    } catch (error) {
      console.error('Exception in status update operation:', error);
      toast.error('An unexpected error occurred while updating status');
      return false;
    } finally {
      setUpdatingAssessment(null);
    }
  };

  return { updatingAssessment, updateAssessmentStatus };
}
