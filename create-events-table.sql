-- Create events table for college events management
-- Run this SQL in your Supabase SQL Editor

-- 1. Create events table
CREATE TABLE IF NOT EXISTS events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    event_name TEXT NOT NULL,
    event_date DATE NOT NULL,
    description TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'ongoing', 'completed', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_events_event_date ON events(event_date);
CREATE INDEX IF NOT EXISTS idx_events_status ON events(status);
CREATE INDEX IF NOT EXISTS idx_events_created_at ON events(created_at);

-- 3. Create trigger for updated_at (if the function exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'update_updated_at_column') THEN
        DROP TRIGGER IF EXISTS update_events_updated_at ON events;
        CREATE TRIGGER update_events_updated_at 
            BEFORE UPDATE ON events 
            FOR EACH ROW 
            EXECUTE FUNCTION update_updated_at_column();
    END IF;
END
$$;

-- 4. Enable Row Level Security
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- 5. Create RLS policy (allow all operations for service role)
DROP POLICY IF EXISTS "Enable all operations for service role" ON events;
CREATE POLICY "Enable all operations for service role" ON events
    FOR ALL 
    TO service_role 
    USING (true) 
    WITH CHECK (true);

-- 6. Grant permissions
GRANT ALL ON events TO service_role;

-- 7. Insert sample events (optional - remove these lines if you don't want sample data)
INSERT INTO events (event_name, event_date, description, status) VALUES 
    ('Annual Day Celebration', '2025-08-15', 'Grand celebration of our college''s annual day with cultural performances, awards ceremony, and guest lectures.', 'upcoming'),
    ('Tech Fest 2025', '2025-09-10', 'Technology festival featuring coding competitions, robotics exhibitions, and tech talks by industry experts.', 'upcoming'),
    ('Sports Meet', '2025-07-30', 'Inter-department sports competition including cricket, football, basketball, and track events.', 'upcoming'),
    ('Cultural Night', '2025-08-20', 'Evening of music, dance, drama, and art exhibitions showcasing student talents.', 'upcoming')
ON CONFLICT DO NOTHING;

-- Success message
SELECT 'Events table created successfully!' as message;
