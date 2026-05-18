import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface PayrollSelectionPayload {
  year: number;
  month: number;
}

interface PayrollUIState {
  selectedPeriod: PayrollSelectionPayload | null;
  isModalVisible: boolean;
}

const initialState: PayrollUIState = {
  selectedPeriod: null,
  isModalVisible: false,
};

const payrollSlice = createSlice({
  name: 'payroll',
  initialState,
  reducers: {
    openPayslipModal(state, action: PayloadAction<PayrollSelectionPayload>) {
      state.selectedPeriod = action.payload;
      state.isModalVisible = true;
    },
    closePayslipModal(state) {
      state.isModalVisible = false;
      state.selectedPeriod = null;
    },
  },
});

export const { openPayslipModal, closePayslipModal } = payrollSlice.actions;
export const payrollReducer = payrollSlice.reducer;
