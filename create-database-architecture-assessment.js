/**
 * Script to create Database Architecture Assessment with all topics and questions
 * Based on the uploaded assessment file
 */

import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client using environment variables
const supabaseUrl = "https://tzdlzlqowxhosudqyuho.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR6ZGx6bHFvd3hob3N1ZHF5dWhvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA3Mjg0MDcsImV4cCI6MjA1NjMwNDQwN30.W4dtmF8xR6wD2KI3YrDNsu_orVUMiIJFL1wo4JSSV0k";

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function createDatabaseArchitectureAssessment() {
  try {
    console.log('Creating Database Architecture Assessment...');

    // 1. Create the main assessment
    const { data: assessment, error: assessmentError } = await supabase
      .from('assessments')
      .insert([
        {
          title: 'Database Architecture Assessment',
          description: 'A comprehensive 30-question assessment designed for Database Owners to evaluate their database environment across critical categories: infrastructure, compute capacity, data architecture principles, security, data lifecycle, data quality, and data governance.',
          is_active: true,
          created_by: '00000000-0000-0000-0000-000000000000' // System user
        }
      ])
      .select()
      .single();

    if (assessmentError) {
      console.error('Error creating assessment:', assessmentError);
      return;
    }

    console.log('✓ Assessment created:', assessment.title);

    // 2. Create topics (sections)
    const topics = [
      {
        title: 'Infrastructure',
        description: 'Database platform, hosting environment, scalability, and disaster recovery capabilities',
        sequence_number: 1
      },
      {
        title: 'Compute Capacity',
        description: 'CPU, RAM resources, performance management, scaling capabilities, and monitoring',
        sequence_number: 2
      },
      {
        title: 'Data Architecture Principles & Best Practices',
        description: 'Database design, normalization, documentation, standards, and workload support',
        sequence_number: 3
      },
      {
        title: 'Security',
        description: 'Data encryption, access control, audit logs, security patches, and data masking',
        sequence_number: 4
      },
      {
        title: 'Data Lifecycle',
        description: 'Data retention, archiving, purging, backups, and change tracking',
        sequence_number: 5
      },
      {
        title: 'Data Quality',
        description: 'Data validation, duplicate resolution, and quality metrics tracking',
        sequence_number: 6
      },
      {
        title: 'Data Governance',
        description: 'Governance framework and data ownership/stewardship roles',
        sequence_number: 7
      }
    ];

    const { data: createdTopics, error: topicsError } = await supabase
      .from('topics')
      .insert(
        topics.map(topic => ({
          ...topic,
          assessment_id: assessment.id,
          is_active: true,
          created_by: '00000000-0000-0000-0000-000000000000'
        }))
      )
      .select();

    if (topicsError) {
      console.error('Error creating topics:', topicsError);
      return;
    }

    console.log('✓ Topics created:', createdTopics.length);

    // 3. Create questions with answers
    const questionsData = [
      // Infrastructure (Topic 1)
      {
        question: 'Which primary database platform do you use?',
        type: 'multiple_choice',
        sequence_number: 1,
        topic_title: 'Infrastructure',
        answers: [
          { text: 'Oracle', is_correct: null, marks: '1' },
          { text: 'MS SQL Server', is_correct: null, marks: '2' },
          { text: 'PostgreSQL', is_correct: null, marks: '3' },
          { text: 'MySQL', is_correct: null, marks: '4' },
          { text: 'Other', is_correct: null, marks: '5' }
        ]
      },
      {
        question: 'The database infrastructure is hosted on:',
        type: 'multiple_choice',
        sequence_number: 2,
        topic_title: 'Infrastructure',
        answers: [
          { text: 'On-premises only', is_correct: null, marks: '1' },
          { text: 'Private cloud', is_correct: null, marks: '2' },
          { text: 'Public cloud', is_correct: null, marks: '3' },
          { text: 'Hybrid', is_correct: null, marks: '4' },
          { text: 'Multi-cloud', is_correct: null, marks: '5' }
        ]
      },
      {
        question: 'How would you rate the scalability of your current database infrastructure?',
        type: 'multiple_choice',
        sequence_number: 3,
        topic_title: 'Infrastructure',
        answers: [
          { text: 'Very poor', is_correct: null, marks: '1' },
          { text: 'Poor', is_correct: null, marks: '2' },
          { text: 'Fair', is_correct: null, marks: '3' },
          { text: 'Good', is_correct: null, marks: '4' },
          { text: 'Excellent', is_correct: null, marks: '5' }
        ]
      },
      {
        question: 'How often is your database infrastructure reviewed for modernization?',
        type: 'multiple_choice',
        sequence_number: 4,
        topic_title: 'Infrastructure',
        answers: [
          { text: 'Never', is_correct: null, marks: '1' },
          { text: 'Every 3+ years', is_correct: null, marks: '2' },
          { text: 'Every 2–3 years', is_correct: null, marks: '3' },
          { text: 'Annually', is_correct: null, marks: '4' },
          { text: 'Semi-annually or more', is_correct: null, marks: '5' }
        ]
      },
      {
        question: 'The database supports high availability and disaster recovery:',
        type: 'multiple_choice',
        sequence_number: 5,
        topic_title: 'Infrastructure',
        answers: [
          { text: 'Strongly disagree', is_correct: null, marks: '1' },
          { text: 'Disagree', is_correct: null, marks: '2' },
          { text: 'Neutral', is_correct: null, marks: '3' },
          { text: 'Agree', is_correct: null, marks: '4' },
          { text: 'Strongly agree', is_correct: null, marks: '5' }
        ]
      },
      // Compute Capacity (Topic 2)
      {
        question: 'The current compute resources (CPU, RAM) meet performance needs:',
        type: 'multiple_choice',
        sequence_number: 6,
        topic_title: 'Compute Capacity',
        answers: [
          { text: 'Strongly disagree', is_correct: null, marks: '1' },
          { text: 'Disagree', is_correct: null, marks: '2' },
          { text: 'Neutral', is_correct: null, marks: '3' },
          { text: 'Agree', is_correct: null, marks: '4' },
          { text: 'Strongly agree', is_correct: null, marks: '5' }
        ]
      },
      {
        question: 'How is compute scaling managed?',
        type: 'multiple_choice',
        sequence_number: 7,
        topic_title: 'Compute Capacity',
        answers: [
          { text: 'Manual only', is_correct: null, marks: '1' },
          { text: 'Scheduled', is_correct: null, marks: '2' },
          { text: 'Automated', is_correct: null, marks: '3' },
          { text: 'Both scheduled and automated', is_correct: null, marks: '4' },
          { text: 'Dynamic/autoscaling with monitoring', is_correct: null, marks: '5' }
        ]
      },
      {
        question: 'How frequently are performance bottlenecks encountered?',
        type: 'multiple_choice',
        sequence_number: 8,
        topic_title: 'Compute Capacity',
        answers: [
          { text: 'Daily', is_correct: null, marks: '1' },
          { text: 'Weekly', is_correct: null, marks: '2' },
          { text: 'Monthly', is_correct: null, marks: '3' },
          { text: 'Rarely', is_correct: null, marks: '4' },
          { text: 'Never', is_correct: null, marks: '5' }
        ]
      },
      {
        question: 'Compute resource utilization is monitored in real-time:',
        type: 'multiple_choice',
        sequence_number: 9,
        topic_title: 'Compute Capacity',
        answers: [
          { text: 'Strongly disagree', is_correct: null, marks: '1' },
          { text: 'Disagree', is_correct: null, marks: '2' },
          { text: 'Neutral', is_correct: null, marks: '3' },
          { text: 'Agree', is_correct: null, marks: '4' },
          { text: 'Strongly agree', is_correct: null, marks: '5' }
        ]
      },
      {
        question: 'The database supports elastic scaling:',
        type: 'multiple_choice',
        sequence_number: 10,
        topic_title: 'Compute Capacity',
        answers: [
          { text: 'Strongly disagree', is_correct: null, marks: '1' },
          { text: 'Disagree', is_correct: null, marks: '2' },
          { text: 'Neutral', is_correct: null, marks: '3' },
          { text: 'Agree', is_correct: null, marks: '4' },
          { text: 'Strongly agree', is_correct: null, marks: '5' }
        ]
      },
      // Data Architecture Principles & Best Practices (Topic 3)
      {
        question: 'The database design follows normalization principles:',
        type: 'multiple_choice',
        sequence_number: 11,
        topic_title: 'Data Architecture Principles & Best Practices',
        answers: [
          { text: 'Strongly disagree', is_correct: null, marks: '1' },
          { text: 'Disagree', is_correct: null, marks: '2' },
          { text: 'Neutral', is_correct: null, marks: '3' },
          { text: 'Agree', is_correct: null, marks: '4' },
          { text: 'Strongly agree', is_correct: null, marks: '5' }
        ]
      },
      {
        question: 'Data models are documented and maintained:',
        type: 'multiple_choice',
        sequence_number: 12,
        topic_title: 'Data Architecture Principles & Best Practices',
        answers: [
          { text: 'Strongly disagree', is_correct: null, marks: '1' },
          { text: 'Disagree', is_correct: null, marks: '2' },
          { text: 'Neutral', is_correct: null, marks: '3' },
          { text: 'Agree', is_correct: null, marks: '4' },
          { text: 'Strongly agree', is_correct: null, marks: '5' }
        ]
      },
      {
        question: 'Naming conventions and standards are consistently applied:',
        type: 'multiple_choice',
        sequence_number: 13,
        topic_title: 'Data Architecture Principles & Best Practices',
        answers: [
          { text: 'Strongly disagree', is_correct: null, marks: '1' },
          { text: 'Disagree', is_correct: null, marks: '2' },
          { text: 'Neutral', is_correct: null, marks: '3' },
          { text: 'Agree', is_correct: null, marks: '4' },
          { text: 'Strongly agree', is_correct: null, marks: '5' }
        ]
      },
      {
        question: 'The database supports both OLTP and OLAP workloads:',
        type: 'multiple_choice',
        sequence_number: 14,
        topic_title: 'Data Architecture Principles & Best Practices',
        answers: [
          { text: 'Strongly disagree', is_correct: null, marks: '1' },
          { text: 'Disagree', is_correct: null, marks: '2' },
          { text: 'Neutral', is_correct: null, marks: '3' },
          { text: 'Agree', is_correct: null, marks: '4' },
          { text: 'Strongly agree', is_correct: null, marks: '5' }
        ]
      },
      {
        question: 'How often are schema changes reviewed and approved?',
        type: 'multiple_choice',
        sequence_number: 15,
        topic_title: 'Data Architecture Principles & Best Practices',
        answers: [
          { text: 'Never', is_correct: null, marks: '1' },
          { text: 'Annually', is_correct: null, marks: '2' },
          { text: 'Quarterly', is_correct: null, marks: '3' },
          { text: 'Monthly', is_correct: null, marks: '4' },
          { text: 'Every change', is_correct: null, marks: '5' }
        ]
      },
      // Security (Topic 4)
      {
        question: 'Data encryption is implemented at rest and in transit:',
        type: 'multiple_choice',
        sequence_number: 16,
        topic_title: 'Security',
        answers: [
          { text: 'Strongly disagree', is_correct: null, marks: '1' },
          { text: 'Disagree', is_correct: null, marks: '2' },
          { text: 'Neutral', is_correct: null, marks: '3' },
          { text: 'Agree', is_correct: null, marks: '4' },
          { text: 'Strongly agree', is_correct: null, marks: '5' }
        ]
      },
      {
        question: 'Role-based access control (RBAC) is enforced:',
        type: 'multiple_choice',
        sequence_number: 17,
        topic_title: 'Security',
        answers: [
          { text: 'Strongly disagree', is_correct: null, marks: '1' },
          { text: 'Disagree', is_correct: null, marks: '2' },
          { text: 'Neutral', is_correct: null, marks: '3' },
          { text: 'Agree', is_correct: null, marks: '4' },
          { text: 'Strongly agree', is_correct: null, marks: '5' }
        ]
      },
      {
        question: 'Database audit logs are enabled and reviewed:',
        type: 'multiple_choice',
        sequence_number: 18,
        topic_title: 'Security',
        answers: [
          { text: 'Strongly disagree', is_correct: null, marks: '1' },
          { text: 'Disagree', is_correct: null, marks: '2' },
          { text: 'Neutral', is_correct: null, marks: '3' },
          { text: 'Agree', is_correct: null, marks: '4' },
          { text: 'Strongly agree', is_correct: null, marks: '5' }
        ]
      },
      {
        question: 'How often are security patches applied?',
        type: 'multiple_choice',
        sequence_number: 19,
        topic_title: 'Security',
        answers: [
          { text: 'Rarely/never', is_correct: null, marks: '1' },
          { text: 'Annually', is_correct: null, marks: '2' },
          { text: 'Quarterly', is_correct: null, marks: '3' },
          { text: 'Monthly', is_correct: null, marks: '4' },
          { text: 'As soon as released', is_correct: null, marks: '5' }
        ]
      },
      {
        question: 'Sensitive data is masked or tokenized:',
        type: 'multiple_choice',
        sequence_number: 20,
        topic_title: 'Security',
        answers: [
          { text: 'Strongly disagree', is_correct: null, marks: '1' },
          { text: 'Disagree', is_correct: null, marks: '2' },
          { text: 'Neutral', is_correct: null, marks: '3' },
          { text: 'Agree', is_correct: null, marks: '4' },
          { text: 'Strongly agree', is_correct: null, marks: '5' }
        ]
      },
      // Data Lifecycle (Topic 5)
      {
        question: 'Data retention policies are defined and enforced:',
        type: 'multiple_choice',
        sequence_number: 21,
        topic_title: 'Data Lifecycle',
        answers: [
          { text: 'Strongly disagree', is_correct: null, marks: '1' },
          { text: 'Disagree', is_correct: null, marks: '2' },
          { text: 'Neutral', is_correct: null, marks: '3' },
          { text: 'Agree', is_correct: null, marks: '4' },
          { text: 'Strongly agree', is_correct: null, marks: '5' }
        ]
      },
      {
        question: 'Data archiving is automated:',
        type: 'multiple_choice',
        sequence_number: 22,
        topic_title: 'Data Lifecycle',
        answers: [
          { text: 'Strongly disagree', is_correct: null, marks: '1' },
          { text: 'Disagree', is_correct: null, marks: '2' },
          { text: 'Neutral', is_correct: null, marks: '3' },
          { text: 'Agree', is_correct: null, marks: '4' },
          { text: 'Strongly agree', is_correct: null, marks: '5' }
        ]
      },
      {
        question: 'How often is obsolete data purged?',
        type: 'multiple_choice',
        sequence_number: 23,
        topic_title: 'Data Lifecycle',
        answers: [
          { text: 'Never', is_correct: null, marks: '1' },
          { text: 'Annually', is_correct: null, marks: '2' },
          { text: 'Quarterly', is_correct: null, marks: '3' },
          { text: 'Monthly', is_correct: null, marks: '4' },
          { text: 'As per policy', is_correct: null, marks: '5' }
        ]
      },
      {
        question: 'Backups are taken and tested regularly:',
        type: 'multiple_choice',
        sequence_number: 24,
        topic_title: 'Data Lifecycle',
        answers: [
          { text: 'Strongly disagree', is_correct: null, marks: '1' },
          { text: 'Disagree', is_correct: null, marks: '2' },
          { text: 'Neutral', is_correct: null, marks: '3' },
          { text: 'Agree', is_correct: null, marks: '4' },
          { text: 'Strongly agree', is_correct: null, marks: '5' }
        ]
      },
      {
        question: 'The database supports data versioning and change tracking:',
        type: 'multiple_choice',
        sequence_number: 25,
        topic_title: 'Data Lifecycle',
        answers: [
          { text: 'Strongly disagree', is_correct: null, marks: '1' },
          { text: 'Disagree', is_correct: null, marks: '2' },
          { text: 'Neutral', is_correct: null, marks: '3' },
          { text: 'Agree', is_correct: null, marks: '4' },
          { text: 'Strongly agree', is_correct: null, marks: '5' }
        ]
      },
      // Data Quality (Topic 6)
      {
        question: 'Data validation rules are enforced at the database level:',
        type: 'multiple_choice',
        sequence_number: 26,
        topic_title: 'Data Quality',
        answers: [
          { text: 'Strongly disagree', is_correct: null, marks: '1' },
          { text: 'Disagree', is_correct: null, marks: '2' },
          { text: 'Neutral', is_correct: null, marks: '3' },
          { text: 'Agree', is_correct: null, marks: '4' },
          { text: 'Strongly agree', is_correct: null, marks: '5' }
        ]
      },
      {
        question: 'Duplicate data is systematically identified and resolved:',
        type: 'multiple_choice',
        sequence_number: 27,
        topic_title: 'Data Quality',
        answers: [
          { text: 'Strongly disagree', is_correct: null, marks: '1' },
          { text: 'Disagree', is_correct: null, marks: '2' },
          { text: 'Neutral', is_correct: null, marks: '3' },
          { text: 'Agree', is_correct: null, marks: '4' },
          { text: 'Strongly agree', is_correct: null, marks: '5' }
        ]
      },
      {
        question: 'Data quality metrics (accuracy, completeness, consistency) are tracked:',
        type: 'multiple_choice',
        sequence_number: 28,
        topic_title: 'Data Quality',
        answers: [
          { text: 'Strongly disagree', is_correct: null, marks: '1' },
          { text: 'Disagree', is_correct: null, marks: '2' },
          { text: 'Neutral', is_correct: null, marks: '3' },
          { text: 'Agree', is_correct: null, marks: '4' },
          { text: 'Strongly agree', is_correct: null, marks: '5' }
        ]
      },
      // Data Governance (Topic 7)
      {
        question: 'There is a documented data governance framework in place:',
        type: 'multiple_choice',
        sequence_number: 29,
        topic_title: 'Data Governance',
        answers: [
          { text: 'Strongly disagree', is_correct: null, marks: '1' },
          { text: 'Disagree', is_correct: null, marks: '2' },
          { text: 'Neutral', is_correct: null, marks: '3' },
          { text: 'Agree', is_correct: null, marks: '4' },
          { text: 'Strongly agree', is_correct: null, marks: '5' }
        ]
      },
      {
        question: 'Data ownership and stewardship roles are clearly defined:',
        type: 'multiple_choice',
        sequence_number: 30,
        topic_title: 'Data Governance',
        answers: [
          { text: 'Strongly disagree', is_correct: null, marks: '1' },
          { text: 'Disagree', is_correct: null, marks: '2' },
          { text: 'Neutral', is_correct: null, marks: '3' },
          { text: 'Agree', is_correct: null, marks: '4' },
          { text: 'Strongly agree', is_correct: null, marks: '5' }
        ]
      }
    ];

    // Create questions and answers
    for (const questionData of questionsData) {
      // Find the topic for this question
      const topic = createdTopics.find(t => t.title === questionData.topic_title);
      if (!topic) {
        console.error(`Topic not found: ${questionData.topic_title}`);
        continue;
      }

      // Create the question
      const { data: question, error: questionError } = await supabase
        .from('questions')
        .insert([
          {
            question: questionData.question,
            type: questionData.type,
            sequence_number: questionData.sequence_number,
            topic_id: topic.id,
            is_active: true,
            created_by: '00000000-0000-0000-0000-000000000000'
          }
        ])
        .select()
        .single();

      if (questionError) {
        console.error(`Error creating question ${questionData.sequence_number}:`, questionError);
        continue;
      }

      // Create answers for this question
      const { error: answersError } = await supabase
        .from('answers')
        .insert(
          questionData.answers.map(answer => ({
            ...answer,
            question_id: question.id
          }))
        );

      if (answersError) {
        console.error(`Error creating answers for question ${questionData.sequence_number}:`, answersError);
        continue;
      }

      console.log(`✓ Question ${questionData.sequence_number} created with ${questionData.answers.length} answers`);
    }

    console.log('\n🎉 Database Architecture Assessment created successfully!');
    console.log(`Assessment ID: ${assessment.id}`);
    console.log(`Topics: ${createdTopics.length}`);
    console.log(`Questions: ${questionsData.length}`);
    console.log(`Total Answers: ${questionsData.reduce((sum, q) => sum + q.answers.length, 0)}`);

  } catch (error) {
    console.error('Error creating assessment:', error);
  }
}

// Run the script
createDatabaseArchitectureAssessment();