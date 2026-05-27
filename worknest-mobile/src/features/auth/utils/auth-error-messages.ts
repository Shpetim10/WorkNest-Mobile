import type { ApiErrorEnvelope } from '@/features/auth/types/contracts';
import type { TranslationKey } from '@/common/localization';

type Translate = (key: TranslationKey) => string;

const CODE_TO_MESSAGE_KEY: Record<string, TranslationKey> = {
  INVALID_CREDENTIALS: 'auth.error.invalidCredentials',
  BAD_CREDENTIALS: 'auth.error.invalidCredentials',
  ACCOUNT_LOCKED: 'auth.error.accountLocked',
  NO_PLATFORM_ACCESS: 'auth.error.noPlatformAccess',
  USER_PENDING: 'auth.error.userPending',
  USER_SUSPENDED: 'auth.error.userSuspended',
  USER_DEACTIVATED: 'auth.error.userDeactivated',
  ROLE_ASSIGNMENT_NOT_FOUND: 'auth.error.roleAssignmentNotFound',
  ROLE_ASSIGNMENT_INACTIVE: 'auth.error.roleAssignmentInactive',
  ROLE_ASSIGNMENT_FORBIDDEN: 'auth.error.roleAssignmentForbidden',
  INVALID_REFRESH_TOKEN: 'auth.error.sessionExpired',
  REFRESH_TOKEN_REVOKED: 'auth.error.sessionExpired',
  REFRESH_TOKEN_EXPIRED: 'auth.error.sessionExpired',
  UNAUTHORIZED: 'auth.error.sessionExpired',
  ACCESS_DENIED: 'auth.error.accessDenied',
  RESET_TOKEN_INVALID: 'auth.error.resetTokenInvalid',
  RESET_TOKEN_EXPIRED: 'auth.error.resetTokenExpired',
  RESET_TOKEN_ALREADY_USED: 'auth.error.resetTokenAlreadyUsed',
  INVITATION_TOKEN_INVALID: 'auth.error.invitationTokenInvalid',
  INVITATION_TOKEN_EXPIRED: 'auth.error.invitationTokenExpired',
  INVITATION_ALREADY_USED: 'auth.error.invitationAlreadyUsed',
};

const CODE_TO_FALLBACK_MESSAGE: Record<string, string> = {
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

export function mapBackendErrorCodeToMessage(code?: string, fallback?: string, t?: Translate): string {
  const unknownMessage = t ? t('auth.error.unknown') : 'Something went wrong. Please try again.';

  if (!code) {
    return fallback ?? unknownMessage;
  }

  const messageKey = CODE_TO_MESSAGE_KEY[code];
  return messageKey && t ? t(messageKey) : CODE_TO_FALLBACK_MESSAGE[code] ?? fallback ?? unknownMessage;
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
