-- Complete Database Schema DDL for Assessment Management System
-- Generated from Supabase Database Structure

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create profiles table (users)
CREATE TABLE profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('admin', 'client')),
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
    assessment_id UUID NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'assigned' CHECK (status IN ('assigned', 'in_progress', 'completed', 'overdue')),
    scope TEXT DEFAULT 'full',
    due_date TIMESTAMP WITH TIME ZONE,
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(assessment_id, user_id)
);

-- Create assessment_submissions table
CREATE TABLE assessment_submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    assessment_id UUID NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    score INTEGER,
    max_score INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(assessment_id, user_id)
);

-- Create topic_assignments table
CREATE TABLE topic_assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    topic_id UUID NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    assessment_assignment_id UUID NOT NULL REFERENCES assessment_assignments(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed')),
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(topic_id, user_id, assessment_assignment_id)
);

-- Create submitted_answers table
CREATE TABLE submitted_answers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    submission_id UUID NOT NULL REFERENCES assessment_submissions(id) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
    answer_id UUID REFERENCES answers(id) ON DELETE SET NULL,
    text_answer TEXT,
    is_correct BOOLEAN,
    marks INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(submission_id, question_id)
);

-- Create indexes for better performance
CREATE INDEX idx_assessments_created_by ON assessments(created_by);
CREATE INDEX idx_assessments_is_active ON assessments(is_active);
CREATE INDEX idx_topics_assessment_id ON topics(assessment_id);
CREATE INDEX idx_topics_sequence_number ON topics(sequence_number);
CREATE INDEX idx_questions_topic_id ON questions(topic_id);
CREATE INDEX idx_questions_sequence_number ON questions(sequence_number);
CREATE INDEX idx_answers_question_id ON answers(question_id);
CREATE INDEX idx_assessment_assignments_user_id ON assessment_assignments(user_id);
CREATE INDEX idx_assessment_assignments_assessment_id ON assessment_assignments(assessment_id);
CREATE INDEX idx_assessment_submissions_user_id ON assessment_submissions(user_id);
CREATE INDEX idx_assessment_submissions_assessment_id ON assessment_submissions(assessment_id);
CREATE INDEX idx_topic_assignments_user_id ON topic_assignments(user_id);
CREATE INDEX idx_topic_assignments_topic_id ON topic_assignments(topic_id);
CREATE INDEX idx_submitted_answers_submission_id ON submitted_answers(submission_id);
CREATE INDEX idx_submitted_answers_question_id ON submitted_answers(question_id);

-- Create functions for RLS and triggers
CREATE OR REPLACE FUNCTION is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = user_id AND role = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
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

-- Enable Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE topic_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE submitted_answers ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" ON profiles
    FOR SELECT USING (is_admin(auth.uid()));

CREATE POLICY "Admins can insert profiles" ON profiles
    FOR INSERT WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Admins can update profiles" ON profiles
    FOR UPDATE USING (is_admin(auth.uid()));

CREATE POLICY "Admins can delete profiles" ON profiles
    FOR DELETE USING (is_admin(auth.uid()));

-- RLS Policies for assessments
CREATE POLICY "Admins can manage assessments" ON assessments
    FOR ALL USING (is_admin(auth.uid()));

CREATE POLICY "Users can view assigned assessments" ON assessments
    FOR SELECT USING (
        id IN (
            SELECT assessment_id FROM assessment_assignments 
            WHERE user_id = auth.uid()
        )
    );

-- RLS Policies for topics
CREATE POLICY "Admins can manage topics" ON topics
    FOR ALL USING (is_admin(auth.uid()));

CREATE POLICY "Users can view topics of assigned assessments" ON topics
    FOR SELECT USING (
        assessment_id IN (
            SELECT assessment_id FROM assessment_assignments 
            WHERE user_id = auth.uid()
        )
    );

-- RLS Policies for questions
CREATE POLICY "Admins can manage questions" ON questions
    FOR ALL USING (is_admin(auth.uid()));

CREATE POLICY "Users can view questions of assigned assessments" ON questions
    FOR SELECT USING (
        topic_id IN (
            SELECT t.id FROM topics t
            JOIN assessment_assignments aa ON t.assessment_id = aa.assessment_id
            WHERE aa.user_id = auth.uid()
        )
    );

-- RLS Policies for answers
CREATE POLICY "Admins can manage answers" ON answers
    FOR ALL USING (is_admin(auth.uid()));

CREATE POLICY "Users can view answers of assigned assessments" ON answers
    FOR SELECT USING (
        question_id IN (
            SELECT q.id FROM questions q
            JOIN topics t ON q.topic_id = t.id
            JOIN assessment_assignments aa ON t.assessment_id = aa.assessment_id
            WHERE aa.user_id = auth.uid()
        )
    );

-- RLS Policies for assessment_assignments
CREATE POLICY "Admins can manage assessment assignments" ON assessment_assignments
    FOR ALL USING (is_admin(auth.uid()));

CREATE POLICY "Users can view their own assignments" ON assessment_assignments
    FOR SELECT USING (user_id = auth.uid());

-- RLS Policies for assessment_submissions
CREATE POLICY "Admins can manage assessment submissions" ON assessment_submissions
    FOR ALL USING (is_admin(auth.uid()));

CREATE POLICY "Users can manage their own submissions" ON assessment_submissions
    FOR ALL USING (user_id = auth.uid());

-- RLS Policies for topic_assignments
CREATE POLICY "Admins can manage topic assignments" ON topic_assignments
    FOR ALL USING (is_admin(auth.uid()));

CREATE POLICY "Users can manage their own topic assignments" ON topic_assignments
    FOR ALL USING (user_id = auth.uid());

-- RLS Policies for submitted_answers
CREATE POLICY "Admins can manage submitted answers" ON submitted_answers
    FOR ALL USING (is_admin(auth.uid()));

CREATE POLICY "Users can manage their own submitted answers" ON submitted_answers
    FOR ALL USING (
        submission_id IN (
            SELECT id FROM assessment_submissions 
            WHERE user_id = auth.uid()
        )
    );

-- Sample data inserts (Database Architecture Assessment)
-- Insert admin user
INSERT INTO profiles (id, first_name, last_name, role, is_active) VALUES
('550e8400-e29b-41d4-a716-446655440000', 'System', 'Admin', 'admin', true);

-- Insert Database Architecture Assessment
INSERT INTO assessments (id, title, description, is_active, created_by) VALUES
('550e8400-e29b-41d4-a716-446655440001', 
 'Database Architecture Assessment', 
 'Comprehensive assessment covering database design principles, normalization, performance optimization, and advanced database concepts.', 
 true, 
 '550e8400-e29b-41d4-a716-446655440000');

-- Insert topics for Database Architecture Assessment
INSERT INTO topics (id, title, description, assessment_id, sequence_number, is_active, created_by) VALUES
('550e8400-e29b-41d4-a716-446655440002', 'Database Fundamentals', 'Core concepts of database systems, DBMS types, and basic architecture', '550e8400-e29b-41d4-a716-446655440001', 1, true, '550e8400-e29b-41d4-a716-446655440000'),
('550e8400-e29b-41d4-a716-446655440003', 'Normalization', 'Database normalization forms and design principles', '550e8400-e29b-41d4-a716-446655440001', 2, true, '550e8400-e29b-41d4-a716-446655440000'),
('550e8400-e29b-41d4-a716-446655440004', 'SQL Queries', 'Advanced SQL query writing and optimization', '550e8400-e29b-41d4-a716-446655440001', 3, true, '550e8400-e29b-41d4-a716-446655440000'),
('550e8400-e29b-41d4-a716-446655440005', 'Indexing', 'Database indexing strategies and performance optimization', '550e8400-e29b-41d4-a716-446655440001', 4, true, '550e8400-e29b-41d4-a716-446655440000'),
('550e8400-e29b-41d4-a716-446655440006', 'Transactions', 'ACID properties and transaction management', '550e8400-e29b-41d4-a716-446655440001', 5, true, '550e8400-e29b-41d4-a716-446655440000'),
('550e8400-e29b-41d4-a716-446655440007', 'Concurrency Control', 'Locking mechanisms and concurrent access management', '550e8400-e29b-41d4-a716-446655440001', 6, true, '550e8400-e29b-41d4-a716-446655440000'),
('550e8400-e29b-41d4-a716-446655440008', 'Backup & Recovery', 'Database backup strategies and disaster recovery', '550e8400-e29b-41d4-a716-446655440001', 7, true, '550e8400-e29b-41d4-a716-446655440000'),
('550e8400-e29b-41d4-a716-446655440009', 'Security', 'Database security, access control, and encryption', '550e8400-e29b-41d4-a716-446655440001', 8, true, '550e8400-e29b-41d4-a716-446655440000');

-- Insert sample questions for Database Fundamentals topic
INSERT INTO questions (id, question, type, topic_id, sequence_number, is_active, created_by) VALUES
('550e8400-e29b-41d4-a716-446655440010', 'What is the primary advantage of using a Database Management System (DBMS) over file-based systems?', 'multiple_choice', '550e8400-e29b-41d4-a716-446655440002', 1, true, '550e8400-e29b-41d4-a716-446655440000'),
('550e8400-e29b-41d4-a716-446655440011', 'Which of the following best describes the role of a database schema?', 'multiple_choice', '550e8400-e29b-41d4-a716-446655440002', 2, true, '550e8400-e29b-41d4-a716-446655440000'),
('550e8400-e29b-41d4-a716-446655440012', 'Is data independence a key feature of modern database systems?', 'yes_no', '550e8400-e29b-41d4-a716-446655440002', 3, true, '550e8400-e29b-41d4-a716-446655440000'),
('550e8400-e29b-41d4-a716-446655440013', 'Explain the difference between physical and logical data independence.', 'free_text', '550e8400-e29b-41d4-a716-446655440002', 4, true, '550e8400-e29b-41d4-a716-446655440000'),
('550e8400-e29b-41d4-a716-446655440014', 'What is the main purpose of the three-schema architecture in database systems?', 'multiple_choice', '550e8400-e29b-41d4-a716-446655440002', 5, true, '550e8400-e29b-41d4-a716-446655440000');

-- Insert sample answers for multiple choice questions
INSERT INTO answers (id, text, is_correct, marks, question_id) VALUES
-- Answers for question 1
('550e8400-e29b-41d4-a716-446655440020', 'Reduced data redundancy and improved data integrity', true, '2', '550e8400-e29b-41d4-a716-446655440010'),
('550e8400-e29b-41d4-a716-446655440021', 'Faster file access and simpler data structure', false, '0', '550e8400-e29b-41d4-a716-446655440010'),
('550e8400-e29b-41d4-a716-446655440022', 'Lower storage costs and minimal maintenance', false, '0', '550e8400-e29b-41d4-a716-446655440010'),
('550e8400-e29b-41d4-a716-446655440023', 'Direct file manipulation and user control', false, '0', '550e8400-e29b-41d4-a716-446655440010'),

-- Answers for question 2
('550e8400-e29b-41d4-a716-446655440024', 'A blueprint that defines the structure and organization of data in a database', true, '2', '550e8400-e29b-41d4-a716-446655440011'),
('550e8400-e29b-41d4-a716-446655440025', 'A security mechanism that controls user access to database tables', false, '0', '550e8400-e29b-41d4-a716-446655440011'),
('550e8400-e29b-41d4-a716-446655440026', 'A backup strategy for database recovery operations', false, '0', '550e8400-e29b-41d4-a716-446655440011'),
('550e8400-e29b-41d4-a716-446655440027', 'A performance optimization tool for query execution', false, '0', '550e8400-e29b-41d4-a716-446655440011'),

-- Answers for yes/no question
('550e8400-e29b-41d4-a716-446655440028', 'Yes', true, '1', '550e8400-e29b-41d4-a716-446655440012'),
('550e8400-e29b-41d4-a716-446655440029', 'No', false, '0', '550e8400-e29b-41d4-a716-446655440012'),

-- Answers for question 5
('550e8400-e29b-41d4-a716-446655440030', 'To provide data independence and separate user views from physical storage', true, '2', '550e8400-e29b-41d4-a716-446655440014'),
('550e8400-e29b-41d4-a716-446655440031', 'To improve database performance through caching mechanisms', false, '0', '550e8400-e29b-41d4-a716-446655440014'),
('550e8400-e29b-41d4-a716-446655440032', 'To ensure data security through encryption layers', false, '0', '550e8400-e29b-41d4-a716-446655440014'),
('550e8400-e29b-41d4-a716-446655440033', 'To manage concurrent user access to the database', false, '0', '550e8400-e29b-41d4-a716-446655440014');

-- Insert sample client user
INSERT INTO profiles (id, first_name, last_name, role, is_active) VALUES
('550e8400-e29b-41d4-a716-446655440100', 'John', 'Doe', 'client', true);

-- Insert sample assessment assignment
INSERT INTO assessment_assignments (id, assessment_id, user_id, status, scope, due_date, assigned_at) VALUES
('550e8400-e29b-41d4-a716-446655440200', '550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440100', 'assigned', 'full', NOW() + INTERVAL '7 days', NOW());

-- Create topic assignments for all topics
INSERT INTO topic_assignments (id, topic_id, user_id, assessment_assignment_id, status) VALUES
('550e8400-e29b-41d4-a716-446655440300', '550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440100', '550e8400-e29b-41d4-a716-446655440200', 'not_started'),
('550e8400-e29b-41d4-a716-446655440301', '550e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440100', '550e8400-e29b-41d4-a716-446655440200', 'not_started'),
('550e8400-e29b-41d4-a716-446655440302', '550e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440100', '550e8400-e29b-41d4-a716-446655440200', 'not_started'),
('550e8400-e29b-41d4-a716-446655440303', '550e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440100', '550e8400-e29b-41d4-a716-446655440200', 'not_started'),
('550e8400-e29b-41d4-a716-446655440304', '550e8400-e29b-41d4-a716-446655440006', '550e8400-e29b-41d4-a716-446655440100', '550e8400-e29b-41d4-a716-446655440200', 'not_started'),
('550e8400-e29b-41d4-a716-446655440305', '550e8400-e29b-41d4-a716-446655440007', '550e8400-e29b-41d4-a716-446655440100', '550e8400-e29b-41d4-a716-446655440200', 'not_started'),
('550e8400-e29b-41d4-a716-446655440306', '550e8400-e29b-41d4-a716-446655440008', '550e8400-e29b-41d4-a716-446655440100', '550e8400-e29b-41d4-a716-446655440200', 'not_started'),
('550e8400-e29b-41d4-a716-446655440307', '550e8400-e29b-41d4-a716-446655440009', '550e8400-e29b-41d4-a716-446655440100', '550e8400-e29b-41d4-a716-446655440200', 'not_started');

-- Add additional constraints and comments
COMMENT ON TABLE profiles IS 'User profiles with role-based access control';
COMMENT ON TABLE assessments IS 'Assessment definitions created by administrators';
COMMENT ON TABLE topics IS 'Topics within assessments, containing related questions';
COMMENT ON TABLE questions IS 'Individual questions within topics';
COMMENT ON TABLE answers IS 'Possible answers for multiple choice and yes/no questions';
COMMENT ON TABLE assessment_assignments IS 'Assessment assignments to users';
COMMENT ON TABLE assessment_submissions IS 'User submissions for assessments';
COMMENT ON TABLE topic_assignments IS 'Individual topic assignments within assessments';
COMMENT ON TABLE submitted_answers IS 'User answers submitted for questions';

-- Commit the transaction
COMMIT;