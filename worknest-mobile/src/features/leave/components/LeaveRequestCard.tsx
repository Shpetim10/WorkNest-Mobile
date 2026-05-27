import React, { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Calendar, X, XCircle } from 'lucide-react-native';

import { ThemedText } from '@/common/components/themed-text';
import { Fonts, Spacing } from '@/common/constants/theme';
import { useLocalization } from '@/common/localization';
import type { LeaveRequestDto } from '../types';

interface LeaveRequestCardProps {
  request: LeaveRequestDto;
  onCancel?: (id: string) => void;
}

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function getDisplayText(value: unknown, fallback: string) {
  if (typeof value === 'string') {
    return value.trim() || fallback;
  }

  if (typeof value === 'number' && Number.isFinite(value)) {
    return String(value);
  }

  return fallback;
}

function getOptionalText(value: unknown) {
  return typeof value === 'string' && value.trim() ? value.trim() : null;
}

function parseDateOnly(dateStr: unknown) {
  if (typeof dateStr !== 'string' || !dateStr.trim()) {
    return null;
  }

  const [year, month, day] = dateStr.split('-').map(Number);

  if (!year || !month || !day) {
    const fallbackDate = new Date(dateStr);
    return Number.isNaN(fallbackDate.getTime()) ? null : fallbackDate;
  }

  const parsedDate = new Date(year, month - 1, day);

  if (
    parsedDate.getFullYear() !== year ||
    parsedDate.getMonth() !== month - 1 ||
    parsedDate.getDate() !== day
  ) {
    return null;
  }

  return parsedDate;
}

export function LeaveRequestCard({ request, onCancel }: LeaveRequestCardProps) {
  const { t } = useLocalization();
  const [isDetailsVisible, setIsDetailsVisible] = useState(false);

  const leaveTypeLabels: Record<string, string> = {
    VACATION: t('requests.vacation'),
    SICK: t('requests.sickLeave'),
    PERSONAL: t('requests.personal'),
    UNPAID: t('requests.unpaid'),
    PARENTAL: t('requests.parental'),
    OTHER: t('requests.other'),
  };

  const fallbackText = t('common.notAvailable');
  const status = getOptionalText(request.status);
  const leaveType = getOptionalText(request.leaveType);
  const leaveTypeLabel = leaveType ? leaveTypeLabels[leaveType] ?? leaveType : fallbackText;

  const getStatusConfig = () => {
    switch (status) {
      case 'APPROVED':
        return { bg: '#DCFCE7', text: '#15803D', label: t('requests.approved') };
      case 'PENDING':
        return { bg: '#FEF9C2', text: '#A65F00', label: t('requests.pending') };
      case 'REJECTED':
        return { bg: '#FEE2E2', text: '#B91C1C', label: t('requests.rejected') };
      case 'CANCELLED':
        return { bg: '#F1F5F9', text: '#64748B', label: t('requests.cancelled') };
      default:
        return { bg: '#F1F5F9', text: '#64748B', label: status ?? fallbackText };
    }
  };

  const statusConfig = getStatusConfig();

  const formatDate = (dateStr: unknown) => {
    const date = parseDateOnly(dateStr);

    if (!date) {
      return null;
    }

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${months[date.getMonth()]} ${date.getDate()}`;
  };

  const formatDateTime = (dateStr: unknown) => {
    if (typeof dateStr !== 'string' || !dateStr.trim()) {
      return null;
    }

    const date = new Date(dateStr);

    if (Number.isNaN(date.getTime())) {
      return dateStr;
    }

    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const startDateLabel = formatDate(request.startDate);
  const endDateLabel = formatDate(request.endDate);
  const dateRange =
    request.startDate === request.endDate
      ? startDateLabel ?? fallbackText
      : startDateLabel && endDateLabel
        ? `${startDateLabel} - ${endDateLabel}`
        : startDateLabel ?? endDateLabel ?? fallbackText;
  const daysCount = Number(request.daysCount);
  const duration = Number.isFinite(daysCount)
    ? `${daysCount} ${daysCount === 1 ? t('common.day') : t('common.days')}`
    : fallbackText;
  const detailText =
    status === 'REJECTED'
      ? getOptionalText(request.rejectionReason)
      : status === 'APPROVED'
        ? getOptionalText(request.approvalNote)
        : null;
  const detailLabel =
    status === 'REJECTED' ? t('requests.reason') : t('requests.noteFromApprover');
  const startDate = parseDateOnly(request.startDate);
  const canCancel =
    status === 'PENDING' ||
    (status === 'APPROVED' &&
      startDate !== null &&
      startOfDay(new Date()) < startOfDay(startDate));

  return (
    <>
      <View style={styles.card}>
        <View style={styles.topRow}>
          <ThemedText style={styles.title}>
            {leaveTypeLabel}
          </ThemedText>
          <View style={[styles.statusPill, { backgroundColor: statusConfig.bg }]}>
            <ThemedText style={[styles.statusText, { color: statusConfig.text }]}>
              {statusConfig.label}
            </ThemedText>
          </View>
        </View>

        <View style={styles.detailsRow}>
          <Calendar size={14} color="#6A7282" />
          <ThemedText style={styles.detailsText}>
            {dateRange} - {duration}
          </ThemedText>
        </View>

        {detailText ? (
          <View style={status === 'REJECTED' ? styles.rejectionRow : styles.approvalNoteRow}>
            <ThemedText
              style={status === 'REJECTED' ? styles.rejectionText : styles.approvalNoteText}
              numberOfLines={3}
            >
              {detailLabel}: {detailText}
            </ThemedText>
            <TouchableOpacity
              style={styles.readMoreButton}
              onPress={() => setIsDetailsVisible(true)}
              activeOpacity={0.7}
            >
              <ThemedText style={styles.readMoreText}>{t('requests.readMore')}</ThemedText>
            </TouchableOpacity>
          </View>
        ) : null}

        {canCancel && onCancel && (
          <TouchableOpacity
            style={styles.cancelRow}
            onPress={() => onCancel(getDisplayText(request.id, ''))}
            activeOpacity={0.7}
          >
            <XCircle size={14} color="#DC2626" />
            <ThemedText style={styles.cancelText}>{t('requests.cancelRequest')}</ThemedText>
          </TouchableOpacity>
        )}
      </View>

      <Modal
        transparent
        visible={isDetailsVisible}
        animationType="fade"
        onRequestClose={() => setIsDetailsVisible(false)}
      >
        <View style={styles.modalRoot}>
          <Pressable style={styles.modalBackdrop} onPress={() => setIsDetailsVisible(false)} />
          <View style={styles.detailSheet}>
            <View style={styles.sheetHandle} />
            <View style={styles.detailHeader}>
              <ThemedText style={styles.detailTitle}>{t('requests.requestDetails')}</ThemedText>
              <TouchableOpacity
                style={styles.detailCloseButton}
                onPress={() => setIsDetailsVisible(false)}
                activeOpacity={0.8}
              >
                <X size={20} color="#64748B" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.detailContent}>
              <View style={styles.detailRow}>
                <ThemedText style={styles.detailLabel}>{t('requests.leaveType')}</ThemedText>
                <ThemedText style={styles.detailValue}>{leaveTypeLabel}</ThemedText>
              </View>
              <View style={styles.detailRow}>
                <ThemedText style={styles.detailLabel}>{t('requests.dateRange')}</ThemedText>
                <ThemedText style={styles.detailValue}>{dateRange}</ThemedText>
              </View>
              <View style={styles.detailRow}>
                <ThemedText style={styles.detailLabel}>{t('requests.status')}</ThemedText>
                <ThemedText style={styles.detailValue}>{statusConfig.label}</ThemedText>
              </View>
              <View style={styles.detailRow}>
                <ThemedText style={styles.detailLabel}>{t('requests.requestedDays')}</ThemedText>
                <ThemedText style={styles.detailValue}>{duration}</ThemedText>
              </View>
              <View style={styles.detailRow}>
                <ThemedText style={styles.detailLabel}>{t('requests.createdAt')}</ThemedText>
                <ThemedText style={styles.detailValue}>{formatDateTime(request.createdAt) ?? '-'}</ThemedText>
              </View>
              {request.reviewedAt ? (
                <View style={styles.detailRow}>
                  <ThemedText style={styles.detailLabel}>{t('requests.reviewedAt')}</ThemedText>
                  <ThemedText style={styles.detailValue}>{formatDateTime(request.reviewedAt)}</ThemedText>
                </View>
              ) : null}
              {detailText ? (
                <View style={styles.noteBlock}>
                  <ThemedText style={styles.noteLabel}>{detailLabel}</ThemedText>
                  <ThemedText style={styles.noteText}>{detailText}</ThemedText>
                </View>
              ) : null}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginBottom: 16,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
    marginBottom: 10,
  },
  title: {
    flex: 1,
    fontFamily: Fonts.sf.bold,
    fontWeight: '700',
    fontSize: 18,
    lineHeight: 27,
    color: '#1E2939',
  },
  statusPill: {
    height: 24,
    minWidth: 71,
    paddingHorizontal: 12,
    borderRadius: 999,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusText: {
    fontFamily: Fonts.sf.semibold,
    fontSize: 12,
    lineHeight: 16,
  },
  detailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    minWidth: 0,
  },
  detailsText: {
    flex: 1,
    fontFamily: Fonts.sf.regular,
    fontSize: 14,
    lineHeight: 20,
    color: '#6A7282',
  },
  rejectionRow: {
    marginTop: 8,
  },
  rejectionText: {
    fontFamily: Fonts.sf.regular,
    fontSize: 13,
    lineHeight: 18,
    color: '#B91C1C',
  },
  approvalNoteRow: {
    marginTop: 8,
  },
  approvalNoteText: {
    fontFamily: Fonts.sf.regular,
    fontSize: 13,
    lineHeight: 18,
    color: '#15803D',
  },
  readMoreButton: {
    alignSelf: 'flex-start',
    marginTop: 6,
  },
  readMoreText: {
    fontFamily: Fonts.sf.semibold,
    fontSize: 13,
    color: '#2B7FFF',
  },
  cancelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 10,
    alignSelf: 'flex-start',
  },
  cancelText: {
    fontFamily: Fonts.sf.semibold,
    fontSize: 13,
    color: '#DC2626',
  },
  modalRoot: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 23, 42, 0.35)',
  },
  detailSheet: {
    maxHeight: '82%',
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 28,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 10,
  },
  sheetHandle: {
    width: 42,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E2E8F0',
    alignSelf: 'center',
    marginBottom: 12,
  },
  detailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
    marginBottom: 16,
  },
  detailTitle: {
    flex: 1,
    fontFamily: Fonts.sf.bold,
    fontWeight: '700',
    fontSize: 20,
    color: '#1E2939',
  },
  detailCloseButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailContent: {
    paddingBottom: Spacing.two,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  detailLabel: {
    flex: 1,
    fontFamily: Fonts.sf.semibold,
    fontSize: 14,
    color: '#64748B',
  },
  detailValue: {
    flex: 1,
    fontFamily: Fonts.sf.bold,
    fontWeight: '700',
    fontSize: 14,
    color: '#1E2939',
    textAlign: 'right',
    lineHeight: 20,
  },
  noteBlock: {
    marginTop: 16,
    borderRadius: 16,
    backgroundColor: '#F8FAFC',
    padding: 14,
  },
  noteLabel: {
    fontFamily: Fonts.sf.bold,
    fontWeight: '700',
    fontSize: 14,
    color: '#1E2939',
    marginBottom: 8,
  },
  noteText: {
    fontFamily: Fonts.sf.regular,
    fontSize: 14,
    lineHeight: 20,
    color: '#475569',
  },
});
