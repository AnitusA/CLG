import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client with service role key
const supabaseUrl = 'https://spjnakucrrjvvdsahpom.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNwam5ha3VjcnJqdnZkc2FocG9tIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjkwOTA4NSwiZXhwIjoyMDY4NDg1MDg1fQ.kJWcHkRz8NPuK-JfboT_Eiyqm_yMIPmQFm3kJG0PO6Y';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testSeminarCreationFixed() {
  console.log('🧪 Testing seminar creation with correct schema (category instead of subject)...');
  
  const customCategories = [
    'Computer Science',
    'Data Science', 
    'Artificial Intelligence',
    'Web Development',
    'Mobile Development',
    'Mathematics',
    'Physics',
    'Engineering'
  ];
  
  for (const category of customCategories) {
    try {
      console.log(`\n📝 Testing seminar with category: "${category}"`);
      
      const { data: newSeminar, error } = await supabase
        .from('seminars')
        .insert({
          category: category,
          title: `${category} Workshop`,
          description: `Comprehensive seminar covering ${category} concepts and practical applications`,
          seminar_date: '2025-08-15',
          status: 'scheduled'
        })
        .select();
        
      if (error) {
        console.log(`❌ Error creating seminar for "${category}":`, error.message);
      } else {
        console.log(`✅ Successfully created seminar for "${category}"`);
        console.log(`   ID: ${newSeminar[0].id}`);
        console.log(`   Title: ${newSeminar[0].title}`);
      }
      
    } catch (err) {
      console.error(`❌ Unexpected error for "${category}":`, err.message);
    }
  }
  
  // Verify all seminars were created
  console.log('\n🔍 Verifying all custom seminars...');
  const { data: allSeminars, error: fetchError } = await supabase
    .from('seminars')
    .select('category, title, seminar_date')
    .eq('seminar_date', '2025-08-15')
    .order('created_at', { ascending: false });
    
  if (fetchError) {
    console.log('❌ Error fetching seminars:', fetchError.message);
  } else {
    console.log(`✅ Found ${allSeminars.length} seminar entries for 2025-08-15:`);
    allSeminars.forEach((seminar, index) => {
      console.log(`  ${index + 1}. ${seminar.category} - "${seminar.title}"`);
    });
  }
}

testSeminarCreationFixed().catch(console.error);
