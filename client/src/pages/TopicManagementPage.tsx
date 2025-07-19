import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/auth';
import { DashboardNav } from '@/components/DashboardNav';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import TopicsList from '@/components/topics/TopicsList';
import TopicForm from '@/components/topics/TopicForm';
import AssessmentSelector from '@/components/topics/AssessmentSelector';
import { BookOpen } from 'lucide-react';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose
} from '@/components/ui/dialog';

interface Assessment {
  id: string;
  title: string;
  description: string;
}

export default function TopicManagementPage() {
  const { user } = useAuth();
  const location = useLocation();
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [selectedAssessmentId, setSelectedAssessmentId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [editingTopic, setEditingTopic] = useState<any>(null);
  const [refreshTopics, setRefreshTopics] = useState(0);

  useEffect(() => {
    if (user?.role !== 'admin') {
      toast.error('You need admin privileges to access this page');
      return;
    }

    // Extract assessmentId from URL if present
    const params = new URLSearchParams(location.search);
    const assessmentId = params.get('assessmentId');
    
    fetchAssessments(assessmentId);
  }, [user, location.search]);

  const fetchAssessments = async (preselectedId: string | null = null) => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('assessments')
        .select('id, title, description')
        .order('title');
      
      if (error) throw error;
      
      setAssessments(data || []);
      
      // Set selected assessment - either from URL param, first in list, or null
      if (preselectedId) {
        setSelectedAssessmentId(preselectedId);
      } else if (data && data.length > 0) {
        setSelectedAssessmentId(data[0].id);
      }
    } catch (error) {
      console.error('Error fetching assessments:', error);
      toast.error('Failed to load assessments');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAssessmentChange = (assessmentId: string) => {
    setSelectedAssessmentId(assessmentId);
    setIsAdding(false);
    setEditingTopic(null);
  };

  const handleAddTopic = () => {
    setIsAdding(true);
    setEditingTopic(null);
  };

  const handleEditTopic = (topic: any) => {
    setEditingTopic(topic);
    setIsAdding(false);
  };

  const handleFormClose = () => {
    setIsAdding(false);
    setEditingTopic(null);
    setRefreshTopics(prev => prev + 1);
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
    <div className="flex h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <DashboardNav />
      <main className="flex-1 overflow-auto">
        <div className="container mx-auto max-w-7xl p-6 space-y-6">
          {/* Enhanced Header */}
          <div className="bg-gradient-to-r from-green-600 to-blue-600 rounded-lg p-6 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                  <BookOpen className="h-6 w-6" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold">Manage Topics</h1>
                  <p className="text-green-100 text-sm">Organize and structure your assessment content</p>
                </div>
              </div>
              <Dialog open={isAdding} onOpenChange={setIsAdding}>
                {!isAdding && !editingTopic && selectedAssessmentId && (
                  <DialogTrigger asChild>
                    <Button className="bg-white/20 hover:bg-white/30 text-white border-white/30 backdrop-blur-sm">
                      Add New Topic
                    </Button>
                  </DialogTrigger>
                )}
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Topic</DialogTitle>
                  </DialogHeader>
                  <TopicForm
                    assessmentId={selectedAssessmentId}
                    onCancel={() => setIsAdding(false)}
                    onSuccess={() => setIsAdding(false)}
                  />
                </DialogContent>
              </Dialog>
              <Dialog open={!!editingTopic} onOpenChange={(open) => { if (!open) handleFormClose(); }}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Edit Topic</DialogTitle>
                  </DialogHeader>
                  <TopicForm
                    topic={editingTopic}
                    assessmentId={selectedAssessmentId || ''}
                    onCancel={handleFormClose}
                    onSuccess={handleFormClose}
                  />
                </DialogContent>
              </Dialog>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="mb-4">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">Select Assessment</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">Choose an assessment to manage its topics</p>
            </div>
            <AssessmentSelector 
              assessments={assessments} 
              selectedId={selectedAssessmentId} 
              onChange={handleAssessmentChange} 
            />
          </div>

          {editingTopic && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-6">
              <div className="mb-4">
                <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Edit Topic</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">Update topic details and settings</p>
              </div>
              <TopicForm 
                topic={editingTopic} 
                assessmentId={selectedAssessmentId || ''} 
                onCancel={handleFormClose}
                onSuccess={handleFormClose}
              />
            </div>
          )}

          {selectedAssessmentId && !isLoading && !editingTopic && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
              <TopicsList 
                assessmentId={selectedAssessmentId} 
                onEdit={handleEditTopic} 
                refreshTrigger={refreshTopics}
              />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
