import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client with service role key
const supabaseUrl = 'https://spjnakucrrjvvdsahpom.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNwam5ha3VjcnJqdnZkc2FocG9tIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjkwOTA4NSwiZXhwIjoyMDY4NDg1MDg1fQ.kJWcHkRz8NPuK-JfboT_Eiyqm_yMIPmQFm3kJG0PO6Y';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkSeminarSchema() {
  console.log('🔍 Checking seminars table schema...');
  
  try {
    // Try to fetch existing seminars to see the actual column structure
    const { data: seminars, error } = await supabase
      .from('seminars')
      .select('*')
      .limit(1);
      
    if (error) {
      console.log('❌ Error fetching seminars:', error.message);
    } else {
      if (seminars && seminars.length > 0) {
        console.log('✅ Seminars table exists. Sample record structure:');
        console.log('Available columns:', Object.keys(seminars[0]));
        console.log('Sample record:', seminars[0]);
      } else {
        console.log('✅ Seminars table exists but is empty.');
        
        // Try a simple test insert to see what columns are expected
        console.log('\n🧪 Testing minimal insert to discover required columns...');
        const { error: insertError } = await supabase
          .from('seminars')
          .insert({
            title: 'Test Seminar'
          });
          
        if (insertError) {
          console.log('Insert error:', insertError.message);
          console.log('This helps us understand the required schema.');
        }
      }
    }
    
    // Also try to get all seminars to see if any exist
    console.log('\n📊 Checking all seminars...');
    const { data: allSeminars, error: fetchError } = await supabase
      .from('seminars')
      .select('*');
      
    if (fetchError) {
      console.log('❌ Error fetching all seminars:', fetchError.message);
    } else {
      console.log(`✅ Found ${allSeminars.length} total seminars in database`);
      if (allSeminars.length > 0) {
        console.log('All available columns from existing data:');
        const allColumns = new Set();
        allSeminars.forEach(seminar => {
          Object.keys(seminar).forEach(key => allColumns.add(key));
        });
        console.log([...allColumns]);
      }
    }
    
  } catch (err) {
    console.error('❌ Unexpected error:', err);
  }
}

checkSeminarSchema().catch(console.error);
