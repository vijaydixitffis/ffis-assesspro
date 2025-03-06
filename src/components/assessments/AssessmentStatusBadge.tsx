
import { Badge } from "@/components/ui/badge";

interface AssessmentStatusBadgeProps {
  status: string;
}

export const AssessmentStatusBadge = ({ status }: AssessmentStatusBadgeProps) => {
  return (
    <Badge 
      variant={status === 'COMPLETED' ? 'success' : 'default'}
    >
      {status}
    </Badge>
  );
};
