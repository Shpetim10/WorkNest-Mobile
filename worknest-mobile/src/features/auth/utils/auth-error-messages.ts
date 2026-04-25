import type { ApiErrorEnvelope } from '@/features/auth/types/contracts';

const CODE_TO_MESSAGE: Record<string, string> = {
  INVALID_CREDENTIALS: 'Invalid email or password',
  BAD_CREDENTIALS: 'Invalid email or password',
  ACCOUNT_LOCKED: 'Account temporarily locked. Try again later',
  NO_PLATFORM_ACCESS: 'This account has no mobile access',
  USER_PENDING: 'Your account is pending activation',
  USER_SUSPENDED: 'Your account is suspended',
  USER_DEACTIVATED: 'Your account is deactivated',
  ROLE_ASSIGNMENT_NOT_FOUND: 'Selected role assignment is not valid anymore',
  ROLE_ASSIGNMENT_INACTIVE: 'Selected role assignment is inactive',
  ROLE_ASSIGNMENT_FORBIDDEN: 'You cannot access this role assignment',
  INVALID_REFRESH_TOKEN: 'Your session has expired. Please sign in again',
  REFRESH_TOKEN_REVOKED: 'Your session has expired. Please sign in again',
  REFRESH_TOKEN_EXPIRED: 'Your session has expired. Please sign in again',
  UNAUTHORIZED: 'Your session has expired. Please sign in again',
};

export function mapBackendErrorCodeToMessage(code?: string, fallback?: string): string {
  if (!code) {
    return fallback ?? 'Something went wrong. Please try again.';
  }
  return CODE_TO_MESSAGE[code] ?? fallback ?? 'Something went wrong. Please try again.';
}

export function buildFieldErrorMap(error: ApiErrorEnvelope | null): Record<string, string> {
  if (!error || error.code !== 'VALIDATION_ERROR' || !error.fieldErrors?.length) {
    return {};
  }
  return error.fieldErrors.reduce<Record<string, string>>((acc, fieldError) => {
    acc[fieldError.field] = fieldError.message;
    return acc;
  }, {});
}

export function buildFieldErrorMapFromFieldErrors(
  fieldErrors?: ApiErrorEnvelope['fieldErrors']
): Record<string, string> {
  if (!fieldErrors?.length) {
    return {};
  }
  return fieldErrors.reduce<Record<string, string>>((acc, fieldError) => {
    acc[fieldError.field] = fieldError.message;
    return acc;
  }, {});
}
