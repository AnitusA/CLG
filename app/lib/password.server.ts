import bcrypt from 'bcryptjs';

/**
 * Password validation utilities
 */

export interface PasswordValidationResult {
  isValid: boolean;
  errors: string[];
}

/**
 * Validate password strength
 * @param password - Plain text password to validate
 * @returns PasswordValidationResult - Validation result with errors
 */
export function validatePasswordStrength(password: string): PasswordValidationResult {
  const errors: string[] = [];

  if (password.length < 6) {
    errors.push('Password must be at least 6 characters long');
  }

  if (password.length > 128) {
    errors.push('Password must be less than 128 characters long');
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }

  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  // Optional: Special characters requirement
  // if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
  //   errors.push('Password must contain at least one special character');
  // }

  // Check for common weak patterns
  if (/^(.)\1+$/.test(password)) {
    errors.push('Password cannot be all the same character');
  }

  if (/^(012|123|234|345|456|567|678|789|890|abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz)/i.test(password)) {
    errors.push('Password cannot contain sequential characters');
  }

  const commonPasswords = [
    'password', '123456', '123456789', 'qwerty', 'abc123', 
    'password123', '111111', '123123', 'admin', 'letmein',
    'welcome', 'monkey', 'dragon', 'master', 'hello'
  ];

  if (commonPasswords.includes(password.toLowerCase())) {
    errors.push('Password is too common. Please choose a stronger password');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Generate a secure random password
 * @param length - Password length (default: 12)
 * @returns string - Generated password
 */
export function generateSecurePassword(length: number = 12): string {
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const numbers = '0123456789';
  const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';
  
  const allChars = lowercase + uppercase + numbers + symbols;
  let password = '';
  
  // Ensure at least one character from each category
  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += symbols[Math.floor(Math.random() * symbols.length)];
  
  // Fill the rest randomly
  for (let i = 4; i < length; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)];
  }
  
  // Shuffle the password
  return password.split('').sort(() => Math.random() - 0.5).join('');
}

/**
 * Hash password with bcrypt
 * @param password - Plain text password
 * @param saltRounds - Number of salt rounds (default: 12)
 * @returns Promise<string> - Hashed password
 */
export async function hashPassword(password: string, saltRounds: number = 12): Promise<string> {
  return await bcrypt.hash(password, saltRounds);
}

/**
 * Verify password against hash
 * @param password - Plain text password
 * @param hash - Stored password hash
 * @returns Promise<boolean> - True if password matches
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  try {
    return await bcrypt.compare(password, hash);
  } catch (error) {
    console.error('Password verification error:', error);
    return false;
  }
}

/**
 * Check if password needs rehashing (e.g., if salt rounds changed)
 * @param hash - Current password hash
 * @param saltRounds - Current salt rounds setting
 * @returns boolean - True if rehashing is needed
 */
export function needsRehash(hash: string, saltRounds: number = 12): boolean {
  try {
    const rounds = bcrypt.getRounds(hash);
    return rounds < saltRounds;
  } catch (error) {
    // If we can't determine rounds, assume rehash is needed
    return true;
  }
}

/**
 * Rate limiting for login attempts (simple in-memory implementation)
 * In production, use Redis or database-backed rate limiting
 */
const loginAttempts = new Map<string, { count: number; lastAttempt: number }>();

export function checkRateLimit(identifier: string, maxAttempts: number = 5, windowMs: number = 15 * 60 * 1000): boolean {
  const now = Date.now();
  const attempts = loginAttempts.get(identifier);

  if (!attempts) {
    loginAttempts.set(identifier, { count: 1, lastAttempt: now });
    return true;
  }

  // Reset if window has passed
  if (now - attempts.lastAttempt > windowMs) {
    loginAttempts.set(identifier, { count: 1, lastAttempt: now });
    return true;
  }

  // Check if limit exceeded
  if (attempts.count >= maxAttempts) {
    return false;
  }

  // Increment count
  attempts.count++;
  attempts.lastAttempt = now;
  return true;
}

export function resetRateLimit(identifier: string): void {
  loginAttempts.delete(identifier);
}
