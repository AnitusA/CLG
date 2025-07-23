-- MIGRATION SCRIPT: Remove Priority Fields
-- Run this in your Supabase SQL Editor

-- Remove priority column from assignments table
ALTER TABLE assignments DROP COLUMN IF EXISTS priority;

-- Remove priority column from deadlines table  
ALTER TABLE deadlines DROP COLUMN IF EXISTS priority;

-- Remove priority column from daily_updates table
ALTER TABLE daily_updates DROP COLUMN IF EXISTS priority;

-- Optional: View current table structures to verify changes
-- SELECT column_name, data_type, is_nullable, column_default 
-- FROM information_schema.columns 
-- WHERE table_name IN ('assignments', 'deadlines', 'daily_updates') 
-- ORDER BY table_name, ordinal_position;
