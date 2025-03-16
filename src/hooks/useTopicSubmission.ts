
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

interface Answer {
  id: string;
  text: string;
  is_correct: boolean | null;
  marks: string | null;
}

interface Question {
  id: string;
  question: string;
  type: "multiple_choice" | "yes_no" | "free_text";
  is_active: boolean;
  sequence_number: number;
  answers: Answer[];
}

interface Topic {
  id: string;
  title: string;
  assessment_id: string;
}

export function useTopicSubmission() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const submitAnswers = async (
    questions: Question[],
    selectedAnswers: { [key: string]: string },
    textAnswers: { [key: string]: string },
    submission: { id: string } | null,
    topic: Topic | null
  ) => {
    if (!topic) {
      toast.error("Unable to submit answers. Topic information is missing.");
      return false;
    }

    // Check if all questions are answered
    const unansweredQuestions = questions.filter(q => {
      if (q.type === 'free_text') {
        return !textAnswers[q.id] || textAnswers[q.id].trim() === '';
      } else {
        return !selectedAnswers[q.id];
      }
    });

    if (unansweredQuestions.length > 0) {
      toast.error(`Please answer all questions before submitting.`);
      return false;
    }

    setIsSubmitting(true);
    try {
      let submissionId = submission?.id;
      
      // If no submission exists, we need to use the current user's ID
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error("Authentication required. Please log in again.");
        return false;
      }
      
      // No need to create a submission record here - we just submit the answers
      // Submit each answer
      for (const question of questions) {
        if (question.type === 'free_text') {
          // Handle free text answer
          await supabase
            .from('submitted_answers')
            .insert({
              question_id: question.id,
              submission_id: submissionId,
              text_answer: textAnswers[question.id]
            });
        } else {
          // Handle multiple choice or yes/no answers
          const answerId = selectedAnswers[question.id];
          const selectedAnswer = question.answers.find(a => a.id === answerId);
          
          await supabase
            .from('submitted_answers')
            .insert({
              question_id: question.id,
              submission_id: submissionId,
              answer_id: answerId,
              is_correct: selectedAnswer?.is_correct || null
            });
        }
      }
      
      toast.success("Answers submitted successfully!");
      // Navigate back to the topics page
      navigate(`/assessment-topics/${topic.assessment_id}`);
      return true;
    } catch (error) {
      console.error('Error submitting answers:', error);
      toast.error("Failed to submit answers. Please try again.");
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    isSubmitting,
    submitAnswers
  };
}
