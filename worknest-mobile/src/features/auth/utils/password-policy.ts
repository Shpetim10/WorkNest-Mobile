export interface PasswordValidationInput {
  password: string;
  confirmPassword?: string;
  email?: string | null;
}

export interface PasswordValidationResult {
  valid: boolean;
  errors: string[];
}

export function validatePasswordPolicy(input: PasswordValidationInput): PasswordValidationResult {
  const errors: string[] = [];
  const password = input.password ?? '';

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long.');
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must include at least one uppercase letter.');
  }
  if (!/[0-9]/.test(password)) {
    errors.push('Password must include at least one digit.');
  }

  const normalizedEmail = (input.email ?? '').trim().toLowerCase();
  if (normalizedEmail && password.trim().toLowerCase() === normalizedEmail) {
    errors.push('Password must not be the same as your email.');
  }

  if (typeof input.confirmPassword === 'string' && password !== input.confirmPassword) {
    errors.push('Passwords do not match.');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

