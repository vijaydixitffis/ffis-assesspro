
import { useNavigate } from "react-router-dom";
import { AssignedAssessment } from "@/types/assessment";
import { StartButton } from "./StartButton";
import { SubmitButton } from "./SubmitButton";
import { useAssessmentStatusUpdate } from "@/hooks/useAssessmentStatusUpdate";

interface AssessmentActionButtonsProps {
  assessment: AssignedAssessment;
  userId: string;
  onStatusUpdate: (assessmentId: string, newStatus: string) => void;
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
    console.log(`Starting assignment ${assessment.id} for user ${userId}`);
    const success = await updateAssessmentStatus(assessment.id, 'STARTED');
    if (success) {
      // After successful update, navigate to the assessment topics page
      navigate(`/assessment-topics/${assessment.assessment_id}`);
    }
  };

  const handleSubmitAssessment = async () => {
    await updateAssessmentStatus(assessment.id, 'COMPLETED');
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
