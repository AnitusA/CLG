import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client with service role key
const supabaseUrl = 'https://spjnakucrrjvvdsahpom.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNwam5ha3VjcnJqdnZkc2FocG9tIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjkwOTA4NSwiZXhwIjoyMDY4NDg1MDg1fQ.kJWcHkRz8NPuK-JfboT_Eiyqm_yMIPmQFm3kJG0PO6Y';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testHomeworkCreation() {
  console.log('🧪 Testing homework creation...');
  
  try {
    // Test homework creation exactly like the form does
    const { data: newHomework, error } = await supabase
      .from('homework')
      .insert({
        subject: 'Mathematics',
        description: 'Complete exercises 1-10 from Chapter 5',
        homework_date: '2024-08-03',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select();
      
    if (error) {
      console.log('❌ Error creating homework:', error.message);
    } else {
      console.log('✅ Homework created successfully!');
      console.log('📄 Created homework:', newHomework[0]);
    }
    
    // Also test fetching existing homework
    console.log('\n🔍 Fetching all homework...');
    const { data: allHomework, error: fetchError } = await supabase
      .from('homework')
      .select('*')
      .order('homework_date', { ascending: false });
      
    if (fetchError) {
      console.log('❌ Error fetching homework:', fetchError.message);
    } else {
      console.log('✅ Found homework records:', allHomework.length);
      allHomework.forEach((hw, index) => {
        console.log(`  ${index + 1}. ${hw.subject} - ${hw.homework_date}`);
      });
    }
    
  } catch (err) {
    console.error('❌ Unexpected error:', err);
  }
}

testHomeworkCreation().catch(console.error);
