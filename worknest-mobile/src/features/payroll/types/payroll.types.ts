export interface PayslipEarnings {
  basicSalary: number;
  allowances: number;
  bonus: number;
}

export interface PayslipDeductions {
  tax: number;
  insurance: number;
  other: number;
}

export interface Payslip {
  id: string;
  periodName: string;
  periodDate: string;
  earnings: PayslipEarnings;
  deductions: PayslipDeductions;
  grossSalary: number;
  totalDeductions: number;
  netSalary: number;
}
