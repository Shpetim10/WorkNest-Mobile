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

  const isImportant = detail?.priority === 'IMPORTANT';

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
              <ActivityIndicator size="large" color="#7C3AED" />
            </View>
          ) : (
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.scrollContent}
              bounces={false}
            >
              {isImportant && (
                <View style={styles.importantBadge}>
                  <ThemedText style={styles.importantBadgeText}>Important</ThemedText>
                </View>
              )}

              <ThemedText style={styles.title}>{detail.title}</ThemedText>

              <ThemedText style={styles.meta}>
                {new Date(detail.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </ThemedText>

              <View style={styles.divider} />

              {detail.content.split('\n').map((paragraph, idx) =>
                paragraph.trim() ? (
                  <ThemedText key={idx} style={styles.paragraph}>
                    {paragraph}
                  </ThemedText>
                ) : (
                  <View key={idx} style={styles.paragraphSpacer} />
                )
              )}

              {!detail.read && (
                <TouchableOpacity
                  onPress={onMarkRead}
                  activeOpacity={0.8}
                  style={styles.markReadButtonContainer}
                >
                  <LinearGradient
                    colors={['#7C3AED', '#2B7FFF']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.markReadButton}
                  >
                    <ThemedText style={styles.markReadButtonText}>Mark as read</ThemedText>
                  </LinearGradient>
                </TouchableOpacity>
              )}
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
    backgroundColor: '#FEE2E2',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginBottom: 12,
  },
  importantBadgeText: {
    fontFamily: Fonts.sf.semibold,
    fontSize: 12,
    color: '#B91C1C',
  },
  title: {
    fontFamily: Fonts.sf.bold,
    fontSize: 22,
    fontWeight: '700',
    color: '#1E2939',
    lineHeight: 30,
    marginBottom: 6,
  },
  meta: {
    fontFamily: Fonts.sf.regular,
    fontSize: 13,
    color: '#94A3B8',
    marginBottom: 16,
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginBottom: 16,
  },
  paragraph: {
    fontFamily: Fonts.sf.regular,
    fontSize: 15,
    lineHeight: 24,
    color: '#374151',
    marginBottom: 12,
  },
  paragraphSpacer: {
    height: 8,
  },
  markReadButtonContainer: {
    marginTop: 24,
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 4,
  },
  markReadButton: {
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  markReadButtonText: {
    color: '#FFFFFF',
    fontFamily: Fonts.sf.bold,
    fontSize: 16,
  },
});