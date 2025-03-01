
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { DashboardNav } from '@/components/DashboardNav';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import QuestionsList from '@/components/questions/QuestionsList';
import QuestionForm from '@/components/questions/QuestionForm';

interface Topic {
  id: string;
  title: string;
  description: string;
  assessment_title?: string;
}

export default function QuestionManagementPage() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const topicId = searchParams.get('topicId');
  const [topic, setTopic] = useState<Topic | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<any>(null);
  const [refreshQuestions, setRefreshQuestions] = useState(0);

  useEffect(() => {
    if (user?.role !== 'admin') {
      toast.error('You need admin privileges to access this page');
      return;
    }

    if (topicId) {
      fetchTopic(topicId);
    } else {
      setIsLoading(false);
      toast.error('No topic selected');
    }
  }, [user, topicId]);

  const fetchTopic = async (id: string) => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('topics')
        .select(`
          id, 
          title, 
          description,
          assessments (
            title
          )
        `)
        .eq('id', id)
        .single();
      
      if (error) throw error;
      
      if (data) {
        setTopic({
          id: data.id,
          title: data.title,
          description: data.description,
          assessment_title: data.assessments?.title
        });
      }
    } catch (error) {
      console.error('Error fetching topic:', error);
      toast.error('Failed to load topic information');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddQuestion = () => {
    setIsAdding(true);
    setEditingQuestion(null);
  };

  const handleEditQuestion = (question: any) => {
    setEditingQuestion(question);
    setIsAdding(false);
  };

  const handleFormClose = () => {
    setIsAdding(false);
    setEditingQuestion(null);
    // Trigger refresh of questions list
    setRefreshQuestions(prev => prev + 1);
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
            <div>
              <h1 className="text-2xl font-semibold">Question Mgmt.</h1>
              {topic && (
                <div className="text-sm text-muted-foreground">
                  Topic: {topic.title} {topic.assessment_title && `(Assessment: ${topic.assessment_title})`}
                </div>
              )}
            </div>
            {!isAdding && !editingQuestion && topicId && (
              <Button onClick={handleAddQuestion}>Add New Question</Button>
            )}
          </div>

          {isLoading ? (
            <div className="text-center py-8">Loading...</div>
          ) : !topicId ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8">
                  <p className="text-lg mb-2">No topic selected</p>
                  <p className="text-muted-foreground">Please select a topic from the Topics Management page.</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <>
              {isAdding && topicId && (
                <Card className="mb-6">
                  <CardHeader>
                    <CardTitle className="text-lg">Add New Question</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <QuestionForm 
                      topicId={topicId} 
                      userId={user?.id || ''} 
                      onClose={handleFormClose} 
                    />
                  </CardContent>
                </Card>
              )}

              {editingQuestion && (
                <Card className="mb-6">
                  <CardHeader>
                    <CardTitle className="text-lg">Edit Question</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <QuestionForm 
                      question={editingQuestion} 
                      topicId={topicId} 
                      userId={user?.id || ''} 
                      onClose={handleFormClose} 
                    />
                  </CardContent>
                </Card>
              )}

              {/* Only show QuestionsList when not editing a question */}
              {topicId && !isLoading && !editingQuestion && (
                <>
                  <Separator className="my-6" />
                  <QuestionsList 
                    topicId={topicId} 
                    onEdit={handleEditQuestion} 
                    refreshTrigger={refreshQuestions}
                  />
                </>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
