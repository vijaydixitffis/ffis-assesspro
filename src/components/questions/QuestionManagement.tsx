
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import QuestionForm from '@/components/questions/QuestionForm';
import QuestionsList from '@/components/questions/QuestionsList';
import { QuestionType } from './types';

interface QuestionManagementProps {
  isAdding: boolean;
  editingQuestion: any;
  topicId: string;
  userId: string;
  onFormClose: () => void;
  onEdit: (question: any) => void;
  refreshQuestions: number;
  selectedQuestionType?: QuestionType;
}

export default function QuestionManagement({
  isAdding,
  editingQuestion,
  topicId,
  userId,
  onFormClose,
  onEdit,
  refreshQuestions,
  selectedQuestionType = 'multiple_choice'
}: QuestionManagementProps) {
  return (
    <>
      {isAdding && topicId && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">
              Add New {selectedQuestionType === 'yes_no' ? 'Yes/No' : 
                      selectedQuestionType === 'multiple_choice' ? 'Multi-choice' : 'Free-text'} Question
            </CardTitle>
          </CardHeader>
          <CardContent>
            <QuestionForm 
              topicId={topicId} 
              userId={userId} 
              onClose={onFormClose}
              initialQuestionType={selectedQuestionType} 
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

      {/* Only show the questions list when not adding or editing a question */}
      {topicId && !isAdding && !editingQuestion && (
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
