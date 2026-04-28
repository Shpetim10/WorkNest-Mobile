import type { ApiErrorEnvelope, ApiSuccessEnvelope } from '@/features/auth/types/contracts';

export type AttendanceAction = 'CHECK_IN' | 'CHECK_OUT' | 'NONE';

export type AttendanceState =
  | 'NOT_CHECKED_IN'
  | 'CHECKED_IN'
  | 'CHECKED_OUT'
  | 'PENDING_REVIEW'
  | string;

export type AttendanceDayStatus =
  | 'PRESENT'
  | 'ABSENT'
  | 'LATE'
  | 'HALF_DAY'
  | 'PENDING_REVIEW'
  | 'WEEKEND'
  | 'HOLIDAY'
  | string;

export interface AttendanceWarning {
  code: string;
  severity?: 'LOW' | 'MEDIUM' | 'HIGH' | string;
  message: string;
}

export interface AttendanceDayRecord {
  dayRecordId: string;
  clockInTime: string | null;
  clockOutTime: string | null;
  workedMinutes: number;
  dayStatus: AttendanceDayStatus;
  reviewStatus: 'NONE' | 'PENDING' | 'APPROVED' | 'REJECTED' | string;
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
  platform: 'ANDROID' | 'IOS' | 'WEB';
  appVersion?: string;
  employeeNote?: string;
}

export interface ClockAttendanceResponseData {
  state: AttendanceState;
  nextAllowedAction: AttendanceAction;
  blocked?: boolean;
  blockReasonCode?: string | null;
  blockReasonMessage?: string | null;
  eventTypeCreated: 'CHECK_IN' | 'CHECK_OUT' | string;
  eventStatus: string;
  attendanceDecision: string;
  clockInTime: string | null;
  clockOutTime: string | null;
  serverTime: string;
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
  reviewStatus: 'NONE' | 'PENDING' | 'APPROVED' | 'REJECTED' | string;
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
