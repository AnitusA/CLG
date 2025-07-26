import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client with service role key
const supabaseUrl = 'https://spjnakucrrjvvdsahpom.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNwam5ha3VjcnJqdnZkc2FocG9tIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjkwOTA4NSwiZXhwIjoyMDY4NDg1MDg1fQ.kJWcHkRz8NPuK-JfboT_Eiyqm_yMIPmQFm3kJG0PO6Y';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createEventsTable() {
  console.log('🔧 Creating proper events table...');
  
  try {
    // Delete the current events table
    console.log('🗑️ Dropping existing events table...');
    const { error: dropError } = await supabase
      .from('events')
      .delete()
      .neq('id', 'dummy'); // This will delete all records
      
    if (dropError) {
      console.log('⚠️ Error clearing events:', dropError.message);
    }

    // Try to insert with the columns we need
    console.log('📝 Creating event with required columns...');
    const { data: newEvent, error: insertError } = await supabase
      .from('events')
      .insert({
        title: 'Sample Event',
        description: 'This is a sample event description',
        event_date: '2024-08-01'
      })
      .select();
      
    if (insertError) {
      console.log('❌ Error creating event:', insertError.message);
      
      // Maybe the table exists with different column structure
      console.log('🔍 Checking what columns are available...');
      
      // Try a minimal insert to see what works
      const { data: simpleEvent, error: simpleError } = await supabase
        .from('events')
        .insert({
          // Try common column names
          name: 'Simple Event'
        })
        .select();
        
      if (simpleError) {
        console.log('❌ Even simple insert failed:', simpleError.message);
      } else {
        console.log('✅ Events table exists with columns:', Object.keys(simpleEvent[0]));
      }
    } else {
      console.log('✅ Event created successfully:', newEvent);
    }
    
  } catch (err) {
    console.error('❌ Unexpected error:', err);
  }
}

createEventsTable().catch(console.error);
