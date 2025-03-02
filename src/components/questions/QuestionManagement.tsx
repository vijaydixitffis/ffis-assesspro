
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Card, CardContent } from '@/components/ui/card';
import QuestionForm from '@/components/questions/QuestionForm';
import QuestionsList from '@/components/questions/QuestionsList';
import { useAuth } from '@/contexts/AuthContext';
import TopicHeader from './TopicHeader';
import { QuestionType } from './types';

interface Topic {
  id: string;
  title: string;
  description: string;
  assessment_title?: string;
  sequence_number?: number;
}

export default function QuestionManagement() {
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(null);
  const [topic, setTopic] = useState<Topic | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<any>(null);
  const [questionForm, setQuestionForm] = useState<JSX.Element | null>(null);
  const [refreshQuestions, setRefreshQuestions] = useState(0);

  useEffect(() => {
    const topicId = searchParams.get('topicId');
    setSelectedTopicId(topicId);
  }, [searchParams]);

  useEffect(() => {
    if (selectedTopicId) {
      fetchTopic(selectedTopicId);
    }
  }, [selectedTopicId]);

  const fetchTopic = async (topicId: string) => {
    try {
      const { data, error } = await supabase
        .from('topics')
        .select('id, title, description, sequence_number, assessments(title)')
        .eq('id', topicId)
        .single();

      if (error) throw error;

      if (data) {
        setTopic({
          id: data.id,
          title: data.title,
          description: data.description,
          sequence_number: data.sequence_number,
          assessment_title: data.assessments?.title || undefined,
        });
      } else {
        toast.error('Topic not found');
      }
    } catch (error) {
      console.error('Error fetching topic:', error);
      toast.error('Failed to load topic');
    }
  };

  const handleAddQuestion = (questionType: QuestionType) => {
    setIsAdding(true);
    setEditingQuestion(null);
    setQuestionForm(null); // Clear existing form

    setQuestionForm(
      <QuestionForm
        initialQuestionType={questionType}
        topicId={selectedTopicId || ''}
        userId={user?.id || ''}
        onClose={handleCloseQuestionForm}
      />
    );
  };

  const handleEditQuestion = (question: any) => {
    setIsAdding(false);
    setEditingQuestion(question);
    setQuestionForm(null); // Clear existing form

    setQuestionForm(
      <QuestionForm
        question={question}
        topicId={selectedTopicId || ''}
        userId={user?.id || ''}
        onClose={handleCloseQuestionForm}
      />
    );
  };

  const handleCloseQuestionForm = () => {
    setIsAdding(false);
    setEditingQuestion(null);
    setQuestionForm(null);
    setRefreshQuestions(prev => prev + 1);
  };

  return (
    <div>
      <TopicHeader 
        topic={topic}
        isAdding={isAdding}
        editingQuestion={editingQuestion}
        topicId={selectedTopicId}
        onAddQuestion={handleAddQuestion}
      />

      {questionForm && (
        <Card className="mb-6">
          <CardContent>
            {questionForm}
          </CardContent>
        </Card>
      )}

      {selectedTopicId && !isAdding && !editingQuestion && (
        <QuestionsList 
          topicId={selectedTopicId} 
          onEdit={handleEditQuestion}
          refreshTrigger={refreshQuestions}
        />
      )}
    </div>
  );
}
