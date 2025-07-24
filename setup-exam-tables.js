import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function createExamTables() {
  try {
    console.log('🚀 Creating exam tables...');
    
    // Create exams table using raw SQL
    const { error: examsTableError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS exams (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          exam_name TEXT NOT NULL,
          status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'completed')),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    });

    if (examsTableError && !examsTableError.message.includes('does not exist')) {
      console.log('ℹ️  Note: Could not execute raw SQL. This is expected in some Supabase setups.');
      console.log('📝 Please copy the SQL from create-exam-tables.sql and paste it into your Supabase SQL Editor.');
      console.log('\n🔗 Steps to fix:');
      console.log('1. Go to your Supabase dashboard');
      console.log('2. Navigate to SQL Editor');
      console.log('3. Copy and paste the content from "create-exam-tables.sql"');
      console.log('4. Click "Run" to execute the SQL');
      console.log('5. Then try creating exams again in your app');
      return;
    }

    // Test if tables exist by trying to insert test data
    console.log('✅ Testing tables...');
    const { data: testExam, error: testError } = await supabase
      .from('exams')
      .insert({ exam_name: 'Test Connection', status: 'active' })
      .select()
      .single();

    if (testError) {
      console.log('❌ Tables not created yet. Please run the SQL manually.');
      console.log('Error:', testError.message);
      return;
    }

    console.log('✅ Exams table is working!');

    // Test exam_subjects table
    const { error: subjectError } = await supabase
      .from('exam_subjects')
      .insert({
        exam_id: testExam.id,
        subject: 'Test Subject',
        exam_date: '2025-08-15'
      });

    if (subjectError) {
      console.log('❌ Exam subjects table error:', subjectError.message);
      return;
    }

    console.log('✅ Exam subjects table is working!');

    // Clean up test data
    await supabase.from('exam_subjects').delete().eq('exam_id', testExam.id);
    await supabase.from('exams').delete().eq('id', testExam.id);

    console.log('🎉 All exam tables are ready! You can now create exams in your app.');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.log('\n📝 Manual setup required:');
    console.log('Please copy the SQL from "create-exam-tables.sql" and run it in Supabase SQL Editor.');
  }
}

createExamTables();
