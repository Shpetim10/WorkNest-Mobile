import type { AttendanceApiError } from '@/features/attendance/types/contracts';

const ATTENDANCE_CODE_TO_MESSAGE: Record<string, string> = {
  QR_REQUIRED: 'Please scan the site QR code before continuing.',
  QR_INVALID: 'This QR code is not valid. Please scan the current site QR again.',
  QR_EXPIRED: 'This QR code has expired. Please scan the latest code.',
  QR_REPLAYED: 'This QR code was already used. Please scan a new one.',
  QR_SITE_MISMATCH: 'This QR code belongs to a different site. Please scan the QR code at your location.',
  LOCATION_REQUIRED: 'Location is required to record attendance for this site.',
  INVALID_LOCATION: "We couldn't verify your location. Please try again.",
  LOW_LOCATION_ACCURACY: 'Your GPS signal is too weak. Move to a clearer area and try again.',
  OUTSIDE_GEOFENCE: 'You appear to be outside the allowed site area.',
  CHECKIN_DISABLED: 'Check-in is currently unavailable for this site.',
  CHECKOUT_DISABLED: 'Check-out is currently unavailable for this site.',
  ALREADY_CHECKED_OUT: 'You have already completed attendance for today.',
  ATTENDANCE_STATE_INVALID: 'Your attendance needs review before another action can be recorded.',
  EMPLOYEE_INACTIVE: 'Your employee account is not active. Please contact your manager.',
  COMPANY_INACTIVE: 'Attendance is currently unavailable for your company.',
  EMPLOYEE_SITE_NOT_ASSIGNED: 'No work site is assigned to your profile yet.',
  SITE_DISABLED: 'This site is not active for attendance.',
  ACCESS_DENIED: 'You do not have permission to perform this action right now.',
  VALIDATION_ERROR: 'Some required information is missing or invalid. Please try again.',
};

function fallbackForStatus(status?: number): string {
  if (status === 403) {
    return 'You do not have access to perform this action.';
  }
  if (status && status >= 500) {
    return 'Something went wrong while recording attendance. Please try again.';
  }
  return "We couldn't connect right now. Please check your internet and try again.";
}

function parseError(error: unknown): {
  status?: number;
  code?: string;
  message?: string;
} {
  if (!error || typeof error !== 'object') {
    return {};
  }

  const maybeStatus = (error as { status?: number }).status;
  const maybeCode = (error as { code?: string }).code;
  const maybeMessage = (error as { message?: string }).message;
  const maybeData = (error as { data?: AttendanceApiError }).data;

  return {
    status: maybeStatus,
    code: maybeCode ?? maybeData?.code,
    message: maybeMessage ?? maybeData?.message,
  };
}

export function getFriendlyAttendanceError(error: unknown): string {
  const parsed = parseError(error);
  const status = parsed.status;
  const code = parsed.code;
  const backendMessage = parsed.message;

  if (code && ATTENDANCE_CODE_TO_MESSAGE[code]) {
    return ATTENDANCE_CODE_TO_MESSAGE[code];
  }

  if (backendMessage && backendMessage.trim().length > 0) {
    return backendMessage;
  }

  return fallbackForStatus(status);
}
