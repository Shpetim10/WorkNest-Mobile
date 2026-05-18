import type { Payslip } from '../types/payroll.types';

export const mockPayslips: Payslip[] = [
  {
    id: '1',
    periodName: 'March 2026',
    periodDate: 'Mar 31, 2026',
    earnings: {
      basicSalary: 5000,
      allowances: 1000,
      bonus: 500,
    },
    deductions: {
      tax: 800,
      insurance: 360,
      other: 100,
    },
    grossSalary: 6500,
    totalDeductions: 1260,
    netSalary: 5240,
  },
  {
    id: '2',
    periodName: 'February 2026',
    periodDate: 'Feb 28, 2026',
    earnings: {
      basicSalary: 5000,
      allowances: 800,
      bonus: 0,
    },
    deductions: {
      tax: 780,
      insurance: 360,
      other: 60,
    },
    grossSalary: 5800,
    totalDeductions: 1200,
    netSalary: 4600,
  },
  {
    id: '3',
    periodName: 'January 2026',
    periodDate: 'Jan 31, 2026',
    earnings: {
      basicSalary: 5000,
      allowances: 800,
      bonus: 200,
    },
    deductions: {
      tax: 780,
      insurance: 360,
      other: 60,
    },
    grossSalary: 6000,
    totalDeductions: 1200,
    netSalary: 4800,
  },
];
