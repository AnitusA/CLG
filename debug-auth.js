import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client with service role key for testing
const supabaseUrl = 'https://spjnakucrrjvvdsahpom.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNwam5ha3VjcnJqdnZkc2FocG9tIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjkwOTA4NSwiZXhwIjoyMDY4NDg1MDg1fQ.kJWcHkRz8NPuK-JfboT_Eiyqm_yMIPmQFm3kJG0PO6Y';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function debugAuthentication() {
  console.log('🔍 Debugging authentication for register number: 963524104021');
  
  try {
    // Test the simplified query our auth function now uses
    const { data: student, error } = await supabase
      .from('students')
      .select('id, register_number, password')
      .eq('register_number', '963524104021')
      .single();

    console.log('📊 Database query result:');
    console.log('  Error:', error);
    console.log('  Student found:', !!student);
    
    if (student) {
      console.log('  Register number:', student.register_number);
      console.log('  Has password:', !!student.password);
      console.log('  Password value:', student.password);
    }

    // Test password comparison
    const testPassword = '12345678';
    console.log('\n🔐 Testing password comparison:');
    console.log('  Input password:', testPassword);
    
    if (student && student.password) {
      const isValid = testPassword === student.password;
      console.log('  → Password match:', isValid);
      
      if (isValid) {
        console.log('  ✅ Authentication should succeed!');
      } else {
        console.log('  ❌ Authentication will fail');
        console.log('  Expected:', student.password);
        console.log('  Got:', testPassword);
      }
    } else {
      console.log('  ❌ No password found in database');
    }

  } catch (err) {
    console.error('❌ Error during authentication debug:', err);
  }
}

debugAuthentication().catch(console.error);
