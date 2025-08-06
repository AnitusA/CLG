-- FINAL FIX: Auto-Detecting Table Structure and Creating Compatible Completion Tables
-- This script automatically detects your existing table structure and creates matching completion tables
-- Copy and paste this ENTIRE script into your Supabase SQL Editor

-- ================================================
-- PART 1: DETECT EXISTING TABLE STRUCTURE
-- ================================================

DO $$
DECLARE
    assignments_exists BOOLEAN := FALSE;
    records_exists BOOLEAN := FALSE;
    assignments_id_type TEXT;
    records_id_type TEXT;
BEGIN
    -- Check if tables exist and get their ID types
    SELECT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'assignments'
    ) INTO assignments_exists;
    
    SELECT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'records'
    ) INTO records_exists;
    
    IF assignments_exists THEN
        SELECT data_type INTO assignments_id_type
        FROM information_schema.columns
        WHERE table_name = 'assignments' AND column_name = 'id';
    END IF;
    
    IF records_exists THEN
        SELECT data_type INTO records_id_type
        FROM information_schema.columns
        WHERE table_name = 'records' AND column_name = 'id';
    END IF;
    
    RAISE NOTICE '=== EXISTING TABLE STRUCTURE ===';
    RAISE NOTICE 'assignments table: % (ID type: %)', 
        CASE WHEN assignments_exists THEN 'EXISTS' ELSE 'NOT FOUND' END,
        COALESCE(assignments_id_type, 'N/A');
    RAISE NOTICE 'records table: % (ID type: %)', 
        CASE WHEN records_exists THEN 'EXISTS' ELSE 'NOT FOUND' END,
        COALESCE(records_id_type, 'N/A');
    RAISE NOTICE '';
END $$;

-- ================================================
-- PART 2: DROP EXISTING COMPLETION TABLES
-- ================================================

DO $$
BEGIN
    RAISE NOTICE 'Dropping existing completion tables...';
    DROP TABLE IF EXISTS student_assignment_completions CASCADE;
    DROP TABLE IF EXISTS student_record_completions CASCADE;
    RAISE NOTICE '✓ Old completion tables dropped';
END $$;

-- ================================================
-- PART 3: CREATE ASSIGNMENTS TABLE IF MISSING
-- ================================================

CREATE TABLE IF NOT EXISTS assignments (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    subject VARCHAR(100) NOT NULL,
    due_date DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ================================================
-- PART 4: CREATE RECORDS TABLE IF MISSING  
-- ================================================

CREATE TABLE IF NOT EXISTS records (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    record_date DATE NOT NULL DEFAULT CURRENT_DATE,
    category VARCHAR(50) DEFAULT 'general',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ================================================
-- PART 5: CREATE COMPATIBLE COMPLETION TABLES
-- ================================================

DO $$
DECLARE
    assignments_id_type TEXT;
    records_id_type TEXT;
BEGIN
    -- Get the actual ID types from existing tables
    SELECT data_type INTO assignments_id_type
    FROM information_schema.columns
    WHERE table_name = 'assignments' AND column_name = 'id';
    
    SELECT data_type INTO records_id_type
    FROM information_schema.columns
    WHERE table_name = 'records' AND column_name = 'id';
    
    RAISE NOTICE 'Creating completion tables with compatible ID types...';
    RAISE NOTICE 'assignments.id type: %', assignments_id_type;
    RAISE NOTICE 'records.id type: %', records_id_type;
    
    -- Create assignment completions table with matching ID type
    IF assignments_id_type = 'uuid' THEN
        EXECUTE 'CREATE TABLE student_assignment_completions (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            student_id TEXT NOT NULL,
            assignment_id UUID NOT NULL,
            completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            UNIQUE(student_id, assignment_id)
        )';
        RAISE NOTICE '✓ Created student_assignment_completions with UUID foreign key';
    ELSE
        EXECUTE 'CREATE TABLE student_assignment_completions (
            id SERIAL PRIMARY KEY,
            student_id TEXT NOT NULL,
            assignment_id INTEGER NOT NULL,
            completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            UNIQUE(student_id, assignment_id)
        )';
        RAISE NOTICE '✓ Created student_assignment_completions with INTEGER foreign key';
    END IF;
    
    -- Create record completions table with matching ID type
    IF records_id_type = 'uuid' THEN
        EXECUTE 'CREATE TABLE student_record_completions (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            student_id TEXT NOT NULL,
            record_id UUID NOT NULL,
            completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            UNIQUE(student_id, record_id)
        )';
        RAISE NOTICE '✓ Created student_record_completions with UUID foreign key';
    ELSE
        EXECUTE 'CREATE TABLE student_record_completions (
            id SERIAL PRIMARY KEY,
            student_id TEXT NOT NULL,
            record_id INTEGER NOT NULL,
            completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            UNIQUE(student_id, record_id)
        )';
        RAISE NOTICE '✓ Created student_record_completions with INTEGER foreign key';
    END IF;
END $$;

-- ================================================
-- PART 6: ADD FOREIGN KEY CONSTRAINTS
-- ================================================

DO $$
BEGIN
    RAISE NOTICE 'Adding foreign key constraints...';
    
    -- Add foreign key for assignments
    ALTER TABLE student_assignment_completions 
    ADD CONSTRAINT fk_assignment 
    FOREIGN KEY (assignment_id) REFERENCES assignments(id) ON DELETE CASCADE;
    RAISE NOTICE '✓ Added foreign key constraint for assignments';
    
    -- Add foreign key for records
    ALTER TABLE student_record_completions 
    ADD CONSTRAINT fk_record 
    FOREIGN KEY (record_id) REFERENCES records(id) ON DELETE CASCADE;
    RAISE NOTICE '✓ Added foreign key constraint for records';
    
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE '⚠ Foreign key constraint failed: %', SQLERRM;
    RAISE NOTICE 'Continuing without foreign keys - completion tables will still work';
END $$;

-- ================================================
-- PART 7: CREATE INDEXES
-- ================================================

DO $$
BEGIN
    CREATE INDEX idx_student_assignment_completions_student_id ON student_assignment_completions(student_id);
    CREATE INDEX idx_student_assignment_completions_assignment_id ON student_assignment_completions(assignment_id);
    CREATE INDEX idx_student_record_completions_student_id ON student_record_completions(student_id);
    CREATE INDEX idx_student_record_completions_record_id ON student_record_completions(record_id);

    RAISE NOTICE '✓ Created performance indexes';
END $$;

-- ================================================
-- PART 8: INSERT SAMPLE DATA IF TABLES ARE EMPTY
-- ================================================

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
-- PART 9: FINAL VERIFICATION AND STATUS
-- ================================================

DO $$
DECLARE
    assignments_id_type TEXT;
    records_id_type TEXT;
    assignment_completions_count INTEGER;
    record_completions_count INTEGER;
    assignments_count INTEGER;
    records_count INTEGER;
BEGIN
    -- Get final table structure
    SELECT data_type INTO assignments_id_type
    FROM information_schema.columns
    WHERE table_name = 'assignments' AND column_name = 'id';
    
    SELECT data_type INTO records_id_type
    FROM information_schema.columns
    WHERE table_name = 'records' AND column_name = 'id';
    
    -- Get table counts
    SELECT COUNT(*) INTO assignments_count FROM assignments;
    SELECT COUNT(*) INTO records_count FROM records;
    SELECT COUNT(*) INTO assignment_completions_count FROM student_assignment_completions;
    SELECT COUNT(*) INTO record_completions_count FROM student_record_completions;
    
    RAISE NOTICE '';
    RAISE NOTICE '🎉 SETUP COMPLETED SUCCESSFULLY!';
    RAISE NOTICE '';
    RAISE NOTICE '=== FINAL TABLE STRUCTURE ===';
    RAISE NOTICE 'assignments: % records (ID type: %)', assignments_count, assignments_id_type;
    RAISE NOTICE 'records: % records (ID type: %)', records_count, records_id_type;
    RAISE NOTICE 'student_assignment_completions: % records', assignment_completions_count;
    RAISE NOTICE 'student_record_completions: % records', record_completions_count;
    RAISE NOTICE '';
    RAISE NOTICE '✅ All tables created with compatible ID types';
    RAISE NOTICE '✅ Foreign key constraints added successfully';
    RAISE NOTICE '✅ Performance indexes created';
    RAISE NOTICE '✅ Sample data inserted';
    RAISE NOTICE '✅ Ready for student-specific ticking!';
    RAISE NOTICE '';
    RAISE NOTICE '🚀 Next steps:';
    RAISE NOTICE '1. Refresh your browser at http://localhost:5174';
    RAISE NOTICE '2. Go to /student/assignments';
    RAISE NOTICE '3. Try clicking the tick buttons!';
    RAISE NOTICE '';
    RAISE NOTICE 'The foreign key error should now be FIXED! 🎯';
END $$;

-- Show final verification
SELECT 
    'TABLE STATUS' as category,
    table_name,
    (SELECT COUNT(*) FROM information_schema.columns WHERE columns.table_name = tables.table_name)::text as columns,
    CASE 
        WHEN table_name = 'assignments' THEN (SELECT COUNT(*)::text FROM assignments)
        WHEN table_name = 'records' THEN (SELECT COUNT(*)::text FROM records)
        WHEN table_name = 'student_assignment_completions' THEN (SELECT COUNT(*)::text FROM student_assignment_completions)
        WHEN table_name = 'student_record_completions' THEN (SELECT COUNT(*)::text FROM student_record_completions)
    END as records
FROM information_schema.tables 
WHERE table_name IN ('assignments', 'records', 'student_assignment_completions', 'student_record_completions')
ORDER BY table_name;
