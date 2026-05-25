import React, { useState } from 'react';
import {
  ActivityIndicator,
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  Bell,
  Clock,
  Wallet,
  DollarSign,
  ChevronRight,
  CheckCircle,
} from 'lucide-react-native';

import { ThemedText } from '@/common/components/themed-text';
import { BottomTabInset, Fonts, Spacing } from '@/common/constants/theme';
import { useLocalization } from '@/common/localization';
import { useHomeScreen } from '../hooks/use-home-screen';

export function HomeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { t } = useLocalization();
  const {
    isLoading,
    profile,
    currentDay,
    currentTime,
    attendance,
    leaveBalances,
    latestPayroll,
    announcements,
    refetchList,
  } = useHomeScreen();

  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    try {
      await refetchList();
    } catch (error) {
      // ignore
    } finally {
      setRefreshing(false);
    }
  }, [refetchList]);

  const headerHeight = insets.top + 135;

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2B7FFF" />
      </View>
    );
  }

  const firstInitial = profile.firstName ? profile.firstName.charAt(0).toUpperCase() : '';
  const lastInitial = profile.lastName ? profile.lastName.charAt(0).toUpperCase() : '';
  const initials = `${firstInitial}${lastInitial}` || '?';

  return (
    <View style={styles.container}>
      {/* Absolute Overlapping Header */}
      <View style={[styles.headerWrapper, { height: headerHeight }]} pointerEvents="box-none">
        <LinearGradient
          colors={['#2B7FFF', '#00BBA7']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.headerGradient, { paddingTop: insets.top + 28 }]}
          pointerEvents="box-none"
        >
          <View style={styles.headerRow}>
            {/* Profile Info */}
            <View style={styles.profileSection}>
              <View style={styles.avatarContainer}>
                {profile.profilePictureUrl ? (
                  <Image
                    source={{ uri: profile.profilePictureUrl }}
                    style={styles.avatar}
                  />
                ) : (
                  <View style={styles.initialsContainer}>
                    <ThemedText style={styles.initialsText}>{initials}</ThemedText>
                  </View>
                )}
                <View style={styles.activeDot} />
              </View>
              <View style={styles.textContainer}>
                <ThemedText style={styles.greetingText}>{t('home.hello')}</ThemedText>
                <ThemedText style={styles.nameText}>{profile.firstName}</ThemedText>
              </View>
            </View>

            {/* Bell Notification Button */}
            <TouchableOpacity
              style={styles.notificationButton}
              activeOpacity={0.7}
              onPress={() => router.push('/notifications' as any)}
            >
              <Bell size={22} color="#FFFFFF" strokeWidth={2} />
              {profile.hasNotifications && <View style={styles.badgeDot} />}
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </View>

      {/* Underlapping ScrollView */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          { 
            paddingTop: headerHeight + Spacing.four,
            paddingBottom: BottomTabInset + Spacing.six
          },
        ]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#0D9488"
            colors={['#0D9488']}
          />
        }
      >
        {/* Date and Time Row */}
        <View style={styles.dateTimeRow}>
          <ThemedText style={styles.dayText}>{currentDay}</ThemedText>
          <ThemedText style={styles.timeText}>{currentTime}</ThemedText>
        </View>

        {/* Cards Container */}
        <View style={styles.cardsList}>
          {/* Attendance Card */}
          <TouchableOpacity
            style={styles.card}
            activeOpacity={0.85}
            onPress={() => router.push('/attendance' as any)}
          >
            <View style={styles.cardHeader}>
              <View style={[styles.iconBox, { backgroundColor: '#2B7FFF' }]}>
                <Clock size={20} color="#FFFFFF" strokeWidth={2.5} />
              </View>
              <ThemedText style={styles.cardTitle}>{t('home.attendance')}</ThemedText>
            </View>
            <View style={styles.cardBody}>
              <View style={styles.attendanceCheckRow}>
                {attendance.checkedIn ? (
                  <CheckCircle size={18} color="#00BBA7" strokeWidth={2.5} />
                ) : (
                  <View style={styles.notCheckedInDot} />
                )}
                <View style={styles.checkTextColumn}>
                  <ThemedText style={styles.labelSmall}>{t('home.today')}</ThemedText>
                  <ThemedText style={styles.valueMedium}>
                    {attendance.checkedIn
                      ? `${t('home.checkedInAt')} ${attendance.checkInTime}`
                      : t('home.notCheckedIn')}
                  </ThemedText>
                </View>
              </View>
            </View>
          </TouchableOpacity>

          {/* Leave Balance Card */}
          <TouchableOpacity
            style={styles.card}
            activeOpacity={0.85}
            onPress={() => router.push('/requests' as any)}
          >
            <View style={styles.cardHeader}>
              <View style={[styles.iconBox, { backgroundColor: '#0D9488' }]}>
                <Wallet size={20} color="#FFFFFF" strokeWidth={2.2} />
              </View>
              <ThemedText style={styles.cardTitle}>{t('home.leaveBalance')}</ThemedText>
            </View>
            <View style={styles.cardBody}>
              {leaveBalances.length === 0 ? (
                <ThemedText style={styles.labelSmall}>{t('home.noActiveLeaveBalances')}</ThemedText>
              ) : (
                leaveBalances.map((balance, index) => {
                  const leaveTypeLabel = balance.leaveType.charAt(0).toUpperCase() + balance.leaveType.slice(1).toLowerCase();
                  return (
                    <View key={balance.leaveType}>
                      {index > 0 && <View style={styles.leaveDivider} />}
                      <View style={styles.leaveBalanceRow}>
                        <ThemedText style={styles.leaveLabel}>{leaveTypeLabel}</ThemedText>
                        <ThemedText style={styles.leaveValue}>
                          {balance.remainingDays} {balance.remainingDays === 1 ? t('common.day') : t('common.days')}
                        </ThemedText>
                      </View>
                    </View>
                  );
                })
              )}
            </View>
          </TouchableOpacity>

          {/* Latest Payroll Card */}
          <TouchableOpacity
            style={styles.card}
            activeOpacity={0.85}
            onPress={() => router.push('/payroll' as any)}
          >
            <View style={styles.cardHeader}>
              <View style={[styles.iconBox, { backgroundColor: '#8B5CF6' }]}>
                <DollarSign size={20} color="#FFFFFF" strokeWidth={2.5} />
              </View>
              <ThemedText style={styles.cardTitle}>{t('home.latestPayroll')}</ThemedText>
            </View>
            <View style={styles.cardBody}>
              {latestPayroll.period ? (
                <>
                  <ThemedText style={styles.labelSmall}>
                    {latestPayroll.period}
                  </ThemedText>
                  {latestPayroll.amount ? (
                    <ThemedText style={styles.payrollAmount}>
                      {latestPayroll.amount}
                    </ThemedText>
                  ) : (
                    <ThemedText style={styles.labelSmall}>{t('home.noPayrollData')}</ThemedText>
                  )}
                </>
              ) : (
                <ThemedText style={styles.labelSmall}>{t('home.noPayrollData')}</ThemedText>
              )}
            </View>
          </TouchableOpacity>

          {/* Announcements Card */}
          <TouchableOpacity
            style={styles.card}
            activeOpacity={0.8}
            onPress={() => router.push('/announcements' as any)}
          >
            <View style={styles.cardHeader}>
              <View style={[styles.iconBox, { backgroundColor: '#F59E0B' }]}>
                <Bell size={20} color="#FFFFFF" strokeWidth={2.2} />
              </View>
              <View style={styles.announcementTitleGroup}>
                <ThemedText style={styles.cardTitle}>{t('home.announcements')}</ThemedText>
                {announcements.unreadCount > 0 && (
                  <View style={styles.unreadBadge}>
                    <ThemedText style={styles.unreadBadgeText}>
                      {announcements.unreadCount} {t('common.new')}
                    </ThemedText>
                  </View>
                )}
              </View>
            </View>
            <View style={styles.cardBody}>
              <View style={styles.announcementContentRow}>
                <ThemedText style={styles.announcementPreview} numberOfLines={1}>
                  {announcements.latestTitle}
                </ThemedText>
                <ChevronRight size={18} color="#94A3B8" />
              </View>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F5F7FA',
  },
  headerWrapper: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    backgroundColor: 'transparent',
    shadowColor: '#2B7FFF',
    shadowOpacity: 0.22,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
  headerGradient: {
    flex: 1,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    paddingHorizontal: 28,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatarContainer: {
    position: 'relative',
    width: 58,
    height: 58,
    borderRadius: 29,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatar: {
    width: '100%',
    height: '100%',
    borderRadius: 29,
  },
  initialsContainer: {
    width: '100%',
    height: '100%',
    borderRadius: 29,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  initialsText: {
    fontFamily: Fonts.sf.bold,
    fontWeight: '700',
    fontSize: 18,
    color: '#2B7FFF',
  },
  activeDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 15,
    height: 15,
    borderRadius: 7.5,
    backgroundColor: '#22C55E',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  textContainer: {
    flexDirection: 'column',
    justifyContent: 'center',
  },
  greetingText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontFamily: Fonts.sf.regular,
    fontSize: 14,
    lineHeight: 18,
  },
  nameText: {
    color: '#FFFFFF',
    fontFamily: Fonts.sf.bold,
    fontWeight: '700',
    fontSize: 24,
    lineHeight: 30,
  },
  notificationButton: {
    width: 48,
    height: 48,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.35)',
    backgroundColor: 'rgba(255,255,255,0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  badgeDot: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingBottom: 110,
  },
  dateTimeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.four,
    paddingHorizontal: 4,
  },
  dayText: {
    fontFamily: Fonts.sf.bold,
    fontWeight: '700',
    fontSize: 18,
    color: '#1E2939',
  },
  timeText: {
    fontFamily: Fonts.sf.semibold,
    fontWeight: '600',
    fontSize: 16,
    color: '#475569',
  },
  cardsList: {
    gap: 16,
    width: '100%',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1.26,
    borderColor: 'rgba(229, 231, 235, 0.5)',
    paddingVertical: 18,
    paddingHorizontal: 20,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 12,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardTitle: {
    fontFamily: Fonts.sf.bold,
    fontWeight: '700',
    fontSize: 16,
    color: '#1E2939',
  },
  cardBody: {
    paddingLeft: 2,
  },
  attendanceCheckRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 2,
  },
  checkTextColumn: {
    flexDirection: 'column',
  },
  labelSmall: {
    fontFamily: Fonts.sf.regular,
    fontSize: 12,
    color: '#94A3B8',
    lineHeight: 15,
  },
  valueMedium: {
    fontFamily: Fonts.sf.semibold,
    fontWeight: '600',
    fontSize: 14,
    color: '#1E2939',
    marginTop: 2,
  },
  notCheckedInDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#94A3B8',
    marginHorizontal: 3,
  },
  leaveBalanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  leaveLabel: {
    fontFamily: Fonts.sf.regular,
    fontSize: 14,
    color: '#64748B',
  },
  leaveValue: {
    fontFamily: Fonts.sf.bold,
    fontWeight: '700',
    fontSize: 14,
    color: '#1E2939',
  },
  leaveDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 4,
  },
  payrollAmount: {
    fontFamily: Fonts.sf.bold,
    fontWeight: '800',
    fontSize: 24,
    color: '#1E2939',
    marginTop: 4,
  },
  announcementTitleGroup: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingRight: 4,
  },
  unreadBadge: {
    backgroundColor: '#FEE2E2',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  unreadBadgeText: {
    fontFamily: Fonts.sf.semibold,
    fontSize: 11,
    color: '#EF4444',
  },
  announcementContentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 2,
  },
  announcementPreview: {
    flex: 1,
    fontFamily: Fonts.sf.regular,
    fontSize: 14,
    color: '#475569',
    marginRight: 10,
  },
});
