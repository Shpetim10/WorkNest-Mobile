import { useCallback, useMemo, useState } from 'react';
import { Alert, Platform } from 'react-native';
import { Directory, File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';

import { API_BASE_URL } from '@/common/config/network';
import { useLocalization } from '@/common/localization';
import { useAppDispatch, useAppSelector } from '@/common/store/hooks';
import { openPayslipModal, closePayslipModal } from '../store/payroll-slice';
import { selectIsPayslipModalVisible, selectSelectedPayrollPeriod } from '../store/selectors';
import { useGetPayrollDetailsQuery, useGetPayrollHistoryQuery } from '../api/payroll-api';
import {
  buildPayrollPeriodKey,
  buildRecentPayrollPeriods,
  formatPayrollMonthLabel,
} from '../utils/payroll-formatters';
import type { PayrollMonthSummary, PayrollPeriodKey, PayrollPeriodOption } from '../types/payroll.types';

function getErrorMessage(error: unknown, fallback: string): string {
  if (error && typeof error === 'object' && 'message' in error && typeof error.message === 'string') {
    return error.message;
  }

  return fallback;
}

function getPayslipUrl({ year, month }: PayrollPeriodKey): string {
  return `${API_BASE_URL}/api/v1/mobile/payroll/payslip?year=${year}&month=${month}`;
}

export function usePayrollScreen() {
  const dispatch = useAppDispatch();
  const { t } = useLocalization();
  const isModalVisible = useAppSelector(selectIsPayslipModalVisible);
  const selectedPeriod = useAppSelector(selectSelectedPayrollPeriod);
  const accessToken = useAppSelector((state) => state.auth.accessToken);
  const subscription = useAppSelector((state) => state.subscription.subscription);
  const isFoundationPlan = subscription?.plan === 'FOUNDATION';

  const [isDownloading, setIsDownloading] = useState(false);

  const { data: payrollHistory, isLoading: isHistoryLoading } = useGetPayrollHistoryQuery(
    undefined,
    { skip: isFoundationPlan }
  );

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;

  const periods = useMemo<PayrollPeriodOption[]>(() => {
    if (!payrollHistory || payrollHistory.length === 0) {
      return buildRecentPayrollPeriods(12);
    }

    const hasCurrentMonth = payrollHistory.some(
      (s) => s.year === currentYear && s.month === currentMonth
    );

    const fromHistory = payrollHistory.map((s: PayrollMonthSummary): PayrollPeriodOption => ({
      year: s.year,
      month: s.month,
      key: buildPayrollPeriodKey({ year: s.year, month: s.month }),
      label: formatPayrollMonthLabel(s.year, s.month),
      shortLabel: formatPayrollMonthLabel(s.year, s.month, true),
      isCurrentMonth: s.year === currentYear && s.month === currentMonth,
      status: s.status,
      netPay: s.netPay,
      grossEarnings: s.grossEarnings,
      currency: s.currency,
    }));

    if (!hasCurrentMonth) {
      fromHistory.unshift({
        year: currentYear,
        month: currentMonth,
        key: buildPayrollPeriodKey({ year: currentYear, month: currentMonth }),
        label: formatPayrollMonthLabel(currentYear, currentMonth),
        shortLabel: formatPayrollMonthLabel(currentYear, currentMonth, true),
        isCurrentMonth: true,
      });
    }

    return fromHistory;
  }, [payrollHistory, currentYear, currentMonth]);

  const {
    data: selectedPayroll,
    isLoading: isPayrollLoading,
    isFetching: isPayrollFetching,
    error: payrollError,
    refetch: refetchPayroll,
  } = useGetPayrollDetailsQuery(selectedPeriod as PayrollPeriodKey, {
    skip: !selectedPeriod || isFoundationPlan,
  });

  const openModal = useCallback(
    (period: PayrollPeriodKey) => dispatch(openPayslipModal(period)),
    [dispatch]
  );

  const closeModal = useCallback(() => dispatch(closePayslipModal()), [dispatch]);

  const downloadPayslip = useCallback(async () => {
    if (!selectedPeriod) {
      return;
    }

    if (!accessToken) {
      Alert.alert(t('payroll.sessionRequiredTitle'), t('payroll.sessionRequiredMessage'));
      return;
    }

    if (Platform.OS === 'web') {
      try {
        setIsDownloading(true);
        const response = await fetch(getPayslipUrl(selectedPeriod), {
          headers: { Authorization: `Bearer ${accessToken}` },
        });

        if (!response.ok) {
          throw new Error(t('payroll.downloadUnavailableMessage'));
        }

        const blob = await response.blob();
        const objectUrl = URL.createObjectURL(blob);
        const anchor = document.createElement('a');
        anchor.href = objectUrl;
        anchor.download = `payslip-${selectedPeriod.year}-${String(selectedPeriod.month).padStart(2, '0')}.pdf`;
        anchor.click();
        URL.revokeObjectURL(objectUrl);
      } catch (error) {
        Alert.alert(t('payroll.downloadFailedTitle'), getErrorMessage(error, t('payroll.downloadFailedMessage')));
      } finally {
        setIsDownloading(false);
      }
      return;
    }

    try {
      setIsDownloading(true);

      const payslipDirectory = new Directory(Paths.cache, 'payslips');
      payslipDirectory.create({ idempotent: true, intermediates: true });

      const fileName = `payslip-${selectedPeriod.year}-${String(selectedPeriod.month).padStart(2, '0')}.pdf`;
      const destination = new File(payslipDirectory, fileName);

      const downloaded = await File.downloadFileAsync(getPayslipUrl(selectedPeriod), destination, {
        headers: { Authorization: `Bearer ${accessToken}` },
        idempotent: true,
      });

      const canShare = await Sharing.isAvailableAsync();
      if (canShare) {
        await Sharing.shareAsync(downloaded.uri, {
          mimeType: 'application/pdf',
          UTI: 'com.adobe.pdf',
          dialogTitle: t('payroll.openPdfTitle'),
        });
      } else {
        Alert.alert(t('payroll.savedTitle'), t('payroll.savedMessage'));
      }
    } catch (error) {
      Alert.alert(
        t('payroll.downloadFailedTitle'),
        getErrorMessage(error, t('payroll.downloadFailedPeriodMessage'))
      );
    } finally {
      setIsDownloading(false);
    }
  }, [accessToken, selectedPeriod, t]);

  return {
    periods,
    isHistoryLoading,
    isFoundationPlan,
    isModalVisible,
    selectedPeriod,
    selectedPayroll,
    isPayrollLoading,
    isPayrollFetching,
    payrollError,
    isDownloading,
    openModal,
    closeModal,
    refetchPayroll,
    downloadPayslip,
  };
}
