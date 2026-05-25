import React, { useMemo } from 'react';
import {
  ActivityIndicator,
  Modal,
  Platform,
  SafeAreaView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { CameraView, type BarcodeScanningResult, useCameraPermissions } from 'expo-camera';
import { LinearGradient } from 'expo-linear-gradient';
import { X, QrCode, AlertCircle } from 'lucide-react-native';

import { ThemedText } from '@/common/components/themed-text';
import { Fonts, Spacing } from '@/common/constants/theme';
import { useLocalization } from '@/common/localization';

interface QrScannerModalProps {
  visible: boolean;
  onCancel: () => void;
  onScanned: (token: string) => void;
  errorMessage?: string | null;
}

export function QrScannerModal({ visible, onCancel, onScanned, errorMessage }: QrScannerModalProps) {
  const { t } = useLocalization();
  const [permission, requestPermission] = useCameraPermissions();
  const [manualToken, setManualToken] = React.useState('');
  const [scanned, setScanned] = React.useState(false);

  const canRenderCamera = useMemo(() => Platform.OS !== 'web', []);

  React.useEffect(() => {
    if (visible) {
      setScanned(false);
      setManualToken('');
    }
  }, [visible]);

  const handleBarCodeScanned = React.useCallback(
    (result: BarcodeScanningResult) => {
      if (scanned) return;
      const token = result.data?.trim();
      if (!token) return;
      setScanned(true);
      onScanned(token);
    },
    [scanned, onScanned]
  );

  const onSubmitManualToken = React.useCallback(() => {
    const token = manualToken.trim();
    if (!token) return;
    setManualToken('');
    onScanned(token);
  }, [manualToken, onScanned]);

  return (
    <Modal animationType="slide" transparent={false} visible={visible} onRequestClose={onCancel}>
      <SafeAreaView style={styles.container}>
        {/* Header — matches AttendanceHeader gradient */}
        <LinearGradient
          colors={['#2B7FFF', '#00BBA7']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.header}
        >
          <View style={styles.headerContent}>
            <QrCode size={22} color="#FFFFFF" strokeWidth={2} />
            <View style={styles.headerTextGroup}>
              <ThemedText style={styles.headerTitle}>{t('attendance.scanSiteQr')}</ThemedText>
              <ThemedText style={styles.headerSubtitle}>
                {t('attendance.scanSiteQrHint')}
              </ThemedText>
            </View>
            <TouchableOpacity style={styles.closeButton} onPress={onCancel} hitSlop={12}>
              <X size={18} color="#FFFFFF" strokeWidth={2.5} />
            </TouchableOpacity>
          </View>
        </LinearGradient>

        {/* Error banner */}
        {errorMessage ? (
          <View style={styles.errorBanner}>
            <AlertCircle size={16} color="#DC2626" strokeWidth={2} />
            <ThemedText style={styles.errorBannerText}>{errorMessage}</ThemedText>
          </View>
        ) : null}

        {/* Camera / fallback */}
        <View style={styles.cameraSection}>
          {!canRenderCamera ? (
            <View style={styles.manualContainer}>
              <ThemedText style={styles.manualLabel}>
                {t('attendance.webQrUnavailable')}
              </ThemedText>
              <TextInput
                style={styles.input}
                value={manualToken}
                onChangeText={setManualToken}
                autoCapitalize="none"
                autoCorrect={false}
                placeholder={t('attendance.pasteQrToken')}
                placeholderTextColor="#94A3B8"
              />
              <TouchableOpacity style={styles.primaryButton} onPress={onSubmitManualToken}>
                <ThemedText style={styles.primaryButtonText}>{t('attendance.useToken')}</ThemedText>
              </TouchableOpacity>
            </View>
          ) : !permission ? (
            <View style={styles.centeredState}>
              <ActivityIndicator size="large" color="#2B7FFF" />
              <ThemedText style={styles.stateText}>{t('attendance.preparingCamera')}</ThemedText>
            </View>
          ) : !permission.granted ? (
            <View style={styles.centeredState}>
              <QrCode size={48} color="#CBD5E1" strokeWidth={1.5} />
              <ThemedText style={styles.stateText}>
                {t('attendance.cameraPermission')}
              </ThemedText>
              <TouchableOpacity style={styles.primaryButton} onPress={requestPermission}>
                <ThemedText style={styles.primaryButtonText}>{t('attendance.allowCamera')}</ThemedText>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.cameraWrapper}>
              <CameraView
                style={styles.camera}
                facing="back"
                barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
                onBarcodeScanned={handleBarCodeScanned}
              >
                <View style={styles.scanOverlay}>
                  <View style={styles.scanFrame} />
                  <ThemedText style={styles.scanHint}>
                    {t('attendance.alignQr')}
                  </ThemedText>
                </View>
              </CameraView>
            </View>
          )}
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <TouchableOpacity style={styles.cancelButton} onPress={onCancel} activeOpacity={0.75}>
            <ThemedText style={styles.cancelButtonText}>{t('common.cancel')}</ThemedText>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  header: {
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.four,
    paddingBottom: Spacing.four,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  headerTextGroup: {
    flex: 1,
  },
  headerTitle: {
    fontFamily: Fonts.sf.bold,
    fontSize: 20,
    color: '#FFFFFF',
  },
  headerSubtitle: {
    fontFamily: Fonts.sf.regular,
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.35)',
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    marginHorizontal: Spacing.four,
    marginTop: Spacing.three,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    backgroundColor: '#FEE2E2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    borderRadius: 12,
  },
  errorBannerText: {
    flex: 1,
    color: '#DC2626',
    fontFamily: Fonts.sf.semibold,
    fontSize: 13,
  },
  cameraSection: {
    flex: 1,
    marginHorizontal: Spacing.four,
    marginTop: Spacing.four,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  cameraWrapper: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  scanOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.four,
  },
  scanFrame: {
    width: 220,
    height: 220,
    borderRadius: 20,
    borderWidth: 3,
    borderColor: '#6DE5A9',
  },
  scanHint: {
    color: '#FFFFFF',
    fontFamily: Fonts.sf.semibold,
    fontSize: 14,
    textAlign: 'center',
  },
  centeredState: {
    flex: 1,
    gap: Spacing.three,
    padding: Spacing.six,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stateText: {
    color: '#475569',
    fontFamily: Fonts.sf.regular,
    textAlign: 'center',
    fontSize: 15,
  },
  primaryButton: {
    borderRadius: 12,
    backgroundColor: '#2563EB',
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.six,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontFamily: Fonts.sf.bold,
    fontSize: 15,
  },
  manualContainer: {
    flex: 1,
    gap: Spacing.three,
    padding: Spacing.six,
    justifyContent: 'center',
  },
  manualLabel: {
    fontFamily: Fonts.sf.regular,
    color: '#475569',
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: '#0F172A',
    fontFamily: Fonts.sf.regular,
    backgroundColor: '#F8FAFC',
  },
  footer: {
    padding: Spacing.four,
    paddingBottom: Spacing.six,
    backgroundColor: '#F5F7FA',
  },
  cancelButton: {
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    paddingVertical: Spacing.three,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  cancelButtonText: {
    color: '#475569',
    fontFamily: Fonts.sf.semibold,
    fontSize: 16,
  },
});
