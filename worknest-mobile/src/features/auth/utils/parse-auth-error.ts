import type { ApiErrorEnvelope } from '@/features/auth/types/contracts';

interface ParsedAuthError {
  code?: string;
  message?: string;
  fieldErrors?: ApiErrorEnvelope['fieldErrors'];
}

export function parseAuthError(error: unknown): ParsedAuthError {
  if (!error || typeof error !== 'object') {
    return {};
  }

  const maybeError = error as { code?: string; message?: string; data?: ApiErrorEnvelope };
  if (maybeError.data && typeof maybeError.data === 'object') {
    return {
      code: maybeError.data.code,
      message: maybeError.data.message,
      fieldErrors: maybeError.data.fieldErrors,
    };
  }

  return {
    code: maybeError.code,
    message: maybeError.message,
  };
}

