import React from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ChevronLeft, Lock, ReceiptText } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/common/components/themed-text';
import { ThemedView } from '@/common/components/themed-view';
import { Fonts } from '@/common/constants/theme';
import { PayrollDetailsModal } from '../components/PayrollDetailsModal';
import { PayslipCard } from '../components/PayslipCard';
import { usePayrollScreen } from '../hooks/use-payroll-screen';

function getQueryErrorMessage(error: unknown): string | null {
  if (!error || typeof error !== 'object') return null;
  if ('message' in error && typeof error.message === 'string') return error.message;
  return null;
}

interface PayslipsScreenProps {
  isTab?: boolean;
}

export function PayslipsScreen({ isTab = false }: PayslipsScreenProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const {
    periods,
    isFoundationPlan,
    isModalVisible,
    selectedPeriod,
    selectedPayroll,
    isPayrollLoading,
    isPayrollFetching,
    payrollError,
    isDownloading,
    openModal,
    closeModal,
    refetchPayroll,
    downloadPayslip,
  } = usePayrollScreen();

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        bounces={false}
      >
        <View style={styles.headerWrapper}>
          <LinearGradient
            colors={['#2B7FFF', '#00BBA7']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.header, { paddingTop: insets.top + 20 }]}
          >
            <View style={styles.headerRow}>
              {!isTab ? (
                <TouchableOpacity
                  onPress={() => router.back()}
                  style={styles.backButton}
                  activeOpacity={0.7}
                >
                  <ChevronLeft size={26} color="#FFFFFF" strokeWidth={2.5} />
                </TouchableOpacity>
              ) : null}
              <ThemedText style={styles.headerTitle}>My Payroll</ThemedText>
            </View>

            <View style={styles.headerCopy}>
              <ReceiptText size={18} color="#E0F2FE" strokeWidth={2.2} />
              <ThemedText style={styles.headerText}>
                View your monthly payroll breakdown. Figures come directly from the payroll backend
                and cannot be modified here.
              </ThemedText>
            </View>
          </LinearGradient>
        </View>

        <View style={[styles.content, isTab && styles.contentTab]}>
          {isFoundationPlan ? (
            <View style={styles.upgradeContainer}>
              <Lock size={36} color="#94A3B8" strokeWidth={1.5} />
              <ThemedText style={styles.upgradeTitle}>Payroll not included</ThemedText>
              <ThemedText style={styles.upgradeText}>
                Payroll is available on Growth and Professional plans. Upgrade at worknest.com.
              </ThemedText>
            </View>
          ) : (
            <>
              <View style={styles.introCard}>
                <ThemedText style={styles.introTitle}>Select a payroll period</ThemedText>
                <ThemedText style={styles.introText}>
                  Tap any month to view the full breakdown and download your PDF payslip. Locked
                  states (Approved, Finalized, Paid) are read-only snapshots.
                </ThemedText>
              </View>

              {periods.map((period) => (
                <PayslipCard
                  key={period.key}
                  period={period}
                  onPress={() => openModal({ year: period.year, month: period.month })}
                />
              ))}
            </>
          )}
        </View>
      </ScrollView>

      {!isFoundationPlan ? (
        <PayrollDetailsModal
          visible={isModalVisible}
          period={selectedPeriod}
          payroll={selectedPayroll}
          isLoading={isPayrollLoading}
          isRefreshing={isPayrollFetching && !isPayrollLoading}
          isDownloading={isDownloading}
          errorMessage={getQueryErrorMessage(payrollError)}
          onClose={closeModal}
          onRetry={refetchPayroll}
          onDownload={downloadPayslip}
        />
      ) : null}
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
    paddingBottom: 120,
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
    minHeight: 200,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    paddingHorizontal: 24,
    paddingBottom: 28,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButton: {
    position: 'absolute',
    left: 0,
    padding: 4,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontFamily: Fonts.sf.bold,
    fontWeight: '700',
    fontSize: 24,
    textAlign: 'center',
  },
  headerCopy: {
    marginTop: 20,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    paddingRight: 8,
  },
  headerText: {
    flex: 1,
    color: '#E0F2FE',
    fontFamily: Fonts.sf.regular,
    fontSize: 14,
    lineHeight: 20,
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
  contentTab: {
    paddingBottom: 12,
  },
  introCard: {
    backgroundColor: '#EFF6FF',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#BFDBFE',
    marginBottom: 16,
  },
  introTitle: {
    fontFamily: Fonts.sf.bold,
    fontSize: 15,
    color: '#1E40AF',
    marginBottom: 6,
  },
  introText: {
    fontFamily: Fonts.sf.regular,
    fontSize: 13,
    color: '#3B82F6',
    lineHeight: 19,
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
