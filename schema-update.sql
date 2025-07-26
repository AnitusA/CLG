-- SQL to update database schema for admin requirements

-- Update exams table
ALTER TABLE exams 
ADD COLUMN IF NOT EXISTS subject TEXT,
ADD COLUMN IF NOT EXISTS exam_date DATE;

-- Update events table
ALTER TABLE events 
ADD COLUMN IF NOT EXISTS title TEXT,
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS event_date DATE;

-- Optional: Update seminars table to be simpler (remove complex fields if needed)
-- This aligns with your requirement: title, subject, date, description
-- You can skip this if the current seminars table is working fine
