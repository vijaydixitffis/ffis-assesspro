import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AssignedAssessment } from "@/types/assessment";
import { StartButton } from "./StartButton";
import { SubmitButton } from "./SubmitButton";
import { TopicsButton } from "./TopicsButton";
import { useAssessmentStatusUpdate } from "@/hooks/useAssessmentStatusUpdate";
import { Button } from "@/components/ui/button";
import { PlayCircle, CheckCircle } from "lucide-react";

interface AssessmentActionButtonsProps {
  assessment: AssignedAssessment;
  userId: string;
  onStatusUpdate: (assignmentId: string, newStatus: string) => void;
  isAllTopicsCompleted: boolean;
}

export const AssessmentActionButtons = ({ 
  assessment, 
  userId,
  onStatusUpdate,
  isAllTopicsCompleted,
}: AssessmentActionButtonsProps) => {
  const navigate = useNavigate();
  const { updatingAssessment, updateAssessmentStatus } = useAssessmentStatusUpdate(onStatusUpdate);

  const handleStartAssessment = async () => {
    
    try {
      // Ensure we have a valid ID before attempting update
      if (!assessment.id) {
        console.error('Missing assessment ID, cannot update status');
        return;
      }
      
      const success = await updateAssessmentStatus(assessment.id, 'STARTED');
      
      if (success) {
        navigate(`/assessment-topics/${assessment.assessment_id}`);
      } else {
        console.error('Failed to update assessment status');
      }
    } catch (err) {
      console.error('Error in handleStartAssessment:', err);
    }
  };

  const handleSubmitAssessment = async () => {
    console.log(`Submitting assignment with ID: ${assessment.id}`);
    try {
      if (!assessment.id) {
        console.error('Missing assessment ID, cannot update status');
        return;
      }
      
      const success = await updateAssessmentStatus(assessment.id, 'COMPLETED');
      
      if (!success) {
        console.error('Failed to update assessment status to COMPLETED');
      }
    } catch (err) {
      console.error('Error in handleSubmitAssessment:', err);
    }
  };

  const handleTakeAssessment = async () => {
    // Update status to STARTED if not already started
    if (assessment.status === 'ASSIGNED') {
      const success = await updateAssessmentStatus(assessment.id, 'STARTED');
      if (!success) {
        console.error('Failed to update assessment status');
        return;
      }
    }
    navigate(`/assessment-topics/${assessment.assessment_id}`);
  };

  const handleViewTopics = () => {
    navigate(`/assessment-topics/${assessment.assessment_id}`);
  };

  // Normalize status to lowercase for comparison
  const normalizedStatus = assessment.status.toLowerCase();
  
  return (
    <div className="flex space-x-2">
      {/* New Take Assessment Button */}
      {(normalizedStatus === 'assigned' || normalizedStatus === 'not_started') && (
        <Button 
          onClick={handleTakeAssessment}
          className="flex items-center gap-2"
          size="sm"
        >
          <PlayCircle className="w-4 h-4" />
          Take Assessment
        </Button>
      )}
      
      {(normalizedStatus === 'in_progress' || normalizedStatus === 'started') && (
        <Button 
          onClick={handleTakeAssessment}
          variant="outline"
          className="flex items-center gap-2"
          size="sm"
        >
          <PlayCircle className="w-4 h-4" />
          Continue
        </Button>
      )}
      
      {normalizedStatus === 'completed' && (
        <Button 
          onClick={handleTakeAssessment}
          variant="outline"
          className="flex items-center gap-2"
          size="sm"
          disabled
        >
          <CheckCircle className="w-4 h-4" />
          Completed
        </Button>
      )}

      {/* Legacy buttons for debugging */}
      {/* Removed showDebug prop and debug UI elements */}
    </div>
  );
};
