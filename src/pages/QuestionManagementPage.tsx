
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
  const { topic, isLoading } = useTopicData(topicId);

  if (user?.role !== 'admin') {
    return <AccessDeniedView />;
  }

  return (
    <div className="flex h-screen">
      <DashboardNav />
      <main className="flex-1 overflow-auto">
        <div className="container mx-auto max-w-7xl p-6">
          {isLoading ? (
            <div className="text-center py-8">Loading...</div>
          ) : !topicId ? (
            <NoTopicSelected />
          ) : (
            <QuestionManagement />
          )}
        </div>
      </main>
    </div>
  );
}
