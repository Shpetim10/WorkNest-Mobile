import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  Modal,
  PanResponder,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { AlertTriangle, ChevronDown, ChevronUp, Download, Lock, RefreshCcw, X } from 'lucide-react-native';

import { ThemedText } from '@/common/components/themed-text';
import { Fonts } from '@/common/constants/theme';
import type { PayrollCalculationResponse, PayrollPeriodKey, PayrollStatus } from '../types/payroll.types';
import {
  formatPaymentMethod,
  formatPayrollAmount,
  formatPayrollDate,
  formatPayrollMonthLabel,
  formatPayrollStatus,
  formatPayrollTreatment,
} from '../utils/payroll-formatters';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const LOCKED_STATUSES = new Set(['APPROVED', 'FINALIZED', 'PAID']);

interface PayrollDetailsModalProps {
  visible: boolean;
  period: PayrollPeriodKey | null;
  payroll: PayrollCalculationResponse | null | undefined;
  isLoading: boolean;
  isRefreshing: boolean;
  isDownloading: boolean;
  errorMessage: string | null;
  onClose: () => void;
  onRetry: () => void;
  onDownload: () => void;
}

interface DetailRowProps {
  label: string;
  value: string;
  emphasized?: boolean;
  negative?: boolean;
  positive?: boolean;
}

function DetailRow({ label, value, emphasized = false, negative = false, positive = false }: DetailRowProps) {
  return (
    <View style={styles.detailRow}>
      <ThemedText style={styles.detailLabel}>{label}</ThemedText>
      <ThemedText
        style={[
          styles.detailValue,
          emphasized && styles.detailValueStrong,
          negative && styles.detailValueNegative,
          positive && styles.detailValuePositive,
        ]}
      >
        {value}
      </ThemedText>
    </View>
  );
}

interface SectionCardProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  badge?: string;
  badgeColor?: string;
}

function SectionCard({ title, children, defaultOpen = false, badge, badgeColor }: SectionCardProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <View style={styles.sectionCard}>
      <TouchableOpacity
        style={styles.sectionHeader}
        onPress={() => setOpen((v) => !v)}
        activeOpacity={0.7}
      >
        <View style={styles.sectionHeaderLeft}>
          <ThemedText style={styles.sectionTitle}>{title}</ThemedText>
          {badge ? (
            <View style={[styles.sectionBadge, badgeColor ? { backgroundColor: badgeColor } : null]}>
              <ThemedText style={styles.sectionBadgeText}>{badge}</ThemedText>
            </View>
          ) : null}
        </View>
        {open ? (
          <ChevronUp size={16} color="#94A3B8" strokeWidth={2} />
        ) : (
          <ChevronDown size={16} color="#94A3B8" strokeWidth={2} />
        )}
      </TouchableOpacity>
      {open ? <View style={styles.sectionBody}>{children}</View> : null}
    </View>
  );
}

function statusColors(status: PayrollStatus): { bg: string; text: string } {
  switch (status) {
    case 'PAID': return { bg: '#DCFCE7', text: '#166534' };
    case 'FINALIZED': return { bg: '#D1FAE5', text: '#065F46' };
    case 'APPROVED': return { bg: '#DBEAFE', text: '#1E40AF' };
    case 'CALCULATED': return { bg: '#EDE9FE', text: '#5B21B6' };
    default: return { bg: 'rgba(255,255,255,0.14)', text: '#E2E8F0' };
  }
}

export function PayrollDetailsModal({
  visible,
  period,
  payroll,
  isLoading,
  isRefreshing,
  isDownloading,
  errorMessage,
  onClose,
  onRetry,
  onDownload,
}: PayrollDetailsModalProps) {
  const [shouldRender, setShouldRender] = useState(visible);
  const translateY = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      setShouldRender(true);
      Animated.parallel([
        Animated.timing(backdropOpacity, { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.spring(translateY, { toValue: 0, tension: 50, friction: 8, useNativeDriver: true }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(backdropOpacity, { toValue: 0, duration: 250, useNativeDriver: true }),
        Animated.timing(translateY, { toValue: SCREEN_HEIGHT, duration: 250, useNativeDriver: true }),
      ]).start(() => setShouldRender(false));
    }
  }, [backdropOpacity, translateY, visible]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, g) => g.dy > 5,
      onPanResponderMove: (_, g) => { if (g.dy > 0) translateY.setValue(g.dy); },
      onPanResponderRelease: (_, g) => {
        if (g.dy > 100 || g.vy > 0.5) {
          onClose();
        } else {
          Animated.spring(translateY, { toValue: 0, useNativeDriver: true }).start();
        }
      },
    })
  ).current;

  if (!shouldRender && !visible) return null;

  const periodLabel = period ? formatPayrollMonthLabel(period.year, period.month) : 'Payroll details';
  const currency = payroll?.currency ?? '';
  const isLocked = payroll ? LOCKED_STATUSES.has(payroll.payrollStatus) : false;
  const isDraftOrFailed = payroll
    ? payroll.payrollStatus === 'DRAFT' || payroll.calculationStatus === 'FAILED'
    : false;

  return (
    <Modal animationType="none" transparent visible={shouldRender} onRequestClose={onClose}>
      <View style={styles.modalContainer}>
        <Animated.View style={[styles.backdrop, { opacity: backdropOpacity }]}>
          <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        </Animated.View>

        <Animated.View style={[styles.sheet, { transform: [{ translateY }] }]}>
          <View {...panResponder.panHandlers} style={styles.dragHandleContainer}>
            <View style={styles.dragHandle} />
          </View>

          <View style={styles.header}>
            <View>
              <ThemedText style={styles.headerTitle}>Payroll details</ThemedText>
              <ThemedText style={styles.headerSubtitle}>{periodLabel}</ThemedText>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton} activeOpacity={0.7}>
              <X size={22} color="#6A7282" />
            </TouchableOpacity>
          </View>

          {isLoading ? (
            <View style={styles.centerState}>
              <ActivityIndicator size="large" color="#2B7FFF" />
              <ThemedText style={styles.centerStateText}>Loading payroll details...</ThemedText>
            </View>
          ) : errorMessage ? (
            <View style={styles.centerState}>
              <AlertTriangle size={28} color="#DC2626" />
              <ThemedText style={styles.centerStateText}>
                {errorMessage ?? 'Unable to load payroll details for this period.'}
              </ThemedText>
              <TouchableOpacity style={styles.retryButton} onPress={onRetry} activeOpacity={0.8}>
                <RefreshCcw size={16} color="#FFFFFF" />
                <ThemedText style={styles.retryButtonText}>Try again</ThemedText>
              </TouchableOpacity>
            </View>
          ) : payroll ? (
            <>
              <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
                bounces={false}
              >
                {/* Hero summary card */}
                <View style={styles.heroCard}>
                  <View style={styles.heroTopRow}>
                    <View style={[
                      styles.heroBadge,
                      { backgroundColor: statusColors(payroll.payrollStatus).bg }
                    ]}>
                      <ThemedText style={[
                        styles.heroBadgeText,
                        { color: statusColors(payroll.payrollStatus).text }
                      ]}>
                        {formatPayrollStatus(payroll.payrollStatus)}
                      </ThemedText>
                    </View>
                    <View style={styles.heroTopRight}>
                      {payroll.preview ? (
                        <View style={styles.previewChip}>
                          <ThemedText style={styles.previewChipText}>Preview</ThemedText>
                        </View>
                      ) : null}
                      {isLocked ? (
                        <View style={styles.lockedChip}>
                          <Lock size={12} color="#166534" />
                          <ThemedText style={styles.lockedChipText}>Locked</ThemedText>
                        </View>
                      ) : null}
                    </View>
                  </View>

                  <ThemedText style={styles.heroName}>{payroll.employeeName}</ThemedText>
                  <ThemedText style={styles.heroPeriod}>
                    {formatPayrollMonthLabel(payroll.year, payroll.month)}
                  </ThemedText>
                  <ThemedText
                    style={[styles.heroAmount, payroll.totals.netPayNegative && styles.heroAmountNegative]}
                  >
                    {formatPayrollAmount(payroll.totals.netPay, payroll.currency)}
                  </ThemedText>
                  <ThemedText style={styles.heroCaption}>Net pay</ThemedText>

                  <View style={styles.heroMetaGrid}>
                    <View style={styles.heroMetaItem}>
                      <ThemedText style={styles.heroMetaLabel}>Method</ThemedText>
                      <ThemedText style={styles.heroMetaValue}>
                        {formatPaymentMethod(payroll.paymentMethod)}
                      </ThemedText>
                    </View>
                    <View style={styles.heroMetaItem}>
                      <ThemedText style={styles.heroMetaLabel}>Calculation</ThemedText>
                      <ThemedText style={[
                        styles.heroMetaValue,
                        payroll.calculationStatus === 'FAILED' && { color: '#FCA5A5' },
                        payroll.calculationStatus === 'SUCCESS' && { color: '#6EE7B7' },
                      ]}>
                        {payroll.calculationStatus}
                      </ThemedText>
                    </View>
                    <View style={styles.heroMetaItem}>
                      <ThemedText style={styles.heroMetaLabel}>Currency</ThemedText>
                      <ThemedText style={styles.heroMetaValue}>{payroll.currency}</ThemedText>
                    </View>
                  </View>
                </View>

                {payroll.preview ? (
                  <View style={styles.infoBanner}>
                    <AlertTriangle size={15} color="#92400E" />
                    <ThemedText style={styles.infoBannerText}>
                      Live preview — figures may change until payroll is locked.
                    </ThemedText>
                  </View>
                ) : null}

                {payroll.warnings.length > 0 ? (
                  <View style={styles.warningCard}>
                    <ThemedText style={styles.warningTitle}>⚠ Warnings</ThemedText>
                    {payroll.warnings.map((w) => (
                      <ThemedText key={w} style={styles.warningText}>• {w}</ThemedText>
                    ))}
                  </View>
                ) : null}

                {/* Totals — always open */}
                <SectionCard title="Totals" defaultOpen>
                  <DetailRow
                    label="Base pay"
                    value={formatPayrollAmount(payroll.totals.basePay, currency)}
                    positive
                  />
                  <DetailRow
                    label="Gross earnings"
                    value={formatPayrollAmount(payroll.totals.grossEarnings, currency)}
                    positive
                  />
                  <DetailRow
                    label="Statutory deductions"
                    value={formatPayrollAmount(payroll.totals.statutoryDeductions, currency)}
                    negative
                  />
                  <DetailRow
                    label="Total deductions"
                    value={formatPayrollAmount(payroll.totals.totalDeductions, currency)}
                    negative
                  />
                  <View style={styles.divider} />
                  <DetailRow
                    label="Net pay"
                    value={formatPayrollAmount(payroll.totals.netPay, currency)}
                    emphasized
                    negative={payroll.totals.netPayNegative}
                    positive={!payroll.totals.netPayNegative}
                  />
                  <DetailRow
                    label="Employer cost"
                    value={formatPayrollAmount(payroll.totals.employerCostTotal, currency)}
                  />
                  {payroll.totals.netPayNegative ? (
                    <View style={styles.negativeBanner}>
                      <ThemedText style={styles.negativeBannerText}>
                        Net pay is negative — deductions exceed earnings for this period.
                      </ThemedText>
                    </View>
                  ) : null}
                </SectionCard>

                {/* Statutory deductions — open by default (important) */}
                <SectionCard title="Statutory deductions" defaultOpen>
                  <DetailRow
                    label="Social security base"
                    value={formatPayrollAmount(payroll.statutoryDeductions.socialSecurityBase, currency)}
                  />
                  <DetailRow
                    label="Pension base"
                    value={formatPayrollAmount(payroll.statutoryDeductions.pensionBase, currency)}
                  />
                  <DetailRow
                    label="Taxable income"
                    value={formatPayrollAmount(payroll.statutoryDeductions.taxableIncome, currency)}
                  />
                  <View style={styles.divider} />
                  <DetailRow
                    label="Employee social security"
                    value={formatPayrollAmount(payroll.statutoryDeductions.employeeSocialSecurity, currency)}
                    negative
                  />
                  <DetailRow
                    label="Employee pension"
                    value={formatPayrollAmount(payroll.statutoryDeductions.employeePensionContribution, currency)}
                    negative
                  />
                  <DetailRow
                    label="Income tax"
                    value={formatPayrollAmount(payroll.statutoryDeductions.incomeTax, currency)}
                    negative
                  />
                  <DetailRow
                    label="Total deducted"
                    value={formatPayrollAmount(payroll.statutoryDeductions.statutoryDeductionsTotal, currency)}
                    emphasized
                    negative
                  />
                  <View style={styles.divider} />
                  <DetailRow
                    label="Employer social security"
                    value={formatPayrollAmount(payroll.statutoryDeductions.employerSocialSecurity, currency)}
                  />
                  <DetailRow
                    label="Employer pension"
                    value={formatPayrollAmount(payroll.statutoryDeductions.employerPensionContribution, currency)}
                  />
                  <DetailRow
                    label="Employer cost total"
                    value={formatPayrollAmount(payroll.statutoryDeductions.employerCostTotal, currency)}
                    emphasized
                  />
                  {payroll.statutoryDeductions.usedSystemDefaults ? (
                    <View style={styles.infoBanner}>
                      <AlertTriangle size={14} color="#92400E" />
                      <ThemedText style={styles.infoBannerText}>
                        System default rates were used — no custom rates configured.
                      </ThemedText>
                    </View>
                  ) : null}
                  {payroll.statutoryDeductions.bracketBreakdown.length > 0 ? (
                    <View style={styles.inlineGroup}>
                      <ThemedText style={styles.inlineGroupTitle}>Tax bracket breakdown</ThemedText>
                      {payroll.statutoryDeductions.bracketBreakdown.map((b, i) => (
                        <View key={`${b.lowerBound}-${i}`} style={styles.inlineCard}>
                          <ThemedText style={styles.inlineCardTitle}>
                            {b.lowerBound} — {b.upperBound ?? 'above'}
                          </ThemedText>
                          <ThemedText style={styles.inlineCardText}>Rate: {b.rate}</ThemedText>
                          <ThemedText style={styles.inlineCardText}>
                            Taxable slice: {formatPayrollAmount(b.taxableSlice, currency)}
                          </ThemedText>
                          <ThemedText style={styles.inlineCardText}>
                            Tax: {formatPayrollAmount(b.taxAmount, currency)}
                          </ThemedText>
                        </View>
                      ))}
                    </View>
                  ) : null}
                </SectionCard>

                {/* Adjustments */}
                <SectionCard
                  title="Adjustments"
                  defaultOpen={
                    payroll.adjustments.bonuses.length > 0 ||
                    payroll.adjustments.deductions.length > 0
                  }
                >
                  <DetailRow
                    label="Total bonuses"
                    value={formatPayrollAmount(payroll.adjustments.totalBonus, currency)}
                    positive
                  />
                  <DetailRow
                    label="Total manual deductions"
                    value={formatPayrollAmount(payroll.adjustments.totalManualDeduction, currency)}
                    negative
                  />
                  {payroll.adjustments.bonuses.length > 0 ? (
                    <View style={styles.inlineGroup}>
                      <ThemedText style={styles.inlineGroupTitle}>Bonuses</ThemedText>
                      {payroll.adjustments.bonuses.map((item) => (
                        <View key={item.id} style={styles.inlineCard}>
                          <View style={styles.inlineCardRow}>
                            <ThemedText style={styles.inlineCardTitle}>{item.reason}</ThemedText>
                            <ThemedText style={[styles.inlineCardAmount, styles.positiveText]}>
                              {formatPayrollAmount(item.amount, currency)}
                            </ThemedText>
                          </View>
                          {item.notes ? (
                            <ThemedText style={styles.inlineCardText}>{item.notes}</ThemedText>
                          ) : null}
                        </View>
                      ))}
                    </View>
                  ) : null}
                  {payroll.adjustments.deductions.length > 0 ? (
                    <View style={styles.inlineGroup}>
                      <ThemedText style={styles.inlineGroupTitle}>Manual deductions</ThemedText>
                      {payroll.adjustments.deductions.map((item) => (
                        <View key={item.id} style={styles.inlineCard}>
                          <View style={styles.inlineCardRow}>
                            <ThemedText style={styles.inlineCardTitle}>{item.reason}</ThemedText>
                            <ThemedText style={[styles.inlineCardAmount, styles.negativeText]}>
                              {formatPayrollAmount(item.amount, currency)}
                            </ThemedText>
                          </View>
                          {item.notes ? (
                            <ThemedText style={styles.inlineCardText}>{item.notes}</ThemedText>
                          ) : null}
                        </View>
                      ))}
                    </View>
                  ) : null}
                </SectionCard>

                {/* Employment period */}
                <SectionCard title="Employment period">
                  <DetailRow
                    label="Start date"
                    value={formatPayrollDate(payroll.employmentPeriod.employmentStartDate)}
                  />
                  <DetailRow
                    label="End date"
                    value={formatPayrollDate(payroll.employmentPeriod.employmentEndDate)}
                  />
                  <DetailRow
                    label="Payable from"
                    value={formatPayrollDate(payroll.employmentPeriod.payableFrom)}
                  />
                  <DetailRow
                    label="Payable to"
                    value={formatPayrollDate(payroll.employmentPeriod.payableTo)}
                  />
                </SectionCard>

                {/* Work period */}
                <SectionCard title="Work period">
                  <DetailRow
                    label="Calendar days"
                    value={String(payroll.workPeriod.calendarDaysInMonth)}
                  />
                  <DetailRow
                    label="Working days"
                    value={String(payroll.workPeriod.workingDaysInMonth)}
                  />
                  <DetailRow
                    label="Payable working days"
                    value={payroll.workPeriod.payableWorkingDays}
                  />
                  <DetailRow
                    label="Effective payable days"
                    value={payroll.workPeriod.effectivePayableWorkingDays}
                  />
                  <DetailRow
                    label="Daily working hours"
                    value={payroll.workPeriod.defaultDailyWorkingHours}
                  />
                  <DetailRow label="Payable hours" value={payroll.workPeriod.payableHours} />
                  <DetailRow label="Hours source" value={payroll.workPeriod.workHoursSource} />
                  <DetailRow
                    label="Effective attendance to"
                    value={formatPayrollDate(payroll.workPeriod.effectiveAttendanceTo)}
                  />
                </SectionCard>

                {/* Base pay */}
                <SectionCard title="Base pay calculation">
                  <DetailRow label="Formula" value={payroll.basePayCalculation.formula} />
                  {payroll.basePayCalculation.monthlySalary ? (
                    <DetailRow
                      label="Monthly salary"
                      value={formatPayrollAmount(payroll.basePayCalculation.monthlySalary, currency)}
                    />
                  ) : null}
                  {payroll.basePayCalculation.hourlyRate ? (
                    <DetailRow
                      label="Hourly rate"
                      value={formatPayrollAmount(payroll.basePayCalculation.hourlyRate, currency)}
                    />
                  ) : null}
                  <DetailRow
                    label="Payable working days"
                    value={payroll.basePayCalculation.payableWorkingDays}
                  />
                  <DetailRow
                    label="Working days in month"
                    value={String(payroll.basePayCalculation.workingDaysInMonth)}
                  />
                  <DetailRow label="Payable hours" value={payroll.basePayCalculation.payableHours} />
                  <DetailRow
                    label="Base pay"
                    value={formatPayrollAmount(payroll.basePayCalculation.basePay, currency)}
                    emphasized
                    positive
                  />
                  <DetailRow
                    label="Proration method"
                    value={payroll.basePayCalculation.prorationMethod ?? 'Not applicable'}
                  />
                </SectionCard>

                {/* Hourly attendance — only if present */}
                {payroll.hourlyAttendancePayment ? (
                  <SectionCard title="Hourly attendance">
                    <DetailRow
                      label="Full payable hours"
                      value={payroll.hourlyAttendancePayment.fullPayableHours}
                    />
                    <DetailRow
                      label="Attended hours"
                      value={payroll.hourlyAttendancePayment.attendedHours}
                    />
                    <DetailRow
                      label="Full payment"
                      value={formatPayrollAmount(payroll.hourlyAttendancePayment.fullPayment, currency)}
                    />
                    <DetailRow
                      label="Attendance deduction"
                      value={formatPayrollAmount(payroll.hourlyAttendancePayment.attendanceDeduction, currency)}
                      negative
                    />
                    <DetailRow
                      label="Payment received"
                      value={formatPayrollAmount(payroll.hourlyAttendancePayment.paymentReceived, currency)}
                      emphasized
                      positive
                    />
                    <DetailRow label="Hours source" value={payroll.hourlyAttendancePayment.workHoursSource} />
                  </SectionCard>
                ) : null}

                {/* Leave */}
                <SectionCard title="Leave calculation">
                  <DetailRow
                    label="Annual allowance (days)"
                    value={String(payroll.leaveCalculation.annualPaidLeaveAllowanceDays)}
                  />
                  <DetailRow
                    label="Used before this month"
                    value={payroll.leaveCalculation.usedPaidLeaveBeforeThisMonth}
                  />
                  <DetailRow
                    label="Taken this month"
                    value={payroll.leaveCalculation.leaveTakenThisMonth}
                  />
                  <DetailRow
                    label="Paid leave days"
                    value={payroll.leaveCalculation.paidLeaveDaysThisMonth}
                  />
                  <DetailRow
                    label="Paid leave amount"
                    value={formatPayrollAmount(payroll.leaveCalculation.paidLeaveAmount, currency)}
                    positive
                  />
                  <DetailRow
                    label="Unpaid leave days"
                    value={payroll.leaveCalculation.unpaidLeaveDaysThisMonth}
                  />
                  <DetailRow
                    label="Unpaid leave deduction"
                    value={formatPayrollAmount(payroll.leaveCalculation.unpaidLeaveDeduction, currency)}
                    negative
                  />
                  {payroll.leaveCalculation.leaveRecordsIncluded.length > 0 ? (
                    <View style={styles.inlineGroup}>
                      <ThemedText style={styles.inlineGroupTitle}>Leave records included</ThemedText>
                      {payroll.leaveCalculation.leaveRecordsIncluded.map((record) => (
                        <View key={record.id} style={styles.inlineCard}>
                          <ThemedText style={styles.inlineCardTitle}>{record.leaveType}</ThemedText>
                          <ThemedText style={styles.inlineCardText}>
                            {formatPayrollDate(record.startDate)} — {formatPayrollDate(record.endDate)}
                          </ThemedText>
                          <ThemedText style={styles.inlineCardText}>
                            Days counted: {record.daysCountedInPayroll}
                          </ThemedText>
                          <ThemedText style={styles.inlineCardText}>
                            Treatment: {formatPayrollTreatment(record.payrollTreatment)}
                          </ThemedText>
                        </View>
                      ))}
                    </View>
                  ) : null}
                </SectionCard>

                {/* Sick leave */}
                <SectionCard title="Sick leave">
                  <DetailRow label="Status" value={payroll.sickLeaveCalculation.status} />
                  <DetailRow
                    label="Days taken"
                    value={payroll.sickLeaveCalculation.daysTakenThisMonth}
                  />
                  <DetailRow
                    label="Company paid days"
                    value={payroll.sickLeaveCalculation.companyPaidDays}
                  />
                  <DetailRow
                    label="Unpaid sick leave days"
                    value={payroll.sickLeaveCalculation.unpaidSickLeaveDays}
                  />
                  <DetailRow
                    label="Company paid %"
                    value={payroll.sickLeaveCalculation.companyPaidPercentage}
                  />
                  <DetailRow
                    label="Company paid amount"
                    value={formatPayrollAmount(payroll.sickLeaveCalculation.companyPaidAmount, currency)}
                    positive
                  />
                  <DetailRow
                    label="Paid deduction equivalent"
                    value={formatPayrollAmount(payroll.sickLeaveCalculation.paidSickLeaveDeductionEquivalent, currency)}
                    negative
                  />
                  <DetailRow
                    label="Total deduction"
                    value={formatPayrollAmount(payroll.sickLeaveCalculation.totalSickLeaveDeduction, currency)}
                    negative
                    emphasized
                  />
                  <DetailRow
                    label="Paid sick leave hours"
                    value={payroll.sickLeaveCalculation.paidSickLeaveHours}
                  />
                  <DetailRow
                    label="Unpaid sick leave hours"
                    value={payroll.sickLeaveCalculation.unpaidSickLeaveHours}
                  />
                  <DetailRow
                    label="Unpaid sick leave amount"
                    value={formatPayrollAmount(payroll.sickLeaveCalculation.unpaidSickLeaveUnpaidAmount, currency)}
                    negative
                  />
                  <DetailRow
                    label="Insurance covered days"
                    value={payroll.sickLeaveCalculation.insuranceCoveredDays}
                  />
                  <DetailRow
                    label="Insurance covered amount"
                    value={formatPayrollAmount(payroll.sickLeaveCalculation.insuranceCoveredAmount, currency)}
                  />
                </SectionCard>

                {/* Absence details — only if present */}
                {payroll.absenceDetails ? (
                  <SectionCard title="Absence details">
                    <View style={styles.infoBanner}>
                      <ThemedText style={styles.infoBannerText}>
                        Informational only.{payroll.absenceDetails.applied ? ' Deduction applied.' : ' No deduction applied.'}
                      </ThemedText>
                    </View>
                    <DetailRow
                      label="Expected working minutes"
                      value={payroll.absenceDetails.expectedWorkingMinutes}
                    />
                    <DetailRow
                      label="Attended minutes"
                      value={payroll.absenceDetails.attendedMinutes}
                    />
                    <DetailRow
                      label="Absent minutes"
                      value={payroll.absenceDetails.absentMinutes}
                    />
                    <DetailRow
                      label="Monetary equivalent"
                      value={formatPayrollAmount(payroll.absenceDetails.monetaryEquivalent, currency)}
                      negative
                    />
                    <DetailRow
                      label="Applied"
                      value={payroll.absenceDetails.applied ? 'Yes' : 'No'}
                    />
                  </SectionCard>
                ) : null}

                {isRefreshing ? (
                  <ThemedText style={styles.refreshHint}>Refreshing...</ThemedText>
                ) : null}
              </ScrollView>

              {/* Sticky download button */}
              <View style={styles.downloadContainer}>
                {isDraftOrFailed ? (
                  <View style={styles.downloadUnavailableNote}>
                    <ThemedText style={styles.downloadUnavailableText}>
                      PDF not available — payroll must be calculated before downloading.
                    </ThemedText>
                  </View>
                ) : (
                  <TouchableOpacity
                    style={[styles.downloadButton, isDownloading && styles.downloadButtonBusy]}
                    onPress={onDownload}
                    activeOpacity={0.85}
                    disabled={isDownloading}
                  >
                    {isDownloading ? (
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                      <Download size={18} color="#FFFFFF" strokeWidth={2.5} />
                    )}
                    <ThemedText style={styles.downloadButtonText}>
                      {isDownloading ? 'Downloading...' : 'Download payslip PDF'}
                    </ThemedText>
                  </TouchableOpacity>
                )}
              </View>
            </>
          ) : null}
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
  },
  sheet: {
    backgroundColor: '#F8FAFC',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    width: '100%',
    maxHeight: '94%',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
  },
  dragHandleContainer: {
    width: '100%',
    paddingTop: 12,
    paddingBottom: 14,
    alignItems: 'center',
  },
  dragHandle: {
    width: 36,
    height: 4,
    backgroundColor: '#CBD5E1',
    borderRadius: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 22,
  },
  headerTitle: {
    fontFamily: Fonts.sf.bold,
    fontSize: 22,
    fontWeight: '700',
    color: '#1E2939',
  },
  headerSubtitle: {
    marginTop: 2,
    fontFamily: Fonts.sf.regular,
    fontSize: 13,
    color: '#64748B',
  },
  closeButton: {
    padding: 6,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
  },
  centerState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    paddingHorizontal: 24,
    gap: 12,
  },
  centerStateText: {
    fontFamily: Fonts.sf.regular,
    fontSize: 14,
    color: '#475569',
    textAlign: 'center',
    lineHeight: 21,
  },
  retryButton: {
    marginTop: 4,
    backgroundColor: '#2563EB',
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  retryButtonText: {
    fontFamily: Fonts.sf.semibold,
    fontSize: 14,
    color: '#FFFFFF',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 10,
  },
  heroCard: {
    backgroundColor: '#0F172A',
    borderRadius: 24,
    padding: 20,
  },
  heroTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  heroTopRight: {
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
  },
  heroBadge: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  heroBadgeText: {
    fontFamily: Fonts.sf.bold,
    fontSize: 12,
  },
  previewChip: {
    backgroundColor: '#FEF3C7',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  previewChipText: {
    fontFamily: Fonts.sf.semibold,
    fontSize: 11,
    color: '#92400E',
  },
  lockedChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#DCFCE7',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  lockedChipText: {
    fontFamily: Fonts.sf.semibold,
    fontSize: 11,
    color: '#166534',
  },
  heroName: {
    fontFamily: Fonts.sf.semibold,
    fontSize: 14,
    color: '#94A3B8',
  },
  heroPeriod: {
    marginTop: 2,
    fontFamily: Fonts.sf.bold,
    fontSize: 18,
    color: '#FFFFFF',
  },
  heroAmount: {
    marginTop: 14,
    fontFamily: Fonts.sf.bold,
    fontSize: 32,
    color: '#FFFFFF',
  },
  heroAmountNegative: {
    color: '#FCA5A5',
  },
  heroCaption: {
    marginTop: 2,
    fontFamily: Fonts.sf.regular,
    fontSize: 12,
    color: '#64748B',
  },
  heroMetaGrid: {
    marginTop: 16,
    flexDirection: 'row',
    gap: 8,
  },
  heroMetaItem: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderRadius: 14,
    padding: 10,
  },
  heroMetaLabel: {
    fontFamily: Fonts.sf.regular,
    fontSize: 11,
    color: '#64748B',
  },
  heroMetaValue: {
    marginTop: 4,
    fontFamily: Fonts.sf.semibold,
    fontSize: 12,
    color: '#FFFFFF',
  },
  infoBanner: {
    backgroundColor: '#FEF3C7',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  infoBannerText: {
    flex: 1,
    fontFamily: Fonts.sf.regular,
    fontSize: 12,
    lineHeight: 18,
    color: '#92400E',
  },
  warningCard: {
    backgroundColor: '#FEF2F2',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#FECACA',
    gap: 6,
  },
  warningTitle: {
    fontFamily: Fonts.sf.bold,
    fontSize: 14,
    color: '#B91C1C',
    marginBottom: 2,
  },
  warningText: {
    fontFamily: Fonts.sf.regular,
    fontSize: 13,
    lineHeight: 19,
    color: '#7F1D1D',
  },
  negativeBanner: {
    marginTop: 4,
    backgroundColor: '#FEF2F2',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  negativeBannerText: {
    fontFamily: Fonts.sf.semibold,
    fontSize: 12,
    color: '#B91C1C',
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  sectionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    fontFamily: Fonts.sf.bold,
    fontSize: 15,
    color: '#0F172A',
  },
  sectionBadge: {
    backgroundColor: '#F1F5F9',
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  sectionBadgeText: {
    fontFamily: Fonts.sf.semibold,
    fontSize: 10,
    color: '#475569',
  },
  sectionBody: {
    paddingHorizontal: 16,
    paddingBottom: 14,
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 12,
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 2,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
  },
  detailLabel: {
    flex: 1,
    fontFamily: Fonts.sf.regular,
    fontSize: 13,
    lineHeight: 18,
    color: '#64748B',
  },
  detailValue: {
    flex: 1,
    textAlign: 'right',
    fontFamily: Fonts.sf.semibold,
    fontSize: 13,
    lineHeight: 18,
    color: '#1E293B',
  },
  detailValueStrong: {
    fontFamily: Fonts.sf.bold,
    fontSize: 14,
  },
  detailValueNegative: {
    color: '#DC2626',
  },
  detailValuePositive: {
    color: '#059669',
  },
  inlineGroup: {
    marginTop: 6,
    gap: 6,
  },
  inlineGroupTitle: {
    fontFamily: Fonts.sf.semibold,
    fontSize: 12,
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  inlineCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    gap: 3,
  },
  inlineCardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 8,
  },
  inlineCardTitle: {
    flex: 1,
    fontFamily: Fonts.sf.semibold,
    fontSize: 13,
    color: '#0F172A',
  },
  inlineCardAmount: {
    fontFamily: Fonts.sf.bold,
    fontSize: 13,
  },
  inlineCardText: {
    fontFamily: Fonts.sf.regular,
    fontSize: 12,
    lineHeight: 17,
    color: '#64748B',
  },
  positiveText: { color: '#059669' },
  negativeText: { color: '#DC2626' },
  downloadContainer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    backgroundColor: '#F8FAFC',
  },
  downloadButton: {
    backgroundColor: '#0F766E',
    borderRadius: 16,
    paddingVertical: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    shadowColor: '#0F766E',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  downloadButtonBusy: {
    backgroundColor: '#115E59',
    shadowOpacity: 0.1,
  },
  downloadButtonText: {
    fontFamily: Fonts.sf.bold,
    fontSize: 15,
    color: '#FFFFFF',
  },
  downloadUnavailableNote: {
    backgroundColor: '#FEF3C7',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  downloadUnavailableText: {
    fontFamily: Fonts.sf.regular,
    fontSize: 13,
    color: '#92400E',
    textAlign: 'center',
    lineHeight: 19,
  },
  refreshHint: {
    textAlign: 'center',
    fontFamily: Fonts.sf.regular,
    fontSize: 12,
    color: '#94A3B8',
  },
});
