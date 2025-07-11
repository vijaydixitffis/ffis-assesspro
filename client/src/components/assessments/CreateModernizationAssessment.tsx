import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';

const MODERNIZATION_ASSESSMENT_DATA = {
  title: "Application Modernization Assessment",
  description: "A comprehensive assessment to evaluate your application's modernization level across architecture, development practices, scalability, security, user experience, and business agility.",
  topics: [
    {
      title: "Architecture",
      description: "Evaluates the application's architectural patterns and design principles",
      sequence_number: 1,
      questions: [
        "Uses microservices or modular architecture?",
        "Provides API-first or event-driven design (RESTful/GraphQL APIs, WebSockets, event streaming)?",
        "Uses containerization & orchestration (Docker, Kubernetes)?",
        "Is serverless or cloud-native (auto-scaling, managed services, cloud-agnostic)?",
        "Supports edge computing?"
      ]
    },
    {
      title: "Development & Deployment",
      description: "Assesses modern development and deployment practices",
      sequence_number: 2,
      questions: [
        "Implements CI/CD automation?",
        "Uses Infrastructure as Code (IaC)?",
        "Integrates DevSecOps into the lifecycle?"
      ]
    },
    {
      title: "Scalability & Performance",
      description: "Evaluates scalability and performance capabilities",
      sequence_number: 3,
      questions: [
        "Supports elastic scalability?",
        "Uses high availability & fault tolerance strategies?",
        "Uses async processing or event-driven architecture for scalability?"
      ]
    },
    {
      title: "Data & Storage",
      description: "Assesses data management and storage approaches",
      sequence_number: 4,
      questions: [
        "Supports polyglot persistence (multiple database types)?",
        "Uses streaming or real-time data processing technologies?",
        "Ensures data governance & compliance (encryption, privacy, regulations)?"
      ]
    },
    {
      title: "Security & Compliance",
      description: "Evaluates security measures and compliance standards",
      sequence_number: 5,
      questions: [
        "Implements zero trust architecture (strong authentication, least privilege)?",
        "Encrypts data end-to-end (at rest and in transit)?",
        "Uses modern API security standards (OAuth2, OpenID Connect, JWT, API gateways)?",
        "Integrates automated security testing into CI/CD pipelines?"
      ]
    },
    {
      title: "User Experience (UX)",
      description: "Assesses modern user experience and interface design",
      sequence_number: 6,
      questions: [
        "Uses responsive & progressive UI (modern frameworks)?",
        "Is mobile-first & cross-platform (PWA, responsive web, mobile apps)?",
        "Optimized for low latency & high performance (CDN, caching, efficient rendering)?"
      ]
    },
    {
      title: "Observability & Monitoring",
      description: "Evaluates monitoring, logging, and observability practices",
      sequence_number: 7,
      questions: [
        "Uses centralized logging & monitoring (ELK, Prometheus, Grafana, OpenTelemetry)?",
        "Has automated incident response (AIOps, alerting, self-healing)?",
        "Tracks business & technical metrics (performance, SLAs, user behavior)?"
      ]
    },
    {
      title: "Technical Debt Management",
      description: "Assesses technical debt management and code quality",
      sequence_number: 8,
      questions: [
        "Minimizes reliance on legacy code and outdated technologies?",
        "Codebase is maintainable and clean (SOLID, DDD, separation of concerns)?",
        "Performs automated refactoring & code quality checks regularly?"
      ]
    },
    {
      title: "Backward Compatibility & Lifecycle",
      description: "Evaluates lifecycle management and compatibility practices",
      sequence_number: 9,
      questions: [
        "New updates are backward compatible and do not break integrations?",
        "Tech stack lifecycle is managed (dependencies/frameworks upgraded regularly)?"
      ]
    },
    {
      title: "Business Agility",
      description: "Assesses business agility and adaptability capabilities",
      sequence_number: 10,
      questions: [
        "Fast time-to-market (DevOps, CI/CD, modular architecture)?",
        "Low change failure rate (frequent, stable releases, DORA metrics)?",
        "Uses data-driven decision-making (real-time analytics, A/B testing, AI insights)?",
        "Application is API and ecosystem ready (easy integration with third-party services)?",
        "Business capabilities are composable & reusable (APIs, microservices)?"
      ]
    }
  ]
};

export function CreateModernizationAssessment() {
  const [isCreating, setIsCreating] = useState(false);
  const { user } = useAuth();

  const createYesNoAnswersForQuestion = (questionId: string) => {
    return [
      {
        question_id: questionId,
        text: "Yes",
        is_correct: null,
        marks: "1"
      },
      {
        question_id: questionId,
        text: "No",
        is_correct: null,
        marks: "0"
      }
    ];
  };

  const handleCreateAssessment = async () => {
    if (!user) {
      toast.error('User not authenticated');
      return;
    }

    setIsCreating(true);
    
    try {
      // Step 1: Create the assessment
      const { data: assessment, error: assessmentError } = await supabase
        .from('assessments')
        .insert({
          title: MODERNIZATION_ASSESSMENT_DATA.title,
          description: MODERNIZATION_ASSESSMENT_DATA.description,
          is_active: true,
          created_by: user.id
        })
        .select()
        .single();

      if (assessmentError) {
        console.error('Error creating assessment:', assessmentError);
        toast.error('Failed to create assessment');
        return;
      }

      toast.success('Assessment created successfully!');

      // Step 2: Create topics and questions
      for (const topicData of MODERNIZATION_ASSESSMENT_DATA.topics) {
        // Create topic
        const { data: topic, error: topicError } = await supabase
          .from('topics')
          .insert({
            title: topicData.title,
            description: topicData.description,
            assessment_id: assessment.id,
            sequence_number: topicData.sequence_number,
            is_active: true,
            created_by: user.id
          })
          .select()
          .single();

        if (topicError) {
          console.error('Error creating topic:', topicError);
          toast.error(`Failed to create topic: ${topicData.title}`);
          continue;
        }

        // Create questions for this topic
        for (let i = 0; i < topicData.questions.length; i++) {
          const questionText = topicData.questions[i];
          
          const { data: question, error: questionError } = await supabase
            .from('questions')
            .insert({
              question: questionText,
              type: 'yes_no',
              topic_id: topic.id,
              sequence_number: i + 1,
              is_active: true,
              created_by: user.id
            })
            .select()
            .single();

          if (questionError) {
            console.error('Error creating question:', questionError);
            toast.error(`Failed to create question in ${topicData.title}`);
            continue;
          }

          // Create Yes/No answers for this question
          const answers = createYesNoAnswersForQuestion(question.id);
          
          const { error: answersError } = await supabase
            .from('answers')
            .insert(answers);

          if (answersError) {
            console.error('Error creating answers:', answersError);
            toast.error(`Failed to create answers for question`);
            continue;
          }
        }
      }

      toast.success('Application Modernization Assessment created successfully with all topics and questions!');
      
    } catch (error) {
      console.error('Error in createModernizationAssessment:', error);
      toast.error('Failed to create Application Modernization Assessment');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="p-6 border rounded-lg bg-card">
      <h3 className="text-lg font-semibold mb-4">Create Application Modernization Assessment</h3>
      <p className="text-sm text-muted-foreground mb-4">
        This will create a comprehensive application modernization assessment with 10 topics and 34 questions, 
        each with Yes/No answers to evaluate your application's modernization level.
      </p>
      
      <div className="space-y-2 mb-4">
        <p className="text-sm font-medium">Topics to be created:</p>
        <ul className="text-sm text-muted-foreground space-y-1">
          {MODERNIZATION_ASSESSMENT_DATA.topics.map((topic, index) => (
            <li key={index} className="flex items-center">
              <span className="w-8 text-center">{topic.sequence_number}.</span>
              <span>{topic.title} ({topic.questions.length} questions)</span>
            </li>
          ))}
        </ul>
      </div>
      
      <Button 
        onClick={handleCreateAssessment}
        disabled={isCreating}
        className="w-full"
      >
        {isCreating ? 'Creating Assessment...' : 'Create Application Modernization Assessment'}
      </Button>
    </div>
  );
}