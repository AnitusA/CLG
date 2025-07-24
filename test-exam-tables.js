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

async function createTables() {
  try {
    console.log('🚀 Creating exam schedules tables...');
    
    // Test if we can create a sample exam to check if tables exist
    console.log('\n🔍 Testing if tables exist...');
    
    // Try to insert a test exam
    const { data: testExam, error: examError } = await supabase
      .from('exams')
      .insert({
        exam_name: 'Test Exam',
        status: 'active'
      })
      .select()
      .single();
    
    if (examError) {
      console.log('❌ Exams table does not exist or has an error:', examError.message);
      console.log('❗ Please run the migration SQL manually in Supabase SQL Editor');
      console.log('📄 Migration file: exam-schedules-migration.sql');
      return;
    }
    
    console.log('✅ Exams table exists and is working');
    
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
      console.log('❗ Please run the migration SQL manually in Supabase SQL Editor');
      return;
    }
    
    console.log('✅ Exam subjects table exists and is working');
    
    // Clean up test data
    await supabase.from('exam_subjects').delete().eq('exam_id', testExam.id);
    await supabase.from('exams').delete().eq('id', testExam.id);
    
    console.log('🎉 All tables are ready! You can now create exams.');
    
  } catch (error) {
    console.error('❌ Error:', error);
    console.log('\n❗ Please run the migration SQL manually in Supabase SQL Editor:');
    console.log('📄 File: exam-schedules-migration.sql');
  }
}

createTables();
