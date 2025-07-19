import bcrypt from 'bcryptjs';
import { supabase } from './supabase.server';

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function createStudent(registerNumber: string, password: string) {
  const hashedPassword = await hashPassword(password);
  
  const { data, error } = await supabase
    .from('students')
    .insert([
      {
        register_number: registerNumber,
        password_hash: hashedPassword,
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
  const { data: student, error } = await supabase
    .from('students')
    .select('*')
    .eq('register_number', registerNumber)
    .single();

  if (error || !student) {
    return null;
  }

  const isValid = await verifyPassword(password, student.password_hash);
  if (!isValid) {
    return null;
  }

  return {
    id: student.id,
    registerNumber: student.register_number,
  };
}

export function authenticateAdmin(passKey: string): boolean {
  const adminPassKey = 'admin123'; // Hardcoded admin password
  return passKey === adminPassKey;
}
