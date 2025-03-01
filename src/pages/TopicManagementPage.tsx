
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { DashboardNav } from '@/components/DashboardNav';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import TopicsList from '@/components/topics/TopicsList';
import TopicForm from '@/components/topics/TopicForm';
import AssessmentSelector from '@/components/topics/AssessmentSelector';

interface Assessment {
  id: string;
  title: string;
  description: string;
}

export default function TopicManagementPage() {
  const { user } = useAuth();
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

    fetchAssessments();
  }, [user]);

  const fetchAssessments = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('assessments')
        .select('id, title, description')
        .order('title');
      
      if (error) throw error;
      
      setAssessments(data || []);
      if (data && data.length > 0) {
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
    // Trigger refresh of topics list
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
    <div className="flex h-screen">
      <DashboardNav />
      <main className="flex-1 overflow-auto">
        <div className="container mx-auto max-w-7xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-semibold">Topic Management</h1>
            {!isAdding && !editingTopic && selectedAssessmentId && (
              <Button onClick={handleAddTopic}>Add New Topic</Button>
            )}
          </div>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg">Select Assessment</CardTitle>
            </CardHeader>
            <CardContent>
              <AssessmentSelector 
                assessments={assessments} 
                selectedId={selectedAssessmentId} 
                onChange={handleAssessmentChange} 
                isLoading={isLoading}
              />
            </CardContent>
          </Card>

          {isAdding && selectedAssessmentId && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-lg">Add New Topic</CardTitle>
              </CardHeader>
              <CardContent>
                <TopicForm 
                  assessmentId={selectedAssessmentId} 
                  userId={user?.id || ''} 
                  onClose={handleFormClose} 
                />
              </CardContent>
            </Card>
          )}

          {editingTopic && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-lg">Edit Topic</CardTitle>
              </CardHeader>
              <CardContent>
                <TopicForm 
                  topic={editingTopic} 
                  assessmentId={selectedAssessmentId || ''} 
                  userId={user?.id || ''} 
                  onClose={handleFormClose} 
                />
              </CardContent>
            </Card>
          )}

          {selectedAssessmentId && !isLoading && (
            <>
              <Separator className="my-6" />
              <TopicsList 
                assessmentId={selectedAssessmentId} 
                onEdit={handleEditTopic} 
                refreshTrigger={refreshTopics}
              />
            </>
          )}
        </div>
      </main>
    </div>
  );
}
