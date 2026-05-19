export interface LeaveBalanceSummary {
  leaveType: 'VACATION' | 'SICK' | 'PERSONAL' | 'UNPAID' | 'MATERNITY' | 'PATERNITY' | 'OTHER';
  remainingDays: number;
}

export interface MobileDashboardResponse {
  checkInTime: string | null;
  leaveBalances: LeaveBalanceSummary[];
  latestPayrollMonth: string | null;
  latestPayrollNetPay: number | null;
  announcementUnreadCount: number;
  latestAnnouncementTitle: string | null;
}

export interface MobileProfileResponse {
  firstName: string;
  lastName: string;
  profilePictureUrl: string | null;
  jobTitle?: string | null;
  department?: string | null;
  location?: string | null;
  role?: string | null;
  email?: string | null;
}
