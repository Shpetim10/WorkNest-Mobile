import type { RootState } from '@/common/store';

export const selectIsPayslipModalVisible = (state: RootState) => state.payroll.isModalVisible;
export const selectSelectedPayrollPeriod = (state: RootState) => state.payroll.selectedPeriod;
