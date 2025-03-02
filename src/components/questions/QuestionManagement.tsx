import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Card, CardContent } from '@/components/ui/card';
import QuestionForm from '@/components/questions/QuestionForm';
import QuestionsList from '@/components/questions/QuestionsList';
import { useAuth } from '@/contexts/AuthContext';
import TopicHeader from './TopicHeader';
import { QuestionType, Answer } from './types';

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

    const getNextSequenceNumber = async () => {
      try {
        const { data, error } = await supabase
          .from('questions')
          .select('sequence_number')
          .eq('topic_id', selectedTopicId)
          .order('sequence_number', { ascending: false })
          .limit(1);
          
        if (error) throw error;
        
        const nextSequence = data && data.length > 0 && data[0].sequence_number
          ? data[0].sequence_number + 1
          : 1;
          
        return nextSequence;
      } catch (error) {
        console.error('Error getting next sequence number:', error);
        return 1; // Default to 1 if we can't determine
      }
    };

    getNextSequenceNumber().then(nextSequence => {
      const onSubmit = async (questionData: any) => {
        try {
          const { data, error } = await supabase
            .from('questions')
            .insert([
              {
                question: questionData.question,
                type: questionData.type,
                is_active: questionData.is_active,
                sequence_number: questionData.sequence_number || nextSequence,
                topic_id: selectedTopicId,
                created_by: user?.id,
              },
            ])
            .select('id')
            .single();

          if (error) throw error;
          
          if (data && questionData.answers && questionData.answers.length > 0) {
            const answersToInsert = questionData.answers
              .filter((answer: Answer) => answer.text.trim() !== '' || questionData.type === 'yes_no')
              .map((answer: Answer) => ({
                question_id: data.id,
                text: answer.text,
                is_correct: answer.is_correct,
                marks: answer.marks,
              }));
            
            if (answersToInsert.length > 0) {
              const { error: answersError } = await supabase
                .from('answers')
                .insert(answersToInsert);
              
              if (answersError) throw answersError;
            }
          }

          handleCloseQuestionForm();
        } catch (error) {
          console.error('Error creating question:', error);
          throw new Error('Failed to create question');
        }
      };

      setQuestionForm(
        <QuestionForm
          initialQuestion=""
          initialType={questionType}
          initialIsActive={true}
          initialSequenceNumber={nextSequence}
          onSubmit={onSubmit}
          onCancel={handleCloseQuestionForm}
          isEditing={false}
        />
      );
    });
  };

  const handleEditQuestion = (question: any) => {
    setIsAdding(false);
    setEditingQuestion(question);
    setQuestionForm(null); // Clear existing form

    const fetchAnswers = async () => {
      try {
        const { data, error } = await supabase
          .from('answers')
          .select('*')
          .eq('question_id', question.id)
          .order('id');
        
        if (error) throw error;
        
        return data || [];
      } catch (error) {
        console.error('Error fetching answers:', error);
        return [];
      }
    };

    fetchAnswers().then(answers => {
      const onSubmit = async (questionData: any) => {
        try {
          const { error } = await supabase
            .from('questions')
            .update({
              question: questionData.question,
              is_active: questionData.is_active,
              sequence_number: questionData.sequence_number,
              updated_at: new Date().toISOString(),
            })
            .eq('id', question.id);

          if (error) throw error;

          if (questionData.answers && questionData.answers.length > 0) {
            const { error: deleteError } = await supabase
              .from('answers')
              .delete()
              .eq('question_id', question.id);
            
            if (deleteError) throw deleteError;
            
            const answersToInsert = questionData.answers
              .filter((answer: Answer) => answer.text.trim() !== '' || question.type === 'yes_no')
              .map((answer: Answer) => ({
                question_id: question.id,
                text: answer.text,
                is_correct: answer.is_correct,
                marks: answer.marks,
              }));
            
            if (answersToInsert.length > 0) {
              const { error: insertError } = await supabase
                .from('answers')
                .insert(answersToInsert);
              
              if (insertError) throw insertError;
            }
          }

          handleCloseQuestionForm();
        } catch (error) {
          console.error('Error updating question:', error);
          throw new Error('Failed to update question');
        }
      };

      setQuestionForm(
        <QuestionForm
          initialQuestion={question.question}
          initialType={question.type}
          initialIsActive={question.is_active}
          initialSequenceNumber={question.sequence_number}
          initialAnswers={answers}
          onSubmit={onSubmit}
          onCancel={handleCloseQuestionForm}
          isEditing={true}
        />
      );
    });
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
