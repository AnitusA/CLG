import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client with service role key
const supabaseUrl = 'https://spjnakucrrjvvdsahpom.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNwam5ha3VjcnJqdnZkc2FocG9tIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjkwOTA4NSwiZXhwIjoyMDY4NDg1MDg1fQ.kJWcHkRz8NPuK-JfboT_Eiyqm_yMIPmQFm3kJG0PO6Y';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testSeminarAfterFix() {
  console.log('🧪 Testing seminar functionality after fixes...');
  
  try {
    // Test 1: Create a simple seminar
    console.log('\n📝 Creating test seminar...');
    const { data: newSeminar, error } = await supabase
      .from('seminars')
      .insert({
        category: 'academic',
        title: 'Biology: Cell Structure and Function',
        description: 'Detailed study of cellular components and their roles',
        speaker: 'TBD',
        speaker_bio: '',
        seminar_date: '2025-09-01',
        start_time: '09:00:00',
        end_time: '10:00:00',
        location: 'TBD',
        capacity: 50,
        registration_required: false,
        registration_deadline: '2025-09-01',
        requirements: '',
        materials: '',
        status: 'scheduled'
      })
      .select('id, title, status');
      
    if (error) {
      console.log('❌ Error creating seminar:', error.message);
    } else {
      console.log('✅ Successfully created seminar!');
      console.log(`   Title: ${newSeminar[0].title}`);
      console.log(`   Status: ${newSeminar[0].status}`);
      console.log(`   ID: ${newSeminar[0].id}`);
      
      // Test 2: Update status
      console.log('\n🔄 Testing status update...');
      const { error: updateError } = await supabase
        .from('seminars')
        .update({ status: 'completed' })
        .eq('id', newSeminar[0].id);
        
      if (updateError) {
        console.log('❌ Error updating status:', updateError.message);
      } else {
        console.log('✅ Successfully updated seminar status to completed!');
      }
      
      // Test 3: Clean up - delete test seminar
      console.log('\n🗑️ Cleaning up test data...');
      const { error: deleteError } = await supabase
        .from('seminars')
        .delete()
        .eq('id', newSeminar[0].id);
        
      if (deleteError) {
        console.log('❌ Error deleting seminar:', deleteError.message);
      } else {
        console.log('✅ Successfully cleaned up test seminar!');
      }
    }
    
    // Test 4: Verify all seminars still work
    console.log('\n🔍 Checking all seminars...');
    const { data: allSeminars, error: fetchError } = await supabase
      .from('seminars')
      .select('id, title, status, seminar_date')
      .order('seminar_date', { ascending: false })
      .limit(5);
      
    if (fetchError) {
      console.log('❌ Error fetching seminars:', fetchError.message);
    } else {
      console.log(`✅ Found ${allSeminars.length} seminars in database:`);
      allSeminars.forEach((seminar, index) => {
        console.log(`  ${index + 1}. [${seminar.status.toUpperCase()}] ${seminar.title} - ${seminar.seminar_date}`);
      });
    }
    
  } catch (err) {
    console.error('❌ Unexpected error:', err);
  }
}

testSeminarAfterFix().catch(console.error);
