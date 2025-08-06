-- COMPLETE STUDENT-SPECIFIC COMPLETION SYSTEM SETUP
-- Copy and paste this ENTIRE script into your Supabase SQL Editor
-- This will set up everything needed for student-specific tick functionality

-- ================================================
-- PART 1: ENSURE BASE TABLES EXIST
-- ================================================

-- Create assignments table if it doesn't exist
CREATE TABLE IF NOT EXISTS assignments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    subject VARCHAR(100) NOT NULL,
    due_date DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create records table if it doesn't exist
CREATE TABLE IF NOT EXISTS records (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    record_date DATE NOT NULL DEFAULT CURRENT_DATE,
    category VARCHAR(50) DEFAULT 'general',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ================================================
-- PART 2: CREATE STUDENT-SPECIFIC COMPLETION TABLES
-- ================================================

-- Drop old completion tables if they exist (to ensure clean setup)
DROP TABLE IF EXISTS student_assignment_completions CASCADE;
DROP TABLE IF EXISTS student_record_completions CASCADE;

-- Create student assignment completion tracking
CREATE TABLE student_assignment_completions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    student_id TEXT NOT NULL,
    assignment_id UUID NOT NULL REFERENCES assignments(id) ON DELETE CASCADE,
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(student_id, assignment_id)
);

-- Create student record completion tracking
CREATE TABLE student_record_completions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    student_id TEXT NOT NULL,
    record_id UUID NOT NULL REFERENCES records(id) ON DELETE CASCADE,
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(student_id, record_id)
);

-- ================================================
-- PART 3: CREATE INDEXES FOR PERFORMANCE
-- ================================================

-- Indexes for assignment completions
CREATE INDEX idx_student_assignment_completions_student_id ON student_assignment_completions(student_id);
CREATE INDEX idx_student_assignment_completions_assignment_id ON student_assignment_completions(assignment_id);

-- Indexes for record completions
CREATE INDEX idx_student_record_completions_student_id ON student_record_completions(student_id);
CREATE INDEX idx_student_record_completions_record_id ON student_record_completions(record_id);

-- ================================================
-- PART 4: INSERT SAMPLE DATA (IF TABLES ARE EMPTY)
-- ================================================

-- Insert sample assignments if table is empty
DO $$
BEGIN
    IF (SELECT COUNT(*) FROM assignments) = 0 THEN
        INSERT INTO assignments (title, description, subject, due_date, status) VALUES
        ('Mathematics Assignment 1', 'Complete exercises 1-15 from Chapter 5: Quadratic Equations', 'Mathematics', CURRENT_DATE + INTERVAL '7 days', 'active'),
        ('History Essay', 'Write a 1200-word essay on the causes of World War II', 'History', CURRENT_DATE + INTERVAL '14 days', 'active'),
        ('Chemistry Lab Report', 'Submit detailed lab report for Acid-Base Titration experiment', 'Chemistry', CURRENT_DATE + INTERVAL '10 days', 'active'),
        ('English Literature Analysis', 'Analyze themes in three Shakespearean sonnets', 'English', CURRENT_DATE + INTERVAL '21 days', 'active'),
        ('Physics Problem Set', 'Solve all problems from Chapter 8: Waves and Oscillations', 'Physics', CURRENT_DATE + INTERVAL '12 days', 'active'),
        ('Computer Science Project', 'Build a simple calculator using JavaScript', 'Computer Science', CURRENT_DATE + INTERVAL '28 days', 'active'),
        ('Biology Research Paper', 'Research paper on photosynthesis process', 'Biology', CURRENT_DATE + INTERVAL '18 days', 'active');
        
        RAISE NOTICE 'Sample assignments inserted successfully!';
    ELSE
        RAISE NOTICE 'Assignments table already contains data - skipping sample data insertion';
    END IF;
END $$;

-- Insert sample records if table is empty
DO $$
BEGIN
    IF (SELECT COUNT(*) FROM records) = 0 THEN
        INSERT INTO records (title, description, record_date, category) VALUES
        ('Week 1 Attendance Record', 'Weekly attendance summary for all subjects', CURRENT_DATE - INTERVAL '5 days', 'attendance'),
        ('Mathematics Quiz Results', 'Results from Chapter 4 quiz on Algebra', CURRENT_DATE - INTERVAL '3 days', 'academic'),
        ('Library Book Return Notice', 'Return borrowed books: "Advanced Physics" and "Chemistry Basics"', CURRENT_DATE + INTERVAL '5 days', 'administrative'),
        ('Annual Sports Day Registration', 'Register for participation in annual sports day events', CURRENT_DATE + INTERVAL '15 days', 'extracurricular'),
        ('Parent-Teacher Conference', 'Scheduled meeting with parents to discuss academic progress', CURRENT_DATE + INTERVAL '10 days', 'administrative'),
        ('Science Fair Project Submission', 'Submit project proposal for school science fair', CURRENT_DATE + INTERVAL '20 days', 'academic'),
        ('Student Council Election', 'Cast your vote for student council representatives', CURRENT_DATE + INTERVAL '8 days', 'extracurricular'),
        ('Monthly Fee Payment', 'Monthly tuition fee payment deadline', CURRENT_DATE + INTERVAL '25 days', 'financial');
        
        RAISE NOTICE 'Sample records inserted successfully!';
    ELSE
        RAISE NOTICE 'Records table already contains data - skipping sample data insertion';
    END IF;
END $$;

-- ================================================
-- PART 5: VERIFICATION AND RESULTS
-- ================================================

-- Show table counts
SELECT 
    'assignments' as table_name, 
    COUNT(*) as record_count,
    'Total assignments available' as description
FROM assignments

UNION ALL

SELECT 
    'records' as table_name, 
    COUNT(*) as record_count,
    'Total records available' as description
FROM records

UNION ALL

SELECT 
    'student_assignment_completions' as table_name, 
    COUNT(*) as record_count,
    'Student completion records (should be 0 initially)' as description
FROM student_assignment_completions

UNION ALL

SELECT 
    'student_record_completions' as table_name, 
    COUNT(*) as record_count,
    'Student record completions (should be 0 initially)' as description
FROM student_record_completions;

-- Show sample assignments
SELECT 
    'SAMPLE ASSIGNMENTS:' as info, 
    '' as id, 
    '' as title, 
    '' as subject, 
    '' as due_date

UNION ALL

SELECT 
    '' as info,
    id::text, 
    LEFT(title, 40) as title, 
    subject, 
    due_date::text
FROM assignments 
ORDER BY created_at
LIMIT 5;

-- Show sample records
SELECT 
    'SAMPLE RECORDS:' as info, 
    '' as id, 
    '' as title, 
    '' as category, 
    '' as record_date

UNION ALL

SELECT 
    '' as info,
    id::text, 
    LEFT(title, 40) as title, 
    category, 
    record_date::text
FROM records 
ORDER BY created_at
LIMIT 5;

-- ================================================
-- SETUP COMPLETE MESSAGE
-- ================================================

DO $$
BEGIN
    RAISE NOTICE '======================================';
    RAISE NOTICE 'STUDENT-SPECIFIC COMPLETION SYSTEM SETUP COMPLETE!';
    RAISE NOTICE '======================================';
    RAISE NOTICE 'Tables created:';
    RAISE NOTICE '✓ assignments';
    RAISE NOTICE '✓ records';
    RAISE NOTICE '✓ student_assignment_completions';
    RAISE NOTICE '✓ student_record_completions';
    RAISE NOTICE '';
    RAISE NOTICE 'What this means:';
    RAISE NOTICE '• Each student can tick assignments/records independently';
    RAISE NOTICE '• Ticking only affects the current student dashboard';
    RAISE NOTICE '• Navigation counts are student-specific';
    RAISE NOTICE '• No student affects another students completion status';
    RAISE NOTICE '';
    RAISE NOTICE 'Next steps:';
    RAISE NOTICE '1. Refresh your application at http://localhost:5174';
    RAISE NOTICE '2. Login as a student';
    RAISE NOTICE '3. Navigate to /student/assignments';
    RAISE NOTICE '4. Navigate to /student/record';
    RAISE NOTICE '5. Test the tick functionality!';
    RAISE NOTICE '';
    RAISE NOTICE 'Setup completed successfully! 🎉';
END $$;
