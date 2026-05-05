export type LeaveType = 'VACATION' | 'SICK' | 'PERSONAL';
export type LeaveStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface LeaveBalanceDto {
  leaveType: LeaveType;
  totalDays: number;
  usedDays: number;
  availableDays: number;
}

export interface LeaveRequestDto {
  id: string;
  employeeId: string;
  employeeName: string;
  siteName: string | null;
  departmentName: string | null;
  leaveType: LeaveType;
  startDate: string;
  endDate: string;
  totalDays: number;
  status: LeaveStatus;
  note: string | null;
  rejectionReason: string | null;
  reviewedAt: string | null;
  createdAt: string;
}

export interface CreateLeaveRequestBody {
  leaveType: LeaveType;
  startDate: string;
  endDate: string;
  note?: string | null;
}