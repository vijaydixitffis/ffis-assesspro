
import { useNavigate } from "react-router-dom";
import { AssignedAssessment } from "@/types/assessment";
import { StartButton } from "./StartButton";
import { SubmitButton } from "./SubmitButton";
import { useAssessmentStatusUpdate } from "@/hooks/useAssessmentStatusUpdate";

interface AssessmentActionButtonsProps {
  assessment: AssignedAssessment;
  userId: string;
  onStatusUpdate: (assignmentId: string, newStatus: string) => void;
  showDebug?: boolean;
}

export const AssessmentActionButtons = ({ 
  assessment, 
  userId,
  onStatusUpdate,
  showDebug = false
}: AssessmentActionButtonsProps) => {
  const navigate = useNavigate();
  const { updatingAssessment, updateAssessmentStatus } = useAssessmentStatusUpdate(onStatusUpdate);

  const handleStartAssessment = async () => {
    console.log(`Starting assignment with ID: ${assessment.id} for user ${userId}`);
    console.log('Assessment data before update:', JSON.stringify(assessment, null, 2));
    
    try {
      const success = await updateAssessmentStatus(assessment.id, 'STARTED');
      console.log('Update status returned:', success);
      
      if (success) {
        console.log(`Navigating to assessment topics with ID: ${assessment.assessment_id}`);
        // After successful update, navigate to the assessment topics page
        // Using assessment_id (foreign key to assessments table) for navigation
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
      await updateAssessmentStatus(assessment.id, 'COMPLETED');
    } catch (err) {
      console.error('Error in handleSubmitAssessment:', err);
    }
  };

  return (
    <div className="flex space-x-2">
      <StartButton 
        assessment={assessment}
        userId={userId}
        updatingAssessment={updatingAssessment}
        onStartAssessment={handleStartAssessment}
        showDebug={showDebug}
      />
      <SubmitButton 
        assessment={assessment}
        updatingAssessment={updatingAssessment}
        onSubmitAssessment={handleSubmitAssessment}
      />
    </div>
  );
};
