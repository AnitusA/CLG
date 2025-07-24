-- Migration script to add exam schedules functionality
-- This adds the new exams and exam_subjects tables while keeping the existing tests table
-- Run this script in your Supabase SQL Editor

-- 1. Create exams table
CREATE TABLE IF NOT EXISTS exams (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    exam_name TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'completed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create exam_subjects table
CREATE TABLE IF NOT EXISTS exam_subjects (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    exam_id UUID NOT NULL REFERENCES exams(id) ON DELETE CASCADE,
    subject TEXT NOT NULL,
    exam_date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_exams_status ON exams(status);
CREATE INDEX IF NOT EXISTS idx_exams_created_at ON exams(created_at);
CREATE INDEX IF NOT EXISTS idx_exam_subjects_exam_id ON exam_subjects(exam_id);
CREATE INDEX IF NOT EXISTS idx_exam_subjects_exam_date ON exam_subjects(exam_date);

-- 4. Create triggers for updated_at columns
CREATE TRIGGER update_exams_updated_at 
    BEFORE UPDATE ON exams 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_exam_subjects_updated_at 
    BEFORE UPDATE ON exam_subjects 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- 5. Enable Row Level Security
ALTER TABLE exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE exam_subjects ENABLE ROW LEVEL SECURITY;

-- 6. Create RLS policies (allow all operations for service role)
CREATE POLICY "Enable all operations for service role" ON exams
    FOR ALL 
    TO service_role 
    USING (true) 
    WITH CHECK (true);

CREATE POLICY "Enable all operations for service role" ON exam_subjects
    FOR ALL 
    TO service_role 
    USING (true) 
    WITH CHECK (true);

-- 7. Grant permissions
GRANT ALL ON exams TO service_role;
GRANT ALL ON exam_subjects TO service_role;

-- Optional: Insert some sample data for testing
-- Uncomment the lines below if you want to add sample data

-- INSERT INTO exams (exam_name, status) VALUES 
-- ('Mid-term Examination', 'active'),
-- ('Final Examination', 'active');

-- WITH sample_exam AS (
--     SELECT id FROM exams WHERE exam_name = 'Mid-term Examination' LIMIT 1
-- )
-- INSERT INTO exam_subjects (exam_id, subject, exam_date)
-- SELECT 
--     sample_exam.id,
--     subject,
--     exam_date
-- FROM sample_exam,
-- VALUES 
--     ('Mathematics', '2025-08-15'),
--     ('Physics', '2025-08-17'),
--     ('Chemistry', '2025-08-19')
-- AS subjects(subject, exam_date);
