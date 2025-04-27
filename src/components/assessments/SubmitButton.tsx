import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import { AssignedAssessment } from "@/types/assessment";

interface SubmitButtonProps {
  assessment: AssignedAssessment;
  updatingAssessment: string | null;
  onSubmitAssessment: () => void;
  disabled?: boolean;
  isAllTopicsCompleted: boolean;
}

export const SubmitButton = ({ 
  assessment, 
  updatingAssessment, 
  onSubmitAssessment,
  disabled = false,
  isAllTopicsCompleted,
}: SubmitButtonProps) => {
  const isDisabled = disabled || 
                    updatingAssessment === assessment.id ||
                    !isAllTopicsCompleted;
                    
  return (
    <Button 
      size="sm" 
      variant="secondary"
      onClick={onSubmitAssessment}
      disabled={isDisabled}
      className={updatingAssessment === assessment.id ? "opacity-70 cursor-not-allowed" : ""}
    >
      <Upload className="mr-1 h-4 w-4" />
      {updatingAssessment === assessment.id && assessment.status === 'STARTED' ? 'Submitting...' : 'Submit'}
    </Button>
  );
};
