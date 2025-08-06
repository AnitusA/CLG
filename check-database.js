// This script adds the completed_by_student column to assignments and records tables
// Run this from the browser console on a page that has Supabase access

// Add column to assignments table
async function addCompletedByStudentColumns() {
  try {
    console.log('Adding completed_by_student column to assignments table...');
    
    // First check if assignments table exists and what columns it has
    const { data: assignments, error: assignmentsError } = await supabase
      .from('assignments')
      .select('*')
      .limit(1);
    
    if (assignmentsError) {
      console.error('Assignments table error:', assignmentsError);
    } else {
      console.log('Assignments table sample:', assignments);
    }

    // Check if records table exists and what columns it has  
    const { data: records, error: recordsError } = await supabase
      .from('records')
      .select('*')
      .limit(1);
      
    if (recordsError) {
      console.error('Records table error:', recordsError);
    } else {
      console.log('Records table sample:', records);
    }

    console.log('If the completed_by_student column is missing, you need to run the SQL migration manually in Supabase.');
    console.log('SQL to run:');
    console.log('ALTER TABLE assignments ADD COLUMN IF NOT EXISTS completed_by_student BOOLEAN DEFAULT FALSE;');
    console.log('ALTER TABLE records ADD COLUMN IF NOT EXISTS completed_by_student BOOLEAN DEFAULT FALSE;');
    
  } catch (error) {
    console.error('Error checking tables:', error);
  }
}

// Run the function
addCompletedByStudentColumns();
