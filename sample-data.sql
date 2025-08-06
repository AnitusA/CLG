-- Sample data for testing the tick functionality
-- Run this in Supabase SQL editor if you need test data

-- First, ensure the tables have the completed_by_student column
ALTER TABLE assignments ADD COLUMN IF NOT EXISTS completed_by_student BOOLEAN DEFAULT FALSE;
ALTER TABLE records ADD COLUMN IF NOT EXISTS completed_by_student BOOLEAN DEFAULT FALSE;

-- Insert sample assignments if none exist
INSERT INTO assignments (title, description, subject, due_date, status, completed_by_student) 
SELECT 
  'Math Assignment 1',
  'Complete exercises 1-20 from chapter 3',
  'Mathematics',
  CURRENT_DATE + INTERVAL '7 days',
  'active',
  FALSE
WHERE NOT EXISTS (SELECT 1 FROM assignments LIMIT 1);

INSERT INTO assignments (title, description, subject, due_date, status, completed_by_student) 
SELECT 
  'Physics Lab Report',
  'Write a detailed report on the pendulum experiment',
  'Physics',
  CURRENT_DATE + INTERVAL '5 days',
  'active',
  FALSE
WHERE NOT EXISTS (SELECT 1 FROM assignments WHERE title = 'Physics Lab Report');

-- Insert sample records if none exist
INSERT INTO records (subject, description, record_date, completed_by_student) 
SELECT 
  'Chemistry',
  'Outstanding performance in organic chemistry quiz',
  CURRENT_DATE,
  FALSE
WHERE NOT EXISTS (SELECT 1 FROM records LIMIT 1);

INSERT INTO records (subject, description, record_date, completed_by_student) 
SELECT 
  'English',
  'Excellent essay on modern literature',
  CURRENT_DATE - INTERVAL '2 days',
  FALSE
WHERE NOT EXISTS (SELECT 1 FROM records WHERE subject = 'English');
