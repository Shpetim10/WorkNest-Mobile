import { useCallback, useState } from 'react';
import { Alert, Platform } from 'react-native';
import { Directory, File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';

import { API_BASE_URL } from '@/common/config/network';
import { useAppDispatch, useAppSelector } from '@/common/store/hooks';
import { openPayslipModal, closePayslipModal } from '../store/payroll-slice';
import { selectIsPayslipModalVisible, selectSelectedPayrollPeriod } from '../store/selectors';
import { useGetPayrollDetailsQuery } from '../api/payroll-api';
import { buildRecentPayrollPeriods } from '../utils/payroll-formatters';
import type { PayrollPeriodKey } from '../types/payroll.types';

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
  const isModalVisible = useAppSelector(selectIsPayslipModalVisible);
  const selectedPeriod = useAppSelector(selectSelectedPayrollPeriod);
  const accessToken = useAppSelector((state) => state.auth.accessToken);
  const subscription = useAppSelector((state) => state.subscription.subscription);
  const isFoundationPlan = subscription?.plan === 'FOUNDATION';

  const periods = buildRecentPayrollPeriods(12);
  const [isDownloading, setIsDownloading] = useState(false);

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
      Alert.alert('Session required', 'Please sign in again before downloading your payslip.');
      return;
    }

    if (Platform.OS === 'web') {
      try {
        setIsDownloading(true);
        const response = await fetch(getPayslipUrl(selectedPeriod), {
          headers: { Authorization: `Bearer ${accessToken}` },
        });

        if (!response.ok) {
          throw new Error('The payslip could not be downloaded right now.');
        }

        const blob = await response.blob();
        const objectUrl = URL.createObjectURL(blob);
        const anchor = document.createElement('a');
        anchor.href = objectUrl;
        anchor.download = `payslip-${selectedPeriod.year}-${String(selectedPeriod.month).padStart(2, '0')}.pdf`;
        anchor.click();
        URL.revokeObjectURL(objectUrl);
      } catch (error) {
        Alert.alert('Download failed', getErrorMessage(error, 'Unable to download payslip.'));
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
          dialogTitle: 'Open Payslip PDF',
        });
      } else {
        Alert.alert('Saved', 'Payslip saved to device cache.');
      }
    } catch (error) {
      Alert.alert(
        'Download failed',
        getErrorMessage(error, 'Unable to download the payslip for this period.')
      );
    } finally {
      setIsDownloading(false);
    }
  }, [accessToken, selectedPeriod]);

  return {
    periods,
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
