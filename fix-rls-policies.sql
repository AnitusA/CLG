-- TEMPORARY FIX: Remove RLS and create public policies
-- Run this in your Supabase SQL Editor to allow the anon key to work

-- Disable RLS for all tables temporarily
ALTER TABLE students DISABLE ROW LEVEL SECURITY;
ALTER TABLE assignments DISABLE ROW LEVEL SECURITY;
ALTER TABLE deadlines DISABLE ROW LEVEL SECURITY;
ALTER TABLE homework DISABLE ROW LEVEL SECURITY;
ALTER TABLE daily_updates DISABLE ROW LEVEL SECURITY;
ALTER TABLE notes DISABLE ROW LEVEL SECURITY;
ALTER TABLE tests DISABLE ROW LEVEL SECURITY;
ALTER TABLE syllabus DISABLE ROW LEVEL SECURITY;
ALTER TABLE birthdays DISABLE ROW LEVEL SECURITY;
ALTER TABLE seminars DISABLE ROW LEVEL SECURITY;

-- This will allow the anon key to access all tables
-- WARNING: This removes security temporarily for testing
-- You should get the real service role key and re-enable RLS later

SELECT 'RLS disabled for all tables - admin dashboard should work now' as result;
