import { useCallback } from 'react';

import { useAppDispatch, useAppSelector } from '@/common/store/hooks';
import { openPayslipModal, closePayslipModal } from '../store/payroll-slice';
import { selectIsPayslipModalVisible, selectSelectedPayslipId } from '../store/selectors';
import { mockPayslips } from '../data/mockPayslips';

export function usePayrollScreen() {
  const dispatch = useAppDispatch();
  const isModalVisible = useAppSelector(selectIsPayslipModalVisible);
  const selectedPayslipId = useAppSelector(selectSelectedPayslipId);

  const selectedPayslip = selectedPayslipId
    ? mockPayslips.find((p) => p.id === selectedPayslipId) ?? null
    : null;

  const openModal = useCallback(
    (id: string) => dispatch(openPayslipModal(id)),
    [dispatch]
  );

  const closeModal = useCallback(
    () => dispatch(closePayslipModal()),
    [dispatch]
  );

  return {
    payslips: mockPayslips,
    isModalVisible,
    selectedPayslip,
    openModal,
    closeModal,
  };
}
