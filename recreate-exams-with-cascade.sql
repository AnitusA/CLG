-- Alternative: Handle dependencies with CASCADE (Use with caution!)
-- This will remove dependent tables/constraints as well
-- Only use if you're okay with losing related data

-- Step 1: Drop the exams table with CASCADE to remove dependencies
DROP TABLE IF EXISTS exams CASCADE;

-- Step 2: Recreate the exams table with all required fields
CREATE TABLE exams (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    exam_name TEXT NOT NULL,
    subject TEXT NOT NULL,
    syllabus TEXT NOT NULL,
    exam_date DATE NOT NULL,
    exam_time TIME NOT NULL,
    status VARCHAR(20) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'ongoing', 'completed', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 3: Create indexes
CREATE INDEX idx_exams_date ON exams(exam_date);
CREATE INDEX idx_exams_status ON exams(status);
CREATE INDEX idx_exams_subject ON exams(subject);

-- Step 4: Enable RLS
ALTER TABLE exams ENABLE ROW LEVEL SECURITY;

-- Step 5: Create policy
CREATE POLICY "Enable all operations for service role" ON exams
    FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Step 6: Grant permissions
GRANT ALL ON exams TO service_role;

-- Step 7: Insert sample data
INSERT INTO exams (exam_name, subject, syllabus, exam_date, exam_time, status) VALUES 
('Mid-term Mathematics', 'Mathematics', 'Chapter 1-5: Algebra, Trigonometry, Basic Calculus', '2025-08-15', '10:00:00', 'scheduled'),
('Final Physics Exam', 'Physics', 'Chapter 1-8: Mechanics, Thermodynamics, Optics, Modern Physics', '2025-08-25', '14:00:00', 'scheduled'),
('Chemistry Lab Test', 'Chemistry', 'Organic Chemistry: Reactions, Mechanisms, Synthesis', '2025-08-30', '09:00:00', 'scheduled');

-- Verify
SELECT * FROM exams;
