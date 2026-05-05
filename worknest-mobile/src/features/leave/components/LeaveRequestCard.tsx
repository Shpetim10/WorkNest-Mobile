import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Calendar } from 'lucide-react-native';

import { ThemedText } from '@/common/components/themed-text';
import { Fonts } from '@/common/constants/theme';
import type { LeaveRequestDto } from '../types';

const LEAVE_TYPE_LABELS: Record<string, string> = {
  VACATION: 'Vacation',
  SICK: 'Sick Leave',
  PERSONAL: 'Personal',
};

interface LeaveRequestCardProps {
  request: LeaveRequestDto;
}

export function LeaveRequestCard({ request }: LeaveRequestCardProps) {
  const getStatusConfig = () => {
    switch (request.status) {
      case 'APPROVED':
        return { bg: '#DCFCE7', text: '#15803D', label: 'Approved' };
      case 'PENDING':
        return { bg: '#FEF9C2', text: '#A65F00', label: 'Pending' };
      case 'REJECTED':
        return { bg: '#FEE2E2', text: '#B91C1C', label: 'Rejected' };
      default:
        return { bg: '#F1F5F9', text: '#64748B', label: request.status };
    }
  };

  const statusConfig = getStatusConfig();

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${months[date.getMonth()]} ${date.getDate()}`;
  };

  const dateRange =
    request.startDate === request.endDate
      ? formatDate(request.startDate)
      : `${formatDate(request.startDate)} - ${formatDate(request.endDate)}`;

  const duration = `${request.totalDays} ${request.totalDays === 1 ? 'day' : 'days'}`;

  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <ThemedText style={styles.title}>
          {LEAVE_TYPE_LABELS[request.leaveType] ?? request.leaveType}
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
          {dateRange}  •  {duration}
        </ThemedText>
      </View>

      {request.status === 'REJECTED' && request.rejectionReason && (
        <View style={styles.rejectionRow}>
          <ThemedText style={styles.rejectionText}>
            Reason: {request.rejectionReason}
          </ThemedText>
        </View>
      )}
    </View>
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
    marginBottom: 10,
  },
  title: {
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
  },
  detailsText: {
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
});