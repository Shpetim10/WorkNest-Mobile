import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';

import { GradientText } from '@/common/components/gradient-text';
import { ThemedText } from '@/common/components/themed-text';
import { Fonts, Spacing } from '@/common/constants/theme';
import { useLocalization } from '@/common/localization';
import { useAppSelector } from '@/common/store/hooks';
import { useSelectRoleMutation } from '@/features/auth/api/auth-api';
import { selectAvailableContexts } from '@/features/auth/store/selectors';
import { mapBackendErrorCodeToMessage } from '@/features/auth/utils/auth-error-messages';
import { parseAuthError } from '@/features/auth/utils/parse-auth-error';

export function RoleAssignmentScreen() {
  const router = useRouter();
  const { t } = useLocalization();
  const contexts = useAppSelector(selectAvailableContexts);
  const [selectRole, { isLoading }] = useSelectRoleMutation();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedAssignmentId, setSelectedAssignmentId] = useState<string | null>(null);

  const rows = useMemo(
    () =>
      contexts.map((context) => ({
        id: context.roleAssignmentId,
        company: context.companyName,
        role: context.role,
        jobTitle: context.jobTitle,
      })),
    [contexts]
  );

  const onSelect = async (roleAssignmentId: string) => {
    setErrorMessage(null);
    setSelectedAssignmentId(roleAssignmentId);
    try {
      await selectRole({ roleAssignmentId }).unwrap();
      router.replace('/(app)' as any);
    } catch (err) {
      const parsed = parseAuthError(err);
      const maybeCode = parsed.code;
      const maybeMessage = parsed.message;
      setErrorMessage(mapBackendErrorCodeToMessage(maybeCode, maybeMessage, t));
      setSelectedAssignmentId(null);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <GradientText text={t('auth.chooseWorkspace')} style={styles.title} />
        <ThemedText style={styles.subtitle}>
          {t('auth.chooseWorkspaceSubtitle')}
        </ThemedText>

        <View style={styles.list}>
          {rows.length === 0 ? (
            <ThemedText style={styles.errorText}>
              {t('auth.noRoleAssignments')}
            </ThemedText>
          ) : null}
          {rows.map((row) => {
            const active = isLoading && selectedAssignmentId === row.id;
            return (
              <Pressable
                key={row.id}
                onPress={() => onSelect(row.id)}
                style={styles.item}
                disabled={isLoading}
              >
                <View style={styles.itemTextContainer}>
                  <ThemedText style={styles.company}>{row.company}</ThemedText>
                  <ThemedText style={styles.meta}>
                    {row.role}
                    {row.jobTitle ? ` • ${row.jobTitle}` : ''}
                  </ThemedText>
                </View>
                {active ? (
                  <ActivityIndicator color="#2B7FFF" />
                ) : (
                  <ThemedText style={styles.cta}>{t('auth.select')}</ThemedText>
                )}
              </Pressable>
            );
          })}
        </View>

        {errorMessage ? <ThemedText style={styles.errorText}>{errorMessage}</ThemedText> : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  content: {
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.six,
    gap: Spacing.three,
  },
  title: {
    fontFamily: Fonts.ny.bold,
    fontSize: 34,
    lineHeight: 40,
  },
  subtitle: {
    color: '#475569',
    marginBottom: Spacing.two,
  },
  list: {
    gap: Spacing.three,
  },
  item: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: Spacing.three,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  itemTextContainer: {
    flex: 1,
    gap: Spacing.one,
    paddingRight: Spacing.two,
  },
  company: {
    fontFamily: Fonts.sf.semibold,
    fontSize: 16,
    color: '#0F172A',
  },
  meta: {
    color: '#64748B',
    fontSize: 14,
  },
  cta: {
    color: '#2563EB',
    fontFamily: Fonts.sf.semibold,
  },
  errorText: {
    color: '#DC2626',
    marginTop: Spacing.two,
  },
});
