// Test script for Enhanced Exam Schedule functionality
import { createClient } from '@supabase/supabase-js';

// Use your actual Supabase URL and key
const supabaseUrl = process.env.SUPABASE_URL || 'your-supabase-url';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'your-service-role-key';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testEnhancedExamSchedule() {
  console.log('🧪 Testing Enhanced Exam Schedule functionality...\n');

  try {
    // Test 1: Create a new exam with all fields
    console.log('1️⃣ Creating exam with subject, title, syllabus, date, and time...');
    const { data: newExam, error: createError } = await supabase
      .from('exams')
      .insert({
        exam_name: 'Mid-term Mathematics Examination',
        subject: 'Mathematics',
        syllabus: 'Chapter 1-5: Algebra (Linear equations, Quadratic equations), Trigonometry (Basic functions, Identities), Calculus (Limits, Derivatives, Basic Integration), Geometry (Coordinate geometry, Circles)',
        exam_date: '2025-08-20',
        exam_time: '10:00:00',
        status: 'scheduled'
      })
      .select()
      .single();

    if (createError) {
      console.error('❌ Error creating exam:', createError.message);
      if (createError.message.includes('column') && createError.message.includes('does not exist')) {
        console.log('💡 Please run the add-fields-to-exams-table.sql migration first!');
        return;
      }
      throw createError;
    }

    console.log('✅ Successfully created exam!');
    console.log(`   Title: ${newExam.exam_name}`);
    console.log(`   Subject: ${newExam.subject}`);
    console.log(`   Date: ${newExam.exam_date} at ${newExam.exam_time}`);
    console.log(`   Syllabus: ${newExam.syllabus.substring(0, 80)}...`);
    console.log('');

    // Test 2: Create another exam
    console.log('2️⃣ Creating second exam...');
    const { data: secondExam, error: secondError } = await supabase
      .from('exams')
      .insert({
        exam_name: 'Final Physics Examination',
        subject: 'Physics',
        syllabus: 'Chapter 1-6: Mechanics (Motion, Force, Energy, Momentum), Thermodynamics (Laws, Heat engines, Entropy), Waves (Sound, Light, Electromagnetic), Modern Physics (Atomic structure, Radioactivity)',
        exam_date: '2025-08-25',
        exam_time: '14:00:00',
        status: 'scheduled'
      })
      .select()
      .single();

    if (secondError) {
      console.error('❌ Error creating second exam:', secondError.message);
      throw secondError;
    }

    console.log('✅ Successfully created second exam!');
    console.log(`   Title: ${secondExam.exam_name}`);
    console.log(`   Subject: ${secondExam.subject}`);
    console.log(`   Date: ${secondExam.exam_date} at ${secondExam.exam_time}`);
    console.log('');

    // Test 3: Fetch all exams
    console.log('3️⃣ Fetching all exams...');
    const { data: allExams, error: fetchError } = await supabase
      .from('exams')
      .select('*')
      .order('exam_date', { ascending: true });

    if (fetchError) {
      console.error('❌ Error fetching exams:', fetchError.message);
      throw fetchError;
    }

    console.log(`✅ Found ${allExams.length} exams:`);
    allExams.forEach((exam, index) => {
      console.log(`   ${index + 1}. ${exam.exam_name}`);
      console.log(`      Subject: ${exam.subject || 'Not specified'}`);
      console.log(`      Date: ${exam.exam_date || 'Not specified'} ${exam.exam_time ? 'at ' + exam.exam_time : ''}`);
      console.log(`      Status: ${exam.status}`);
      if (exam.syllabus) {
        console.log(`      Syllabus: ${exam.syllabus.substring(0, 60)}...`);
      }
    });
    console.log('');

    // Test 4: Update exam status
    console.log('4️⃣ Updating exam status to completed...');
    const { error: updateError } = await supabase
      .from('exams')
      .update({ status: 'completed' })
      .eq('id', newExam.id);

    if (updateError) {
      console.error('❌ Error updating exam status:', updateError.message);
      throw updateError;
    }

    console.log('✅ Successfully updated exam status to completed!');
    console.log('');

    // Test 5: Search exams by subject
    console.log('5️⃣ Searching exams by subject (Mathematics)...');
    const { data: mathExams, error: searchError } = await supabase
      .from('exams')
      .select('*')
      .eq('subject', 'Mathematics')
      .order('exam_date', { ascending: true });

    if (searchError) {
      console.error('❌ Error searching exams:', searchError.message);
      throw searchError;
    }

    console.log(`✅ Found ${mathExams.length} Mathematics exams`);
    console.log('');

    // Test 6: Cleanup - Delete test exams
    console.log('6️⃣ Cleaning up test exams...');
    const { error: deleteError } = await supabase
      .from('exams')
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
      .from('exams')
      .select('id, exam_name, subject, exam_date')
      .order('exam_date', { ascending: true });

    if (verifyError) {
      console.error('❌ Error verifying remaining exams:', verifyError.message);
      throw verifyError;
    }

    console.log(`✅ Found ${remainingExams.length} remaining exams in database`);
    
    console.log('\n🎉 All enhanced exam schedule tests completed successfully!');
    console.log('📋 Summary:');
    console.log('   ✅ Create exam with subject, title, syllabus, date, time');
    console.log('   ✅ Fetch all exams with new fields');
    console.log('   ✅ Update exam status');
    console.log('   ✅ Search by subject');
    console.log('   ✅ Delete exams');
    console.log('   ✅ Database operations working correctly');
    console.log('\n🚀 Your enhanced exam schedule form is now ready to use!');

  } catch (error) {
    console.error('\n💥 Test failed:', error.message);
    console.log('\n🔧 Troubleshooting steps:');
    console.log('   1. Make sure your Supabase project is set up correctly');
    console.log('   2. Check that SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set');
    console.log('   3. Run the database migration: add-fields-to-exams-table.sql');
    console.log('   4. Verify the exams table exists with all new columns');
  }
}

// Run the test
testEnhancedExamSchedule();
