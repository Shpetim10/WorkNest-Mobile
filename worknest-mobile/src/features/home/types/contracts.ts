export interface LeaveBalanceSummary {
  leaveType: 'VACATION' | 'SICK' | 'PARENTAL';
  remainingDays: number;
}

export interface MobileDashboardResponse {
  checkInTime: string | null;
  leaveBalances: LeaveBalanceSummary[];
  latestPayrollMonth: string | null;
  latestPayrollNetPay: number | null;
  latestPayrollCurrency: string | null;
  announcementUnreadCount: number;
  latestAnnouncementTitle: string | null;
}

export interface MobileProfileResponse {
  firstName: string;
  lastName: string;
  profilePictureUrl: string | null;
  jobTitle?: string | null;
  department?: string | null;
  departmentName?: string | null;
  siteName?: string | null;
  contractType?: string | null;
  contractStatus?: string | null;
  contractStartDate?: string | null;
  contractEndDate?: string | null;
  location?: string | null;
  role?: string | null;
  email?: string | null;
}
