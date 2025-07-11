-- Complete Database Schema DDL with All Data for Assessment Management System
-- Generated from Supabase Database on 2025-07-11T11:05:04.827Z

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
        WHERE id = user_id AND (role = 'admin' OR role = 'ADMIN')
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

-- Add table comments
COMMENT ON TABLE profiles IS 'User profiles with role-based access control';
COMMENT ON TABLE assessments IS 'Assessment definitions created by administrators';
COMMENT ON TABLE topics IS 'Topics within assessments, containing related questions';
COMMENT ON TABLE questions IS 'Individual questions within topics';
COMMENT ON TABLE answers IS 'Possible answers for multiple choice and yes/no questions';
COMMENT ON TABLE assessment_assignments IS 'Assessment assignments to users';
COMMENT ON TABLE assessment_submissions IS 'User submissions for assessments';
COMMENT ON TABLE topic_assignments IS 'Individual topic assignments within assessments';
COMMENT ON TABLE submitted_answers IS 'User answers submitted for questions';

-- ===========================================
-- INSERT ALL EXISTING DATA FROM SUPABASE
-- ===========================================

-- Insert profiles data (4 records)
INSERT INTO profiles (id, first_name, last_name, role, is_active, created_at, updated_at) VALUES ('6b5b34bd-b616-449b-ba94-c433b3a89d5c', 'Vijay', 'Dixit', 'ADMIN', true, '2025-02-28T09:46:14+00:00', '2025-02-28T09:46:18+00:00');
INSERT INTO profiles (id, first_name, last_name, role, is_active, created_at, updated_at) VALUES ('73d6ca9f-6cd4-4eb4-a15d-166d21766faf', 'First Test', 'Client', 'CLIENT', true, '2025-02-28T09:47:02.128019+00:00', '2025-03-02T12:24:40.877299+00:00');
INSERT INTO profiles (id, first_name, last_name, role, is_active, created_at, updated_at) VALUES ('1141658a-2434-48af-8e55-96307bd240fd', 'Second', 'Updated', 'ADMIN', true, '2025-03-01T13:00:35.2709+00:00', '2025-03-02T12:24:24.513848+00:00');
INSERT INTO answers (id, text, is_correct, marks, comment, question_id, created_at, updated_at) VALUES ('89712f6a-aaac-4e1a-a7a1-a86c008816eb', 'No', NULL, '0', NULL, '4a9e2310-fcd0-4182-855d-1871c9b465c9', '2025-07-11T06:07:16.284888+00:00', '2025-07-11T06:07:16.284888+00:00');
INSERT INTO answers (id, text, is_correct, marks, comment, question_id, created_at, updated_at) VALUES ('79dbcb7e-6ce8-4cef-8ab9-3ba564b4c097', 'Yes', NULL, '1', NULL, '4a9e2310-fcd0-4182-855d-1871c9b465c9', '2025-07-11T06:07:16.284888+00:00', '2025-07-11T06:07:16.284888+00:00');
INSERT INTO answers (id, text, is_correct, marks, comment, question_id, created_at, updated_at) VALUES ('bcb47a8f-0197-455f-be91-c6cbbe5a0b6e', 'No', NULL, '0', NULL, '4e73b552-5134-42f0-85ad-35bb82662c45', '2025-07-11T06:07:15.09919+00:00', '2025-07-11T06:07:15.09919+00:00');
INSERT INTO answers (id, text, is_correct, marks, comment, question_id, created_at, updated_at) VALUES ('e9994ae8-1407-463d-a6e0-7d42a6d7b586', 'Yes', NULL, '1', NULL, '4e73b552-5134-42f0-85ad-35bb82662c45', '2025-07-11T06:07:15.09919+00:00', '2025-07-11T06:07:15.09919+00:00');
INSERT INTO answers (id, text, is_correct, marks, comment, question_id, created_at, updated_at) VALUES ('3196acf2-fc08-45a0-89ba-323e92b97d10', '3 - Neutral', NULL, '3', NULL, '4fc3d360-dc40-446a-8e84-86a305fc0072', '2025-07-11T05:54:52.885028+00:00', '2025-07-11T05:54:52.885028+00:00');
INSERT INTO answers (id, text, is_correct, marks, comment, question_id, created_at, updated_at) VALUES ('ff4db099-f9ed-4a05-9e7b-061a607605e8', '1 - Strongly Disagree', NULL, '1', NULL, '4fc3d360-dc40-446a-8e84-86a305fc0072', '2025-07-11T05:54:52.885028+00:00', '2025-07-11T05:54:52.885028+00:00');
INSERT INTO answers (id, text, is_correct, marks, comment, question_id, created_at, updated_at) VALUES ('1d9c59b0-07c4-4fda-a68c-7e6d1f25e839', '2 - Disagree', NULL, '2', NULL, '4fc3d360-dc40-446a-8e84-86a305fc0072', '2025-07-11T05:54:52.885028+00:00', '2025-07-11T05:54:52.885028+00:00');
INSERT INTO answers (id, text, is_correct, marks, comment, question_id, created_at, updated_at) VALUES ('cac7451d-a91c-4c95-8b30-be76daeeb8ac', '5 - Strongly Agree', NULL, '5', NULL, '4fc3d360-dc40-446a-8e84-86a305fc0072', '2025-07-11T05:54:52.885028+00:00', '2025-07-11T05:54:52.885028+00:00');
INSERT INTO answers (id, text, is_correct, marks, comment, question_id, created_at, updated_at) VALUES ('4c8d8d15-5b77-445f-8d3d-e1f34d46fc95', '4 - Agree', NULL, '4', NULL, '4fc3d360-dc40-446a-8e84-86a305fc0072', '2025-07-11T05:54:52.885028+00:00', '2025-07-11T05:54:52.885028+00:00');
INSERT INTO answers (id, text, is_correct, marks, comment, question_id, created_at, updated_at) VALUES ('43a8c1f5-7e1c-4e0b-a133-96a9e9a268e6', 'Yes', NULL, '1', NULL, '4fe3fd0e-2201-49e5-9d6c-c6777bf0736f', '2025-07-11T06:07:13.766404+00:00', '2025-07-11T06:07:13.766404+00:00');
INSERT INTO answers (id, text, is_correct, marks, comment, question_id, created_at, updated_at) VALUES ('f1b7d5b2-7c41-41fa-8042-e3b6cf3e6dec', 'No', NULL, '0', NULL, '4fe3fd0e-2201-49e5-9d6c-c6777bf0736f', '2025-07-11T06:07:13.766404+00:00', '2025-07-11T06:07:13.766404+00:00');
INSERT INTO answers (id, text, is_correct, marks, comment, question_id, created_at, updated_at) VALUES ('97f35b44-6e2c-49a6-81b3-39890b0c8ff2', 'No', NULL, '0', NULL, '5055e4c8-f373-4d7a-8349-aa1b37e32ef8', '2025-07-11T06:07:08.243578+00:00', '2025-07-11T06:07:08.243578+00:00');
INSERT INTO answers (id, text, is_correct, marks, comment, question_id, created_at, updated_at) VALUES ('75536787-55b9-49d8-a3b4-bb6fa7ac288f', 'Yes', NULL, '1', NULL, '5055e4c8-f373-4d7a-8349-aa1b37e32ef8', '2025-07-11T06:07:08.243578+00:00', '2025-07-11T06:07:08.243578+00:00');
INSERT INTO answers (id, text, is_correct, marks, comment, question_id, created_at, updated_at) VALUES ('4ccf951c-a55e-4644-832b-a1c218cf7c62', 'Yes', NULL, '1', NULL, '519a2e9f-9537-475c-baa3-2c45ec585925', '2025-07-11T06:07:12.205194+00:00', '2025-07-11T06:07:12.205194+00:00');
INSERT INTO answers (id, text, is_correct, marks, comment, question_id, created_at, updated_at) VALUES ('2aafac35-63ef-46b0-b02c-7fff2972dfeb', 'No', NULL, '0', NULL, '519a2e9f-9537-475c-baa3-2c45ec585925', '2025-07-11T06:07:12.205194+00:00', '2025-07-11T06:07:12.205194+00:00');
INSERT INTO answers (id, text, is_correct, marks, comment, question_id, created_at, updated_at) VALUES ('69749613-1313-48a6-aba8-6ff16900f6b0', 'Both scheduled and automated', NULL, '4', NULL, '5288b3a0-c702-45e6-b453-9b05578d3d27', '2025-07-11T08:45:44.353067+00:00', '2025-07-11T08:45:44.353067+00:00');
INSERT INTO answers (id, text, is_correct, marks, comment, question_id, created_at, updated_at) VALUES ('bc525cac-207f-4a69-a163-88eabf999103', 'Manual only', NULL, '1', NULL, '5288b3a0-c702-45e6-b453-9b05578d3d27', '2025-07-11T08:45:44.353067+00:00', '2025-07-11T08:45:44.353067+00:00');
INSERT INTO answers (id, text, is_correct, marks, comment, question_id, created_at, updated_at) VALUES ('98545996-f3fa-47f4-aaea-8b847bff0945', 'Scheduled', NULL, '2', NULL, '5288b3a0-c702-45e6-b453-9b05578d3d27', '2025-07-11T08:45:44.353067+00:00', '2025-07-11T08:45:44.353067+00:00');
INSERT INTO answers (id, text, is_correct, marks, comment, question_id, created_at, updated_at) VALUES ('0f348406-c273-405d-ab18-80facf4aa9e2', 'Automated', NULL, '3', NULL, '5288b3a0-c702-45e6-b453-9b05578d3d27', '2025-07-11T08:45:44.353067+00:00', '2025-07-11T08:45:44.353067+00:00');
INSERT INTO answers (id, text, is_correct, marks, comment, question_id, created_at, updated_at) VALUES ('1af045b9-d5b3-4356-94dc-bad8b672a6a4', 'Dynamic/autoscaling with monitoring', NULL, '5', NULL, '5288b3a0-c702-45e6-b453-9b05578d3d27', '2025-07-11T08:45:44.353067+00:00', '2025-07-11T08:45:44.353067+00:00');
INSERT INTO answers (id, text, is_correct, marks, comment, question_id, created_at, updated_at) VALUES ('8db46be6-b5c0-4ed5-9b61-834231ecac50', '5 - Strongly Agree', NULL, '5', NULL, '52c2a1ec-25ee-42b5-babd-b59787098df0', '2025-07-11T05:54:54.276633+00:00', '2025-07-11T05:54:54.276633+00:00');
INSERT INTO answers (id, text, is_correct, marks, comment, question_id, created_at, updated_at) VALUES ('08bc676d-74c5-4995-8303-c84bf6b844f9', '1 - Strongly Disagree', NULL, '1', NULL, '52c2a1ec-25ee-42b5-babd-b59787098df0', '2025-07-11T05:54:54.276633+00:00', '2025-07-11T05:54:54.276633+00:00');
INSERT INTO answers (id, text, is_correct, marks, comment, question_id, created_at, updated_at) VALUES ('d0e2a800-616e-4549-b7d7-7c0d235291b5', '2 - Disagree', NULL, '2', NULL, '52c2a1ec-25ee-42b5-babd-b59787098df0', '2025-07-11T05:54:54.276633+00:00', '2025-07-11T05:54:54.276633+00:00');
INSERT INTO answers (id, text, is_correct, marks, comment, question_id, created_at, updated_at) VALUES ('9821336e-e2df-47ee-9162-f9184422b4bc', '3 - Neutral', NULL, '3', NULL, '52c2a1ec-25ee-42b5-babd-b59787098df0', '2025-07-11T05:54:54.276633+00:00', '2025-07-11T05:54:54.276633+00:00');
INSERT INTO answers (id, text, is_correct, marks, comment, question_id, created_at, updated_at) VALUES ('bd559073-5f3c-4e9c-b899-840633241597', '4 - Agree', NULL, '4', NULL, '52c2a1ec-25ee-42b5-babd-b59787098df0', '2025-07-11T05:54:54.276633+00:00', '2025-07-11T05:54:54.276633+00:00');
INSERT INTO answers (id, text, is_correct, marks, comment, question_id, created_at, updated_at) VALUES ('5703c5a1-9828-4e7f-9b8d-aac1dc40d523', 'Agree', NULL, '4', NULL, '5567dcfd-811c-422c-9988-08b6593597bf', '2025-07-11T08:45:46.288936+00:00', '2025-07-11T08:45:46.288936+00:00');
INSERT INTO answers (id, text, is_correct, marks, comment, question_id, created_at, updated_at) VALUES ('8b22ad22-b7d5-4d7f-bfb1-92a179e59b92', 'Strongly agree', NULL, '5', NULL, '5567dcfd-811c-422c-9988-08b6593597bf', '2025-07-11T08:45:46.288936+00:00', '2025-07-11T08:45:46.288936+00:00');
INSERT INTO answers (id, text, is_correct, marks, comment, question_id, created_at, updated_at) VALUES ('881c56a3-35a9-4e6c-b06e-b7bdcf97ed13', 'Strongly disagree', NULL, '1', NULL, '5567dcfd-811c-422c-9988-08b6593597bf', '2025-07-11T08:45:46.288936+00:00', '2025-07-11T08:45:46.288936+00:00');
INSERT INTO answers (id, text, is_correct, marks, comment, question_id, created_at, updated_at) VALUES ('ed48a62c-5ae1-4ea0-86e9-ac7db5ce5df7', 'Disagree', NULL, '2', NULL, '5567dcfd-811c-422c-9988-08b6593597bf', '2025-07-11T08:45:46.288936+00:00', '2025-07-11T08:45:46.288936+00:00');
INSERT INTO answers (id, text, is_correct, marks, comment, question_id, created_at, updated_at) VALUES ('fbb3f9c3-8d88-4845-9423-4032f72082d5', 'Neutral', NULL, '3', NULL, '5567dcfd-811c-422c-9988-08b6593597bf', '2025-07-11T08:45:46.288936+00:00', '2025-07-11T08:45:46.288936+00:00');
INSERT INTO answers (id, text, is_correct, marks, comment, question_id, created_at, updated_at) VALUES ('38b5ac82-bb3e-46ef-98d2-4602513d783a', '3 - Neutral', NULL, '3', NULL, '55e307d8-0eaa-4081-a368-6801df8fba6c', '2025-07-11T05:54:58.256648+00:00', '2025-07-11T05:54:58.256648+00:00');
INSERT INTO answers (id, text, is_correct, marks, comment, question_id, created_at, updated_at) VALUES ('88905434-a8f8-46e2-a098-540a68ecea4e', '2 - Disagree', NULL, '2', NULL, '55e307d8-0eaa-4081-a368-6801df8fba6c', '2025-07-11T05:54:58.256648+00:00', '2025-07-11T05:54:58.256648+00:00');
INSERT INTO answers (id, text, is_correct, marks, comment, question_id, created_at, updated_at) VALUES ('c6bde63e-2e59-47f7-b3d8-8ba3ccf96d93', '5 - Strongly Agree', NULL, '5', NULL, '55e307d8-0eaa-4081-a368-6801df8fba6c', '2025-07-11T05:54:58.256648+00:00', '2025-07-11T05:54:58.256648+00:00');
INSERT INTO answers (id, text, is_correct, marks, comment, question_id, created_at, updated_at) VALUES ('a8a335f8-8d89-4323-a3a9-2e66090110e6', '4 - Agree', NULL, '4', NULL, '55e307d8-0eaa-4081-a368-6801df8fba6c', '2025-07-11T05:54:58.256648+00:00', '2025-07-11T05:54:58.256648+00:00');
INSERT INTO answers (id, text, is_correct, marks, comment, question_id, created_at, updated_at) VALUES ('d0686305-05a3-405f-bcc6-879d1d3b4b27', '1 - Strongly Disagree', NULL, '1', NULL, '55e307d8-0eaa-4081-a368-6801df8fba6c', '2025-07-11T05:54:58.256648+00:00', '2025-07-11T05:54:58.256648+00:00');
INSERT INTO answers (id, text, is_correct, marks, comment, question_id, created_at, updated_at) VALUES ('bfb619a9-3eb2-4e12-9e53-5d14d5be9823', 'Agree', NULL, '4', NULL, '577794cd-dd3c-4d4e-a8df-377c49f38b9b', '2025-07-11T08:45:49.251242+00:00', '2025-07-11T08:45:49.251242+00:00');
INSERT INTO answers (id, text, is_correct, marks, comment, question_id, created_at, updated_at) VALUES ('bb23f021-6694-4511-8080-4109dd7a60f2', 'Disagree', NULL, '2', NULL, '577794cd-dd3c-4d4e-a8df-377c49f38b9b', '2025-07-11T08:45:49.251242+00:00', '2025-07-11T08:45:49.251242+00:00');
INSERT INTO answers (id, text, is_correct, marks, comment, question_id, created_at, updated_at) VALUES ('f198859c-481d-4ab1-b694-0239a1bd3746', 'Strongly disagree', NULL, '1', NULL, '577794cd-dd3c-4d4e-a8df-377c49f38b9b', '2025-07-11T08:45:49.251242+00:00', '2025-07-11T08:45:49.251242+00:00');
INSERT INTO answers (id, text, is_correct, marks, comment, question_id, created_at, updated_at) VALUES ('19d770b2-e145-4f79-8c1f-88d9c5936e27', 'Strongly agree', NULL, '5', NULL, '577794cd-dd3c-4d4e-a8df-377c49f38b9b', '2025-07-11T08:45:49.251242+00:00', '2025-07-11T08:45:49.251242+00:00');
INSERT INTO answers (id, text, is_correct, marks, comment, question_id, created_at, updated_at) VALUES ('504a24df-62cb-4737-abd6-326e77932c20', 'Neutral', NULL, '3', NULL, '577794cd-dd3c-4d4e-a8df-377c49f38b9b', '2025-07-11T08:45:49.251242+00:00', '2025-07-11T08:45:49.251242+00:00');
INSERT INTO answers (id, text, is_correct, marks, comment, question_id, created_at, updated_at) VALUES ('560c288d-310f-460d-b948-01b926f95a47', 'Multi-cloud', NULL, '5', NULL, '59d59d6a-617d-40db-bc2a-9b6b212f3475', '2025-07-11T08:45:42.911778+00:00', '2025-07-11T08:45:42.911778+00:00');
INSERT INTO answers (id, text, is_correct, marks, comment, question_id, created_at, updated_at) VALUES ('41f9405d-cbc0-4c61-9681-68c8ffdde89d', 'Private cloud', NULL, '2', NULL, '59d59d6a-617d-40db-bc2a-9b6b212f3475', '2025-07-11T08:45:42.911778+00:00', '2025-07-11T08:45:42.911778+00:00');
INSERT INTO answers (id, text, is_correct, marks, comment, question_id, created_at, updated_at) VALUES ('24b6c565-dcf1-4a42-a784-1273da34fde5', 'Public cloud', NULL, '3', NULL, '59d59d6a-617d-40db-bc2a-9b6b212f3475', '2025-07-11T08:45:42.911778+00:00', '2025-07-11T08:45:42.911778+00:00');
INSERT INTO answers (id, text, is_correct, marks, comment, question_id, created_at, updated_at) VALUES ('02f07ce3-cb48-4fbc-88d6-7e2036a3d65c', 'Hybrid', NULL, '4', NULL, '59d59d6a-617d-40db-bc2a-9b6b212f3475', '2025-07-11T08:45:42.911778+00:00', '2025-07-11T08:45:42.911778+00:00');
INSERT INTO answers (id, text, is_correct, marks, comment, question_id, created_at, updated_at) VALUES ('b5ee8d96-6206-43e5-809f-d067d4d422a9', 'On-premises only', NULL, '1', NULL, '59d59d6a-617d-40db-bc2a-9b6b212f3475', '2025-07-11T08:45:42.911778+00:00', '2025-07-11T08:45:42.911778+00:00');
INSERT INTO answers (id, text, is_correct, marks, comment, question_id, created_at, updated_at) VALUES ('c80f2b70-e630-4989-9a25-463bb404e1fa', 'No', NULL, '0', NULL, '5b5cb4d1-7595-4a06-887f-4fbbe1025ece', '2025-07-11T06:07:11.135814+00:00', '2025-07-11T06:07:11.135814+00:00');
INSERT INTO answers (id, text, is_correct, marks, comment, question_id, created_at, updated_at) VALUES ('3d4776ac-f4f7-4ee6-8235-6fd31425ef70', 'Yes', NULL, '1', NULL, '5b5cb4d1-7595-4a06-887f-4fbbe1025ece', '2025-07-11T06:07:11.135814+00:00', '2025-07-11T06:07:11.135814+00:00');
INSERT INTO answers (id, text, is_correct, marks, comment, question_id, created_at, updated_at) VALUES ('25701018-61c3-4a0b-b1d6-1421c8530de6', 'Strongly agree', NULL, '5', NULL, '5c1ade77-fb79-4002-87a7-14f00d2af817', '2025-07-11T08:45:51.330253+00:00', '2025-07-11T08:45:51.330253+00:00');
INSERT INTO answers (id, text, is_correct, marks, comment, question_id, created_at, updated_at) VALUES ('d2d413d5-0386-4d22-a45b-701ae3777865', 'Strongly disagree', NULL, '1', NULL, '5c1ade77-fb79-4002-87a7-14f00d2af817', '2025-07-11T08:45:51.330253+00:00', '2025-07-11T08:45:51.330253+00:00');
INSERT INTO answers (id, text, is_correct, marks, comment, question_id, created_at, updated_at) VALUES ('36e9c81d-5aa1-4343-92f0-09e80b3da489', 'Disagree', NULL, '2', NULL, '5c1ade77-fb79-4002-87a7-14f00d2af817', '2025-07-11T08:45:51.330253+00:00', '2025-07-11T08:45:51.330253+00:00');
INSERT INTO answers (id, text, is_correct, marks, comment, question_id, created_at, updated_at) VALUES ('07ffb4f8-5534-493c-ac80-5a1668d7c60f', 'Neutral', NULL, '3', NULL, '5c1ade77-fb79-4002-87a7-14f00d2af817', '2025-07-11T08:45:51.330253+00:00', '2025-07-11T08:45:51.330253+00:00');
INSERT INTO answers (id, text, is_correct, marks, comment, question_id, created_at, updated_at) VALUES ('2bc813f4-c3ae-4543-80a9-76363ee1c240', 'Agree', NULL, '4', NULL, '5c1ade77-fb79-4002-87a7-14f00d2af817', '2025-07-11T08:45:51.330253+00:00', '2025-07-11T08:45:51.330253+00:00');
INSERT INTO answers (id, text, is_correct, marks, comment, question_id, created_at, updated_at) VALUES ('1e60276a-3236-4021-8a6c-38473648509c', 'Agree', NULL, '4', NULL, '5c26106f-7a96-4059-bfdb-78434b489cea', '2025-07-11T08:45:49.025977+00:00', '2025-07-11T08:45:49.025977+00:00');
INSERT INTO answers (id, text, is_correct, marks, comment, question_id, created_at, updated_at) VALUES ('ee256ca9-19b4-41bc-af9c-3f7fd6190546', 'Strongly agree', NULL, '5', NULL, '5c26106f-7a96-4059-bfdb-78434b489cea', '2025-07-11T08:45:49.025977+00:00', '2025-07-11T08:45:49.025977+00:00');
INSERT INTO answers (id, text, is_correct, marks, comment, question_id, created_at, updated_at) VALUES ('2b296c46-be4a-4893-9cf4-174c5cf85f9c', 'Strongly disagree', NULL, '1', NULL, '5c26106f-7a96-4059-bfdb-78434b489cea', '2025-07-11T08:45:49.025977+00:00', '2025-07-11T08:45:49.025977+00:00');
INSERT INTO answers (id, text, is_correct, marks, comment, question_id, created_at, updated_at) VALUES ('ce4d886d-1e64-416e-9f42-3dedc2049efb', 'Disagree', NULL, '2', NULL, '5c26106f-7a96-4059-bfdb-78434b489cea', '2025-07-11T08:45:49.025977+00:00', '2025-07-11T08:45:49.025977+00:00');
INSERT INTO answers (id, text, is_correct, marks, comment, question_id, created_at, updated_at) VALUES ('8f6124d7-661a-4362-9cee-b09b62d523d3', 'Neutral', NULL, '3', NULL, '5c26106f-7a96-4059-bfdb-78434b489cea', '2025-07-11T08:45:49.025977+00:00', '2025-07-11T08:45:49.025977+00:00');
INSERT INTO answers (id, text, is_correct, marks, comment, question_id, created_at, updated_at) VALUES ('137a9c4a-cdf5-4f54-9488-c1616568ed2a', '2 - Disagree', NULL, '2', NULL, '5ce995bc-6e44-44ef-95f9-c6c6db6ff0b7', '2025-07-11T05:54:54.045421+00:00', '2025-07-11T05:54:54.045421+00:00');
INSERT INTO answers (id, text, is_correct, marks, comment, question_id, created_at, updated_at) VALUES ('34635e8d-fcb9-446a-8284-1ea0267bd564', '3 - Neutral', NULL, '3', NULL, '5ce995bc-6e44-44ef-95f9-c6c6db6ff0b7', '2025-07-11T05:54:54.045421+00:00', '2025-07-11T05:54:54.045421+00:00');
INSERT INTO answers (id, text, is_correct, marks, comment, question_id, created_at, updated_at) VALUES ('ca4d119c-fad9-411e-9e4a-823f5d0276b6', '5 - Strongly Agree', NULL, '5', NULL, '5ce995bc-6e44-44ef-95f9-c6c6db6ff0b7', '2025-07-11T05:54:54.045421+00:00', '2025-07-11T05:54:54.045421+00:00');
INSERT INTO answers (id, text, is_correct, marks, comment, question_id, created_at, updated_at) VALUES ('3c039f2e-7312-4aab-a01c-164c7e298a95', '4 - Agree', NULL, '4', NULL, '5ce995bc-6e44-44ef-95f9-c6c6db6ff0b7', '2025-07-11T05:54:54.045421+00:00', '2025-07-11T05:54:54.045421+00:00');
INSERT INTO answers (id, text, is_correct, marks, comment, question_id, created_at, updated_at) VALUES ('5029886d-d8d2-4403-bd9d-913c9f282792', '1 - Strongly Disagree', NULL, '1', NULL, '5ce995bc-6e44-44ef-95f9-c6c6db6ff0b7', '2025-07-11T05:54:54.045421+00:00', '2025-07-11T05:54:54.045421+00:00');
INSERT INTO answers (id, text, is_correct, marks, comment, question_id, created_at, updated_at) VALUES ('1da48c2e-c977-4c4e-bed8-61b6e5fd5fa1', '1 - Strongly Disagree', NULL, '1', NULL, '5f7be3f1-7dec-41d2-9c69-a916c5e5f8a7', '2025-07-11T05:54:53.312429+00:00', '2025-07-11T05:54:53.312429+00:00');
INSERT INTO answers (id, text, is_correct, marks, comment, question_id, created_at, updated_at) VALUES ('fa2a524e-dd9f-46bd-af09-4e7e55f17032', '2 - Disagree', NULL, '2', NULL, '5f7be3f1-7dec-41d2-9c69-a916c5e5f8a7', '2025-07-11T05:54:53.312429+00:00', '2025-07-11T05:54:53.312429+00:00');
INSERT INTO answers (id, text, is_correct, marks, comment, question_id, created_at, updated_at) VALUES ('de911725-d8b2-43e3-941c-0c83f401b840', '3 - Neutral', NULL, '3', NULL, '5f7be3f1-7dec-41d2-9c69-a916c5e5f8a7', '2025-07-11T05:54:53.312429+00:00', '2025-07-11T05:54:53.312429+00:00');
INSERT INTO answers (id, text, is_correct, marks, comment, question_id, created_at, updated_at) VALUES ('1fbcde7b-12a7-412a-9f41-f33d88715ebf', '4 - Agree', NULL, '4', NULL, '5f7be3f1-7dec-41d2-9c69-a916c5e5f8a7', '2025-07-11T05:54:53.312429+00:00', '2025-07-11T05:54:53.312429+00:00');
INSERT INTO answers (id, text, is_correct, marks, comment, question_id, created_at, updated_at) VALUES ('024b8530-93e9-468b-9ea5-a9dd4714017c', '5 - Strongly Agree', NULL, '5', NULL, '5f7be3f1-7dec-41d2-9c69-a916c5e5f8a7', '2025-07-11T05:54:53.312429+00:00', '2025-07-11T05:54:53.312429+00:00');
INSERT INTO answers (id, text, is_correct, marks, comment, question_id, created_at, updated_at) VALUES ('057bfded-57c1-441f-b54c-b8618115f4e6', 'No', NULL, '0', NULL, '611d979b-bf66-4d2a-99c7-4bb004e4948a', '2025-07-11T06:07:14.301494+00:00', '2025-07-11T06:07:14.301494+00:00');
INSERT INTO answers (id, text, is_correct, marks, comment, question_id, created_at, updated_at) VALUES ('83e2548d-77ca-4977-9650-7913707b189a', 'Yes', NULL, '1', NULL, '611d979b-bf66-4d2a-99c7-4bb004e4948a', '2025-07-11T06:07:14.301494+00:00', '2025-07-11T06:07:14.301494+00:00');
INSERT INTO answers (id, text, is_correct, marks, comment, question_id, created_at, updated_at) VALUES ('d51aaae0-a2dc-4c4d-a7c6-70feb8c77f04', '2 - Disagree', NULL, '2', NULL, '63db6220-f6fd-4a52-a846-121536f63cf6', '2025-07-11T05:54:53.521946+00:00', '2025-07-11T05:54:53.521946+00:00');
INSERT INTO answers (id, text, is_correct, marks, comment, question_id, created_at, updated_at) VALUES ('8f5e7ac4-3fd4-4fe1-a2a5-a370c4ef1685', '1 - Strongly Disagree', NULL, '1', NULL, '63db6220-f6fd-4a52-a846-121536f63cf6', '2025-07-11T05:54:53.521946+00:00', '2025-07-11T05:54:53.521946+00:00');
INSERT INTO answers (id, text, is_correct, marks, comment, question_id, created_at, updated_at) VALUES ('3e0b3a2b-33e4-4932-b95c-e58022370b19', '3 - Neutral', NULL, '3', NULL, '63db6220-f6fd-4a52-a846-121536f63cf6', '2025-07-11T05:54:53.521946+00:00', '2025-07-11T05:54:53.521946+00:00');
INSERT INTO answers (id, text, is_correct, marks, comment, question_id, created_at, updated_at) VALUES ('8cd2aa03-0ba7-4374-a229-73b900771449', '4 - Agree', NULL, '4', NULL, '63db6220-f6fd-4a52-a846-121536f63cf6', '2025-07-11T05:54:53.521946+00:00', '2025-07-11T05:54:53.521946+00:00');
INSERT INTO answers (id, text, is_correct, marks, comment, question_id, created_at, updated_at) VALUES ('c38fc836-dc7a-4fa3-94df-dd8ff5b68ae0', '5 - Strongly Agree', NULL, '5', NULL, '63db6220-f6fd-4a52-a846-121536f63cf6', '2025-07-11T05:54:53.521946+00:00', '2025-07-11T05:54:53.521946+00:00');
INSERT INTO answers (id, text, is_correct, marks, comment, question_id, created_at, updated_at) VALUES ('03262eb8-a2d3-4182-bd9e-b34c79fee558', 'Strongly disagree', NULL, '1', NULL, '65ea2c48-acbc-42ec-96c1-c8f13800b7f1', '2025-07-11T08:45:45.412346+00:00', '2025-07-11T08:45:45.412346+00:00');
INSERT INTO answers (id, text, is_correct, marks, comment, question_id, created_at, updated_at) VALUES ('9ff2906f-ec8c-409a-a2a0-08e89af487c5', 'Strongly agree', NULL, '5', NULL, '65ea2c48-acbc-42ec-96c1-c8f13800b7f1', '2025-07-11T08:45:45.412346+00:00', '2025-07-11T08:45:45.412346+00:00');
INSERT INTO answers (id, text, is_correct, marks, comment, question_id, created_at, updated_at) VALUES ('5d7aba36-ab6e-4cab-a444-bf3932c2fb15', 'Disagree', NULL, '2', NULL, '65ea2c48-acbc-42ec-96c1-c8f13800b7f1', '2025-07-11T08:45:45.412346+00:00', '2025-07-11T08:45:45.412346+00:00');
INSERT INTO answers (id, text, is_correct, marks, comment, question_id, created_at, updated_at) VALUES ('4bc28e2d-2e3e-42d9-9743-0757455baadf', 'Neutral', NULL, '3', NULL, '65ea2c48-acbc-42ec-96c1-c8f13800b7f1', '2025-07-11T08:45:45.412346+00:00', '2025-07-11T08:45:45.412346+00:00');
INSERT INTO answers (id, text, is_correct, marks, comment, question_id, created_at, updated_at) VALUES ('8dfa90c2-b1ce-4ba8-817e-928d53a7be01', 'Agree', NULL, '4', NULL, '65ea2c48-acbc-42ec-96c1-c8f13800b7f1', '2025-07-11T08:45:45.412346+00:00', '2025-07-11T08:45:45.412346+00:00');
INSERT INTO answers (id, text, is_correct, marks, comment, question_id, created_at, updated_at) VALUES ('db418985-a685-4ed9-b6d5-e7d48a7c6419', 'No', NULL, '0', NULL, '6916fba4-ef51-4b7a-a8e8-12a2fe94c01c', '2025-07-11T06:07:14.660637+00:00', '2025-07-11T06:07:14.660637+00:00');
INSERT INTO answers (id, text, is_correct, marks, comment, question_id, created_at, updated_at) VALUES ('9e7c3b6f-107f-45ec-899f-00bb9fbeaa9a', 'Yes', NULL, '1', NULL, '6916fba4-ef51-4b7a-a8e8-12a2fe94c01c', '2025-07-11T06:07:14.660637+00:00', '2025-07-11T06:07:14.660637+00:00');
INSERT INTO answers (id, text, is_correct, marks, comment, question_id, created_at, updated_at) VALUES ('ed1f70c3-5757-4368-9d4e-6fd0961fa809', '1 - Strongly Disagree', NULL, '1', NULL, '6b4c43a8-88a5-4f6e-af2b-11634fd6bbd2', '2025-07-11T05:54:57.064662+00:00', '2025-07-11T05:54:57.064662+00:00');
INSERT INTO answers (id, text, is_correct, marks, comment, question_id, created_at, updated_at) VALUES ('032a453a-64d7-42fe-b819-e9b0ad6b699d', '5 - Strongly Agree', NULL, '5', NULL, '6b4c43a8-88a5-4f6e-af2b-11634fd6bbd2', '2025-07-11T05:54:57.064662+00:00', '2025-07-11T05:54:57.064662+00:00');
INSERT INTO answers (id, text, is_correct, marks, comment, question_id, created_at, updated_at) VALUES ('6f1039b5-90f1-4541-844e-52ee9efcc314', '2 - Disagree', NULL, '2', NULL, '6b4c43a8-88a5-4f6e-af2b-11634fd6bbd2', '2025-07-11T05:54:57.064662+00:00', '2025-07-11T05:54:57.064662+00:00');
INSERT INTO answers (id, text, is_correct, marks, comment, question_id, created_at, updated_at) VALUES ('7f40c50f-220a-429f-b62e-77e9061cebc2', '3 - Neutral', NULL, '3', NULL, '6b4c43a8-88a5-4f6e-af2b-11634fd6bbd2', '2025-07-11T05:54:57.064662+00:00', '2025-07-11T05:54:57.064662+00:00');
INSERT INTO answers (id, text, is_correct, marks, comment, question_id, created_at, updated_at) VALUES ('b4addd6a-e09a-489e-acc2-b9e2da76b51e', '4 - Agree', NULL, '4', NULL, '6b4c43a8-88a5-4f6e-af2b-11634fd6bbd2', '2025-07-11T05:54:57.064662+00:00', '2025-07-11T05:54:57.064662+00:00');
INSERT INTO answers (id, text, is_correct, marks, comment, question_id, created_at, updated_at) VALUES ('a676c941-3c3c-475e-84eb-ae5f2b7dc4c5', 'Yes', NULL, '1', NULL, '713c1cca-1cd0-46c5-ad4e-214ed484d5ff', '2025-07-11T06:07:08.688291+00:00', '2025-07-11T06:07:08.688291+00:00');
INSERT INTO answers (id, text, is_correct, marks, comment, question_id, created_at, updated_at) VALUES ('0144be4f-cd08-4fef-a608-52db91c77b9a', 'No', NULL, '0', NULL, '713c1cca-1cd0-46c5-ad4e-214ed484d5ff', '2025-07-11T06:07:08.688291+00:00', '2025-07-11T06:07:08.688291+00:00');
INSERT INTO answers (id, text, is_correct, marks, comment, question_id, created_at, updated_at) VALUES ('ca5219ea-df54-4303-a2b9-d0315079e6e5', '12–24 hours', NULL, '2', NULL, '720eba34-bb00-4684-82dc-7021691483da', '2025-07-11T08:45:50.073012+00:00', '2025-07-11T08:45:50.073012+00:00');
INSERT INTO answers (id, text, is_correct, marks, comment, question_id, created_at, updated_at) VALUES ('e81727f7-011b-47c3-8893-657a2c1efc35', 'More than 24 hours', NULL, '1', NULL, '720eba34-bb00-4684-82dc-7021691483da', '2025-07-11T08:45:50.073012+00:00', '2025-07-11T08:45:50.073012+00:00');
INSERT INTO answers (id, text, is_correct, marks, comment, question_id, created_at, updated_at) VALUES ('60a7d105-9ce1-4b35-8ba9-86ee8e684880', 'Less than 1 hour', NULL, '5', NULL, '720eba34-bb00-4684-82dc-7021691483da', '2025-07-11T08:45:50.073012+00:00', '2025-07-11T08:45:50.073012+00:00');
INSERT INTO answers (id, text, is_correct, marks, comment, question_id, created_at, updated_at) VALUES ('b509725f-6ed2-40ee-9eca-6b9598d860ec', '2–12 hours', NULL, '3', NULL, '720eba34-bb00-4684-82dc-7021691483da', '2025-07-11T08:45:50.073012+00:00', '2025-07-11T08:45:50.073012+00:00');
INSERT INTO answers (id, text, is_correct, marks, comment, question_id, created_at, updated_at) VALUES ('354047a6-e4a5-483c-b8e5-ee013ef32a84', '1–2 hours', NULL, '4', NULL, '720eba34-bb00-4684-82dc-7021691483da', '2025-07-11T08:45:50.073012+00:00', '2025-07-11T08:45:50.073012+00:00');
INSERT INTO answers (id, text, is_correct, marks, comment, question_id, created_at, updated_at) VALUES ('c3d1bf39-cc4f-4fb7-89a3-2625fab176fd', '2 - Disagree', NULL, '2', NULL, '755c2570-916e-46c5-93ae-2ddb70612f41', '2025-07-11T05:54:55.675991+00:00', '2025-07-11T05:54:55.675991+00:00');
INSERT INTO answers (id, text, is_correct, marks, comment, question_id, created_at, updated_at) VALUES ('bd0579ae-fe75-4bfe-8031-62cbc973f795', '5 - Strongly Agree', NULL, '5', NULL, '755c2570-916e-46c5-93ae-2ddb70612f41', '2025-07-11T05:54:55.675991+00:00', '2025-07-11T05:54:55.675991+00:00');
INSERT INTO answers (id, text, is_correct, marks, comment, question_id, created_at, updated_at) VALUES ('d3fb8359-8415-47d5-ad7d-b33efba4e5e0', '4 - Agree', NULL, '4', NULL, '755c2570-916e-46c5-93ae-2ddb70612f41', '2025-07-11T05:54:55.675991+00:00', '2025-07-11T05:54:55.675991+00:00');
INSERT INTO answers (id, text, is_correct, marks, comment, question_id, created_at, updated_at) VALUES ('a2b7ec7b-2a58-4a2e-8cdb-511fb3d83da1', '3 - Neutral', NULL, '3', NULL, '755c2570-916e-46c5-93ae-2ddb70612f41', '2025-07-11T05:54:55.675991+00:00', '2025-07-11T05:54:55.675991+00:00');
INSERT INTO answers (id, text, is_correct, marks, comment, question_id, created_at, updated_at) VALUES ('6d82aff7-24c8-4ea7-a7a2-3f29fcc7f042', '1 - Strongly Disagree', NULL, '1', NULL, '755c2570-916e-46c5-93ae-2ddb70612f41', '2025-07-11T05:54:55.675991+00:00', '2025-07-11T05:54:55.675991+00:00');
INSERT INTO answers (id, text, is_correct, marks, comment, question_id, created_at, updated_at) VALUES ('dc95faa4-868b-468a-9261-4090534f88f0', 'No', NULL, '0', NULL, '768ccb99-7503-4061-9cb8-d81d06d495a1', '2025-07-11T06:07:14.866468+00:00', '2025-07-11T06:07:14.866468+00:00');
INSERT INTO answers (id, text, is_correct, marks, comment, question_id, created_at, updated_at) VALUES ('08e93bdf-8f4d-4e78-89f1-efb11f5284aa', 'Yes', NULL, '1', NULL, '768ccb99-7503-4061-9cb8-d81d06d495a1', '2025-07-11T06:07:14.866468+00:00', '2025-07-11T06:07:14.866468+00:00');
INSERT INTO answers (id, text, is_correct, marks, comment, question_id, created_at, updated_at) VALUES ('e811883c-5688-4a63-8d1d-cd601e7842d4', '4 - Agree', NULL, '4', NULL, '7961ce69-bfbd-4939-80ba-7595dc5e2973', '2025-07-11T05:54:56.637284+00:00', '2025-07-11T05:54:56.637284+00:00');
INSERT INTO answers (id, text, is_correct, marks, comment, question_id, created_at, updated_at) VALUES ('aa1a1cf9-7e45-43b1-a971-4f4e3b55e006', '1 - Strongly Disagree', NULL, '1', NULL, '7961ce69-bfbd-4939-80ba-7595dc5e2973', '2025-07-11T05:54:56.637284+00:00', '2025-07-11T05:54:56.637284+00:00');
INSERT INTO answers (id, text, is_correct, marks, comment, question_id, created_at, updated_at) VALUES ('5312778e-aded-4022-964d-60f9c00852fc', '2 - Disagree', NULL, '2', NULL, '7961ce69-bfbd-4939-80ba-7595dc5e2973', '2025-07-11T05:54:56.637284+00:00', '2025-07-11T05:54:56.637284+00:00');
INSERT INTO answers (id, text, is_correct, marks, comment, question_id, created_at, updated_at) VALUES ('d1b18af9-11b6-422c-ad54-2b0974eaf010', '5 - Strongly Agree', NULL, '5', NULL, '7961ce69-bfbd-4939-80ba-7595dc5e2973', '2025-07-11T05:54:56.637284+00:00', '2025-07-11T05:54:56.637284+00:00');
INSERT INTO answers (id, text, is_correct, marks, comment, question_id, created_at, updated_at) VALUES ('4ba1a241-ccdb-4bff-8d03-168411fa19f9', '3 - Neutral', NULL, '3', NULL, '7961ce69-bfbd-4939-80ba-7595dc5e2973', '2025-07-11T05:54:56.637284+00:00', '2025-07-11T05:54:56.637284+00:00');
INSERT INTO answers (id, text, is_correct, marks, comment, question_id, created_at, updated_at) VALUES ('ad09e003-2b99-42ec-a079-24b9c41eae23', 'Yes', NULL, '1', NULL, '7ae9382b-5c28-4849-84f0-8f11e1d80f7c', '2025-07-11T06:07:08.000976+00:00', '2025-07-11T06:07:08.000976+00:00');
INSERT INTO answers (id, text, is_correct, marks, comment, question_id, created_at, updated_at) VALUES ('fea562e5-4057-4317-851f-79ddc2938c87', 'No', NULL, '0', NULL, '7ae9382b-5c28-4849-84f0-8f11e1d80f7c', '2025-07-11T06:07:08.000976+00:00', '2025-07-11T06:07:08.000976+00:00');
INSERT INTO answers (id, text, is_correct, marks, comment, question_id, created_at, updated_at) VALUES ('d240fed6-5f73-46c4-8bbe-aaebbdbdb003', 'Yes', NULL, '1', NULL, '7ba1d578-2577-4d74-bc24-ccf83b1ecac1', '2025-07-11T06:07:12.970772+00:00', '2025-07-11T06:07:12.970772+00:00');
INSERT INTO answers (id, text, is_correct, marks, comment, question_id, created_at, updated_at) VALUES ('42ec65d7-3a64-4b65-9486-70c1465f4bbe', 'No', NULL, '0', NULL, '7ba1d578-2577-4d74-bc24-ccf83b1ecac1', '2025-07-11T06:07:12.970772+00:00', '2025-07-11T06:07:12.970772+00:00');
INSERT INTO answers (id, text, is_correct, marks, comment, question_id, created_at, updated_at) VALUES ('f812d05e-4979-443b-92e6-ee44bd381004', 'No', NULL, '0', NULL, '7c9c2b37-6e54-47d1-b861-c2beeb859c3d', '2025-07-11T06:07:09.494745+00:00', '2025-07-11T06:07:09.494745+00:00');
INSERT INTO answers (id, text, is_correct, marks, comment, question_id, created_at, updated_at) VALUES ('617aba9b-e3e3-45a9-a72c-32377ff96bf5', 'Yes', NULL, '1', NULL, '7c9c2b37-6e54-47d1-b861-c2beeb859c3d', '2025-07-11T06:07:09.494745+00:00', '2025-07-11T06:07:09.494745+00:00');
INSERT INTO answers (id, text, is_correct, marks, comment, question_id, created_at, updated_at) VALUES ('5c5da2ef-11c9-4992-9d02-f3a2a904e31f', 'Yes', NULL, '1', NULL, '829c2d28-d71d-4f42-aec2-608ca31d2c16', '2025-07-11T06:07:13.434224+00:00', '2025-07-11T06:07:13.434224+00:00');
INSERT INTO answers (id, text, is_correct, marks, comment, question_id, created_at, updated_at) VALUES ('890d597a-1610-4a9e-8985-1e336de552d6', 'No', NULL, '0', NULL, '829c2d28-d71d-4f42-aec2-608ca31d2c16', '2025-07-11T06:07:13.434224+00:00', '2025-07-11T06:07:13.434224+00:00');
INSERT INTO answers (id, text, is_correct, marks, comment, question_id, created_at, updated_at) VALUES ('0cbf169e-5fc2-464c-9bc6-e0fba9670400', 'No', NULL, '0', NULL, '83af3af1-e738-4d2e-b21c-d676abee51c0', '2025-07-11T06:07:10.554884+00:00', '2025-07-11T06:07:10.554884+00:00');
INSERT INTO answers (id, text, is_correct, marks, comment, question_id, created_at, updated_at) VALUES ('2e21ab9e-c7d1-43f4-9aa7-cab3ce3ca01c', 'Yes', NULL, '1', NULL, '83af3af1-e738-4d2e-b21c-d676abee51c0', '2025-07-11T06:07:10.554884+00:00', '2025-07-11T06:07:10.554884+00:00');
INSERT INTO answers (id, text, is_correct, marks, comment, question_id, created_at, updated_at) VALUES ('25224d0c-addf-4adb-92cb-055c9b2d0d25', 'Strongly disagree', NULL, '1', NULL, '84721c51-ae06-4b6a-9ead-629e21d9e865', '2025-07-11T08:45:47.932987+00:00', '2025-07-11T08:45:47.932987+00:00');
INSERT INTO answers (id, text, is_correct, marks, comment, question_id, created_at, updated_at) VALUES ('3c99d089-4c85-40a8-bc52-5c34464815d7', 'Strongly agree', NULL, '5', NULL, '84721c51-ae06-4b6a-9ead-629e21d9e865', '2025-07-11T08:45:47.932987+00:00', '2025-07-11T08:45:47.932987+00:00');
INSERT INTO answers (id, text, is_correct, marks, comment, question_id, created_at, updated_at) VALUES ('d5dded37-a35b-4825-8508-af23c159fe75', 'Agree', NULL, '4', NULL, '84721c51-ae06-4b6a-9ead-629e21d9e865', '2025-07-11T08:45:47.932987+00:00', '2025-07-11T08:45:47.932987+00:00');
INSERT INTO answers (id, text, is_correct, marks, comment, question_id, created_at, updated_at) VALUES ('372b70b6-5f2b-483b-b6d0-645cc0e31020', 'Neutral', NULL, '3', NULL, '84721c51-ae06-4b6a-9ead-629e21d9e865', '2025-07-11T08:45:47.932987+00:00', '2025-07-11T08:45:47.932987+00:00');
INSERT INTO answers (id, text, is_correct, marks, comment, question_id, created_at, updated_at) VALUES ('06512c32-fb49-43b4-8aaf-1f86ce309e9f', 'Disagree', NULL, '2', NULL, '84721c51-ae06-4b6a-9ead-629e21d9e865', '2025-07-11T08:45:47.932987+00:00', '2025-07-11T08:45:47.932987+00:00');
INSERT INTO answers (id, text, is_correct, marks, comment, question_id, created_at, updated_at) VALUES ('3beaa0d6-5428-41a4-9831-5ede99d7bd14', 'Disagree', NULL, '2', NULL, '85217336-c206-4ce5-a44a-cfd3058e0f19', '2025-07-11T08:45:48.829034+00:00', '2025-07-11T08:45:48.829034+00:00');
INSERT INTO answers (id, text, is_correct, marks, comment, question_id, created_at, updated_at) VALUES ('9979d56d-7215-4899-9b71-25a6b6fea29f', 'Strongly agree', NULL, '5', NULL, '85217336-c206-4ce5-a44a-cfd3058e0f19', '2025-07-11T08:45:48.829034+00:00', '2025-07-11T08:45:48.829034+00:00');
INSERT INTO answers (id, text, is_correct, marks, comment, question_id, created_at, updated_at) VALUES ('3f4e0ddd-5a40-4526-bbae-19b405e01e8c', 'Agree', NULL, '4', NULL, '85217336-c206-4ce5-a44a-cfd3058e0f19', '2025-07-11T08:45:48.829034+00:00', '2025-07-11T08:45:48.829034+00:00');
INSERT INTO answers (id, text, is_correct, marks, comment, question_id, created_at, updated_at) VALUES ('324480f7-4a41-47cb-95d9-9ab2e0b19334', 'Neutral', NULL, '3', NULL, '85217336-c206-4ce5-a44a-cfd3058e0f19', '2025-07-11T08:45:48.829034+00:00', '2025-07-11T08:45:48.829034+00:00');
INSERT INTO answers (id, text, is_correct, marks, comment, question_id, created_at, updated_at) VALUES ('f7260e8a-9254-47c1-8c28-ab80c1c7323b', 'Strongly disagree', NULL, '1', NULL, '85217336-c206-4ce5-a44a-cfd3058e0f19', '2025-07-11T08:45:48.829034+00:00', '2025-07-11T08:45:48.829034+00:00');
INSERT INTO answers (id, text, is_correct, marks, comment, question_id, created_at, updated_at) VALUES ('395b3788-5274-4cc5-b044-e97c6a11dd82', 'Every 3+ years', NULL, '2', NULL, '8736c8a9-5756-4944-bf25-6f76444cb5d7', '2025-07-11T08:45:43.483122+00:00', '2025-07-11T08:45:43.483122+00:00');
INSERT INTO answers (id, text, is_correct, marks, comment, question_id, created_at, updated_at) VALUES ('251657fe-9eeb-4985-9e5f-4e090b19cea2', 'Annually', NULL, '4', NULL, '8736c8a9-5756-4944-bf25-6f76444cb5d7', '2025-07-11T08:45:43.483122+00:00', '2025-07-11T08:45:43.483122+00:00');
INSERT INTO answers (id, text, is_correct, marks, comment, question_id, created_at, updated_at) VALUES ('220f5144-d56e-4b02-958f-f3629b6d1cba', 'Every 2–3 years', NULL, '3', NULL, '8736c8a9-5756-4944-bf25-6f76444cb5d7', '2025-07-11T08:45:43.483122+00:00', '2025-07-11T08:45:43.483122+00:00');
INSERT INTO answers (id, text, is_correct, marks, comment, question_id, created_at, updated_at) VALUES ('a35cda6b-dbc7-4f3a-8f76-c85bf024e212', 'Semi-annually or more', NULL, '5', NULL, '8736c8a9-5756-4944-bf25-6f76444cb5d7', '2025-07-11T08:45:43.483122+00:00', '2025-07-11T08:45:43.483122+00:00');
INSERT INTO answers (id, text, is_correct, marks, comment, question_id, created_at, updated_at) VALUES ('1dee7c9d-ead0-48db-aa55-4ed4ca188a3b', 'Never', NULL, '1', NULL, '8736c8a9-5756-4944-bf25-6f76444cb5d7', '2025-07-11T08:45:43.483122+00:00', '2025-07-11T08:45:43.483122+00:00');
INSERT INTO answers (id, text, is_correct, marks, comment, question_id, created_at, updated_at) VALUES ('367decda-96ac-476b-b8c4-cd4b08fc2793', '2 - Disagree', NULL, '2', NULL, '887af4d3-5719-447a-add7-ba742d3fc50b', '2025-07-11T05:54:49.547557+00:00', '2025-07-11T05:54:49.547557+00:00');
INSERT INTO answers (id, text, is_correct, marks, comment, question_id, created_at, updated_at) VALUES ('f2649c06-149e-4405-9934-12837a34a7a7', '1 - Strongly Disagree', NULL, '1', NULL, '887af4d3-5719-447a-add7-ba742d3fc50b', '2025-07-11T05:54:49.547557+00:00', '2025-07-11T05:54:49.547557+00:00');
INSERT INTO answers (id, text, is_correct, marks, comment, question_id, created_at, updated_at) VALUES ('26d23f0a-336c-4e72-84fd-78f961ec6383', '3 - Neutral', NULL, '3', NULL, '887af4d3-5719-447a-add7-ba742d3fc50b', '2025-07-11T05:54:49.547557+00:00', '2025-07-11T05:54:49.547557+00:00');
INSERT INTO answers (id, text, is_correct, marks, comment, question_id, created_at, updated_at) VALUES ('9f6b2e21-8746-45cb-9b22-702f0c0c4ada', '4 - Agree', NULL, '4', NULL, '887af4d3-5719-447a-add7-ba742d3fc50b', '2025-07-11T05:54:49.547557+00:00', '2025-07-11T05:54:49.547557+00:00');
INSERT INTO answers (id, text, is_correct, marks, comment, question_id, created_at, updated_at) VALUES ('00256892-c4a0-4f16-87f7-f2c7c74b64fd', '5 - Strongly Agree', NULL, '5', NULL, '887af4d3-5719-447a-add7-ba742d3fc50b', '2025-07-11T05:54:49.547557+00:00', '2025-07-11T05:54:49.547557+00:00');
INSERT INTO answers (id, text, is_correct, marks, comment, question_id, created_at, updated_at) VALUES ('688d8295-0c43-4da6-8ad7-388fe699239d', 'Neutral', NULL, '3', NULL, '8a411b27-383e-4976-94e2-9a1e949089c4', '2025-07-11T08:45:45.633298+00:00', '2025-07-11T08:45:45.633298+00:00');
INSERT INTO answers (id, text, is_correct, marks, comment, question_id, created_at, updated_at) VALUES ('abab8255-4334-41fc-ad67-39743a810945', 'Strongly agree', NULL, '5', NULL, '8a411b27-383e-4976-94e2-9a1e949089c4', '2025-07-11T08:45:45.633298+00:00', '2025-07-11T08:45:45.633298+00:00');
INSERT INTO answers (id, text, is_correct, marks, comment, question_id, created_at, updated_at) VALUES ('7718a2d0-3ac6-4ce5-ad4b-977fb1eaa8c6', 'Agree', NULL, '4', NULL, '8a411b27-383e-4976-94e2-9a1e949089c4', '2025-07-11T08:45:45.633298+00:00', '2025-07-11T08:45:45.633298+00:00');
INSERT INTO answers (id, text, is_correct, marks, comment, question_id, created_at, updated_at) VALUES ('28822708-34ea-414d-9281-cdfc74be81db', 'Strongly disagree', NULL, '1', NULL, '8a411b27-383e-4976-94e2-9a1e949089c4', '2025-07-11T08:45:45.633298+00:00', '2025-07-11T08:45:45.633298+00:00');
INSERT INTO answers (id, text, is_correct, marks, comment, question_id, created_at, updated_at) VALUES ('7062baf1-093d-44b9-a4eb-a52d1136a909', 'Disagree', NULL, '2', NULL, '8a411b27-383e-4976-94e2-9a1e949089c4', '2025-07-11T08:45:45.633298+00:00', '2025-07-11T08:45:45.633298+00:00');
INSERT INTO answers (id, text, is_correct, marks, comment, question_id, created_at, updated_at) VALUES ('6f3f8edc-b736-4bb0-ade7-38eaf6101297', 'No', NULL, '0', NULL, '8aabf314-4ca7-4647-803a-0bf7649adb3e', '2025-07-11T06:07:08.925473+00:00', '2025-07-11T06:07:08.925473+00:00');
INSERT INTO answers (id, text, is_correct, marks, comment, question_id, created_at, updated_at) VALUES ('569dd20b-8be1-4382-a956-20ebe90a1310', 'Yes', NULL, '1', NULL, '8aabf314-4ca7-4647-803a-0bf7649adb3e', '2025-07-11T06:07:08.925473+00:00', '2025-07-11T06:07:08.925473+00:00');
INSERT INTO answers (id, text, is_correct, marks, comment, question_id, created_at, updated_at) VALUES ('5f187338-b2b9-4a29-87d6-52d8eeeccabb', 'Neutral', NULL, '3', NULL, '8ddec58b-8ea1-4f44-9218-8b45dccea97d', '2025-07-11T08:45:43.834897+00:00', '2025-07-11T08:45:43.834897+00:00');
INSERT INTO answers (id, text, is_correct, marks, comment, question_id, created_at, updated_at) VALUES ('af80ed34-b2a2-4c6b-b16d-f0c14244d270', 'Disagree', NULL, '2', NULL, '8ddec58b-8ea1-4f44-9218-8b45dccea97d', '2025-07-11T08:45:43.834897+00:00', '2025-07-11T08:45:43.834897+00:00');
INSERT INTO answers (id, text, is_correct, marks, comment, question_id, created_at, updated_at) VALUES ('db2369f5-1f59-4e4f-a3c4-7942a772d6a4', 'Strongly disagree', NULL, '1', NULL, '8ddec58b-8ea1-4f44-9218-8b45dccea97d', '2025-07-11T08:45:43.834897+00:00', '2025-07-11T08:45:43.834897+00:00');
INSERT INTO answers (id, text, is_correct, marks, comment, question_id, created_at, updated_at) VALUES ('08fc8ec6-45b6-4d70-af29-a90c461a3041', 'Strongly agree', NULL, '5', NULL, '8ddec58b-8ea1-4f44-9218-8b45dccea97d', '2025-07-11T08:45:43.834897+00:00', '2025-07-11T08:45:43.834897+00:00');
INSERT INTO answers (id, text, is_correct, marks, comment, question_id, created_at, updated_at) VALUES ('2b2cbced-9ef4-423f-8418-fc01d8d056dc', 'Agree', NULL, '4', NULL, '8ddec58b-8ea1-4f44-9218-8b45dccea97d', '2025-07-11T08:45:43.834897+00:00', '2025-07-11T08:45:43.834897+00:00');
INSERT INTO answers (id, text, is_correct, marks, comment, question_id, created_at, updated_at) VALUES ('56153346-8475-46a9-a3c1-4e695269674a', 'Disagree', NULL, '2', NULL, '91963828-ad77-4e0b-a6ce-853907dcd6b0', '2025-07-11T08:45:44.153241+00:00', '2025-07-11T08:45:44.153241+00:00');
INSERT INTO answers (id, text, is_correct, marks, comment, question_id, created_at, updated_at) VALUES ('9c8f8f70-c1b1-4a31-bd89-b80eea767601', 'Neutral', NULL, '3', NULL, '91963828-ad77-4e0b-a6ce-853907dcd6b0', '2025-07-11T08:45:44.153241+00:00', '2025-07-11T08:45:44.153241+00:00');
INSERT INTO answers (id, text, is_correct, marks, comment, question_id, created_at, updated_at) VALUES ('25b492b5-1d59-4c1b-8781-566c59d7dbe2', 'Agree', NULL, '4', NULL, '91963828-ad77-4e0b-a6ce-853907dcd6b0', '2025-07-11T08:45:44.153241+00:00', '2025-07-11T08:45:44.153241+00:00');
INSERT INTO answers (id, text, is_correct, marks, comment, question_id, created_at, updated_at) VALUES ('60a818dd-f68e-42a7-928a-dbc9b722f67b', 'Strongly agree', NULL, '5', NULL, '91963828-ad77-4e0b-a6ce-853907dcd6b0', '2025-07-11T08:45:44.153241+00:00', '2025-07-11T08:45:44.153241+00:00');
INSERT INTO answers (id, text, is_correct, marks, comment, question_id, created_at, updated_at) VALUES ('cebc9345-f14b-405b-9842-623bbcda7123', 'Strongly disagree', NULL, '1', NULL, '91963828-ad77-4e0b-a6ce-853907dcd6b0', '2025-07-11T08:45:44.153241+00:00', '2025-07-11T08:45:44.153241+00:00');
INSERT INTO answers (id, text, is_correct, marks, comment, question_id, created_at, updated_at) VALUES ('d5378650-618f-444b-ab2b-c610d5a08af4', 'Monthly', NULL, '4', NULL, '921ee964-de24-42de-bebd-290bcc62f402', '2025-07-11T08:45:47.716397+00:00', '2025-07-11T08:45:47.716397+00:00');
INSERT INTO answers (id, text, is_correct, marks, comment, question_id, created_at, updated_at) VALUES ('47a6c50a-ccdf-4075-9c27-8fb6dd360732', 'Quarterly', NULL, '3', NULL, '921ee964-de24-42de-bebd-290bcc62f402', '2025-07-11T08:45:47.716397+00:00', '2025-07-11T08:45:47.716397+00:00');
INSERT INTO answers (id, text, is_correct, marks, comment, question_id, created_at, updated_at) VALUES ('539d3792-d99d-4858-b745-0964d2210a8a', 'Annually', NULL, '2', NULL, '921ee964-de24-42de-bebd-290bcc62f402', '2025-07-11T08:45:47.716397+00:00', '2025-07-11T08:45:47.716397+00:00');
INSERT INTO answers (id, text, is_correct, marks, comment, question_id, created_at, updated_at) VALUES ('a7c04e9c-bf35-4d6e-9698-b08cb64e5b4b', 'Never', NULL, '1', NULL, '921ee964-de24-42de-bebd-290bcc62f402', '2025-07-11T08:45:47.716397+00:00', '2025-07-11T08:45:47.716397+00:00');
INSERT INTO answers (id, text, is_correct, marks, comment, question_id, created_at, updated_at) VALUES ('b1a132a5-4c58-4344-a562-bc269a52229d', 'As per policy', NULL, '5', NULL, '921ee964-de24-42de-bebd-290bcc62f402', '2025-07-11T08:45:47.716397+00:00', '2025-07-11T08:45:47.716397+00:00');
INSERT INTO answers (id, text, is_correct, marks, comment, question_id, created_at, updated_at) VALUES ('ec8062bb-305a-4c61-90a2-4d345f145a34', '4 - Agree', NULL, '4', NULL, '9349255e-42a5-4402-9908-f1bdb6cefa19', '2025-07-11T05:54:51.877855+00:00', '2025-07-11T05:54:51.877855+00:00');
INSERT INTO answers (id, text, is_correct, marks, comment, question_id, created_at, updated_at) VALUES ('30d8fef1-6d25-429a-bbcf-62faedb2b418', '1 - Strongly Disagree', NULL, '1', NULL, '9349255e-42a5-4402-9908-f1bdb6cefa19', '2025-07-11T05:54:51.877855+00:00', '2025-07-11T05:54:51.877855+00:00');
INSERT INTO answers (id, text, is_correct, marks, comment, question_id, created_at, updated_at) VALUES ('86485b71-d669-498f-96a2-f048efb12ff5', '2 - Disagree', NULL, '2', NULL, '9349255e-42a5-4402-9908-f1bdb6cefa19', '2025-07-11T05:54:51.877855+00:00', '2025-07-11T05:54:51.877855+00:00');
INSERT INTO answers (id, text, is_correct, marks, comment, question_id, created_at, updated_at) VALUES ('6a0bdf84-f66e-45cd-bd9b-ac317aa50e16', '3 - Neutral', NULL, '3', NULL, '9349255e-42a5-4402-9908-f1bdb6cefa19', '2025-07-11T05:54:51.877855+00:00', '2025-07-11T05:54:51.877855+00:00');
INSERT INTO answers (id, text, is_correct, marks, comment, question_id, created_at, updated_at) VALUES ('5f20e4b6-8b0b-415d-8b8b-c94b08e11121', '5 - Strongly Agree', NULL, '5', NULL, '9349255e-42a5-4402-9908-f1bdb6cefa19', '2025-07-11T05:54:51.877855+00:00', '2025-07-11T05:54:51.877855+00:00');
INSERT INTO answers (id, text, is_correct, marks, comment, question_id, created_at, updated_at) VALUES ('9b539130-868c-4c8f-9173-d5c60838d60c', '4 - Agree', NULL, '4', NULL, '935b1db9-4b31-42de-980c-660dafdb2a42', '2025-07-11T05:54:48.168058+00:00', '2025-07-11T05:54:48.168058+00:00');
INSERT INTO answers (id, text, is_correct, marks, comment, question_id, created_at, updated_at) VALUES ('8292a4b6-99b0-48e2-8c1f-dac9f99163e9', '3 - Neutral', NULL, '3', NULL, '935b1db9-4b31-42de-980c-660dafdb2a42', '2025-07-11T05:54:48.168058+00:00', '2025-07-11T05:54:48.168058+00:00');
INSERT INTO answers (id, text, is_correct, marks, comment, question_id, created_at, updated_at) VALUES ('c4ba562e-1cbe-485c-a20c-f0f5cf71c63c', '5 - Strongly Agree', NULL, '5', NULL, '935b1db9-4b31-42de-980c-660dafdb2a42', '2025-07-11T05:54:48.168058+00:00', '2025-07-11T05:54:48.168058+00:00');
INSERT INTO answers (id, text, is_correct, marks, comment, question_id, created_at, updated_at) VALUES ('4dff7ba5-b3ac-4df0-8656-5967454323b1', '2 - Disagree', NULL, '2', NULL, '935b1db9-4b31-42de-980c-660dafdb2a42', '2025-07-11T05:54:48.168058+00:00', '2025-07-11T05:54:48.168058+00:00');
INSERT INTO answers (id, text, is_correct, marks, comment, question_id, created_at, updated_at) VALUES ('04702d76-9854-4de2-8886-558edb14fe52', '1 - Strongly Disagree', NULL, '1', NULL, '935b1db9-4b31-42de-980c-660dafdb2a42', '2025-07-11T05:54:48.168058+00:00', '2025-07-11T05:54:48.168058+00:00');
INSERT INTO answers (id, text, is_correct, marks, comment, question_id, created_at, updated_at) VALUES ('46da19e5-46bd-4492-a740-3d80aa7c706d', 'Yes', NULL, '1', NULL, '97a9cbc2-ebb4-4afd-b680-59f3cfd337bd', '2025-07-11T06:07:09.280604+00:00', '2025-07-11T06:07:09.280604+00:00');
INSERT INTO answers (id, text, is_correct, marks, comment, question_id, created_at, updated_at) VALUES ('f2153992-617c-4255-b088-e50fd9bd57c0', 'No', NULL, '0', NULL, '97a9cbc2-ebb4-4afd-b680-59f3cfd337bd', '2025-07-11T06:07:09.280604+00:00', '2025-07-11T06:07:09.280604+00:00');
INSERT INTO answers (id, text, is_correct, marks, comment, question_id, created_at, updated_at) VALUES ('a8c78fcc-01ec-4006-96e2-5e597b4ba152', '1 - Strongly Disagree', NULL, '1', NULL, '983171c9-3704-409c-921d-e12d565047c3', '2025-07-11T05:54:54.70789+00:00', '2025-07-11T05:54:54.70789+00:00');
INSERT INTO answers (id, text, is_correct, marks, comment, question_id, created_at, updated_at) VALUES ('e8283bce-24b9-473d-956c-229c7189003d', '2 - Disagree', NULL, '2', NULL, '983171c9-3704-409c-921d-e12d565047c3', '2025-07-11T05:54:54.70789+00:00', '2025-07-11T05:54:54.70789+00:00');
INSERT INTO answers (id, text, is_correct, marks, comment, question_id, created_at, updated_at) VALUES ('1ee2a511-742d-478e-9f42-c0166f020f62', '3 - Neutral', NULL, '3', NULL, '983171c9-3704-409c-921d-e12d565047c3', '2025-07-11T05:54:54.70789+00:00', '2025-07-11T05:54:54.70789+00:00');
INSERT INTO answers (id, text, is_correct, marks, comment, question_id, created_at, updated_at) VALUES ('b49da61a-35e5-4bc4-b714-f1a937f44ae3', '4 - Agree', NULL, '4', NULL, '983171c9-3704-409c-921d-e12d565047c3', '2025-07-11T05:54:54.70789+00:00', '2025-07-11T05:54:54.70789+00:00');
INSERT INTO answers (id, text, is_correct, marks, comment, question_id, created_at, updated_at) VALUES ('fa401f4b-0c74-4a2b-be3d-ecd4faa640b2', '5 - Strongly Agree', NULL, '5', NULL, '983171c9-3704-409c-921d-e12d565047c3', '2025-07-11T05:54:54.70789+00:00', '2025-07-11T05:54:54.70789+00:00');
INSERT INTO answers (id, text, is_correct, marks, comment, question_id, created_at, updated_at) VALUES ('eb2147b6-dd00-410f-a6c5-6b2cd176b188', '2 - Disagree', NULL, '2', NULL, '99912f8f-60cf-4b2f-85d6-197f5f881111', '2025-07-11T05:54:54.924228+00:00', '2025-07-11T05:54:54.924228+00:00');
INSERT INTO answers (id, text, is_correct, marks, comment, question_id, created_at, updated_at) VALUES ('056ed048-cd48-46e4-a089-0283a3d2bd5a', '3 - Neutral', NULL, '3', NULL, '99912f8f-60cf-4b2f-85d6-197f5f881111', '2025-07-11T05:54:54.924228+00:00', '2025-07-11T05:54:54.924228+00:00');
INSERT INTO answers (id, text, is_correct, marks, comment, question_id, created_at, updated_at) VALUES ('896a2601-7c85-4c3d-bd2f-aadbcd70754c', '4 - Agree', NULL, '4', NULL, '99912f8f-60cf-4b2f-85d6-197f5f881111', '2025-07-11T05:54:54.924228+00:00', '2025-07-11T05:54:54.924228+00:00');
INSERT INTO answers (id, text, is_correct, marks, comment, question_id, created_at, updated_at) VALUES ('290b4595-4a91-4310-9758-d84a55223ec8', '5 - Strongly Agree', NULL, '5', NULL, '99912f8f-60cf-4b2f-85d6-197f5f881111', '2025-07-11T05:54:54.924228+00:00', '2025-07-11T05:54:54.924228+00:00');
INSERT INTO answers (id, text, is_correct, marks, comment, question_id, created_at, updated_at) VALUES ('e7cc21e7-025e-457a-bd73-edf3e76ceb1e', '1 - Strongly Disagree', NULL, '1', NULL, '99912f8f-60cf-4b2f-85d6-197f5f881111', '2025-07-11T05:54:54.924228+00:00', '2025-07-11T05:54:54.924228+00:00');
INSERT INTO answers (id, text, is_correct, marks, comment, question_id, created_at, updated_at) VALUES ('5976f062-9c1f-4291-a3a2-f1753c35c07e', 'Strongly agree', NULL, '5', NULL, '9a0dc287-fb99-4679-862b-c3c9412e4414', '2025-07-11T08:45:49.460823+00:00', '2025-07-11T08:45:49.460823+00:00');
INSERT INTO answers (id, text, is_correct, marks, comment, question_id, created_at, updated_at) VALUES ('d5ddc614-1620-4fea-bd1b-efc426b670d5', 'Strongly disagree', NULL, '1', NULL, '9a0dc287-fb99-4679-862b-c3c9412e4414', '2025-07-11T08:45:49.460823+00:00', '2025-07-11T08:45:49.460823+00:00');
INSERT INTO answers (id, text, is_correct, marks, comment, question_id, created_at, updated_at) VALUES ('10be8aef-34dc-491a-b988-f0487e86680b', 'Neutral', NULL, '3', NULL, '9a0dc287-fb99-4679-862b-c3c9412e4414', '2025-07-11T08:45:49.460823+00:00', '2025-07-11T08:45:49.460823+00:00');
INSERT INTO answers (id, text, is_correct, marks, comment, question_id, created_at, updated_at) VALUES ('e2d1512b-d843-450b-a6a1-3e0c622f4c40', 'Agree', NULL, '4', NULL, '9a0dc287-fb99-4679-862b-c3c9412e4414', '2025-07-11T08:45:49.460823+00:00', '2025-07-11T08:45:49.460823+00:00');
INSERT INTO answers (id, text, is_correct, marks, comment, question_id, created_at, updated_at) VALUES ('905f9cfe-5403-4b36-8fcb-030b6d3ce9e0', 'Disagree', NULL, '2', NULL, '9a0dc287-fb99-4679-862b-c3c9412e4414', '2025-07-11T08:45:49.460823+00:00', '2025-07-11T08:45:49.460823+00:00');
INSERT INTO answers (id, text, is_correct, marks, comment, question_id, created_at, updated_at) VALUES ('e18a00fc-c092-476d-9850-947a9815ca7c', 'No', NULL, '0', NULL, '9d7b2206-a892-43ef-be5c-00b10839adae', '2025-07-11T06:07:09.71316+00:00', '2025-07-11T06:07:09.71316+00:00');
INSERT INTO answers (id, text, is_correct, marks, comment, question_id, created_at, updated_at) VALUES ('faf5e0e3-9bbc-4d3c-b41c-ff4d6c7492f1', 'Yes', NULL, '1', NULL, '9d7b2206-a892-43ef-be5c-00b10839adae', '2025-07-11T06:07:09.71316+00:00', '2025-07-11T06:07:09.71316+00:00');
INSERT INTO answers (id, text, is_correct, marks, comment, question_id, created_at, updated_at) VALUES ('8578dca1-0b2a-41a7-9641-8c8a375fd968', 'No', NULL, '0', NULL, '9f253d01-0c3b-4c35-83f1-11e9a92f5f68', '2025-07-11T06:07:16.076165+00:00', '2025-07-11T06:07:16.076165+00:00');
INSERT INTO answers (id, text, is_correct, marks, comment, question_id, created_at, updated_at) VALUES ('ae7d5d99-3f49-4c37-aec3-7548104b7ee1', 'Yes', NULL, '1', NULL, '9f253d01-0c3b-4c35-83f1-11e9a92f5f68', '2025-07-11T06:07:16.076165+00:00', '2025-07-11T06:07:16.076165+00:00');
INSERT INTO answers (id, text, is_correct, marks, comment, question_id, created_at, updated_at) VALUES ('a995f7c3-1e0c-45b3-9667-e2d68001c865', '4 - Agree', NULL, '4', NULL, 'a06ac0e8-0d63-4b1f-89f8-de412a60005f', '2025-07-11T05:54:57.277336+00:00', '2025-07-11T05:54:57.277336+00:00');
INSERT INTO answers (id, text, is_correct, marks, comment, question_id, created_at, updated_at) VALUES ('a32e189f-cd8d-46d2-9dd6-05f6e7a8842d', '3 - Neutral', NULL, '3', NULL, 'a06ac0e8-0d63-4b1f-89f8-de412a60005f', '2025-07-11T05:54:57.277336+00:00', '2025-07-11T05:54:57.277336+00:00');
INSERT INTO answers (id, text, is_correct, marks, comment, question_id, created_at, updated_at) VALUES ('b7b2e8df-4908-4270-bd95-b7d8f21fb310', '1 - Strongly Disagree', NULL, '1', NULL, 'a06ac0e8-0d63-4b1f-89f8-de412a60005f', '2025-07-11T05:54:57.277336+00:00', '2025-07-11T05:54:57.277336+00:00');
INSERT INTO answers (id, text, is_correct, marks, comment, question_id, created_at, updated_at) VALUES ('e9d613f0-9ea4-4d34-b471-9d89a1786370', '5 - Strongly Agree', NULL, '5', NULL, 'a06ac0e8-0d63-4b1f-89f8-de412a60005f', '2025-07-11T05:54:57.277336+00:00', '2025-07-11T05:54:57.277336+00:00');
INSERT INTO answers (id, text, is_correct, marks, comment, question_id, created_at, updated_at) VALUES ('627eaa4a-e465-44ca-8de8-d924e4fcebd6', '2 - Disagree', NULL, '2', NULL, 'a06ac0e8-0d63-4b1f-89f8-de412a60005f', '2025-07-11T05:54:57.277336+00:00', '2025-07-11T05:54:57.277336+00:00');
INSERT INTO answers (id, text, is_correct, marks, comment, question_id, created_at, updated_at) VALUES ('5fab0c47-2c8c-4322-b015-43f94df7339d', 'Annually', NULL, '2', NULL, 'a4bd2121-f5e6-4db4-9194-b4de389b5d0a', '2025-07-11T08:45:50.69957+00:00', '2025-07-11T08:45:50.69957+00:00');
INSERT INTO answers (id, text, is_correct, marks, comment, question_id, created_at, updated_at) VALUES ('0e04f8b6-e170-4565-ae36-18c65882eb93', 'Never', NULL, '1', NULL, 'a4bd2121-f5e6-4db4-9194-b4de389b5d0a', '2025-07-11T08:45:50.69957+00:00', '2025-07-11T08:45:50.69957+00:00');
INSERT INTO answers (id, text, is_correct, marks, comment, question_id, created_at, updated_at) VALUES ('2d095664-8a98-4a2c-b837-c52182c4512d', 'Quarterly', NULL, '3', NULL, 'a4bd2121-f5e6-4db4-9194-b4de389b5d0a', '2025-07-11T08:45:50.69957+00:00', '2025-07-11T08:45:50.69957+00:00');
INSERT INTO answers (id, text, is_correct, marks, comment, question_id, created_at, updated_at) VALUES ('115ce855-1f49-462e-bdb7-c765d5230055', 'Monthly', NULL, '4', NULL, 'a4bd2121-f5e6-4db4-9194-b4de389b5d0a', '2025-07-11T08:45:50.69957+00:00', '2025-07-11T08:45:50.69957+00:00');
INSERT INTO answers (id, text, is_correct, marks, comment, question_id, created_at, updated_at) VALUES ('b6f6b864-491e-4483-b8fa-63de47f77748', 'With every major change', NULL, '5', NULL, 'a4bd2121-f5e6-4db4-9194-b4de389b5d0a', '2025-07-11T08:45:50.69957+00:00', '2025-07-11T08:45:50.69957+00:00');
INSERT INTO answers (id, text, is_correct, marks, comment, question_id, created_at, updated_at) VALUES ('9c378700-578b-4147-8f3b-8ba71d337aae', '4 - Agree', NULL, '4', NULL, 'a5d02704-966e-48e5-8550-b82e8421f286', '2025-07-11T05:54:54.489746+00:00', '2025-07-11T05:54:54.489746+00:00');
INSERT INTO answers (id, text, is_correct, marks, comment, question_id, created_at, updated_at) VALUES ('25cbacd2-f4f1-4126-98b8-37f7a22c35f0', '5 - Strongly Agree', NULL, '5', NULL, 'a5d02704-966e-48e5-8550-b82e8421f286', '2025-07-11T05:54:54.489746+00:00', '2025-07-11T05:54:54.489746+00:00');
INSERT INTO answers (id, text, is_correct, marks, comment, question_id, created_at, updated_at) VALUES ('5c7d126f-1360-4bc4-99d3-06230c4bfcef', '3 - Neutral', NULL, '3', NULL, 'a5d02704-966e-48e5-8550-b82e8421f286', '2025-07-11T05:54:54.489746+00:00', '2025-07-11T05:54:54.489746+00:00');
INSERT INTO answers (id, text, is_correct, marks, comment, question_id, created_at, updated_at) VALUES ('5ff734a6-88c7-4cf6-a1fa-142871d1b7b9', '1 - Strongly Disagree', NULL, '1', NULL, 'a5d02704-966e-48e5-8550-b82e8421f286', '2025-07-11T05:54:54.489746+00:00', '2025-07-11T05:54:54.489746+00:00');
INSERT INTO answers (id, text, is_correct, marks, comment, question_id, created_at, updated_at) VALUES ('002cc6d6-bc63-4c2e-8b25-6fd1e3f633b1', '2 - Disagree', NULL, '2', NULL, 'a5d02704-966e-48e5-8550-b82e8421f286', '2025-07-11T05:54:54.489746+00:00', '2025-07-11T05:54:54.489746+00:00');
INSERT INTO answers (id, text, is_correct, marks, comment, question_id, created_at, updated_at) VALUES ('7d420d62-ff57-41b0-90f7-c7833309e24c', 'No', NULL, '0', NULL, 'a87680b7-9f29-472e-b02d-68e5290d1897', '2025-07-11T06:07:12.638491+00:00', '2025-07-11T06:07:12.638491+00:00');
INSERT INTO answers (id, text, is_correct, marks, comment, question_id, created_at, updated_at) VALUES ('5b8b3374-e14e-4dd6-8e9d-f7c2dad1289d', 'Yes', NULL, '1', NULL, 'a87680b7-9f29-472e-b02d-68e5290d1897', '2025-07-11T06:07:12.638491+00:00', '2025-07-11T06:07:12.638491+00:00');
INSERT INTO answers (id, text, is_correct, marks, comment, question_id, created_at, updated_at) VALUES ('64cfd0f1-4073-4382-82d9-2d6b2c7d4fbe', '5 - Strongly Agree', NULL, '5', NULL, 'aa8cb043-3471-4287-b927-ba5f7cfad6f9', '2025-07-11T05:54:55.466481+00:00', '2025-07-11T05:54:55.466481+00:00');
INSERT INTO answers (id, text, is_correct, marks, comment, question_id, created_at, updated_at) VALUES ('0d099dc3-c672-48ca-b9ae-d2ed64c972b4', '4 - Agree', NULL, '4', NULL, 'aa8cb043-3471-4287-b927-ba5f7cfad6f9', '2025-07-11T05:54:55.466481+00:00', '2025-07-11T05:54:55.466481+00:00');
INSERT INTO answers (id, text, is_correct, marks, comment, question_id, created_at, updated_at) VALUES ('dff1e65d-e24f-4d4a-901d-8cc1f86851c3', '3 - Neutral', NULL, '3', NULL, 'aa8cb043-3471-4287-b927-ba5f7cfad6f9', '2025-07-11T05:54:55.466481+00:00', '2025-07-11T05:54:55.466481+00:00');
INSERT INTO answers (id, text, is_correct, marks, comment, question_id, created_at, updated_at) VALUES ('6806b31d-9ba6-4a3d-b7bc-18862d76d2a6', '2 - Disagree', NULL, '2', NULL, 'aa8cb043-3471-4287-b927-ba5f7cfad6f9', '2025-07-11T05:54:55.466481+00:00', '2025-07-11T05:54:55.466481+00:00');
INSERT INTO answers (id, text, is_correct, marks, comment, question_id, created_at, updated_at) VALUES ('761240e8-48e9-4aea-86e1-4f6ca7d9ca38', '1 - Strongly Disagree', NULL, '1', NULL, 'aa8cb043-3471-4287-b927-ba5f7cfad6f9', '2025-07-11T05:54:55.466481+00:00', '2025-07-11T05:54:55.466481+00:00');
INSERT INTO answers (id, text, is_correct, marks, comment, question_id, created_at, updated_at) VALUES ('798736ba-ece2-4090-b308-6c2c9963d8b1', '1 - Strongly Disagree', NULL, '1', NULL, 'adb38226-417c-4653-824e-9992b3630190', '2025-07-11T05:54:47.821531+00:00', '2025-07-11T05:54:47.821531+00:00');
INSERT INTO answers (id, text, is_correct, marks, comment, question_id, created_at, updated_at) VALUES ('6fef0458-1d90-48f4-91d6-4ec4a3508b90', '5 - Strongly Agree', NULL, '5', NULL, 'adb38226-417c-4653-824e-9992b3630190', '2025-07-11T05:54:47.821531+00:00', '2025-07-11T05:54:47.821531+00:00');
INSERT INTO answers (id, text, is_correct, marks, comment, question_id, created_at, updated_at) VALUES ('b68d7078-cd15-4cda-8563-3a202606a642', '4 - Agree', NULL, '4', NULL, 'adb38226-417c-4653-824e-9992b3630190', '2025-07-11T05:54:47.821531+00:00', '2025-07-11T05:54:47.821531+00:00');
INSERT INTO answers (id, text, is_correct, marks, comment, question_id, created_at, updated_at) VALUES ('9595f41c-970f-4ff2-9ef2-82d1c6beedeb', '3 - Neutral', NULL, '3', NULL, 'adb38226-417c-4653-824e-9992b3630190', '2025-07-11T05:54:47.821531+00:00', '2025-07-11T05:54:47.821531+00:00');
INSERT INTO answers (id, text, is_correct, marks, comment, question_id, created_at, updated_at) VALUES ('deeae7c2-4413-430e-bee7-a3e2c9535cc2', '2 - Disagree', NULL, '2', NULL, 'adb38226-417c-4653-824e-9992b3630190', '2025-07-11T05:54:47.821531+00:00', '2025-07-11T05:54:47.821531+00:00');
INSERT INTO answers (id, text, is_correct, marks, comment, question_id, created_at, updated_at) VALUES ('e34dc51a-b529-447e-a19a-1da093cf4b1a', 'Agree', NULL, '4', NULL, 'af8131f2-0279-45a8-8d47-fcdb1a8f60ca', '2025-07-11T08:45:44.768013+00:00', '2025-07-11T08:45:44.768013+00:00');
INSERT INTO answers (id, text, is_correct, marks, comment, question_id, created_at, updated_at) VALUES ('4dab15e0-f69c-4b14-83d9-f39ecb8b118e', 'Strongly disagree', NULL, '1', NULL, 'af8131f2-0279-45a8-8d47-fcdb1a8f60ca', '2025-07-11T08:45:44.768013+00:00', '2025-07-11T08:45:44.768013+00:00');
INSERT INTO answers (id, text, is_correct, marks, comment, question_id, created_at, updated_at) VALUES ('b2b7e759-7547-4680-9b92-aa39e89e699d', 'Disagree', NULL, '2', NULL, 'af8131f2-0279-45a8-8d47-fcdb1a8f60ca', '2025-07-11T08:45:44.768013+00:00', '2025-07-11T08:45:44.768013+00:00');
INSERT INTO answers (id, text, is_correct, marks, comment, question_id, created_at, updated_at) VALUES ('f9520414-4269-4647-a56a-b63817973cdc', 'Neutral', NULL, '3', NULL, 'af8131f2-0279-45a8-8d47-fcdb1a8f60ca', '2025-07-11T08:45:44.768013+00:00', '2025-07-11T08:45:44.768013+00:00');
INSERT INTO answers (id, text, is_correct, marks, comment, question_id, created_at, updated_at) VALUES ('ecd87eef-9a93-430d-9cf2-6e67fa8a9667', 'Strongly agree', NULL, '5', NULL, 'af8131f2-0279-45a8-8d47-fcdb1a8f60ca', '2025-07-11T08:45:44.768013+00:00', '2025-07-11T08:45:44.768013+00:00');
INSERT INTO answers (id, text, is_correct, marks, comment, question_id, created_at, updated_at) VALUES ('f0090b2f-7d28-4d1e-bef9-0d72798353fb', 'No', NULL, '0', NULL, 'b180ca28-3626-433d-8c24-6739407a11ce', '2025-07-11T06:07:10.084275+00:00', '2025-07-11T06:07:10.084275+00:00');
INSERT INTO answers (id, text, is_correct, marks, comment, question_id, created_at, updated_at) VALUES ('b6ef83fe-6b32-4d76-8155-5204d2e5966f', 'Yes', NULL, '1', NULL, 'b180ca28-3626-433d-8c24-6739407a11ce', '2025-07-11T06:07:10.084275+00:00', '2025-07-11T06:07:10.084275+00:00');
INSERT INTO answers (id, text, is_correct, marks, comment, question_id, created_at, updated_at) VALUES ('33bc0a29-ff2c-4add-ae7c-ad5ee2466a23', 'No', NULL, '0', NULL, 'b63a2163-d5b1-466f-bb95-95ba41c7f0bb', '2025-07-11T06:07:16.492406+00:00', '2025-07-11T06:07:16.492406+00:00');
INSERT INTO answers (id, text, is_correct, marks, comment, question_id, created_at, updated_at) VALUES ('f33d1126-e42f-4362-8526-e0b644c3d455', 'Yes', NULL, '1', NULL, 'b63a2163-d5b1-466f-bb95-95ba41c7f0bb', '2025-07-11T06:07:16.492406+00:00', '2025-07-11T06:07:16.492406+00:00');
INSERT INTO answers (id, text, is_correct, marks, comment, question_id, created_at, updated_at) VALUES ('38babeed-e3eb-45b7-9791-8d9bf3c5bb70', 'No', NULL, '0', NULL, 'ba9a20f2-e99f-4bc8-924b-c055e9014686', '2025-07-11T06:07:10.335877+00:00', '2025-07-11T06:07:10.335877+00:00');
INSERT INTO answers (id, text, is_correct, marks, comment, question_id, created_at, updated_at) VALUES ('ba82fc11-2d45-4e14-9569-c54999125dca', 'Yes', NULL, '1', NULL, 'ba9a20f2-e99f-4bc8-924b-c055e9014686', '2025-07-11T06:07:10.335877+00:00', '2025-07-11T06:07:10.335877+00:00');
INSERT INTO answers (id, text, is_correct, marks, comment, question_id, created_at, updated_at) VALUES ('07318161-c71d-45fa-bd99-19188c38c313', 'Strongly agree', NULL, '5', NULL, 'bb4b36a6-5439-4f40-8c33-d66ee8696d15', '2025-07-11T08:45:44.966097+00:00', '2025-07-11T08:45:44.966097+00:00');
INSERT INTO answers (id, text, is_correct, marks, comment, question_id, created_at, updated_at) VALUES ('90ac0eef-75f2-41b3-a54b-3ebd417a15cd', 'Agree', NULL, '4', NULL, 'bb4b36a6-5439-4f40-8c33-d66ee8696d15', '2025-07-11T08:45:44.966097+00:00', '2025-07-11T08:45:44.966097+00:00');
INSERT INTO answers (id, text, is_correct, marks, comment, question_id, created_at, updated_at) VALUES ('d1b9fb66-c836-4969-8e16-30e7974cf61c', 'Neutral', NULL, '3', NULL, 'bb4b36a6-5439-4f40-8c33-d66ee8696d15', '2025-07-11T08:45:44.966097+00:00', '2025-07-11T08:45:44.966097+00:00');
INSERT INTO answers (id, text, is_correct, marks, comment, question_id, created_at, updated_at) VALUES ('1f862f82-03a3-40ee-89a2-0c672089265b', 'Disagree', NULL, '2', NULL, 'bb4b36a6-5439-4f40-8c33-d66ee8696d15', '2025-07-11T08:45:44.966097+00:00', '2025-07-11T08:45:44.966097+00:00');
INSERT INTO answers (id, text, is_correct, marks, comment, question_id, created_at, updated_at) VALUES ('b87c1705-e307-4441-baa4-1fd578a0f7f0', 'Strongly disagree', NULL, '1', NULL, 'bb4b36a6-5439-4f40-8c33-d66ee8696d15', '2025-07-11T08:45:44.966097+00:00', '2025-07-11T08:45:44.966097+00:00');
INSERT INTO answers (id, text, is_correct, marks, comment, question_id, created_at, updated_at) VALUES ('cb55e2f9-1a76-4f56-90fb-87103b536285', 'Strongly disagree', NULL, '1', NULL, 'bf1b858a-81ef-40aa-8e59-85d6e9812908', '2025-07-11T08:45:47.078184+00:00', '2025-07-11T08:45:47.078184+00:00');
INSERT INTO answers (id, text, is_correct, marks, comment, question_id, created_at, updated_at) VALUES ('f0fb67bd-ca17-4166-986d-1f3158abc21a', 'Strongly agree', NULL, '5', NULL, 'bf1b858a-81ef-40aa-8e59-85d6e9812908', '2025-07-11T08:45:47.078184+00:00', '2025-07-11T08:45:47.078184+00:00');
INSERT INTO answers (id, text, is_correct, marks, comment, question_id, created_at, updated_at) VALUES ('6e1416ad-0794-4654-989e-6113245a990b', 'Agree', NULL, '4', NULL, 'bf1b858a-81ef-40aa-8e59-85d6e9812908', '2025-07-11T08:45:47.078184+00:00', '2025-07-11T08:45:47.078184+00:00');
INSERT INTO answers (id, text, is_correct, marks, comment, question_id, created_at, updated_at) VALUES ('edfc4dc1-6e52-4110-ac8c-54b24a1b74b3', 'Neutral', NULL, '3', NULL, 'bf1b858a-81ef-40aa-8e59-85d6e9812908', '2025-07-11T08:45:47.078184+00:00', '2025-07-11T08:45:47.078184+00:00');
INSERT INTO answers (id, text, is_correct, marks, comment, question_id, created_at, updated_at) VALUES ('d1c56aae-fa1a-4810-a159-e121c5bd5cd5', 'Disagree', NULL, '2', NULL, 'bf1b858a-81ef-40aa-8e59-85d6e9812908', '2025-07-11T08:45:47.078184+00:00', '2025-07-11T08:45:47.078184+00:00');
INSERT INTO answers (id, text, is_correct, marks, comment, question_id, created_at, updated_at) VALUES ('4a37df3b-2dc1-477d-ba05-02ec034c032d', 'Free text answer', NULL, '5', 'just for test question added', 'c0630c07-0e47-42b3-8cf5-259592357dfc', '2025-03-03T16:02:28.677755+00:00', '2025-03-03T16:02:28.677755+00:00');
INSERT INTO answers (id, text, is_correct, marks, comment, question_id, created_at, updated_at) VALUES ('4a9e9566-f423-4e54-8a0e-c546ed846dfd', 'Never', NULL, '1', NULL, 'c32ff803-8b2e-4eb5-bc38-3ccbec5e50fc', '2025-07-11T08:45:46.078726+00:00', '2025-07-11T08:45:46.078726+00:00');
INSERT INTO answers (id, text, is_correct, marks, comment, question_id, created_at, updated_at) VALUES ('ac4b49b0-5cde-49c9-be30-214dad050c98', 'Annually', NULL, '2', NULL, 'c32ff803-8b2e-4eb5-bc38-3ccbec5e50fc', '2025-07-11T08:45:46.078726+00:00', '2025-07-11T08:45:46.078726+00:00');
INSERT INTO answers (id, text, is_correct, marks, comment, question_id, created_at, updated_at) VALUES ('4b879bc2-57a2-4e7c-9831-370195ec7f1e', 'Quarterly', NULL, '3', NULL, 'c32ff803-8b2e-4eb5-bc38-3ccbec5e50fc', '2025-07-11T08:45:46.078726+00:00', '2025-07-11T08:45:46.078726+00:00');
INSERT INTO answers (id, text, is_correct, marks, comment, question_id, created_at, updated_at) VALUES ('6e89762b-5786-4a69-84de-ae8dfaa852e6', 'Monthly', NULL, '4', NULL, 'c32ff803-8b2e-4eb5-bc38-3ccbec5e50fc', '2025-07-11T08:45:46.078726+00:00', '2025-07-11T08:45:46.078726+00:00');
INSERT INTO answers (id, text, is_correct, marks, comment, question_id, created_at, updated_at) VALUES ('93241eea-42ac-4b8a-9ed1-50ac45c671b8', 'Every change', NULL, '5', NULL, 'c32ff803-8b2e-4eb5-bc38-3ccbec5e50fc', '2025-07-11T08:45:46.078726+00:00', '2025-07-11T08:45:46.078726+00:00');
INSERT INTO answers (id, text, is_correct, marks, comment, question_id, created_at, updated_at) VALUES ('4af8cb9a-e726-449b-91d4-a940508b7fd8', '3 - Neutral', NULL, '3', NULL, 'c5900f83-d1a0-4747-b218-26fb74bee78b', '2025-07-11T05:54:49.75761+00:00', '2025-07-11T05:54:49.75761+00:00');
INSERT INTO answers (id, text, is_correct, marks, comment, question_id, created_at, updated_at) VALUES ('70df9f01-55a9-4992-8b78-c57bf0a66b41', '1 - Strongly Disagree', NULL, '1', NULL, 'c5900f83-d1a0-4747-b218-26fb74bee78b', '2025-07-11T05:54:49.75761+00:00', '2025-07-11T05:54:49.75761+00:00');
INSERT INTO answers (id, text, is_correct, marks, comment, question_id, created_at, updated_at) VALUES ('878d9a8f-0989-4dbf-b816-40f38ec193bd', '5 - Strongly Agree', NULL, '5', NULL, 'c5900f83-d1a0-4747-b218-26fb74bee78b', '2025-07-11T05:54:49.75761+00:00', '2025-07-11T05:54:49.75761+00:00');
INSERT INTO answers (id, text, is_correct, marks, comment, question_id, created_at, updated_at) VALUES ('fc1573f5-6cd1-436f-a653-7d7c6258db44', '2 - Disagree', NULL, '2', NULL, 'c5900f83-d1a0-4747-b218-26fb74bee78b', '2025-07-11T05:54:49.75761+00:00', '2025-07-11T05:54:49.75761+00:00');
INSERT INTO answers (id, text, is_correct, marks, comment, question_id, created_at, updated_at) VALUES ('f51d35fa-3045-4669-b99e-f328fe3cffef', '4 - Agree', NULL, '4', NULL, 'c5900f83-d1a0-4747-b218-26fb74bee78b', '2025-07-11T05:54:49.75761+00:00', '2025-07-11T05:54:49.75761+00:00');
INSERT INTO answers (id, text, is_correct, marks, comment, question_id, created_at, updated_at) VALUES ('34f44bfe-f93c-435d-aceb-682fb7c65fc2', '2 - Disagree', NULL, '2', NULL, 'c69d62ab-ddbd-4354-8af2-0086cbdcbcd6', '2025-07-11T05:54:50.677233+00:00', '2025-07-11T05:54:50.677233+00:00');
INSERT INTO answers (id, text, is_correct, marks, comment, question_id, created_at, updated_at) VALUES ('7e5937dc-3a52-4812-85ab-f5b153f93d3d', '3 - Neutral', NULL, '3', NULL, 'c69d62ab-ddbd-4354-8af2-0086cbdcbcd6', '2025-07-11T05:54:50.677233+00:00', '2025-07-11T05:54:50.677233+00:00');
INSERT INTO answers (id, text, is_correct, marks, comment, question_id, created_at, updated_at) VALUES ('3ec18e72-62e5-4a17-a7e3-25ee253d5011', '4 - Agree', NULL, '4', NULL, 'c69d62ab-ddbd-4354-8af2-0086cbdcbcd6', '2025-07-11T05:54:50.677233+00:00', '2025-07-11T05:54:50.677233+00:00');
INSERT INTO answers (id, text, is_correct, marks, comment, question_id, created_at, updated_at) VALUES ('0512c5e8-a8ee-4811-ab77-e3abe6fce39e', '5 - Strongly Agree', NULL, '5', NULL, 'c69d62ab-ddbd-4354-8af2-0086cbdcbcd6', '2025-07-11T05:54:50.677233+00:00', '2025-07-11T05:54:50.677233+00:00');
INSERT INTO answers (id, text, is_correct, marks, comment, question_id, created_at, updated_at) VALUES ('4b7963d1-8cca-415e-96de-83a35dac3819', '1 - Strongly Disagree', NULL, '1', NULL, 'c69d62ab-ddbd-4354-8af2-0086cbdcbcd6', '2025-07-11T05:54:50.677233+00:00', '2025-07-11T05:54:50.677233+00:00');
INSERT INTO answers (id, text, is_correct, marks, comment, question_id, created_at, updated_at) VALUES ('f12cc7ba-051e-4c27-8736-2673c17d9756', '5 - Strongly Agree', NULL, '5', NULL, 'c6a20a53-5fd6-432e-ac7d-43a5aca62cd6', '2025-07-11T05:54:51.442387+00:00', '2025-07-11T05:54:51.442387+00:00');
INSERT INTO answers (id, text, is_correct, marks, comment, question_id, created_at, updated_at) VALUES ('08d8f1b2-88b9-4944-abc6-a85fc1d2dd48', '3 - Neutral', NULL, '3', NULL, 'c6a20a53-5fd6-432e-ac7d-43a5aca62cd6', '2025-07-11T05:54:51.442387+00:00', '2025-07-11T05:54:51.442387+00:00');
INSERT INTO answers (id, text, is_correct, marks, comment, question_id, created_at, updated_at) VALUES ('bfa29d6d-77a2-4cf0-984c-339b191dba6a', '2 - Disagree', NULL, '2', NULL, 'c6a20a53-5fd6-432e-ac7d-43a5aca62cd6', '2025-07-11T05:54:51.442387+00:00', '2025-07-11T05:54:51.442387+00:00');
INSERT INTO answers (id, text, is_correct, marks, comment, question_id, created_at, updated_at) VALUES ('b8319500-8747-44ae-91fd-0a321e8991bc', '1 - Strongly Disagree', NULL, '1', NULL, 'c6a20a53-5fd6-432e-ac7d-43a5aca62cd6', '2025-07-11T05:54:51.442387+00:00', '2025-07-11T05:54:51.442387+00:00');
INSERT INTO answers (id, text, is_correct, marks, comment, question_id, created_at, updated_at) VALUES ('c8146885-84e1-4532-8cdd-42e7ce3ef85a', '4 - Agree', NULL, '4', NULL, 'c6a20a53-5fd6-432e-ac7d-43a5aca62cd6', '2025-07-11T05:54:51.442387+00:00', '2025-07-11T05:54:51.442387+00:00');
INSERT INTO answers (id, text, is_correct, marks, comment, question_id, created_at, updated_at) VALUES ('950567f1-6410-482c-bf93-d5c014192cec', 'Agree', NULL, '4', NULL, 'c6d44596-ef33-43a1-90f2-4e01fffde09e', '2025-07-11T08:45:49.864877+00:00', '2025-07-11T08:45:49.864877+00:00');
INSERT INTO answers (id, text, is_correct, marks, comment, question_id, created_at, updated_at) VALUES ('2e416c78-b4f6-4b96-95ac-5b40716a00f9', 'Strongly agree', NULL, '5', NULL, 'c6d44596-ef33-43a1-90f2-4e01fffde09e', '2025-07-11T08:45:49.864877+00:00', '2025-07-11T08:45:49.864877+00:00');
INSERT INTO answers (id, text, is_correct, marks, comment, question_id, created_at, updated_at) VALUES ('87c94ef8-44ca-495c-8860-51da5c5c9ea9', 'Neutral', NULL, '3', NULL, 'c6d44596-ef33-43a1-90f2-4e01fffde09e', '2025-07-11T08:45:49.864877+00:00', '2025-07-11T08:45:49.864877+00:00');
INSERT INTO answers (id, text, is_correct, marks, comment, question_id, created_at, updated_at) VALUES ('7909d6fa-155b-4179-bd8f-ea75072b4a37', 'Disagree', NULL, '2', NULL, 'c6d44596-ef33-43a1-90f2-4e01fffde09e', '2025-07-11T08:45:49.864877+00:00', '2025-07-11T08:45:49.864877+00:00');
INSERT INTO answers (id, text, is_correct, marks, comment, question_id, created_at, updated_at) VALUES ('d962435c-4913-488d-9d24-cda49a25d8c9', 'Strongly disagree', NULL, '1', NULL, 'c6d44596-ef33-43a1-90f2-4e01fffde09e', '2025-07-11T08:45:49.864877+00:00', '2025-07-11T08:45:49.864877+00:00');
INSERT INTO answers (id, text, is_correct, marks, comment, question_id, created_at, updated_at) VALUES ('7b957d0b-73ad-4049-8d8d-f5aff600256d', 'Yes', NULL, '1', NULL, 'cb7f5b17-e28e-48c0-9c03-5f9ca50bddba', '2025-07-11T06:07:13.229614+00:00', '2025-07-11T06:07:13.229614+00:00');
INSERT INTO answers (id, text, is_correct, marks, comment, question_id, created_at, updated_at) VALUES ('fda7e24b-480a-4d09-b974-e5149612336f', 'No', NULL, '0', NULL, 'cb7f5b17-e28e-48c0-9c03-5f9ca50bddba', '2025-07-11T06:07:13.229614+00:00', '2025-07-11T06:07:13.229614+00:00');
INSERT INTO answers (id, text, is_correct, marks, comment, question_id, created_at, updated_at) VALUES ('f55d960b-1f7b-4aa8-a308-297eb3417874', 'Neutral', NULL, '3', NULL, 'cdbc2b31-ea30-4289-8f87-97a49314b677', '2025-07-11T08:45:47.28862+00:00', '2025-07-11T08:45:47.28862+00:00');
INSERT INTO answers (id, text, is_correct, marks, comment, question_id, created_at, updated_at) VALUES ('68ee269d-da79-48ba-880f-e201a54d4d55', 'Strongly agree', NULL, '5', NULL, 'cdbc2b31-ea30-4289-8f87-97a49314b677', '2025-07-11T08:45:47.28862+00:00', '2025-07-11T08:45:47.28862+00:00');
INSERT INTO answers (id, text, is_correct, marks, comment, question_id, created_at, updated_at) VALUES ('c546b23d-f001-4da2-94b6-821823c7af69', 'Strongly disagree', NULL, '1', NULL, 'cdbc2b31-ea30-4289-8f87-97a49314b677', '2025-07-11T08:45:47.28862+00:00', '2025-07-11T08:45:47.28862+00:00');
INSERT INTO answers (id, text, is_correct, marks, comment, question_id, created_at, updated_at) VALUES ('aeafdee6-1bf7-4033-8851-39b432805198', 'Disagree', NULL, '2', NULL, 'cdbc2b31-ea30-4289-8f87-97a49314b677', '2025-07-11T08:45:47.28862+00:00', '2025-07-11T08:45:47.28862+00:00');
INSERT INTO answers (id, text, is_correct, marks, comment, question_id, created_at, updated_at) VALUES ('6eb50131-991b-47c0-9dbe-fc250a9f1c32', 'Agree', NULL, '4', NULL, 'cdbc2b31-ea30-4289-8f87-97a49314b677', '2025-07-11T08:45:47.28862+00:00', '2025-07-11T08:45:47.28862+00:00');
INSERT INTO answers (id, text, is_correct, marks, comment, question_id, created_at, updated_at) VALUES ('9029b9c6-426c-4a37-ad12-a1e8dd960889', 'No', NULL, '0', NULL, 'd05b2407-95e3-4b3d-98e2-a051d3bba093', '2025-07-11T06:07:16.930072+00:00', '2025-07-11T06:07:16.930072+00:00');
INSERT INTO answers (id, text, is_correct, marks, comment, question_id, created_at, updated_at) VALUES ('8d6d1564-81c6-440e-b9d6-ad0deab4d077', 'Yes', NULL, '1', NULL, 'd05b2407-95e3-4b3d-98e2-a051d3bba093', '2025-07-11T06:07:16.930072+00:00', '2025-07-11T06:07:16.930072+00:00');
INSERT INTO answers (id, text, is_correct, marks, comment, question_id, created_at, updated_at) VALUES ('e4cc5f5b-7016-4011-8c00-211aca93cee3', '1 - Strongly Disagree', NULL, '1', NULL, 'd06e816a-172c-4a67-b908-c80940412411', '2025-07-11T05:54:56.100685+00:00', '2025-07-11T05:54:56.100685+00:00');
INSERT INTO answers (id, text, is_correct, marks, comment, question_id, created_at, updated_at) VALUES ('1c679602-742b-4c6a-a381-ad1c1f1b494c', '3 - Neutral', NULL, '3', NULL, 'd06e816a-172c-4a67-b908-c80940412411', '2025-07-11T05:54:56.100685+00:00', '2025-07-11T05:54:56.100685+00:00');
INSERT INTO answers (id, text, is_correct, marks, comment, question_id, created_at, updated_at) VALUES ('a772fe4c-c447-4a2b-9a21-808e97f1104c', '4 - Agree', NULL, '4', NULL, 'd06e816a-172c-4a67-b908-c80940412411', '2025-07-11T05:54:56.100685+00:00', '2025-07-11T05:54:56.100685+00:00');
INSERT INTO answers (id, text, is_correct, marks, comment, question_id, created_at, updated_at) VALUES ('1f78b8aa-5091-4c7a-8da8-581483e8a515', '5 - Strongly Agree', NULL, '5', NULL, 'd06e816a-172c-4a67-b908-c80940412411', '2025-07-11T05:54:56.100685+00:00', '2025-07-11T05:54:56.100685+00:00');
INSERT INTO answers (id, text, is_correct, marks, comment, question_id, created_at, updated_at) VALUES ('aea17665-20ee-406e-b928-4d0d97116553', '2 - Disagree', NULL, '2', NULL, 'd06e816a-172c-4a67-b908-c80940412411', '2025-07-11T05:54:56.100685+00:00', '2025-07-11T05:54:56.100685+00:00');
INSERT INTO answers (id, text, is_correct, marks, comment, question_id, created_at, updated_at) VALUES ('66374a02-35d1-4049-80c1-e2849e9d2215', '5 - Strongly Agree', NULL, '5', NULL, 'd24df0ae-2894-4a22-b793-3cd1ee28594f', '2025-07-11T05:54:56.414435+00:00', '2025-07-11T05:54:56.414435+00:00');
INSERT INTO answers (id, text, is_correct, marks, comment, question_id, created_at, updated_at) VALUES ('bc2887a1-ddef-4bed-a517-079fc8b80957', '3 - Neutral', NULL, '3', NULL, 'd24df0ae-2894-4a22-b793-3cd1ee28594f', '2025-07-11T05:54:56.414435+00:00', '2025-07-11T05:54:56.414435+00:00');
INSERT INTO answers (id, text, is_correct, marks, comment, question_id, created_at, updated_at) VALUES ('60a74c21-fe5c-4331-ab4d-82fcfa643862', '2 - Disagree', NULL, '2', NULL, 'd24df0ae-2894-4a22-b793-3cd1ee28594f', '2025-07-11T05:54:56.414435+00:00', '2025-07-11T05:54:56.414435+00:00');
INSERT INTO answers (id, text, is_correct, marks, comment, question_id, created_at, updated_at) VALUES ('d7c7648c-eb1c-43ea-a24e-9fb1088d5ffd', '1 - Strongly Disagree', NULL, '1', NULL, 'd24df0ae-2894-4a22-b793-3cd1ee28594f', '2025-07-11T05:54:56.414435+00:00', '2025-07-11T05:54:56.414435+00:00');
INSERT INTO answers (id, text, is_correct, marks, comment, question_id, created_at, updated_at) VALUES ('9ca49ad0-8446-4a36-a1ec-417c0cabc89c', '4 - Agree', NULL, '4', NULL, 'd24df0ae-2894-4a22-b793-3cd1ee28594f', '2025-07-11T05:54:56.414435+00:00', '2025-07-11T05:54:56.414435+00:00');
INSERT INTO answers (id, text, is_correct, marks, comment, question_id, created_at, updated_at) VALUES ('26e0796d-3792-42c9-a153-574ff7093a47', '1 - Strongly Disagree', NULL, '1', NULL, 'd30b8a4d-3dfe-48ad-b2f6-66ff51fff9de', '2025-07-11T05:54:53.743368+00:00', '2025-07-11T05:54:53.743368+00:00');
INSERT INTO answers (id, text, is_correct, marks, comment, question_id, created_at, updated_at) VALUES ('0f660da1-4585-4167-b285-69a40c1c257d', '2 - Disagree', NULL, '2', NULL, 'd30b8a4d-3dfe-48ad-b2f6-66ff51fff9de', '2025-07-11T05:54:53.743368+00:00', '2025-07-11T05:54:53.743368+00:00');
INSERT INTO answers (id, text, is_correct, marks, comment, question_id, created_at, updated_at) VALUES ('184eba89-bcd9-4278-a4e5-4e0e67c44739', '3 - Neutral', NULL, '3', NULL, 'd30b8a4d-3dfe-48ad-b2f6-66ff51fff9de', '2025-07-11T05:54:53.743368+00:00', '2025-07-11T05:54:53.743368+00:00');
INSERT INTO answers (id, text, is_correct, marks, comment, question_id, created_at, updated_at) VALUES ('1bffa435-26c3-4f83-927a-c9f6b5b67461', '4 - Agree', NULL, '4', NULL, 'd30b8a4d-3dfe-48ad-b2f6-66ff51fff9de', '2025-07-11T05:54:53.743368+00:00', '2025-07-11T05:54:53.743368+00:00');
INSERT INTO answers (id, text, is_correct, marks, comment, question_id, created_at, updated_at) VALUES ('2d96bb1d-dfa5-4947-a584-f450d11736c4', '5 - Strongly Agree', NULL, '5', NULL, 'd30b8a4d-3dfe-48ad-b2f6-66ff51fff9de', '2025-07-11T05:54:53.743368+00:00', '2025-07-11T05:54:53.743368+00:00');
INSERT INTO answers (id, text, is_correct, marks, comment, question_id, created_at, updated_at) VALUES ('4c6ff891-6f96-4dc5-8d84-f37ab22e9af9', 'Strongly agree', NULL, '5', NULL, 'd3f960be-194f-439a-a172-11b483d81c84', '2025-07-11T08:45:50.918465+00:00', '2025-07-11T08:45:50.918465+00:00');
INSERT INTO answers (id, text, is_correct, marks, comment, question_id, created_at, updated_at) VALUES ('8ac89bcf-2e11-41c9-8f77-77f0082bdff5', 'Strongly disagree', NULL, '1', NULL, 'd3f960be-194f-439a-a172-11b483d81c84', '2025-07-11T08:45:50.918465+00:00', '2025-07-11T08:45:50.918465+00:00');
INSERT INTO answers (id, text, is_correct, marks, comment, question_id, created_at, updated_at) VALUES ('5f0d1d73-2b17-45f7-9c30-c8ea339c3ea4', 'Disagree', NULL, '2', NULL, 'd3f960be-194f-439a-a172-11b483d81c84', '2025-07-11T08:45:50.918465+00:00', '2025-07-11T08:45:50.918465+00:00');
INSERT INTO answers (id, text, is_correct, marks, comment, question_id, created_at, updated_at) VALUES ('552e3991-50be-41e9-bebd-ef9e4cfd04fc', 'Neutral', NULL, '3', NULL, 'd3f960be-194f-439a-a172-11b483d81c84', '2025-07-11T08:45:50.918465+00:00', '2025-07-11T08:45:50.918465+00:00');
INSERT INTO answers (id, text, is_correct, marks, comment, question_id, created_at, updated_at) VALUES ('29f3de4f-b157-4724-97a2-e8d6a3544445', 'Agree', NULL, '4', NULL, 'd3f960be-194f-439a-a172-11b483d81c84', '2025-07-11T08:45:50.918465+00:00', '2025-07-11T08:45:50.918465+00:00');
INSERT INTO answers (id, text, is_correct, marks, comment, question_id, created_at, updated_at) VALUES ('b7e5c88b-a32f-4cd8-a2b6-52d51494f0a7', 'Manual only', NULL, '2', NULL, 'd560b255-b7c5-47f4-bdfb-d73d49456fcf', '2025-07-11T08:45:49.668531+00:00', '2025-07-11T08:45:49.668531+00:00');
INSERT INTO answers (id, text, is_correct, marks, comment, question_id, created_at, updated_at) VALUES ('e769c15e-ca10-4dd6-a800-96c221c47198', 'Not supported', NULL, '1', NULL, 'd560b255-b7c5-47f4-bdfb-d73d49456fcf', '2025-07-11T08:45:49.668531+00:00', '2025-07-11T08:45:49.668531+00:00');
INSERT INTO answers (id, text, is_correct, marks, comment, question_id, created_at, updated_at) VALUES ('4fb0d1cd-d482-4ad7-a5dd-50b9ae201acf', 'Automated with downtime', NULL, '3', NULL, 'd560b255-b7c5-47f4-bdfb-d73d49456fcf', '2025-07-11T08:45:49.668531+00:00', '2025-07-11T08:45:49.668531+00:00');
INSERT INTO answers (id, text, is_correct, marks, comment, question_id, created_at, updated_at) VALUES ('f569ce6b-cc4d-44e0-b0ce-ce41246405be', 'Automated with minimal downtime', NULL, '4', NULL, 'd560b255-b7c5-47f4-bdfb-d73d49456fcf', '2025-07-11T08:45:49.668531+00:00', '2025-07-11T08:45:49.668531+00:00');
INSERT INTO answers (id, text, is_correct, marks, comment, question_id, created_at, updated_at) VALUES ('5db3519c-9457-4949-8e82-b24d8ae4f22e', 'Fully automated and seamless', NULL, '5', NULL, 'd560b255-b7c5-47f4-bdfb-d73d49456fcf', '2025-07-11T08:45:49.668531+00:00', '2025-07-11T08:45:49.668531+00:00');
INSERT INTO answers (id, text, is_correct, marks, comment, question_id, created_at, updated_at) VALUES ('6979ace3-1faa-4c92-9cbc-c7147312f395', 'No', NULL, '0', NULL, 'd685d417-1b8c-4829-827e-badb80553441', '2025-07-11T06:07:11.356483+00:00', '2025-07-11T06:07:11.356483+00:00');
INSERT INTO answers (id, text, is_correct, marks, comment, question_id, created_at, updated_at) VALUES ('2601dd2b-2f41-4f09-ab59-35e3d58b704b', 'Yes', NULL, '1', NULL, 'd685d417-1b8c-4829-827e-badb80553441', '2025-07-11T06:07:11.356483+00:00', '2025-07-11T06:07:11.356483+00:00');
INSERT INTO answers (id, text, is_correct, marks, comment, question_id, created_at, updated_at) VALUES ('ff279fdf-5436-4fd1-b399-5bfe24404292', 'Yes', NULL, '1', NULL, 'd82c50cf-638c-4776-8447-6f3c7e3dbdc5', '2025-07-11T06:07:15.686877+00:00', '2025-07-11T06:07:15.686877+00:00');
INSERT INTO answers (id, text, is_correct, marks, comment, question_id, created_at, updated_at) VALUES ('93c6f3d1-4846-4853-903c-10d409fe2489', 'No', NULL, '0', NULL, 'd82c50cf-638c-4776-8447-6f3c7e3dbdc5', '2025-07-11T06:07:15.686877+00:00', '2025-07-11T06:07:15.686877+00:00');
INSERT INTO answers (id, text, is_correct, marks, comment, question_id, created_at, updated_at) VALUES ('d90404fe-c407-48ad-af51-73eeb3ad87e8', 'Strongly agree', NULL, '5', NULL, 'db3c6e91-46ac-4816-928a-d59d6f26f420', '2025-07-11T08:45:48.319934+00:00', '2025-07-11T08:45:48.319934+00:00');
INSERT INTO answers (id, text, is_correct, marks, comment, question_id, created_at, updated_at) VALUES ('ac3b1ede-4984-4d63-b5b2-0cc67c2178b4', 'Strongly disagree', NULL, '1', NULL, 'db3c6e91-46ac-4816-928a-d59d6f26f420', '2025-07-11T08:45:48.319934+00:00', '2025-07-11T08:45:48.319934+00:00');
INSERT INTO answers (id, text, is_correct, marks, comment, question_id, created_at, updated_at) VALUES ('bd729514-acd3-4b83-a0b9-85a1014fbb79', 'Disagree', NULL, '2', NULL, 'db3c6e91-46ac-4816-928a-d59d6f26f420', '2025-07-11T08:45:48.319934+00:00', '2025-07-11T08:45:48.319934+00:00');
INSERT INTO answers (id, text, is_correct, marks, comment, question_id, created_at, updated_at) VALUES ('22b8181b-3b8a-4b99-9dcb-7dc7b3dcd9a0', 'Neutral', NULL, '3', NULL, 'db3c6e91-46ac-4816-928a-d59d6f26f420', '2025-07-11T08:45:48.319934+00:00', '2025-07-11T08:45:48.319934+00:00');
INSERT INTO answers (id, text, is_correct, marks, comment, question_id, created_at, updated_at) VALUES ('1b8cdec3-47b7-47b6-91cd-0e9d37c5431e', 'Agree', NULL, '4', NULL, 'db3c6e91-46ac-4816-928a-d59d6f26f420', '2025-07-11T08:45:48.319934+00:00', '2025-07-11T08:45:48.319934+00:00');
INSERT INTO answers (id, text, is_correct, marks, comment, question_id, created_at, updated_at) VALUES ('80f82e17-3ac3-4a1c-a260-b15ea8afc5d8', '3 - Neutral', NULL, '3', NULL, 'e4b53cc6-bd44-48a7-9fef-b5a739c6bccb', '2025-07-11T05:54:51.659809+00:00', '2025-07-11T05:54:51.659809+00:00');
INSERT INTO answers (id, text, is_correct, marks, comment, question_id, created_at, updated_at) VALUES ('f274a1aa-fd52-4595-8c32-edfd63c1e747', '1 - Strongly Disagree', NULL, '1', NULL, 'e4b53cc6-bd44-48a7-9fef-b5a739c6bccb', '2025-07-11T05:54:51.659809+00:00', '2025-07-11T05:54:51.659809+00:00');
INSERT INTO answers (id, text, is_correct, marks, comment, question_id, created_at, updated_at) VALUES ('6ff322e3-4bf5-4f50-b93f-c66907e559f7', '5 - Strongly Agree', NULL, '5', NULL, 'e4b53cc6-bd44-48a7-9fef-b5a739c6bccb', '2025-07-11T05:54:51.659809+00:00', '2025-07-11T05:54:51.659809+00:00');
INSERT INTO answers (id, text, is_correct, marks, comment, question_id, created_at, updated_at) VALUES ('3dc16679-590b-44af-b5ca-cd7868e2623f', '4 - Agree', NULL, '4', NULL, 'e4b53cc6-bd44-48a7-9fef-b5a739c6bccb', '2025-07-11T05:54:51.659809+00:00', '2025-07-11T05:54:51.659809+00:00');
INSERT INTO answers (id, text, is_correct, marks, comment, question_id, created_at, updated_at) VALUES ('0fce02f4-1d94-4733-87f4-cc5bf5f06344', '2 - Disagree', NULL, '2', NULL, 'e4b53cc6-bd44-48a7-9fef-b5a739c6bccb', '2025-07-11T05:54:51.659809+00:00', '2025-07-11T05:54:51.659809+00:00');
INSERT INTO answers (id, text, is_correct, marks, comment, question_id, created_at, updated_at) VALUES ('09d3a533-15f4-43d7-a763-c7ab622eab98', 'Neutral', NULL, '3', NULL, 'ed1b56a8-5f9c-4a84-a1b7-3d9eceb2d887', '2025-07-11T08:45:47.496124+00:00', '2025-07-11T08:45:47.496124+00:00');
INSERT INTO answers (id, text, is_correct, marks, comment, question_id, created_at, updated_at) VALUES ('7aa6c9df-aa6d-48e0-8d8f-18d8a8d2c3ea', 'Strongly agree', NULL, '5', NULL, 'ed1b56a8-5f9c-4a84-a1b7-3d9eceb2d887', '2025-07-11T08:45:47.496124+00:00', '2025-07-11T08:45:47.496124+00:00');
INSERT INTO answers (id, text, is_correct, marks, comment, question_id, created_at, updated_at) VALUES ('838eb164-136b-4e5e-b2ba-a9c5143bf209', 'Agree', NULL, '4', NULL, 'ed1b56a8-5f9c-4a84-a1b7-3d9eceb2d887', '2025-07-11T08:45:47.496124+00:00', '2025-07-11T08:45:47.496124+00:00');
INSERT INTO answers (id, text, is_correct, marks, comment, question_id, created_at, updated_at) VALUES ('b567fa9f-a75f-45e9-96a1-a4409da2f357', 'Strongly disagree', NULL, '1', NULL, 'ed1b56a8-5f9c-4a84-a1b7-3d9eceb2d887', '2025-07-11T08:45:47.496124+00:00', '2025-07-11T08:45:47.496124+00:00');
INSERT INTO answers (id, text, is_correct, marks, comment, question_id, created_at, updated_at) VALUES ('bb84a7ae-3c04-4ffb-a87c-654e6884414c', 'Disagree', NULL, '2', NULL, 'ed1b56a8-5f9c-4a84-a1b7-3d9eceb2d887', '2025-07-11T08:45:47.496124+00:00', '2025-07-11T08:45:47.496124+00:00');
INSERT INTO answers (id, text, is_correct, marks, comment, question_id, created_at, updated_at) VALUES ('4dd45a1b-6696-4f5c-a6de-be0b56f61b4f', 'No', NULL, '0', NULL, 'edefbdcc-8eb8-464c-a7e4-af645069b164', '2025-07-11T06:07:11.982804+00:00', '2025-07-11T06:07:11.982804+00:00');
INSERT INTO answers (id, text, is_correct, marks, comment, question_id, created_at, updated_at) VALUES ('7098945d-5a09-40e4-bafc-164386d35b42', 'Yes', NULL, '1', NULL, 'edefbdcc-8eb8-464c-a7e4-af645069b164', '2025-07-11T06:07:11.982804+00:00', '2025-07-11T06:07:11.982804+00:00');
INSERT INTO answers (id, text, is_correct, marks, comment, question_id, created_at, updated_at) VALUES ('64f46ad7-bc5f-41b0-bcee-ca443e412056', '3 - Neutral', NULL, '3', NULL, 'edfe25a9-c75c-448c-bd88-fb221e4965e0', '2025-07-11T05:54:49.961801+00:00', '2025-07-11T05:54:49.961801+00:00');
INSERT INTO answers (id, text, is_correct, marks, comment, question_id, created_at, updated_at) VALUES ('789549e1-7a66-4361-8cd0-89b044112e69', '1 - Strongly Disagree', NULL, '1', NULL, 'edfe25a9-c75c-448c-bd88-fb221e4965e0', '2025-07-11T05:54:49.961801+00:00', '2025-07-11T05:54:49.961801+00:00');
INSERT INTO answers (id, text, is_correct, marks, comment, question_id, created_at, updated_at) VALUES ('b3896595-5fbd-4ed5-b717-11fa28d1201f', '2 - Disagree', NULL, '2', NULL, 'edfe25a9-c75c-448c-bd88-fb221e4965e0', '2025-07-11T05:54:49.961801+00:00', '2025-07-11T05:54:49.961801+00:00');
INSERT INTO answers (id, text, is_correct, marks, comment, question_id, created_at, updated_at) VALUES ('83e805d7-b3e5-4901-8200-f1679b6d7120', '4 - Agree', NULL, '4', NULL, 'edfe25a9-c75c-448c-bd88-fb221e4965e0', '2025-07-11T05:54:49.961801+00:00', '2025-07-11T05:54:49.961801+00:00');
INSERT INTO answers (id, text, is_correct, marks, comment, question_id, created_at, updated_at) VALUES ('ecc53f29-14a1-45b6-8014-b45c5e7f419e', '5 - Strongly Agree', NULL, '5', NULL, 'edfe25a9-c75c-448c-bd88-fb221e4965e0', '2025-07-11T05:54:49.961801+00:00', '2025-07-11T05:54:49.961801+00:00');
INSERT INTO answers (id, text, is_correct, marks, comment, question_id, created_at, updated_at) VALUES ('fb61f1f3-09cd-47b0-a9c7-a5d006ee606a', '2 - Disagree', NULL, '2', NULL, 'eef12143-c645-4ad3-959e-c5c06f2465f7', '2025-07-11T05:54:58.03989+00:00', '2025-07-11T05:54:58.03989+00:00');
INSERT INTO answers (id, text, is_correct, marks, comment, question_id, created_at, updated_at) VALUES ('a93b494c-be68-4034-8753-2181fddc116a', '1 - Strongly Disagree', NULL, '1', NULL, 'eef12143-c645-4ad3-959e-c5c06f2465f7', '2025-07-11T05:54:58.03989+00:00', '2025-07-11T05:54:58.03989+00:00');
INSERT INTO answers (id, text, is_correct, marks, comment, question_id, created_at, updated_at) VALUES ('ee2b846a-6216-4438-b748-20c90f043d95', '5 - Strongly Agree', NULL, '5', NULL, 'eef12143-c645-4ad3-959e-c5c06f2465f7', '2025-07-11T05:54:58.03989+00:00', '2025-07-11T05:54:58.03989+00:00');
INSERT INTO answers (id, text, is_correct, marks, comment, question_id, created_at, updated_at) VALUES ('9667db0e-273a-4418-bcb7-5816573fadc4', '4 - Agree', NULL, '4', NULL, 'eef12143-c645-4ad3-959e-c5c06f2465f7', '2025-07-11T05:54:58.03989+00:00', '2025-07-11T05:54:58.03989+00:00');
INSERT INTO answers (id, text, is_correct, marks, comment, question_id, created_at, updated_at) VALUES ('d9a7896a-5480-4052-a3fb-536303c1c22b', '3 - Neutral', NULL, '3', NULL, 'eef12143-c645-4ad3-959e-c5c06f2465f7', '2025-07-11T05:54:58.03989+00:00', '2025-07-11T05:54:58.03989+00:00');
INSERT INTO answers (id, text, is_correct, marks, comment, question_id, created_at, updated_at) VALUES ('d8d374b0-0bfb-4eb3-9183-4df259d3db18', 'Free text answer', NULL, '10', 'This is a free text answer', 'f0a9f391-c50d-405d-8095-96ea10f17b14', '2025-03-03T16:02:02.827443+00:00', '2025-03-03T16:02:02.827443+00:00');
INSERT INTO answers (id, text, is_correct, marks, comment, question_id, created_at, updated_at) VALUES ('bcea7c8c-0960-4915-84e3-7b8a0b9c577b', '1 - Strongly Disagree', NULL, '1', NULL, 'f5c9263b-5bc9-4d5a-9f92-3e613d7493c4', '2025-07-11T05:54:57.576523+00:00', '2025-07-11T05:54:57.576523+00:00');
INSERT INTO answers (id, text, is_correct, marks, comment, question_id, created_at, updated_at) VALUES ('a5e248ce-4944-40af-ad6f-570f16cbb3fc', '3 - Neutral', NULL, '3', NULL, 'f5c9263b-5bc9-4d5a-9f92-3e613d7493c4', '2025-07-11T05:54:57.576523+00:00', '2025-07-11T05:54:57.576523+00:00');
INSERT INTO answers (id, text, is_correct, marks, comment, question_id, created_at, updated_at) VALUES ('3d9f8c38-cc0a-4f4c-a953-a698363fc285', '2 - Disagree', NULL, '2', NULL, 'f5c9263b-5bc9-4d5a-9f92-3e613d7493c4', '2025-07-11T05:54:57.576523+00:00', '2025-07-11T05:54:57.576523+00:00');
INSERT INTO answers (id, text, is_correct, marks, comment, question_id, created_at, updated_at) VALUES ('57d0723b-c96e-498e-a74f-56b24d5a6b79', '5 - Strongly Agree', NULL, '5', NULL, 'f5c9263b-5bc9-4d5a-9f92-3e613d7493c4', '2025-07-11T05:54:57.576523+00:00', '2025-07-11T05:54:57.576523+00:00');
INSERT INTO answers (id, text, is_correct, marks, comment, question_id, created_at, updated_at) VALUES ('34bf1a63-4f76-4c88-ab2f-b76a6c411dd9', '4 - Agree', NULL, '4', NULL, 'f5c9263b-5bc9-4d5a-9f92-3e613d7493c4', '2025-07-11T05:54:57.576523+00:00', '2025-07-11T05:54:57.576523+00:00');
INSERT INTO answers (id, text, is_correct, marks, comment, question_id, created_at, updated_at) VALUES ('c3361db9-05b8-4fde-9951-ab6a203a4a2f', 'Strongly disagree', NULL, '1', NULL, 'f84eeb57-4026-4767-8ad1-f02d2df0ce34', '2025-07-11T08:45:48.627447+00:00', '2025-07-11T08:45:48.627447+00:00');
INSERT INTO answers (id, text, is_correct, marks, comment, question_id, created_at, updated_at) VALUES ('af28a17d-48b6-46c4-814e-1fce237d3720', 'Neutral', NULL, '3', NULL, 'f84eeb57-4026-4767-8ad1-f02d2df0ce34', '2025-07-11T08:45:48.627447+00:00', '2025-07-11T08:45:48.627447+00:00');
INSERT INTO answers (id, text, is_correct, marks, comment, question_id, created_at, updated_at) VALUES ('b9dd0386-fa62-4526-9d8e-ecbfb07027f6', 'Agree', NULL, '4', NULL, 'f84eeb57-4026-4767-8ad1-f02d2df0ce34', '2025-07-11T08:45:48.627447+00:00', '2025-07-11T08:45:48.627447+00:00');
INSERT INTO answers (id, text, is_correct, marks, comment, question_id, created_at, updated_at) VALUES ('27b13217-7afd-4cc3-8b88-ec40f188d6a2', 'Strongly agree', NULL, '5', NULL, 'f84eeb57-4026-4767-8ad1-f02d2df0ce34', '2025-07-11T08:45:48.627447+00:00', '2025-07-11T08:45:48.627447+00:00');
INSERT INTO answers (id, text, is_correct, marks, comment, question_id, created_at, updated_at) VALUES ('179bccdd-4878-435f-9200-25d96f5b6394', 'Disagree', NULL, '2', NULL, 'f84eeb57-4026-4767-8ad1-f02d2df0ce34', '2025-07-11T08:45:48.627447+00:00', '2025-07-11T08:45:48.627447+00:00');
INSERT INTO answers (id, text, is_correct, marks, comment, question_id, created_at, updated_at) VALUES ('e76e8cdb-dc13-4b18-a79f-c1bc4c5dc5e2', 'No', NULL, '0', NULL, 'fd4cce9a-6a00-4f87-8b52-46e20dfdad0e', '2025-07-11T06:07:10.903965+00:00', '2025-07-11T06:07:10.903965+00:00');
INSERT INTO answers (id, text, is_correct, marks, comment, question_id, created_at, updated_at) VALUES ('706ba7c5-04f4-4740-9818-8e76f01d0f23', 'Yes', NULL, '1', NULL, 'fd4cce9a-6a00-4f87-8b52-46e20dfdad0e', '2025-07-11T06:07:10.903965+00:00', '2025-07-11T06:07:10.903965+00:00');
INSERT INTO answers (id, text, is_correct, marks, comment, question_id, created_at, updated_at) VALUES ('d6a4edcb-6694-4d22-b73c-287bc5d848ab', '3 - Neutral', NULL, '3', NULL, 'fe2ca3d9-529f-4951-812f-ebe3013fce04', '2025-07-11T05:54:49.334811+00:00', '2025-07-11T05:54:49.334811+00:00');
INSERT INTO answers (id, text, is_correct, marks, comment, question_id, created_at, updated_at) VALUES ('f48e0340-3c63-484e-acc0-8058e12d5094', '5 - Strongly Agree', NULL, '5', NULL, 'fe2ca3d9-529f-4951-812f-ebe3013fce04', '2025-07-11T05:54:49.334811+00:00', '2025-07-11T05:54:49.334811+00:00');
INSERT INTO answers (id, text, is_correct, marks, comment, question_id, created_at, updated_at) VALUES ('f8a2b930-8596-4715-88fa-0cda2f1b5dfd', '2 - Disagree', NULL, '2', NULL, 'fe2ca3d9-529f-4951-812f-ebe3013fce04', '2025-07-11T05:54:49.334811+00:00', '2025-07-11T05:54:49.334811+00:00');
INSERT INTO answers (id, text, is_correct, marks, comment, question_id, created_at, updated_at) VALUES ('76ad074b-96dc-4718-9f90-118ace413cc3', '1 - Strongly Disagree', NULL, '1', NULL, 'fe2ca3d9-529f-4951-812f-ebe3013fce04', '2025-07-11T05:54:49.334811+00:00', '2025-07-11T05:54:49.334811+00:00');
INSERT INTO answers (id, text, is_correct, marks, comment, question_id, created_at, updated_at) VALUES ('54350610-cbc7-498d-a003-18c8f7cd6e68', '4 - Agree', NULL, '4', NULL, 'fe2ca3d9-529f-4951-812f-ebe3013fce04', '2025-07-11T05:54:49.334811+00:00', '2025-07-11T05:54:49.334811+00:00');

-- Insert assessment_assignments data (10 records)
INSERT INTO assessment_assignments (id, assessment_id, user_id, status, scope, due_date, assigned_at, created_at, updated_at) VALUES ('d0978eb8-64e6-485f-968b-550308363f7e', '7c014a03-68f4-44e4-bc08-0098eb274fa4', '73d6ca9f-6cd4-4eb4-a15d-166d21766faf', 'ASSIGNED', 'CLASS back office', NULL, '2025-03-05T14:01:30.648935+00:00', '2025-03-05T14:01:30.648935+00:00', '2025-03-05T14:01:30.648935+00:00');
INSERT INTO assessment_assignments (id, assessment_id, user_id, status, scope, due_date, assigned_at, created_at, updated_at) VALUES ('94b5d86b-2f28-418c-9914-11a5f7711772', '7c014a03-68f4-44e4-bc08-0098eb274fa4', '4bffc056-a348-481b-a49e-f5d191ac203e', 'COMPLETED', 'TradeWeb', NULL, '2025-03-05T14:01:31.880539+00:00', '2025-03-05T14:01:31.880539+00:00', '2025-04-27T12:26:42.558253+00:00');
INSERT INTO assessment_assignments (id, assessment_id, user_id, status, scope, due_date, assigned_at, created_at, updated_at) VALUES ('7b5bedba-0635-40ce-90a3-451ad2945519', '0697e0f1-b519-4b7d-9146-4b8dbc34afe9', '4bffc056-a348-481b-a49e-f5d191ac203e', 'STARTED', 'BjjBrk IT Asses', NULL, '2025-03-05T15:39:09.591+00:00', '2025-03-05T15:39:09.591+00:00', '2025-07-11T09:14:56.098368+00:00');
INSERT INTO assessment_assignments (id, assessment_id, user_id, status, scope, due_date, assigned_at, created_at, updated_at) VALUES ('82fe867c-7d4f-43e0-86d3-f7e6d6e59d09', '0697e0f1-b519-4b7d-9146-4b8dbc34afe9', '73d6ca9f-6cd4-4eb4-a15d-166d21766faf', 'ASSIGNED', 'Business Architecture', NULL, '2025-03-06T10:29:18.850048+00:00', '2025-03-06T10:29:18.850048+00:00', '2025-03-06T10:29:18.850048+00:00');
INSERT INTO assessment_assignments (id, assessment_id, user_id, status, scope, due_date, assigned_at, created_at, updated_at) VALUES ('2b85ca06-b8d9-4a08-98b2-b7412fa25149', '1870e009-f8d3-4541-b715-c012897d631e', '73d6ca9f-6cd4-4eb4-a15d-166d21766faf', 'ASSIGNED', 'CLASS', NULL, '2025-03-06T16:43:41.53231+00:00', '2025-03-06T16:43:41.53231+00:00', '2025-03-06T16:43:41.53231+00:00');
INSERT INTO assessment_assignments (id, assessment_id, user_id, status, scope, due_date, assigned_at, created_at, updated_at) VALUES ('0239a187-2e2f-45e9-8baf-8b1e8acdf588', '1870e009-f8d3-4541-b715-c012897d631e', '4bffc056-a348-481b-a49e-f5d191ac203e', 'ASSIGNED', 'OMNENEST', NULL, '2025-03-06T16:43:42.718625+00:00', '2025-03-06T16:43:42.718625+00:00', '2025-03-06T16:43:42.718625+00:00');
INSERT INTO assessment_assignments (id, assessment_id, user_id, status, scope, due_date, assigned_at, created_at, updated_at) VALUES ('fe62f049-7896-46c6-9d36-c0c081b0a365', 'f5b59235-248c-490b-9020-7345529a56a3', '73d6ca9f-6cd4-4eb4-a15d-166d21766faf', 'ASSIGNED', 'BJJBK', NULL, '2025-07-11T06:45:57.083209+00:00', '2025-07-11T06:45:57.083209+00:00', '2025-07-11T06:45:57.083209+00:00');
INSERT INTO assessment_assignments (id, assessment_id, user_id, status, scope, due_date, assigned_at, created_at, updated_at) VALUES ('d50dee15-b778-4645-8bd3-edd8561a3da5', 'f5b59235-248c-490b-9020-7345529a56a3', '4bffc056-a348-481b-a49e-f5d191ac203e', 'STARTED', 'BJJBK', NULL, '2025-07-11T06:46:02.977956+00:00', '2025-07-11T06:46:02.977956+00:00', '2025-07-11T08:54:55.268059+00:00');
INSERT INTO assessment_assignments (id, assessment_id, user_id, status, scope, due_date, assigned_at, created_at, updated_at) VALUES ('40b3c90b-31c7-4038-902c-36a62020439c', '771f21c7-79dd-4e3c-ad2a-ecab16983ec2', '73d6ca9f-6cd4-4eb4-a15d-166d21766faf', 'ASSIGNED', 'BJJBK', NULL, '2025-07-11T07:01:50.447445+00:00', '2025-07-11T07:01:50.447445+00:00', '2025-07-11T07:01:50.447445+00:00');
INSERT INTO assessment_assignments (id, assessment_id, user_id, status, scope, due_date, assigned_at, created_at, updated_at) VALUES ('3e11022a-6350-4f22-a179-fad880ce91a1', '771f21c7-79dd-4e3c-ad2a-ecab16983ec2', '4bffc056-a348-481b-a49e-f5d191ac203e', 'STARTED', 'BJJBK', NULL, '2025-07-11T07:01:55.712945+00:00', '2025-07-11T07:01:55.712945+00:00', '2025-07-11T08:54:13.504473+00:00');

-- Insert assessment_submissions data (3 records)
INSERT INTO assessment_submissions (id, assessment_id, user_id, started_at, completed_at, score, max_score, created_at, updated_at) VALUES ('e9877056-5640-4633-b668-3133b4bd2588', '7c014a03-68f4-44e4-bc08-0098eb274fa4', '4bffc056-a348-481b-a49e-f5d191ac203e', '2025-03-15T12:06:46.062498+00:00', NULL, NULL, NULL, '2025-03-15T12:06:46.062498+00:00', '2025-03-15T12:06:46.062498+00:00');
INSERT INTO assessment_submissions (id, assessment_id, user_id, started_at, completed_at, score, max_score, created_at, updated_at) VALUES ('33f5e35c-b431-4d10-ba85-474a5709bee9', '7c014a03-68f4-44e4-bc08-0098eb274fa4', '4bffc056-a348-481b-a49e-f5d191ac203e', '2025-03-15T12:06:46.142313+00:00', NULL, NULL, NULL, '2025-03-15T12:06:46.142313+00:00', '2025-03-15T12:06:46.142313+00:00');
INSERT INTO assessment_submissions (id, assessment_id, user_id, started_at, completed_at, score, max_score, created_at, updated_at) VALUES ('ab4b8354-5e13-4692-af1c-fd1e656433e3', '7c014a03-68f4-44e4-bc08-0098eb274fa4', '4bffc056-a348-481b-a49e-f5d191ac203e', '2025-04-27T12:03:25.277398+00:00', NULL, NULL, NULL, '2025-04-27T12:03:25.277398+00:00', '2025-04-27T12:03:25.277398+00:00');

-- Insert topic_assignments data (1 records)
INSERT INTO topic_assignments (id, topic_id, user_id, assessment_assignment_id, status, started_at, completed_at, created_at, updated_at) VALUES ('a3737d2e-50f2-4595-ba00-1f4aa0223f5a', '005162ce-e08a-497d-955b-d5cc954fcebd', '4bffc056-a348-481b-a49e-f5d191ac203e', '94b5d86b-2f28-418c-9914-11a5f7711772', 'COMPLETED', NULL, '2025-04-27T12:03:25.796+00:00', '2025-03-21T02:59:19.432023+00:00', '2025-04-27T12:03:26.045516+00:00');

-- Insert submitted_answers data (6 records)
INSERT INTO submitted_answers (id, submission_id, question_id, answer_id, text_answer, is_correct, marks, created_at, updated_at) VALUES ('0f51e9ae-abfe-455c-9bd7-2890a84294e8', '33f5e35c-b431-4d10-ba85-474a5709bee9', 'f0a9f391-c50d-405d-8095-96ea10f17b14', NULL, 'Jenkins', NULL, NULL, '2025-03-15T12:07:01.611232+00:00', '2025-03-15T12:07:01.611232+00:00');
INSERT INTO submitted_answers (id, submission_id, question_id, answer_id, text_answer, is_correct, marks, created_at, updated_at) VALUES ('aad03faa-00d5-4476-981e-28bb7c45097b', '33f5e35c-b431-4d10-ba85-474a5709bee9', '17fb3bdf-624e-40fd-8c8f-f555107c6f05', 'b9f73757-c23d-46ab-9e69-811c0829588d', NULL, NULL, NULL, '2025-03-15T12:07:01.723767+00:00', '2025-03-15T12:07:01.723767+00:00');
INSERT INTO submitted_answers (id, submission_id, question_id, answer_id, text_answer, is_correct, marks, created_at, updated_at) VALUES ('1f6f2842-9972-4847-b3c9-7ad34b51375c', '33f5e35c-b431-4d10-ba85-474a5709bee9', '0b2c9875-4426-497a-a68d-004f30482d3a', 'b42a0fa9-f449-486b-8589-b74350996fc9', NULL, NULL, NULL, '2025-03-15T12:07:01.859321+00:00', '2025-03-15T12:07:01.859321+00:00');
INSERT INTO submitted_answers (id, submission_id, question_id, answer_id, text_answer, is_correct, marks, created_at, updated_at) VALUES ('e08f7ea7-66c4-42b6-84e7-b41db418e4a7', 'ab4b8354-5e13-4692-af1c-fd1e656433e3', 'f0a9f391-c50d-405d-8095-96ea10f17b14', NULL, 'Jenkins', NULL, NULL, '2025-04-27T12:03:25.531048+00:00', '2025-04-27T12:03:25.531048+00:00');
INSERT INTO submitted_answers (id, submission_id, question_id, answer_id, text_answer, is_correct, marks, created_at, updated_at) VALUES ('b399f10b-5e2b-487a-8c8e-f47875d4e525', 'ab4b8354-5e13-4692-af1c-fd1e656433e3', '17fb3bdf-624e-40fd-8c8f-f555107c6f05', 'b9f73757-c23d-46ab-9e69-811c0829588d', NULL, NULL, NULL, '2025-04-27T12:03:25.655127+00:00', '2025-04-27T12:03:25.655127+00:00');
INSERT INTO submitted_answers (id, submission_id, question_id, answer_id, text_answer, is_correct, marks, created_at, updated_at) VALUES ('5a62d289-56e9-4982-9429-2ab6a2a17eca', 'ab4b8354-5e13-4692-af1c-fd1e656433e3', '0b2c9875-4426-497a-a68d-004f30482d3a', 'b42a0fa9-f449-486b-8589-b74350996fc9', NULL, NULL, NULL, '2025-04-27T12:03:25.766997+00:00', '2025-04-27T12:03:25.766997+00:00');

-- Data extraction completed successfully

-- Commit the transaction
COMMIT;

-- Database schema and data import completed successfully
-- Total tables: 9
-- Total records imported: 368
-- Generated on: 2025-07-11T11:07:15Z

