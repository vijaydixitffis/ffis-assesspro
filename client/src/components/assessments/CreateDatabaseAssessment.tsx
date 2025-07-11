import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';
import { Loader2 } from 'lucide-react';

const assessmentData = {
  assessment: {
    title: "Database Architecture Assessment",
    description: "A comprehensive 30-question assessment designed for Database Owners to evaluate their database environment across critical categories: infrastructure, compute capacity, data architecture principles, security, data lifecycle, data quality, and data governance."
  },
  topics: [
    {
      title: "Infrastructure",
      description: "Database platform, hosting environment, scalability, and disaster recovery capabilities",
      sequence_number: 1,
      questions: [
        {
          question: "Which primary database platform do you use?",
          sequence_number: 1,
          answers: [
            { text: "Oracle", marks: "1" },
            { text: "MS SQL Server", marks: "2" },
            { text: "PostgreSQL", marks: "3" },
            { text: "MySQL", marks: "4" },
            { text: "Other", marks: "5" }
          ]
        },
        {
          question: "The database infrastructure is hosted on:",
          sequence_number: 2,
          answers: [
            { text: "On-premises only", marks: "1" },
            { text: "Private cloud", marks: "2" },
            { text: "Public cloud", marks: "3" },
            { text: "Hybrid", marks: "4" },
            { text: "Multi-cloud", marks: "5" }
          ]
        },
        {
          question: "How would you rate the scalability of your current database infrastructure?",
          sequence_number: 3,
          answers: [
            { text: "Very poor", marks: "1" },
            { text: "Poor", marks: "2" },
            { text: "Fair", marks: "3" },
            { text: "Good", marks: "4" },
            { text: "Excellent", marks: "5" }
          ]
        },
        {
          question: "How often is your database infrastructure reviewed for modernization?",
          sequence_number: 4,
          answers: [
            { text: "Never", marks: "1" },
            { text: "Every 3+ years", marks: "2" },
            { text: "Every 2–3 years", marks: "3" },
            { text: "Annually", marks: "4" },
            { text: "Semi-annually or more", marks: "5" }
          ]
        },
        {
          question: "The database supports high availability and disaster recovery:",
          sequence_number: 5,
          answers: [
            { text: "Strongly disagree", marks: "1" },
            { text: "Disagree", marks: "2" },
            { text: "Neutral", marks: "3" },
            { text: "Agree", marks: "4" },
            { text: "Strongly agree", marks: "5" }
          ]
        }
      ]
    },
    {
      title: "Compute Capacity",
      description: "CPU, RAM resources, performance management, scaling capabilities, and monitoring",
      sequence_number: 2,
      questions: [
        {
          question: "The current compute resources (CPU, RAM) meet performance needs:",
          sequence_number: 6,
          answers: [
            { text: "Strongly disagree", marks: "1" },
            { text: "Disagree", marks: "2" },
            { text: "Neutral", marks: "3" },
            { text: "Agree", marks: "4" },
            { text: "Strongly agree", marks: "5" }
          ]
        },
        {
          question: "How is compute scaling managed?",
          sequence_number: 7,
          answers: [
            { text: "Manual only", marks: "1" },
            { text: "Scheduled", marks: "2" },
            { text: "Automated", marks: "3" },
            { text: "Both scheduled and automated", marks: "4" },
            { text: "Dynamic/autoscaling with monitoring", marks: "5" }
          ]
        },
        {
          question: "How frequently are performance bottlenecks encountered?",
          sequence_number: 8,
          answers: [
            { text: "Daily", marks: "1" },
            { text: "Weekly", marks: "2" },
            { text: "Monthly", marks: "3" },
            { text: "Rarely", marks: "4" },
            { text: "Never", marks: "5" }
          ]
        },
        {
          question: "Compute resource utilization is monitored in real-time:",
          sequence_number: 9,
          answers: [
            { text: "Strongly disagree", marks: "1" },
            { text: "Disagree", marks: "2" },
            { text: "Neutral", marks: "3" },
            { text: "Agree", marks: "4" },
            { text: "Strongly agree", marks: "5" }
          ]
        },
        {
          question: "The database supports elastic scaling:",
          sequence_number: 10,
          answers: [
            { text: "Strongly disagree", marks: "1" },
            { text: "Disagree", marks: "2" },
            { text: "Neutral", marks: "3" },
            { text: "Agree", marks: "4" },
            { text: "Strongly agree", marks: "5" }
          ]
        }
      ]
    },
    {
      title: "Data Architecture Principles & Best Practices",
      description: "Database design, normalization, documentation, standards, and workload support",
      sequence_number: 3,
      questions: [
        {
          question: "The database design follows normalization principles:",
          sequence_number: 11,
          answers: [
            { text: "Strongly disagree", marks: "1" },
            { text: "Disagree", marks: "2" },
            { text: "Neutral", marks: "3" },
            { text: "Agree", marks: "4" },
            { text: "Strongly agree", marks: "5" }
          ]
        },
        {
          question: "Data models are documented and maintained:",
          sequence_number: 12,
          answers: [
            { text: "Strongly disagree", marks: "1" },
            { text: "Disagree", marks: "2" },
            { text: "Neutral", marks: "3" },
            { text: "Agree", marks: "4" },
            { text: "Strongly agree", marks: "5" }
          ]
        },
        {
          question: "Naming conventions and standards are consistently applied:",
          sequence_number: 13,
          answers: [
            { text: "Strongly disagree", marks: "1" },
            { text: "Disagree", marks: "2" },
            { text: "Neutral", marks: "3" },
            { text: "Agree", marks: "4" },
            { text: "Strongly agree", marks: "5" }
          ]
        },
        {
          question: "The database supports both OLTP and OLAP workloads:",
          sequence_number: 14,
          answers: [
            { text: "Strongly disagree", marks: "1" },
            { text: "Disagree", marks: "2" },
            { text: "Neutral", marks: "3" },
            { text: "Agree", marks: "4" },
            { text: "Strongly agree", marks: "5" }
          ]
        },
        {
          question: "How often are schema changes reviewed and approved?",
          sequence_number: 15,
          answers: [
            { text: "Never", marks: "1" },
            { text: "Annually", marks: "2" },
            { text: "Quarterly", marks: "3" },
            { text: "Monthly", marks: "4" },
            { text: "Every change", marks: "5" }
          ]
        }
      ]
    },
    {
      title: "Security",
      description: "Data encryption, access control, audit logs, security patches, and data masking",
      sequence_number: 4,
      questions: [
        {
          question: "Data encryption is implemented at rest and in transit:",
          sequence_number: 16,
          answers: [
            { text: "Strongly disagree", marks: "1" },
            { text: "Disagree", marks: "2" },
            { text: "Neutral", marks: "3" },
            { text: "Agree", marks: "4" },
            { text: "Strongly agree", marks: "5" }
          ]
        },
        {
          question: "Role-based access control (RBAC) is enforced:",
          sequence_number: 17,
          answers: [
            { text: "Strongly disagree", marks: "1" },
            { text: "Disagree", marks: "2" },
            { text: "Neutral", marks: "3" },
            { text: "Agree", marks: "4" },
            { text: "Strongly agree", marks: "5" }
          ]
        },
        {
          question: "Database audit logs are enabled and reviewed:",
          sequence_number: 18,
          answers: [
            { text: "Strongly disagree", marks: "1" },
            { text: "Disagree", marks: "2" },
            { text: "Neutral", marks: "3" },
            { text: "Agree", marks: "4" },
            { text: "Strongly agree", marks: "5" }
          ]
        },
        {
          question: "How often are security patches applied?",
          sequence_number: 19,
          answers: [
            { text: "Rarely/never", marks: "1" },
            { text: "Annually", marks: "2" },
            { text: "Quarterly", marks: "3" },
            { text: "Monthly", marks: "4" },
            { text: "As soon as released", marks: "5" }
          ]
        },
        {
          question: "Sensitive data is masked or tokenized:",
          sequence_number: 20,
          answers: [
            { text: "Strongly disagree", marks: "1" },
            { text: "Disagree", marks: "2" },
            { text: "Neutral", marks: "3" },
            { text: "Agree", marks: "4" },
            { text: "Strongly agree", marks: "5" }
          ]
        }
      ]
    },
    {
      title: "Data Lifecycle",
      description: "Data retention, archiving, purging, backups, and change tracking",
      sequence_number: 5,
      questions: [
        {
          question: "Data retention policies are defined and enforced:",
          sequence_number: 21,
          answers: [
            { text: "Strongly disagree", marks: "1" },
            { text: "Disagree", marks: "2" },
            { text: "Neutral", marks: "3" },
            { text: "Agree", marks: "4" },
            { text: "Strongly agree", marks: "5" }
          ]
        },
        {
          question: "Data archiving is automated:",
          sequence_number: 22,
          answers: [
            { text: "Strongly disagree", marks: "1" },
            { text: "Disagree", marks: "2" },
            { text: "Neutral", marks: "3" },
            { text: "Agree", marks: "4" },
            { text: "Strongly agree", marks: "5" }
          ]
        },
        {
          question: "How often is obsolete data purged?",
          sequence_number: 23,
          answers: [
            { text: "Never", marks: "1" },
            { text: "Annually", marks: "2" },
            { text: "Quarterly", marks: "3" },
            { text: "Monthly", marks: "4" },
            { text: "As per policy", marks: "5" }
          ]
        },
        {
          question: "Backups are taken and tested regularly:",
          sequence_number: 24,
          answers: [
            { text: "Strongly disagree", marks: "1" },
            { text: "Disagree", marks: "2" },
            { text: "Neutral", marks: "3" },
            { text: "Agree", marks: "4" },
            { text: "Strongly agree", marks: "5" }
          ]
        },
        {
          question: "The database supports data versioning and change tracking:",
          sequence_number: 25,
          answers: [
            { text: "Strongly disagree", marks: "1" },
            { text: "Disagree", marks: "2" },
            { text: "Neutral", marks: "3" },
            { text: "Agree", marks: "4" },
            { text: "Strongly agree", marks: "5" }
          ]
        }
      ]
    },
    {
      title: "Data Quality",
      description: "Data validation, duplicate resolution, and quality metrics tracking",
      sequence_number: 6,
      questions: [
        {
          question: "Data validation rules are enforced at the database level:",
          sequence_number: 26,
          answers: [
            { text: "Strongly disagree", marks: "1" },
            { text: "Disagree", marks: "2" },
            { text: "Neutral", marks: "3" },
            { text: "Agree", marks: "4" },
            { text: "Strongly agree", marks: "5" }
          ]
        },
        {
          question: "Duplicate data is systematically identified and resolved:",
          sequence_number: 27,
          answers: [
            { text: "Strongly disagree", marks: "1" },
            { text: "Disagree", marks: "2" },
            { text: "Neutral", marks: "3" },
            { text: "Agree", marks: "4" },
            { text: "Strongly agree", marks: "5" }
          ]
        },
        {
          question: "Data quality metrics (accuracy, completeness, consistency) are tracked:",
          sequence_number: 28,
          answers: [
            { text: "Strongly disagree", marks: "1" },
            { text: "Disagree", marks: "2" },
            { text: "Neutral", marks: "3" },
            { text: "Agree", marks: "4" },
            { text: "Strongly agree", marks: "5" }
          ]
        }
      ]
    },
    {
      title: "Data Governance",
      description: "Governance framework and data ownership/stewardship roles",
      sequence_number: 7,
      questions: [
        {
          question: "There is a documented data governance framework in place:",
          sequence_number: 29,
          answers: [
            { text: "Strongly disagree", marks: "1" },
            { text: "Disagree", marks: "2" },
            { text: "Neutral", marks: "3" },
            { text: "Agree", marks: "4" },
            { text: "Strongly agree", marks: "5" }
          ]
        },
        {
          question: "Data ownership and stewardship roles are clearly defined:",
          sequence_number: 30,
          answers: [
            { text: "Strongly disagree", marks: "1" },
            { text: "Disagree", marks: "2" },
            { text: "Neutral", marks: "3" },
            { text: "Agree", marks: "4" },
            { text: "Strongly agree", marks: "5" }
          ]
        }
      ]
    }
  ]
};

export function CreateDatabaseAssessment() {
  const [isCreating, setIsCreating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState('');
  const { user } = useAuth();

  const createAssessment = async () => {
    if (!user) {
      toast.error('You must be logged in to create an assessment');
      return;
    }

    setIsCreating(true);
    setProgress(0);
    setCurrentStep('Creating assessment...');

    try {
      // Step 1: Create the main assessment
      const { data: assessment, error: assessmentError } = await supabase
        .from('assessments')
        .insert([
          {
            title: assessmentData.assessment.title,
            description: assessmentData.assessment.description,
            is_active: true,
            created_by: user.id
          }
        ])
        .select()
        .single();

      if (assessmentError) {
        throw assessmentError;
      }

      setProgress(10);
      setCurrentStep('Assessment created successfully');

      // Step 2: Create topics
      setCurrentStep('Creating topics...');
      const { data: createdTopics, error: topicsError } = await supabase
        .from('topics')
        .insert(
          assessmentData.topics.map(topic => ({
            title: topic.title,
            description: topic.description,
            sequence_number: topic.sequence_number,
            assessment_id: assessment.id,
            is_active: true,
            created_by: user.id
          }))
        )
        .select();

      if (topicsError) {
        throw topicsError;
      }

      setProgress(30);
      setCurrentStep(`${createdTopics.length} topics created`);

      // Step 3: Create questions and answers
      setCurrentStep('Creating questions and answers...');
      let questionsCreated = 0;
      let answersCreated = 0;

      for (const topicData of assessmentData.topics) {
        const topic = createdTopics.find(t => t.title === topicData.title);
        if (!topic) continue;

        for (const questionData of topicData.questions) {
          // Create question
          const { data: question, error: questionError } = await supabase
            .from('questions')
            .insert([
              {
                question: questionData.question,
                type: 'multiple_choice',
                sequence_number: questionData.sequence_number,
                topic_id: topic.id,
                is_active: true,
                created_by: user.id
              }
            ])
            .select()
            .single();

          if (questionError) {
            throw questionError;
          }

          questionsCreated++;

          // Create answers
          const { error: answersError } = await supabase
            .from('answers')
            .insert(
              questionData.answers.map(answer => ({
                text: answer.text,
                is_correct: null,
                marks: answer.marks,
                question_id: question.id,
                comment: null
              }))
            );

          if (answersError) {
            throw answersError;
          }

          answersCreated += questionData.answers.length;

          // Update progress
          const progressValue = 30 + (questionsCreated / 30) * 60;
          setProgress(progressValue);
          setCurrentStep(`Created ${questionsCreated}/30 questions`);
        }
      }

      setProgress(100);
      setCurrentStep('Assessment created successfully!');

      toast.success(`Database Architecture Assessment created successfully! 
        • Assessment: ${assessment.title}
        • Topics: ${createdTopics.length}
        • Questions: ${questionsCreated}
        • Answer Options: ${answersCreated}`);

    } catch (error) {
      console.error('Error creating assessment:', error);
      toast.error('Failed to create assessment: ' + (error.message || 'Unknown error'));
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Create Database Architecture Assessment</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
              Assessment Overview
            </h3>
            <p className="text-sm text-blue-800 dark:text-blue-200 mb-3">
              This will create a comprehensive 30-question assessment covering:
            </p>
            <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
              <li>• Infrastructure (5 questions)</li>
              <li>• Compute Capacity (5 questions)</li>
              <li>• Data Architecture Principles & Best Practices (5 questions)</li>
              <li>• Security (5 questions)</li>
              <li>• Data Lifecycle (5 questions)</li>
              <li>• Data Quality (3 questions)</li>
              <li>• Data Governance (2 questions)</li>
            </ul>
          </div>

          {isCreating && (
            <div className="space-y-3">
              <div className="text-sm font-medium">{currentStep}</div>
              <Progress value={progress} className="w-full" />
              <div className="text-xs text-gray-600 dark:text-gray-400">
                {progress.toFixed(0)}% complete
              </div>
            </div>
          )}

          <Button 
            onClick={createAssessment} 
            disabled={isCreating}
            className="w-full"
          >
            {isCreating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating Assessment...
              </>
            ) : (
              'Create Database Architecture Assessment'
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}