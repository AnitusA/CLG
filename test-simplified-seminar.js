import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client with service role key
const supabaseUrl = 'https://spjnakucrrjvvdsahpom.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNwam5ha3VjcnJqdnZkc2FocG9tIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjkwOTA4NSwiZXhwIjoyMDY4NDg1MDg1fQ.kJWcHkRz8NPuK-JfboT_Eiyqm_yMIPmQFm3kJG0PO6Y';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testSimplifiedSeminar() {
  console.log('🧪 Testing simplified seminar creation (subject + title + description only)...');
  
  const testSeminars = [
    {
      subject: 'Mathematics',
      title: 'Advanced Calculus Workshop',
      description: 'Deep dive into calculus concepts and applications'
    },
    {
      subject: 'Computer Science',
      title: 'Python Programming Basics',
      description: 'Introduction to Python programming language'
    },
    {
      subject: 'Physics',
      title: 'Quantum Mechanics Overview',
      description: 'Understanding the fundamentals of quantum mechanics'
    }
  ];
  
  for (const seminar of testSeminars) {
    try {
      console.log(`\n📝 Creating seminar: "${seminar.subject}: ${seminar.title}"`);
      
      // Simulate the form submission exactly as the new code does
      const { data: newSeminar, error } = await supabase
        .from('seminars')
        .insert({
          category: 'academic', // Fixed category for database constraint
          title: `${seminar.subject}: ${seminar.title}`, // Subject included in title
          description: seminar.description,
          speaker: 'TBD', // Default speaker
          speaker_bio: '',
          seminar_date: '2025-08-30',
          start_time: '09:00:00',
          end_time: '10:00:00',
          location: 'TBD',
          capacity: 50,
          registration_required: false,
          registration_deadline: '2025-08-30',
          requirements: '',
          materials: '',
          status: 'scheduled'
        })
        .select('id, title, description');
        
      if (error) {
        console.log(`❌ Error creating seminar:`, error.message);
      } else {
        console.log(`✅ Successfully created seminar!`);
        console.log(`   Title: ${newSeminar[0].title}`);
        console.log(`   Description: ${newSeminar[0].description}`);
        console.log(`   ID: ${newSeminar[0].id}`);
      }
      
    } catch (err) {
      console.error(`❌ Unexpected error:`, err.message);
    }
  }
  
  console.log('\n🔍 Final verification - all seminars for Aug 30:');
  const { data: allSeminars, error: fetchError } = await supabase
    .from('seminars')
    .select('title, description')
    .eq('seminar_date', '2025-08-30')
    .order('created_at', { ascending: false });
    
  if (fetchError) {
    console.log('❌ Error fetching seminars:', fetchError.message);
  } else {
    console.log(`✅ Found ${allSeminars.length} seminars:`);
    allSeminars.forEach((seminar, index) => {
      console.log(`  ${index + 1}. ${seminar.title}`);
    });
  }
}

testSimplifiedSeminar().catch(console.error);
