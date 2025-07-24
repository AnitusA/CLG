-- Quick fix: Add exam tables to existing database
-- Copy and paste this SQL into your Supabase SQL Editor
-- This will add the new exam tables without affecting existing data

-- 1. Create exams table (for exam schedules feature)
CREATE TABLE IF NOT EXISTS exams (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    exam_name TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'completed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create exam_subjects table (for individual subjects under each exam)
CREATE TABLE IF NOT EXISTS exam_subjects (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    exam_id UUID NOT NULL REFERENCES exams(id) ON DELETE CASCADE,
    subject TEXT NOT NULL,
    exam_date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create additional indexes for exam tables
CREATE INDEX IF NOT EXISTS idx_exams_status ON exams(status);
CREATE INDEX IF NOT EXISTS idx_exams_created_at ON exams(created_at);
CREATE INDEX IF NOT EXISTS idx_exam_subjects_exam_id ON exam_subjects(exam_id);
CREATE INDEX IF NOT EXISTS idx_exam_subjects_exam_date ON exam_subjects(exam_date);

-- 4. Create triggers for exam tables (only if the function exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'update_updated_at_column') THEN
        DROP TRIGGER IF EXISTS update_exams_updated_at ON exams;
        CREATE TRIGGER update_exams_updated_at 
            BEFORE UPDATE ON exams 
            FOR EACH ROW 
            EXECUTE FUNCTION update_updated_at_column();

        DROP TRIGGER IF EXISTS update_exam_subjects_updated_at ON exam_subjects;
        CREATE TRIGGER update_exam_subjects_updated_at 
            BEFORE UPDATE ON exam_subjects 
            FOR EACH ROW 
            EXECUTE FUNCTION update_updated_at_column();
    END IF;
END
$$;

-- 5. Enable Row Level Security for exam tables
ALTER TABLE exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE exam_subjects ENABLE ROW LEVEL SECURITY;

-- 6. Create policies for exam tables
DROP POLICY IF EXISTS "Enable all operations for service role" ON exams;
CREATE POLICY "Enable all operations for service role" ON exams
    FOR ALL 
    TO service_role 
    USING (true) 
    WITH CHECK (true);

DROP POLICY IF EXISTS "Enable all operations for service role" ON exam_subjects;
CREATE POLICY "Enable all operations for service role" ON exam_subjects
    FOR ALL 
    TO service_role 
    USING (true) 
    WITH CHECK (true);

-- 7. Grant permissions for exam tables
GRANT ALL ON exams TO service_role;
GRANT ALL ON exam_subjects TO service_role;

-- 8. Insert sample exam data (optional - remove these lines if you don't want sample data)
INSERT INTO exams (exam_name, status) VALUES 
    ('Mid-term Examination', 'active'),
    ('Final Examination', 'active')
ON CONFLICT DO NOTHING;

-- Success message
SELECT 'Exam schedules tables created successfully!' as message;
