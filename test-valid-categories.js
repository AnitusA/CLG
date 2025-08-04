import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client with service role key
const supabaseUrl = 'https://spjnakucrrjvvdsahpom.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNwam5ha3VjcnJqdnZkc2FocG9tIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjkwOTA4NSwiZXhwIjoyMDY4NDg1MDg1fQ.kJWcHkRz8NPuK-JfboT_Eiyqm_yMIPmQFm3kJG0PO6Y';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testValidCategories() {
  console.log('🧪 Testing valid seminar categories...');
  
  const possibleCategories = [
    'research',
    'academic',
    'technical',
    'workshop',
    'conference',
    'training',
    'seminar',
    'lecture',
    'presentation',
    'tutorial',
    'discussion',
    'meeting',
    'educational',
    'science',
    'technology',
    'business',
    'other'
  ];
  
  const validCategories = [];
  const invalidCategories = [];
  
  for (const category of possibleCategories) {
    try {
      console.log(`Testing category: "${category}"`);
      
      const { data, error } = await supabase
        .from('seminars')
        .insert({
          category: category,
          title: `Test ${category} Seminar`,
          description: `Test seminar for category ${category}`,
          speaker: 'Test Speaker',
          speaker_bio: 'Test bio',
          seminar_date: '2025-12-01',
          start_time: '10:00:00',
          end_time: '11:00:00',
          location: 'Test Location',
          capacity: 25,
          registration_required: false,
          registration_deadline: '2025-12-01',
          requirements: '',
          materials: '',
          status: 'scheduled'
        })
        .select('id');
        
      if (error) {
        if (error.message.includes('check constraint')) {
          console.log(`  ❌ Invalid: ${category}`);
          invalidCategories.push(category);
        } else {
          console.log(`  ⚠️  Other error for ${category}: ${error.message}`);
        }
      } else {
        console.log(`  ✅ Valid: ${category}`);
        validCategories.push(category);
        
        // Clean up - delete the test record
        await supabase
          .from('seminars')
          .delete()
          .eq('id', data[0].id);
      }
      
    } catch (err) {
      console.error(`❌ Unexpected error for "${category}":`, err.message);
    }
  }
  
  console.log('\n📊 Results:');
  console.log('✅ Valid categories:', validCategories);
  console.log('❌ Invalid categories:', invalidCategories);
}

testValidCategories().catch(console.error);
