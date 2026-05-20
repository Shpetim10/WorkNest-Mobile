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
import { LogOut, Mail, Briefcase, MapPin, Lock, ChevronRight } from 'lucide-react-native';

import { ThemedText } from '@/common/components/themed-text';
import { BottomTabInset, Fonts, Spacing } from '@/common/constants/theme';
import { useProfileScreen } from '../hooks/use-profile-screen';

export function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { profile, isLoading, handleLogout, refetch } = useProfileScreen();

  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const headerHeight = insets.top + 320;

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

      {/* Underlapping ScrollView */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          { 
            paddingTop: headerHeight + Spacing.six,
            paddingBottom: BottomTabInset + Spacing.six
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
        {/* Change Password Card */}
        <TouchableOpacity style={styles.actionCard} activeOpacity={0.8}>
          <View style={styles.actionCardLeft}>
            <View style={[styles.iconBox, { backgroundColor: '#F0FDF4' }]}>
              <Lock size={20} color="#10B981" strokeWidth={2.2} />
            </View>
            <View style={styles.actionCardText}>
              <ThemedText style={styles.actionCardTitle}>Change Password</ThemedText>
              <ThemedText style={styles.actionCardSub}>Update your password</ThemedText>
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
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1.26,
    borderColor: 'rgba(229, 231, 235, 0.5)',
    paddingVertical: 20,
    paddingHorizontal: 20,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 4,
    marginBottom: 16,
    marginHorizontal: 20,
  },
  actionCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
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
    width: 44,
    height: 44,
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
    borderRadius: 20,
    paddingVertical: 18,
    gap: 10,
    marginBottom: 20,
    marginHorizontal: 20,
  },
  logoutButtonText: {
    color: '#EF4444',
    fontFamily: Fonts.sf.bold,
    fontWeight: '700',
    fontSize: 16,
  },
});
