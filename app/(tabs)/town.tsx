import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ScrollView, StyleSheet, View, Pressable, Animated, Easing, Alert, useWindowDimensions, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { ThemedText } from '@/components/themed-text';
import { ForestBackground } from '@/components/forest-background';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { PixelTownMap } from '@/src/game/map/PixelTownMap';
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
  const { width } = useWindowDimensions();
  const isMobile = width < 768;
  const palette = useMemo<Palette>(() => (colorScheme === 'dark' ? darkPalette : lightPalette), [colorScheme]);
  const styles = useMemo(() => createStyles(palette), [palette]);
  const accentGradient = useMemo(() => gradientFromPalette(palette), [palette]);
  const { town, enqueue, syncNow, syncing, commands } = useGame();
  const [moveTargetId, setMoveTargetId] = useState<string | null>(null);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
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
    size = 'md',
  }: {
    label: string;
    onPress: () => void;
    disabled?: boolean;
    variant?: 'solid' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
  }) => (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.actionButton,
        size === 'sm' && styles.actionButtonSmall,
        size === 'lg' && styles.actionButtonLarge,
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
      <ThemedText style={[
        variant === 'ghost' ? styles.actionGhostText : styles.actionText,
        size === 'sm' && styles.actionTextSmall,
      ]}>{label}</ThemedText>
    </Pressable>
  );

  const Panel = ({
    title,
    subtitle,
    children,
    collapsible = false,
    isExpanded = true,
    onToggle,
  }: {
    title: string;
    subtitle?: string;
    children: React.ReactNode;
    collapsible?: boolean;
    isExpanded?: boolean;
    onToggle?: () => void;
  }) => (
    <View style={styles.panel}>
      <LinearGradient
        colors={palette.panelGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />
      <View style={styles.panelBorder} />
      {collapsible ? (
        <>
          <Pressable onPress={onToggle} style={styles.panelHeaderCollapsible}>
            <View style={styles.panelHeaderContent}>
              <ThemedText style={styles.sectionLabel}>{title}</ThemedText>
              {subtitle ? <ThemedText style={styles.subtitle}>{subtitle}</ThemedText> : null}
            </View>
            <ThemedText style={styles.collapseIcon}>{isExpanded ? '▼' : '▶'}</ThemedText>
          </Pressable>
          {isExpanded ? <View style={styles.panelContentCollapsed}>{children}</View> : null}
        </>
      ) : (
        <View style={styles.panelContent}>
          <ThemedText style={styles.sectionLabel}>{title}</ThemedText>
          {subtitle ? <ThemedText style={styles.subtitle}>{subtitle}</ThemedText> : null}
          {children}
        </View>
      )}
    </View>
  );

  const StatPill = ({ label, value }: { label: string; value: number | string }) => (
    <View style={styles.statPill}>
      <ThemedText style={styles.statLabel}>{label}</ThemedText>
      <ThemedText style={styles.statValue}>{value}</ThemedText>
    </View>
  );

  const CostRow = ({ label, cost }: { label: string; cost: { gold?: number; wood?: number; stone?: number; food?: number } }) => (
    <View style={styles.costRow}>
      <ThemedText style={styles.costRowLabel}>{label}</ThemedText>
      <View style={styles.costRowValues}>
        {cost.gold ? <ThemedText style={styles.costValue}>💰 {cost.gold}</ThemedText> : null}
        {cost.wood ? <ThemedText style={styles.costValue}>🪵 {cost.wood}</ThemedText> : null}
        {cost.stone ? <ThemedText style={styles.costValue}>🪨 {cost.stone}</ThemedText> : null}
      </View>
    </View>
  );

  const getBuildingEmoji = (type: BuildingType) => {
    const emojis: Record<BuildingType, string> = {
      town_hall: '🏰',
      farm: '🚜',
      sawmill: '🪵',
      mine: '⛏️',
      market: '🛒',
      decor: '🌳',
    };
    return emojis[type] || '🏗️';
  };

  return (
    <ForestBackground>
      <ScrollView contentContainerStyle={styles.container} scrollIndicatorInsets={{ right: 1 }}>
        <View style={[styles.page, isMobile && styles.pageMobile]}>
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
            <View style={[styles.heroHeader, isMobile && styles.heroHeaderMobile]}>
              <View style={styles.heroBadge}>
                <ThemedText style={styles.heroBadgeText}>🏡 Kasaba</ThemedText>
              </View>
              <Pressable onPress={syncNow} style={[styles.syncChip, syncing && styles.syncChipActive]}>
                {syncing ? (
                  <ActivityIndicator size="small" color={palette.accent} />
                ) : (
                  <ThemedText style={styles.syncChipText}>✓ Senkr.</ThemedText>
                )}
              </Pressable>
            </View>
            <ThemedText style={[styles.heroTitle, isMobile && styles.heroTitleMobile]}>
              Orman Kasabasi
            </ThemedText>
            <ThemedText style={[styles.heroSubtitle, isMobile && styles.heroSubtitleMobile]}>
              Pomodoro oturumlarını tamamla ve kasabanı geliştir
            </ThemedText>
            <View style={[styles.heroStats, isMobile && styles.heroStatsMobile]}>
              <StatPill label="Town Hall" value={`Lv ${townHallLevel}`} />
              <StatPill label="Aktif" value={activeSession ? '✓' : '○'} />
              <StatPill label="Bina" value={town.buildings.length} />
            </View>
          </View>

          {/* Harita Bölümü */}
          <Panel 
            title="📍 Kasaba Haritası" 
            subtitle={isMobile ? "Kaydırarak taşı" : "Cam gibi katmanlarla çarpıcı"}
            collapsible={isMobile}
            isExpanded={expandedSection === 'map' || !isMobile}
            onToggle={() => setExpandedSection(expandedSection === 'map' ? null : 'map')}
          >
            <View style={[styles.mapFrame, isMobile && styles.mapFrameMobile]}>
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
              <ScrollView
                horizontal
                scrollIndicatorInsets={{ right: 1 }}
                scrollEnabled={!moveTargetId}
                nestedScrollEnabled
              >
                <PixelTownMap
                  state={town}
                  tileSize={isMobile ? 44 : 52}
                  onTilePress={handleTilePress}
                  onBuildingPress={handleSelectForMove}
                  selectedBuildingId={moveTargetId ?? undefined}
                />
              </ScrollView>
            </View>
            {moveTargetId ? (
              <View style={[styles.moveBanner, styles.bannerActive]}>
                <ThemedText style={styles.moveBannerText}>📌 Taşıma modu: haritada konum seç</ThemedText>
              </View>
            ) : null}
            <View style={[styles.resources, isMobile && styles.resourcesMobile]}>
              <StatPill label="💰 Gold" value={town.resources.gold} />
              <StatPill label="🪵 Wood" value={town.resources.wood} />
              <StatPill label="🪨 Stone" value={town.resources.stone} />
              <StatPill label="🍞 Food" value={town.resources.food} />
            </View>
          </Panel>

          {/* Binalar Bölümü */}
          <Panel 
            title="🏗️ Binalar" 
            subtitle={isMobile ? "Binalarını yönet" : "Kaynaklarını parlak butonlarla yatır"}
            collapsible={isMobile}
            isExpanded={expandedSection === 'buildings' || !isMobile}
            onToggle={() => setExpandedSection(expandedSection === 'buildings' ? null : 'buildings')}
          >
            <View style={[styles.actions, isMobile && styles.actionsMobile]}>
              <ActionButton
                label={isMobile ? "🚜" : `Çiftlik`}
                onPress={() => handlePlace('farm')}
                disabled={!canAfford(cost.farm)}
                size={isMobile ? 'sm' : 'md'}
              />
              <ActionButton
                label={isMobile ? "🪵" : `Odun Fabrikası`}
                onPress={() => handlePlace('sawmill')}
                disabled={!canAfford(cost.sawmill)}
                size={isMobile ? 'sm' : 'md'}
              />
              <ActionButton
                label={isMobile ? "⛏️" : `Maden`}
                onPress={() => handlePlace('mine')}
                disabled={!canAfford(cost.mine)}
                size={isMobile ? 'sm' : 'md'}
              />
              <ActionButton
                label={isMobile ? "🛒" : `Pazar`}
                onPress={() => handlePlace('market')}
                disabled={!canAfford(cost.market)}
                size={isMobile ? 'sm' : 'md'}
              />
              <ActionButton
                label={isMobile ? `TH+` : `Town Hall Yükselt (Lv${townHallLevel + 1})`}
                onPress={handleUpgradeTownHall}
                disabled={!hasUpgradeResources}
                size={isMobile ? 'sm' : 'md'}
              />
            </View>

            {/* Detaylı Maliyet Bilgisi */}
            {!isMobile && (
              <View style={styles.costInfo}>
                <ThemedText style={styles.costLabel}>Yapı Maliyetleri:</ThemedText>
                <View style={styles.costGrid}>
                  <CostRow label="Çiftlik" cost={cost.farm} />
                  <CostRow label="Odun Fabrikası" cost={cost.sawmill} />
                  <CostRow label="Maden" cost={cost.mine} />
                  <CostRow label="Pazar" cost={cost.market} />
                  <CostRow label="Town Hall +" cost={upgradeCost} />
                </View>
              </View>
            )}

            {/* Yerleştirilmiş Binalar */}
            <View style={styles.buildingsList}>
              {town.buildings.filter((b) => b.id !== 'town-hall').length > 0 ? (
                <>
                  <ThemedText style={[styles.sectionLabel, { fontSize: 14, marginBottom: 8 }]}>
                    Yerleştirilen Binalar ({town.buildings.filter((b) => b.id !== 'town-hall').length})
                  </ThemedText>
                  {town.buildings
                    .filter((b) => b.id !== 'town-hall')
                    .map((b) => (
                      <View key={b.id} style={styles.buildingRow}>
                        <View style={styles.buildingInfo}>
                          <ThemedText style={styles.buildingName}>
                            {getBuildingEmoji(b.type)} {b.type} · Lv {b.level}
                          </ThemedText>
                          <ThemedText style={styles.buildingPos}>Konum: ({b.x}, {b.y})</ThemedText>
                        </View>
                        <View style={styles.buildingActions}>
                          <ActionButton
                            label={moveTargetId === b.id ? '✓' : '↔'}
                            onPress={() => handleSelectForMove(b.id)}
                            variant={moveTargetId === b.id ? 'solid' : 'ghost'}
                            size="sm"
                          />
                          <ActionButton
                            label="🗑"
                            onPress={() => handleDeleteBuilding(b.id)}
                            variant="ghost"
                            size="sm"
                          />
                        </View>
                      </View>
                    ))}
                </>
              ) : (
                <View style={styles.emptyState}>
                  <ThemedText style={styles.emptyStateText}>📭 Henüz bina yok. Bir bina inşa et!</ThemedText>
                </View>
              )}
            </View>
          </Panel>
        </View>
      </ScrollView>
    </ForestBackground>
  );
}

const createStyles = (p: Palette) =>
  StyleSheet.create({
    container: { gap: 12, padding: 12, backgroundColor: 'transparent', alignItems: 'center', paddingBottom: 32 },
    page: { width: '100%', maxWidth: 1080, gap: 12 },
    pageMobile: { maxWidth: '100%' },
    
    // Hero Section
    hero: {
      gap: 12,
      padding: 16,
      borderRadius: 18,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: p.borderSoft,
      shadowColor: p.shadow,
      shadowOpacity: 0.12,
      shadowRadius: 12,
      shadowOffset: { width: 0, height: 6 },
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
    heroHeader: { 
      flexDirection: 'row', 
      alignItems: 'center', 
      justifyContent: 'space-between', 
      gap: 8, 
      flexWrap: 'wrap' 
    },
    heroHeaderMobile: {
      justifyContent: 'flex-start',
    },
    heroBadge: {
      alignSelf: 'flex-start',
      backgroundColor: p.chipBg,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 999,
      borderWidth: 1,
      borderColor: p.chipBorder,
    },
    heroBadgeText: { color: p.textPrimary, fontWeight: '700', letterSpacing: 0.3, fontSize: 13 },
    heroTitle: { color: p.textPrimary, fontSize: 24, fontWeight: '800', letterSpacing: -0.2 },
    heroTitleMobile: { fontSize: 20 },
    heroSubtitle: { color: p.textSecondary, fontSize: 14, lineHeight: 20 },
    heroSubtitleMobile: { fontSize: 12, lineHeight: 18 },
    heroStats: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
    heroStatsMobile: { gap: 6 },
    syncChip: {
      paddingHorizontal: 10,
      paddingVertical: 8,
      borderRadius: 999,
      borderWidth: 1,
      borderColor: p.border,
      backgroundColor: p.surfaceAlt,
      alignItems: 'center',
      justifyContent: 'center',
      minWidth: 45,
      minHeight: 36,
    },
    syncChipActive: {
      backgroundColor: p.statusBg,
      borderColor: p.accent,
    },
    syncChipText: { color: p.textPrimary, fontWeight: '600', fontSize: 12 },
    
    // Panel
    panel: {
      position: 'relative',
      overflow: 'hidden',
      borderRadius: 16,
      borderWidth: 1,
      borderColor: p.borderSoft,
      shadowColor: p.shadow,
      shadowOpacity: 0.1,
      shadowRadius: 12,
      shadowOffset: { width: 0, height: 6 },
      backgroundColor: p.surfaceAlt,
    },
    panelBorder: {
      ...StyleSheet.absoluteFillObject,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: p.borderSoft,
    },
    panelContent: { gap: 10, padding: 14 },
    panelHeaderCollapsible: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: 14,
      gap: 8,
    },
    panelHeaderContent: { flex: 1, gap: 4 },
    panelContentCollapsed: { paddingHorizontal: 14, paddingBottom: 14, gap: 10 },
    collapseIcon: { color: p.textSecondary, fontWeight: '700', fontSize: 14 },
    
    sectionLabel: { color: p.textPrimary, fontWeight: '800', fontSize: 16, letterSpacing: 0.2 },
    subtitle: { color: p.muted, fontSize: 13 },
    
    // Resources & Stats
    resources: { flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
    resourcesMobile: { gap: 5 },
    statPill: {
      backgroundColor: p.surfaceAlt,
      borderColor: p.border,
      borderWidth: 1,
      paddingHorizontal: 10,
      paddingVertical: 8,
      borderRadius: 10,
      minWidth: 85,
      shadowColor: p.shadow,
      shadowOpacity: 0.06,
      shadowRadius: 8,
    },
    statLabel: { color: p.muted, fontSize: 11, marginBottom: 2, fontWeight: '600' },
    statValue: { color: p.textPrimary, fontWeight: '700', fontSize: 15 },
    
    // Map Section
    mapFrame: {
      borderRadius: 14,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: p.borderSoft,
      backgroundColor: p.surfaceAlt,
      shadowColor: p.shadow,
      shadowOpacity: 0.08,
      shadowRadius: 12,
      shadowOffset: { width: 0, height: 8 },
      minHeight: 240,
    },
    mapFrameMobile: { minHeight: 200 },
    mapGlow: {
      position: 'absolute',
      width: '70%',
      height: 120,
      top: -10,
      right: -10,
      backgroundColor: p.glow,
      opacity: 0.16,
      transform: [{ rotate: '10deg' }],
      borderRadius: 160,
    },
    floatingGlows: { ...StyleSheet.absoluteFillObject },
    floatingOrb: {
      position: 'absolute',
      width: 120,
      height: 120,
      borderRadius: 999,
      backgroundColor: p.orb,
    },
    
    // Actions
    actions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    actionsMobile: { gap: 6 },
    actionButton: {
      paddingHorizontal: 12,
      paddingVertical: 10,
      borderRadius: 10,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: p.border,
      minWidth: 100,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: p.surfaceAlt,
    },
    actionButtonSmall: {
      minWidth: 50,
      paddingHorizontal: 8,
      paddingVertical: 8,
    },
    actionButtonLarge: {
      minWidth: 140,
      paddingVertical: 12,
    },
    actionGhost: { backgroundColor: 'transparent', borderWidth: 1.2, borderColor: p.border },
    actionText: { color: p.textPrimary, fontWeight: '700', letterSpacing: 0.05, fontSize: 14 },
    actionTextSmall: { fontSize: 12 },
    actionGhostText: { color: p.textPrimary, fontWeight: '600', letterSpacing: 0.05, fontSize: 14 },
    
    // Cost Info
    costInfo: { gap: 8, marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: p.borderSoft },
    costLabel: { color: p.textPrimary, fontWeight: '700', fontSize: 13 },
    costGrid: { gap: 6 },
    costRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 6 },
    costRowLabel: { color: p.textSecondary, fontSize: 12, flex: 1 },
    costRowValues: { flexDirection: 'row', gap: 4 },
    costValue: { color: p.accent, fontSize: 11, fontWeight: '600' },
    
    // Buildings List
    buildingsList: { gap: 8, marginTop: 8 },
    buildingRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 8,
      paddingHorizontal: 8,
      borderRadius: 10,
      backgroundColor: p.surfaceAlt,
      borderWidth: 1,
      borderColor: p.borderSoft,
    },
    buildingInfo: { flex: 1, gap: 4 },
    buildingName: { color: p.textPrimary, fontWeight: '700', fontSize: 13 },
    buildingPos: { color: p.muted, fontSize: 11 },
    buildingActions: { flexDirection: 'row', gap: 4 },
    
    // Move Banner
    moveBanner: {
      marginTop: 8,
      paddingVertical: 10,
      paddingHorizontal: 12,
      borderRadius: 10,
      backgroundColor: p.statusBg,
      borderWidth: 1,
      borderColor: p.chipBorder,
    },
    bannerActive: {
      backgroundColor: p.chipActiveBg,
      borderColor: p.chipActiveBorder,
    },
    moveBannerText: { color: p.textPrimary, fontWeight: '700', fontSize: 13 },
    
    // Empty State
    emptyState: {
      paddingVertical: 24,
      alignItems: 'center',
      justifyContent: 'center',
    },
    emptyStateText: { color: p.muted, fontSize: 14 },
  });
