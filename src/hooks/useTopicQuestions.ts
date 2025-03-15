
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
  const [isLoading, setIsLoading] = useState(false);
  const [isTopicLoading, setIsTopicLoading] = useState(false);
  const [isQuestionsLoading, setIsQuestionsLoading] = useState(false);
  const [isSubmissionLoading, setIsSubmissionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submission, setSubmission] = useState<{ id: string } | null>(null);

  useEffect(() => {
    if (topicId && userId) {
      fetchTopic();
      fetchQuestions();
      checkSubmission();
    } else {
      // Reset states if no topicId or userId
      setQuestions([]);
      setTopic(null);
      setSubmission(null);
      setError(null);
    }
  }, [topicId, userId]);

  // Update overall loading state whenever any individual loading state changes
  useEffect(() => {
    setIsLoading(isTopicLoading || isQuestionsLoading || isSubmissionLoading);
  }, [isTopicLoading, isQuestionsLoading, isSubmissionLoading]);

  async function fetchTopic() {
    setIsTopicLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from('topics')
        .select('id, title, assessment_id')
        .eq('id', topicId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching topic:', error);
        setError(`Failed to load topic: ${error.message}`);
        toast.error('Failed to load topic');
        return;
      }

      if (!data) {
        setError('Topic not found');
        toast.error('Topic not found');
        return;
      }

      setTopic(data);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      console.error('Error in fetch operation:', error);
      setError(`An error occurred while loading topic: ${errorMessage}`);
      toast.error('An error occurred while loading topic');
    } finally {
      setIsTopicLoading(false);
    }
  }

  async function checkSubmission() {
    if (!userId || !topicId) return;
    
    setIsSubmissionLoading(true);
    
    try {
      // First get the assessment_id for this topic
      const { data: topicData, error: topicError } = await supabase
        .from('topics')
        .select('assessment_id')
        .eq('id', topicId)
        .maybeSingle();
      
      if (topicError) {
        console.error('Error fetching topic assessment:', topicError);
        setError(`Failed to check submission status: ${topicError.message}`);
        return;
      }
      
      if (!topicData) {
        setError('Topic assessment not found');
        return;
      }
      
      // Check if there's an active submission for this assessment
      const { data: submissionData, error: submissionError } = await supabase
        .from('assessment_submissions')
        .select('id')
        .eq('assessment_id', topicData.assessment_id)
        .eq('user_id', userId)
        .is('completed_at', null)
        .maybeSingle();
      
      if (submissionError) {
        console.error('Error checking submission:', submissionError);
        setError(`Failed to check submission status: ${submissionError.message}`);
        return;
      }
      
      setSubmission(submissionData);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      console.error('Error checking submission status:', error);
      setError(`Failed to check submission status: ${errorMessage}`);
    } finally {
      setIsSubmissionLoading(false);
    }
  }

  async function fetchQuestions() {
    setIsQuestionsLoading(true);
    setError(null);
    
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
        setError(`Failed to load questions: ${error.message}`);
        toast.error('Failed to load questions');
        return;
      }

      if (!data || data.length === 0) {
        // Not setting an error here as empty questions is a valid state
        setQuestions([]);
        return;
      }

      // Cast the type to ensure it matches the QuestionType
      const typedQuestions = data.map(q => ({
        ...q,
        type: q.type as QuestionType,
      }));

      setQuestions(typedQuestions);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      console.error('Error in fetch operation:', error);
      setError(`An error occurred while loading questions: ${errorMessage}`);
      toast.error('An error occurred while loading questions');
    } finally {
      setIsQuestionsLoading(false);
    }
  }

  // Function to manually retry fetching everything
  const retryFetching = () => {
    if (topicId && userId) {
      fetchTopic();
      fetchQuestions();
      checkSubmission();
    }
  };

  return {
    questions,
    topic,
    isLoading,
    isTopicLoading,
    isQuestionsLoading,
    isSubmissionLoading,
    error,
    submission,
    retryFetching
  };
}
