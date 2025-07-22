import { supabase } from './supabase.server';

export async function createStudent(registerNumber: string, password: string) {
  const { data, error } = await supabase
    .from('students')
    .insert([
      {
        register_number: registerNumber,
        password: password, // Changed from password_hash to password
      }
    ])
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function authenticateStudent(registerNumber: string, password: string) {
  console.log('🔍 Auth attempt:', { registerNumber, password });
  
  const { data: student, error } = await supabase
    .from('students')
    .select('*')
    .eq('register_number', registerNumber)
    .single();

  console.log('📊 Database result:', { student, error });

  if (error || !student) {
    console.log('❌ Student not found or error:', error);
    return null;
  }

  // Direct password comparison (no hashing)
  const isValid = password === student.password; // Changed from password_hash to password
  console.log('🔐 Password check:', { 
    inputPassword: password, 
    dbPassword: student.password, 
    isValid 
  });
  
  if (!isValid) {
    console.log('❌ Password mismatch');
    return null;
  }

  console.log('✅ Authentication successful');
  return {
    id: student.id,
    registerNumber: student.register_number,
  };
}

export function authenticateAdmin(passKey: string): boolean {
  const adminPassKey = process.env.ADMIN_PASSKEY || 'admin123'; // Fallback to default
  return passKey === adminPassKey;
}
