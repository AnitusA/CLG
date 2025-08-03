-- Add subject, syllabus, exam_date, and exam_time columns to existing exams table
-- Run this if you already have the exams table without these new columns

-- First, check if the columns exist, and add them if they don't
DO $$ 
BEGIN
    -- Add subject column
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'exams' 
        AND column_name = 'subject'
    ) THEN
        ALTER TABLE exams ADD COLUMN subject TEXT;
        RAISE NOTICE 'Subject column added to exams table!';
    ELSE
        RAISE NOTICE 'Subject column already exists in exams table.';
    END IF;

    -- Add syllabus column
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'exams' 
        AND column_name = 'syllabus'
    ) THEN
        ALTER TABLE exams ADD COLUMN syllabus TEXT;
        RAISE NOTICE 'Syllabus column added to exams table!';
    ELSE
        RAISE NOTICE 'Syllabus column already exists in exams table.';
    END IF;

    -- Add exam_date column
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'exams' 
        AND column_name = 'exam_date'
    ) THEN
        ALTER TABLE exams ADD COLUMN exam_date DATE;
        RAISE NOTICE 'Exam_date column added to exams table!';
    ELSE
        RAISE NOTICE 'Exam_date column already exists in exams table.';
    END IF;

    -- Add exam_time column
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'exams' 
        AND column_name = 'exam_time'
    ) THEN
        ALTER TABLE exams ADD COLUMN exam_time TIME;
        RAISE NOTICE 'Exam_time column added to exams table!';
    ELSE
        RAISE NOTICE 'Exam_time column already exists in exams table.';
    END IF;
END $$;

-- Also ensure the complete table structure is correct if starting fresh
-- Uncomment this section if you need to recreate the table completely
/*
DROP TABLE IF EXISTS exams;

CREATE TABLE exams (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    exam_name TEXT NOT NULL,
    subject TEXT,
    syllabus TEXT,
    exam_date DATE,
    exam_time TIME,
    status VARCHAR(20) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'ongoing', 'completed', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_exams_date ON exams(exam_date);
CREATE INDEX IF NOT EXISTS idx_exams_status ON exams(status);
CREATE INDEX IF NOT EXISTS idx_exams_subject ON exams(subject);

-- Enable RLS
ALTER TABLE exams ENABLE ROW LEVEL SECURITY;

-- Create policy
CREATE POLICY "Enable all operations for service role" ON exams
    FOR ALL 
    TO service_role 
    USING (true) 
    WITH CHECK (true);

-- Grant permissions
GRANT ALL ON exams TO service_role;
*/
