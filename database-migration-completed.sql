-- Add completed_by_student column to assignments table
ALTER TABLE assignments ADD COLUMN IF NOT EXISTS completed_by_student BOOLEAN DEFAULT FALSE;

-- Add completed_by_student column to records table  
ALTER TABLE records ADD COLUMN IF NOT EXISTS completed_by_student BOOLEAN DEFAULT FALSE;

-- Update existing records to be uncompleted by default
UPDATE assignments SET completed_by_student = FALSE WHERE completed_by_student IS NULL;
UPDATE records SET completed_by_student = FALSE WHERE completed_by_student IS NULL;
