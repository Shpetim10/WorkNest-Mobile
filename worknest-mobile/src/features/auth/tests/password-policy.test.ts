import { validatePasswordPolicy } from '@/features/auth/utils/password-policy';

import { assert, assertEqual } from './test-helpers';

(() => {
  const valid = validatePasswordPolicy({
    password: 'StrongPass1',
    confirmPassword: 'StrongPass1',
    email: 'user@example.com',
  });
  assertEqual(valid.valid, true, 'Expected strong password to pass policy');

  const tooShort = validatePasswordPolicy({
    password: 'Ab1',
    confirmPassword: 'Ab1',
  });
  assert(tooShort.errors.length > 0, 'Expected short password to fail');

  const noUppercase = validatePasswordPolicy({
    password: 'password1',
    confirmPassword: 'password1',
  });
  assert(noUppercase.errors.some((error) => error.includes('uppercase')), 'Expected uppercase failure');

  const mismatched = validatePasswordPolicy({
    password: 'StrongPass1',
    confirmPassword: 'StrongPass2',
  });
  assert(mismatched.errors.some((error) => error.includes('match')), 'Expected confirm mismatch failure');
})();

