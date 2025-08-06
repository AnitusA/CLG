-- MINIMAL TEST: Check what's actually in your database right now

-- 1. Basic table existence check
SELECT 
    EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'assignments') as assignments_exists,
    EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'records') as records_exists,
    EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'student_assignment_completions') as completion_table_exists;

-- 2. Count records in main tables  
SELECT 'assignments' as table_name, COUNT(*) as count FROM assignments WHERE EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'assignments')
UNION ALL
SELECT 'records' as table_name, COUNT(*) as count FROM records WHERE EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'records');

-- 3. If assignments exist, show first 3
SELECT 'SAMPLE ASSIGNMENTS (first 3):' as info;
SELECT id, title, subject, due_date 
FROM assignments 
WHERE EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'assignments')
LIMIT 3;
