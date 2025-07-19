
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth';
import { DashboardNav } from '@/components/DashboardNav';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose
} from '@/components/ui/dialog';

import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import AssessmentsList from '@/components/assessments/AssessmentsList';
import AssessmentForm from '@/components/assessments/AssessmentForm';
import { ClipboardList } from 'lucide-react';




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
    <div className="flex h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <DashboardNav />
      <main className="flex-1 overflow-auto">
        <div className="container mx-auto max-w-7xl p-6 space-y-6">
          {/* Enhanced Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                  <ClipboardList className="h-6 w-6" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold">Manage Assessments</h1>
                  <p className="text-blue-100 text-sm">Create and manage assessment configurations</p>
                </div>
              </div>
              <Dialog open={isAdding} onOpenChange={setIsAdding}>
                {!isAdding && !editingAssessment && (
                  <DialogTrigger asChild>
                    <Button className="bg-white/20 hover:bg-white/30 text-white border-white/30 backdrop-blur-sm">
                      Add New Assessment
                    </Button>
                  </DialogTrigger>
                )}
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Assessment</DialogTitle>
                  </DialogHeader>
                  <AssessmentForm
                    userId={user?.id || ''}
                    onClose={() => setIsAdding(false)}
                  />
                </DialogContent>
              </Dialog>
              <Dialog open={!!editingAssessment} onOpenChange={(open) => { if (!open) handleFormClose(); }}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Edit Assessment</DialogTitle>
                  </DialogHeader>
                  <AssessmentForm
                    assessment={editingAssessment}
                    userId={user?.id || ''}
                    onClose={handleFormClose}
                  />
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Only show the AssessmentsList when not editing or adding */}
          {!isAdding && !editingAssessment && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
              <AssessmentsList key={refreshKey} onEdit={handleEditAssessment} />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
