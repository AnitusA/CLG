-- Fix exams table to ensure all required columns exist
-- Run this SQL in your Supabase SQL Editor

-- Add missing columns if they don't exist
DO $$ 
BEGIN
    -- Add exam_type column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'exams' 
        AND column_name = 'exam_type'
    ) THEN
        ALTER TABLE exams ADD COLUMN exam_type TEXT;
        RAISE NOTICE 'exam_type column added to exams table!';
    ELSE
        RAISE NOTICE 'exam_type column already exists in exams table.';
    END IF;

    -- Ensure exam_date column exists
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'exams' 
        AND column_name = 'exam_date'
    ) THEN
        ALTER TABLE exams ADD COLUMN exam_date DATE;
        RAISE NOTICE 'exam_date column added to exams table!';
    ELSE
        RAISE NOTICE 'exam_date column already exists in exams table.';
    END IF;

    -- Ensure exam_time column exists
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'exams' 
        AND column_name = 'exam_time'
    ) THEN
        ALTER TABLE exams ADD COLUMN exam_time TIME;
        RAISE NOTICE 'exam_time column added to exams table!';
    ELSE
        RAISE NOTICE 'exam_time column already exists in exams table.';
    END IF;

    -- Ensure subject column exists
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'exams' 
        AND column_name = 'subject'
    ) THEN
        ALTER TABLE exams ADD COLUMN subject TEXT;
        RAISE NOTICE 'subject column added to exams table!';
    ELSE
        RAISE NOTICE 'subject column already exists in exams table.';
    END IF;

    -- Ensure status column exists
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'exams' 
        AND column_name = 'status'
    ) THEN
        ALTER TABLE exams ADD COLUMN status VARCHAR(20) DEFAULT 'scheduled';
        RAISE NOTICE 'status column added to exams table!';
    ELSE
        RAISE NOTICE 'status column already exists in exams table.';
    END IF;

END $$;

-- Show current table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'exams'
ORDER BY ordinal_position;
