import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('🔧 Testing Supabase connection...');
console.log('URL:', supabaseUrl);
console.log('Service Role Key:', supabaseServiceRoleKey ? 'Present' : 'Missing');

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function testConnection() {
  try {
    console.log('\n📊 Fetching students...');
    const { data: students, error } = await supabase
      .from('students')
      .select('*')
      .limit(3);

    if (error) {
      console.error('❌ Error:', error);
      return;
    }

    console.log('✅ Students found:', students.length);
    students.forEach(student => {
      console.log(`- ${student.register_number}: password="${student.password}"`);
    });

    // Test specific authentication with existing students
    const testCredentials = [
      { registerNumber: 'CS2025', password: 'student123' },
      { registerNumber: 'STU001', password: 'QWE123' },
      { registerNumber: '963524104021', password: '12345678' }
    ];

    for (const cred of testCredentials) {
      console.log(`\n🔐 Testing authentication for ${cred.registerNumber}...`);
      const { data: student, error: authError } = await supabase
        .from('students')
        .select('*')
        .eq('register_number', cred.registerNumber)
        .single();

      if (authError) {
        console.error('❌ Auth Error:', authError);
      } else {
        console.log('✅ Found student:', student);
        console.log('Password in DB:', student.password);
        console.log(`Password match test (${cred.password}):`, student.password === cred.password);
      }
    }

  } catch (err) {
    console.error('❌ Connection failed:', err);
  }
}

testConnection();
