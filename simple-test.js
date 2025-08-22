import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function simpleTest() {
  console.log('🧪 Simple profile update test...');
  
  try {
    // Get first student
    const { data: students, error } = await supabase
      .from('students')
      .select('*')
      .limit(1);

    if (error) {
      console.error('❌ Error fetching:', error);
      return;
    }

    const student = students[0];
    console.log('✅ Found student:', student.register_number);
    console.log('Current columns:', Object.keys(student));
    
    // Try a simple update
    const { data: result, error: updateError } = await supabase
      .from('students')
      .update({ 
        name: 'TEST UPDATE',
        updated_at: new Date().toISOString()
      })
      .eq('register_number', student.register_number)
      .select();

    if (updateError) {
      console.error('❌ Update failed:', updateError);
    } else {
      console.log('✅ Update successful:', result);
    }

  } catch (err) {
    console.error('❌ Error:', err);
  }
}

simpleTest();
