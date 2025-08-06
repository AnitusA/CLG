-- Debug queries to check what's in the database

-- 1. Check if assignments table exists and has data
SELECT COUNT(*) as assignment_count FROM assignments;

-- 2. Check if records table exists and has data  
SELECT COUNT(*) as record_count FROM records;

-- 3. Check if completion tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_name IN ('student_assignment_completions', 'student_record_completions');

-- 4. Show sample assignments
SELECT id, title, subject, due_date FROM assignments LIMIT 5;

-- 5. Show sample records
SELECT id, title, record_date FROM records LIMIT 5;

-- 6. Check if old completion columns exist
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'assignments' AND column_name = 'completed_by_student';

SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'records' AND column_name = 'completed_by_student';
