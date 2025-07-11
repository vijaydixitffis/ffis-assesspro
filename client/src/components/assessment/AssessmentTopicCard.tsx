import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Circle, PlayCircle } from 'lucide-react';

interface Topic {
  id: string;
  title: string;
  description: string;
  sequence_number: number;
  questionCount: number;
  completedCount: number;
  status: 'not_started' | 'in_progress' | 'completed';
}

interface AssessmentTopicCardProps {
  topic: Topic;
  onClick: () => void;
  isCurrentTopic?: boolean;
}

export function AssessmentTopicCard({ topic, onClick, isCurrentTopic = false }: AssessmentTopicCardProps) {
  const getStatusIcon = () => {
    switch (topic.status) {
      case 'completed':
        return <CheckCircle className="w-6 h-6 text-green-600" />;
      case 'in_progress':
        return <PlayCircle className="w-6 h-6 text-blue-600" />;
      default:
        return <Circle className="w-6 h-6 text-gray-400" />;
    }
  };

  const getStatusColor = () => {
    switch (topic.status) {
      case 'completed':
        return 'bg-green-50 border-green-200 hover:bg-green-100';
      case 'in_progress':
        return 'bg-blue-50 border-blue-200 hover:bg-blue-100';
      default:
        return 'bg-white border-gray-200 hover:bg-gray-50';
    }
  };

  const getProgressColor = () => {
    switch (topic.status) {
      case 'completed':
        return 'bg-green-600';
      case 'in_progress':
        return 'bg-blue-600';
      default:
        return 'bg-gray-300';
    }
  };

  const progressPercentage = topic.questionCount > 0 ? (topic.completedCount / topic.questionCount) * 100 : 0;

  return (
    <Card 
      className={`cursor-pointer transition-all duration-200 ${getStatusColor()} ${
        isCurrentTopic ? 'ring-2 ring-blue-500 ring-offset-2' : ''
      }`}
      onClick={onClick}
    >
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            {getStatusIcon()}
            <div>
              <h3 className="font-semibold text-lg text-gray-900">{topic.title}</h3>
              <p className="text-sm text-gray-600 mt-1">{topic.description}</p>
            </div>
          </div>
          <Badge variant="outline" className="text-xs">
            {topic.questionCount} questions
          </Badge>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Progress</span>
            <span className="font-medium">
              {topic.completedCount}/{topic.questionCount}
            </span>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-300 ${getProgressColor()}`}
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>{Math.round(progressPercentage)}% complete</span>
            {topic.status === 'completed' && (
              <span className="text-green-600 font-medium">✓ Done</span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}