-- CLEAN VERSION: Basic Student System (NO TICK FUNCTIONALITY)
-- This creates only the basic assignments and records tables
-- Copy and paste this into your Supabase SQL Editor

-- Drop any existing completion tables completely
DROP TABLE IF EXISTS student_assignment_completions CASCADE;
DROP TABLE IF EXISTS student_record_completions CASCADE;

-- Create assignments table if it doesn't exist
CREATE TABLE IF NOT EXISTS assignments (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    subject VARCHAR(100) NOT NULL,
    due_date DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'active',
    posted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create records table if it doesn't exist
CREATE TABLE IF NOT EXISTS records (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    record_date DATE NOT NULL DEFAULT CURRENT_DATE,
    category VARCHAR(50) DEFAULT 'general',
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create seminars table if it doesn't exist
CREATE TABLE IF NOT EXISTS seminars (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    seminar_date DATE NOT NULL,
    venue VARCHAR(255),
    speaker VARCHAR(255),
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create events table if it doesn't exist
CREATE TABLE IF NOT EXISTS events (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    event_date DATE NOT NULL,
    venue VARCHAR(255),
    event_type VARCHAR(100) DEFAULT 'general',
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert sample data if tables are empty
INSERT INTO assignments (title, description, subject, due_date, status, posted_at) 
SELECT * FROM (VALUES
    ('Mathematics Assignment 1', 'Complete exercises 1-15 from Chapter 5: Quadratic Equations', 'Mathematics', CURRENT_DATE + INTERVAL '7 days', 'active', NOW() - INTERVAL '2 days'),
    ('History Essay', 'Write a 1200-word essay on the causes of World War II', 'History', CURRENT_DATE + INTERVAL '14 days', 'active', NOW() - INTERVAL '3 days'),
    ('Chemistry Lab Report', 'Submit detailed lab report for Acid-Base Titration experiment', 'Chemistry', CURRENT_DATE + INTERVAL '10 days', 'active', NOW() - INTERVAL '1 day 12 hours'),
    ('English Literature Analysis', 'Analyze themes in three Shakespearean sonnets', 'English', CURRENT_DATE + INTERVAL '21 days', 'active', NOW() - INTERVAL '12 hours'),
    ('Physics Problem Set', 'Solve all problems from Chapter 8: Waves and Oscillations', 'Physics', CURRENT_DATE + INTERVAL '12 days', 'active', NOW() - INTERVAL '30 minutes'),
    ('Past Assignment Example', 'This assignment has passed its due date', 'Mathematics', CURRENT_DATE - INTERVAL '2 days', 'completed', NOW() - INTERVAL '10 days')
) AS t(title, description, subject, due_date, status, posted_at)
WHERE NOT EXISTS (SELECT 1 FROM assignments LIMIT 1);

INSERT INTO records (title, description, record_date, category) 
SELECT * FROM (VALUES
    ('Week 1 Attendance Record', 'Weekly attendance summary for all subjects', CURRENT_DATE - INTERVAL '5 days', 'attendance'),
    ('Mathematics Quiz Results', 'Results from Chapter 4 quiz on Algebra', CURRENT_DATE - INTERVAL '3 days', 'academic'),
    ('Library Book Return Notice', 'Return borrowed books: "Advanced Physics" and "Chemistry Basics"', CURRENT_DATE + INTERVAL '5 days', 'administrative'),
    ('Annual Sports Day Registration', 'Register for participation in annual sports day events', CURRENT_DATE + INTERVAL '15 days', 'extracurricular'),
    ('Parent-Teacher Conference', 'Scheduled meeting with parents to discuss academic progress', CURRENT_DATE + INTERVAL '10 days', 'administrative')
) AS t(title, description, record_date, category)
WHERE NOT EXISTS (SELECT 1 FROM records LIMIT 1);

INSERT INTO seminars (title, description, seminar_date, venue, speaker) 
SELECT * FROM (VALUES
    ('AI in Education Seminar', 'Exploring the role of artificial intelligence in modern education', CURRENT_DATE + INTERVAL '8 days', 'Main Auditorium', 'Dr. Sarah Johnson'),
    ('Climate Change Workshop', 'Understanding environmental challenges and solutions', CURRENT_DATE + INTERVAL '16 days', 'Science Hall', 'Prof. Michael Green'),
    ('Career Guidance Session', 'Preparing for professional opportunities after graduation', CURRENT_DATE + INTERVAL '20 days', 'Conference Room A', 'Industry Panel'),
    ('Research Methodology Workshop', 'Introduction to academic research techniques', CURRENT_DATE + INTERVAL '25 days', 'Library Hall', 'Dr. Emily Chen')
) AS t(title, description, seminar_date, venue, speaker)
WHERE NOT EXISTS (SELECT 1 FROM seminars LIMIT 1);

INSERT INTO events (title, description, event_date, venue, event_type) 
SELECT * FROM (VALUES
    ('College Annual Day', 'Celebration of academic achievements and cultural performances', CURRENT_DATE + INTERVAL '30 days', 'Main Campus', 'cultural'),
    ('Inter-College Sports Meet', 'Annual sports competition between colleges', CURRENT_DATE + INTERVAL '18 days', 'Sports Complex', 'sports'),
    ('Science Exhibition', 'Student projects and innovation showcase', CURRENT_DATE + INTERVAL '22 days', 'Exhibition Hall', 'academic'),
    ('Cultural Fest', 'Music, dance, and arts celebration', CURRENT_DATE + INTERVAL '35 days', 'Open Ground', 'cultural'),
    ('Job Fair 2025', 'Career opportunities and recruitment drive', CURRENT_DATE + INTERVAL '28 days', 'Main Auditorium', 'career')
) AS t(title, description, event_date, venue, event_type)
WHERE NOT EXISTS (SELECT 1 FROM events LIMIT 1);

-- Auto-update status for past items
UPDATE assignments SET status = 'completed', updated_at = NOW() 
WHERE due_date < CURRENT_DATE AND status = 'active';

UPDATE records SET status = 'completed', updated_at = NOW() 
WHERE record_date < CURRENT_DATE AND status = 'active';

UPDATE seminars SET status = 'completed', updated_at = NOW() 
WHERE seminar_date < CURRENT_DATE AND status = 'active';

UPDATE events SET status = 'completed', updated_at = NOW() 
WHERE event_date < CURRENT_DATE AND status = 'active';

-- Create a function to auto-update status (run this once to set up automatic updates)
CREATE OR REPLACE FUNCTION update_past_items_status()
RETURNS void AS $$
BEGIN
    UPDATE assignments SET status = 'completed', updated_at = NOW() 
    WHERE due_date < CURRENT_DATE AND status = 'active';
    
    UPDATE records SET status = 'completed', updated_at = NOW() 
    WHERE record_date < CURRENT_DATE AND status = 'active';
    
    UPDATE seminars SET status = 'completed', updated_at = NOW() 
    WHERE seminar_date < CURRENT_DATE AND status = 'active';
    
    UPDATE events SET status = 'completed', updated_at = NOW() 
    WHERE event_date < CURRENT_DATE AND status = 'active';
END;
$$ LANGUAGE plpgsql;

-- Show final status (NO COMPLETION TABLES)
SELECT 
    'Clean Setup Complete - No Tick Functionality!' as status,
    (SELECT COUNT(*) FROM assignments) as assignments_count,
    (SELECT COUNT(*) FROM records) as records_count,
    (SELECT COUNT(*) FROM seminars) as seminars_count,
    (SELECT COUNT(*) FROM events) as events_count;
