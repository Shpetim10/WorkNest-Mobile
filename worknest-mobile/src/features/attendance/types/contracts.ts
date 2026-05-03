import type { ApiErrorEnvelope, ApiSuccessEnvelope } from '@/features/auth/types/contracts';

export type AttendanceAction = 'CHECK_IN' | 'CHECK_OUT' | 'NONE';

export type AttendanceState = 'NOT_CHECKED_IN' | 'CHECKED_IN' | 'CHECKED_OUT' | string;

export type AttendanceDayStatus =
  | 'PRESENT'
  | 'ABSENT'
  | 'LATE'
  | 'HALF_DAY'
  | 'ON_LEAVE'
  | 'HOLIDAY'
  | 'MISSING_CHECKOUT'
  | 'FLAGGED'
  | 'PENDING_REVIEW'
  | string;

export type AttendanceReviewStatus = 'NONE' | 'PENDING_REVIEW' | 'APPROVED' | 'REJECTED' | string;

export interface AttendanceWarning {
  code: string;
  severity?: 'INFO' | 'WARNING' | 'ERROR' | string;
  message: string;
}

export interface AttendanceDayRecord {
  id: string;
  firstCheckInAt: string | null;
  lastCheckOutAt: string | null;
  workedMinutes: number;
  dayStatus: AttendanceDayStatus;
  reviewStatus: AttendanceReviewStatus;
  hasWarnings: boolean;
  warnings: AttendanceWarning[];
}

export interface AttendanceTodayData {
  state: AttendanceState;
  nextAllowedAction: AttendanceAction;
  blocked: boolean;
  blockReasonCode: string | null;
  blockReasonMessage: string | null;
  siteId: string | null;
  siteName: string | null;
  qrRequired: boolean;
  locationRequired: boolean;
  serverTime: string;
  timezone: string;
  workDate: string;
  todayRecord: AttendanceDayRecord | null;
  warnings: AttendanceWarning[];
}

export interface ClockAttendanceRequest {
  clientRequestId: string;
  qrToken?: string;
  latitude?: number;
  longitude?: number;
  accuracyMeters?: number;
  clientCapturedAt?: string;
  devicePublicId?: string;
  platform: 'android' | 'ios' | 'web';
  appVersion?: string;
  employeeNote?: string;
}

export interface ClockAttendanceResponseData {
  state: AttendanceState;
  nextAllowedAction: AttendanceAction;
  eventType: 'CHECK_IN' | 'CHECK_OUT' | string;
  eventStatus: 'ACCEPTED' | 'ACCEPTED_WITH_WARNINGS' | string;
  decision: 'ACCEPTED' | 'ACCEPTED_WITH_WARNINGS' | string;
  firstCheckInAt: string | null;
  lastCheckOutAt: string | null;
  serverRecordedAt: string;
  workDate: string;
  timezone: string;
  message?: string;
  warnings: AttendanceWarning[];
  todayRecord: AttendanceDayRecord | null;
}

export interface AttendanceMonthDay {
  date: string;
  dayStatus: AttendanceDayStatus;
  clockInTime: string | null;
  clockOutTime: string | null;
  workedMinutes: number;
  hasWarnings: boolean;
  reviewStatus: AttendanceReviewStatus;
}

export interface AttendanceMonthData {
  year: number;
  month: number;
  timezone: string;
  days: AttendanceMonthDay[];
}

export interface ValidateQrRequest {
  siteId: string;
  qrToken: string;
}

export interface ValidateQrResponseData {
  valid: boolean;
  code: string;
  message: string;
  terminalId?: string | null;
  expiresAt?: string | null;
}

export type AttendanceTodayEnvelope = ApiSuccessEnvelope<AttendanceTodayData>;
export type AttendanceClockEnvelope = ApiSuccessEnvelope<ClockAttendanceResponseData>;
export type AttendanceMonthEnvelope = ApiSuccessEnvelope<AttendanceMonthData>;
export type QrValidateEnvelope = ApiSuccessEnvelope<ValidateQrResponseData>;
export type AttendanceApiError = ApiErrorEnvelope;
