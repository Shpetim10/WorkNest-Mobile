export type LeaveStatus = 'pending' | 'approved' | 'rejected' | 'cancelled';

export type LeaveType = 'vacation' | 'sick' | 'personal' | 'unpaid';

export interface LeaveBalance {
  type: LeaveType;
  label: string;
  total: number;
  used: number;
  available: number;
}

export interface LeaveRequest {
  id: string;
  type: LeaveType;
  startDate: string;
  endDate: string;
  status: LeaveStatus;
  note?: string;
  createdAt: string;
}
