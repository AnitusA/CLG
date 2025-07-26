-- Password Migration Script for Students Table
-- This script will hash any existing plain text passwords in the students table
-- Run this AFTER updating your application code to use bcrypt

-- WARNING: This script will:
-- 1. Check if any students have plain text passwords (short, non-bcrypt format)
-- 2. For security, clear all existing passwords to force re-registration
-- 3. This ensures no plain text passwords remain in the database

-- 1. First, let's check the current state of passwords
SELECT 
    id,
    register_number,
    CASE 
        WHEN LENGTH(password_hash) < 50 THEN 'Likely plain text'
        WHEN password_hash LIKE '$2a$%' OR password_hash LIKE '$2b$%' OR password_hash LIKE '$2y$%' THEN 'Bcrypt hash'
        ELSE 'Unknown format'
    END as password_type,
    LENGTH(password_hash) as password_length,
    created_at
FROM students
ORDER BY created_at DESC;

-- 2. Count passwords by type
SELECT 
    CASE 
        WHEN LENGTH(password_hash) < 50 THEN 'Likely plain text'
        WHEN password_hash LIKE '$2a$%' OR password_hash LIKE '$2b$%' OR password_hash LIKE '$2y$%' THEN 'Bcrypt hash'
        ELSE 'Unknown format'
    END as password_type,
    COUNT(*) as count
FROM students
GROUP BY 
    CASE 
        WHEN LENGTH(password_hash) < 50 THEN 'Likely plain text'
        WHEN password_hash LIKE '$2a$%' OR password_hash LIKE '$2b$%' OR password_hash LIKE '$2y$%' THEN 'Bcrypt hash'
        ELSE 'Unknown format'
    END;

-- 3. For security, clear all passwords that appear to be plain text
-- This forces users to re-register with proper password hashing
-- Uncomment the following lines to execute the migration:

/*
UPDATE students 
SET password_hash = '' 
WHERE LENGTH(password_hash) < 50 
   OR NOT (password_hash LIKE '$2a$%' OR password_hash LIKE '$2b$%' OR password_hash LIKE '$2y$%');

-- Add a migration timestamp column to track when passwords were migrated
ALTER TABLE students ADD COLUMN IF NOT EXISTS password_migrated_at TIMESTAMP WITH TIME ZONE;

UPDATE students 
SET password_migrated_at = NOW() 
WHERE password_hash = '';

-- Log the migration
INSERT INTO migration_log (migration_name, executed_at, description) 
VALUES (
    'password_security_migration', 
    NOW(), 
    'Cleared plain text passwords to enforce secure bcrypt hashing'
) ON CONFLICT DO NOTHING;
*/

-- 4. Create migration log table if it doesn't exist
CREATE TABLE IF NOT EXISTS migration_log (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    migration_name VARCHAR(255) NOT NULL UNIQUE,
    executed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Verify the migration (run this after uncommenting and executing section 3)
-- SELECT 
--     COUNT(*) as total_students,
--     COUNT(CASE WHEN password_hash = '' THEN 1 END) as students_need_re_registration,
--     COUNT(CASE WHEN password_hash LIKE '$2%$%' THEN 1 END) as students_with_bcrypt
-- FROM students;

-- Success message
SELECT 'Password migration script ready! Review the output above and uncomment section 3 to execute.' as message;

-- Additional security recommendations:
-- 1. Enable HTTPS in production
-- 2. Implement account lockout after failed attempts
-- 3. Add email verification for registration
-- 4. Consider implementing 2FA for admin accounts
-- 5. Regular security audits of password hashes
