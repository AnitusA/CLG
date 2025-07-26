-- Temporary Authentication Bridge
-- This script creates a temporary solution to handle both old (password) and new (password_hash) formats
-- Run this in Supabase SQL Editor to fix the immediate login issue

-- First, let's check what columns exist
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'students' 
ORDER BY ordinal_position;

-- Add password_hash column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'students' AND column_name = 'password_hash'
    ) THEN
        ALTER TABLE students ADD COLUMN password_hash TEXT DEFAULT '';
        RAISE NOTICE 'Added password_hash column';
    ELSE
        RAISE NOTICE 'password_hash column already exists';
    END IF;
END $$;

-- Update any NULL password_hash values to empty string
UPDATE students SET password_hash = '' WHERE password_hash IS NULL;

-- Make password_hash NOT NULL with default empty string
ALTER TABLE students ALTER COLUMN password_hash SET DEFAULT '';
ALTER TABLE students ALTER COLUMN password_hash SET NOT NULL;

-- Show current state
SELECT 
    register_number,
    CASE 
        WHEN password IS NOT NULL AND password != '' THEN 'Has old password'
        ELSE 'No old password'
    END as old_password_status,
    CASE 
        WHEN password_hash IS NOT NULL AND password_hash != '' AND password_hash LIKE '$2%$%' THEN 'Has bcrypt hash'
        WHEN password_hash IS NOT NULL AND password_hash != '' THEN 'Has non-bcrypt hash'
        ELSE 'No hash'
    END as new_hash_status,
    LEFT(COALESCE(password, 'NULL'), 10) as password_preview,
    LEFT(COALESCE(password_hash, 'NULL'), 20) as hash_preview
FROM students;

SELECT 'Database prepared for dual authentication mode. Students can login while migration completes.' as message;
