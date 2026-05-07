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
  ActivityIndicator,
} from 'react-native';
import { X } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { ThemedText } from '@/common/components/themed-text';
import { Fonts } from '@/common/constants/theme';
import type { MobileAnnouncementDetail } from '../types';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface AnnouncementDetailSheetProps {
  visible: boolean;
  detail: MobileAnnouncementDetail | undefined;
  isLoading: boolean;
  onClose: () => void;
  onMarkRead: () => void;
}

export function AnnouncementDetailSheet({
  visible,
  detail,
  isLoading,
  onClose,
  onMarkRead,
}: AnnouncementDetailSheetProps) {
  const [shouldRender, setShouldRender] = useState(visible);
  const [isActionPressed, setIsActionPressed] = useState(false);
  const translateY = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      setIsActionPressed(false);
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
  }, [backdropOpacity, translateY, visible]);

  const handleMarkRead = () => {
    if (isActionPressed) return;

    setIsActionPressed(true);
    onClose();
    if (!detail?.read) {
      requestAnimationFrame(onMarkRead);
    }
  };

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

  const isImportant = detail?.priority === 'IMPORTANT';
  const categoryLabel = isImportant ? 'Important' : 'General';
  const categoryStyle = isImportant ? styles.importantBadge : styles.generalBadge;
  const categoryTextStyle = isImportant ? styles.importantBadgeText : styles.generalBadgeText;

  return (
    <Modal animationType="none" transparent visible={shouldRender} onRequestClose={onClose}>
      <View style={styles.modalContainer}>
        <Animated.View style={[styles.backdrop, { opacity: backdropOpacity }]}>
          <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        </Animated.View>

        <Animated.View style={[styles.sheet, { transform: [{ translateY }] }]}>
          <View {...panResponder.panHandlers} style={styles.dragHandleContainer}>
            <View style={styles.dragHandle} />
          </View>

          <View style={styles.header}>
            <ThemedText style={styles.headerTitle}>Announcement</ThemedText>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={24} color="#6A7282" />
            </TouchableOpacity>
          </View>

          {isLoading || !detail ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#2B7FFF" />
            </View>
          ) : (
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.scrollContent}
              bounces={false}
            >
              <View style={categoryStyle}>
                <ThemedText style={categoryTextStyle}>{categoryLabel}</ThemedText>
              </View>

              <ThemedText style={styles.title}>{detail.title}</ThemedText>

              <ThemedText style={styles.subtitle}>
                {new Date(detail.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </ThemedText>

              <View style={styles.bodyBox}>
                {detail.content.split('\n').map((paragraph, idx) =>
                  paragraph.trim() ? (
                    <ThemedText key={idx} style={styles.paragraph}>
                      {paragraph}
                    </ThemedText>
                  ) : (
                    <View key={idx} style={styles.paragraphSpacer} />
                  )
                )}
              </View>

              <TouchableOpacity
                onPress={handleMarkRead}
                disabled={isActionPressed}
                activeOpacity={0.8}
                style={styles.markReadButtonContainer}
              >
                <LinearGradient
                  colors={['#2B7FFF', '#00BBA7']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.markReadButton}
                >
                  <ThemedText style={styles.markReadButtonText}>Mark as read</ThemedText>
                </LinearGradient>
              </TouchableOpacity>
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
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  sheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 22,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    maxHeight: '85%',
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
    marginBottom: 16,
  },
  headerTitle: {
    fontFamily: Fonts.sf.bold,
    fontSize: 20,
    fontWeight: '700',
    color: '#1E2939',
  },
  closeButton: {
    padding: 4,
  },
  loadingContainer: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    paddingBottom: 24,
  },
  importantBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFE2E2',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginBottom: 26,
  },
  importantBadgeText: {
    fontFamily: Fonts.sf.semibold,
    fontSize: 11,
    color: '#D60000',
  },
  generalBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#DBEAFE',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginBottom: 26,
  },
  generalBadgeText: {
    fontFamily: Fonts.sf.semibold,
    fontSize: 11,
    color: '#2563EB',
  },
  title: {
    fontFamily: Fonts.sf.semibold,
    fontSize: 15,
    fontWeight: '600',
    color: '#1E2939',
    lineHeight: 22,
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: Fonts.sf.regular,
    fontSize: 13,
    color: '#6A7282',
    lineHeight: 18,
    marginBottom: 10,
  },
  bodyBox: {
    width: '100%',
    minHeight: 240,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  paragraph: {
    fontFamily: Fonts.sf.regular,
    fontSize: 16,
    lineHeight: 24,
    color: '#838383',
    marginBottom: 20,
  },
  paragraphSpacer: {
    height: 12,
  },
  markReadButtonContainer: {
    width: '100%',
    marginTop: 16,
    shadowColor: '#2B7FFF',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 4,
  },
  markReadButton: {
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  markReadButtonText: {
    color: '#FFFFFF',
    fontFamily: Fonts.sf.bold,
    fontSize: 17,
  },
});
