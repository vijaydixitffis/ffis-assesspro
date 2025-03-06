
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
      console.log('Update condition: id =', assignmentId);
      
      // Before update, check if record exists and log its current state
      const { data: existingRecord, error: checkError } = await supabase
        .from('assessment_assignments')
        .select('*')
        .eq('id', assignmentId)
        .single();
      
      if (checkError) {
        console.error('Error fetching record before update:', checkError);
      } else {
        console.log('Existing record before update:', existingRecord);
      }
      
      // Update assessment assignment status with explicit commit
      const { data, error } = await supabase
        .from('assessment_assignments')
        .update(updatePayload)
        .eq('id', assignmentId)
        .select();
      
      if (error) {
        console.error('Error updating assessment status:', error);
        toast.error(`Failed to update assessment: ${error.message}`);
        return false;
      }
      
      // Debug: Log the returned data
      console.log('Updated record returned from DB:', data);
      
      if (!data || data.length === 0) {
        console.error('No record was updated in the database');
        toast.error('No record was updated in the database');
        return false;
      }
      
      // Notify parent component of the status change
      onStatusUpdate(assignmentId, newStatus);
      toast.success(`Assessment status updated to ${newStatus}`);
      return true;
    } catch (error) {
      console.error('Error in status update operation:', error);
      toast.error('An error occurred while updating status');
      return false;
    } finally {
      setUpdatingAssessment(null);
    }
  };

  return { updatingAssessment, updateAssessmentStatus };
}
