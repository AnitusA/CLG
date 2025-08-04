import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client with service role key
const supabaseUrl = 'https://spjnakucrrjvvdsahpom.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNwam5ha3VjcnJqdnZkc2FocG9tIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjkwOTA4NSwiZXhwIjoyMDY4NDg1MDg1fQ.kJWcHkRz8NPuK-JfboT_Eiyqm_yMIPmQFm3kJG0PO6Y';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkTables() {
  console.log('🔍 Checking existing tables by trying to query them...');
  
  const tablesToCheck = ['assignments', 'homework', 'records', 'seminars', 'exams', 'events', 'students'];
  
  for (const tableName of tablesToCheck) {
    console.log(`\n🔍 Checking '${tableName}' table...`);
    
    try {
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .limit(1);
        
      if (error) {
        console.log(`   ❌ Table '${tableName}' error:`, error.message);
      } else {
        console.log(`   ✅ Table '${tableName}' exists with ${data ? data.length : 0} sample records`);
        if (data && data.length > 0) {
          console.log(`   📊 Columns:`, Object.keys(data[0]));
        }
      }
    } catch (err) {
      console.log(`   ❌ Error checking '${tableName}':`, err.message);
    }
  }
}

checkTables().catch(console.error);
