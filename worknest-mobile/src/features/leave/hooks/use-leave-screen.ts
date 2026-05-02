import { useState, useCallback, useEffect } from 'react';
import { MOCK_LEAVE_BALANCES, MOCK_LEAVE_HISTORY } from '../api/mock';
import { LeaveBalance, LeaveRequest, LeaveType } from '../types';

export function useLeaveScreen() {
  const [balances, setBalances] = useState<LeaveBalance[]>([]);
  const [history, setHistory] = useState<LeaveRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);

  // Form state
  const [leaveType, setLeaveType] = useState<LeaveType>('vacation');
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // TODO: [Backend Integration] Replace with real API calls to fetch balances and history
    // const { data: balancesData } = useGetLeaveBalancesQuery();
    // const { data: historyData } = useGetLeaveHistoryQuery();
    
    // Simulate API call
    const timer = setTimeout(() => {
      setBalances(MOCK_LEAVE_BALANCES);
      setHistory(MOCK_LEAVE_HISTORY);
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const openModal = useCallback(() => setIsModalVisible(true), []);
  const closeModal = useCallback(() => {
    setIsModalVisible(false);
    // Reset form
    setLeaveType('vacation');
    setStartDate(new Date());
    setEndDate(new Date());
    setNote('');
  }, []);

  const submitRequest = useCallback(async () => {
    setIsSubmitting(true);
    
    // TODO: [Backend Integration] Replace with real mutation call
    // await requestLeaveMutation({ type: leaveType, startDate, endDate, note }).unwrap();
    
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    
    const newRequest: LeaveRequest = {
      id: Math.random().toString(36).substr(2, 9),
      type: leaveType,
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
      status: 'pending',
      note: note.trim() || undefined,
      createdAt: new Date().toISOString(),
    };

    setHistory((prev) => [newRequest, ...prev]);
    setIsSubmitting(false);
    closeModal();
  }, [leaveType, startDate, endDate, note, closeModal]);

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
    },
  };
}
