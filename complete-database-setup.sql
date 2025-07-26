-- Complete Database Setup for College Management System
-- Run this SQL in your Supabase SQL Editor to create ALL missing tables

-- First, let's create the update_updated_at_column function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 1. Create students table (if not exists)
CREATE TABLE IF NOT EXISTS students (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    register_number VARCHAR(50) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL DEFAULT '',
    password TEXT, -- Temporary column for migration
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create assignments table
CREATE TABLE IF NOT EXISTS assignments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    subject VARCHAR(100) NOT NULL,
    due_date DATE NOT NULL,
    priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create homework table
CREATE TABLE IF NOT EXISTS homework (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    subject VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    assigned_date DATE NOT NULL DEFAULT CURRENT_DATE,
    due_date DATE,
    priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'overdue')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Create deadlines table
CREATE TABLE IF NOT EXISTS deadlines (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    deadline_date TIMESTAMP WITH TIME ZONE NOT NULL,
    category VARCHAR(100) NOT NULL,
    priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'overdue')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Create seminars table
CREATE TABLE IF NOT EXISTS seminars (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    speaker VARCHAR(200) NOT NULL,
    seminar_date DATE NOT NULL,
    seminar_time TIME NOT NULL,
    venue VARCHAR(200) NOT NULL,
    category VARCHAR(50) DEFAULT 'technical' CHECK (category IN ('technical', 'career', 'research', 'industry')),
    duration_minutes INTEGER DEFAULT 120,
    max_participants INTEGER,
    status VARCHAR(20) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'ongoing', 'completed', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Create exam_schedules table
CREATE TABLE IF NOT EXISTS exam_schedules (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    subject VARCHAR(100) NOT NULL,
    exam_date DATE NOT NULL,
    exam_time TIME NOT NULL,
    duration_minutes INTEGER NOT NULL DEFAULT 180,
    room_number VARCHAR(50),
    exam_type VARCHAR(20) DEFAULT 'regular' CHECK (exam_type IN ('regular', 'makeup', 'final', 'midterm')),
    instructions TEXT,
    total_marks INTEGER DEFAULT 100,
    status VARCHAR(20) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'ongoing', 'completed', 'cancelled', 'postponed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Create events table
CREATE TABLE IF NOT EXISTS events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    event_name TEXT NOT NULL,
    event_date DATE NOT NULL,
    description TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'ongoing', 'completed', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. Create notes table
CREATE TABLE IF NOT EXISTS notes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    category VARCHAR(100) NOT NULL,
    priority VARCHAR(20) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    tags TEXT[], -- Array of tags
    is_archived BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. Create birthdays table
CREATE TABLE IF NOT EXISTS birthdays (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    birth_date DATE NOT NULL,
    category VARCHAR(50) DEFAULT 'student' CHECK (category IN ('student', 'teacher', 'staff')),
    phone VARCHAR(20),
    email VARCHAR(255),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 10. Create syllabus table
CREATE TABLE IF NOT EXISTS syllabus (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    subject VARCHAR(100) NOT NULL,
    semester VARCHAR(20) NOT NULL,
    topic TEXT NOT NULL,
    description TEXT,
    week_number INTEGER,
    hours_allocated INTEGER DEFAULT 1,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 11. Create daily_updates table
CREATE TABLE IF NOT EXISTS daily_updates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    category VARCHAR(50) DEFAULT 'general' CHECK (category IN ('general', 'academic', 'administrative', 'sports', 'cultural')),
    priority VARCHAR(20) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    is_pinned BOOLEAN DEFAULT FALSE,
    valid_until DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
-- Students
CREATE INDEX IF NOT EXISTS idx_students_register_number ON students(register_number);

-- Assignments
CREATE INDEX IF NOT EXISTS idx_assignments_due_date ON assignments(due_date);
CREATE INDEX IF NOT EXISTS idx_assignments_subject ON assignments(subject);
CREATE INDEX IF NOT EXISTS idx_assignments_status ON assignments(status);

-- Homework
CREATE INDEX IF NOT EXISTS idx_homework_subject ON homework(subject);
CREATE INDEX IF NOT EXISTS idx_homework_due_date ON homework(due_date);
CREATE INDEX IF NOT EXISTS idx_homework_status ON homework(status);

-- Deadlines
CREATE INDEX IF NOT EXISTS idx_deadlines_deadline_date ON deadlines(deadline_date);
CREATE INDEX IF NOT EXISTS idx_deadlines_category ON deadlines(category);
CREATE INDEX IF NOT EXISTS idx_deadlines_status ON deadlines(status);

-- Seminars
CREATE INDEX IF NOT EXISTS idx_seminars_seminar_date ON seminars(seminar_date);
CREATE INDEX IF NOT EXISTS idx_seminars_category ON seminars(category);
CREATE INDEX IF NOT EXISTS idx_seminars_status ON seminars(status);

-- Exam Schedules
CREATE INDEX IF NOT EXISTS idx_exam_schedules_exam_date ON exam_schedules(exam_date);
CREATE INDEX IF NOT EXISTS idx_exam_schedules_subject ON exam_schedules(subject);
CREATE INDEX IF NOT EXISTS idx_exam_schedules_status ON exam_schedules(status);

-- Events
CREATE INDEX IF NOT EXISTS idx_events_event_date ON events(event_date);
CREATE INDEX IF NOT EXISTS idx_events_status ON events(status);

-- Notes
CREATE INDEX IF NOT EXISTS idx_notes_category ON notes(category);
CREATE INDEX IF NOT EXISTS idx_notes_is_archived ON notes(is_archived);

-- Birthdays
CREATE INDEX IF NOT EXISTS idx_birthdays_birth_date ON birthdays(birth_date);
CREATE INDEX IF NOT EXISTS idx_birthdays_category ON birthdays(category);

-- Syllabus
CREATE INDEX IF NOT EXISTS idx_syllabus_subject ON syllabus(subject);
CREATE INDEX IF NOT EXISTS idx_syllabus_semester ON syllabus(semester);

-- Daily Updates
CREATE INDEX IF NOT EXISTS idx_daily_updates_category ON daily_updates(category);
CREATE INDEX IF NOT EXISTS idx_daily_updates_is_pinned ON daily_updates(is_pinned);
CREATE INDEX IF NOT EXISTS idx_daily_updates_created_at ON daily_updates(created_at);

-- Create triggers for updated_at columns
DO $$
BEGIN
    -- Students
    DROP TRIGGER IF EXISTS update_students_updated_at ON students;
    CREATE TRIGGER update_students_updated_at 
        BEFORE UPDATE ON students 
        FOR EACH ROW 
        EXECUTE FUNCTION update_updated_at_column();

    -- Assignments
    DROP TRIGGER IF EXISTS update_assignments_updated_at ON assignments;
    CREATE TRIGGER update_assignments_updated_at 
        BEFORE UPDATE ON assignments 
        FOR EACH ROW 
        EXECUTE FUNCTION update_updated_at_column();

    -- Homework
    DROP TRIGGER IF EXISTS update_homework_updated_at ON homework;
    CREATE TRIGGER update_homework_updated_at 
        BEFORE UPDATE ON homework 
        FOR EACH ROW 
        EXECUTE FUNCTION update_updated_at_column();

    -- Deadlines
    DROP TRIGGER IF EXISTS update_deadlines_updated_at ON deadlines;
    CREATE TRIGGER update_deadlines_updated_at 
        BEFORE UPDATE ON deadlines 
        FOR EACH ROW 
        EXECUTE FUNCTION update_updated_at_column();

    -- Seminars
    DROP TRIGGER IF EXISTS update_seminars_updated_at ON seminars;
    CREATE TRIGGER update_seminars_updated_at 
        BEFORE UPDATE ON seminars 
        FOR EACH ROW 
        EXECUTE FUNCTION update_updated_at_column();

    -- Exam Schedules
    DROP TRIGGER IF EXISTS update_exam_schedules_updated_at ON exam_schedules;
    CREATE TRIGGER update_exam_schedules_updated_at 
        BEFORE UPDATE ON exam_schedules 
        FOR EACH ROW 
        EXECUTE FUNCTION update_updated_at_column();

    -- Events
    DROP TRIGGER IF EXISTS update_events_updated_at ON events;
    CREATE TRIGGER update_events_updated_at 
        BEFORE UPDATE ON events 
        FOR EACH ROW 
        EXECUTE FUNCTION update_updated_at_column();

    -- Notes
    DROP TRIGGER IF EXISTS update_notes_updated_at ON notes;
    CREATE TRIGGER update_notes_updated_at 
        BEFORE UPDATE ON notes 
        FOR EACH ROW 
        EXECUTE FUNCTION update_updated_at_column();

    -- Birthdays
    DROP TRIGGER IF EXISTS update_birthdays_updated_at ON birthdays;
    CREATE TRIGGER update_birthdays_updated_at 
        BEFORE UPDATE ON birthdays 
        FOR EACH ROW 
        EXECUTE FUNCTION update_updated_at_column();

    -- Syllabus
    DROP TRIGGER IF EXISTS update_syllabus_updated_at ON syllabus;
    CREATE TRIGGER update_syllabus_updated_at 
        BEFORE UPDATE ON syllabus 
        FOR EACH ROW 
        EXECUTE FUNCTION update_updated_at_column();

    -- Daily Updates
    DROP TRIGGER IF EXISTS update_daily_updates_updated_at ON daily_updates;
    CREATE TRIGGER update_daily_updates_updated_at 
        BEFORE UPDATE ON daily_updates 
        FOR EACH ROW 
        EXECUTE FUNCTION update_updated_at_column();
END
$$;

-- Enable Row Level Security for all tables
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE homework ENABLE ROW LEVEL SECURITY;
ALTER TABLE deadlines ENABLE ROW LEVEL SECURITY;
ALTER TABLE seminars ENABLE ROW LEVEL SECURITY;
ALTER TABLE exam_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE birthdays ENABLE ROW LEVEL SECURITY;
ALTER TABLE syllabus ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_updates ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (allow all operations for service role)
DO $$
DECLARE
    table_name TEXT;
    table_names TEXT[] := ARRAY['students', 'assignments', 'homework', 'deadlines', 'seminars', 'exam_schedules', 'events', 'notes', 'birthdays', 'syllabus', 'daily_updates'];
BEGIN
    FOREACH table_name IN ARRAY table_names
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS "Enable all operations for service role" ON %I', table_name);
        EXECUTE format('CREATE POLICY "Enable all operations for service role" ON %I FOR ALL TO service_role USING (true) WITH CHECK (true)', table_name);
        EXECUTE format('GRANT ALL ON %I TO service_role', table_name);
    END LOOP;
END
$$;

-- Insert sample data (optional)
-- Exam Schedules
INSERT INTO exam_schedules (subject, exam_date, exam_time, duration_minutes, room_number, exam_type, instructions, total_marks, status) VALUES 
    ('Mathematics', '2025-08-15', '09:00:00', 180, 'Room 101', 'final', 'Bring calculator and drawing instruments. No mobile phones allowed.', 100, 'scheduled'),
    ('Physics', '2025-08-17', '14:00:00', 180, 'Room 102', 'final', 'Formula sheet will be provided. Bring scientific calculator.', 100, 'scheduled'),
    ('Chemistry', '2025-08-19', '09:00:00', 180, 'Room 103', 'final', 'Periodic table will be provided. No electronic devices except calculator.', 100, 'scheduled')
ON CONFLICT DO NOTHING;

-- Events (if not already created)
INSERT INTO events (event_name, event_date, description, status) VALUES 
    ('Annual Day Celebration', '2025-08-15', 'Grand celebration of our college''s annual day with cultural performances, awards ceremony, and guest lectures.', 'upcoming'),
    ('Tech Fest 2025', '2025-09-10', 'Technology festival featuring coding competitions, robotics exhibitions, and tech talks by industry experts.', 'upcoming'),
    ('Sports Meet', '2025-07-30', 'Inter-department sports competition including cricket, football, basketball, and track events.', 'upcoming')
ON CONFLICT DO NOTHING;

-- Assignments
INSERT INTO assignments (title, description, subject, due_date, priority, status) VALUES 
    ('Data Structures Assignment', 'Implement binary search tree with all operations', 'Computer Science', '2025-08-01', 'high', 'active'),
    ('Calculus Problem Set', 'Solve integration and differentiation problems', 'Mathematics', '2025-07-28', 'medium', 'active')
ON CONFLICT DO NOTHING;

-- Seminars
INSERT INTO seminars (title, description, speaker, seminar_date, seminar_time, venue, category, status) VALUES 
    ('AI in Modern Computing', 'Overview of artificial intelligence applications', 'Dr. Smith Johnson', '2025-08-05', '14:00:00', 'Auditorium A', 'technical', 'scheduled'),
    ('Career Opportunities in Tech', 'Exploring various career paths in technology', 'Ms. Sarah Wilson', '2025-08-10', '10:00:00', 'Hall B', 'career', 'scheduled')
ON CONFLICT DO NOTHING;

-- Success message
SELECT 'All database tables created successfully! Your college management system is ready to use.' as message;

-- Summary of created tables
SELECT 
    table_name,
    CASE 
        WHEN table_name = 'students' THEN 'Student registration and authentication'
        WHEN table_name = 'assignments' THEN 'Academic assignments management'
        WHEN table_name = 'homework' THEN 'Daily homework tracking'
        WHEN table_name = 'deadlines' THEN 'Important deadlines and tasks'
        WHEN table_name = 'seminars' THEN 'Seminar scheduling and management'
        WHEN table_name = 'exam_schedules' THEN 'Exam schedules and details'
        WHEN table_name = 'events' THEN 'College events and activities'
        WHEN table_name = 'notes' THEN 'Administrative notes'
        WHEN table_name = 'birthdays' THEN 'Birthday calendar'
        WHEN table_name = 'syllabus' THEN 'Course syllabus management'
        WHEN table_name = 'daily_updates' THEN 'Daily announcements and updates'
        ELSE 'Other table'
    END as description
FROM information_schema.tables 
WHERE table_schema = 'public' 
    AND table_name IN ('students', 'assignments', 'homework', 'deadlines', 'seminars', 'exam_schedules', 'events', 'notes', 'birthdays', 'syllabus', 'daily_updates')
ORDER BY table_name;
