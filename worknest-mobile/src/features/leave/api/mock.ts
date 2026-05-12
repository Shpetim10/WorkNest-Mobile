// Mock data kept for reference only — feature now uses real API via leave-api.ts
import type { LeaveBalanceDto, LeaveRequestDto } from '../types';

export const MOCK_LEAVE_BALANCES: LeaveBalanceDto[] = [
  { leaveType: 'VACATION', totalDays: 20, usedDays: 5, availableDays: 15 },
  { leaveType: 'SICK', totalDays: 10, usedDays: 2, availableDays: 8 },
  { leaveType: 'PERSONAL', totalDays: 5, usedDays: 1, availableDays: 4 },
];

export const MOCK_LEAVE_HISTORY: LeaveRequestDto[] = [
  {
    id: '1',
    employeeId: 'emp-1',
    employeeName: 'Jane Doe',
    siteName: null,
    departmentName: null,
    leaveType: 'VACATION',
    startDate: '2026-05-10',
    endDate: '2026-05-15',
    daysCount: 6,
    status: 'PENDING',
    note: 'Family trip to the mountains.',
    approvalNote: null,
    medicalReportDocumentId: null,
    rejectionReason: null,
    reviewedAt: null,
    createdAt: '2026-04-28T10:00:00Z',
  },
];