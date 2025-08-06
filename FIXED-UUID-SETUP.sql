-- FIXED: UUID-Compatible Student Completion System
-- This version works with existing UUID-based assignments and records tables
-- Copy and paste this ENTIRE script into your Supabase SQL Editor

-- ================================================
-- PART 1: FIRST CHECK YOUR EXISTING TABLE STRUCTURE
-- ================================================

DO $$
DECLARE
    assignments_id_type TEXT;
    records_id_type TEXT;
BEGIN
    -- Check assignments table ID type
    SELECT data_type INTO assignments_id_type
    FROM information_schema.columns
    WHERE table_name = 'assignments' AND column_name = 'id';
    
    -- Check records table ID type  
    SELECT data_type INTO records_id_type
    FROM information_schema.columns
    WHERE table_name = 'records' AND column_name = 'id';
    
    RAISE NOTICE 'Current table structure:';
    RAISE NOTICE 'assignments.id type: %', COALESCE(assignments_id_type, 'TABLE NOT FOUND');
    RAISE NOTICE 'records.id type: %', COALESCE(records_id_type, 'TABLE NOT FOUND');
END $$;

-- ================================================
-- PART 2: DROP AND RECREATE COMPLETION TABLES
-- ================================================

-- Drop old completion tables completely
DROP TABLE IF EXISTS student_assignment_completions CASCADE;
DROP TABLE IF EXISTS student_record_completions CASCADE;

-- Create UUID-compatible completion tables
CREATE TABLE student_assignment_completions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    student_id TEXT NOT NULL,
    assignment_id UUID NOT NULL,
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(student_id, assignment_id)
);

CREATE TABLE student_record_completions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    student_id TEXT NOT NULL,
    record_id UUID NOT NULL,
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(student_id, record_id)
);

-- Add foreign key constraints ONLY if the referenced tables exist
DO $$
BEGIN
    -- Add foreign key for assignments if table exists
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'assignments') THEN
        ALTER TABLE student_assignment_completions 
        ADD CONSTRAINT fk_assignment 
        FOREIGN KEY (assignment_id) REFERENCES assignments(id) ON DELETE CASCADE;
        RAISE NOTICE '✓ Added foreign key constraint for assignments';
    ELSE
        RAISE NOTICE '⚠ assignments table not found - skipping foreign key';
    END IF;
    
    -- Add foreign key for records if table exists
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'records') THEN
        ALTER TABLE student_record_completions 
        ADD CONSTRAINT fk_record 
        FOREIGN KEY (record_id) REFERENCES records(id) ON DELETE CASCADE;
        RAISE NOTICE '✓ Added foreign key constraint for records';
    ELSE
        RAISE NOTICE '⚠ records table not found - skipping foreign key';
    END IF;
END $$;

-- ================================================
-- PART 3: CREATE INDEXES
-- ================================================

CREATE INDEX idx_student_assignment_completions_student_id ON student_assignment_completions(student_id);
CREATE INDEX idx_student_assignment_completions_assignment_id ON student_assignment_completions(assignment_id);
CREATE INDEX idx_student_record_completions_student_id ON student_record_completions(student_id);
CREATE INDEX idx_student_record_completions_record_id ON student_record_completions(record_id);

-- ================================================
-- PART 4: CREATE SAMPLE DATA IF TABLES ARE EMPTY
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

-- Insert sample data if tables are empty
DO $$
BEGIN
    -- Sample assignments
    IF (SELECT COUNT(*) FROM assignments) = 0 THEN
        INSERT INTO assignments (title, description, subject, due_date, status) VALUES
        ('Mathematics Assignment 1', 'Complete exercises 1-15 from Chapter 5: Quadratic Equations', 'Mathematics', CURRENT_DATE + INTERVAL '7 days', 'active'),
        ('History Essay', 'Write a 1200-word essay on the causes of World War II', 'History', CURRENT_DATE + INTERVAL '14 days', 'active'),
        ('Chemistry Lab Report', 'Submit detailed lab report for Acid-Base Titration experiment', 'Chemistry', CURRENT_DATE + INTERVAL '10 days', 'active'),
        ('English Literature Analysis', 'Analyze themes in three Shakespearean sonnets', 'English', CURRENT_DATE + INTERVAL '21 days', 'active'),
        ('Physics Problem Set', 'Solve all problems from Chapter 8: Waves and Oscillations', 'Physics', CURRENT_DATE + INTERVAL '12 days', 'active');
        RAISE NOTICE '✅ Sample assignments created successfully!';
    ELSE
        RAISE NOTICE '✅ Assignments table already contains % records', (SELECT COUNT(*) FROM assignments);
    END IF;
    
    -- Sample records
    IF (SELECT COUNT(*) FROM records) = 0 THEN
        INSERT INTO records (title, description, record_date, category) VALUES
        ('Week 1 Attendance Record', 'Weekly attendance summary for all subjects', CURRENT_DATE - INTERVAL '5 days', 'attendance'),
        ('Mathematics Quiz Results', 'Results from Chapter 4 quiz on Algebra', CURRENT_DATE - INTERVAL '3 days', 'academic'),
        ('Library Book Return Notice', 'Return borrowed books: "Advanced Physics" and "Chemistry Basics"', CURRENT_DATE + INTERVAL '5 days', 'administrative'),
        ('Annual Sports Day Registration', 'Register for participation in annual sports day events', CURRENT_DATE + INTERVAL '15 days', 'extracurricular'),
        ('Parent-Teacher Conference', 'Scheduled meeting with parents to discuss academic progress', CURRENT_DATE + INTERVAL '10 days', 'administrative');
        RAISE NOTICE '✅ Sample records created successfully!';
    ELSE
        RAISE NOTICE '✅ Records table already contains % records', (SELECT COUNT(*) FROM records);
    END IF;
END $$;

-- ================================================
-- PART 5: FINAL VERIFICATION
-- ================================================

-- Show final status
SELECT 
    'COMPLETION SYSTEM STATUS' as status_check,
    '' as table_name,
    '' as count,
    '' as notes

UNION ALL

SELECT 
    '',
    'assignments' as table_name,
    COUNT(*)::text as count,
    CASE WHEN COUNT(*) > 0 THEN '✅ Ready' ELSE '❌ Empty' END as notes
FROM assignments

UNION ALL

SELECT 
    '',
    'records' as table_name,
    COUNT(*)::text as count,
    CASE WHEN COUNT(*) > 0 THEN '✅ Ready' ELSE '❌ Empty' END as notes
FROM records

UNION ALL

SELECT 
    '',
    'student_assignment_completions' as table_name,
    COUNT(*)::text as count,
    '✅ Ready for ticking' as notes
FROM student_assignment_completions

UNION ALL

SELECT 
    '',
    'student_record_completions' as table_name,
    COUNT(*)::text as count,
    '✅ Ready for ticking' as notes
FROM student_record_completions;

-- Show sample data
SELECT 'SAMPLE ASSIGNMENTS (UUID-based):' as sample_data;
SELECT 
    LEFT(id::text, 8) || '...' as short_id,
    LEFT(title, 30) as title,
    subject,
    due_date::text as due_date
FROM assignments 
LIMIT 3;

SELECT 'SAMPLE RECORDS (UUID-based):' as sample_data;
SELECT 
    LEFT(id::text, 8) || '...' as short_id,
    LEFT(title, 30) as title,
    category,
    record_date::text as record_date
FROM records 
LIMIT 3;

-- Final success message
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '🎉 SETUP COMPLETED SUCCESSFULLY!';
    RAISE NOTICE '';
    RAISE NOTICE '✅ UUID-compatible completion tables created';
    RAISE NOTICE '✅ Foreign key constraints added (where applicable)';
    RAISE NOTICE '✅ Sample data inserted (if tables were empty)';
    RAISE NOTICE '✅ Ready for student-specific ticking!';
    RAISE NOTICE '';
    RAISE NOTICE '🚀 Next steps:';
    RAISE NOTICE '1. Refresh your browser at http://localhost:5174';
    RAISE NOTICE '2. Go to /student/assignments';
    RAISE NOTICE '3. Try clicking the tick buttons!';
    RAISE NOTICE '';
    RAISE NOTICE 'The error should now be fixed! 🎯';
END $$;
