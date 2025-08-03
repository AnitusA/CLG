-- Safe migration for exams table - handles dependencies
-- Run this SQL in your Supabase SQL Editor

-- Step 1: First, let's add the missing columns to the existing table instead of dropping it
DO $$ 
BEGIN
    -- Add subject column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'exams' AND column_name = 'subject'
    ) THEN
        ALTER TABLE exams ADD COLUMN subject TEXT;
        RAISE NOTICE 'Added subject column';
    END IF;

    -- Add syllabus column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'exams' AND column_name = 'syllabus'
    ) THEN
        ALTER TABLE exams ADD COLUMN syllabus TEXT;
        RAISE NOTICE 'Added syllabus column';
    END IF;

    -- Add exam_date column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'exams' AND column_name = 'exam_date'
    ) THEN
        ALTER TABLE exams ADD COLUMN exam_date DATE;
        RAISE NOTICE 'Added exam_date column';
    END IF;

    -- Add exam_time column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'exams' AND column_name = 'exam_time'
    ) THEN
        ALTER TABLE exams ADD COLUMN exam_time TIME;
        RAISE NOTICE 'Added exam_time column';
    END IF;
END $$;

-- Step 2: Update existing records with default values for new columns
UPDATE exams 
SET 
    subject = COALESCE(subject, 'General'),
    syllabus = COALESCE(syllabus, 'Syllabus to be updated'),
    exam_date = COALESCE(exam_date, CURRENT_DATE + interval '7 days'),
    exam_time = COALESCE(exam_time, '10:00:00'::time)
WHERE subject IS NULL OR syllabus IS NULL OR exam_date IS NULL OR exam_time IS NULL;

-- Step 3: Make the new columns NOT NULL (after setting default values)
ALTER TABLE exams ALTER COLUMN subject SET NOT NULL;
ALTER TABLE exams ALTER COLUMN syllabus SET NOT NULL;
ALTER TABLE exams ALTER COLUMN exam_date SET NOT NULL;
ALTER TABLE exams ALTER COLUMN exam_time SET NOT NULL;

-- Step 4: Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_exams_date ON exams(exam_date);
CREATE INDEX IF NOT EXISTS idx_exams_status ON exams(status);
CREATE INDEX IF NOT EXISTS idx_exams_subject ON exams(subject);

-- Step 5: Verify the table structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'exams' 
ORDER BY ordinal_position;

-- Step 6: Show current data
SELECT COUNT(*) as total_exams, 
       COUNT(CASE WHEN subject IS NOT NULL THEN 1 END) as with_subject,
       COUNT(CASE WHEN syllabus IS NOT NULL THEN 1 END) as with_syllabus,
       COUNT(CASE WHEN exam_date IS NOT NULL THEN 1 END) as with_date
FROM exams;
