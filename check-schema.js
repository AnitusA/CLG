import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = 'https://spjnakucrrjvvdsahpom.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNwam5ha3VjcnJqdnZkc2FocG9tIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcyMTQ1OTI0OSwiZXhwIjoyMDM3MDM1MjQ5fQ.oWHo0T9-B_xD8ACaWpFagU4-Zor7DQPJ3n_lw9Jws3Y';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkStudentsSchema() {
  console.log('🔍 Checking students table schema...');
  
  // Check what columns exist in students table
  const { data, error } = await supabase.rpc('sql', {
    query: `
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'students' 
      ORDER BY ordinal_position;
    `
  });
  
  if (error) {
    console.log('❌ Error checking schema:', error);
  } else {
    console.log('📊 Students table columns:');
    data.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
    });
  }

  // Check if we can query both password and password_hash
  const { data: students, error: studentsError } = await supabase
    .from('students')
    .select('id, register_number, password, password_hash')
    .limit(1);
    
  if (studentsError) {
    console.log('❌ Error querying students:', studentsError);
  } else {
    console.log('✅ Sample student data:', students[0]);
  }
}

checkStudentsSchema().catch(console.error);
