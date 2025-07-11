
import { Badge } from "@/components/ui/badge";

interface AssessmentStatusBadgeProps {
  status: string;
}

export const AssessmentStatusBadge = ({ status }: AssessmentStatusBadgeProps) => {
  const normalizedStatus = status.toLowerCase();
  
  const getVariant = (status: string) => {
    switch (status) {
      case 'completed':
        return 'default'; // Using default for completed (primary color)
      case 'in_progress':
      case 'started':
        return 'secondary'; // Using secondary for in progress
      case 'assigned':
      case 'not_started':
        return 'outline'; // Using outline for assigned/not started
      default:
        return 'secondary';
    }
  };

  const getDisplayText = (status: string) => {
    switch (status) {
      case 'not_started':
        return 'Not Started';
      case 'in_progress':
        return 'In Progress';
      case 'assigned':
        return 'Assigned';
      case 'completed':
        return 'Completed';
      case 'started':
        return 'Started';
      default:
        return status.charAt(0).toUpperCase() + status.slice(1);
    }
  };

  return (
    <Badge 
      variant={getVariant(normalizedStatus)}
    >
      {getDisplayText(normalizedStatus)}
    </Badge>
  );
};
