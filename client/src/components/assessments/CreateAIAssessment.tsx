import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';

const AI_READINESS_DATA = {
  title: "AI Readiness Assessment",
  description: "A comprehensive assessment to evaluate your organization's readiness for AI adoption across key dimensions including strategy, technology, data, operations, talent, finance, governance, and department-specific factors.",
  topics: [
    {
      title: "Business Strategy and Objectives",
      description: "Evaluates organizational alignment, leadership support, and strategic planning for AI initiatives",
      sequence_number: 1,
      questions: [
        "Our organization has clearly defined AI objectives aligned with business goals.",
        "Executive leadership actively supports and sponsors AI initiatives.",
        "We have identified and prioritized AI use cases across business units.",
        "Success metrics for AI projects are well-defined and measurable.",
        "There is a clear roadmap for AI adoption and scaling."
      ]
    },
    {
      title: "Technological Infrastructure",
      description: "Assesses the technical foundation and infrastructure readiness to support AI workloads",
      sequence_number: 2,
      questions: [
        "Our IT infrastructure can support AI workloads (e.g., GPUs, scalable storage).",
        "We have reliable cloud or on-premises resources for AI development.",
        "Integration between existing systems and new AI applications is seamless.",
        "We use modern tools for deploying and managing AI models.",
        "Our technology stack can scale with increased AI adoption."
      ]
    },
    {
      title: "Data Infrastructure and Quality",
      description: "Evaluates data readiness, quality, governance, and infrastructure for AI applications",
      sequence_number: 3,
      questions: [
        "We have a comprehensive inventory of all data sources.",
        "Data required for AI is easily accessible to relevant teams.",
        "Our data is accurate, complete, and up to date.",
        "Data governance policies (access, privacy, retention) are well established.",
        "Data pipelines are automated and robust for AI needs.",
        "Data labeling and preparation processes are mature.",
        "We regularly monitor and improve data quality.",
        "There are clear data ownership and stewardship roles.",
        "Our data infrastructure supports real-time and batch processing.",
        "Data security and compliance requirements are consistently met."
      ]
    },
    {
      title: "Operations and Process Efficiency",
      description: "Assesses operational readiness, process automation opportunities, and deployment workflows",
      sequence_number: 4,
      questions: [
        "Key business processes are mapped and documented.",
        "We have identified opportunities to automate repetitive tasks with AI.",
        "Operational workflows support rapid experimentation and deployment.",
        "Incident response plans exist for AI system failures.",
        "There is a feedback loop from operations to improve AI models."
      ]
    },
    {
      title: "Talent and Skills",
      description: "Evaluates human resources, skills availability, and organizational readiness for AI adoption",
      sequence_number: 5,
      questions: [
        "We have sufficient in-house AI and data science expertise.",
        "Training programs exist to upskill employees in AI-related areas.",
        "Our hiring strategy addresses gaps in AI talent.",
        "Employees are receptive to AI-driven change.",
        "Cross-functional teams collaborate effectively on AI projects."
      ]
    },
    {
      title: "Financial Preparedness and ROI",
      description: "Assesses financial readiness, budgeting, and return on investment tracking for AI initiatives",
      sequence_number: 6,
      questions: [
        "Budgets for AI projects are clearly allocated and managed.",
        "We have a cost model for AI initiatives (hardware, software, talent).",
        "ROI metrics are tracked for AI investments.",
        "Financial controls are in place for AI-related spending.",
        "There is a process to reassess AI investments based on results."
      ]
    },
    {
      title: "Governance, Compliance, and Ethics",
      description: "Evaluates governance structures, compliance measures, and ethical considerations for AI deployment",
      sequence_number: 7,
      questions: [
        "Data privacy and security policies are enforced for AI projects.",
        "AI ethics guidelines (fairness, transparency) are documented and followed.",
        "Regulatory compliance for AI systems is regularly reviewed.",
        "There is a governance board overseeing AI initiatives.",
        "Regular audits are conducted on AI models and data usage."
      ]
    },
    {
      title: "Department-Specific Readiness",
      description: "Assesses department-level readiness and integration capabilities for AI adoption",
      sequence_number: 8,
      questions: [
        "AI opportunities in core business processes are well understood.",
        "Department heads actively champion AI adoption in their areas.",
        "There is alignment between IT and business units on AI priorities.",
        "Success stories and use cases are shared across departments.",
        "Change management processes support AI integration."
      ]
    }
  ]
};

export function CreateAIAssessment() {
  const [isCreating, setIsCreating] = useState(false);
  const { user } = useAuth();

  const createAnswersForQuestion = (questionId: string) => {
    return [
      {
        question_id: questionId,
        text: "1 - Strongly Disagree",
        is_correct: null,
        marks: "1"
      },
      {
        question_id: questionId,
        text: "2 - Disagree",
        is_correct: null,
        marks: "2"
      },
      {
        question_id: questionId,
        text: "3 - Neutral",
        is_correct: null,
        marks: "3"
      },
      {
        question_id: questionId,
        text: "4 - Agree",
        is_correct: null,
        marks: "4"
      },
      {
        question_id: questionId,
        text: "5 - Strongly Agree",
        is_correct: null,
        marks: "5"
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
          title: AI_READINESS_DATA.title,
          description: AI_READINESS_DATA.description,
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
      for (const topicData of AI_READINESS_DATA.topics) {
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
              type: 'multiple_choice',
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

          // Create 5-point scale answers for this question
          const answers = createAnswersForQuestion(question.id);
          
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

      toast.success('AI Readiness Assessment created successfully with all topics and questions!');
      
    } catch (error) {
      console.error('Error in createAIReadinessAssessment:', error);
      toast.error('Failed to create AI Readiness Assessment');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="p-6 border rounded-lg bg-card">
      <h3 className="text-lg font-semibold mb-4">Create AI Readiness Assessment</h3>
      <p className="text-sm text-muted-foreground mb-4">
        This will create a comprehensive AI readiness assessment with 8 topics and 45 questions, 
        each with a 5-point rating scale (1-5).
      </p>
      
      <div className="space-y-2 mb-4">
        <p className="text-sm font-medium">Topics to be created:</p>
        <ul className="text-sm text-muted-foreground space-y-1">
          {AI_READINESS_DATA.topics.map((topic, index) => (
            <li key={index} className="flex items-center">
              <span className="w-6 text-center">{topic.sequence_number}.</span>
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
        {isCreating ? 'Creating Assessment...' : 'Create AI Readiness Assessment'}
      </Button>
    </div>
  );
}