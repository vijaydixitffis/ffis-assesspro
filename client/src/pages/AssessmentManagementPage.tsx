
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth';
import { DashboardNav } from '@/components/DashboardNav';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import AssessmentsList from '@/components/assessments/AssessmentsList';
import AssessmentForm from '@/components/assessments/AssessmentForm';
import { CreateAIAssessment } from '@/components/assessments/CreateAIAssessment';

export default function AssessmentManagementPage() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [editingAssessment, setEditingAssessment] = useState<any>(null);
  const [refreshKey, setRefreshKey] = useState(0); // Add a refresh key to trigger re-renders

  useEffect(() => {
    if (user?.role !== 'admin') {
      toast.error('You need admin privileges to access this page');
    }
    // Set loading to false after checking user role
    setIsLoading(false);
  }, [user]);

  const handleAddAssessment = () => {
    setIsAdding(true);
    setEditingAssessment(null);
  };

  const handleEditAssessment = (assessment: any) => {
    setEditingAssessment(assessment);
    setIsAdding(false);
  };

  const handleFormClose = () => {
    setIsAdding(false);
    setEditingAssessment(null);
    // Trigger re-render of the assessment list
    setRefreshKey(prev => prev + 1);
  };

  if (user?.role !== 'admin') {
    return (
      <div className="flex h-screen">
        <DashboardNav />
        <main className="flex-1 overflow-auto">
          <div className="container mx-auto max-w-7xl p-6">
            <h1 className="text-2xl font-semibold mb-4">Access Denied</h1>
            <p>You need admin privileges to access this page.</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex h-screen">
      <DashboardNav />
      <main className="flex-1 overflow-auto">
        <div className="container mx-auto max-w-7xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-semibold">Manage Assessments</h1>
            {!isAdding && !editingAssessment && (
              <Button onClick={handleAddAssessment}>Add New Assessment</Button>
            )}
          </div>

          {/* Quick Create AI Assessment */}
          {!isAdding && !editingAssessment && (
            <div className="mb-6">
              <CreateAIAssessment />
            </div>
          )}

          {isAdding && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-lg">Add New Assessment</CardTitle>
              </CardHeader>
              <CardContent>
                <AssessmentForm 
                  userId={user?.id || ''} 
                  onClose={handleFormClose} 
                />
              </CardContent>
            </Card>
          )}

          {editingAssessment && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-lg">Edit Assessment</CardTitle>
              </CardHeader>
              <CardContent>
                <AssessmentForm 
                  assessment={editingAssessment} 
                  userId={user?.id || ''} 
                  onClose={handleFormClose} 
                />
              </CardContent>
            </Card>
          )}

          {/* Only show the Separator and AssessmentsList when not editing or adding */}
          {!isAdding && !editingAssessment && (
            <>
              <Separator className="my-6" />
              <AssessmentsList key={refreshKey} onEdit={handleEditAssessment} />
            </>
          )}
        </div>
      </main>
    </div>
  );
}
