
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import QuestionForm from '@/components/questions/QuestionForm';
import QuestionsList from '@/components/questions/QuestionsList';

interface QuestionManagementProps {
  isAdding: boolean;
  editingQuestion: any;
  topicId: string;
  userId: string;
  onFormClose: () => void;
  onEdit: (question: any) => void;
  refreshQuestions: number;
}

export default function QuestionManagement({
  isAdding,
  editingQuestion,
  topicId,
  userId,
  onFormClose,
  onEdit,
  refreshQuestions
}: QuestionManagementProps) {
  return (
    <>
      {isAdding && topicId && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Add New Question</CardTitle>
          </CardHeader>
          <CardContent>
            <QuestionForm 
              topicId={topicId} 
              userId={userId} 
              onClose={onFormClose} 
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
              userId={userId} 
              onClose={onFormClose} 
            />
          </CardContent>
        </Card>
      )}

      {topicId && (
        <>
          <Separator className="my-6" />
          <QuestionsList 
            topicId={topicId} 
            onEdit={onEdit} 
            refreshTrigger={refreshQuestions}
          />
        </>
      )}
    </>
  );
}
