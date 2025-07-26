import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client with service role key
const supabaseUrl = 'https://spjnakucrrjvvdsahpom.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNwam5ha3VjcnJqdnZkc2FocG9tIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjkwOTA4NSwiZXhwIjoyMDY4NDg1MDg1fQ.kJWcHkRz8NPuK-JfboT_Eiyqm_yMIPmQFm3kJG0PO6Y';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkTables() {
  console.log('🔍 Checking existing tables...');
  
  try {
    // Get all table names in the public schema
    const { data: tables, error } = await supabase.rpc('sql', {
      query: `
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_type = 'BASE TABLE'
        ORDER BY table_name;
      `
    });
    
    if (error) {
      console.log('❌ Error getting tables:', error);
      return;
    }
    
    console.log('📋 Existing tables:');
    tables.forEach(table => {
      console.log(`   - ${table.table_name}`);
    });
    
    // Check specific tables we might need
    const tablesToCheck = ['assignments', 'homework', 'records', 'seminars', 'exams', 'events'];
    
    for (const tableName of tablesToCheck) {
      console.log(`\n🔍 Checking structure of '${tableName}' table...`);
      
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .limit(1);
        
      if (error) {
        console.log(`   ❌ Table '${tableName}' doesn't exist or error:`, error.message);
      } else {
        console.log(`   ✅ Table '${tableName}' exists`);
        if (data.length > 0) {
          console.log(`   📊 Sample columns:`, Object.keys(data[0]));
        }
      }
    }
    
  } catch (err) {
    console.error('❌ Unexpected error:', err);
  }
}

checkTables().catch(console.error);
