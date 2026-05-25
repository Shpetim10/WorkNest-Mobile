import React, { useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Building2,
  CalendarDays,
  Check,
  ChevronRight,
  FileText,
  Globe2,
  LogOut,
  Mail,
  Briefcase,
  MapPin,
  Lock,
  X,
} from 'lucide-react-native';

import { ThemedText } from '@/common/components/themed-text';
import { BottomTabInset, Fonts, Spacing } from '@/common/constants/theme';
import { useLocalization } from '@/common/localization';
import { useProfileScreen } from '../hooks/use-profile-screen';

export function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { profile, isLoading, handleLogout, refetch } = useProfileScreen();
  const { language, languageLabel, languages, setLanguage, t } = useLocalization();

  const [refreshing, setRefreshing] = useState(false);
  const [isLanguageModalVisible, setIsLanguageModalVisible] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const headerHeight = insets.top + 300;

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
  const locale = language === 'sq' ? 'sq-AL' : language;
  const notAssigned = t('common.notAssigned');
  const notAvailable = t('common.notAvailable');
  const formatEmploymentValue = (value: string | null | undefined, fallback: string) => {
    const trimmedValue = typeof value === 'string' ? value.trim() : '';
    return trimmedValue || fallback;
  };
  const formatDateValue = (value: string | null | undefined) => {
    const trimmedValue = typeof value === 'string' ? value.trim() : '';

    if (!trimmedValue) {
      return notAvailable;
    }

    const date = new Date(trimmedValue);

    if (Number.isNaN(date.getTime())) {
      return trimmedValue;
    }

    return new Intl.DateTimeFormat(locale, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(date);
  };
  const departmentValue = formatEmploymentValue(profile.departmentName, notAssigned);
  const siteValue = formatEmploymentValue(profile.siteName, notAssigned);
  const contractTypeValue = formatEmploymentValue(profile.contractType, notAvailable);
  const contractStatusValue = formatEmploymentValue(profile.contractStatus, notAvailable);
  const contractPeriodValue = `${formatDateValue(profile.contractStartDate)} - ${formatDateValue(profile.contractEndDate)}`;

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          { 
            paddingBottom: BottomTabInset + insets.bottom + Spacing.four
          },
        ]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#2B7FFF"
            colors={['#2B7FFF']}
          />
        }
      >
        <View style={[styles.headerWrapper, { height: headerHeight }]}>
          <LinearGradient
            colors={['#2B7FFF', '#00BBA7']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.headerGradient, { paddingTop: insets.top + 20 }]}
          >
            <View style={styles.avatarSection}>
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
              </View>

              <ThemedText style={styles.nameText}>{profile.fullName || 'Sarah'}</ThemedText>

              {(profile.jobTitle || profile.department) && (
                <View style={styles.infoRow}>
                  <Briefcase size={16} color="rgba(255,255,255,0.8)" />
                  <ThemedText style={styles.infoText}>{profile.jobTitle || profile.department}</ThemedText>
                </View>
              )}

              {profile.email ? (
                <View style={styles.infoRow}>
                  <Mail size={16} color="rgba(255,255,255,0.8)" />
                  <ThemedText style={styles.infoText}>{profile.email}</ThemedText>
                </View>
              ) : null}

              {profile.location && (
                <View style={styles.infoRow}>
                  <MapPin size={16} color="rgba(255,255,255,0.8)" />
                  <ThemedText style={styles.infoText}>{profile.location}</ThemedText>
                </View>
              )}
            </View>
          </LinearGradient>
        </View>

        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>{t('profile.employmentInformation')}</ThemedText>
          <View style={styles.statGrid}>
            <View style={styles.statCard}>
              <View style={styles.detailIconBox}>
                <Building2 size={18} color="#2B7FFF" strokeWidth={2.1} />
              </View>
              <ThemedText style={styles.statLabel}>{t('profile.department')}</ThemedText>
              <ThemedText style={styles.statValue} numberOfLines={2}>{departmentValue}</ThemedText>
            </View>
            <View style={styles.statCard}>
              <View style={styles.detailIconBox}>
                <MapPin size={18} color="#2B7FFF" strokeWidth={2.1} />
              </View>
              <ThemedText style={styles.statLabel}>{t('profile.site')}</ThemedText>
              <ThemedText style={styles.statValue} numberOfLines={2}>{siteValue}</ThemedText>
            </View>
          </View>
          <View style={styles.contractCard}>
            <View style={styles.contractHeader}>
              <View style={styles.detailIconBox}>
                <FileText size={18} color="#2B7FFF" strokeWidth={2.1} />
              </View>
              <View style={styles.contractTitleWrap}>
                <ThemedText style={styles.contractTitle}>{t('profile.contract')}</ThemedText>
                <ThemedText style={styles.contractType} numberOfLines={1}>{contractTypeValue}</ThemedText>
              </View>
              <ThemedText style={styles.contractStatus} numberOfLines={1}>{contractStatusValue}</ThemedText>
            </View>
            <View style={styles.contractPeriodRow}>
              <CalendarDays size={15} color="#64748B" strokeWidth={2} />
              <ThemedText style={styles.contractPeriod} numberOfLines={1}>
                {contractPeriodValue}
              </ThemedText>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <TouchableOpacity
            style={styles.actionCard}
            activeOpacity={0.8}
            onPress={() => setIsLanguageModalVisible(true)}
          >
            <View style={styles.actionCardLeft}>
              <View style={[styles.iconBox, { backgroundColor: '#EFF6FF' }]}>
                <Globe2 size={20} color="#2B7FFF" strokeWidth={2.2} />
              </View>
              <View style={styles.actionCardText}>
                <ThemedText style={styles.actionCardTitle}>{t('profile.language')}</ThemedText>
                <ThemedText style={styles.actionCardSub}>{languageLabel}</ThemedText>
              </View>
            </View>
            <ChevronRight size={20} color="#94A3B8" />
          </TouchableOpacity>
        </View>

        {/* Change Password Card */}
        <TouchableOpacity style={styles.actionCard} activeOpacity={0.8}>
          <View style={styles.actionCardLeft}>
            <View style={[styles.iconBox, { backgroundColor: '#F0FDF4' }]}>
              <Lock size={20} color="#10B981" strokeWidth={2.2} />
            </View>
            <View style={styles.actionCardText}>
              <ThemedText style={styles.actionCardTitle}>{t('profile.changePassword')}</ThemedText>
              <ThemedText style={styles.actionCardSub}>{t('profile.changePasswordSubtitle')}</ThemedText>
            </View>
          </View>
          <ChevronRight size={20} color="#94A3B8" />
        </TouchableOpacity>

        {/* Logout Button Section */}
        <TouchableOpacity
          style={styles.logoutButton}
          activeOpacity={0.8}
          onPress={handleLogout}
        >
          <LogOut size={20} color="#EF4444" strokeWidth={2.2} />
          <ThemedText style={styles.logoutButtonText}>{t('profile.logout')}</ThemedText>
        </TouchableOpacity>
      </ScrollView>

      <Modal
        transparent
        visible={isLanguageModalVisible}
        animationType="fade"
        onRequestClose={() => setIsLanguageModalVisible(false)}
      >
        <View style={styles.modalRoot}>
          <Pressable
            style={styles.modalBackdrop}
            onPress={() => setIsLanguageModalVisible(false)}
          />
          <View style={[styles.languageSheet, { paddingBottom: insets.bottom + 24 }]}>
            <View style={styles.sheetHandle} />
            <View style={styles.sheetHeader}>
              <ThemedText style={styles.sheetTitle}>{t('profile.selectLanguage')}</ThemedText>
              <TouchableOpacity
                style={styles.sheetCloseButton}
                onPress={() => setIsLanguageModalVisible(false)}
                activeOpacity={0.8}
              >
                <X size={20} color="#64748B" strokeWidth={2.2} />
              </TouchableOpacity>
            </View>
            <ThemedText style={styles.sheetSubtitle}>{t('profile.currentLanguage')}</ThemedText>
            <View style={styles.languageList}>
              {languages.map((item) => {
                const isSelected = item.code === language;

                return (
                  <TouchableOpacity
                    key={item.code}
                    style={[styles.languageOption, isSelected && styles.languageOptionSelected]}
                    activeOpacity={0.8}
                    onPress={async () => {
                      await setLanguage(item.code);
                      setIsLanguageModalVisible(false);
                    }}
                  >
                    <ThemedText
                      style={[
                        styles.languageOptionText,
                        isSelected && styles.languageOptionTextSelected,
                      ]}
                    >
                      {item.label}
                    </ThemedText>
                    {isSelected ? <Check size={20} color="#2B7FFF" strokeWidth={2.4} /> : null}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </View>
      </Modal>
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
    justifyContent: 'center',
    paddingBottom: 28,
  },
  avatarSection: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarContainer: {
    position: 'relative',
    width: 116,
    height: 116,
    borderRadius: 58,
    borderWidth: 3,
    borderColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  avatar: {
    width: '100%',
    height: '100%',
    borderRadius: 58,
  },
  initialsContainer: {
    width: '100%',
    height: '100%',
    borderRadius: 58,
    backgroundColor: '#2B7FFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  initialsText: {
    fontFamily: Fonts.sf.bold,
    fontWeight: '700',
    fontSize: 36,
    color: '#FFFFFF',
  },
  nameText: {
    color: '#FFFFFF',
    fontFamily: Fonts.sf.bold,
    fontWeight: '700',
    fontSize: 26,
    marginTop: 24,
    marginBottom: 12,
    textAlign: 'center',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 12,
  },
  infoText: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontFamily: Fonts.sf.regular,
    fontSize: 15,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 0,
  },
  section: {
    marginTop: 18,
    marginBottom: 10,
  },
  sectionTitle: {
    fontFamily: Fonts.sf.bold,
    fontWeight: '700',
    fontSize: 17,
    color: '#1E2939',
    marginHorizontal: 20,
    marginBottom: 10,
  },
  statGrid: {
    flexDirection: 'row',
    gap: 12,
    marginHorizontal: 20,
    marginBottom: 12,
  },
  statCard: {
    flex: 1,
    minHeight: 112,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1.26,
    borderColor: 'rgba(229, 231, 235, 0.5)',
    paddingHorizontal: 14,
    paddingVertical: 14,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 4,
  },
  statLabel: {
    fontFamily: Fonts.sf.semibold,
    fontWeight: '600',
    fontSize: 12,
    color: '#64748B',
    marginTop: 10,
    marginBottom: 4,
  },
  statValue: {
    fontFamily: Fonts.sf.bold,
    fontWeight: '700',
    fontSize: 14,
    color: '#1E2939',
    lineHeight: 18,
  },
  contractCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1.26,
    borderColor: 'rgba(229, 231, 235, 0.5)',
    paddingHorizontal: 14,
    paddingVertical: 14,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 4,
    marginHorizontal: 20,
  },
  contractHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  contractTitleWrap: {
    flex: 1,
    minWidth: 0,
  },
  contractTitle: {
    fontFamily: Fonts.sf.bold,
    fontWeight: '700',
    fontSize: 15,
    color: '#1E2939',
  },
  contractType: {
    fontFamily: Fonts.sf.regular,
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
  },
  contractStatus: {
    maxWidth: 112,
    borderRadius: 999,
    overflow: 'hidden',
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 10,
    paddingVertical: 5,
    fontFamily: Fonts.sf.bold,
    fontWeight: '700',
    fontSize: 12,
    color: '#10B981',
    textAlign: 'center',
  },
  contractPeriodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  contractPeriod: {
    flex: 1,
    fontFamily: Fonts.sf.semibold,
    fontWeight: '600',
    fontSize: 13,
    color: '#475569',
  },
  detailRow: {
    minHeight: 64,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    paddingVertical: 12,
  },
  detailRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  detailLeft: {
    flex: 1,
    minWidth: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  detailIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailLabel: {
    flex: 1,
    fontFamily: Fonts.sf.semibold,
    fontWeight: '600',
    fontSize: 14,
    color: '#475569',
  },
  detailValue: {
    flex: 1,
    fontFamily: Fonts.sf.bold,
    fontWeight: '700',
    fontSize: 14,
    color: '#1E2939',
    textAlign: 'right',
    lineHeight: 18,
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1.26,
    borderColor: 'rgba(229, 231, 235, 0.5)',
    paddingVertical: 14,
    paddingHorizontal: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 4,
    marginBottom: 10,
    marginHorizontal: 20,
  },
  actionCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  actionCardText: {
    flexDirection: 'column',
    gap: 2,
  },
  actionCardTitle: {
    fontFamily: Fonts.sf.bold,
    fontWeight: '700',
    fontSize: 16,
    color: '#1E2939',
  },
  actionCardSub: {
    fontFamily: Fonts.sf.regular,
    fontSize: 13,
    color: '#64748B',
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEF2F2',
    borderWidth: 1.5,
    borderColor: '#FECACA',
    borderRadius: 18,
    paddingVertical: 14,
    gap: 10,
    marginTop: 2,
    marginBottom: 12,
    marginHorizontal: 20,
  },
  logoutButtonText: {
    color: '#EF4444',
    fontFamily: Fonts.sf.bold,
    fontWeight: '700',
    fontSize: 16,
  },
  modalRoot: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 23, 42, 0.35)',
  },
  languageSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 12,
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
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
  },
  sheetCloseButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheetTitle: {
    flex: 1,
    fontFamily: Fonts.sf.bold,
    fontWeight: '700',
    fontSize: 20,
    color: '#1E2939',
  },
  sheetSubtitle: {
    fontFamily: Fonts.sf.regular,
    fontSize: 14,
    color: '#64748B',
    marginBottom: 16,
  },
  languageList: {
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  languageOption: {
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  languageOptionSelected: {
    backgroundColor: '#EFF6FF',
  },
  languageOptionText: {
    fontFamily: Fonts.sf.semibold,
    fontWeight: '600',
    fontSize: 16,
    color: '#334155',
  },
  languageOptionTextSelected: {
    color: '#2B7FFF',
  },
});
