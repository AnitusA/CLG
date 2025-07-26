import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client with service role key
const supabaseUrl = 'https://spjnakucrrjvvdsahpom.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNwam5ha3VjcnJqdnZkc2FocG9tIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjkwOTA4NSwiZXhwIjoyMDY4NDg1MDg1fQ.kJWcHkRz8NPuK-JfboT_Eiyqm_yMIPmQFm3kJG0PO6Y';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function examineEvents() {
  console.log('🔍 Examining events table structure...');
  
  try {
    // Try to get all records to see structure
    const { data: events, error } = await supabase
      .from('events')
      .select('*');
      
    if (error) {
      console.log('❌ Error fetching events:', error.message);
    } else {
      console.log('✅ Events table exists');
      console.log('📊 Number of records:', events.length);
      
      if (events.length > 0) {
        console.log('📋 Columns found:', Object.keys(events[0]));
        console.log('📄 Sample record:', events[0]);
      } else {
        console.log('📄 No records in events table');
        
        // Try to insert a minimal record to see what fails
        console.log('🧪 Testing minimal insert...');
        const { error: insertError } = await supabase
          .from('events')
          .insert({});
          
        if (insertError) {
          console.log('💡 Insert error reveals required columns:', insertError.message);
        }
      }
    }
    
  } catch (err) {
    console.error('❌ Unexpected error:', err);
  }
}

examineEvents().catch(console.error);
