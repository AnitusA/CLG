import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('🔧 Testing profile update functionality...');

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function testProfileUpdate() {
  try {
    // Get a test student
    console.log('\n📊 Getting test student...');
    const { data: students, error: fetchError } = await supabase
      .from('students')
      .select('*')
      .limit(1);

    if (fetchError) {
      console.error('❌ Error fetching student:', fetchError);
      return;
    }

    if (!students || students.length === 0) {
      console.error('❌ No students found in database');
      return;
    }

    const testStudent = students[0];
    console.log('✅ Test student found:', testStudent.register_number);
    console.log('Current data:', {
      name: testStudent.name,
      'email id': testStudent['email id'],
      'mobile number': testStudent['mobile number']
    });

    // Test update with the exact same structure as the profile form
    console.log('\n🧪 Testing profile update...');
    const updateData = {
      name: testStudent.name || 'Test Name Updated',
      'email id': 'test@example.com',
      'mobile number': '1234567890',
      updated_at: new Date().toISOString()
    };

    const { data: updateResult, error: updateError } = await supabase
      .from('students')
      .update(updateData)
      .eq('register_number', testStudent.register_number)
      .select();

    if (updateError) {
      console.error('❌ Profile update failed:', updateError);
      console.error('Update data attempted:', updateData);
      
      // Let's check the exact column names
      console.log('\n🔍 Checking exact column structure...');
      const { data: columnCheck } = await supabase
        .from('students')
        .select('*')
        .eq('register_number', testStudent.register_number)
        .limit(1);
      
      if (columnCheck && columnCheck[0]) {
        console.log('Available columns:', Object.keys(columnCheck[0]));
      }
    } else {
      console.log('✅ Profile update successful!');
      console.log('Updated data:', updateResult[0]);
    }

    // Test password update
    console.log('\n🔐 Testing password update...');
    const { data: passwordResult, error: passwordError } = await supabase
      .from('students')
      .update({ 
        password: 'newpassword123',
        updated_at: new Date().toISOString()
      })
      .eq('register_number', testStudent.register_number)
      .select();

    if (passwordError) {
      console.error('❌ Password update failed:', passwordError);
    } else {
      console.log('✅ Password update successful!');
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

testProfileUpdate().catch(console.error);
