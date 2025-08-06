-- Create sample assignments and records for testing
-- Run this in your Supabase SQL editor

-- Sample assignments
INSERT INTO assignments (title, description, subject, due_date, status) VALUES
('Math Assignment 1', 'Complete exercises 1-10 from Chapter 5', 'Mathematics', '2024-08-15', 'active'),
('History Essay', 'Write a 1000-word essay on World War II', 'History', '2024-08-20', 'active'),
('Science Lab Report', 'Submit lab report for Chemistry experiment', 'Chemistry', '2024-08-18', 'active'),
('English Literature Review', 'Analyze three poems by Shakespeare', 'English', '2024-08-25', 'active'),
('Physics Problem Set', 'Solve problems from Chapter 8', 'Physics', '2024-08-22', 'active');

-- Sample records
INSERT INTO records (title, description, record_date, category) VALUES
('Attendance Record - Week 1', 'Weekly attendance summary', '2024-08-05', 'attendance'),
('Quiz Results - Mathematics', 'Results from last week quiz', '2024-08-06', 'academic'),
('Library Book Return', 'Return borrowed books to library', '2024-08-10', 'administrative'),
('Sports Day Participation', 'Participation in annual sports day', '2024-08-12', 'extracurricular'),
('Parent-Teacher Meeting', 'Scheduled meeting with parents', '2024-08-15', 'administrative');

-- Check if data was inserted
SELECT 'assignments' as table_name, COUNT(*) as count FROM assignments
UNION ALL
SELECT 'records' as table_name, COUNT(*) as count FROM records;
