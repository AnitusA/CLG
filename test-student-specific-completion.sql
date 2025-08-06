-- Test script to verify student-specific completion works correctly
-- Run this in Supabase SQL Editor after setting up the tables

-- 1. First, let's see what students exist
SELECT id, register_number FROM students LIMIT 5;

-- 2. Check current assignments
SELECT id, title, subject FROM assignments LIMIT 5;

-- 3. Create some test completions for different students
-- (Replace 'test_student_1', 'test_student_2' with actual student IDs)

-- Test Student 1 completes assignment 1
INSERT INTO student_assignment_completions (student_id, assignment_id) 
VALUES ('test_student_1', 1)
ON CONFLICT (student_id, assignment_id) DO NOTHING;

-- Test Student 2 completes assignment 1 and 2
INSERT INTO student_assignment_completions (student_id, assignment_id) 
VALUES ('test_student_2', 1), ('test_student_2', 2)
ON CONFLICT (student_id, assignment_id) DO NOTHING;

-- 4. Verify the completions are separate for each student
SELECT 
    'Student 1 Completions' as info,
    COUNT(*) as completed_assignments
FROM student_assignment_completions 
WHERE student_id = 'test_student_1'

UNION ALL

SELECT 
    'Student 2 Completions' as info,
    COUNT(*) as completed_assignments
FROM student_assignment_completions 
WHERE student_id = 'test_student_2';

-- 5. Show what each student would see
SELECT 
    a.id,
    a.title,
    CASE WHEN sac.id IS NOT NULL THEN 'COMPLETED' ELSE 'NOT COMPLETED' END as status_for_student_1
FROM assignments a
LEFT JOIN student_assignment_completions sac 
    ON a.id = sac.assignment_id AND sac.student_id = 'test_student_1'
ORDER BY a.id;

SELECT 
    a.id,
    a.title,
    CASE WHEN sac.id IS NOT NULL THEN 'COMPLETED' ELSE 'NOT COMPLETED' END as status_for_student_2
FROM assignments a
LEFT JOIN student_assignment_completions sac 
    ON a.id = sac.assignment_id AND sac.student_id = 'test_student_2'
ORDER BY a.id;
