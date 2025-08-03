import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client with service role key
const supabaseUrl = 'https://spjnakucrrjvvdsahpom.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNwam5ha3VjcnJqdnZkc2FocG9tIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjkwOTA4NSwiZXhwIjoyMDY4NDg1MDg1fQ.kJWcHkRz8NPuK-JfboT_Eiyqm_yMIPmQFm3kJG0PO6Y';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testCompleteSemin() {
  console.log('🧪 Testing complete seminar creation with all required fields...');
  
  try {
    const { data: newSeminar, error } = await supabase
      .from('seminars')
      .insert({
        category: 'research',
        title: 'Introduction to Machine Learning',
        description: 'A comprehensive introduction to machine learning concepts and practical applications',
        speaker: 'Dr. John Smith',
        speaker_bio: 'Professor of Computer Science with 10+ years experience in AI',
        seminar_date: '2025-08-20',
        start_time: '14:00:00',
        end_time: '16:00:00',
        location: 'Conference Room A',
        capacity: 50,
        registration_required: false,
        registration_deadline: '2025-08-20',
        requirements: '',
        materials: '',
        status: 'scheduled'
      })
      .select();
      
    if (error) {
      console.log('❌ Error creating seminar:', error.message);
      console.log('Error details:', error);
    } else {
      console.log('✅ Seminar created successfully!');
      console.log('📄 Created seminar:', newSeminar[0]);
    }
    
  } catch (err) {
    console.error('❌ Unexpected error:', err);
  }
}

testCompleteSemin().catch(console.error);
