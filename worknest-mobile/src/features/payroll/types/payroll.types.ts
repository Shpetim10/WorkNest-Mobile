export interface PayrollPeriodKey {
  year: number;
  month: number;
}

export interface PayrollPeriodOption extends PayrollPeriodKey {
  key: string;
  label: string;
  shortLabel: string;
  isCurrentMonth: boolean;
  status?: PayrollStatus;
  netPay?: number;
  grossEarnings?: number;
  currency?: string;
}

export interface PayrollMonthSummary {
  year: number;
  month: number;
  status: PayrollStatus;
  grossEarnings: number;
  netPay: number;
  currency: string;
}

export type PaymentMethod = 'FIXED_MONTHLY' | 'HOURLY';

export type CalculationStatus = 'SUCCESS' | 'FAILED' | 'SKIPPED';

export type PayrollStatus = 'DRAFT' | 'CALCULATED' | 'APPROVED' | 'FINALIZED' | 'PAID';

export type PayrollTreatment =
  | 'PAID_FROM_BALANCE'
  | 'UNPAID_EXCESS'
  | 'UNPAID_EXPLICIT'
  | 'SICK_COMPANY_POLICY'
  | 'STATUTORY_MATERNITY'
  | 'STATUTORY_PATERNITY';

export interface EmploymentPeriodDetails {
  employmentStartDate: string | null;
  employmentEndDate: string | null;
  payableFrom: string | null;
  payableTo: string | null;
}

export interface WorkPeriodDetails {
  calendarDaysInMonth: number;
  workingDaysInMonth: number;
  payableWorkingDays: string;
  defaultDailyWorkingHours: string;
  payableHours: string;
  workHoursSource: string;
  effectiveAttendanceTo: string | null;
  effectivePayableWorkingDays: string;
}

export interface BasePayDetails {
  formula: string;
  monthlySalary: string | null;
  hourlyRate: string | null;
  payableWorkingDays: string;
  workingDaysInMonth: number;
  payableHours: string;
  basePay: string;
  prorationMethod: string | null;
}

export interface HourlyAttendancePaymentDetails {
  fullPayableHours: string;
  attendedHours: string;
  fullPayment: string;
  attendanceDeduction: string;
  paymentReceived: string;
  workHoursSource: string;
}

export interface PayrollLeaveRecordDetails {
  id: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  daysCountedInPayroll: string;
  payrollTreatment: PayrollTreatment;
}

export interface LeaveCalculationDetails {
  annualPaidLeaveAllowanceDays: number;
  usedPaidLeaveBeforeThisMonth: string;
  leaveTakenThisMonth: string;
  paidLeaveDaysThisMonth: string;
  paidLeaveAmount: string;
  unpaidLeaveDaysThisMonth: string;
  unpaidLeaveDeduction: string;
  leaveRecordsIncluded: PayrollLeaveRecordDetails[];
}

export interface SickLeaveCalculationDetails {
  daysTakenThisMonth: string;
  companyPaidDays: string;
  unpaidSickLeaveDays: string;
  companyPaidPercentage: string;
  companyPaidAmount: string;
  paidSickLeaveDeductionEquivalent: string;
  totalSickLeaveDeduction: string;
  paidSickLeaveHours: string;
  unpaidSickLeaveHours: string;
  unpaidSickLeaveUnpaidAmount: string;
  insuranceCoveredDays: string;
  insuranceCoveredAmount: string;
  status: string;
}

export interface PayrollAdjustmentLine {
  id: string;
  amount: string;
  reason: string;
  notes: string | null;
}

export interface AdjustmentDetails {
  bonuses: PayrollAdjustmentLine[];
  deductions: PayrollAdjustmentLine[];
  totalBonus: string;
  totalManualDeduction: string;
}

export interface TaxBracketCalculationLine {
  lowerBound: string;
  upperBound: string | null;
  rate: string;
  taxableSlice: string;
  taxAmount: string;
}

export interface StatutoryDeductionDetails {
  socialSecurityBase: string;
  pensionBase: string;
  taxableIncome: string;
  employeeSocialSecurity: string;
  employeePensionContribution: string;
  incomeTax: string;
  statutoryDeductionsTotal: string;
  employerSocialSecurity: string;
  employerPensionContribution: string;
  employerCostTotal: string;
  bracketBreakdown: TaxBracketCalculationLine[];
  usedSystemDefaults: boolean;
}

export interface AbsenceDetails {
  expectedWorkingMinutes: string;
  attendedMinutes: string;
  absentMinutes: string;
  monetaryEquivalent: string;
  applied: boolean;
}

export interface OvertimeDetails {
  expectedHours: number;
  workedHours: number;
  overtimeHours: number;
  overtimeHourlyRate: number;
  overtimePay: number;
}

export interface PayrollTotals {
  basePay: string;
  overtimePay: string | null;
  grossEarnings: string;
  statutoryDeductions: string;
  totalDeductions: string;
  netPay: string;
  netPayNegative: boolean;
  employerCostTotal: string;
}

export interface PayrollCalculationResponse {
  employeeId: string;
  employeeName: string;
  year: number;
  month: number;
  currency: string;
  paymentMethod: PaymentMethod;
  calculationStatus: CalculationStatus;
  payrollStatus: PayrollStatus;
  preview: boolean;
  employmentPeriod: EmploymentPeriodDetails;
  workPeriod: WorkPeriodDetails;
  basePayCalculation: BasePayDetails;
  hourlyAttendancePayment: HourlyAttendancePaymentDetails | null;
  leaveCalculation: LeaveCalculationDetails;
  sickLeaveCalculation: SickLeaveCalculationDetails;
  adjustments: AdjustmentDetails;
  statutoryDeductions: StatutoryDeductionDetails;
  absenceDetails: AbsenceDetails | null;
  overtimeDetails: OvertimeDetails | null;
  totals: PayrollTotals;
  warnings: string[];
}
