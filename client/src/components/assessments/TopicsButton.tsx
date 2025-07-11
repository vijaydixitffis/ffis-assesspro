
import { Button } from "@/components/ui/button";
import { Bookmark } from "lucide-react";
import { AssignedAssessment } from "@/types/assessment";

interface TopicsButtonProps {
  assessment: AssignedAssessment;
  onViewTopics: () => void;
  disabled?: boolean;
}

export const TopicsButton = ({ 
  assessment, 
  onViewTopics,
  disabled = false
}: TopicsButtonProps) => {
  return (
    <Button 
      size="sm" 
      variant="outline"
      onClick={onViewTopics}
      disabled={disabled}
      className="border-primary/50 hover:bg-primary/10 hover:text-primary"
    >
      <Bookmark className="mr-1 h-4 w-4" />
      Topics
    </Button>
  );
};
