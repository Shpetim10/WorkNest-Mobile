import React from 'react';
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
import { LogOut, Mail, User } from 'lucide-react-native';

import { ThemedText } from '@/common/components/themed-text';
import { BottomTabInset, Fonts, Spacing } from '@/common/constants/theme';
import { useProfileScreen } from '../hooks/use-profile-screen';

export function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { profile, isLoading, handleLogout, refetch } = useProfileScreen();

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
      <View style={[styles.headerWrapper, { height: headerHeight }]}>
        <LinearGradient
          colors={['#2B7FFF', '#00BBA7']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.headerGradient, { paddingTop: insets.top + 28 }]}
        >
          <View style={styles.headerRow}>
            <ThemedText style={styles.headerTitle}>My Profile</ThemedText>
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
            refreshing={false}
            onRefresh={refetch}
            tintColor="#2B7FFF"
            colors={['#2B7FFF']}
          />
        }
      >
        {/* Profile Card */}
        <View style={styles.profileCard}>
          {/* Avatar Container */}
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
              <View style={styles.activeDot} />
            </View>
          </View>

          {/* Details Section */}
          <View style={styles.detailsSection}>
            <View style={styles.detailItem}>
              <View style={styles.iconBox}>
                <User size={20} color="#2B7FFF" strokeWidth={2.2} />
              </View>
              <View style={styles.textContainer}>
                <ThemedText style={styles.labelSmall}>Full Name</ThemedText>
                <ThemedText style={styles.valueMedium}>
                  {profile.fullName || 'Sarah'}
                </ThemedText>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.detailItem}>
              <View style={styles.iconBox}>
                <Mail size={20} color="#00BBA7" strokeWidth={2.2} />
              </View>
              <View style={styles.textContainer}>
                <ThemedText style={styles.labelSmall}>Email Address</ThemedText>
                <ThemedText style={styles.valueMedium} numberOfLines={1}>
                  {profile.email}
                </ThemedText>
              </View>
            </View>
          </View>
        </View>

        {/* Logout Button Section */}
        <TouchableOpacity
          style={styles.logoutButton}
          activeOpacity={0.8}
          onPress={handleLogout}
        >
          <LogOut size={20} color="#FFFFFF" strokeWidth={2.2} />
          <ThemedText style={styles.logoutButtonText}>Log Out</ThemedText>
        </TouchableOpacity>
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
    justifyContent: 'center',
  },
  headerRow: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  headerTitle: {
    color: '#FFFFFF',
    fontFamily: Fonts.sf.bold,
    fontWeight: '700',
    fontSize: 24,
    lineHeight: 30,
    textAlign: 'center',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 28,
  },
  profileCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    borderWidth: 1.26,
    borderColor: 'rgba(229, 231, 235, 0.5)',
    paddingVertical: 28,
    paddingHorizontal: 24,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 4,
    marginBottom: 24,
    alignItems: 'center',
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 28,
  },
  avatarContainer: {
    position: 'relative',
    width: 100,
    height: 100,
    borderRadius: 50,
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
    borderRadius: 50,
  },
  initialsContainer: {
    width: '100%',
    height: '100%',
    borderRadius: 50,
    backgroundColor: '#2B7FFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  initialsText: {
    fontFamily: Fonts.sf.bold,
    fontWeight: '700',
    fontSize: 32,
    color: '#FFFFFF',
  },
  activeDot: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#22C55E',
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  detailsSection: {
    width: '100%',
    gap: 16,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
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
    fontSize: 16,
    color: '#1E2939',
    marginTop: 2,
  },
  divider: {
    height: 1.2,
    backgroundColor: '#F1F5F9',
    marginVertical: 4,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EF4444',
    borderRadius: 16,
    paddingVertical: 16,
    gap: 10,
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.22,
    shadowRadius: 10,
    elevation: 4,
  },
  logoutButtonText: {
    color: '#FFFFFF',
    fontFamily: Fonts.sf.bold,
    fontWeight: '700',
    fontSize: 16,
  },
});
