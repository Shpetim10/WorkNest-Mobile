import React, { useMemo } from 'react';
import {
  ActivityIndicator,
  Modal,
  Platform,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { CameraView, type BarcodeScanningResult, useCameraPermissions } from 'expo-camera';

import { ThemedText } from '@/common/components/themed-text';
import { Fonts, Spacing } from '@/common/constants/theme';

interface QrScannerModalProps {
  visible: boolean;
  onCancel: () => void;
  onScanned: (token: string) => void;
}

export function QrScannerModal({ visible, onCancel, onScanned }: QrScannerModalProps) {
  const [permission, requestPermission] = useCameraPermissions();
  const [manualToken, setManualToken] = React.useState('');

  const canRenderCamera = useMemo(() => Platform.OS !== 'web', []);

  const handleBarCodeScanned = React.useCallback(
    (result: BarcodeScanningResult) => {
      const token = result.data?.trim();
      if (!token) {
        return;
      }
      onScanned(token);
    },
    [onScanned]
  );

  const onSubmitManualToken = React.useCallback(() => {
    const token = manualToken.trim();
    if (!token) {
      return;
    }
    setManualToken('');
    onScanned(token);
  }, [manualToken, onScanned]);

  return (
    <Modal animationType="slide" transparent visible={visible} onRequestClose={onCancel}>
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <ThemedText style={styles.title}>Scan Site QR</ThemedText>
          <ThemedText style={styles.subtitle}>
            Point your camera at the site QR code before continuing.
          </ThemedText>

          {!canRenderCamera ? (
            <View style={styles.manualContainer}>
              <ThemedText style={styles.manualLabel}>
                Camera scanning is unavailable on web. Paste the QR token to continue.
              </ThemedText>
              <TextInput
                style={styles.input}
                value={manualToken}
                onChangeText={setManualToken}
                autoCapitalize="none"
                autoCorrect={false}
                placeholder="Paste QR token"
                placeholderTextColor="#94A3B8"
              />
              <TouchableOpacity style={styles.primaryButton} onPress={onSubmitManualToken}>
                <ThemedText style={styles.primaryButtonText}>Use Token</ThemedText>
              </TouchableOpacity>
            </View>
          ) : !permission ? (
            <View style={styles.loaderContainer}>
              <ActivityIndicator size="small" color="#2B7FFF" />
              <ThemedText style={styles.permissionText}>Preparing camera…</ThemedText>
            </View>
          ) : !permission.granted ? (
            <View style={styles.permissionContainer}>
              <ThemedText style={styles.permissionText}>
                Camera permission is required to scan the attendance QR code.
              </ThemedText>
              <TouchableOpacity style={styles.primaryButton} onPress={requestPermission}>
                <ThemedText style={styles.primaryButtonText}>Allow Camera</ThemedText>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.cameraContainer}>
              <CameraView
                style={styles.camera}
                facing="back"
                barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
                onBarcodeScanned={handleBarCodeScanned}
              />
            </View>
          )}

          <TouchableOpacity style={styles.secondaryButton} onPress={onCancel}>
            <ThemedText style={styles.secondaryButtonText}>Cancel</ThemedText>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.58)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: Spacing.four,
    gap: Spacing.three,
  },
  title: {
    fontFamily: Fonts.sf.bold,
    fontSize: 21,
    color: '#0F172A',
  },
  subtitle: {
    fontFamily: Fonts.sf.regular,
    fontSize: 14,
    color: '#475569',
  },
  cameraContainer: {
    overflow: 'hidden',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  camera: {
    width: '100%',
    height: 280,
  },
  permissionContainer: {
    gap: Spacing.three,
    borderRadius: 16,
    padding: Spacing.four,
    backgroundColor: '#F8FAFC',
  },
  permissionText: {
    color: '#334155',
    fontFamily: Fonts.sf.regular,
  },
  primaryButton: {
    borderRadius: 12,
    backgroundColor: '#2563EB',
    paddingVertical: Spacing.two,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontFamily: Fonts.sf.bold,
    fontSize: 14,
  },
  secondaryButton: {
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    paddingVertical: Spacing.two,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#334155',
    fontFamily: Fonts.sf.semibold,
    fontSize: 14,
  },
  loaderContainer: {
    gap: Spacing.two,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 120,
  },
  manualContainer: {
    gap: Spacing.two,
  },
  manualLabel: {
    fontFamily: Fonts.sf.regular,
    color: '#334155',
  },
  input: {
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    color: '#0F172A',
    fontFamily: Fonts.sf.regular,
  },
});
