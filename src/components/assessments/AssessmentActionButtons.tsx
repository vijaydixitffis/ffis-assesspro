
import { useNavigate } from "react-router-dom";
import { AssignedAssessment } from "@/types/assessment";
import { StartButton } from "./StartButton";
import { SubmitButton } from "./SubmitButton";
import { useAssessmentStatusUpdate } from "@/hooks/useAssessmentStatusUpdate";

interface AssessmentActionButtonsProps {
  assessment: AssignedAssessment;
  userId: string;
  onStatusUpdate: (assessmentId: string, newStatus: string) => void;
}

export const AssessmentActionButtons = ({ 
  assessment, 
  userId,
  onStatusUpdate 
}: AssessmentActionButtonsProps) => {
  const navigate = useNavigate();
  const { updatingAssessment, updateAssessmentStatus } = useAssessmentStatusUpdate(onStatusUpdate);

  const handleStartAssessment = async () => {
    const success = await updateAssessmentStatus(assessment.id, 'STARTED', userId);
    if (success) {
      // After successful update, navigate to the assessment topics page
      navigate(`/assessment-topics/${assessment.assessment_id}`);
    }
  };

  const handleSubmitAssessment = async () => {
    await updateAssessmentStatus(assessment.id, 'COMPLETED', userId);
  };

  return (
    <div className="flex space-x-2">
      <StartButton 
        assessment={assessment}
        userId={userId}
        updatingAssessment={updatingAssessment}
        onStartAssessment={handleStartAssessment}
      />
      <SubmitButton 
        assessment={assessment}
        updatingAssessment={updatingAssessment}
        onSubmitAssessment={handleSubmitAssessment}
      />
    </div>
  );
};
