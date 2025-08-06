-- Create students table in Supabase
-- Run this SQL in your Supabase SQL Editor

CREATE TABLE IF NOT EXISTS students (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    register_number VARCHAR(50) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create an index on register_number for faster lookups
CREATE INDEX IF NOT EXISTS idx_students_register_number ON students(register_number);

-- Create assignments table
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

-- Create deadlines table
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

-- Create homework table
CREATE TABLE IF NOT EXISTS homework (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    subject VARCHAR(100) NOT NULL,
    assignment_date DATE NOT NULL,
    due_date DATE NOT NULL,
    difficulty VARCHAR(20) DEFAULT 'medium' CHECK (difficulty IN ('easy', 'medium', 'hard')),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'overdue')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create daily_updates table
CREATE TABLE IF NOT EXISTS daily_updates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    category VARCHAR(100) NOT NULL,
    priority VARCHAR(20) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    is_visible BOOLEAN DEFAULT true,
    publish_date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create notes table
CREATE TABLE IF NOT EXISTS notes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    subject VARCHAR(100) NOT NULL,
    chapter VARCHAR(200),
    is_visible BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create tests table
CREATE TABLE IF NOT EXISTS tests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    subject VARCHAR(100) NOT NULL,
    test_date DATE NOT NULL,
    start_time TIME NOT NULL,
    duration_minutes INTEGER NOT NULL,
    total_marks INTEGER,
    status VARCHAR(20) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'ongoing', 'completed', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create syllabus table
CREATE TABLE IF NOT EXISTS syllabus (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    subject VARCHAR(100) NOT NULL,
    academic_year VARCHAR(20) NOT NULL,
    semester VARCHAR(20) NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    chapter_number INTEGER,
    is_visible BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create birthdays table
CREATE TABLE IF NOT EXISTS birthdays (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    birth_date DATE NOT NULL,
    category VARCHAR(50) NOT NULL CHECK (category IN ('student', 'staff', 'faculty', 'admin')),
    email VARCHAR(255),
    phone VARCHAR(20),
    notes TEXT,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create seminars table
CREATE TABLE IF NOT EXISTS seminars (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    speaker TEXT NOT NULL,
    speaker_bio TEXT,
    seminar_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    location TEXT NOT NULL,
    capacity INTEGER,
    category VARCHAR(50) NOT NULL CHECK (category IN ('technical', 'career', 'research', 'industry', 'academic', 'entrepreneurship')),
    registration_required BOOLEAN DEFAULT false,
    registration_deadline DATE,
    requirements TEXT,
    materials TEXT,
    status VARCHAR(20) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'ongoing', 'completed', 'cancelled')),
    registered_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create a trigger to automatically update the updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for all tables
CREATE TRIGGER update_students_updated_at 
    BEFORE UPDATE ON students 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_assignments_updated_at 
    BEFORE UPDATE ON assignments 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_deadlines_updated_at 
    BEFORE UPDATE ON deadlines 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_homework_updated_at 
    BEFORE UPDATE ON homework 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_daily_updates_updated_at 
    BEFORE UPDATE ON daily_updates 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notes_updated_at 
    BEFORE UPDATE ON notes 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tests_updated_at 
    BEFORE UPDATE ON tests 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_syllabus_updated_at 
    BEFORE UPDATE ON syllabus 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_birthdays_updated_at 
    BEFORE UPDATE ON birthdays 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_seminars_updated_at 
    BEFORE UPDATE ON seminars 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_assignments_subject ON assignments(subject);
CREATE INDEX IF NOT EXISTS idx_assignments_due_date ON assignments(due_date);
CREATE INDEX IF NOT EXISTS idx_deadlines_deadline_date ON deadlines(deadline_date);
CREATE INDEX IF NOT EXISTS idx_homework_subject ON homework(subject);
CREATE INDEX IF NOT EXISTS idx_homework_assignment_date ON homework(assignment_date);
CREATE INDEX IF NOT EXISTS idx_daily_updates_publish_date ON daily_updates(publish_date);
CREATE INDEX IF NOT EXISTS idx_notes_subject ON notes(subject);
CREATE INDEX IF NOT EXISTS idx_tests_subject ON tests(subject);
CREATE INDEX IF NOT EXISTS idx_tests_test_date ON tests(test_date);
CREATE INDEX IF NOT EXISTS idx_syllabus_subject ON syllabus(subject);
CREATE INDEX IF NOT EXISTS idx_birthdays_birth_date ON birthdays(birth_date);
CREATE INDEX IF NOT EXISTS idx_seminars_seminar_date ON seminars(seminar_date);

-- Optional: Enable Row Level Security (RLS) for better security
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE deadlines ENABLE ROW LEVEL SECURITY;
ALTER TABLE homework ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE syllabus ENABLE ROW LEVEL SECURITY;
ALTER TABLE birthdays ENABLE ROW LEVEL SECURITY;
ALTER TABLE seminars ENABLE ROW LEVEL SECURITY;

-- Create policies that allow service role to do everything
CREATE POLICY "Enable all operations for service role" ON students
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Enable all operations for service role" ON assignments
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Enable all operations for service role" ON deadlines
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Enable all operations for service role" ON homework
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Enable all operations for service role" ON daily_updates
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Enable all operations for service role" ON notes
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Enable all operations for service role" ON tests
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Enable all operations for service role" ON syllabus
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Enable all operations for service role" ON birthdays
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Enable all operations for service role" ON seminars
    FOR ALL USING (auth.role() = 'service_role');
