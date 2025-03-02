
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Edit, Trash } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';

interface QuestionsListProps {
  topicId: string;
  onEdit: (question: any) => void;
  refreshTrigger: number;
}

export default function QuestionsList({ topicId, onEdit, refreshTrigger }: QuestionsListProps) {
  const [questions, setQuestions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (topicId) {
      fetchQuestions();
    }
  }, [topicId, refreshTrigger]);

  const fetchQuestions = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('questions')
        .select(`
          id, 
          question, 
          type, 
          is_active, 
          created_at,
          sequence_number,
          answers (
            id,
            text,
            is_correct,
            marks
          )
        `)
        .eq('topic_id', topicId)
        .order('sequence_number', { ascending: true })
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      setQuestions(data || []);
    } catch (error) {
      console.error('Error fetching questions:', error);
      toast.error('Failed to load questions');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this question? This will also delete all associated answers.')) {
      return;
    }

    try {
      // First delete all answers associated with this question
      const { error: answersError } = await supabase
        .from('answers')
        .delete()
        .eq('question_id', id);
      
      if (answersError) throw answersError;

      // Then delete the question
      const { error } = await supabase
        .from('questions')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      toast.success('Question deleted successfully');
      fetchQuestions();
    } catch (error) {
      console.error('Error deleting question:', error);
      toast.error('Failed to delete question');
    }
  };

  if (isLoading) {
    return <div className="text-center py-4">Loading questions...</div>;
  }

  if (questions.length === 0) {
    return <div className="text-center py-4">No questions found for this topic. Add your first question!</div>;
  }

  const getQuestionTypeLabel = (type: string) => {
    switch (type) {
      case 'yes_no':
        return 'Yes/No';
      case 'multiple_choice':
        return 'Multiple Choice';
      case 'free_text':
        return 'Free Text';
      default:
        return type;
    }
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Questions ({questions.length})</h2>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[80px]">Seq #</TableHead>
            <TableHead>Question</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Answers</TableHead>
            <TableHead className="w-[120px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {questions.map((question) => (
            <TableRow key={question.id}>
              <TableCell>{question.sequence_number || '-'}</TableCell>
              <TableCell className="font-medium">{question.question}</TableCell>
              <TableCell>
                <Badge variant="outline">{getQuestionTypeLabel(question.type)}</Badge>
              </TableCell>
              <TableCell>
                {question.is_active ? (
                  <Badge variant="success" className="bg-green-100 text-green-800">Active</Badge>
                ) : (
                  <Badge variant="secondary" className="bg-gray-100 text-gray-800">Inactive</Badge>
                )}
              </TableCell>
              <TableCell>{question.answers?.length || 0} answers</TableCell>
              <TableCell className="space-x-2">
                <Button variant="ghost" size="sm" onClick={() => onEdit(question)}>
                  <Edit className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => handleDelete(question.id)}>
                  <Trash className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
