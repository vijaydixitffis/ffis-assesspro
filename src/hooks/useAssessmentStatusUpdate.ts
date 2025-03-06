
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
      
      // Debug: Log the update operation details
      console.log('Update operation:', {
        table: 'assessment_assignments',
        set: { status: newStatus },
        where: { id: assignmentId }
      });
      
      // Update assessment assignment status
      const { data, error } = await supabase
        .from('assessment_assignments')
        .update({ status: newStatus })
        .eq('id', assignmentId)
        .select(); // Add select to return the updated record for verification
      
      if (error) {
        console.error('Error updating assessment status:', error);
        toast.error(`Failed to update assessment: ${error.message}`);
        return false;
      }
      
      // Debug: Log the returned data
      console.log('Updated record:', data);
      
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
