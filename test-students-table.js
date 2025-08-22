import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('🔧 Checking students table structure...');
console.log('URL:', supabaseUrl);
console.log('Service Role Key:', supabaseServiceRoleKey ? 'Present' : 'Missing');

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function checkStudentsTable() {
  try {
    // First, let's see if the table exists and what data is in it
    console.log('\n📊 Checking students table...');
    const { data: students, error } = await supabase
      .from('students')
      .select('*')
      .limit(3);

    if (error) {
      console.error('❌ Error querying students table:', error);
      
      // If the table doesn't exist or has issues, let's check what tables exist
      console.log('\n🔍 Checking what tables exist...');
      const { data: tables, error: tablesError } = await supabase
        .from('information_schema.tables')
        .select('table_name')
        .eq('table_schema', 'public');
        
      if (tablesError) {
        console.error('❌ Error checking tables:', tablesError);
      } else {
        console.log('📋 Available tables:', tables.map(t => t.table_name));
      }
      return;
    }

    console.log('✅ Students table found with', students.length, 'sample records');
    if (students.length > 0) {
      console.log('📝 Sample student structure:');
      console.log('Columns available:', Object.keys(students[0]));
      console.log('Sample data:', students[0]);
    }

    // Test if we can update a student record
    if (students.length > 0) {
      const testStudent = students[0];
      console.log(`\n🧪 Testing update on student: ${testStudent.register_number}`);
      
      const { data: updateResult, error: updateError } = await supabase
        .from('students')
        .update({ updated_at: new Date().toISOString() })
        .eq('register_number', testStudent.register_number)
        .select();

      if (updateError) {
        console.error('❌ Update test failed:', updateError);
      } else {
        console.log('✅ Update test successful');
      }
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

checkStudentsTable().catch(console.error);
