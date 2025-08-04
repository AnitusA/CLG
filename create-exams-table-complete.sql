-- Complete setup for exams table with all fields
-- Run this SQL in your Supabase SQL Editor

-- Drop existing table if it exists (be careful with existing data!)
DROP TABLE IF EXISTS exams;

-- Create exams table with all required fields
CREATE TABLE exams (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    exam_name TEXT NOT NULL,
    subject TEXT NOT NULL,
    syllabus TEXT NOT NULL,
    exam_date DATE NOT NULL,
    exam_time TIME NOT NULL,
    status VARCHAR(20) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'ongoing', 'completed', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_exams_date ON exams(exam_date);
CREATE INDEX IF NOT EXISTS idx_exams_status ON exams(status);
CREATE INDEX IF NOT EXISTS idx_exams_subject ON exams(subject);

-- Enable Row Level Security
ALTER TABLE exams ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations for service role
CREATE POLICY "Enable all operations for service role" ON exams
    FOR ALL 
    TO service_role 
    USING (true) 
    WITH CHECK (true);

-- Grant permissions
GRANT ALL ON exams TO service_role;

-- Insert some sample data for testing (optional)
INSERT INTO exams (exam_name, subject, syllabus, exam_date, exam_time, status) VALUES 
('Mid-term Mathematics', 'Mathematics', 'Chapter 1-5: Algebra, Trigonometry, Basic Calculus', '2025-08-15', '10:00:00', 'scheduled'),
('Final Physics Exam', 'Physics', 'Chapter 1-8: Mechanics, Thermodynamics, Optics, Modern Physics', '2025-08-25', '14:00:00', 'scheduled'),
('Chemistry Lab Test', 'Chemistry', 'Organic Chemistry: Reactions, Mechanisms, Synthesis', '2025-08-30', '09:00:00', 'scheduled');

-- Verify the table was created successfully
SELECT COUNT(*) as total_exams FROM exams;
