import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client with service role key
const supabaseUrl = 'https://spjnakucrrjvvdsahpom.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNwam5ha3VjcnJqdnZkc2FocG9tIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjkwOTA4NSwiZXhwIjoyMDY4NDg1MDg1fQ.kJWcHkRz8NPuK-JfboT_Eiyqm_yMIPmQFm3kJG0PO6Y';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function fixDatabase() {
  console.log('🔧 Fixing database schema...');
  
  try {
    // Step 1: Add password_hash column
    console.log('Step 1: Adding password_hash column...');
    const { data: addColumn, error: addError } = await supabase.rpc('sql', {
      query: `ALTER TABLE students ADD COLUMN IF NOT EXISTS password_hash TEXT DEFAULT '';`
    });
    
    if (addError) {
      console.log('❌ Error adding column:', addError);
    } else {
      console.log('✅ Password_hash column added successfully');
    }

    // Step 2: Update NULL values
    console.log('Step 2: Updating NULL values...');
    const { data: updateNulls, error: updateError } = await supabase.rpc('sql', {
      query: `UPDATE students SET password_hash = '' WHERE password_hash IS NULL;`
    });
    
    if (updateError) {
      console.log('❌ Error updating NULLs:', updateError);
    } else {
      console.log('✅ NULL values updated');
    }

    // Step 3: Make column NOT NULL
    console.log('Step 3: Setting NOT NULL constraint...');
    const { data: notNull, error: notNullError } = await supabase.rpc('sql', {
      query: `ALTER TABLE students ALTER COLUMN password_hash SET NOT NULL;`
    });
    
    if (notNullError) {
      console.log('❌ Error setting NOT NULL:', notNullError);
    } else {
      console.log('✅ NOT NULL constraint added');
    }

    // Step 4: Verify the fix
    console.log('Step 4: Verifying the fix...');
    const { data: student, error: verifyError } = await supabase
      .from('students')
      .select('id, register_number, password_hash, password')
      .eq('register_number', '963524104021')
      .single();

    if (verifyError) {
      console.log('❌ Verification failed:', verifyError);
    } else {
      console.log('✅ Verification successful!');
      console.log('   Register number:', student.register_number);
      console.log('   Has password:', !!student.password);
      console.log('   Has password_hash column:', student.hasOwnProperty('password_hash'));
      console.log('   Password_hash value:', student.password_hash);
    }

    // Step 5: Test authentication logic
    console.log('Step 5: Testing authentication logic...');
    const testPassword = '12345678';
    if (student) {
      console.log('   Input password:', testPassword);
      console.log('   Stored password:', student.password);
      console.log('   Password match:', testPassword === student.password);
    }

    console.log('\n🎉 Database fix completed! Try logging in now.');

  } catch (err) {
    console.error('❌ Unexpected error:', err);
  }
}

fixDatabase().catch(console.error);
