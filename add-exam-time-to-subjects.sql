-- Add exam_time column to exam_subjects table
-- Run this SQL in your Supabase SQL Editor

DO $$ 
BEGIN
    -- Add exam_time column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'exam_subjects' 
        AND column_name = 'exam_time'
    ) THEN
        ALTER TABLE exam_subjects ADD COLUMN exam_time TIME;
        RAISE NOTICE 'exam_time column added to exam_subjects table!';
    ELSE
        RAISE NOTICE 'exam_time column already exists in exam_subjects table.';
    END IF;
END $$;

-- Show current table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'exam_subjects'
ORDER BY ordinal_position;
