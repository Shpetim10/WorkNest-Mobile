import React from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

import { 
  AttendanceHeader, 
  ClockInOutCard, 
  TodaysRecords, 
  AttendanceCalendar,
  QrScannerModal,
  useAttendanceScreen,
} from '@/features/attendance';
import { ThemedText } from '@/common/components/themed-text';
import { ThemedView } from '@/common/components/themed-view';
import { Fonts, Spacing } from '@/common/constants/theme';

export default function AttendanceScreen() {
  const attendance = useAttendanceScreen();

  return (
    <ThemedView style={styles.container}>
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        bounces={false}
      >
        <AttendanceHeader />
        <View style={styles.content}>
          {attendance.banner ? (
            <TouchableOpacity
              style={[
                styles.banner,
                attendance.banner.type === 'success' && styles.bannerSuccess,
                attendance.banner.type === 'warning' && styles.bannerWarning,
                attendance.banner.type === 'error' && styles.bannerError,
              ]}
              onPress={attendance.dismissBanner}
              activeOpacity={0.8}
            >
              <ThemedText style={styles.bannerText}>{attendance.banner.text}</ThemedText>
            </TouchableOpacity>
          ) : null}

          <ClockInOutCard
            actionLabel={attendance.actionButtonLabel}
            actionHint={attendance.actionButtonHint}
            disabled={attendance.actionDisabled}
            busy={attendance.isActionBusy}
            onPress={attendance.onClockPress}
            siteName={attendance.today?.siteName ?? null}
            workDate={attendance.today?.workDate ?? null}
            blockReasonMessage={attendance.today?.blockReasonMessage ?? attendance.actionDisabledReason}
            warnings={attendance.today?.warnings ?? []}
            qrRequired={Boolean(attendance.today?.qrRequired)}
            locationRequired={Boolean(attendance.today?.locationRequired)}
          />
          <TodaysRecords
            record={attendance.today?.todayRecord ?? null}
            timezone={attendance.today?.timezone}
            clockIn={attendance.today?.clockIn ?? null}
            clockOut={attendance.today?.clockOut ?? null}
          />
          <AttendanceCalendar
            monthDate={attendance.monthDate}
            monthDays={attendance.monthDays}
            isLoading={attendance.isMonthLoading}
            onMonthChange={attendance.changeMonth}
            onDayPress={attendance.selectDay}
            selectedDay={attendance.selectedDay}
          />

          {attendance.isInitialLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color="#2B7FFF" />
              <ThemedText style={styles.loadingText}>Loading attendance data...</ThemedText>
            </View>
          ) : null}

          <TouchableOpacity style={styles.retryButton} onPress={attendance.retryAll}>
            <ThemedText style={styles.retryText}>
              {attendance.isRefreshingToday ? 'Refreshing...' : 'Retry Sync'}
            </ThemedText>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <QrScannerModal
        visible={attendance.scannerVisible}
        onCancel={attendance.onQrCancelled}
        onScanned={attendance.onQrScanned}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA', // Light grey background
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 100,
  },
  content: {
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    marginTop: -58,
    paddingTop: 24,
    flex: 1,
    minHeight: 600,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    zIndex: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 5,
    paddingBottom: Spacing.six,
  },
  banner: {
    marginHorizontal: Spacing.four,
    marginTop: Spacing.four,
    borderRadius: 12,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
  bannerSuccess: {
    backgroundColor: '#DCFCE7',
    borderColor: '#86EFAC',
    borderWidth: 1,
  },
  bannerWarning: {
    backgroundColor: '#FFEDD5',
    borderColor: '#FDBA74',
    borderWidth: 1,
  },
  bannerError: {
    backgroundColor: '#FEE2E2',
    borderColor: '#FCA5A5',
    borderWidth: 1,
  },
  bannerText: {
    color: '#334155',
    fontFamily: Fonts.sf.semibold,
    fontSize: 13,
  },
  loadingContainer: {
    marginHorizontal: Spacing.four,
    marginTop: Spacing.one,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  loadingText: {
    fontFamily: Fonts.sf.semibold,
    color: '#64748B',
  },
  retryButton: {
    marginHorizontal: Spacing.four,
    marginTop: Spacing.two,
    borderRadius: 12,
    paddingVertical: Spacing.two,
    backgroundColor: '#E2E8F0',
    alignItems: 'center',
  },
  retryText: {
    fontFamily: Fonts.sf.semibold,
    color: '#334155',
  },
});
