-- Create exam_schedules table for college exam management
-- Run this SQL in your Supabase SQL Editor

-- 1. Create exam_schedules table
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

-- 2. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_exam_schedules_exam_date ON exam_schedules(exam_date);
CREATE INDEX IF NOT EXISTS idx_exam_schedules_subject ON exam_schedules(subject);
CREATE INDEX IF NOT EXISTS idx_exam_schedules_status ON exam_schedules(status);
CREATE INDEX IF NOT EXISTS idx_exam_schedules_exam_type ON exam_schedules(exam_type);
CREATE INDEX IF NOT EXISTS idx_exam_schedules_created_at ON exam_schedules(created_at);

-- 3. Create trigger for updated_at (if the function exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'update_updated_at_column') THEN
        DROP TRIGGER IF EXISTS update_exam_schedules_updated_at ON exam_schedules;
        CREATE TRIGGER update_exam_schedules_updated_at 
            BEFORE UPDATE ON exam_schedules 
            FOR EACH ROW 
            EXECUTE FUNCTION update_updated_at_column();
    END IF;
END
$$;

-- 4. Enable Row Level Security
ALTER TABLE exam_schedules ENABLE ROW LEVEL SECURITY;

-- 5. Create RLS policy (allow all operations for service role)
DROP POLICY IF EXISTS "Enable all operations for service role" ON exam_schedules;
CREATE POLICY "Enable all operations for service role" ON exam_schedules
    FOR ALL 
    TO service_role 
    USING (true) 
    WITH CHECK (true);

-- 6. Grant permissions
GRANT ALL ON exam_schedules TO service_role;

-- 7. Insert sample exam schedules (optional - remove these lines if you don't want sample data)
INSERT INTO exam_schedules (subject, exam_date, exam_time, duration_minutes, room_number, exam_type, instructions, total_marks, status) VALUES 
    ('Mathematics', '2025-08-15', '09:00:00', 180, 'Room 101', 'final', 'Bring calculator and drawing instruments. No mobile phones allowed.', 100, 'scheduled'),
    ('Physics', '2025-08-17', '14:00:00', 180, 'Room 102', 'final', 'Formula sheet will be provided. Bring scientific calculator.', 100, 'scheduled'),
    ('Chemistry', '2025-08-19', '09:00:00', 180, 'Room 103', 'final', 'Periodic table will be provided. No electronic devices except calculator.', 100, 'scheduled'),
    ('Computer Science', '2025-08-21', '14:00:00', 180, 'Lab 201', 'final', 'Programming exam. Laptops will be provided. No internet access.', 100, 'scheduled'),
    ('English Literature', '2025-08-23', '09:00:00', 180, 'Room 104', 'final', 'Essay format questions. Bring blue or black pen only.', 100, 'scheduled'),
    ('Data Structures', '2025-08-25', '14:00:00', 180, 'Lab 202', 'midterm', 'Code implementation and theory. Reference material not allowed.', 50, 'scheduled')
ON CONFLICT DO NOTHING;

-- Success message
SELECT 'Exam schedules table created successfully!' as message;
