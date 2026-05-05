import { useState, useCallback } from 'react';
import { Alert } from 'react-native';

import {
  useGetLeaveBalanceQuery,
  useGetLeaveRequestsQuery,
  useSubmitLeaveRequestMutation,
} from '../api/leave-api';
import type { LeaveType } from '../types';

export function useLeaveScreen() {
  const { data: balances = [], isLoading: balancesLoading } = useGetLeaveBalanceQuery();
  const { data: history = [], isLoading: historyLoading } = useGetLeaveRequestsQuery();
  const [submitLeaveRequest, { isLoading: isSubmitting }] = useSubmitLeaveRequestMutation();

  const isLoading = balancesLoading || historyLoading;

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [leaveType, setLeaveType] = useState<LeaveType>('VACATION');
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [note, setNote] = useState('');

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
  }, []);

  const submitRequest = useCallback(async () => {
    try {
      await submitLeaveRequest({
        leaveType,
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
        note: note.trim() || null,
      }).unwrap();
      closeModal();
    } catch (err: any) {
      const message = err?.message ?? 'Failed to submit leave request. Please try again.';
      Alert.alert('Error', message);
    }
  }, [leaveType, startDate, endDate, note, submitLeaveRequest, closeModal]);

  return {
    balances,
    history,
    isLoading,
    isModalVisible,
    openModal,
    closeModal,
    form: {
      leaveType,
      setLeaveType,
      startDate,
      setStartDate,
      endDate,
      setEndDate,
      note,
      setNote,
      isSubmitting,
      submitRequest,
      requestedDays,
      availableDaysForType,
    },
  };
}