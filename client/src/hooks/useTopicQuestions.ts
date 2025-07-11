
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

interface SubmittedAnswer {
  id: string;
  question_id: string;
  answer_id?: string | null;
  text_answer?: string | null;
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
  const [assessmentState, setAssessmentState] = useState<string | null>(null);
  const [previousAnswers, setPreviousAnswers] = useState<{ [key: string]: string | null }>({});
  const [previousTextAnswers, setPreviousTextAnswers] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (topicId && userId) {
      fetchTopic();
      fetchQuestions();
      checkAssessmentState();
    } else {
      // Reset states if no topicId or userId
      setQuestions([]);
      setTopic(null);
      setSubmission(null);
      setError(null);
      setAssessmentState(null);
      setPreviousAnswers({});
      setPreviousTextAnswers({});
    }
  }, [topicId, userId]);

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

  async function checkAssessmentState() {
    if (!userId || !topicId) return;
    
    setIsSubmissionLoading(true);
    
    try {
      const { data: topicData, error: topicError } = await supabase
        .from('topics')
        .select('assessment_id')
        .eq('id', topicId)
        .maybeSingle();
      
      if (topicError) {
        console.error('Error fetching topic assessment:', topicError);
        setError(`Failed to check assessment status: ${topicError.message}`);
        return;
      }
      
      if (!topicData) {
        setError('Topic assessment not found');
        return;
      }

      console.log('Checking assessment state for:', topicData.assessment_id, 'and user:', userId);
      
      const { data: assignmentData, error: assignmentError } = await supabase
        .from('assessment_assignments')
        .select('id, status')
        .eq('assessment_id', topicData.assessment_id)
        .eq('user_id', userId)
        .maybeSingle();
      
      if (assignmentError) {
        console.error('Error checking assignment status:', assignmentError);
        setError(`Failed to check assessment status: ${assignmentError.message}`);
        return;
      }
      
      console.log('Assignment data:', assignmentData);
      
      if (assignmentData) {
        setAssessmentState(assignmentData.status);
        
        // Fetch the submission in any case to allow for showing previous answers
        const { data: submissionData, error: submissionError } = await supabase
          .from('assessment_submissions')
          .select('id')
          .eq('assessment_id', topicData.assessment_id)
          .eq('user_id', userId)
          .maybeSingle();
        
        if (submissionError) {
          console.error('Error checking submission:', submissionError);
          return;
        }
        
        console.log('Submission data:', submissionData);
        if (submissionData) {
          setSubmission(submissionData);
          
          // Fetch previously submitted answers for this topic
          await fetchPreviousAnswers(submissionData.id);
        }
      } else {
        setAssessmentState(null);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      console.error('Error checking assessment status:', error);
      setError(`Failed to check assessment status: ${errorMessage}`);
    } finally {
      setIsSubmissionLoading(false);
    }
  }

  async function fetchPreviousAnswers(submissionId: string) {
    try {
      // First get all questions for this topic
      const { data: topicQuestions, error: questionsError } = await supabase
        .from('questions')
        .select('id')
        .eq('topic_id', topicId);
        
      if (questionsError) {
        console.error('Error fetching topic questions:', questionsError);
        return;
      }
        
      if (!topicQuestions || topicQuestions.length === 0) {
        return;
      }
        
      // Get question IDs
      const questionIds = topicQuestions.map(q => q.id);
        
      // Fetch submitted answers for these questions
      const { data: submittedAnswers, error: answersError } = await supabase
        .from('submitted_answers')
        .select('id, question_id, answer_id, text_answer')
        .eq('submission_id', submissionId)
        .in('question_id', questionIds);
        
      if (answersError) {
        console.error('Error fetching submitted answers:', answersError);
        return;
      }
        
      if (!submittedAnswers || submittedAnswers.length === 0) {
        return;
      }
        
      console.log('Found previous submitted answers:', submittedAnswers);
        
      // Map these to the state
      const choiceAnswers: { [key: string]: string | null } = {};
      const textAnswers: { [key: string]: string } = {};
        
      submittedAnswers.forEach((answer: SubmittedAnswer) => {
        if (answer.answer_id) {
          choiceAnswers[answer.question_id] = answer.answer_id;
        }
        if (answer.text_answer) {
          textAnswers[answer.question_id] = answer.text_answer;
        }
      });
        
      setPreviousAnswers(choiceAnswers);
      setPreviousTextAnswers(textAnswers);
        
      console.log('Set previous answers:', choiceAnswers, textAnswers);
    } catch (error) {
      console.error('Error fetching previous answers:', error);
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
        setQuestions([]);
        return;
      }

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

  const retryFetching = () => {
    if (topicId && userId) {
      fetchTopic();
      fetchQuestions();
      checkAssessmentState();
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
    assessmentState,
    previousAnswers,
    previousTextAnswers,
    retryFetching
  };
}
