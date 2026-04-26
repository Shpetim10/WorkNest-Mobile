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
  ACCESS_DENIED: 'You are not authorized for this action.',
  RESET_TOKEN_INVALID: 'This reset link is invalid. Request a new password reset link.',
  RESET_TOKEN_EXPIRED: 'This reset link has expired. Request a new password reset link.',
  RESET_TOKEN_ALREADY_USED: 'This reset link was already used. Request a new password reset link.',
  INVITATION_TOKEN_INVALID: 'This invitation token is invalid. Please request a new invitation.',
  INVITATION_TOKEN_EXPIRED: 'This invitation token has expired. Please request a new invitation.',
  INVITATION_ALREADY_USED: 'This invitation has already been used. Please contact your administrator.',
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
