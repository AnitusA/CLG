-- Check if the new completion tables exist and have the correct structure

-- Check student_assignment_completions table
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'student_assignment_completions'
ORDER BY ordinal_position;

-- Check student_record_completions table  
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'student_record_completions'
ORDER BY ordinal_position;

-- Check if indexes exist
SELECT 
    indexname, 
    indexdef
FROM pg_indexes 
WHERE tablename IN ('student_assignment_completions', 'student_record_completions');

-- Count completion records (should be 0 initially)
SELECT 
    'student_assignment_completions' as table_name,
    COUNT(*) as record_count
FROM student_assignment_completions
UNION ALL
SELECT 
    'student_record_completions' as table_name,
    COUNT(*) as record_count  
FROM student_record_completions;
