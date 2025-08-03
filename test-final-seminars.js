import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client with service role key
const supabaseUrl = 'https://spjnakucrrjvvdsahpom.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNwam5ha3VjcnJqdnZkc2FocG9tIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjkwOTA4NSwiZXhwIjoyMDY4NDg1MDg1fQ.kJWcHkRz8NPuK-JfboT_Eiyqm_yMIPmQFm3kJG0PO6Y';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testFinalSeminars() {
  console.log('🧪 Testing final seminar creation with valid categories...');
  
  const testSeminars = [
    {
      category: 'research',
      title: 'Research Methodology Workshop',
      description: 'Learn advanced research techniques and methodologies',
      speaker: 'Dr. Sarah Johnson'
    },
    {
      category: 'academic',
      title: 'Academic Writing Excellence',
      description: 'Improve your academic writing skills and publication success',
      speaker: 'Prof. Michael Chen'
    },
    {
      category: 'technical',
      title: 'Technical Skills Bootcamp',
      description: 'Hands-on technical skills for modern software development',
      speaker: 'Alex Rodriguez'
    }
  ];
  
  for (const seminar of testSeminars) {
    try {
      console.log(`\n📝 Creating seminar: "${seminar.title}"`);
      
      const { data: newSeminar, error } = await supabase
        .from('seminars')
        .insert({
          category: seminar.category,
          title: seminar.title,
          description: seminar.description,
          speaker: seminar.speaker,
          speaker_bio: `Expert in ${seminar.category} field`,
          seminar_date: '2025-08-25',
          start_time: '10:00:00',
          end_time: '12:00:00',
          location: 'Main Conference Hall',
          capacity: 75,
          registration_required: false,
          registration_deadline: '2025-08-25',
          requirements: '',
          materials: '',
          status: 'scheduled'
        })
        .select('id, title, category, speaker');
        
      if (error) {
        console.log(`❌ Error creating seminar "${seminar.title}":`, error.message);
      } else {
        console.log(`✅ Successfully created: ${newSeminar[0].title}`);
        console.log(`   Category: ${newSeminar[0].category}`);
        console.log(`   Speaker: ${newSeminar[0].speaker}`);
        console.log(`   ID: ${newSeminar[0].id}`);
      }
      
    } catch (err) {
      console.error(`❌ Unexpected error for "${seminar.title}":`, err.message);
    }
  }
  
  console.log('\n🔍 Final verification - all seminars for Aug 25:');
  const { data: allSeminars, error: fetchError } = await supabase
    .from('seminars')
    .select('title, category, speaker')
    .eq('seminar_date', '2025-08-25')
    .order('created_at', { ascending: false });
    
  if (fetchError) {
    console.log('❌ Error fetching seminars:', fetchError.message);
  } else {
    console.log(`✅ Found ${allSeminars.length} seminars:`);
    allSeminars.forEach((seminar, index) => {
      console.log(`  ${index + 1}. [${seminar.category.toUpperCase()}] ${seminar.title} - ${seminar.speaker}`);
    });
  }
}

testFinalSeminars().catch(console.error);
