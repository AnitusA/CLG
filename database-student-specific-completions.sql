-- Updated database schema for student-specific completion tracking
-- This creates separate tracking tables for each student's completion status

-- Create student_assignment_completions table
CREATE TABLE IF NOT EXISTS student_assignment_completions (
    id SERIAL PRIMARY KEY,
    student_id TEXT NOT NULL,
    assignment_id INTEGER NOT NULL REFERENCES assignments(id) ON DELETE CASCADE,
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(student_id, assignment_id)
);

-- Create student_record_completions table  
CREATE TABLE IF NOT EXISTS student_record_completions (
    id SERIAL PRIMARY KEY,
    student_id TEXT NOT NULL,
    record_id INTEGER NOT NULL REFERENCES records(id) ON DELETE CASCADE,
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(student_id, record_id)
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_student_assignment_completions_student_id ON student_assignment_completions(student_id);
CREATE INDEX IF NOT EXISTS idx_student_assignment_completions_assignment_id ON student_assignment_completions(assignment_id);
CREATE INDEX IF NOT EXISTS idx_student_record_completions_student_id ON student_record_completions(student_id);
CREATE INDEX IF NOT EXISTS idx_student_record_completions_record_id ON student_record_completions(record_id);

-- Remove the old global completed_by_student columns if they exist
-- ALTER TABLE assignments DROP COLUMN IF EXISTS completed_by_student;
-- ALTER TABLE records DROP COLUMN IF EXISTS completed_by_student;
