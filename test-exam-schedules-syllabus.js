// Test script for Exam Schedules with Syllabus functionality
import { createClient } from '@supabase/supabase-js';

// Use your actual Supabase URL and key
const supabaseUrl = process.env.SUPABASE_URL || 'your-supabase-url';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'your-service-role-key';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testExamSchedulesWithSyllabus() {
  console.log('🧪 Testing Exam Schedules with Syllabus functionality...\n');

  try {
    // Test 1: Create a new exam schedule with syllabus
    console.log('1️⃣ Creating exam schedule with syllabus...');
    const { data: newExam, error: createError } = await supabase
      .from('exam_schedules')
      .insert({
        subject: 'Mathematics',
        exam_date: '2025-08-15',
        exam_time: '10:00:00',
        syllabus: 'Chapter 1-5: Algebra (Linear equations, Quadratic equations), Trigonometry (Basic functions, Identities), Calculus (Limits, Derivatives, Basic Integration)',
        status: 'scheduled'
      })
      .select()
      .single();

    if (createError) {
      console.error('❌ Error creating exam:', createError.message);
      if (createError.message.includes('column "syllabus" does not exist')) {
        console.log('💡 Please run the add-syllabus-to-exam-schedules.sql migration first!');
        return;
      }
      throw createError;
    }

    console.log('✅ Successfully created exam!');
    console.log(`   Subject: ${newExam.subject}`);
    console.log(`   Date: ${newExam.exam_date}`);
    console.log(`   Time: ${newExam.exam_time}`);
    console.log(`   Syllabus: ${newExam.syllabus.substring(0, 100)}...`);
    console.log('');

    // Test 2: Create another exam schedule
    console.log('2️⃣ Creating second exam schedule...');
    const { data: secondExam, error: secondError } = await supabase
      .from('exam_schedules')
      .insert({
        subject: 'Physics',
        exam_date: '2025-08-20',
        exam_time: '14:00:00',
        syllabus: 'Chapter 1-3: Mechanics (Motion, Force, Energy), Thermodynamics (Laws of thermodynamics, Heat engines), Optics (Reflection, Refraction, Lenses)',
        status: 'scheduled'
      })
      .select()
      .single();

    if (secondError) {
      console.error('❌ Error creating second exam:', secondError.message);
      throw secondError;
    }

    console.log('✅ Successfully created second exam!');
    console.log(`   Subject: ${secondExam.subject}`);
    console.log(`   Syllabus: ${secondExam.syllabus.substring(0, 80)}...`);
    console.log('');

    // Test 3: Fetch all exam schedules
    console.log('3️⃣ Fetching all exam schedules...');
    const { data: allExams, error: fetchError } = await supabase
      .from('exam_schedules')
      .select('*')
      .order('exam_date', { ascending: true });

    if (fetchError) {
      console.error('❌ Error fetching exams:', fetchError.message);
      throw fetchError;
    }

    console.log(`✅ Found ${allExams.length} exam schedules:`);
    allExams.forEach((exam, index) => {
      console.log(`   ${index + 1}. ${exam.subject} - ${exam.exam_date} at ${exam.exam_time}`);
      console.log(`      Status: ${exam.status}`);
      console.log(`      Syllabus: ${exam.syllabus.substring(0, 60)}...`);
    });
    console.log('');

    // Test 4: Update exam status
    console.log('4️⃣ Updating exam status to completed...');
    const { error: updateError } = await supabase
      .from('exam_schedules')
      .update({ status: 'completed' })
      .eq('id', newExam.id);

    if (updateError) {
      console.error('❌ Error updating exam status:', updateError.message);
      throw updateError;
    }

    console.log('✅ Successfully updated exam status to completed!');
    console.log('');

    // Test 5: Filter exams by status
    console.log('5️⃣ Fetching scheduled exams only...');
    const { data: scheduledExams, error: filterError } = await supabase
      .from('exam_schedules')
      .select('*')
      .eq('status', 'scheduled')
      .order('exam_date', { ascending: true });

    if (filterError) {
      console.error('❌ Error filtering exams:', filterError.message);
      throw filterError;
    }

    console.log(`✅ Found ${scheduledExams.length} scheduled exams`);
    console.log('');

    // Test 6: Cleanup - Delete test exams
    console.log('6️⃣ Cleaning up test exams...');
    const { error: deleteError } = await supabase
      .from('exam_schedules')
      .delete()
      .in('id', [newExam.id, secondExam.id]);

    if (deleteError) {
      console.error('❌ Error deleting test exams:', deleteError.message);
      throw deleteError;
    }

    console.log('✅ Successfully cleaned up test exams!');
    console.log('');

    // Final verification
    console.log('7️⃣ Final verification - checking remaining exams...');
    const { data: remainingExams, error: verifyError } = await supabase
      .from('exam_schedules')
      .select('id, subject, exam_date')
      .order('exam_date', { ascending: true });

    if (verifyError) {
      console.error('❌ Error verifying remaining exams:', verifyError.message);
      throw verifyError;
    }

    console.log(`✅ Found ${remainingExams.length} remaining exams in database`);
    
    console.log('\n🎉 All exam schedules with syllabus tests completed successfully!');
    console.log('📋 Summary:');
    console.log('   ✅ Create exam with syllabus');
    console.log('   ✅ Fetch all exams');
    console.log('   ✅ Update exam status');
    console.log('   ✅ Filter by status');
    console.log('   ✅ Delete exams');
    console.log('   ✅ Database operations working correctly');

  } catch (error) {
    console.error('\n💥 Test failed:', error.message);
    console.log('\n🔧 Troubleshooting steps:');
    console.log('   1. Make sure your Supabase project is set up correctly');
    console.log('   2. Check that SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set');
    console.log('   3. Run the database migration: add-syllabus-to-exam-schedules.sql');
    console.log('   4. Verify the exam_schedules table exists with syllabus column');
  }
}

// Run the test
testExamSchedulesWithSyllabus();
