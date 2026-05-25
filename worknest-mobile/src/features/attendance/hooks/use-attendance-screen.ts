import { useCallback, useMemo, useRef, useState } from 'react';
import { Alert, AppState, Platform } from 'react-native';
import * as Location from 'expo-location';
import Constants from 'expo-constants';
import * as Device from 'expo-device';
import { useFocusEffect } from '@react-navigation/native';

import type {
  AttendanceMonthDay,
  AttendanceTodayData,
  ClockAttendanceRequest,
} from '@/features/attendance/types/contracts';
import {
  useGetAttendanceMonthQuery,
  useGetAttendanceTodayQuery,
  useSubmitAttendanceClockMutation,
  useValidateAttendanceQrMutation,
} from '@/features/attendance/api/attendance-api';
import { getFriendlyAttendanceError } from '@/features/attendance/utils/attendance-error-messages';
import { useAppSelector } from '@/common/store/hooks';
import { selectTenantContext, selectAuthState } from '@/features/auth';
import { useCompanyTopic, RealtimeEventType } from '@/features/realtime';
import { useLocalization } from '@/common/localization';

interface BannerState {
  type: 'success' | 'warning' | 'error';
  text: string;
}

interface UseAttendanceScreenResult {
  isInitialLoading: boolean;
  isRefreshingToday: boolean;
  isMonthLoading: boolean;
  today: AttendanceTodayData | null;
  monthDays: AttendanceMonthDay[];
  monthDate: Date;
  selectedDay: AttendanceMonthDay | null;
  scannerVisible: boolean;
  scannerError: string | null;
  banner: BannerState | null;
  actionButtonLabel: string;
  actionButtonHint: string;
  actionDisabled: boolean;
  actionDisabledReason: string | null;
  isActionBusy: boolean;
  changeMonth: (offset: number) => void;
  selectDay: (day: AttendanceMonthDay) => void;
  clearSelectedDay: () => void;
  retryAll: () => void;
  onClockPress: () => Promise<void>;
  onQrScanned: (token: string) => void;
  onQrCancelled: () => void;
  dismissBanner: () => void;
}

const LOCATION_TIMEOUT_MS = 15000;

function makeClientRequestId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }

  const seed = Math.random().toString(16).slice(2);
  return `${Date.now()}-${seed}`;
}

function platformName(): ClockAttendanceRequest['platform'] {
  if (Platform.OS === 'android') {
    return 'android';
  }
  if (Platform.OS === 'ios') {
    return 'ios';
  }
  return 'web';
}

function buildActionCopy(today: AttendanceTodayData | null, t: ReturnType<typeof useLocalization>['t']) {
  if (!today) {
    return {
      label: t('attendance.clock'),
      hint: t('attendance.loadingState'),
      disabled: true,
      reason: null as string | null,
    };
  }

  if (today.blocked) {
    return {
      label: t('attendance.actionBlocked'),
      hint: t('attendance.blockedHint'),
      disabled: true,
      reason: today.blockReasonMessage ?? t('attendance.unavailableReason'),
    };
  }

  if (today.nextAllowedAction === 'CHECK_IN') {
    return {
      label: t('attendance.clockIn'),
      hint: t('attendance.clockInHint'),
      disabled: false,
      reason: null,
    };
  }

  if (today.nextAllowedAction === 'CHECK_OUT') {
    return {
      label: t('attendance.clockOut'),
      hint: t('attendance.clockOutHint'),
      disabled: false,
      reason: null,
    };
  }

  return {
    label: t('attendance.noActionAvailable'),
    hint: t('attendance.completedHint'),
    disabled: true,
    reason: today.blockReasonMessage ?? null,
  };
}

async function getCurrentPositionWithTimeout(): Promise<Location.LocationObject> {
  return new Promise<Location.LocationObject>((resolve, reject) => {
    let settled = false;

    const timeoutId = setTimeout(() => {
      if (!settled) {
        settled = true;
        reject(new Error('LOCATION_TIMEOUT'));
      }
    }, LOCATION_TIMEOUT_MS);

    Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Highest,
      mayShowUserSettingsDialog: true,
    })
      .then((position) => {
        if (settled) {
          return;
        }
        settled = true;
        clearTimeout(timeoutId);
        resolve(position);
      })
      .catch((error) => {
        if (settled) {
          return;
        }
        settled = true;
        clearTimeout(timeoutId);
        reject(error);
      });
  });
}

function askLocationRetry(): Promise<boolean> {
  return new Promise<boolean>((resolve) => {
    Alert.alert(
      'Location Unavailable',
      "We couldn't get your location in time. Would you like to retry?",
      [
        { text: 'Cancel', style: 'cancel', onPress: () => resolve(false) },
        { text: 'Retry', onPress: () => resolve(true) },
      ]
    );
  });
}

export function useAttendanceScreen(): UseAttendanceScreenResult {
  const { t } = useLocalization();
  const [monthDate, setMonthDate] = useState(() => new Date());
  const [selectedDay, setSelectedDay] = useState<AttendanceMonthDay | null>(null);
  const [scannerVisible, setScannerVisible] = useState(false);
  const [scannerError, setScannerError] = useState<string | null>(null);
  const [banner, setBanner] = useState<BannerState | null>(null);
  const [workflowBusy, setWorkflowBusy] = useState(false);
  const qrResolverRef = useRef<((value: string | null) => void) | null>(null);
  const submittingRef = useRef(false);

  const tenantContext = useAppSelector(selectTenantContext);
  const companyId = tenantContext?.companyId ?? null;

  const year = monthDate.getFullYear();
  const month = monthDate.getMonth() + 1;

  const {
    data: today,
    isLoading: isLoadingToday,
    isFetching: isFetchingToday,
    error: todayError,
    refetch: refetchToday,
  } = useGetAttendanceTodayQuery();
  const {
    data: monthData,
    isLoading: isLoadingMonth,
    isFetching: isFetchingMonth,
    error: monthError,
    refetch: refetchMonth,
  } = useGetAttendanceMonthQuery({ year, month });
  const [submitClock] = useSubmitAttendanceClockMutation();
  const [validateQr] = useValidateAttendanceQrMutation();

  // Realtime: admin manual check-in/out or day adjustments refetch attendance state
  useCompanyTopic(companyId, 'attendance', (envelope) => {
    if (
      envelope.type === RealtimeEventType.ATTENDANCE_MANUAL_CHECK_IN ||
      envelope.type === RealtimeEventType.ATTENDANCE_MANUAL_CHECK_OUT ||
      envelope.type === RealtimeEventType.ATTENDANCE_EVENT_REVIEWED ||
      envelope.type === RealtimeEventType.ATTENDANCE_DAY_ADJUSTED
    ) {
      refetchToday();
      refetchMonth();
    }
  });

  useFocusEffect(
    useCallback(() => {
      refetchToday();
      refetchMonth();
    }, [refetchMonth, refetchToday])
  );

  useFocusEffect(
    useCallback(() => {
      const subscription = AppState.addEventListener('change', (state) => {
        if (state !== 'active' && qrResolverRef.current) {
          const resolver = qrResolverRef.current;
          qrResolverRef.current = null;
          setScannerVisible(false);
          setScannerError(null);
          resolver(null);
        }
      });

      return () => {
        subscription.remove();
      };
    }, [])
  );

  const requestQrToken = useCallback((error?: string) => {
    setScannerError(error ?? null);
    return new Promise<string | null>((resolve) => {
      qrResolverRef.current = resolve;
      setScannerVisible(true);
    });
  }, []);

  const onQrScanned = useCallback((token: string) => {
    const resolver = qrResolverRef.current;
    qrResolverRef.current = null;
    setScannerVisible(false);
    resolver?.(token);
  }, []);

  const onQrCancelled = useCallback(() => {
    const resolver = qrResolverRef.current;
    qrResolverRef.current = null;
    setScannerVisible(false);
    setScannerError(null);
    resolver?.(null);
  }, []);

  const askForLocationCapture = useCallback(async () => {
    const permission = await Location.requestForegroundPermissionsAsync();
    if (!permission.granted) {
      throw new Error('LOCATION_PERMISSION_DENIED');
    }

    return getCurrentPositionWithTimeout();
  }, []);

  const retryAll = useCallback(() => {
    refetchToday();
    refetchMonth();
  }, [refetchMonth, refetchToday]);

  const changeMonth = useCallback((offset: number) => {
    setMonthDate((current) => new Date(current.getFullYear(), current.getMonth() + offset, 1));
    setSelectedDay(null);
  }, []);

  const dismissBanner = useCallback(() => {
    setBanner(null);
  }, []);

  const onClockPress = useCallback(async () => {
    if (!today || submittingRef.current || workflowBusy) {
      return;
    }

    const actionCopy = buildActionCopy(today, t);
    if (actionCopy.disabled) {
      setBanner({
        type: 'error',
        text: actionCopy.reason ?? t('attendance.unavailableReason'),
      });
      return;
    }

    submittingRef.current = true;
    setWorkflowBusy(true);
    setBanner(null);

    try {
      let qrToken: string | undefined;
      if (today.qrRequired) {
        const scanned = await requestQrToken();
        if (!scanned) {
          throw new Error('SCAN_CANCELLED');
        }

        if (today.siteId) {
          try {
            const qrValidation = await validateQr({
              siteId: today.siteId,
              qrToken: scanned,
            }).unwrap();

            if (!qrValidation.valid) {
              throw new Error(
                qrValidation.message || 'Invalid QR code. Please scan the correct site QR.'
              );
            }
          } catch (err) {
            if (err instanceof Error && err.message !== 'SCAN_CANCELLED') {
              // Surface validation errors as banner; abort so user can retry cleanly
              setBanner({
                type: 'error',
                text: err.message || 'QR validation failed. Please try again.',
              });
              throw new Error('SCAN_CANCELLED');
            }
            throw err;
          }
        }

        qrToken = scanned;
      }

      let latitude: number | undefined;
      let longitude: number | undefined;
      let accuracyMeters: number | undefined;
      let clientCapturedAt: string | undefined;

      if (today.locationRequired) {
        let position: Location.LocationObject | null = null;
        for (;;) {
          try {
            position = await askForLocationCapture();
            break;
          } catch (error) {
            if (error instanceof Error && error.message === 'LOCATION_PERMISSION_DENIED') {
              throw error;
            }

            const shouldRetry = await askLocationRetry();
            if (!shouldRetry) {
              throw new Error('LOCATION_TIMEOUT');
            }
          }
        }

        latitude = position.coords.latitude;
        longitude = position.coords.longitude;
        accuracyMeters = position.coords.accuracy ?? undefined;
        clientCapturedAt = position.timestamp
          ? new Date(position.timestamp).toISOString()
          : new Date().toISOString();
      } else {
        clientCapturedAt = new Date().toISOString();
      }

      const response = await submitClock({
        clientRequestId: makeClientRequestId(),
        qrToken,
        latitude,
        longitude,
        accuracyMeters,
        clientCapturedAt,
        devicePublicId:
          Device.osInternalBuildId ??
          Device.osBuildId ??
          Device.modelId ??
          Device.deviceName ??
          undefined,
        platform: platformName(),
        appVersion: Constants.expoConfig?.version ?? undefined,
      }).unwrap();

      if (response.warnings?.length) {
        setBanner({
          type: 'warning',
          text: response.warnings[0]?.message ?? 'Attendance recorded with warnings.',
        });
      } else {
        setBanner({
          type: 'success',
          text: response.message ?? 'Attendance recorded successfully.',
        });
      }

      refetchToday();
      refetchMonth();
    } catch (error: unknown) {
      if (error instanceof Error && error.message === 'SCAN_CANCELLED') {
        return;
      }

      if (error instanceof Error && error.message === 'LOCATION_PERMISSION_DENIED') {
        setBanner({
          type: 'error',
          text: 'Location is required to record attendance for this site.',
        });
        return;
      }

      if (error instanceof Error && error.message === 'LOCATION_TIMEOUT') {
        setBanner({
          type: 'error',
          text: "We couldn't get your location in time. Please retry when GPS signal is stable.",
        });
        return;
      }

      setBanner({
        type: 'error',
        text: getFriendlyAttendanceError(error),
      });
    } finally {
      submittingRef.current = false;
      setWorkflowBusy(false);
    }
  }, [askForLocationCapture, refetchMonth, refetchToday, requestQrToken, submitClock, t, today, validateQr, workflowBusy]);

  const actionCopy = useMemo(() => buildActionCopy(today ?? null, t), [t, today]);

  const isInitialLoading = isLoadingToday || (isLoadingMonth && !monthData);
  const hasLoadError = Boolean(todayError) || Boolean(monthError);

  return {
    isInitialLoading,
    isRefreshingToday: isFetchingToday,
    isMonthLoading: isLoadingMonth || isFetchingMonth,
    today: today ?? null,
    monthDays: monthData?.days ?? [],
    monthDate,
    selectedDay,
    scannerVisible,
    scannerError,
    banner: hasLoadError && !today ? { type: 'error', text: "We couldn't load attendance. Please retry." } : banner,
    actionButtonLabel: actionCopy.label,
    actionButtonHint: actionCopy.hint,
    actionDisabled: actionCopy.disabled || workflowBusy || isLoadingToday,
    actionDisabledReason: actionCopy.reason,
    isActionBusy: workflowBusy,
    changeMonth,
    selectDay: setSelectedDay,
    clearSelectedDay: () => setSelectedDay(null),
    retryAll,
    onClockPress,
    onQrScanned,
    onQrCancelled,
    dismissBanner,
  };
}
