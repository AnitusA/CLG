import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client with service role key
const supabaseUrl = 'https://spjnakucrrjvvdsahpom.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNwam5ha3VjcnJqdnZkc2FocG9tIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjkwOTA4NSwiZXhwIjoyMDY4NDg1MDg1fQ.kJWcHkRz8NPuK-JfboT_Eiyqm_yMIPmQFm3kJG0PO6Y';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testCustomSubjects() {
  console.log('🧪 Testing custom subject creation...');
  
  const customSubjects = [
    'Advanced Physics',
    'Data Structures & Algorithms', 
    'Machine Learning Fundamentals',
    'Creative Writing',
    'Spanish Language',
    'Environmental Science',
    'Digital Marketing',
    'Psychology 101'
  ];
  
  for (const subject of customSubjects) {
    try {
      console.log(`\n📝 Testing subject: "${subject}"`);
      
      const { data: newHomework, error } = await supabase
        .from('homework')
        .insert({
          subject: subject,
          description: `Test homework for ${subject} - ensuring custom subjects work properly`,
          homework_date: '2025-08-05'
        })
        .select();
        
      if (error) {
        console.log(`❌ Error creating homework for "${subject}":`, error.message);
      } else {
        console.log(`✅ Successfully created homework for "${subject}"`);
        console.log(`   ID: ${newHomework[0].id}`);
      }
      
    } catch (err) {
      console.error(`❌ Unexpected error for "${subject}":`, err.message);
    }
  }
  
  // Verify all subjects were created
  console.log('\n🔍 Verifying all custom subjects...');
  const { data: allHomework, error: fetchError } = await supabase
    .from('homework')
    .select('subject, description')
    .eq('homework_date', '2025-08-05')
    .order('created_at', { ascending: false });
    
  if (fetchError) {
    console.log('❌ Error fetching homework:', fetchError.message);
  } else {
    console.log(`✅ Found ${allHomework.length} homework entries for 2025-08-05:`);
    allHomework.forEach((hw, index) => {
      console.log(`  ${index + 1}. ${hw.subject}`);
    });
  }
}

testCustomSubjects().catch(console.error);
