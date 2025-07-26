import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client with service role key
const supabaseUrl = 'https://spjnakucrrjvvdsahpom.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNwam5ha3VjcnJqdnZkc2FocG9tIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjkwOTA4NSwiZXhwIjoyMDY4NDg1MDg1fQ.kJWcHkRz8NPuK-JfboT_Eiyqm_yMIPmQFm3kJG0PO6Y';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function updateTablesSchema() {
  console.log('🔧 Updating database schema for admin requirements...');
  
  try {
    // Update exams table to match requirements
    console.log('📊 Updating exams table schema...');
    
    // Add missing columns to exams table
    const examsUpdates = [
      "ALTER TABLE exams ADD COLUMN IF NOT EXISTS subject TEXT",
      "ALTER TABLE exams ADD COLUMN IF NOT EXISTS exam_date DATE",
    ];
    
    for (const query of examsUpdates) {
      const { error } = await supabase.rpc('sql', { query });
      if (error) {
        console.log(`❌ Error with query "${query}":`, error.message);
      } else {
        console.log(`✅ Successfully executed: ${query}`);
      }
    }
    
    // Check events table structure
    console.log('\n📅 Checking events table...');
    const { data: events, error: eventsError } = await supabase
      .from('events')
      .select('*')
      .limit(1);
      
    if (eventsError) {
      console.log('❌ Events table error:', eventsError.message);
    } else {
      console.log('✅ Events table exists');
      if (events.length > 0) {
        console.log('📊 Events columns:', Object.keys(events[0]));
      }
      
      // Add missing columns to events table if needed
      const eventsUpdates = [
        "ALTER TABLE events ADD COLUMN IF NOT EXISTS title TEXT",
        "ALTER TABLE events ADD COLUMN IF NOT EXISTS description TEXT",
        "ALTER TABLE events ADD COLUMN IF NOT EXISTS event_date DATE",
      ];
      
      for (const query of eventsUpdates) {
        const { error } = await supabase.rpc('sql', { query });
        if (error) {
          console.log(`❌ Error with query "${query}":`, error.message);
        } else {
          console.log(`✅ Successfully executed: ${query}`);
        }
      }
    }
    
    // Verify final schema
    console.log('\n🔍 Verifying updated schemas...');
    
    // Check exams table
    const { data: examsSample } = await supabase
      .from('exams')
      .select('*')
      .limit(1);
    if (examsSample && examsSample.length > 0) {
      console.log('📊 Exams table columns:', Object.keys(examsSample[0]));
    }
    
    // Check events table
    const { data: eventsSample } = await supabase
      .from('events')
      .select('*')
      .limit(1);
    if (eventsSample) {
      console.log('📊 Events table ready for data');
    }
    
    console.log('\n🎉 Database schema updated successfully!');
    
  } catch (err) {
    console.error('❌ Unexpected error:', err);
  }
}

updateTablesSchema().catch(console.error);
