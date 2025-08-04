import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client with service role key
const supabaseUrl = 'https://spjnakucrrjvvdsahpom.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNwam5ha3VjcnJqdnZkc2FocG9tIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjkwOTA4NSwiZXhwIjoyMDY4NDg1MDg1fQ.kJWcHkRz8NPuK-JfboT_Eiyqm_yMIPmQFm3kJG0PO6Y';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testEventInsert() {
  console.log('🧪 Testing event insert with event_name...');
  
  try {
    const { data: newEvent, error } = await supabase
      .from('events')
      .insert({
        event_name: 'Test Event'
      })
      .select();
      
    if (error) {
      console.log('❌ Error:', error.message);
    } else {
      console.log('✅ Event created successfully!');
      console.log('📋 Available columns:', Object.keys(newEvent[0]));
      console.log('📄 Record:', newEvent[0]);
    }
    
  } catch (err) {
    console.error('❌ Unexpected error:', err);
  }
}

testEventInsert().catch(console.error);
