import { formatDate } from "@/utils/formatUtils";
import { AssignedAssessment } from "@/types/assessment";
import { AssessmentStatusBadge } from "./AssessmentStatusBadge";
import { AssessmentActionButtons } from "./AssessmentActionButtons";
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";

interface AssessmentsTableProps {
  assessments: AssignedAssessment[];
  userId: string;
  onStatusUpdate: (assessmentId: string, newStatus: string) => void;
  showDebug?: boolean;
  completionMap: Record<string, boolean>;
}

export const AssessmentsTable = ({ 
  assessments, 
  userId,
  onStatusUpdate,
  showDebug = false,
  completionMap,
}: AssessmentsTableProps) => {
  return (
    <div className="rounded-md border">
      <Table>
        <TableCaption>A list of all your assigned assessments.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Assessment</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Scope</TableHead>
            <TableHead>Assigned Date</TableHead>
            <TableHead>Due Date</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {assessments.map((assessment) => (
            <TableRow key={assessment.id}>
              <TableCell className="font-medium">{assessment.assessment_title}</TableCell>
              <TableCell>
                <AssessmentStatusBadge status={assessment.status} />
              </TableCell>
              <TableCell>{assessment.scope}</TableCell>
              <TableCell>{formatDate(assessment.assigned_at)}</TableCell>
              <TableCell>{formatDate(assessment.due_date)}</TableCell>
              <TableCell>
                <AssessmentActionButtons 
                  assessment={assessment} 
                  userId={userId}
                  onStatusUpdate={onStatusUpdate}
                  showDebug={showDebug}
                  isAllTopicsCompleted={completionMap[assessment.id] || false}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
