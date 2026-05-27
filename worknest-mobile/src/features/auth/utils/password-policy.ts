import type { TranslationKey } from '@/common/localization';

type Translate = (key: TranslationKey) => string;

export interface PasswordValidationInput {
  password: string;
  confirmPassword?: string;
  email?: string | null;
  t?: Translate;
}

export interface PasswordValidationResult {
  valid: boolean;
  errors: string[];
}

export function validatePasswordPolicy(input: PasswordValidationInput): PasswordValidationResult {
  const errors: string[] = [];
  const password = input.password ?? '';
  const translate = (key: TranslationKey, fallback: string) => input.t?.(key) ?? fallback;

  if (password.length < 8) {
    errors.push(translate('auth.passwordMinLengthError', 'Password must be at least 8 characters long.'));
  }
  if (!/[A-Z]/.test(password)) {
    errors.push(translate('auth.passwordUppercaseError', 'Password must include at least one uppercase letter.'));
  }
  if (!/[0-9]/.test(password)) {
    errors.push(translate('auth.passwordDigitError', 'Password must include at least one digit.'));
  }

  const normalizedEmail = (input.email ?? '').trim().toLowerCase();
  if (normalizedEmail && password.trim().toLowerCase() === normalizedEmail) {
    errors.push(translate('auth.passwordEmailError', 'Password must not be the same as your email.'));
  }

  if (typeof input.confirmPassword === 'string' && password !== input.confirmPassword) {
    errors.push(translate('auth.passwordMismatchError', 'Passwords do not match.'));
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

