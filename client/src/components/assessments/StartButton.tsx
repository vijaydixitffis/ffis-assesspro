
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Play } from "lucide-react";
import { AssignedAssessment } from "@/types/assessment";

interface StartButtonProps {
  assessment: AssignedAssessment;
  userId: string;
  onStatusUpdate: (assessmentId: string, newStatus: string) => void;
}

export const StartButton = ({ 
  assessment, 
  userId, 
  onStatusUpdate,
}: StartButtonProps) => {
  const isStarting = assessment.status === 'STARTING';

  const handleStartAssessment = () => {
    onStatusUpdate(assessment.id, 'STARTING');
  };

  return (
    <div className="flex flex-col gap-2">
      <Button 
        onClick={handleStartAssessment}
        disabled={isStarting}
        className="w-full"
      >
        {isStarting ? (
          <>
            <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            Starting...
          </>
        ) : (
          <>
            <Play className="w-4 h-4 mr-2" />
            Start Assessment
          </>
        )}
      </Button>
      
    </div>
  );
};
