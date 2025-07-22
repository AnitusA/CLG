import { createClient } from '@supabase/supabase-js';

// These should be set in your environment variables
const supabaseUrl = process.env.SUPABASE_URL || 'your-supabase-url';
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'your-supabase-service-role-key';

export const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

export type Student = {
  id: string;
  register_number: string;
  password: string; // Changed from password_hash to password
  created_at: string;
  updated_at: string;
};
