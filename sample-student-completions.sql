-- Sample data for testing student-specific completions
-- Make sure to replace 'student_user_id_here' with actual student user IDs from your auth system

-- Sample student assignment completions
-- (assuming you have student IDs and assignment IDs)
INSERT INTO student_assignment_completions (student_id, assignment_id) VALUES
('student1', 1),  -- Student 1 completed assignment 1
('student1', 3),  -- Student 1 completed assignment 3
('student2', 2),  -- Student 2 completed assignment 2
('student3', 1),  -- Student 3 completed assignment 1
('student3', 2);  -- Student 3 completed assignment 2

-- Sample student record completions
-- (assuming you have student IDs and record IDs)
INSERT INTO student_record_completions (student_id, record_id) VALUES
('student1', 1),  -- Student 1 completed record 1
('student2', 1),  -- Student 2 completed record 1  
('student2', 3),  -- Student 2 completed record 3
('student3', 2);  -- Student 3 completed record 2

-- To see what each student has completed:
-- SELECT a.title, sac.completed_at 
-- FROM assignments a 
-- JOIN student_assignment_completions sac ON a.id = sac.assignment_id 
-- WHERE sac.student_id = 'student1';

-- SELECT r.title, src.completed_at 
-- FROM records r 
-- JOIN student_record_completions src ON r.id = src.record_id 
-- WHERE src.student_id = 'student1';
