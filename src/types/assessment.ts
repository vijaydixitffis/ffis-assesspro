
/**
 * Represents an assessment assigned to a user
 */
export interface AssignedAssessment {
  id: string;
  assessment_id: string;
  assessment_title: string;
  status: string;
  due_date: string | null;
  assigned_at: string | null;
  scope: string;
}
