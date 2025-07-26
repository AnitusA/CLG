import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client with service role key
const supabaseUrl = 'https://spjnakucrrjvvdsahpom.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNwam5ha3VjcnJqdnZkc2FocG9tIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjkwOTA4NSwiZXhwIjoyMDY4NDg1MDg1fQ.kJWcHkRz8NPuK-JfboT_Eiyqm_yMIPmQFm3kJG0PO6Y';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testSchemaUpdate() {
  console.log('🧪 Testing if we can add missing fields by insertion...');
  
  try {
    // Test exams table - try to insert with new fields
    console.log('📊 Testing exams table...');
    const { data: examData, error: examError } = await supabase
      .from('exams')
      .insert({
        exam_name: 'Test Exam',
        subject: 'Mathematics', // This might fail if column doesn't exist
        exam_date: '2024-08-01',
        status: 'scheduled'
      })
      .select();
      
    if (examError) {
      console.log('❌ Exams table needs subject and exam_date columns:', examError.message);
      
      // Try with just existing columns
      const { data: simpleExam, error: simpleError } = await supabase
        .from('exams')
        .insert({
          exam_name: 'Test Exam - Simple',
          status: 'scheduled'
        })
        .select();
        
      if (simpleError) {
        console.log('❌ Even simple insert failed:', simpleError.message);
      } else {
        console.log('✅ Simple exams insert works:', simpleExam);
      }
    } else {
      console.log('✅ Exams table supports all required fields:', examData);
    }
    
    // Test events table
    console.log('\n📅 Testing events table...');
    const { data: eventData, error: eventError } = await supabase
      .from('events')
      .insert({
        title: 'Test Event',
        description: 'Test Description',
        event_date: '2024-08-01'
      })
      .select();
      
    if (eventError) {
      console.log('❌ Events table needs columns:', eventError.message);
    } else {
      console.log('✅ Events table supports all required fields:', eventData);
    }
    
  } catch (err) {
    console.error('❌ Unexpected error:', err);
  }
}

testSchemaUpdate().catch(console.error);
