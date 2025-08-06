-- Quick test to verify the system works
-- Run this AFTER running the COMPLETE-SETUP-SCRIPT.sql

-- 1. Check if tables were created
SELECT 
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

-- 2. Show data counts
SELECT 
    'assignments' as table_name,
    COUNT(*) as count,
    CASE WHEN COUNT(*) > 0 THEN '✅ HAS DATA' ELSE '❌ EMPTY' END as status
FROM assignments

UNION ALL

SELECT 
    'records' as table_name,
    COUNT(*) as count,
    CASE WHEN COUNT(*) > 0 THEN '✅ HAS DATA' ELSE '❌ EMPTY' END as status
FROM records;

-- 3. Test student completion (simulate a student ticking assignment 1)
-- Replace 'test_student_123' with a real student ID from your students table
INSERT INTO student_assignment_completions (student_id, assignment_id)
VALUES ('test_student_123', 1)
ON CONFLICT (student_id, assignment_id) DO NOTHING;

-- 4. Verify the completion was recorded
SELECT 
    'test_student_123' as student_id,
    assignment_id,
    completed_at
FROM student_assignment_completions
WHERE student_id = 'test_student_123';

-- 5. Show what assignments this student would see as completed
SELECT 
    a.id,
    a.title,
    CASE WHEN sac.id IS NOT NULL THEN '✅ COMPLETED' ELSE '❌ NOT COMPLETED' END as status_for_test_student
FROM assignments a
LEFT JOIN student_assignment_completions sac 
    ON a.id = sac.assignment_id 
    AND sac.student_id = 'test_student_123'
ORDER BY a.id
LIMIT 3;

-- Success message
SELECT '🎉 SYSTEM TEST COMPLETED! If you see data above, the system is working correctly!' as result;
