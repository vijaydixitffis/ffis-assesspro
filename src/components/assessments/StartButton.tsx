
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Play } from "lucide-react";
import { AssignedAssessment } from "@/types/assessment";

interface StartButtonProps {
  assessment: AssignedAssessment;
  userId: string;
  updatingAssessment: string | null;
  onStartAssessment: () => void;
  disabled?: boolean;
}

export const StartButton = ({ 
  assessment, 
  updatingAssessment, 
  onStartAssessment,
  disabled = false
}: StartButtonProps) => {
  return (
    <Button 
      size="sm" 
      onClick={onStartAssessment}
      disabled={disabled || assessment.status !== 'ASSIGNED' || updatingAssessment === assessment.id}
      className={updatingAssessment === assessment.id ? "opacity-70 cursor-not-allowed" : ""}
    >
      <Play className="mr-1 h-4 w-4" />
      {updatingAssessment === assessment.id && assessment.status === 'ASSIGNED' ? 'Starting...' : 'Start'}
    </Button>
  );
};
