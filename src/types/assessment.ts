
/**
 * Represents an assessment assigned to a user
 */
export interface AssignedAssessment {
  id: string;                  // Primary key of assessment_assignments (assignment_id)
  assessment_id: string;       // Foreign key to assessments table (assessment_id)
  assessment_title: string;
  status: string;
  due_date: string | null;
  assigned_at: string | null;
  scope: string;
}
