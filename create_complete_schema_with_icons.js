import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

function escapeSQLValue(val) {
  if (val === null || val === undefined) return 'NULL';
  if (typeof val === 'boolean') return val;
  if (typeof val === 'number') return val;
  if (typeof val === 'string') return `'${val.replace(/'/g, "''").replace(/\\/g, '\\\\')}'`;
  return `'${String(val).replace(/'/g, "''").replace(/\\/g, '\\\\')}'`;
}

async function createCompleteSchema() {
  try {
    console.log(`-- ===========================================
-- COMPLETE SUPABASE DATABASE SCHEMA AND DATA
-- Generated on: ${new Date().toISOString()}
-- ===========================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create profiles table (users)
CREATE TABLE profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('admin', 'client', 'ADMIN', 'CLIENT')),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create assessments table
CREATE TABLE assessments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create topics table
CREATE TABLE topics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    assessment_id UUID NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
    sequence_number INTEGER,
    icon TEXT, -- Lucide React icon name (e.g., 'Database', 'Shield', 'Cloud')
    is_active BOOLEAN DEFAULT TRUE,
    created_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create questions table
CREATE TABLE questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    question TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('multiple_choice', 'yes_no', 'free_text')),
    topic_id UUID NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
    sequence_number INTEGER,
    is_active BOOLEAN DEFAULT TRUE,
    created_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create answers table
CREATE TABLE answers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    text TEXT NOT NULL,
    is_correct BOOLEAN,
    marks TEXT,
    comment TEXT,
    question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create assessment_assignments table
CREATE TABLE assessment_assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    assessment_id UUID NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
    assigned_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    due_date TIMESTAMP WITH TIME ZONE,
    status TEXT DEFAULT 'assigned' CHECK (status IN ('assigned', 'in_progress', 'completed', 'overdue')),
    scope TEXT DEFAULT 'full',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, assessment_id)
);

-- Create assessment_submissions table
CREATE TABLE assessment_submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    assessment_id UUID NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
    assignment_id UUID REFERENCES assessment_assignments(id) ON DELETE CASCADE,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status TEXT DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'submitted', 'reviewed')),
    score DECIMAL(5,2),
    max_score DECIMAL(5,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create topic_assignments table
CREATE TABLE topic_assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    submission_id UUID NOT NULL REFERENCES assessment_submissions(id) ON DELETE CASCADE,
    topic_id UUID NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed')),
    score DECIMAL(5,2),
    max_score DECIMAL(5,2),
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(submission_id, topic_id)
);

-- Create submitted_answers table
CREATE TABLE submitted_answers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    submission_id UUID NOT NULL REFERENCES assessment_submissions(id) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
    answer_id UUID REFERENCES answers(id) ON DELETE CASCADE,
    text_answer TEXT,
    score DECIMAL(5,2),
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(submission_id, question_id)
);

-- Create indexes for better performance
CREATE INDEX idx_assessments_created_by ON assessments(created_by);
CREATE INDEX idx_topics_assessment_id ON topics(assessment_id);
CREATE INDEX idx_topics_sequence_number ON topics(sequence_number);
CREATE INDEX idx_questions_topic_id ON questions(topic_id);
CREATE INDEX idx_questions_sequence_number ON questions(sequence_number);
CREATE INDEX idx_answers_question_id ON answers(question_id);
CREATE INDEX idx_assessment_assignments_user_id ON assessment_assignments(user_id);
CREATE INDEX idx_assessment_assignments_assessment_id ON assessment_assignments(assessment_id);
CREATE INDEX idx_assessment_submissions_user_id ON assessment_submissions(user_id);
CREATE INDEX idx_assessment_submissions_assessment_id ON assessment_submissions(assessment_id);
CREATE INDEX idx_topic_assignments_submission_id ON topic_assignments(submission_id);
CREATE INDEX idx_topic_assignments_topic_id ON topic_assignments(topic_id);
CREATE INDEX idx_submitted_answers_submission_id ON submitted_answers(submission_id);
CREATE INDEX idx_submitted_answers_question_id ON submitted_answers(question_id);

-- Create updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_assessments_updated_at BEFORE UPDATE ON assessments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_topics_updated_at BEFORE UPDATE ON topics
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_questions_updated_at BEFORE UPDATE ON questions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_answers_updated_at BEFORE UPDATE ON answers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_assessment_assignments_updated_at BEFORE UPDATE ON assessment_assignments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_assessment_submissions_updated_at BEFORE UPDATE ON assessment_submissions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_topic_assignments_updated_at BEFORE UPDATE ON topic_assignments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_submitted_answers_updated_at BEFORE UPDATE ON submitted_answers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE topic_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE submitted_answers ENABLE ROW LEVEL SECURITY;

-- ===========================================
-- INSERT ALL EXISTING DATA FROM SUPABASE
-- ===========================================
`);

    // Insert profiles
    const { data: profiles } = await supabase.from('profiles').select('*').order('created_at');
    console.log(`\n-- Insert profiles data (${profiles.length} records)`);
    profiles.forEach(profile => {
      const values = [
        escapeSQLValue(profile.id),
        escapeSQLValue(profile.first_name),
        escapeSQLValue(profile.last_name),
        escapeSQLValue(profile.role),
        escapeSQLValue(profile.is_active),
        escapeSQLValue(profile.created_at),
        escapeSQLValue(profile.updated_at)
      ];
      console.log(`INSERT INTO profiles (id, first_name, last_name, role, is_active, created_at, updated_at) VALUES (${values.join(', ')});`);
    });

    // Insert assessments
    const { data: assessments } = await supabase.from('assessments').select('*').order('created_at');
    console.log(`\n-- Insert assessments data (${assessments.length} records)`);
    assessments.forEach(assessment => {
      const values = [
        escapeSQLValue(assessment.id),
        escapeSQLValue(assessment.title),
        escapeSQLValue(assessment.description),
        escapeSQLValue(assessment.is_active),
        escapeSQLValue(assessment.created_by),
        escapeSQLValue(assessment.created_at),
        escapeSQLValue(assessment.updated_at)
      ];
      console.log(`INSERT INTO assessments (id, title, description, is_active, created_by, created_at, updated_at) VALUES (${values.join(', ')});`);
    });

    // Insert topics with icons
    const { data: topics } = await supabase.from('topics').select('*').order('assessment_id', { ascending: true }).order('sequence_number', { ascending: true });
    console.log(`\n-- Insert topics data (${topics.length} records) with icons`);
    topics.forEach(topic => {
      const values = [
        escapeSQLValue(topic.id),
        escapeSQLValue(topic.title),
        escapeSQLValue(topic.description),
        escapeSQLValue(topic.assessment_id),
        escapeSQLValue(topic.sequence_number),
        escapeSQLValue(topic.icon),
        escapeSQLValue(topic.is_active),
        escapeSQLValue(topic.created_by),
        escapeSQLValue(topic.created_at),
        escapeSQLValue(topic.updated_at)
      ];
      console.log(`INSERT INTO topics (id, title, description, assessment_id, sequence_number, icon, is_active, created_by, created_at, updated_at) VALUES (${values.join(', ')});`);
    });

    // Insert questions
    const { data: questions } = await supabase.from('questions').select('*').order('topic_id', { ascending: true }).order('sequence_number', { ascending: true });
    console.log(`\n-- Insert questions data (${questions.length} records)`);
    questions.forEach(question => {
      const values = [
        escapeSQLValue(question.id),
        escapeSQLValue(question.question),
        escapeSQLValue(question.type),
        escapeSQLValue(question.topic_id),
        escapeSQLValue(question.sequence_number),
        escapeSQLValue(question.is_active),
        escapeSQLValue(question.created_by),
        escapeSQLValue(question.created_at),
        escapeSQLValue(question.updated_at)
      ];
      console.log(`INSERT INTO questions (id, question, type, topic_id, sequence_number, is_active, created_by, created_at, updated_at) VALUES (${values.join(', ')});`);
    });

    // Insert answers
    const { data: answers } = await supabase.from('answers').select('*').order('question_id', { ascending: true });
    console.log(`\n-- Insert answers data (${answers.length} records)`);
    answers.forEach(answer => {
      const values = [
        escapeSQLValue(answer.id),
        escapeSQLValue(answer.text),
        escapeSQLValue(answer.is_correct),
        escapeSQLValue(answer.marks),
        escapeSQLValue(answer.comment),
        escapeSQLValue(answer.question_id),
        escapeSQLValue(answer.created_at),
        escapeSQLValue(answer.updated_at)
      ];
      console.log(`INSERT INTO answers (id, text, is_correct, marks, comment, question_id, created_at, updated_at) VALUES (${values.join(', ')});`);
    });

    // Insert assessment_assignments
    const { data: assignments } = await supabase.from('assessment_assignments').select('*').order('created_at');
    console.log(`\n-- Insert assessment_assignments data (${assignments.length} records)`);
    assignments.forEach(assignment => {
      const values = [
        escapeSQLValue(assignment.id),
        escapeSQLValue(assignment.user_id),
        escapeSQLValue(assignment.assessment_id),
        escapeSQLValue(assignment.assigned_by),
        escapeSQLValue(assignment.assigned_at),
        escapeSQLValue(assignment.due_date),
        escapeSQLValue(assignment.status),
        escapeSQLValue(assignment.scope),
        escapeSQLValue(assignment.created_at),
        escapeSQLValue(assignment.updated_at)
      ];
      console.log(`INSERT INTO assessment_assignments (id, user_id, assessment_id, assigned_by, assigned_at, due_date, status, scope, created_at, updated_at) VALUES (${values.join(', ')});`);
    });

    // Insert assessment_submissions
    const { data: submissions } = await supabase.from('assessment_submissions').select('*').order('created_at');
    console.log(`\n-- Insert assessment_submissions data (${submissions.length} records)`);
    submissions.forEach(submission => {
      const values = [
        escapeSQLValue(submission.id),
        escapeSQLValue(submission.user_id),
        escapeSQLValue(submission.assessment_id),
        escapeSQLValue(submission.assignment_id),
        escapeSQLValue(submission.submitted_at),
        escapeSQLValue(submission.status),
        escapeSQLValue(submission.score),
        escapeSQLValue(submission.max_score),
        escapeSQLValue(submission.created_at),
        escapeSQLValue(submission.updated_at)
      ];
      console.log(`INSERT INTO assessment_submissions (id, user_id, assessment_id, assignment_id, submitted_at, status, score, max_score, created_at, updated_at) VALUES (${values.join(', ')});`);
    });

    // Insert topic_assignments
    const { data: topicAssignments } = await supabase.from('topic_assignments').select('*').order('created_at');
    console.log(`\n-- Insert topic_assignments data (${topicAssignments.length} records)`);
    topicAssignments.forEach(assignment => {
      const values = [
        escapeSQLValue(assignment.id),
        escapeSQLValue(assignment.submission_id),
        escapeSQLValue(assignment.topic_id),
        escapeSQLValue(assignment.status),
        escapeSQLValue(assignment.score),
        escapeSQLValue(assignment.max_score),
        escapeSQLValue(assignment.started_at),
        escapeSQLValue(assignment.completed_at),
        escapeSQLValue(assignment.created_at),
        escapeSQLValue(assignment.updated_at)
      ];
      console.log(`INSERT INTO topic_assignments (id, submission_id, topic_id, status, score, max_score, started_at, completed_at, created_at, updated_at) VALUES (${values.join(', ')});`);
    });

    // Insert submitted_answers
    const { data: submittedAnswers } = await supabase.from('submitted_answers').select('*').order('created_at');
    console.log(`\n-- Insert submitted_answers data (${submittedAnswers.length} records)`);
    submittedAnswers.forEach(answer => {
      const values = [
        escapeSQLValue(answer.id),
        escapeSQLValue(answer.submission_id),
        escapeSQLValue(answer.question_id),
        escapeSQLValue(answer.answer_id),
        escapeSQLValue(answer.text_answer),
        escapeSQLValue(answer.score),
        escapeSQLValue(answer.submitted_at),
        escapeSQLValue(answer.created_at),
        escapeSQLValue(answer.updated_at)
      ];
      console.log(`INSERT INTO submitted_answers (id, submission_id, question_id, answer_id, text_answer, score, submitted_at, created_at, updated_at) VALUES (${values.join(', ')});`);
    });

    console.log(`\n-- ===========================================
-- SCHEMA AND DATA EXPORT COMPLETED
-- Total records exported:
-- Profiles: ${profiles.length}
-- Assessments: ${assessments.length}
-- Topics: ${topics.length} (with icons)
-- Questions: ${questions.length}
-- Answers: ${answers.length}
-- Assignments: ${assignments.length}
-- Submissions: ${submissions.length}
-- Topic Assignments: ${topicAssignments.length}
-- Submitted Answers: ${submittedAnswers.length}
-- ===========================================`);

  } catch (error) {
    console.error('Error creating complete schema:', error);
  }
}

createCompleteSchema();