
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { QuestionType } from "@/components/questions/types";

interface Answer {
  id: string;
  text: string;
  is_correct: boolean | null;
  marks: string | null;
}

interface Question {
  id: string;
  question: string;
  type: QuestionType;
  is_active: boolean;
  sequence_number: number;
  answers: Answer[];
}

interface Topic {
  id: string;
  title: string;
  assessment_id: string;
}

export function useTopicQuestions(topicId: string | undefined, userId: string | undefined) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [topic, setTopic] = useState<Topic | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [submission, setSubmission] = useState<{ id: string } | null>(null);

  useEffect(() => {
    if (topicId && userId) {
      fetchTopic();
      fetchQuestions();
      checkSubmission();
    }
  }, [topicId, userId]);

  async function fetchTopic() {
    try {
      const { data, error } = await supabase
        .from('topics')
        .select('id, title, assessment_id')
        .eq('id', topicId)
        .single();

      if (error) {
        console.error('Error fetching topic:', error);
        toast.error('Failed to load topic');
        return;
      }

      setTopic(data);
    } catch (error) {
      console.error('Error in fetch operation:', error);
      toast.error('An error occurred while loading topic');
    }
  }

  async function checkSubmission() {
    if (!userId || !topicId) return;
    
    try {
      // First get the assessment_id for this topic
      const { data: topicData, error: topicError } = await supabase
        .from('topics')
        .select('assessment_id')
        .eq('id', topicId)
        .single();
      
      if (topicError) {
        console.error('Error fetching topic assessment:', topicError);
        return;
      }
      
      // Check if there's an active submission for this assessment
      const { data: submissionData, error: submissionError } = await supabase
        .from('assessment_submissions')
        .select('id')
        .eq('assessment_id', topicData.assessment_id)
        .eq('user_id', userId)
        .is('completed_at', null)
        .single();
      
      if (submissionError && submissionError.code !== 'PGRST116') {
        console.error('Error checking submission:', submissionError);
        return;
      }
      
      if (submissionData) {
        setSubmission(submissionData);
      }
    } catch (error) {
      console.error('Error checking submission status:', error);
    }
  }

  async function fetchQuestions() {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('questions')
        .select(`
          id, 
          question, 
          type, 
          is_active, 
          sequence_number,
          answers (
            id,
            text,
            is_correct,
            marks
          )
        `)
        .eq('topic_id', topicId)
        .eq('is_active', true)
        .order('sequence_number', { ascending: true });

      if (error) {
        console.error('Error fetching questions:', error);
        toast.error('Failed to load questions');
        return;
      }

      // Cast the type to ensure it matches the QuestionType
      const typedQuestions = data?.map(q => ({
        ...q,
        type: q.type as QuestionType,
      })) || [];

      setQuestions(typedQuestions);
    } catch (error) {
      console.error('Error in fetch operation:', error);
      toast.error('An error occurred while loading questions');
    } finally {
      setIsLoading(false);
    }
  }

  return {
    questions,
    topic,
    isLoading,
    submission
  };
}
