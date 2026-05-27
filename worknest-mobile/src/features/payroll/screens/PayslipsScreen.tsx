import React, { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View, RefreshControl } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, Lock } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/common/components/themed-text';
import { ThemedView } from '@/common/components/themed-view';
import { Fonts } from '@/common/constants/theme';
import { useLocalization } from '@/common/localization';
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
  const { t } = useLocalization();
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

  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      if (refetchPayroll) await refetchPayroll();
    } catch (e) {
      // ignore
    } finally {
      setRefreshing(false);
    }
  }, [refetchPayroll]);

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#2B7FFF"
            colors={['#2B7FFF']}
          />
        }
      >
        <View style={styles.headerWrapper}>
          <LinearGradient
            colors={['#2B7FFF', '#00BBA7']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.header, { paddingTop: insets.top + 20 }]}
          >
            <View style={styles.headerRow}>
              <TouchableOpacity style={styles.backButton} onPress={() => router.back()} activeOpacity={0.7}>
                <ArrowLeft size={24} color="#FFFFFF" />
              </TouchableOpacity>
              <View style={styles.titleContainer}>
                <ThemedText style={styles.headerTitle}>{t('payroll.title')}</ThemedText>
              </View>
            </View>
          </LinearGradient>
        </View>

        <View style={[styles.content, isTab && styles.contentTab]}>
          {isFoundationPlan ? (
            <View style={styles.upgradeContainer}>
              <Lock size={36} color="#94A3B8" strokeWidth={1.5} />
              <ThemedText style={styles.upgradeTitle}>{t('payroll.notIncluded')}</ThemedText>
              <ThemedText style={styles.upgradeText}>
                {t('payroll.upgradeText')}
              </ThemedText>
            </View>
          ) : (
            <>
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
    height: 185,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    paddingHorizontal: 32,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  titleContainer: {
    flex: 1,
  },
  backButton: {
    width: 48,
    height: 48,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.35)',
    backgroundColor: 'rgba(255,255,255,0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontFamily: Fonts.sf.bold,
    fontWeight: '700',
    fontSize: 24,
  },
  content: {
    backgroundColor: 'rgba(255,255,255,0.92)',
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
