import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function extractAllData() {
  try {
    console.log('-- Complete Database Data Export from Supabase\n');
    
    // Extract profiles
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at');
    
    if (profilesError) {
      console.error('Error fetching profiles:', profilesError);
    } else {
      console.log('-- Insert profiles data');
      profiles.forEach(profile => {
        console.log(`INSERT INTO profiles (id, first_name, last_name, role, is_active, created_at, updated_at) VALUES`);
        console.log(`('${profile.id}', '${profile.first_name}', '${profile.last_name}', '${profile.role}', ${profile.is_active}, '${profile.created_at}', '${profile.updated_at}');`);
      });
      console.log('');
    }

    // Extract assessments
    const { data: assessments, error: assessmentsError } = await supabase
      .from('assessments')
      .select('*')
      .order('created_at');
    
    if (assessmentsError) {
      console.error('Error fetching assessments:', assessmentsError);
    } else {
      console.log('-- Insert assessments data');
      assessments.forEach(assessment => {
        console.log(`INSERT INTO assessments (id, title, description, is_active, created_by, created_at, updated_at) VALUES`);
        console.log(`('${assessment.id}', '${assessment.title.replace(/'/g, "''")}', '${assessment.description.replace(/'/g, "''")}', ${assessment.is_active}, '${assessment.created_by}', '${assessment.created_at}', '${assessment.updated_at}');`);
      });
      console.log('');
    }

    // Extract topics
    const { data: topics, error: topicsError } = await supabase
      .from('topics')
      .select('*')
      .order('assessment_id', { ascending: true })
      .order('sequence_number', { ascending: true });
    
    if (topicsError) {
      console.error('Error fetching topics:', topicsError);
    } else {
      console.log('-- Insert topics data');
      topics.forEach(topic => {
        const iconValue = topic.icon ? `'${topic.icon}'` : 'NULL';
        console.log(`INSERT INTO topics (id, title, description, assessment_id, sequence_number, icon, is_active, created_by, created_at, updated_at) VALUES`);
        console.log(`('${topic.id}', '${topic.title.replace(/'/g, "''")}', '${topic.description.replace(/'/g, "''")}', '${topic.assessment_id}', ${topic.sequence_number}, ${iconValue}, ${topic.is_active}, '${topic.created_by}', '${topic.created_at}', '${topic.updated_at}');`);
      });
      console.log('');
    }

    // Extract questions
    const { data: questions, error: questionsError } = await supabase
      .from('questions')
      .select('*')
      .order('topic_id', { ascending: true })
      .order('sequence_number', { ascending: true });
    
    if (questionsError) {
      console.error('Error fetching questions:', questionsError);
    } else {
      console.log('-- Insert questions data');
      questions.forEach(question => {
        console.log(`INSERT INTO questions (id, question, type, topic_id, sequence_number, is_active, created_by, created_at, updated_at) VALUES`);
        console.log(`('${question.id}', '${question.question.replace(/'/g, "''")}', '${question.type}', '${question.topic_id}', ${question.sequence_number}, ${question.is_active}, '${question.created_by}', '${question.created_at}', '${question.updated_at}');`);
      });
      console.log('');
    }

    // Extract answers
    const { data: answers, error: answersError } = await supabase
      .from('answers')
      .select('*')
      .order('question_id', { ascending: true });
    
    if (answersError) {
      console.error('Error fetching answers:', answersError);
    } else {
      console.log('-- Insert answers data');
      answers.forEach(answer => {
        const marks = answer.marks ? `'${answer.marks}'` : 'NULL';
        const comment = answer.comment ? `'${answer.comment.replace(/'/g, "''")}'` : 'NULL';
        console.log(`INSERT INTO answers (id, text, is_correct, marks, comment, question_id, created_at, updated_at) VALUES`);
        console.log(`('${answer.id}', '${answer.text.replace(/'/g, "''")}', ${answer.is_correct}, ${marks}, ${comment}, '${answer.question_id}', '${answer.created_at}', '${answer.updated_at}');`);
      });
      console.log('');
    }

    // Extract assessment_assignments
    const { data: assignments, error: assignmentsError } = await supabase
      .from('assessment_assignments')
      .select('*')
      .order('created_at');
    
    if (assignmentsError) {
      console.error('Error fetching assessment_assignments:', assignmentsError);
    } else {
      console.log('-- Insert assessment_assignments data');
      assignments.forEach(assignment => {
        const dueDate = assignment.due_date ? `'${assignment.due_date}'` : 'NULL';
        const assignedAt = assignment.assigned_at ? `'${assignment.assigned_at}'` : 'NULL';
        console.log(`INSERT INTO assessment_assignments (id, assessment_id, user_id, status, scope, due_date, assigned_at, created_at, updated_at) VALUES`);
        console.log(`('${assignment.id}', '${assignment.assessment_id}', '${assignment.user_id}', '${assignment.status}', '${assignment.scope}', ${dueDate}, ${assignedAt}, '${assignment.created_at}', '${assignment.updated_at}');`);
      });
      console.log('');
    }

    // Extract assessment_submissions
    const { data: submissions, error: submissionsError } = await supabase
      .from('assessment_submissions')
      .select('*')
      .order('created_at');
    
    if (submissionsError) {
      console.error('Error fetching assessment_submissions:', submissionsError);
    } else {
      console.log('-- Insert assessment_submissions data');
      submissions.forEach(submission => {
        const startedAt = submission.started_at ? `'${submission.started_at}'` : 'NULL';
        const completedAt = submission.completed_at ? `'${submission.completed_at}'` : 'NULL';
        const score = submission.score ? submission.score : 'NULL';
        const maxScore = submission.max_score ? submission.max_score : 'NULL';
        console.log(`INSERT INTO assessment_submissions (id, assessment_id, user_id, started_at, completed_at, score, max_score, created_at, updated_at) VALUES`);
        console.log(`('${submission.id}', '${submission.assessment_id}', '${submission.user_id}', ${startedAt}, ${completedAt}, ${score}, ${maxScore}, '${submission.created_at}', '${submission.updated_at}');`);
      });
      console.log('');
    }

    // Extract topic_assignments
    const { data: topicAssignments, error: topicAssignmentsError } = await supabase
      .from('topic_assignments')
      .select('*')
      .order('created_at');
    
    if (topicAssignmentsError) {
      console.error('Error fetching topic_assignments:', topicAssignmentsError);
    } else {
      console.log('-- Insert topic_assignments data');
      topicAssignments.forEach(topicAssignment => {
        const startedAt = topicAssignment.started_at ? `'${topicAssignment.started_at}'` : 'NULL';
        const completedAt = topicAssignment.completed_at ? `'${topicAssignment.completed_at}'` : 'NULL';
        console.log(`INSERT INTO topic_assignments (id, topic_id, user_id, assessment_assignment_id, status, started_at, completed_at, created_at, updated_at) VALUES`);
        console.log(`('${topicAssignment.id}', '${topicAssignment.topic_id}', '${topicAssignment.user_id}', '${topicAssignment.assessment_assignment_id}', '${topicAssignment.status}', ${startedAt}, ${completedAt}, '${topicAssignment.created_at}', '${topicAssignment.updated_at}');`);
      });
      console.log('');
    }

    // Extract submitted_answers
    const { data: submittedAnswers, error: submittedAnswersError } = await supabase
      .from('submitted_answers')
      .select('*')
      .order('created_at');
    
    if (submittedAnswersError) {
      console.error('Error fetching submitted_answers:', submittedAnswersError);
    } else {
      console.log('-- Insert submitted_answers data');
      submittedAnswers.forEach(submittedAnswer => {
        const answerId = submittedAnswer.answer_id ? `'${submittedAnswer.answer_id}'` : 'NULL';
        const textAnswer = submittedAnswer.text_answer ? `'${submittedAnswer.text_answer.replace(/'/g, "''")}'` : 'NULL';
        const isCorrect = submittedAnswer.is_correct !== null ? submittedAnswer.is_correct : 'NULL';
        const marks = submittedAnswer.marks !== null ? submittedAnswer.marks : 'NULL';
        console.log(`INSERT INTO submitted_answers (id, submission_id, question_id, answer_id, text_answer, is_correct, marks, created_at, updated_at) VALUES`);
        console.log(`('${submittedAnswer.id}', '${submittedAnswer.submission_id}', '${submittedAnswer.question_id}', ${answerId}, ${textAnswer}, ${isCorrect}, ${marks}, '${submittedAnswer.created_at}', '${submittedAnswer.updated_at}');`);
      });
      console.log('');
    }

    console.log('-- Data extraction completed successfully');
    
  } catch (error) {
    console.error('Error extracting data:', error);
  }
}

extractAllData();