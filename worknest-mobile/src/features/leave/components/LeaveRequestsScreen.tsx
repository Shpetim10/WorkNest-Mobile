import React from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, View } from 'react-native';

import { ThemedView } from '@/common/components/themed-view';
import { Spacing } from '@/common/constants/theme';
import { LeaveRequestsHeader } from './LeaveRequestsHeader';
import { LeaveBalanceSection } from './LeaveBalanceSection';
import { LeaveRequestHistory } from './LeaveRequestHistory';
import { RequestLeaveBottomSheet } from './RequestLeaveBottomSheet';
import { useLeaveScreen } from '../hooks/use-leave-screen';

export function LeaveRequestsScreen() {
  const {
    balances,
    history,
    isLoading,
    isModalVisible,
    openModal,
    closeModal,
    form,
  } = useLeaveScreen();

  return (
    <ThemedView style={styles.container}>
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        bounces={false}
      >
        <LeaveRequestsHeader onAddPress={openModal} />
        
        {/* Content Container - FULL WIDTH as requested */}
        <View style={styles.content}>
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#2B7FFF" />
            </View>
          ) : (
            <>
              <LeaveBalanceSection balances={balances} />
              <LeaveRequestHistory history={history} />
            </>
          )}
        </View>
      </ScrollView>

      <RequestLeaveBottomSheet
        visible={isModalVisible}
        onClose={closeModal}
        onSubmit={form.submitRequest}
        isSubmitting={form.isSubmitting}
        form={form}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 100,
  },
  content: {
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    marginTop: -58, // Reduced overlap for better balance
    paddingTop: 24,
    flex: 1,
    minHeight: 600,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    zIndex: 20,
    // Shadow for depth
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 5,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 100,
  },
});
