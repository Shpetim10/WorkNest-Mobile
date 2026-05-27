import type { AttendanceApiError } from '@/features/attendance/types/contracts';
import type { TranslationKey } from '@/common/localization';

type Translate = (key: TranslationKey) => string;

const ATTENDANCE_CODE_TO_MESSAGE: Record<string, { key: TranslationKey; fallback: string }> = {
  QR_REQUIRED: { key: 'attendance.qrRequiredError', fallback: 'Please scan the site QR code before continuing.' },
  QR_INVALID: { key: 'attendance.qrInvalidError', fallback: 'This QR code is not valid. Please scan the current site QR again.' },
  QR_EXPIRED: { key: 'attendance.qrExpiredError', fallback: 'This QR code has expired. Please scan the latest code.' },
  QR_REPLAYED: { key: 'attendance.qrReplayedError', fallback: 'This QR code was already used. Please scan a new one.' },
  QR_SITE_MISMATCH: { key: 'attendance.qrSiteMismatchError', fallback: 'This QR code belongs to a different site. Please scan the QR code at your location.' },
  LOCATION_REQUIRED: { key: 'attendance.locationRequiredError', fallback: 'Location is required to record attendance for this site.' },
  INVALID_LOCATION: { key: 'attendance.invalidLocationError', fallback: "We couldn't verify your location. Please try again." },
  LOW_LOCATION_ACCURACY: { key: 'attendance.lowLocationAccuracyError', fallback: 'Your GPS signal is too weak. Move to a clearer area and try again.' },
  OUTSIDE_GEOFENCE: { key: 'attendance.outsideGeofenceError', fallback: 'You appear to be outside the allowed site area.' },
  CHECKIN_DISABLED: { key: 'attendance.checkinDisabledError', fallback: 'Check-in is currently unavailable for this site.' },
  CHECKOUT_DISABLED: { key: 'attendance.checkoutDisabledError', fallback: 'Check-out is currently unavailable for this site.' },
  ALREADY_CHECKED_OUT: { key: 'attendance.alreadyCheckedOutError', fallback: 'You have already completed attendance for today.' },
  ATTENDANCE_STATE_INVALID: { key: 'attendance.stateInvalidError', fallback: 'Your attendance needs review before another action can be recorded.' },
  EMPLOYEE_INACTIVE: { key: 'attendance.employeeInactiveError', fallback: 'Your employee account is not active. Please contact your manager.' },
  COMPANY_INACTIVE: { key: 'attendance.companyInactiveError', fallback: 'Attendance is currently unavailable for your company.' },
  EMPLOYEE_SITE_NOT_ASSIGNED: { key: 'attendance.siteNotAssignedError', fallback: 'No work site is assigned to your profile yet.' },
  SITE_DISABLED: { key: 'attendance.siteDisabledError', fallback: 'This site is not active for attendance.' },
  ACCESS_DENIED: { key: 'attendance.accessDeniedError', fallback: 'You do not have permission to perform this action right now.' },
  VALIDATION_ERROR: { key: 'attendance.validationError', fallback: 'Some required information is missing or invalid. Please try again.' },
};

function fallbackForStatus(status?: number, t?: Translate): string {
  if (status === 403) {
    return t ? t('attendance.statusForbiddenError') : 'You do not have access to perform this action.';
  }
  if (status && status >= 500) {
    return t ? t('attendance.serverError') : 'Something went wrong while recording attendance. Please try again.';
  }
  return t ? t('attendance.connectionError') : "We couldn't connect right now. Please check your internet and try again.";
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

export function getFriendlyAttendanceError(error: unknown, t?: Translate): string {
  const parsed = parseError(error);
  const status = parsed.status;
  const code = parsed.code;
  const backendMessage = parsed.message;

  if (code && ATTENDANCE_CODE_TO_MESSAGE[code]) {
    const message = ATTENDANCE_CODE_TO_MESSAGE[code];
    return t ? t(message.key) : message.fallback;
  }

  if (backendMessage && backendMessage.trim().length > 0) {
    return backendMessage;
  }

  return fallbackForStatus(status, t);
}
