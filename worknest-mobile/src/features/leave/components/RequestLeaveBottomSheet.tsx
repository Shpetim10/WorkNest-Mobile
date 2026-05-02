import React, { useState, useRef, useEffect } from 'react';
import {
  Modal,
  StyleSheet,
  TouchableOpacity,
  View,
  TextInput,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StatusBar,
  Animated,
  PanResponder,
  Dimensions,
} from 'react-native';
import { Calendar, ChevronDown, X } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import DateTimePicker from '@react-native-community/datetimepicker';

import { ThemedText } from '@/common/components/themed-text';
import { Fonts, Spacing } from '@/common/constants/theme';
import { LeaveType } from '../types';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface RequestLeaveBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: () => Promise<void>;
  isSubmitting: boolean;
  form: {
    leaveType: LeaveType;
    setLeaveType: (type: LeaveType) => void;
    startDate: Date;
    setStartDate: (date: Date) => void;
    endDate: Date;
    setEndDate: (date: Date) => void;
    note: string;
    setNote: (note: string) => void;
  };
}

export function RequestLeaveBottomSheet({
  visible,
  onClose,
  onSubmit,
  isSubmitting,
  form,
}: RequestLeaveBottomSheetProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [shouldRender, setShouldRender] = useState(visible);

  const translateY = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;

  // Handle entry and exit animations manually for precise control
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

  const handleDismiss = () => {
    // Let the parent trigger the exit animation via the 'visible' prop
    onClose();
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return gestureState.dy > 5;
      },
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) {
          translateY.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 100 || gestureState.vy > 0.5) {
          handleDismiss();
        } else {
          Animated.spring(translateY, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  const leaveTypes: { label: string; value: LeaveType }[] = [
    { label: 'Vacation', value: 'vacation' },
    { label: 'Sick Leave', value: 'sick' },
    { label: 'Personal', value: 'personal' },
  ];

  const formatDate = (date: Date) => {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const handleStartDateChange = (event: any, selectedDate?: Date) => {
    setShowStartDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      form.setStartDate(selectedDate);
    }
  };

  const handleEndDateChange = (event: any, selectedDate?: Date) => {
    setShowEndDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      form.setEndDate(selectedDate);
    }
  };

  if (!shouldRender && !visible) return null;

  return (
    <Modal
      animationType="none"
      transparent={true}
      visible={shouldRender}
      onRequestClose={handleDismiss}
    >
      <View style={styles.modalContainer}>
        <StatusBar backgroundColor="rgba(0,0,0,0.4)" barStyle="light-content" />
        
        {/* Animated Backdrop (Fades independently) */}
        <Animated.View 
          style={[
            styles.backdrop, 
            { opacity: backdropOpacity }
          ]} 
        >
          <Pressable style={StyleSheet.absoluteFill} onPress={handleDismiss} />
        </Animated.View>
        
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.keyboardView}
        >
          <Animated.View 
            style={[
              styles.sheet,
              { transform: [{ translateY }] }
            ]}
          >
            <View {...panResponder.panHandlers} style={styles.dragHandleContainer}>
              <View style={styles.dragHandle} />
            </View>

            <View style={styles.header}>
              <ThemedText style={styles.title}>Request Leave</ThemedText>
              <TouchableOpacity onPress={handleDismiss} style={styles.closeButton}>
                <X size={24} color="#6A7282" />
              </TouchableOpacity>
            </View>

            <ScrollView 
              showsVerticalScrollIndicator={false} 
              contentContainerStyle={styles.scrollContent}
              keyboardShouldPersistTaps="handled"
              bounces={false}
            >
              <View style={styles.content}>
                {/* Leave Type Dropdown */}
                <View style={[styles.field, { zIndex: 100 }]}>
                  <ThemedText style={styles.label}>Leave Type</ThemedText>
                  <TouchableOpacity 
                    style={styles.dropdownTrigger}
                    onPress={() => setIsDropdownOpen(!isDropdownOpen)}
                    activeOpacity={0.7}
                  >
                    <ThemedText style={styles.dropdownValue}>
                      {leaveTypes.find(t => t.value === form.leaveType)?.label || 'Select Type'}
                    </ThemedText>
                    <ChevronDown size={20} color="#64748B" />
                  </TouchableOpacity>

                  {isDropdownOpen && (
                    <View style={styles.dropdownList}>
                      {leaveTypes.map((type) => (
                        <TouchableOpacity
                          key={type.value}
                          style={styles.dropdownItem}
                          onPress={() => {
                            form.setLeaveType(type.value);
                            setIsDropdownOpen(false);
                          }}
                        >
                          <ThemedText style={[
                            styles.dropdownItemText,
                            form.leaveType === type.value && styles.dropdownItemTextSelected
                          ]}>
                            {type.label}
                          </ThemedText>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </View>

                {/* Dates */}
                <View style={styles.dateRow}>
                  <View style={[styles.field, { flex: 1 }]}>
                    <ThemedText style={styles.label}>Start Date</ThemedText>
                    <TouchableOpacity 
                      style={styles.dateInput}
                      onPress={() => setShowStartDatePicker(true)}
                      activeOpacity={0.7}
                    >
                      <ThemedText style={styles.dateInputText}>
                        {formatDate(form.startDate)}
                      </ThemedText>
                      <Calendar size={18} color="#64748B" />
                    </TouchableOpacity>
                  </View>
                  <View style={[styles.field, { flex: 1 }]}>
                    <ThemedText style={styles.label}>End Date</ThemedText>
                    <TouchableOpacity 
                      style={styles.dateInput}
                      onPress={() => setShowEndDatePicker(true)}
                      activeOpacity={0.7}
                    >
                      <ThemedText style={styles.dateInputText}>
                        {formatDate(form.endDate)}
                      </ThemedText>
                      <Calendar size={18} color="#64748B" />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Note field */}
                <View style={styles.field}>
                  <ThemedText style={styles.label}>Note (Optional)</ThemedText>
                  <TextInput
                    style={styles.textArea}
                    placeholder="Add a note..."
                    placeholderTextColor="#94A3B8"
                    multiline
                    numberOfLines={4}
                    value={form.note}
                    onChangeText={form.setNote}
                  />
                </View>

                {/* Submit Button */}
                <TouchableOpacity
                  onPress={onSubmit}
                  disabled={isSubmitting}
                  activeOpacity={0.8}
                  style={styles.submitButtonContainer}
                >
                  <LinearGradient
                    colors={['#2B7FFF', '#00BBA7']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.submitButton}
                  >
                    {isSubmitting ? (
                      <ActivityIndicator color="#FFFFFF" />
                    ) : (
                      <ThemedText style={styles.submitButtonText}>Submit Request</ThemedText>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </ScrollView>

            {showStartDatePicker && (
              <DateTimePicker
                value={form.startDate}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={handleStartDateChange}
              />
            )}
            {showEndDatePicker && (
              <DateTimePicker
                value={form.endDate}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={handleEndDateChange}
              />
            )}
          </Animated.View>
        </KeyboardAvoidingView>
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
  keyboardView: {
    width: '100%',
    justifyContent: 'flex-end',
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
    paddingBottom: 16, // Spacing between handle and title
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
    marginBottom: Spacing.six,
  },
  title: {
    fontFamily: Fonts.sf.bold,
    fontSize: 24,
    fontWeight: '700',
    color: '#1E2939',
    textAlign: 'left',
  },
  closeButton: {
    padding: 4,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  content: {
    width: '100%',
  },
  field: {
    width: '100%',
    marginBottom: Spacing.four,
    gap: 8,
  },
  label: {
    fontFamily: Fonts.sf.semibold,
    fontSize: 14,
    color: '#64748B',
    textAlign: 'left',
  },
  dropdownTrigger: {
    width: '100%',
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    paddingHorizontal: 16,
    backgroundColor: '#F8FAFC',
  },
  dropdownValue: {
    fontFamily: Fonts.sf.regular,
    fontSize: 16,
    color: '#1E293B',
  },
  dropdownList: {
    position: 'absolute',
    top: 85,
    left: 0,
    right: 0,
    zIndex: 1000,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  dropdownItem: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  dropdownItemText: {
    fontFamily: Fonts.sf.regular,
    fontSize: 15,
    color: '#475569',
  },
  dropdownItemTextSelected: {
    fontFamily: Fonts.sf.bold,
    color: '#2B7FFF',
  },
  dateRow: {
    flexDirection: 'row',
    width: '100%',
    gap: 12,
    marginBottom: Spacing.four,
  },
  dateInput: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    paddingHorizontal: 14,
    height: 56,
    backgroundColor: '#F8FAFC',
  },
  dateInputText: {
    fontFamily: Fonts.sf.regular,
    fontSize: 15,
    color: '#1E293B',
  },
  textArea: {
    width: '100%',
    height: 110,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#F8FAFC',
    textAlignVertical: 'top',
    fontFamily: Fonts.sf.regular,
    fontSize: 15,
    color: '#1E293B',
  },
  submitButtonContainer: {
    width: '100%',
    marginTop: Spacing.four,
    shadowColor: '#BEDBFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.6,
    shadowRadius: 10,
    elevation: 4,
  },
  submitButton: {
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontFamily: Fonts.sf.bold,
    fontSize: 18,
  },
});
