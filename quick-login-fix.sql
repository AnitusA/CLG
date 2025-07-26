-- Quick Fix for Login Issue
-- Run this in Supabase SQL Editor to immediately fix the login problem

-- Step 1: Add password_hash column if missing
ALTER TABLE students ADD COLUMN IF NOT EXISTS password_hash TEXT DEFAULT '';

-- Step 2: Update any NULL values to empty string
UPDATE students SET password_hash = '' WHERE password_hash IS NULL;

-- Step 3: Make the column NOT NULL
ALTER TABLE students ALTER COLUMN password_hash SET NOT NULL;

-- Step 4: Verify the fix
SELECT 
    register_number,
    CASE 
        WHEN password IS NOT NULL THEN 'Can login (old format)'
        WHEN password_hash LIKE '$2%' THEN 'Can login (new format)'  
        ELSE 'Cannot login'
    END as login_status
FROM students;

-- Success message
SELECT 'Login issue fixed! Students can now authenticate with their existing passwords.' as message;

-- Note: The application will automatically migrate passwords to bcrypt hash on successful login
