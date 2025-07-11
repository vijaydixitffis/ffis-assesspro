import { useState } from "react";
import { AssignedAssessment } from "@/types/assessment";
import { StartButton } from "./StartButton";
import { SubmitButton } from "./SubmitButton";
import { TopicsButton } from "./TopicsButton";
import { useAssessmentStatusUpdate } from "@/hooks/useAssessmentStatusUpdate";
import { AssessmentModal } from "@/components/assessment/AssessmentModal";
import { Button } from "@/components/ui/button";
import { PlayCircle, CheckCircle } from "lucide-react";

interface AssessmentActionButtonsProps {
  assessment: AssignedAssessment;
  userId: string;
  onStatusUpdate: (assignmentId: string, newStatus: string) => void;
  showDebug?: boolean;
  isAllTopicsCompleted: boolean;
}

export const AssessmentActionButtons = ({ 
  assessment, 
  userId,
  onStatusUpdate,
  showDebug = false,
  isAllTopicsCompleted,
}: AssessmentActionButtonsProps) => {
  const [isAssessmentModalOpen, setIsAssessmentModalOpen] = useState(false);
  const { updatingAssessment, updateAssessmentStatus } = useAssessmentStatusUpdate(onStatusUpdate);

  const handleStartAssessment = async () => {
    console.log(`Starting assignment with ID: ${assessment.id} for user ${userId}`);
    console.log('Assessment data before update:', JSON.stringify(assessment, null, 2));
    
    try {
      // Ensure we have a valid ID before attempting update
      if (!assessment.id) {
        console.error('Missing assessment ID, cannot update status');
        return;
      }
      
      // Add assessment ID debug info
      console.log(`Attempting to update assessment with ID: ${assessment.id}`);
      
      const success = await updateAssessmentStatus(assessment.id, 'STARTED');
      console.log('Update status returned:', success);
      
      if (success) {
        console.log(`Opening assessment modal for assessment ID: ${assessment.assessment_id}`);
        setIsAssessmentModalOpen(true);
      } else {
        console.error('Failed to update assessment status');
      }
    } catch (err) {
      console.error('Error in handleStartAssessment:', err);
    }
  };

  const handleSubmitAssessment = async () => {
    console.log(`Submitting assignment with ID: ${assessment.id}`);
    try {
      if (!assessment.id) {
        console.error('Missing assessment ID, cannot update status');
        return;
      }
      
      // Add assessment ID debug info
      console.log(`Attempting to update assessment with ID: ${assessment.id}`);
      
      const success = await updateAssessmentStatus(assessment.id, 'COMPLETED');
      console.log('Submit update status returned:', success);
      
      if (!success) {
        console.error('Failed to update assessment status to COMPLETED');
      }
    } catch (err) {
      console.error('Error in handleSubmitAssessment:', err);
    }
  };

  const handleTakeAssessment = async () => {
    // Update status to STARTED if not already started
    if (assessment.status === 'ASSIGNED') {
      const success = await updateAssessmentStatus(assessment.id, 'STARTED');
      if (!success) {
        console.error('Failed to update assessment status');
        return;
      }
    }
    setIsAssessmentModalOpen(true);
  };

  const handleViewTopics = () => {
    setIsAssessmentModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsAssessmentModalOpen(false);
  };

  const handleAssessmentComplete = () => {
    setIsAssessmentModalOpen(false);
    // Trigger a refresh of the assessments list
    onStatusUpdate(assessment.id, 'COMPLETED');
  };

  // Normalize status to lowercase for comparison
  const normalizedStatus = assessment.status.toLowerCase();
  
  return (
    <div className="flex space-x-2">
      {/* New Take Assessment Button */}
      {(normalizedStatus === 'assigned' || normalizedStatus === 'not_started') && (
        <Button 
          onClick={handleTakeAssessment}
          className="flex items-center gap-2"
          size="sm"
        >
          <PlayCircle className="w-4 h-4" />
          Take Assessment
        </Button>
      )}
      
      {(normalizedStatus === 'in_progress' || normalizedStatus === 'started') && (
        <Button 
          onClick={handleTakeAssessment}
          variant="outline"
          className="flex items-center gap-2"
          size="sm"
        >
          <PlayCircle className="w-4 h-4" />
          Continue
        </Button>
      )}
      
      {normalizedStatus === 'completed' && (
        <Button 
          onClick={handleTakeAssessment}
          variant="outline"
          className="flex items-center gap-2"
          size="sm"
          disabled
        >
          <CheckCircle className="w-4 h-4" />
          Completed
        </Button>
      )}

      {/* Legacy buttons for debugging */}
      {showDebug && (
        <>
          {assessment.status === 'ASSIGNED' ? (
            <StartButton 
              assessment={assessment}
              userId={userId}
              updatingAssessment={updatingAssessment}
              onStartAssessment={handleStartAssessment}
              showDebug={showDebug}
            />
          ) : assessment.status === 'STARTED' ? (
            <TopicsButton
              assessment={assessment}
              onViewTopics={handleViewTopics}
            />
          ) : null}
          
          <SubmitButton 
            assessment={assessment}
            updatingAssessment={updatingAssessment}
            onSubmitAssessment={handleSubmitAssessment}
            isAllTopicsCompleted={isAllTopicsCompleted}
            disabled={assessment.status !== 'STARTED'}
          />
        </>
      )}

      {/* Assessment Modal */}
      <AssessmentModal
        isOpen={isAssessmentModalOpen}
        onClose={handleCloseModal}
        assignmentId={assessment.id}
        assessmentId={assessment.assessment_id}
        assessmentTitle={assessment.assessment_title}
        onComplete={handleAssessmentComplete}
      />
    </div>
  );
};
