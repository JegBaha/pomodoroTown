import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ScrollView, StyleSheet, View, Pressable, Animated, Easing, Platform, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { ThemedText } from '@/components/themed-text';
import { ForestBackground } from '@/components/forest-background';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { IsometricScene } from '@/src/game/map/IsometricScene';
import { TopDownMap } from '@/src/game/map/TopDownMap';
import { findNextOpenSlot, isAreaFree } from '@/src/game/map/occupancy';
import { useGame } from '@/src/game/game-provider';
import { getFootprint } from '@/src/game/util/footprint';
import { getPlaceCost, getUpgradeCost } from '@/src/game/util/economy';
import { type BuildingType } from '@/src/game/types';

type Palette = {
  background: string;
  heroGradient: [string, string, string];
  surface: string;
  surfaceAlt: string;
  border: string;
  borderSoft: string;
  shadow: string;
  textPrimary: string;
  textSecondary: string;
  muted: string;
  heroHalo: string;
  heroSweep: string;
  chipBg: string;
  chipBorder: string;
  chipActiveBg: string;
  chipActiveBorder: string;
  progressBase: string;
  progressBorder: string;
  glow: string;
  statusBg: string;
  backdrop: string;
  orb: string;
  orbWarm: string;
  panelGradient: [string, string];
  accent: string;
  accent2: string;
  accentWarm: string;
};

const lightPalette: Palette = {
  background: '#eef3f8',
  heroGradient: ['#f9fbff', '#eef5ff', '#e5f4ff'],
  surface: 'rgba(255,255,255,0.9)',
  surfaceAlt: 'rgba(255,255,255,0.82)',
  border: 'rgba(16,67,115,0.24)',
  borderSoft: 'rgba(16,67,115,0.12)',
  shadow: '#1b3a52',
  textPrimary: '#0f1f33',
  textSecondary: '#395c75',
  muted: '#4a6985',
  heroHalo: '#5ac8ff',
  heroSweep: 'rgba(255,255,255,0.55)',
  chipBg: 'rgba(90,200,255,0.14)',
  chipBorder: 'rgba(16,67,115,0.24)',
  chipActiveBg: 'rgba(90,200,255,0.14)',
  chipActiveBorder: 'rgba(74,182,255,0.55)',
  progressBase: 'rgba(255,255,255,0.7)',
  progressBorder: 'rgba(16,67,115,0.18)',
  glow: 'rgba(90,200,255,0.25)',
  statusBg: 'rgba(90,200,255,0.14)',
  backdrop: 'rgba(8,20,32,0.3)',
  orb: 'rgba(90,200,255,0.12)',
  orbWarm: 'rgba(255,232,163,0.18)',
  panelGradient: ['rgba(255,255,255,0.9)', 'rgba(244,249,255,0.85)'],
  accent: '#5ac8ff',
  accent2: '#7dd8c8',
  accentWarm: '#ffe8a3',
};

const darkPalette: Palette = {
  background: '#050910',
  heroGradient: ['#0a1a2c', '#0b2238', '#0c2b44'],
  surface: 'rgba(10,20,32,0.94)',
  surfaceAlt: 'rgba(12,26,42,0.9)',
  border: 'rgba(92,230,255,0.28)',
  borderSoft: 'rgba(92,230,255,0.14)',
  shadow: '#5ac8ff',
  textPrimary: '#e7f2ff',
  textSecondary: '#b1c9dd',
  muted: '#8ab4cc',
  heroHalo: 'rgba(90,200,255,0.16)',
  heroSweep: 'rgba(255,255,255,0.08)',
  chipBg: 'rgba(92,230,255,0.1)',
  chipBorder: 'rgba(92,230,255,0.26)',
  chipActiveBg: 'rgba(92,230,255,0.18)',
  chipActiveBorder: 'rgba(92,230,255,0.5)',
  progressBase: 'rgba(6,14,24,0.8)',
  progressBorder: 'rgba(84,144,180,0.5)',
  glow: 'rgba(90,200,255,0.24)',
  statusBg: 'rgba(92,230,255,0.18)',
  backdrop: 'rgba(3,8,14,0.65)',
  orb: 'rgba(92,230,255,0.14)',
  orbWarm: 'rgba(255,209,102,0.18)',
  panelGradient: ['rgba(10,20,32,0.94)', 'rgba(7,14,24,0.92)'],
  accent: '#5ac8ff',
  accent2: '#7dd8c8',
  accentWarm: '#ffd89c',
};

const gradientFromPalette = (p: Palette) => [p.accent, p.accent2, p.accentWarm] as const;

export default function TownScreen() {
  const colorScheme = useColorScheme() ?? 'dark';
  const palette = useMemo<Palette>(() => (colorScheme === 'dark' ? darkPalette : lightPalette), [colorScheme]);
  const styles = useMemo(() => createStyles(palette), [palette]);
  const accentGradient = useMemo(() => gradientFromPalette(palette), [palette]);
  const { town, enqueue, syncNow, syncing, commands } = useGame();
  const [moveTargetId, setMoveTargetId] = useState<string | null>(null);
  const activeSession = town.timers.session;
  const heroPulse = useRef(new Animated.Value(0)).current;
  const shimmer = useRef(new Animated.Value(0)).current;
  const float = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(heroPulse, {
        toValue: 1,
        duration: 3200,
        easing: Easing.inOut(Easing.quad),
        useNativeDriver: true,
      }),
    ).start();
    Animated.loop(
      Animated.sequence([
        Animated.timing(shimmer, {
          toValue: 1,
          duration: 2600,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(shimmer, {
          toValue: 0.25,
          duration: 2600,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
    ).start();
    Animated.loop(
      Animated.sequence([
        Animated.timing(float, { toValue: 1, duration: 2000, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
        Animated.timing(float, { toValue: 0, duration: 2000, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
      ]),
    ).start();
  }, [heroPulse, shimmer, float]);

  const handlePlace = (type: BuildingType) => {
    const slot = findNextOpenSlot(town, getFootprint(type));
    if (!slot) return;
    enqueue(commands.placeBuilding(`${type}-${Date.now()}`, type, slot.x, slot.y));
  };

  const handleUpgradeTownHall = () => enqueue(commands.upgradeBuilding('town-hall'));

  const cost = {
    farm: getPlaceCost('farm'),
    sawmill: getPlaceCost('sawmill'),
    mine: getPlaceCost('mine'),
    market: getPlaceCost('market'),
  };
  const upgradeCost = getUpgradeCost(
    'town_hall',
    (town.buildings.find((b) => b.id === 'town-hall')?.level ?? 1) + 1,
  );
  const canAfford = (c: typeof cost.farm) =>
    town.resources.gold >= (c.gold ?? 0) &&
    town.resources.wood >= (c.wood ?? 0) &&
    town.resources.stone >= (c.stone ?? 0);
  const hasUpgradeResources = canAfford(upgradeCost);
  const townHallLevel = town.buildings.find((b) => b.id === 'town-hall')?.level ?? 1;

  const handleDeleteBuilding = (id: string) => {
    enqueue(commands.deleteBuilding(id));
  };

  const handleSelectForMove = (id: string) => {
    setMoveTargetId((prev) => (prev === id ? null : id));
  };

  const handleTilePress = (pos: { x: number; y: number }) => {
    if (!moveTargetId) return;
    const building = town.buildings.find((b) => b.id === moveTargetId);
    if (!building) return;
    const footprint = building.footprint ?? getFootprint(building.type);
    const free = isAreaFree(town, pos.x, pos.y, footprint, building.id);
    if (!free) {
      Alert.alert('Yerlesim uygun degil', 'Baska bir kutu secmeyi dene.');
      return;
    }
    enqueue(commands.moveBuilding(building.id, pos.x, pos.y));
    setMoveTargetId(null);
  };

  const ActionButton = ({
    label,
    onPress,
    disabled,
    variant = 'solid',
  }: {
    label: string;
    onPress: () => void;
    disabled?: boolean;
    variant?: 'solid' | 'ghost';
  }) => (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.actionButton,
        variant === 'ghost' && styles.actionGhost,
        { opacity: disabled ? 0.4 : pressed ? 0.92 : 1 },
      ]}>
      {variant === 'solid' ? (
        <LinearGradient
          colors={accentGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFillObject}
        />
      ) : null}
      <ThemedText style={variant === 'ghost' ? styles.actionGhostText : styles.actionText}>{label}</ThemedText>
    </Pressable>
  );

  const Panel = ({
    title,
    subtitle,
    children,
  }: {
    title: string;
    subtitle?: string;
    children: React.ReactNode;
  }) => (
    <View style={styles.panel}>
      <LinearGradient
        colors={palette.panelGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />
      <View style={styles.panelBorder} />
      <View style={styles.panelContent}>
        <ThemedText style={styles.sectionLabel}>{title}</ThemedText>
        {subtitle ? <ThemedText style={styles.subtitle}>{subtitle}</ThemedText> : null}
        {children}
      </View>
    </View>
  );

  const StatPill = ({ label, value }: { label: string; value: number | string }) => (
    <View style={styles.statPill}>
      <ThemedText style={styles.statLabel}>{label}</ThemedText>
      <ThemedText style={styles.statValue}>{value}</ThemedText>
    </View>
  );

  return (
    <ForestBackground>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.page}>
        <View style={styles.hero}>
          <LinearGradient
            colors={palette.heroGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFillObject}
          />
          <View pointerEvents="none" style={styles.floatingGlows}>
            <Animated.View
              style={[
                styles.floatingOrb,
                {
                  top: 10,
                  left: -30,
                  transform: [
                    {
                      translateY: float.interpolate({ inputRange: [0, 1], outputRange: [0, -10] }),
                    },
                  ],
                },
              ]}
            />
            <Animated.View
              style={[
                styles.floatingOrb,
                {
                  bottom: -20,
                  right: -10,
                  backgroundColor: palette.orbWarm,
                  width: 180,
                  height: 180,
                  transform: [
                    {
                      translateY: float.interpolate({ inputRange: [0, 1], outputRange: [0, 14] }),
                    },
                  ],
                },
              ]}
            />
          </View>
          <Animated.View
            style={[
              styles.heroHalo,
              {
                opacity: heroPulse.interpolate({ inputRange: [0, 1], outputRange: [0.08, 0.16] }),
                transform: [
                  {
                    scale: heroPulse.interpolate({ inputRange: [0, 1], outputRange: [0.97, 1.05] }),
                  },
                  { rotate: heroPulse.interpolate({ inputRange: [0, 1], outputRange: ['-8deg', '-3deg'] }) },
                ],
              },
            ]}
          />
          <Animated.View
            pointerEvents="none"
            style={[
              styles.heroSweep,
              {
                opacity: shimmer.interpolate({ inputRange: [0, 1], outputRange: [0.16, 0.32] }),
                transform: [
                  {
                    scale: shimmer.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.96, 1.02],
                    }),
                  },
                  { rotate: '-8deg' },
                ],
              },
            ]}
          />
          <View style={styles.heroHeader}>
            <View style={styles.heroBadge}>
              <ThemedText style={styles.heroBadgeText}>Kasaba</ThemedText>
            </View>
            <Pressable onPress={syncNow} style={styles.syncChip}>
              <ThemedText style={styles.syncChipText}>
                {syncing ? 'Senkronize ediliyor' : 'Senkr. et'}
              </ThemedText>
            </Pressable>
          </View>
          <ThemedText style={styles.heroTitle}>Orman Kasabasi</ThemedText>
          <ThemedText style={styles.heroSubtitle}>
            Odak puanlarini kasabana aktar, premium bir yonetim akisi ile buyut.
          </ThemedText>
          <View style={styles.heroStats}>
            <StatPill label="Town Hall" value={`Lv ${townHallLevel}`} />
            <StatPill label="Aktif oturum" value={activeSession ? 'Acik' : 'Yok'} />
          </View>
        </View>

        <Panel title="Kasaba Haritasi" subtitle="Cam gibi katmanlarla capcanli" palette={palette}>
          <View style={styles.mapFrame}>
            <LinearGradient
              colors={palette.panelGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFillObject}
            />
            <Animated.View
              pointerEvents="none"
              style={[
                styles.mapGlow,
                {
                  transform: [
                    {
                      scale: shimmer.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.95, 1.03],
                      }),
                    },
                  ],
                  opacity: shimmer.interpolate({ inputRange: [0, 1], outputRange: [0.12, 0.26] }),
                },
              ]}
            />
            <ScrollView horizontal bounces>
              {Platform.OS === 'ios' || Platform.OS === 'android' ? (
                <TopDownMap
                  state={town}
                  tileSize={62}
                  onTilePress={handleTilePress}
                  onBuildingPress={handleSelectForMove}
                  selectedBuildingId={moveTargetId ?? undefined}
                />
              ) : (
                <IsometricScene state={town} height={420} />
              )}
            </ScrollView>
          </View>
          {moveTargetId ? (
            <View style={styles.moveBanner}>
              <ThemedText style={styles.moveBannerText}>Tasima modu: haritada konum sec</ThemedText>
            </View>
          ) : null}
          <View style={styles.resources}>
            <StatPill label="Gold" value={town.resources.gold} />
            <StatPill label="Wood" value={town.resources.wood} />
            <StatPill label="Stone" value={town.resources.stone} />
            <StatPill label="Food" value={town.resources.food} />
          </View>
        </Panel>

        <Panel title="Binalar" subtitle="Kaynaklarini parlak butonlarla yatir" palette={palette}>
          <View style={styles.actions}>
            <ActionButton
              label={`Ciftlik (G${cost.farm.gold ?? 0}/W${cost.farm.wood ?? 0}/S${cost.farm.stone ?? 0})`}
              onPress={() => handlePlace('farm')}
              disabled={!canAfford(cost.farm)}
              palette={palette}
            />
            <ActionButton
              label={`Odun atolyesi (G${cost.sawmill.gold ?? 0}/W${cost.sawmill.wood ?? 0}/S${cost.sawmill.stone ?? 0})`}
              onPress={() => handlePlace('sawmill')}
              disabled={!canAfford(cost.sawmill)}
              palette={palette}
            />
            <ActionButton
              label={`Maden (G${cost.mine.gold ?? 0}/W${cost.mine.wood ?? 0}/S${cost.mine.stone ?? 0})`}
              onPress={() => handlePlace('mine')}
              disabled={!canAfford(cost.mine)}
              palette={palette}
            />
            <ActionButton
              label={`Pazar (G${cost.market.gold ?? 0}/W${cost.market.wood ?? 0}/S${cost.market.stone ?? 0})`}
              onPress={() => handlePlace('market')}
              disabled={!canAfford(cost.market)}
              palette={palette}
            />
            <ActionButton
              label={`Town Hall yukselt (Lv${townHallLevel + 1})`}
              onPress={handleUpgradeTownHall}
              disabled={!hasUpgradeResources}
              palette={palette}
            />
            <ActionButton label={syncing ? 'Sync...' : 'Sync'} onPress={syncNow} variant="ghost" palette={palette} />
          </View>
          <View style={{ gap: 8, marginTop: 8 }}>
            {town.buildings
              .filter((b) => b.id !== 'town-hall')
              .map((b) => (
                <View key={b.id} style={styles.buildingRow}>
                  <ThemedText style={styles.activityChipTitle}>
                    {b.type} · Lv {b.level} · ({b.x},{b.y})
                  </ThemedText>
                  <View style={{ flexDirection: 'row', gap: 6 }}>
                    <ActionButton
                      label={moveTargetId === b.id ? 'Secildi' : 'Tasi'}
                      onPress={() => handleSelectForMove(b.id)}
                      variant={moveTargetId === b.id ? 'solid' : 'ghost'}
                      palette={palette}
                    />
                    <ActionButton
                      label="Sil"
                      onPress={() => handleDeleteBuilding(b.id)}
                      variant="ghost"
                      palette={palette}
                    />
                  </View>
                </View>
              ))}
          </View>
        </Panel>

        </View>
      </ScrollView>
    </ForestBackground>
  );
}

const createStyles = (p: Palette) =>
  StyleSheet.create({
    container: { gap: 16, padding: 16, backgroundColor: 'transparent', alignItems: 'center' },
    page: { width: '100%', maxWidth: 1080, gap: 16 },
    hero: {
      gap: 14,
      padding: 24,
      borderRadius: 22,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: p.borderSoft,
      shadowColor: p.shadow,
      shadowOpacity: 0.16,
      shadowRadius: 18,
      shadowOffset: { width: 0, height: 10 },
      backgroundColor: p.surface,
    },
    heroHalo: {
      position: 'absolute',
      width: 320,
      height: 320,
      backgroundColor: p.heroHalo,
      opacity: 0.14,
      top: -150,
      right: -70,
      borderRadius: 360,
      transform: [{ rotate: '-6deg' }],
    },
    heroSweep: {
      position: 'absolute',
      width: 260,
      height: 260,
      backgroundColor: p.heroSweep,
      top: -70,
      left: -30,
      borderRadius: 200,
    },
    heroHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' },
    heroBadge: {
      alignSelf: 'flex-start',
      backgroundColor: p.chipBg,
      paddingHorizontal: 14,
      paddingVertical: 6,
      borderRadius: 999,
      borderWidth: 1,
      borderColor: p.chipBorder,
    },
    heroBadgeText: { color: p.textPrimary, fontWeight: '700', letterSpacing: 0.4 },
    heroTitle: { color: p.textPrimary, fontSize: 28, fontWeight: '800', letterSpacing: -0.2 },
    heroSubtitle: { color: p.textSecondary, fontSize: 15, lineHeight: 22 },
    heroStats: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
    syncChip: {
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 999,
      borderWidth: 1,
      borderColor: p.border,
      backgroundColor: p.surfaceAlt,
    },
    syncChipText: { color: p.textPrimary, fontWeight: '600', fontSize: 13 },
    panel: {
      position: 'relative',
      overflow: 'hidden',
      borderRadius: 18,
      borderWidth: 1,
      borderColor: p.borderSoft,
      shadowColor: p.shadow,
      shadowOpacity: 0.12,
      shadowRadius: 16,
      shadowOffset: { width: 0, height: 10 },
      backgroundColor: p.surfaceAlt,
    },
  panelBorder: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: p.borderSoft,
  },
  panelContent: { gap: 10, padding: 16 },
  sectionLabel: { color: p.textPrimary, fontWeight: '800', fontSize: 17, letterSpacing: 0.2 },
  subtitle: { color: p.muted, fontSize: 14 },
  resources: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  actionButton: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: p.border,
    minWidth: 110,
    alignItems: 'center',
    backgroundColor: p.surfaceAlt,
  },
  actionGhost: { backgroundColor: 'transparent', borderWidth: 1.2, borderColor: p.border },
  actionText: { color: p.textPrimary, fontWeight: '700', letterSpacing: 0.1 },
  actionGhostText: { color: p.textPrimary, fontWeight: '600', letterSpacing: 0.1 },
  statPill: {
    backgroundColor: p.surfaceAlt,
    borderColor: p.border,
    borderWidth: 1.1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    minWidth: 110,
    shadowColor: p.shadow,
    shadowOpacity: 0.08,
    shadowRadius: 10,
  },
  statLabel: { color: p.muted, fontSize: 12, marginBottom: 2 },
  statValue: { color: p.textPrimary, fontWeight: '700', fontSize: 16 },
  muted: { color: p.muted },
  mapFrame: {
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: p.borderSoft,
    backgroundColor: p.surfaceAlt,
    shadowColor: p.shadow,
    shadowOpacity: 0.1,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 12 },
  },
  mapGlow: {
    position: 'absolute',
    width: '70%',
    height: 140,
    top: -20,
    right: -20,
    backgroundColor: p.glow,
    opacity: 0.18,
    transform: [{ rotate: '10deg' }],
    borderRadius: 160,
  },
  floatingGlows: { ...StyleSheet.absoluteFillObject },
  floatingOrb: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 999,
    backgroundColor: p.orb,
  },
  buildingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: p.borderSoft,
  },
  moveBanner: {
    marginTop: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: p.statusBg,
    borderWidth: 1,
    borderColor: p.chipBorder,
  },
  moveBannerText: { color: p.textPrimary, fontWeight: '700' },
});
