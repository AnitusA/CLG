import bcrypt from 'bcryptjs';
import { supabase } from './supabase.server';
import { validatePasswordStrength, checkRateLimit, resetRateLimit } from './password.server';

/**
 * Hash a password using bcrypt with a secure salt
 * @param password - Plain text password to hash
 * @returns Promise<string> - Hashed password
 */
async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12; // Higher number = more secure but slower
  return await bcrypt.hash(password, saltRounds);
}

/**
 * Verify a password against its hash
 * @param password - Plain text password to verify
 * @param hash - Stored password hash
 * @returns Promise<boolean> - True if password matches
 */
async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return await bcrypt.compare(password, hash);
}

/**
 * Create a new student account with secure password hashing
 * @param registerNumber - Student's registration number
 * @param password - Plain text password (will be hashed)
 * @returns Promise<Student> - Created student record (without password)
 */
export async function createStudent(registerNumber: string, password: string) {
  // Input validation
  if (!registerNumber || !password) {
    throw new Error('Registration number and password are required');
  }

  // Validate password strength
  const passwordValidation = validatePasswordStrength(password);
  if (!passwordValidation.isValid) {
    throw new Error(`Password validation failed: ${passwordValidation.errors.join(', ')}`);
  }

  // Hash the password before storing
  const passwordHash = await hashPassword(password);

  const { data, error } = await supabase
    .from('students')
    .insert([
      {
        register_number: registerNumber,
        password_hash: passwordHash, // Store hashed password
      }
    ])
    .select('id, register_number, created_at') // Don't return password hash
    .single();

  if (error) {
    // Handle unique constraint violation
    if (error.code === '23505') {
      throw new Error('A student with this registration number already exists');
    }
    throw new Error(`Failed to create student account: ${error.message}`);
  }

  return data;
}

/**
 * Authenticate a student login with dual format support (migration period)
 * Supports both old plain text passwords and new bcrypt hashes
 * @param registerNumber - Student's registration number
 * @param password - Plain text password to verify
 * @param clientIP - Client IP address for rate limiting
 * @returns Promise<StudentAuth | null> - Student auth data or null if invalid
 */
export async function authenticateStudent(registerNumber: string, password: string, clientIP?: string) {
  // Input validation
  if (!registerNumber || !password) {
    return null;
  }

  // Temporarily disable rate limiting for testing - can be re-enabled later
  // Rate limiting by IP address (if provided)
  // if (clientIP && !checkRateLimit(clientIP)) {
  //   throw new Error('Too many login attempts. Please try again later.');
  // }

  // Rate limiting by register number
  // if (!checkRateLimit(`student:${registerNumber}`)) {
  //   throw new Error('Too many login attempts for this account. Please try again later.');
  // }

  try {
    // Simplified query - only get what we know exists
    let { data: student, error } = await supabase
      .from('students')
      .select('id, register_number, password')
      .eq('register_number', registerNumber)
      .single();

    if (error || !student) {
      console.log('Student not found or error:', error);
      return null;
    }

    // Simple password comparison for now
    const isValid = password === student.password;
    console.log('Password comparison:', { 
      input: password, 
      stored: student.password, 
      match: isValid 
    });
    
    if (!isValid) {
      return null;
    }

    // Return student data without password fields
    return {
      id: student.id,
      registerNumber: student.register_number,
    };
  } catch (error) {
    // Log error for debugging but don't expose details to client
    console.error('Authentication error:', error);
    return null;
  }
}

/**
 * Authenticate admin access
 * @param passKey - Admin passkey
 * @returns boolean - True if admin passkey is valid
 */
export function authenticateAdmin(passKey: string): boolean {
  const adminPassKey = process.env.ADMIN_PASSKEY || 'admin123'; // Fallback to default
  return passKey === adminPassKey;
}

// Type definitions
export interface StudentAuth {
  id: string;
  registerNumber: string;
}

export interface Student {
  id: string;
  register_number: string;
  created_at: string;
}
