
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/auth";
import { DashboardNav } from "@/components/DashboardNav";
import { Button } from "@/components/ui/button";
import { QuestionCard } from "@/components/questions/QuestionCard";
import { NoSubmissionWarning } from "@/components/questions/NoSubmissionWarning";
import { useTopicQuestions } from "@/hooks/useTopicQuestions";
import { useTopicSubmission } from "@/hooks/useTopicSubmission";

export default function TopicQuestionsPage() {
  const { topicId } = useParams<{ topicId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedAnswers, setSelectedAnswers] = useState<{ [key: string]: string }>({});
  const [textAnswers, setTextAnswers] = useState<{ [key: string]: string }>({});
  
  const { questions, topic, isLoading, submission } = useTopicQuestions(topicId, user?.id);
  const { isSubmitting, submitAnswers } = useTopicSubmission();

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
    await submitAnswers(questions, selectedAnswers, textAnswers, submission, topic);
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
                <QuestionCard
                  key={question.id}
                  question={question}
                  index={index}
                  selectedAnswers={selectedAnswers}
                  textAnswers={textAnswers}
                  onAnswerSelect={handleAnswerSelect}
                  onTextAnswerChange={handleTextAnswerChange}
                />
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

              {!submission && <NoSubmissionWarning />}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
