import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AssessmentTakingInterface } from '@/components/assessment/AssessmentTakingInterface';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';
import { toast } from 'sonner';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, ArrowLeft } from 'lucide-react';

interface AssignmentDetails {
  id: string;
  assessment_id: string;
  assessment_title: string;
  assessment_description: string;
  status: string;
  due_date: string | null;
  assigned_at: string;
}

export default function TakeAssessmentPage() {
  const { assignmentId } = useParams<{ assignmentId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [assignment, setAssignment] = useState<AssignmentDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (assignmentId) {
      fetchAssignmentDetails();
    }
  }, [assignmentId]);

  const fetchAssignmentDetails = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('assessment_assignments')
        .select(`
          id,
          assessment_id,
          status,
          due_date,
          assigned_at,
          assessments (
            title,
            description
          )
        `)
        .eq('id', assignmentId)
        .eq('user_id', user?.id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          setError('Assessment not found or you do not have permission to access it.');
        } else {
          throw error;
        }
        return;
      }

      if (!data) {
        setError('Assessment assignment not found.');
        return;
      }

      setAssignment({
        id: data.id,
        assessment_id: data.assessment_id,
        assessment_title: data.assessments.title,
        assessment_description: data.assessments.description,
        status: data.status,
        due_date: data.due_date,
        assigned_at: data.assigned_at
      });

    } catch (error) {
      console.error('Error fetching assignment details:', error);
      setError('Failed to load assessment details.');
      toast.error('Failed to load assessment details');
    } finally {
      setIsLoading(false);
    }
  };

  const handleComplete = () => {
    navigate('/my-assessments');
  };

  const handleBackToAssessments = () => {
    navigate('/my-assessments');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading assessment...</p>
        </div>
      </div>
    );
  }

  if (error || !assignment) {
    return (
      <div className="min-h-screen bg-gray-50 py-6">
        <div className="container mx-auto px-4 max-w-2xl">
          <Card>
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8 text-red-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Assessment Not Available</h1>
              <p className="text-gray-600 mb-6">
                {error || 'The assessment you are looking for is not available.'}
              </p>
              <Button onClick={handleBackToAssessments} className="flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" />
                Back to My Assessments
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <AssessmentTakingInterface
      assignmentId={assignment.id}
      assessmentId={assignment.assessment_id}
      assessmentTitle={assignment.assessment_title}
      onComplete={handleComplete}
    />
  );
}