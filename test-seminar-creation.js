import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client with service role key
const supabaseUrl = 'https://spjnakucrrjvvdsahpom.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNwam5ha3VjcnJqdnZkc2FocG9tIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjkwOTA4NSwiZXhwIjoyMDY4NDg1MDg1fQ.kJWcHkRz8NPuK-JfboT_Eiyqm_yMIPmQFm3kJG0PO6Y';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testSeminarCreation() {
  console.log('🧪 Testing seminar creation with custom subjects...');
  
  const customSubjects = [
    'Advanced Computer Science',
    'Data Analytics & Visualization', 
    'Artificial Intelligence Fundamentals',
    'Web Development Best Practices',
    'Mobile App Development',
    'Cybersecurity Essentials',
    'Cloud Computing',
    'Software Engineering Principles'
  ];
  
  for (const subject of customSubjects) {
    try {
      console.log(`\n📝 Testing seminar with subject: "${subject}"`);
      
      const { data: newSeminar, error } = await supabase
        .from('seminars')
        .insert({
          subject: subject,
          title: `${subject} Workshop`,
          description: `Comprehensive seminar covering ${subject} concepts and practical applications`,
          seminar_date: '2025-08-10',
          status: 'scheduled'
        })
        .select();
        
      if (error) {
        console.log(`❌ Error creating seminar for "${subject}":`, error.message);
        console.log('Error details:', error);
      } else {
        console.log(`✅ Successfully created seminar for "${subject}"`);
        console.log(`   ID: ${newSeminar[0].id}`);
        console.log(`   Title: ${newSeminar[0].title}`);
      }
      
    } catch (err) {
      console.error(`❌ Unexpected error for "${subject}":`, err.message);
    }
  }
  
  // Verify all seminars were created
  console.log('\n🔍 Verifying all custom seminars...');
  const { data: allSeminars, error: fetchError } = await supabase
    .from('seminars')
    .select('subject, title, seminar_date')
    .eq('seminar_date', '2025-08-10')
    .order('created_at', { ascending: false });
    
  if (fetchError) {
    console.log('❌ Error fetching seminars:', fetchError.message);
  } else {
    console.log(`✅ Found ${allSeminars.length} seminar entries for 2025-08-10:`);
    allSeminars.forEach((seminar, index) => {
      console.log(`  ${index + 1}. ${seminar.subject} - "${seminar.title}"`);
    });
  }
}

testSeminarCreation().catch(console.error);
