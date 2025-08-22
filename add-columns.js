import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function addColumns() {
  console.log('🔧 Adding email and phone columns to students table...');
  
  try {
    // First check current structure
    console.log('📊 Checking current table structure...');
    const { data: currentData, error: selectError } = await supabase
      .from('students')
      .select('*')
      .limit(1);
    
    if (selectError) {
      console.error('❌ Error checking table:', selectError);
      return;
    }
    
    if (currentData && currentData[0]) {
      console.log('Current columns:', Object.keys(currentData[0]));
    }
    
    // Try to add email column if it doesn't exist
    console.log('\n🔧 Adding email column...');
    const { error: emailError } = await supabase.rpc('sql', {
      query: `ALTER TABLE students ADD COLUMN IF NOT EXISTS email TEXT;`
    });
    
    if (emailError) {
      console.log('Email column might already exist or error:', emailError.message);
    } else {
      console.log('✅ Email column added');
    }
    
    // Try to add phone column if it doesn't exist
    console.log('\n🔧 Adding phone column...');
    const { error: phoneError } = await supabase.rpc('sql', {
      query: `ALTER TABLE students ADD COLUMN IF NOT EXISTS phone TEXT;`
    });
    
    if (phoneError) {
      console.log('Phone column might already exist or error:', phoneError.message);
    } else {
      console.log('✅ Phone column added');
    }
    
    // Check final structure
    console.log('\n📊 Final table structure...');
    const { data: finalData, error: finalError } = await supabase
      .from('students')
      .select('*')
      .limit(1);
    
    if (finalError) {
      console.error('❌ Error checking final table:', finalError);
    } else if (finalData && finalData[0]) {
      console.log('Final columns:', Object.keys(finalData[0]));
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

addColumns();
