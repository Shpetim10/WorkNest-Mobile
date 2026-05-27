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
import { useLocalization } from '@/common/localization';
import type { PayrollCalculationResponse, PayrollPeriodKey, PayrollStatus } from '../types/payroll.types';
import {
  formatPaymentMethod,
  formatPayrollDate,
  formatPayrollMonthLabel,
  formatPayrollStatus,
  formatPayrollTreatment,
} from '../utils/payroll-formatters';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const LOCKED_STATUSES = new Set(['APPROVED', 'FINALIZED', 'PAID']);

function formatPayrollAmount(value: string | null | undefined, currency: string): string {
  if (value == null || value === '') {
    return 'Not available';
  }

  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    return `${currency} ${value}`;
  }

  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(parsed);
  } catch {
    return `${currency} ${Math.round(parsed)}`;
  }
}

const getLastDayOfMonth = (year: number, month: number): string => {
  try {
    const lastDayDate = new Date(year, month, 0);
    return new Intl.DateTimeFormat('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    }).format(lastDayDate);
  } catch {
    const lastDayDate = new Date(year, month, 0);
    return lastDayDate.toDateString();
  }
};

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
  const { t } = useLocalization();
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

  const periodLabel = period ? formatPayrollMonthLabel(period.year, period.month) : t('payroll.details');
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
              <ThemedText style={styles.headerTitle}>{t('payroll.details')}</ThemedText>
              {payroll?.employeeName ? (
                <ThemedText style={styles.headerEmployeeName}>{payroll.employeeName}</ThemedText>
              ) : null}
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton} activeOpacity={0.7}>
              <X size={22} color="#6A7282" />
            </TouchableOpacity>
          </View>

          {isLoading ? (
            <View style={styles.centerState}>
              <ActivityIndicator size="large" color="#2B7FFF" />
              <ThemedText style={styles.centerStateText}>{t('payroll.loadingDetails')}</ThemedText>
            </View>
          ) : errorMessage ? (
            <View style={styles.centerState}>
              <AlertTriangle size={28} color="#DC2626" />
              <ThemedText style={styles.centerStateText}>
                {errorMessage ?? t('payroll.detailsLoadError')}
              </ThemedText>
              <TouchableOpacity style={styles.retryButton} onPress={onRetry} activeOpacity={0.8}>
                <RefreshCcw size={16} color="#FFFFFF" />
                <ThemedText style={styles.retryButtonText}>{t('common.tryAgain')}</ThemedText>
              </TouchableOpacity>
            </View>
          ) : payroll ? (
            <>
              <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
                bounces={false}
              >
                {payroll.preview ? (
                  <View style={styles.infoBanner}>
                    <AlertTriangle size={14} color="#92400E" />
                    <ThemedText style={styles.infoBannerText}>
                      Live preview — figures may change until payroll is locked
                    </ThemedText>
                  </View>
                ) : null}

                {/* Net Salary card (light green) */}
                <View style={styles.greenCard}>
                  <ThemedText style={styles.greenCardPeriod}>
                    {formatPayrollMonthLabel(payroll.year, payroll.month)}
                  </ThemedText>
                  <ThemedText style={styles.greenCardLabel}>{t('payroll.netPay')}</ThemedText>
                  <ThemedText style={styles.greenCardValue}>
                    {formatPayrollAmount(payroll.totals.netPay, payroll.currency)}
                  </ThemedText>
                </View>

                {/* Summary Info Card */}
                <View style={styles.summaryCard}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 14, gap: 8 }}>
                    <View style={styles.summaryStatusBadge}>
                      <ThemedText style={styles.summaryStatusText}>
                        {formatPayrollStatus(payroll.payrollStatus)}
                      </ThemedText>
                    </View>
                    {isLocked ? (
                      <View style={styles.lockedChip}>
                        <Lock size={12} color="#166534" />
                        <ThemedText style={styles.lockedChipText}>{t('payroll.locked')}</ThemedText>
                      </View>
                    ) : null}
                  </View>

                  <View style={styles.summaryMetaGrid}>
                    <View style={styles.summaryMetaItem}>
                      <ThemedText style={styles.summaryMetaLabel}>{t('payroll.method')}</ThemedText>
                      <ThemedText style={styles.summaryMetaValue}>
                        {formatPaymentMethod(payroll.paymentMethod)}
                      </ThemedText>
                    </View>
                    <View style={styles.summaryMetaItem}>
                      <ThemedText style={styles.summaryMetaLabel}>{t('payroll.calculation')}</ThemedText>
                      <ThemedText
                        style={[
                          styles.summaryMetaValue,
                          payroll.calculationStatus === 'SUCCESS'
                            ? styles.successText
                            : payroll.calculationStatus === 'FAILED'
                            ? styles.failedText
                            : null,
                        ]}
                      >
                        {payroll.calculationStatus}
                      </ThemedText>
                    </View>
                    <View style={styles.summaryMetaItem}>
                      <ThemedText style={styles.summaryMetaLabel}>{t('payroll.currency')}</ThemedText>
                      <ThemedText style={styles.summaryMetaValue}>
                        {payroll.currency}
                      </ThemedText>
                    </View>
                  </View>
                </View>

                {payroll.warnings && payroll.warnings.length > 0 ? (
                  <View style={styles.warningCard}>
                    <ThemedText style={styles.warningTitle}>{t('payroll.warnings')}</ThemedText>
                    {payroll.warnings.map((w, index) => (
                      <ThemedText key={index} style={styles.warningText}>
                        • {w}
                      </ThemedText>
                    ))}
                  </View>
                ) : null}

                {/* Totals — always open */}
                <SectionCard title={t('payroll.totals')}>
                  <DetailRow
                    label={t('payroll.basePay')}
                    value={formatPayrollAmount(payroll.totals.basePay, currency)}
                    positive
                  />
                  {payroll.totals.overtimePay != null ? (
                    <DetailRow
                      label={t('payroll.overtimePay')}
                      value={formatPayrollAmount(payroll.totals.overtimePay ?? '0', currency)}
                      positive
                    />
                  ) : null}
                  <DetailRow
                    label={t('payroll.grossEarnings')}
                    value={formatPayrollAmount(payroll.totals.grossEarnings, currency)}
                    positive
                  />
                  <DetailRow
                    label={t('payroll.statutoryDeductions')}
                    value={formatPayrollAmount(payroll.totals.statutoryDeductions, currency)}
                    negative
                  />
                  <DetailRow
                    label={t('payroll.totalDeductions')}
                    value={formatPayrollAmount(payroll.totals.totalDeductions, currency)}
                    negative
                  />
                  <View style={styles.divider} />
                  <DetailRow
                    label={t('payroll.netPay')}
                    value={formatPayrollAmount(payroll.totals.netPay, currency)}
                    emphasized
                    negative={payroll.totals.netPayNegative}
                    positive={!payroll.totals.netPayNegative}
                  />
                  <DetailRow
                    label={t('payroll.employerCost')}
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
                <SectionCard title={t('payroll.statutoryDeductions')}>
                  <DetailRow
                    label={t('payroll.socialSecurityBase')}
                    value={formatPayrollAmount(payroll.statutoryDeductions.socialSecurityBase, currency)}
                  />
                  <DetailRow
                    label={t('payroll.pensionBase')}
                    value={formatPayrollAmount(payroll.statutoryDeductions.pensionBase, currency)}
                  />
                  <DetailRow
                    label={t('payroll.taxableIncome')}
                    value={formatPayrollAmount(payroll.statutoryDeductions.taxableIncome, currency)}
                  />
                  <View style={styles.divider} />
                  <DetailRow
                    label={t('payroll.employeeSocialSecurity')}
                    value={formatPayrollAmount(payroll.statutoryDeductions.employeeSocialSecurity, currency)}
                    negative
                  />
                  <DetailRow
                    label={t('payroll.employeePension')}
                    value={formatPayrollAmount(payroll.statutoryDeductions.employeePensionContribution, currency)}
                    negative
                  />
                  <DetailRow
                    label={t('payroll.incomeTax')}
                    value={formatPayrollAmount(payroll.statutoryDeductions.incomeTax, currency)}
                    negative
                  />
                  <DetailRow
                    label={t('payroll.totalDeducted')}
                    value={formatPayrollAmount(payroll.statutoryDeductions.statutoryDeductionsTotal, currency)}
                    emphasized
                    negative
                  />
                  <View style={styles.divider} />
                  <DetailRow
                    label={t('payroll.employerSocialSecurity')}
                    value={formatPayrollAmount(payroll.statutoryDeductions.employerSocialSecurity, currency)}
                  />
                  <DetailRow
                    label={t('payroll.employerPension')}
                    value={formatPayrollAmount(payroll.statutoryDeductions.employerPensionContribution, currency)}
                  />
                  <DetailRow
                    label={t('payroll.employerCostTotal')}
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
                      <ThemedText style={styles.inlineGroupTitle}>{t('payroll.taxBracketBreakdown')}</ThemedText>
                      {payroll.statutoryDeductions.bracketBreakdown.map((b, i) => (
                        <View key={`${b.lowerBound}-${i}`} style={styles.inlineCard}>
                          <ThemedText style={styles.inlineCardTitle}>
                            {b.lowerBound} — {b.upperBound ?? 'above'}
                          </ThemedText>
                          <ThemedText style={styles.inlineCardText}>{t('payroll.rate')}: {b.rate}</ThemedText>
                          <ThemedText style={styles.inlineCardText}>
                            {t('payroll.taxableSlice')}: {formatPayrollAmount(b.taxableSlice, currency)}
                          </ThemedText>
                          <ThemedText style={styles.inlineCardText}>
                            {t('payroll.tax')}: {formatPayrollAmount(b.taxAmount, currency)}
                          </ThemedText>
                        </View>
                      ))}
                    </View>
                  ) : null}
                </SectionCard>

                {/* Adjustments */}
                <SectionCard title={t('payroll.adjustments')}>
                  <DetailRow
                    label={t('payroll.totalBonuses')}
                    value={formatPayrollAmount(payroll.adjustments.totalBonus, currency)}
                    positive
                  />
                  <DetailRow
                    label={t('payroll.totalManualDeductions')}
                    value={formatPayrollAmount(payroll.adjustments.totalManualDeduction, currency)}
                    negative
                  />
                  {payroll.adjustments.bonuses.length > 0 ? (
                    <View style={styles.inlineGroup}>
                      <ThemedText style={styles.inlineGroupTitle}>{t('payroll.bonuses')}</ThemedText>
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
                      <ThemedText style={styles.inlineGroupTitle}>{t('payroll.manualDeductions')}</ThemedText>
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
                <SectionCard title={t('payroll.employmentPeriod')}>
                  <DetailRow
                    label={t('payroll.startDate')}
                    value={formatPayrollDate(payroll.employmentPeriod.employmentStartDate)}
                  />
                  <DetailRow
                    label={t('payroll.endDate')}
                    value={formatPayrollDate(payroll.employmentPeriod.employmentEndDate)}
                  />
                  <DetailRow
                    label={t('payroll.payableFrom')}
                    value={formatPayrollDate(payroll.employmentPeriod.payableFrom)}
                  />
                  <DetailRow
                    label={t('payroll.payableTo')}
                    value={formatPayrollDate(payroll.employmentPeriod.payableTo)}
                  />
                </SectionCard>

                {/* Work period */}
                <SectionCard title={t('payroll.workPeriod')}>
                  <DetailRow
                    label={t('payroll.calendarDays')}
                    value={String(payroll.workPeriod.calendarDaysInMonth)}
                  />
                  <DetailRow
                    label={t('payroll.workingDays')}
                    value={String(payroll.workPeriod.workingDaysInMonth)}
                  />
                  <DetailRow
                    label={t('payroll.payableWorkingDays')}
                    value={payroll.workPeriod.payableWorkingDays}
                  />
                  <DetailRow
                    label={t('payroll.effectivePayableDays')}
                    value={payroll.workPeriod.effectivePayableWorkingDays}
                  />
                  <DetailRow
                    label={t('payroll.dailyWorkingHours')}
                    value={payroll.workPeriod.defaultDailyWorkingHours}
                  />
                  <DetailRow label={t('payroll.payableHours')} value={payroll.workPeriod.payableHours} />
                  <DetailRow label={t('payroll.hoursSource')} value={payroll.workPeriod.workHoursSource} />
                  <DetailRow
                    label={t('payroll.effectiveAttendanceTo')}
                    value={formatPayrollDate(payroll.workPeriod.effectiveAttendanceTo)}
                  />
                </SectionCard>

                {/* Base pay */}
                <SectionCard title={t('payroll.basePayCalculation')}>
                  <DetailRow label={t('payroll.formula')} value={payroll.basePayCalculation.formula} />
                  {payroll.basePayCalculation.monthlySalary ? (
                    <DetailRow
                      label={t('payroll.monthlySalary')}
                      value={formatPayrollAmount(payroll.basePayCalculation.monthlySalary, currency)}
                    />
                  ) : null}
                  {payroll.basePayCalculation.hourlyRate ? (
                    <DetailRow
                      label={t('payroll.hourlyRate')}
                      value={formatPayrollAmount(payroll.basePayCalculation.hourlyRate, currency)}
                    />
                  ) : null}
                  <DetailRow
                    label={t('payroll.payableWorkingDays')}
                    value={payroll.basePayCalculation.payableWorkingDays}
                  />
                  <DetailRow
                    label={t('payroll.workingDaysInMonth')}
                    value={String(payroll.basePayCalculation.workingDaysInMonth)}
                  />
                  <DetailRow label={t('payroll.payableHours')} value={payroll.basePayCalculation.payableHours} />
                  <DetailRow
                    label={t('payroll.basePay')}
                    value={formatPayrollAmount(payroll.basePayCalculation.basePay, currency)}
                    emphasized
                    positive
                  />
                  <DetailRow
                    label={t('payroll.prorationMethod')}
                    value={payroll.basePayCalculation.prorationMethod ?? 'Not applicable'}
                  />
                </SectionCard>

                {/* Overtime — only if present */}
                {payroll.overtimeDetails ? (
                  <SectionCard title={t('payroll.overtime')}>
                    <DetailRow
                      label={t('payroll.expectedHours')}
                      value={String(payroll.overtimeDetails.expectedHours)}
                    />
                    <DetailRow
                      label={t('payroll.workedHours')}
                      value={String(payroll.overtimeDetails.workedHours)}
                    />
                    <DetailRow
                      label={t('payroll.overtimeHours')}
                      value={String(payroll.overtimeDetails.overtimeHours)}
                    />
                    <DetailRow
                      label={t('payroll.overtimeRate')}
                      value={formatPayrollAmount(
                        String(payroll.overtimeDetails.overtimeHourlyRate),
                        currency
                      )}
                    />
                    <View style={styles.divider} />
                    <DetailRow
                      label={t('payroll.overtimePay')}
                      value={formatPayrollAmount(
                        String(payroll.overtimeDetails.overtimePay),
                        currency
                      )}
                      emphasized
                      positive
                    />
                  </SectionCard>
                ) : null}

                {/* Hourly attendance — only if present */}
                {payroll.hourlyAttendancePayment ? (
                  <SectionCard title={t('payroll.hourlyAttendance')}>
                    <DetailRow
                      label={t('payroll.fullPayableHours')}
                      value={payroll.hourlyAttendancePayment.fullPayableHours}
                    />
                    <DetailRow
                      label={t('payroll.attendedHours')}
                      value={payroll.hourlyAttendancePayment.attendedHours}
                    />
                    <DetailRow
                      label={t('payroll.fullPayment')}
                      value={formatPayrollAmount(payroll.hourlyAttendancePayment.fullPayment, currency)}
                    />
                    <DetailRow
                      label={t('payroll.attendanceDeduction')}
                      value={formatPayrollAmount(payroll.hourlyAttendancePayment.attendanceDeduction, currency)}
                      negative
                    />
                    <DetailRow
                      label={t('payroll.paymentReceived')}
                      value={formatPayrollAmount(payroll.hourlyAttendancePayment.paymentReceived, currency)}
                      emphasized
                      positive
                    />
                    <DetailRow label={t('payroll.hoursSource')} value={payroll.hourlyAttendancePayment.workHoursSource} />
                  </SectionCard>
                ) : null}

                {/* Leave */}
                <SectionCard title={t('payroll.leaveCalculation')}>
                  <DetailRow
                    label={t('payroll.annualAllowanceDays')}
                    value={String(payroll.leaveCalculation.annualPaidLeaveAllowanceDays)}
                  />
                  <DetailRow
                    label={t('payroll.usedBeforeThisMonth')}
                    value={payroll.leaveCalculation.usedPaidLeaveBeforeThisMonth}
                  />
                  <DetailRow
                    label={t('payroll.takenThisMonth')}
                    value={payroll.leaveCalculation.leaveTakenThisMonth}
                  />
                  <DetailRow
                    label={t('payroll.paidLeaveDays')}
                    value={payroll.leaveCalculation.paidLeaveDaysThisMonth}
                  />
                  <DetailRow
                    label={t('payroll.paidLeaveAmount')}
                    value={formatPayrollAmount(payroll.leaveCalculation.paidLeaveAmount, currency)}
                    positive
                  />
                  <DetailRow
                    label={t('payroll.unpaidLeaveDays')}
                    value={payroll.leaveCalculation.unpaidLeaveDaysThisMonth}
                  />
                  <DetailRow
                    label={t('payroll.unpaidLeaveDeduction')}
                    value={formatPayrollAmount(payroll.leaveCalculation.unpaidLeaveDeduction, currency)}
                    negative
                  />
                  {payroll.leaveCalculation.leaveRecordsIncluded.length > 0 ? (
                    <View style={styles.inlineGroup}>
                      <ThemedText style={styles.inlineGroupTitle}>{t('payroll.leaveRecordsIncluded')}</ThemedText>
                      {payroll.leaveCalculation.leaveRecordsIncluded.map((record) => (
                        <View key={record.id} style={styles.inlineCard}>
                          <ThemedText style={styles.inlineCardTitle}>{record.leaveType}</ThemedText>
                          <ThemedText style={styles.inlineCardText}>
                            {formatPayrollDate(record.startDate)} — {formatPayrollDate(record.endDate)}
                          </ThemedText>
                          <ThemedText style={styles.inlineCardText}>
                            {t('payroll.daysCounted')}: {record.daysCountedInPayroll}
                          </ThemedText>
                          <ThemedText style={styles.inlineCardText}>
                            {t('payroll.treatment')}: {formatPayrollTreatment(record.payrollTreatment)}
                          </ThemedText>
                        </View>
                      ))}
                    </View>
                  ) : null}
                </SectionCard>

                {/* Sick leave */}
                <SectionCard title={t('payroll.sickLeave')}>
                  <DetailRow label={t('payroll.status')} value={payroll.sickLeaveCalculation.status} />
                  <DetailRow
                    label={t('payroll.daysTaken')}
                    value={payroll.sickLeaveCalculation.daysTakenThisMonth}
                  />
                  <DetailRow
                    label={t('payroll.companyPaidDays')}
                    value={payroll.sickLeaveCalculation.companyPaidDays}
                  />
                  <DetailRow
                    label={t('payroll.unpaidSickLeaveDays')}
                    value={payroll.sickLeaveCalculation.unpaidSickLeaveDays}
                  />
                  <DetailRow
                    label={t('payroll.companyPaidPercent')}
                    value={payroll.sickLeaveCalculation.companyPaidPercentage}
                  />
                  <DetailRow
                    label={t('payroll.companyPaidAmount')}
                    value={formatPayrollAmount(payroll.sickLeaveCalculation.companyPaidAmount, currency)}
                    positive
                  />
                  <DetailRow
                    label={t('payroll.paidDeductionEquivalent')}
                    value={formatPayrollAmount(payroll.sickLeaveCalculation.paidSickLeaveDeductionEquivalent, currency)}
                    negative
                  />
                  <DetailRow
                    label={t('payroll.totalDeduction')}
                    value={formatPayrollAmount(payroll.sickLeaveCalculation.totalSickLeaveDeduction, currency)}
                    negative
                    emphasized
                  />
                  <DetailRow
                    label={t('payroll.paidSickLeaveHours')}
                    value={payroll.sickLeaveCalculation.paidSickLeaveHours}
                  />
                  <DetailRow
                    label={t('payroll.unpaidSickLeaveHours')}
                    value={payroll.sickLeaveCalculation.unpaidSickLeaveHours}
                  />
                  <DetailRow
                    label={t('payroll.unpaidSickLeaveAmount')}
                    value={formatPayrollAmount(payroll.sickLeaveCalculation.unpaidSickLeaveUnpaidAmount, currency)}
                    negative
                  />
                  <DetailRow
                    label={t('payroll.insuranceCoveredDays')}
                    value={payroll.sickLeaveCalculation.insuranceCoveredDays}
                  />
                  <DetailRow
                    label={t('payroll.insuranceCoveredAmount')}
                    value={formatPayrollAmount(payroll.sickLeaveCalculation.insuranceCoveredAmount, currency)}
                  />
                </SectionCard>

                {/* Absence details — only if present */}
                {payroll.absenceDetails ? (
                  <SectionCard title={t('payroll.absenceDetails')}>
                    <View style={styles.infoBanner}>
                      <ThemedText style={styles.infoBannerText}>
                        {t('payroll.informationalOnly')} {payroll.absenceDetails.applied ? t('payroll.deductionApplied') : t('payroll.noDeductionApplied')}
                      </ThemedText>
                    </View>
                    <DetailRow
                      label={t('payroll.expectedWorkingMinutes')}
                      value={payroll.absenceDetails.expectedWorkingMinutes}
                    />
                    <DetailRow
                      label={t('payroll.attendedMinutes')}
                      value={payroll.absenceDetails.attendedMinutes}
                    />
                    <DetailRow
                      label={t('payroll.absentMinutes')}
                      value={payroll.absenceDetails.absentMinutes}
                    />
                    <DetailRow
                      label={t('payroll.monetaryEquivalent')}
                      value={formatPayrollAmount(payroll.absenceDetails.monetaryEquivalent, currency)}
                      negative
                    />
                    <DetailRow
                      label={t('payroll.applied')}
                      value={payroll.absenceDetails.applied ? t('common.yes') : t('common.no')}
                    />
                  </SectionCard>
                ) : null}

                {isRefreshing ? (
                  <ThemedText style={styles.refreshHint}>{t('attendance.refreshing')}</ThemedText>
                ) : null}
              </ScrollView>

              {/* Sticky download button */}
              <View style={styles.downloadContainer}>
                {isDraftOrFailed ? (
                  <View style={styles.downloadUnavailableNote}>
                    <ThemedText style={styles.downloadUnavailableText}>
                      {t('payroll.pdfUnavailable')}
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
                      {isDownloading ? t('payroll.downloading') : t('payroll.downloadPdf')}
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
    backgroundColor: '#FFFFFF',
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
  blueCard: {
    backgroundColor: '#EFF6FF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  blueCardTitle: {
    fontFamily: Fonts.sf.bold,
    fontSize: 16,
    color: '#1E3A8A',
    fontWeight: '700',
  },
  blueCardSubtitle: {
    fontFamily: Fonts.sf.regular,
    fontSize: 14,
    color: '#3B82F6',
    marginTop: 4,
  },
  greenCard: {
    backgroundColor: '#ECFDF5',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  greenCardPeriod: {
    fontFamily: Fonts.sf.bold,
    fontSize: 16,
    fontWeight: '700',
    color: '#065F46',
    marginBottom: 6,
  },
  greenCardLabel: {
    fontFamily: Fonts.sf.regular,
    fontSize: 14,
    color: '#065F46',
  },
  greenCardValue: {
    fontFamily: Fonts.sf.bold,
    fontSize: 24,
    color: '#047857',
    fontWeight: '700',
    marginTop: 4,
  },
  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  summaryHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  summaryEmployeeName: {
    fontFamily: Fonts.sf.bold,
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  summaryStatusBadge: {
    backgroundColor: '#F1F5F9',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  summaryStatusText: {
    fontFamily: Fonts.sf.semibold,
    fontSize: 12,
    color: '#475569',
  },
  summaryMetaGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  summaryMetaItem: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 10,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  summaryMetaLabel: {
    fontFamily: Fonts.sf.regular,
    fontSize: 11,
    color: '#64748B',
  },
  summaryMetaValue: {
    marginTop: 4,
    fontFamily: Fonts.sf.semibold,
    fontSize: 12,
    color: '#334155',
  },
  successText: {
    color: '#0D9488',
  },
  failedText: {
    color: '#DC2626',
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
  headerEmployeeName: {
    marginTop: 4,
    fontFamily: Fonts.sf.semibold,
    fontSize: 16,
    color: '#334155',
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
