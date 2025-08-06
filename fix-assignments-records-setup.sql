-- Complete setup script to fix assignments and records not showing
-- Run this entire script in your Supabase SQL Editor

-- 1. First check if tables exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'assignments') THEN
        RAISE NOTICE 'Creating assignments table...';
        CREATE TABLE assignments (
            id SERIAL PRIMARY KEY,
            title TEXT NOT NULL,
            description TEXT NOT NULL,
            subject VARCHAR(100) NOT NULL,
            due_date DATE NOT NULL,
            status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'records') THEN
        RAISE NOTICE 'Creating records table...';
        CREATE TABLE records (
            id SERIAL PRIMARY KEY,
            title TEXT NOT NULL,
            description TEXT,
            record_date DATE NOT NULL DEFAULT CURRENT_DATE,
            category VARCHAR(50) DEFAULT 'general',
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
    END IF;
END $$;

-- 2. Create completion tables for student-specific tracking
CREATE TABLE IF NOT EXISTS student_assignment_completions (
    id SERIAL PRIMARY KEY,
    student_id TEXT NOT NULL,
    assignment_id INTEGER NOT NULL REFERENCES assignments(id) ON DELETE CASCADE,
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(student_id, assignment_id)
);

CREATE TABLE IF NOT EXISTS student_record_completions (
    id SERIAL PRIMARY KEY,
    student_id TEXT NOT NULL,
    record_id INTEGER NOT NULL REFERENCES records(id) ON DELETE CASCADE,
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(student_id, record_id)
);

-- 3. Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_student_assignment_completions_student_id ON student_assignment_completions(student_id);
CREATE INDEX IF NOT EXISTS idx_student_assignment_completions_assignment_id ON student_assignment_completions(assignment_id);
CREATE INDEX IF NOT EXISTS idx_student_record_completions_student_id ON student_record_completions(student_id);
CREATE INDEX IF NOT EXISTS idx_student_record_completions_record_id ON student_record_completions(record_id);

-- 4. Insert sample assignments (only if table is empty)
DO $$
BEGIN
    IF (SELECT COUNT(*) FROM assignments) = 0 THEN
        RAISE NOTICE 'Inserting sample assignments...';
        INSERT INTO assignments (title, description, subject, due_date, status) VALUES
        ('Math Assignment 1', 'Complete exercises 1-10 from Chapter 5', 'Mathematics', CURRENT_DATE + INTERVAL '7 days', 'active'),
        ('History Essay', 'Write a 1000-word essay on World War II', 'History', CURRENT_DATE + INTERVAL '14 days', 'active'),
        ('Science Lab Report', 'Submit lab report for Chemistry experiment', 'Chemistry', CURRENT_DATE + INTERVAL '10 days', 'active'),
        ('English Literature Review', 'Analyze three poems by Shakespeare', 'English', CURRENT_DATE + INTERVAL '21 days', 'active'),
        ('Physics Problem Set', 'Solve problems from Chapter 8', 'Physics', CURRENT_DATE + INTERVAL '12 days', 'active');
    END IF;
END $$;

-- 5. Insert sample records (only if table is empty)
DO $$
BEGIN
    IF (SELECT COUNT(*) FROM records) = 0 THEN
        RAISE NOTICE 'Inserting sample records...';
        INSERT INTO records (title, description, record_date, category) VALUES
        ('Attendance Record - Week 1', 'Weekly attendance summary', CURRENT_DATE - INTERVAL '3 days', 'attendance'),
        ('Quiz Results - Mathematics', 'Results from last week quiz', CURRENT_DATE - INTERVAL '2 days', 'academic'),
        ('Library Book Return', 'Return borrowed books to library', CURRENT_DATE + INTERVAL '5 days', 'administrative'),
        ('Sports Day Participation', 'Participation in annual sports day', CURRENT_DATE + INTERVAL '7 days', 'extracurricular'),
        ('Parent-Teacher Meeting', 'Scheduled meeting with parents', CURRENT_DATE + INTERVAL '10 days', 'administrative');
    END IF;
END $$;

-- 6. Show results
SELECT 'assignments' as table_name, COUNT(*) as count FROM assignments
UNION ALL
SELECT 'records' as table_name, COUNT(*) as count FROM records
UNION ALL
SELECT 'student_assignment_completions' as table_name, COUNT(*) as count FROM student_assignment_completions
UNION ALL
SELECT 'student_record_completions' as table_name, COUNT(*) as count FROM student_record_completions;

-- 7. Show sample data
SELECT 'Sample Assignments:' as info;
SELECT id, title, subject, due_date FROM assignments LIMIT 3;

SELECT 'Sample Records:' as info;
SELECT id, title, category, record_date FROM records LIMIT 3;
