import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface PayrollUIState {
  selectedPayslipId: string | null;
  isModalVisible: boolean;
}

const initialState: PayrollUIState = {
  selectedPayslipId: null,
  isModalVisible: false,
};

const payrollSlice = createSlice({
  name: 'payroll',
  initialState,
  reducers: {
    openPayslipModal(state, action: PayloadAction<string>) {
      state.selectedPayslipId = action.payload;
      state.isModalVisible = true;
    },
    closePayslipModal(state) {
      state.isModalVisible = false;
      state.selectedPayslipId = null;
    },
  },
});

export const { openPayslipModal, closePayslipModal } = payrollSlice.actions;
export const payrollReducer = payrollSlice.reducer;
