import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function getColumns() {
  const { data, error } = await supabase.from('students').select('*').limit(1);
  if (error) {
    console.error('Error:', error);
  } else if (data && data[0]) {
    console.log('Exact column names:');
    Object.keys(data[0]).forEach((col, i) => {
      console.log(`${i + 1}. "${col}"`);
    });
  }
}

getColumns();
