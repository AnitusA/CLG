import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function runMigration() {
  try {
    console.log('🚀 Running exam schedules migration...');
    
    // Read the migration SQL file
    const migrationSQL = fs.readFileSync('./exam-schedules-migration.sql', 'utf8');
    
    // Split the SQL into individual statements and execute them
    const statements = migrationSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    for (const statement of statements) {
      if (statement.trim()) {
        console.log('Executing:', statement.substring(0, 50) + '...');
        const { error } = await supabase.rpc('exec_sql', { sql: statement });
        
        if (error) {
          console.error('❌ Error executing statement:', error);
          // Continue with other statements
        } else {
          console.log('✅ Statement executed successfully');
        }
      }
    }
    
    // Test if tables were created
    console.log('\n🔍 Testing new tables...');
    
    const { data: exams, error: examsError } = await supabase
      .from('exams')
      .select('*')
      .limit(1);
    
    if (examsError) {
      console.error('❌ Exams table error:', examsError);
    } else {
      console.log('✅ Exams table is accessible');
    }
    
    const { data: examSubjects, error: subjectsError } = await supabase
      .from('exam_subjects')
      .select('*')
      .limit(1);
    
    if (subjectsError) {
      console.error('❌ Exam subjects table error:', subjectsError);
    } else {
      console.log('✅ Exam subjects table is accessible');
    }
    
    console.log('\n🎉 Migration completed!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
  }
}

runMigration();
