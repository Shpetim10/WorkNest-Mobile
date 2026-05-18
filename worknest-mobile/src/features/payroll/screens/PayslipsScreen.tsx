import React from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ChevronLeft, Lock } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/common/components/themed-text';
import { ThemedView } from '@/common/components/themed-view';
import { Fonts } from '@/common/constants/theme';
import { useAppSelector } from '@/common/store/hooks';
import { PayslipCard } from '../components/PayslipCard';
import { PayrollDetailsModal } from '../components/PayrollDetailsModal';
import { usePayrollScreen } from '../hooks/use-payroll-screen';

export function PayslipsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { payslips, isModalVisible, selectedPayslip, openModal, closeModal } = usePayrollScreen();
  const subscription = useAppSelector((state) => state.subscription.subscription);
  const isFoundationPlan = subscription?.plan === 'FOUNDATION';

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        bounces={false}
      >
        {/* Gradient header */}
        <View style={styles.headerWrapper}>
          <LinearGradient
            colors={['#2B7FFF', '#00BBA7']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.header, { paddingTop: insets.top + 20 }]}
          >
            <View style={styles.headerRow}>
              <TouchableOpacity
                onPress={() => router.back()}
                style={styles.backButton}
                activeOpacity={0.7}
              >
                <ChevronLeft size={26} color="#FFFFFF" strokeWidth={2.5} />
              </TouchableOpacity>
              <ThemedText style={styles.headerTitle}>Payroll</ThemedText>
            </View>
          </LinearGradient>
        </View>

        <View style={styles.content}>
          {isFoundationPlan ? (
            <View style={styles.upgradeContainer}>
              <Lock size={36} color="#94A3B8" strokeWidth={1.5} />
              <ThemedText style={styles.upgradeTitle}>Payroll Not Included</ThemedText>
              <ThemedText style={styles.upgradeText}>
                Payroll is available on Growth and Professional plans. Upgrade at worknest.com.
              </ThemedText>
            </View>
          ) : (
            payslips.map((payslip) => (
              <PayslipCard
                key={payslip.id}
                payslip={payslip}
                onPress={() => openModal(payslip.id)}
              />
            ))
          )}
        </View>
      </ScrollView>

      {!isFoundationPlan && (
        <PayrollDetailsModal
          visible={isModalVisible}
          payslip={selectedPayslip}
          onClose={closeModal}
        />
      )}
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
    paddingBottom: 40,
  },
  headerWrapper: {
    shadowColor: '#2B7FFF',
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    zIndex: 10,
  },
  header: {
    height: 185,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    paddingHorizontal: 24,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 8,
    padding: 4,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontFamily: Fonts.sf.bold,
    fontWeight: '700',
    fontSize: 24,
  },
  content: {
    backgroundColor: '#FFFFFF',
    marginTop: -58,
    paddingTop: 24,
    paddingHorizontal: 20,
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
  },
  upgradeContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
    paddingHorizontal: 24,
    gap: 12,
  },
  upgradeTitle: {
    fontFamily: Fonts.sf.semibold,
    fontSize: 17,
    color: '#1E2939',
    textAlign: 'center',
  },
  upgradeText: {
    fontFamily: Fonts.sf.regular,
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 21,
  },
});
