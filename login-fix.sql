-- Quick fix for login issue
-- Add password_hash column to students table if it doesn't exist
-- Run this in Supabase SQL Editor

-- 1. Add password_hash column if missing
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

-- 2. Update any NULL values to empty string
UPDATE students SET password_hash = '' WHERE password_hash IS NULL;

-- 3. Make the column NOT NULL
ALTER TABLE students ALTER COLUMN password_hash SET NOT NULL;

-- 4. Show current table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'students' 
ORDER BY ordinal_position;

-- 5. Show current student data (without sensitive info)
SELECT 
    register_number,
    CASE 
        WHEN password IS NOT NULL AND password != '' THEN 'Has old password'
        ELSE 'No old password'
    END as old_password_status,
    CASE 
        WHEN password_hash IS NOT NULL AND password_hash != '' THEN 'Has password hash'
        ELSE 'No password hash'
    END as hash_status,
    created_at
FROM students;

SELECT 'Database schema updated. You should now be able to log in!' as message;
