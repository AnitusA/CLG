// Simple Node.js script to test database connection and check for data
import { createClient } from '@supabase/supabase-js';

// You'll need to add your Supabase credentials here
const supabaseUrl = 'YOUR_SUPABASE_URL';
const supabaseKey = 'YOUR_SUPABASE_ANON_KEY';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testDatabase() {
  console.log('Testing database connection...');
  
  try {
    // Test assignments table
    const { data: assignments, error: assignError } = await supabase
      .from('assignments')
      .select('*')
      .limit(5);
    
    console.log('Assignments found:', assignments?.length || 0);
    if (assignError) console.error('Assignment error:', assignError);
    
    // Test records table
    const { data: records, error: recordError } = await supabase
      .from('records')
      .select('*')
      .limit(5);
    
    console.log('Records found:', records?.length || 0);
    if (recordError) console.error('Records error:', recordError);
    
    // Test seminars table
    const { data: seminars, error: seminarError } = await supabase
      .from('seminars')
      .select('*')
      .limit(5);
    
    console.log('Seminars found:', seminars?.length || 0);
    if (seminarError) console.error('Seminars error:', seminarError);
    
    // Test events table
    const { data: events, error: eventError } = await supabase
      .from('events')
      .select('*')
      .limit(5);
    
    console.log('Events found:', events?.length || 0);
    if (eventError) console.error('Events error:', eventError);
    
    // Check if completion tables exist (should not exist in clean setup)
    const { data: completionTables, error: tableError } = await supabase
      .from('student_assignment_completions')
      .select('*')
      .limit(1);
    
    if (tableError) {
      console.log('✅ Completion tables do not exist (clean setup)');
    } else {
      console.log('⚠️  Completion tables still exist');
    }
    
    // Test current vs past items
    const today = new Date().toISOString().split('T')[0];
    
    // Count future assignments
    const { data: futureAssignments } = await supabase
      .from('assignments')
      .select('*', { count: 'exact' })
      .gte('due_date', today)
      .eq('status', 'active');
    
    // Count past assignments  
    const { data: pastAssignments } = await supabase
      .from('assignments')
      .select('*', { count: 'exact' })
      .lt('due_date', today);
    
    console.log('Future/Active assignments:', futureAssignments?.length || 0);
    console.log('Past assignments:', pastAssignments?.length || 0);
    
  } catch (error) {
    console.error('Database test failed:', error);
  }
}

// Uncomment to run: testDatabase();
console.log('Update the Supabase credentials above and uncomment the last line to test');
