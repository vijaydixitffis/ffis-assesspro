
import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { DashboardNav } from '@/components/DashboardNav';
import { useTopicData } from '@/components/questions/useTopicData';
import AccessDeniedView from '@/components/questions/AccessDeniedView';
import TopicHeader from '@/components/questions/TopicHeader';
import NoTopicSelected from '@/components/questions/NoTopicSelected';
import QuestionManagement from '@/components/questions/QuestionManagement';
import { QuestionType } from '@/components/questions/types';

export default function QuestionManagementPage() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const topicId = searchParams.get('topicId');
  const [isAdding, setIsAdding] = useState(false);
  const [selectedQuestionType, setSelectedQuestionType] = useState<QuestionType>('multiple_choice');
  const [editingQuestion, setEditingQuestion] = useState<any>(null);
  const [refreshQuestions, setRefreshQuestions] = useState(0);
  const { topic, isLoading } = useTopicData(topicId);

  const handleAddQuestion = (questionType: QuestionType) => {
    setIsAdding(true);
    setSelectedQuestionType(questionType);
    setEditingQuestion(null);
  };

  const handleEditQuestion = (question: any) => {
    console.log('Editing question with answers:', question.answers);
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
    return <AccessDeniedView />;
  }

  return (
    <div className="flex h-screen">
      <DashboardNav />
      <main className="flex-1 overflow-auto">
        <div className="container mx-auto max-w-7xl p-6">
          <TopicHeader 
            topic={topic}
            isAdding={isAdding}
            editingQuestion={editingQuestion}
            topicId={topicId}
            onAddQuestion={handleAddQuestion}
          />

          {isLoading ? (
            <div className="text-center py-8">Loading...</div>
          ) : !topicId ? (
            <NoTopicSelected />
          ) : (
            <QuestionManagement
              isAdding={isAdding}
              editingQuestion={editingQuestion}
              topicId={topicId}
              userId={user?.id || ''}
              onFormClose={handleFormClose}
              onEdit={handleEditQuestion}
              refreshQuestions={refreshQuestions}
              selectedQuestionType={selectedQuestionType}
            />
          )}
        </div>
      </main>
    </div>
  );
}
