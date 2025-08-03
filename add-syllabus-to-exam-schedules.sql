-- Add syllabus column to existing exam_schedules table
-- Run this if you already have the exam_schedules table without the syllabus column

-- First, check if the column exists, and add it if it doesn't
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'exam_schedules' 
        AND column_name = 'syllabus'
    ) THEN
        ALTER TABLE exam_schedules ADD COLUMN syllabus TEXT;
        
        -- Set a default value for existing records
        UPDATE exam_schedules 
        SET syllabus = 'Syllabus details to be updated' 
        WHERE syllabus IS NULL;
        
        -- Make the column NOT NULL after setting default values
        ALTER TABLE exam_schedules ALTER COLUMN syllabus SET NOT NULL;
        
        RAISE NOTICE 'Syllabus column added to exam_schedules table successfully!';
    ELSE
        RAISE NOTICE 'Syllabus column already exists in exam_schedules table.';
    END IF;
END $$;

-- Also ensure the complete table structure is correct
-- This is a complete recreate if needed
/*
DROP TABLE IF EXISTS exam_schedules;

CREATE TABLE exam_schedules (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    subject TEXT NOT NULL,
    exam_date DATE NOT NULL,
    exam_time TIME NOT NULL,
    syllabus TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'ongoing', 'completed', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_exam_schedules_date ON exam_schedules(exam_date);
CREATE INDEX IF NOT EXISTS idx_exam_schedules_status ON exam_schedules(status);

-- Enable RLS
ALTER TABLE exam_schedules ENABLE ROW LEVEL SECURITY;

-- Create policy
CREATE POLICY "Enable all operations for service role" ON exam_schedules
    FOR ALL 
    TO service_role 
    USING (true) 
    WITH CHECK (true);

-- Grant permissions
GRANT ALL ON exam_schedules TO service_role;
*/
