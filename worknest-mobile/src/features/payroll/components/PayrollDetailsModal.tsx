import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Modal,
  PanResponder,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { X } from 'lucide-react-native';

import { ThemedText } from '@/common/components/themed-text';
import { Fonts } from '@/common/constants/theme';
import type { Payslip } from '../types/payroll.types';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface PayrollDetailsModalProps {
  visible: boolean;
  payslip: Payslip | null;
  onClose: () => void;
}

function formatCurrency(amount: number): string {
  return `$${amount.toLocaleString('en-US')}`;
}

export function PayrollDetailsModal({ visible, payslip, onClose }: PayrollDetailsModalProps) {
  const [shouldRender, setShouldRender] = useState(visible);
  const translateY = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      setShouldRender(true);
      Animated.parallel([
        Animated.timing(backdropOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(translateY, {
          toValue: 0,
          tension: 50,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(backdropOpacity, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: SCREEN_HEIGHT,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start(() => setShouldRender(false));
    }
  }, [visible]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gs) => gs.dy > 5,
      onPanResponderMove: (_, gs) => {
        if (gs.dy > 0) translateY.setValue(gs.dy);
      },
      onPanResponderRelease: (_, gs) => {
        if (gs.dy > 100 || gs.vy > 0.5) {
          onClose();
        } else {
          Animated.spring(translateY, { toValue: 0, useNativeDriver: true }).start();
        }
      },
    })
  ).current;

  if (!shouldRender && !visible) return null;

  return (
    <Modal
      animationType="none"
      transparent
      visible={shouldRender}
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <Animated.View style={[styles.backdrop, { opacity: backdropOpacity }]}>
          <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        </Animated.View>

        <Animated.View style={[styles.sheet, { transform: [{ translateY }] }]}>
          <View {...panResponder.panHandlers} style={styles.dragHandleContainer}>
            <View style={styles.dragHandle} />
          </View>

          <View style={styles.header}>
            <ThemedText style={styles.headerTitle}>Payroll Details</ThemedText>
            <TouchableOpacity onPress={onClose} style={styles.closeButton} activeOpacity={0.7}>
              <X size={22} color="#6A7282" />
            </TouchableOpacity>
          </View>

          {payslip && (
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.scrollContent}
              bounces={false}
            >
              {/* Period card */}
              <View style={styles.periodCard}>
                <ThemedText style={styles.periodCardName}>{payslip.periodName}</ThemedText>
                <ThemedText style={styles.periodCardDate}>{payslip.periodDate}</ThemedText>
              </View>

              {/* Net Salary card */}
              <View style={styles.netSalaryCard}>
                <ThemedText style={styles.netSalaryLabel}>Net Salary</ThemedText>
                <ThemedText style={styles.netSalaryAmount}>{formatCurrency(payslip.netSalary)}</ThemedText>
              </View>

              {/* Earnings section */}
              <ThemedText style={styles.sectionTitle}>Earnings</ThemedText>
              <View style={styles.section}>
                <View style={styles.row}>
                  <ThemedText style={styles.rowLabel}>Basic Salary</ThemedText>
                  <ThemedText style={styles.rowValue}>{formatCurrency(payslip.earnings.basicSalary)}</ThemedText>
                </View>
                <View style={styles.row}>
                  <ThemedText style={styles.rowLabel}>Allowances</ThemedText>
                  <ThemedText style={styles.rowValue}>{formatCurrency(payslip.earnings.allowances)}</ThemedText>
                </View>
                <View style={styles.row}>
                  <ThemedText style={styles.rowLabel}>Bonus</ThemedText>
                  <ThemedText style={styles.rowValue}>{formatCurrency(payslip.earnings.bonus)}</ThemedText>
                </View>
                <View style={styles.sectionDivider} />
                <View style={styles.row}>
                  <ThemedText style={styles.totalLabel}>Gross Salary</ThemedText>
                  <ThemedText style={styles.totalValue}>{formatCurrency(payslip.grossSalary)}</ThemedText>
                </View>
              </View>

              {/* Deductions section */}
              <ThemedText style={[styles.sectionTitle, styles.sectionTitleSpaced]}>Deductions</ThemedText>
              <View style={styles.section}>
                <View style={styles.row}>
                  <ThemedText style={styles.rowLabel}>Tax</ThemedText>
                  <ThemedText style={styles.deductionValue}>-{formatCurrency(payslip.deductions.tax)}</ThemedText>
                </View>
                <View style={styles.row}>
                  <ThemedText style={styles.rowLabel}>Insurance</ThemedText>
                  <ThemedText style={styles.deductionValue}>-{formatCurrency(payslip.deductions.insurance)}</ThemedText>
                </View>
                <View style={styles.row}>
                  <ThemedText style={styles.rowLabel}>Other</ThemedText>
                  <ThemedText style={styles.deductionValue}>-{formatCurrency(payslip.deductions.other)}</ThemedText>
                </View>
                <View style={styles.sectionDivider} />
                <View style={styles.row}>
                  <ThemedText style={styles.totalDeductionLabel}>Total Deductions</ThemedText>
                  <ThemedText style={styles.totalDeductionValue}>{formatCurrency(payslip.totalDeductions)}</ThemedText>
                </View>
              </View>
            </ScrollView>
          )}
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  sheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 22,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    width: '100%',
    maxHeight: '90%',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  dragHandleContainer: {
    width: '100%',
    paddingTop: 12,
    paddingBottom: 16,
    alignItems: 'center',
  },
  dragHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#E2E8F0',
    borderRadius: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerTitle: {
    fontFamily: Fonts.sf.bold,
    fontSize: 22,
    fontWeight: '700',
    color: '#1E2939',
  },
  closeButton: {
    padding: 4,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  periodCard: {
    backgroundColor: '#EFF6FF',
    borderRadius: 16,
    paddingHorizontal: 18,
    paddingVertical: 16,
    marginBottom: 12,
  },
  periodCardName: {
    fontFamily: Fonts.sf.bold,
    fontSize: 16,
    fontWeight: '700',
    color: '#1E2939',
    marginBottom: 4,
  },
  periodCardDate: {
    fontFamily: Fonts.sf.regular,
    fontSize: 13,
    color: '#6A7282',
  },
  netSalaryCard: {
    backgroundColor: '#F0FDF4',
    borderRadius: 16,
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 22,
    marginBottom: 24,
  },
  netSalaryLabel: {
    fontFamily: Fonts.sf.regular,
    fontSize: 13,
    color: '#6A7282',
    marginBottom: 6,
  },
  netSalaryAmount: {
    fontFamily: Fonts.sf.bold,
    fontSize: 32,
    fontWeight: '700',
    lineHeight: 40,
    color: '#1E2939',
  },
  sectionTitle: {
    fontFamily: Fonts.sf.bold,
    fontSize: 15,
    fontWeight: '700',
    color: '#1E2939',
    marginBottom: 12,
  },
  sectionTitleSpaced: {
    marginTop: 20,
  },
  section: {
    gap: 14,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rowLabel: {
    fontFamily: Fonts.sf.regular,
    fontSize: 14,
    color: '#1E2939',
  },
  rowValue: {
    fontFamily: Fonts.sf.semibold,
    fontSize: 14,
    color: '#1E2939',
  },
  deductionValue: {
    fontFamily: Fonts.sf.semibold,
    fontSize: 14,
    color: '#B91C1C',
  },
  sectionDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
  },
  totalLabel: {
    fontFamily: Fonts.sf.bold,
    fontSize: 14,
    fontWeight: '700',
    color: '#1E2939',
  },
  totalValue: {
    fontFamily: Fonts.sf.bold,
    fontSize: 14,
    fontWeight: '700',
    color: '#1E2939',
  },
  totalDeductionLabel: {
    fontFamily: Fonts.sf.bold,
    fontSize: 14,
    fontWeight: '700',
    color: '#B91C1C',
  },
  totalDeductionValue: {
    fontFamily: Fonts.sf.bold,
    fontSize: 14,
    fontWeight: '700',
    color: '#B91C1C',
  },
});
