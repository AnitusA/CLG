-- DIAGNOSTIC: Check if ticking tables exist and are set up correctly

-- 1. Check if completion tables exist
SELECT 
    'Table Existence Check' as test_type,
    table_name,
    CASE WHEN table_name IN (
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
    ) THEN '✅ EXISTS' ELSE '❌ MISSING' END as status
FROM (
    VALUES 
    ('assignments'),
    ('records'),
    ('student_assignment_completions'),
    ('student_record_completions')
) as t(table_name);

-- 2. Check table structures
SELECT 'student_assignment_completions structure:' as info;
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'student_assignment_completions'
ORDER BY ordinal_position;

SELECT 'student_record_completions structure:' as info;
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'student_record_completions'
ORDER BY ordinal_position;

-- 3. Check if there's sample data
SELECT 'Data Check:' as info;
SELECT 'assignments' as table_name, COUNT(*) as count FROM assignments
UNION ALL
SELECT 'records' as table_name, COUNT(*) as count FROM records
UNION ALL
SELECT 'student_assignment_completions' as table_name, COUNT(*) as count FROM student_assignment_completions
UNION ALL
SELECT 'student_record_completions' as table_name, COUNT(*) as count FROM student_record_completions;

-- 4. Show sample assignments if they exist
SELECT 'Sample Assignments:' as info;
SELECT id, title, subject FROM assignments LIMIT 3;
