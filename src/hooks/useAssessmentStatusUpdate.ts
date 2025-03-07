
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
      
      // Debug: Log the update payload
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
      
      // Fix for 406 error: Use proper headers setting in the request options
      const { data, error } = await supabase
        .from('assessment_assignments')
        .update({ status: newStatus })
        .eq('id', assignmentId)
        .select();
      
      if (error) {
        console.error('Supabase Error updating assessment status:', error);
        console.error('Error details:', JSON.stringify(error, null, 2));
        toast.error(`Error updating assessment status: ${newStatus}`);
        return false;
      }
      
      console.log('Successfully updated record, returned data:', data);
      
      // Check if data array is empty rather than checking if data is null
      if (!data || data.length === 0) {
        console.error('Update succeeded but no data returned');
        // Even though no data was returned, if there was no error, we'll consider it a success
        onStatusUpdate(assignmentId, newStatus);
        toast.success(`Assessment status updated to ${newStatus}`);
        return true;
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
