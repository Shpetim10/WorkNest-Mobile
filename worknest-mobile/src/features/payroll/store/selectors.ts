import type { RootState } from '@/common/store';

export const selectIsPayslipModalVisible = (state: RootState) => state.payroll.isModalVisible;
export const selectSelectedPayslipId = (state: RootState) => state.payroll.selectedPayslipId;
