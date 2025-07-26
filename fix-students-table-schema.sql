-- Fix students table schema to use password_hash instead of password
-- Run this SQL in your Supabase SQL Editor

-- 1. Check if password column exists and rename it to password_hash
DO $$
BEGIN
    -- Check if password column exists
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'students' 
        AND column_name = 'password'
    ) THEN
        -- Rename password column to password_hash
        ALTER TABLE students RENAME COLUMN password TO password_hash;
        RAISE NOTICE 'Renamed password column to password_hash';
    END IF;
    
    -- Ensure password_hash column exists
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'students' 
        AND column_name = 'password_hash'
    ) THEN
        -- Add password_hash column if it doesn't exist
        ALTER TABLE students ADD COLUMN password_hash TEXT NOT NULL DEFAULT '';
        RAISE NOTICE 'Added password_hash column';
    END IF;
END $$;

-- 2. Ensure proper constraints
ALTER TABLE students ALTER COLUMN password_hash SET NOT NULL;

-- 3. Clear any existing plain text passwords for security
-- WARNING: This will require all students to register again
-- Comment out the next line if you want to preserve existing data
-- UPDATE students SET password_hash = '' WHERE password_hash != '';

-- Success message
SELECT 'Students table schema updated successfully!' as message;
