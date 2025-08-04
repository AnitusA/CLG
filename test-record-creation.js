import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client with service role key
const supabaseUrl = 'https://spjnakucrrjvvdsahpom.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNwam5ha3VjcnJqdnZkc2FocG9tIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjkwOTA4NSwiZXhwIjoyMDY4NDg1MDg1fQ.kJWcHkRz8NPuK-JfboT_Eiyqm_yMIPmQFm3kJG0PO6Y';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testRecordCreation() {
  console.log('🧪 Testing record creation...');
  
  try {
    // Test record creation exactly like the form does
    const { data: newRecord, error } = await supabase
      .from('records')
      .insert({
        subject: 'Computer Science',
        description: 'Test record for SCV subject - database concepts and implementation',
        record_date: '2025-08-04'
      })
      .select();
      
    if (error) {
      console.log('❌ Error creating record:', error.message);
    } else {
      console.log('✅ Record created successfully!');
      console.log('📄 Created record:', newRecord[0]);
    }
    
    // Also test fetching existing records
    console.log('\n🔍 Fetching all records...');
    const { data: allRecords, error: fetchError } = await supabase
      .from('records')
      .select('*')
      .order('record_date', { ascending: false });
      
    if (fetchError) {
      console.log('❌ Error fetching records:', fetchError.message);
    } else {
      console.log('✅ Found record entries:', allRecords.length);
      allRecords.forEach((record, index) => {
        console.log(`  ${index + 1}. ${record.subject} - ${record.record_date}`);
      });
    }
    
  } catch (err) {
    console.error('❌ Unexpected error:', err);
  }
}

testRecordCreation().catch(console.error);
