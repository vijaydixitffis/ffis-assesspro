
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import { AssignedAssessment } from "@/types/assessment";

interface SubmitButtonProps {
  assessment: AssignedAssessment;
  updatingAssessment: string | null;
  onSubmitAssessment: () => void;
  disabled?: boolean;
}

export const SubmitButton = ({ 
  assessment, 
  updatingAssessment, 
  onSubmitAssessment,
  disabled = false
}: SubmitButtonProps) => {
  return (
    <Button 
      size="sm" 
      variant="secondary"
      onClick={onSubmitAssessment}
      disabled={disabled || assessment.status !== 'STARTED' || updatingAssessment === assessment.id}
      className={updatingAssessment === assessment.id ? "opacity-70 cursor-not-allowed" : ""}
    >
      <Upload className="mr-1 h-4 w-4" />
      {updatingAssessment === assessment.id && assessment.status === 'STARTED' ? 'Submitting...' : 'Submit'}
    </Button>
  );
};
