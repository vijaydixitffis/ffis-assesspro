
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/auth";
import { DashboardNav } from "@/components/DashboardNav";
import { supabase } from "@/integrations/supabase/client";
import { 
  Card, 
  CardContent,
  CardFooter
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { AlertCircle } from "lucide-react";

interface Question {
  id: string;
  question: string;
  type: 'multiple_choice' | 'yes_no' | 'free_text';
  is_active: boolean;
  sequence_number: number;
  answers: Answer[];
}

interface Answer {
  id: string;
  text: string;
  is_correct: boolean | null;
  marks: string | null;
}

interface Topic {
  id: string;
  title: string;
  assessment_id: string;
}

export default function TopicQuestionsPage() {
  const { topicId } = useParams<{ topicId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [topic, setTopic] = useState<Topic | null>(null);
  const [selectedAnswers, setSelectedAnswers] = useState<{ [key: string]: string }>({});
  const [textAnswers, setTextAnswers] = useState<{ [key: string]: string }>({});
  const [isLoading, setIsLoading] = useState(true);
  const [submission, setSubmission] = useState<{ id: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (topicId && user?.id) {
      fetchTopic();
      fetchQuestions();
      checkSubmission();
    }
  }, [topicId, user]);

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
    if (!user || !topicId) return;
    
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
        .eq('user_id', user.id)
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

      setQuestions(data || []);
    } catch (error) {
      console.error('Error in fetch operation:', error);
      toast.error('An error occurred while loading questions');
    } finally {
      setIsLoading(false);
    }
  }

  const handleAnswerSelect = (questionId: string, answerId: string) => {
    setSelectedAnswers({
      ...selectedAnswers,
      [questionId]: answerId
    });
  };

  const handleTextAnswerChange = (questionId: string, text: string) => {
    setTextAnswers({
      ...textAnswers,
      [questionId]: text
    });
  };

  const handleSubmitAnswers = async () => {
    if (!user || !topic || !submission) {
      toast.error("Unable to submit answers. Please try again later.");
      return;
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
      return;
    }

    setIsSubmitting(true);
    try {
      // Submit each answer
      for (const question of questions) {
        if (question.type === 'free_text') {
          // Handle free text answer
          await supabase
            .from('submitted_answers')
            .insert({
              question_id: question.id,
              submission_id: submission.id,
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
              submission_id: submission.id,
              answer_id: answerId,
              is_correct: selectedAnswer?.is_correct || null
            });
        }
      }
      
      toast.success("Answers submitted successfully!");
      // Navigate back to the topics page
      navigate(`/assessment-topics/${topic.assessment_id}`);
    } catch (error) {
      console.error('Error submitting answers:', error);
      toast.error("Failed to submit answers. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <DashboardNav />
      
      <main className="flex-1 overflow-auto p-6">
        <div className="container mx-auto max-w-3xl animate-in">
          <div className="mb-8">
            <h1 className="text-2xl font-semibold tracking-tight">
              {topic ? topic.title : 'Loading Topic...'}
            </h1>
            <p className="text-muted-foreground">
              Answer all questions to complete this topic
            </p>
          </div>
          
          {isLoading ? (
            <div className="flex justify-center p-8">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            </div>
          ) : questions.length === 0 ? (
            <div className="rounded-lg border border-dashed p-8 text-center">
              <p className="text-muted-foreground">No questions found for this topic.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {questions.map((question, index) => (
                <Card key={question.id} className="overflow-hidden">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-medium mb-4">
                      <span className="inline-flex items-center justify-center bg-primary text-primary-foreground rounded-full w-6 h-6 mr-2">
                        {index + 1}
                      </span>
                      {question.question}
                    </h3>
                    
                    {question.type === 'multiple_choice' && (
                      <RadioGroup 
                        value={selectedAnswers[question.id] || ""} 
                        onValueChange={(value) => handleAnswerSelect(question.id, value)}
                        className="space-y-3"
                      >
                        {question.answers.map((answer) => (
                          <div key={answer.id} className="flex items-start space-x-2 p-2 rounded-md hover:bg-muted">
                            <RadioGroupItem value={answer.id} id={answer.id} />
                            <Label htmlFor={answer.id} className="cursor-pointer flex-1">
                              {answer.text}
                            </Label>
                          </div>
                        ))}
                      </RadioGroup>
                    )}
                    
                    {question.type === 'yes_no' && (
                      <RadioGroup 
                        value={selectedAnswers[question.id] || ""} 
                        onValueChange={(value) => handleAnswerSelect(question.id, value)}
                        className="space-y-3"
                      >
                        {question.answers.map((answer) => (
                          <div key={answer.id} className="flex items-start space-x-2 p-2 rounded-md hover:bg-muted">
                            <RadioGroupItem value={answer.id} id={answer.id} />
                            <Label htmlFor={answer.id} className="cursor-pointer flex-1">
                              {answer.text}
                            </Label>
                          </div>
                        ))}
                      </RadioGroup>
                    )}
                    
                    {question.type === 'free_text' && (
                      <Textarea
                        placeholder="Type your answer here..."
                        value={textAnswers[question.id] || ""}
                        onChange={(e) => handleTextAnswerChange(question.id, e.target.value)}
                        className="min-h-[100px]"
                      />
                    )}
                  </CardContent>
                </Card>
              ))}

              <div className="flex justify-end mt-4">
                <Button 
                  variant="outline" 
                  className="mr-2"
                  onClick={() => navigate(`/assessment-topics/${topic?.assessment_id}`)}
                >
                  Back to Topics
                </Button>
                <Button 
                  onClick={handleSubmitAnswers} 
                  disabled={isSubmitting || !submission}
                >
                  {isSubmitting ? "Submitting..." : "Submit Answers"}
                </Button>
              </div>

              {!submission && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 flex items-start mt-4">
                  <AlertCircle className="h-5 w-5 text-yellow-500 mr-2 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-yellow-800">Start Assessment First</h4>
                    <p className="text-yellow-700 text-sm">
                      You need to start the assessment before you can submit answers.
                      Please go back to My Assessments and click the "Start" button.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
