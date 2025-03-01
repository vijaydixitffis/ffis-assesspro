
import { Button } from '@/components/ui/button';

interface Topic {
  id: string;
  title: string;
  description: string;
  assessment_title?: string;
}

interface TopicHeaderProps {
  topic: Topic | null;
  isAdding: boolean;
  editingQuestion: any;
  topicId: string | null;
  onAddQuestion: () => void;
}

export default function TopicHeader({ 
  topic, 
  isAdding, 
  editingQuestion, 
  topicId, 
  onAddQuestion 
}: TopicHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h1 className="text-2xl font-semibold">Question Management</h1>
        {topic && (
          <div className="text-sm text-muted-foreground">
            Topic: {topic.title} {topic.assessment_title && `(Assessment: ${topic.assessment_title})`}
          </div>
        )}
      </div>
      {!isAdding && !editingQuestion && topicId && (
        <Button onClick={onAddQuestion}>Add New Question</Button>
      )}
    </div>
  );
}
