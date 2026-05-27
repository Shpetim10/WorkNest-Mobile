export type LeaveType = 'VACATION' | 'SICK' | 'PARENTAL';
export type LeaveStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';

export interface LeaveBalanceDto {
  leaveType: LeaveType;
  totalDays: number;
  usedDays: number;
  availableDays: number;
  maxCompanyPaidDays: number;
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
  daysCount: number;
  status: LeaveStatus;
  note: string | null;
  approvalNote: string | null;
  medicalReportDocumentId: string | null;
  rejectionReason: string | null;
  reviewedAt: string | null;
  createdAt: string;
}

export interface CreateLeaveRequestBody {
  leaveType: LeaveType;
  startDate: string;
  endDate: string;
  note?: string | null;
  medicalReportDocumentId?: string | null;
}