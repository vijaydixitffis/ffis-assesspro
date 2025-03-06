
/**
 * Represents an assessment assigned to a user
 */
export interface AssignedAssessment {
  id: string;                  // Primary key of assessment_assignments (assignment_id)
  assessment_id: string;       // Foreign key to assessments table
  assessment_title: string;    // Title of the assessment
  status: string;              // Current status of the assignment
  due_date: string | null;     // Due date for the assignment
  assigned_at: string | null;  // When the assessment was assigned
  scope: string;               // Scope of the assessment
}
