import React, { useMemo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { ForestBackground } from '@/components/forest-background';
import { ThemedText } from '@/components/themed-text';
import { useColorScheme, useColorSchemeController } from '@/hooks/use-color-scheme';
import { useGame } from '@/src/game/game-provider';
import { useLocale } from '@/src/locale/i18n';

export default function ProfileScreen() {
  const colorScheme = useColorScheme() ?? 'dark';
  const { toggleColorScheme } = useColorSchemeController();
  const { queue } = useGame();
  const { t, locale, setLocale } = useLocale();

  const palette = useMemo(
    () =>
      colorScheme === 'dark'
        ? {
            card: 'rgba(255,255,255,0.06)',
            cardBorder: 'rgba(255,255,255,0.12)',
            border: 'rgba(255,255,255,0.18)',
            text: '#e7f2ff',
            muted: 'rgba(231,242,255,0.7)',
            chip: 'rgba(92,230,255,0.14)',
            chipBorder: 'rgba(92,230,255,0.32)',
            status: {
              pending: '#ffd479',
              acked: '#7dd8c8',
              rejected: '#ff9f7a',
            },
          }
        : {
            card: 'rgba(255,255,255,0.9)',
            cardBorder: 'rgba(16,67,115,0.14)',
            border: 'rgba(16,67,115,0.22)',
            text: '#0f1f33',
            muted: '#4a6985',
            chip: 'rgba(90,200,255,0.18)',
            chipBorder: 'rgba(16,67,115,0.22)',
            status: {
              pending: '#c9872f',
              acked: '#4aa586',
              rejected: '#c7534f',
            },
          },
    [colorScheme],
  );

  return (
    <ForestBackground>
      <View style={styles.container}>
        <View style={[styles.card, { backgroundColor: palette.card, borderColor: palette.cardBorder }]}>
          <ThemedText style={[styles.title, { color: palette.text }]}>{t('profile.title')}</ThemedText>
          <ThemedText style={[styles.subtitle, { color: palette.muted }]}>
            {t('profile.subtitle')}
          </ThemedText>
          <Pressable onPress={toggleColorScheme} style={[styles.toggle, { borderColor: palette.border }]}>
            <ThemedText style={[styles.toggleText, { color: palette.text }]}>
              {t('profile.theme')}: {colorScheme === 'dark' ? t('profile.theme.dark') : t('profile.theme.light')}
            </ThemedText>
          </Pressable>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <Pressable
              onPress={() => setLocale('tr')}
              style={[styles.toggle, { borderColor: palette.border, backgroundColor: locale === 'tr' ? palette.chip : 'transparent' }]}>
              <ThemedText style={[styles.toggleText, { color: palette.text }]}>TR</ThemedText>
            </Pressable>
            <Pressable
              onPress={() => setLocale('en')}
              style={[styles.toggle, { borderColor: palette.border, backgroundColor: locale === 'en' ? palette.chip : 'transparent' }]}>
              <ThemedText style={[styles.toggleText, { color: palette.text }]}>EN</ThemedText>
            </Pressable>
          </View>
        </View>

        <View style={[styles.card, { backgroundColor: palette.card, borderColor: palette.cardBorder }]}>
          <ThemedText style={[styles.title, { color: palette.text }]}>{t('profile.queue.title')}</ThemedText>
          <ThemedText style={[styles.subtitle, { color: palette.muted }]}>
            {t('profile.queue.subtitle')}
          </ThemedText>
            {queue.length === 0 ? (
            <ThemedText style={[styles.subtitle, { color: palette.muted }]}>Kuyruk bos</ThemedText>
          ) : (
            queue.map((item) => (
              <View key={item.command.id} style={[styles.queueRow, { borderColor: palette.border }]}>
                <View style={{ flex: 1, gap: 4 }}>
                  <ThemedText style={[styles.queueText, { color: palette.text }]}>
                    {item.command.type}
                  </ThemedText>
                  <ThemedText style={[styles.queueSub, { color: palette.muted }]}>
                    Durum: {item.status.toUpperCase()} · Sayfa: Profil
                  </ThemedText>
                  {item.error ? (
                    <ThemedText style={[styles.queueSub, { color: palette.status.rejected }]}>
                      Hata: {item.error}
                    </ThemedText>
                  ) : null}
                </View>
                <View
                  style={[
                    styles.statusDot,
                    {
                      backgroundColor:
                        item.status === 'pending'
                          ? palette.status.pending
                          : item.status === 'acked'
                            ? palette.status.acked
                            : palette.status.rejected,
                      borderColor: palette.chipBorder,
                    },
                  ]}
                />
              </View>
            ))
          )}
        </View>
      </View>
    </ForestBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    gap: 12,
  },
  card: {
    gap: 10,
    padding: 18,
    borderRadius: 16,
    borderWidth: 1,
  },
  title: { fontSize: 20, fontWeight: '800' },
  subtitle: { fontSize: 14 },
  toggle: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    backgroundColor: 'transparent',
  },
  toggleText: { fontWeight: '700' },
  queueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  queueText: { fontWeight: '700', fontSize: 15 },
  queueSub: { fontSize: 13 },
  statusDot: {
    width: 16,
    height: 16,
    borderRadius: 999,
    borderWidth: 1,
  },
});
