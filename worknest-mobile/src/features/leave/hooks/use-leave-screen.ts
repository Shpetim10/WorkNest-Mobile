import { useState, useCallback } from 'react';
import { Alert } from 'react-native';

import { useLocalization } from '@/common/localization';
import { mapBackendErrorCodeToMessage } from '@/features/auth/utils/auth-error-messages';
import { parseAuthError } from '@/features/auth/utils/parse-auth-error';
import {
  useGetLeaveBalanceQuery,
  useGetLeaveRequestsQuery,
  useSubmitLeaveRequestMutation,
  useCancelLeaveRequestMutation,
} from '../api/leave-api';
import type { LeaveType } from '../types';

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function isValidDate(date: unknown): date is Date {
  return date instanceof Date && !Number.isNaN(date.getTime());
}

function formatDateForApi(date: Date) {
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');

  return `${date.getFullYear()}-${month}-${day}`;
}

export function useLeaveScreen() {
  const { t } = useLocalization();
  const { data: balances = [], isLoading: balancesLoading, refetch: refetchBalances } = useGetLeaveBalanceQuery();
  const { data: history = [], isLoading: historyLoading, refetch: refetchHistory } = useGetLeaveRequestsQuery();
  const [submitLeaveRequest, { isLoading: isSubmitting }] = useSubmitLeaveRequestMutation();
  const [cancelLeaveRequest] = useCancelLeaveRequestMutation();

  const isLoading = balancesLoading || historyLoading;

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [leaveType, setLeaveType] = useState<LeaveType>('VACATION');
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [note, setNote] = useState('');
  const [medicalReportDocumentId, setMedicalReportDocumentId] = useState('');

  const requestedDays =
    Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  const availableDaysForType =
    balances.find((b) => b.leaveType === leaveType)?.availableDays ?? 0;

  const openModal = useCallback(() => setIsModalVisible(true), []);
  const closeModal = useCallback(() => {
    setIsModalVisible(false);
    setLeaveType('VACATION');
    setStartDate(new Date());
    setEndDate(new Date());
    setNote('');
    setMedicalReportDocumentId('');
  }, []);

  const submitRequest = useCallback(async () => {
    if (!isValidDate(startDate) || !isValidDate(endDate)) {
      Alert.alert(t('requests.validationTitle'), t('requests.datesRequiredError'));
      return;
    }

    const today = startOfDay(new Date());
    const normalizedStartDate = startOfDay(startDate);
    const normalizedEndDate = startOfDay(endDate);

    if (normalizedStartDate < today) {
      Alert.alert(t('requests.validationTitle'), t('requests.startDatePastError'));
      return;
    }

    if (normalizedEndDate < normalizedStartDate) {
      Alert.alert(t('requests.validationTitle'), t('requests.endDateBeforeStartError'));
      return;
    }

    try {
      await submitLeaveRequest({
        leaveType,
        startDate: formatDateForApi(normalizedStartDate),
        endDate: formatDateForApi(normalizedEndDate),
        note: note.trim() || null,
        medicalReportDocumentId: medicalReportDocumentId.trim() || null,
      }).unwrap();
      closeModal();
    } catch (err: unknown) {
      const parsed = parseAuthError(err);
      const message = parsed.code
        ? mapBackendErrorCodeToMessage(parsed.code, parsed.message)
        : parsed.message ?? t('requests.submitRequestError');
      Alert.alert(t('common.error'), message);
    }
  }, [leaveType, startDate, endDate, note, medicalReportDocumentId, submitLeaveRequest, closeModal, t]);

  const cancelRequest = useCallback(async (requestId: string) => {
    try {
      await cancelLeaveRequest(requestId).unwrap();
      await Promise.all([refetchBalances(), refetchHistory()]);
      Alert.alert(t('requests.cancelSuccessTitle'), t('requests.cancelSuccessMessage'));
    } catch (err: unknown) {
      const parsed = parseAuthError(err);
      const message =
        parsed.code === 'PAYROLL_PERIOD_LOCKED'
          ? t('requests.cancelPayrollLockedError')
          : parsed.code === 'LEAVE_ALREADY_STARTED'
            ? t('requests.cancelAlreadyStartedError')
          : parsed.code
            ? mapBackendErrorCodeToMessage(parsed.code, parsed.message)
            : parsed.message ?? t('requests.cancelRequestError');
      Alert.alert(t('common.error'), message);
    }
  }, [cancelLeaveRequest, refetchBalances, refetchHistory, t]);

  return {
    balances,
    history,
    isLoading,
    isModalVisible,
    openModal,
    closeModal,
    cancelRequest,
    refetch: async () => {
      await Promise.all([refetchBalances(), refetchHistory()]);
    },
    form: {
      leaveType,
      setLeaveType,
      startDate,
      setStartDate,
      endDate,
      setEndDate,
      note,
      setNote,
      medicalReportDocumentId,
      setMedicalReportDocumentId,
      isSubmitting,
      submitRequest,
      requestedDays,
      availableDaysForType,
    },
  };
}
