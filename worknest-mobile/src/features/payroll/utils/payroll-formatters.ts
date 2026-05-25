import type {
  PayrollPeriodKey,
  PayrollPeriodOption,
  PayrollStatus,
  PaymentMethod,
  PayrollTreatment,
} from '../types/payroll.types';

function tryFormatAmount(value: string | number, currency: string): string {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    return `${currency} ${value}`;
  }

  try {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(parsed);
  } catch {
    return `${currency} ${parsed.toFixed(2)}`;
  }
}

export function formatPayrollAmount(value: string | null | undefined, currency: string): string {
  if (value == null || value === '') {
    return 'Not available';
  }

  return tryFormatAmount(value, currency);
}

export function formatPayrollCurrencyAmount(
  value: number | string | null | undefined,
  currency: string | null | undefined
): string | null {
  const normalizedCurrency = currency?.trim();

  if (value == null || value === '' || !normalizedCurrency) {
    return null;
  }

  return tryFormatAmount(value, normalizedCurrency);
}

export function formatPayrollDate(value: string | null | undefined): string {
  if (!value) {
    return 'Not available';
  }

  try {
    return new Intl.DateTimeFormat(undefined, {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(new Date(value));
  } catch {
    return value;
  }
}

export function formatPayrollMonthLabel(year: number, month: number, short = false): string {
  try {
    return new Intl.DateTimeFormat(undefined, {
      month: short ? 'short' : 'long',
      year: 'numeric',
    }).format(new Date(year, month - 1, 1));
  } catch {
    return `${year}-${String(month).padStart(2, '0')}`;
  }
}

export function formatPayrollStatus(status: PayrollStatus): string {
  return status.charAt(0) + status.slice(1).toLowerCase();
}

export function formatPaymentMethod(method: PaymentMethod): string {
  return method === 'FIXED_MONTHLY' ? 'Fixed monthly' : 'Hourly';
}

export function formatPayrollTreatment(treatment: PayrollTreatment): string {
  return treatment
    .split('_')
    .map((part) => part.charAt(0) + part.slice(1).toLowerCase())
    .join(' ');
}

export function buildPayrollPeriodKey({ year, month }: PayrollPeriodKey): string {
  return `${year}-${String(month).padStart(2, '0')}`;
}

export function buildRecentPayrollPeriods(
  count: number,
  now = new Date()
): PayrollPeriodOption[] {
  return Array.from({ length: count }, (_, index) => {
    const date = new Date(now.getFullYear(), now.getMonth() - index, 1);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    return {
      year,
      month,
      key: buildPayrollPeriodKey({ year, month }),
      label: formatPayrollMonthLabel(year, month),
      shortLabel: formatPayrollMonthLabel(year, month, true),
      isCurrentMonth: index === 0,
    };
  });
}
