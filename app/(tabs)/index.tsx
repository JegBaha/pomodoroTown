import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  TextInput,
  Animated,
  Easing,
  Modal,
  TouchableWithoutFeedback,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { ForestBackground } from '@/components/forest-background';
import { ThemedText } from '@/components/themed-text';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useGame } from '@/src/game/game-provider';
import { getSessionRewardPreview } from '@/src/game/state/apply';
import { useLocale } from '@/src/locale/i18n';

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
  inputPlaceholder: string;
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
  inputPlaceholder: '#7ba3b8',
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
  inputPlaceholder: '#8ab4cc',
  accent: '#5ac8ff',
  accent2: '#7dd8c8',
  accentWarm: '#ffd89c',
};

const gradientFromPalette = (p: Palette) => [p.accent, p.accent2, p.accentWarm] as const;

export default function PomodoroScreen() {
  const colorScheme = useColorScheme() ?? 'dark';
  const { t } = useLocale();
  const palette = useMemo<Palette>(
    () => (colorScheme === 'dark' ? darkPalette : lightPalette),
    [colorScheme],
  );
  const styles = useMemo(() => createStyles(palette), [palette]);
  const accentGradient = useMemo(() => gradientFromPalette(palette), [palette]);
  const { town, enqueue, commands, syncNow, syncing } = useGame();
  const active = town.timers.session;
  const [now, setNow] = useState(Date.now());
  const [selectedActivityId, setSelectedActivityId] = useState<string | undefined>(undefined);
  const [newActivity, setNewActivity] = useState({
    name: '',
    category: '',
  });
  const [newTask, setNewTask] = useState({ name: '', target: '' });
  const [taskIncrements, setTaskIncrements] = useState<Record<string, string>>({});
  const [startModalVisible, setStartModalVisible] = useState(false);
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [selectedMinutes, setSelectedMinutes] = useState(25);
  const [selectedResource, setSelectedResource] = useState<'mine' | 'sawmill' | 'farm' | 'market'>(
    'mine',
  );
  const [completionInfo, setCompletionInfo] = useState<{
    visible: boolean;
    minutes: number;
    xp: number;
    rewardAmount: number;
    rewardResource: string;
  }>({ visible: false, minutes: 0, xp: 0, rewardAmount: 0, rewardResource: '' });
  const [chartVisible, setChartVisible] = useState(false);
  const heroPulse = useRef(new Animated.Value(0)).current;
  const shimmer = useRef(new Animated.Value(0)).current;
  const float = useRef(new Animated.Value(0)).current;
  const ringProgress = useRef(new Animated.Value(0)).current;
  const starPulse = useRef(new Animated.Value(0)).current;
  const ringSize = 192;
  const strokeWidth = 10;
  const selectedActivity = useMemo(
    () => town.activities.find((a) => a.id === selectedActivityId),
    [selectedActivityId, town.activities],
  );
  const selectedProgress = selectedActivity
    ? town.activityProgress[selectedActivity.id] ?? { level: 1, xp: 0 }
    : { level: 1, xp: 0 };

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [active?.sessionId]);

  useEffect(() => {
    if (!selectedActivityId && town.activities[0]) {
      setSelectedActivityId(town.activities[0].id);
    }
  }, [selectedActivityId, town.activities]);

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
    Animated.loop(
      Animated.sequence([
        Animated.timing(starPulse, { toValue: 1, duration: 1800, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
        Animated.timing(starPulse, { toValue: 0, duration: 1800, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
      ]),
    ).start();
  }, [heroPulse, shimmer, float]);

  const progress = useMemo(() => {
    if (!active) return 0;
    const elapsed = now - active.startAt;
    const total = active.plannedDuration * 1000;
    return Math.min(1, Math.max(0, elapsed / total));
  }, [active, now]);

  useEffect(() => {
    Animated.timing(ringProgress, {
      toValue: progress,
      duration: 300,
      easing: Easing.inOut(Easing.quad),
      useNativeDriver: false,
    }).start();
  }, [progress, ringProgress]);
  const rightRotation = ringProgress.interpolate({
    inputRange: [0, 0.5],
    outputRange: ['0deg', '180deg'],
    extrapolate: 'clamp',
  });
  const leftRotation = ringProgress.interpolate({
    inputRange: [0.5, 1],
    outputRange: ['0deg', '180deg'],
    extrapolate: 'clamp',
  });

  const sparkleStars = useMemo(
    () => [
      { top: 30, left: 40, size: 6 },
      { top: 80, left: 120, size: 5 },
      { top: 160, left: 60, size: 4 },
      { top: 200, left: 200, size: 7 },
      { top: 60, left: 240, size: 5 },
    ],
    [],
  );

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const remainingSeconds = active
    ? Math.max(0, Math.round((active.plannedDuration * 1000 - (now - active.startAt)) / 1000))
    : 0;

  const handleStart = (minutes: number) => {
    const activityId = selectedActivityId ?? town.activities[0]?.id;
    if (!activityId) return;
    enqueue(commands.startSession(minutes * 60, activityId, selectedResource));
    setStartModalVisible(false);
  };

  const handleComplete = () => {
    if (!active) return;
    const preview = getSessionRewardPreview(town, Date.now());
    if (preview) {
      setCompletionInfo({
        visible: true,
        minutes: preview.minutes,
        xp: preview.xp,
        rewardAmount: preview.rewardAmount,
        rewardResource: preview.rewardResource,
      });
    }
    enqueue(commands.completeSession(active.sessionId));
  };

  const handleAddActivity = () => {
    if (!newActivity.name.trim()) return;
    // Kaynak tipi otomatik: mine (gosterimde kaynak tipini listede goreceksin)
    enqueue(
      commands.addActivity(newActivity.name.trim(), newActivity.category.trim() || 'Ozel', 'mine'),
    );
    setNewActivity({ name: '', category: '' });
    setAddModalVisible(false);
  };

  const handleDeleteActivity = (activityId: string) => {
    enqueue(commands.deleteActivity(activityId));
    if (selectedActivityId === activityId) {
      setSelectedActivityId(town.activities.find((a) => a.id !== activityId)?.id);
    }
  };

  const handleAddTask = () => {
    if (!newTask.name.trim()) return;
    const parsed = parseInt(newTask.target, 10);
    const target = Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
    const rewardXp = 5;
    enqueue(commands.addTask(newTask.name.trim(), target, rewardXp));
    setNewTask({ name: '', target: '' });
  };

  const todayChart = useMemo(() => {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const startMs = start.getTime();
    const endMs = startMs + 24 * 60 * 60 * 1000;
    const entries = town.sessionLog.filter((s) => s.at >= startMs && s.at < endMs);
    const byCat: Record<string, number> = {};
    const byActivity: Record<
      string,
      { minutes: number; name: string; category: string }
    > = {};
    entries.forEach((entry) => {
      const act = town.activities.find((a) => a.id === entry.activityId);
      const key = act ? act.category : 'Bilinmiyor';
      byCat[key] = (byCat[key] ?? 0) + entry.minutes;
      if (act) {
        const prev = byActivity[act.id] ?? { minutes: 0, name: act.name, category: act.category };
        byActivity[act.id] = { ...prev, minutes: prev.minutes + entry.minutes };
      }
    });
    const total = entries.reduce((sum, e) => sum + e.minutes, 0);
    const max = Math.max(10, ...Object.values(byCat));
    return { byCat, max, byActivity: Object.values(byActivity), total, hasData: entries.length > 0 };
  }, [town.activities, town.sessionLog]);

  const renderChart = () => {
    const entries = Object.entries(todayChart.byCat);
    if (entries.length === 0) {
      return <ThemedText style={styles.subtle}>Bugun icin veri yok</ThemedText>;
    }
    return (
      <View style={{ gap: 8 }}>
        {entries.map(([cat, mins]) => (
          <View key={cat} style={{ gap: 4 }}>
            <ThemedText style={styles.activityChipTitle}>
              {cat} - {mins} dk
            </ThemedText>
            <View style={styles.chartBarTrack}>
              <View
                style={[
                  styles.chartBarFill,
                  { width: `${(mins / todayChart.max) * 100}%`, backgroundColor: palette.accent },
                ]}
              />
            </View>
          </View>
        ))}
      </View>
    );
  };

  const ResourcePill = ({ label, value }: { label: string; value: number }) => (
    <View style={styles.resourcePill}>
      <ThemedText style={styles.resourceLabel}>{label}</ThemedText>
      <ThemedText style={styles.resourceValue}>{value}</ThemedText>
    </View>
  );

  const ActionButton = ({
    label,
    onPress,
    disabled,
    variant = 'solid',
    palette: _palette,
  }: {
    label: string;
    onPress: () => void;
    disabled?: boolean;
    variant?: 'solid' | 'ghost';
    palette?: Palette;
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
    action,
    palette: _panelPalette,
  }: {
    title: string;
    subtitle?: string;
    children: React.ReactNode;
    action?: React.ReactNode;
    palette?: Palette;
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
        <View style={styles.panelHeader}>
          <ThemedText style={styles.panelTitle}>{title}</ThemedText>
          {action}
        </View>
        {subtitle ? <ThemedText style={styles.panelSubtitle}>{subtitle}</ThemedText> : null}
        {children}
      </View>
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
                    scale: heroPulse.interpolate({ inputRange: [0, 1], outputRange: [0.98, 1.04] }),
                  },
                  { rotate: heroPulse.interpolate({ inputRange: [0, 1], outputRange: ['-10deg', '-4deg'] }) },
                ],
              },
            ]}
          />
          <View pointerEvents="none" style={styles.starField}>
            {sparkleStars.map((s, idx) => (
              <Animated.View
                key={idx}
                style={[
                  styles.star,
                  {
                    top: s.top,
                    left: s.left,
                    width: s.size,
                    height: s.size,
                    opacity: starPulse.interpolate({ inputRange: [0, 1], outputRange: [0.3, 0.9] }),
                    transform: [
                      {
                        scale: starPulse.interpolate({ inputRange: [0, 1], outputRange: [0.85, 1.15] }),
                      },
                    ],
                  },
                ]}
              />
            ))}
          </View>
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
                  { rotate: '-10deg' },
                ],
              },
            ]}
          />
          <View style={styles.heroHeader}>
            <View style={styles.heroBadge}>
              <ThemedText style={styles.heroBadgeText}>{t('pom.hero.badge')}</ThemedText>
            </View>
            <Pressable onPress={syncNow} style={styles.syncChip}>
              <ThemedText style={styles.syncChipText}>
                {syncing ? t('pom.sync') : t('pom.sync')}
              </ThemedText>
            </Pressable>
          </View>
          <ThemedText style={styles.heroTitle}>{t('pom.hero.title')}</ThemedText>
          <ThemedText style={styles.heroSubtitle}>{t('pom.hero.subtitle')}</ThemedText>
          <View style={styles.levelRow}>
            <ThemedText style={styles.levelText}>
              {t('pom.level', { level: selectedProgress.level, xp: selectedProgress.xp })}
            </ThemedText>
            <ThemedText style={styles.levelHint}>{t('pom.level.hint')}</ThemedText>
          </View>
          <View style={styles.timerShell}>
            <View
              style={[
                styles.timerTrack,
                {
                  width: ringSize,
                  height: ringSize,
                  borderRadius: ringSize / 2,
                  borderWidth: strokeWidth,
                  borderColor: palette.progressBorder,
                },
              ]}
            />
            <Animated.View
              style={[
                styles.halfWrap,
                {
                  width: ringSize,
                  height: ringSize,
                  transform: [{ rotate: rightRotation }],
                },
              ]}>
              <View
                style={[
                  styles.halfCircle,
                  {
                    width: ringSize,
                    height: ringSize,
                    borderRadius: ringSize / 2,
                    borderWidth: strokeWidth,
                    borderTopColor: palette.accent,
                    borderRightColor: palette.accent,
                  },
                ]}
              />
            </Animated.View>
            <Animated.View
              style={[
                styles.halfWrap,
                {
                  width: ringSize,
                  height: ringSize,
                  opacity: progress >= 0.5 ? 1 : 0,
                  transform: [{ rotate: leftRotation }],
                },
              ]}>
              <View
                style={[
                  styles.halfCircle,
                  {
                    width: ringSize,
                    height: ringSize,
                    borderRadius: ringSize / 2,
                    borderWidth: strokeWidth,
                    borderBottomColor: palette.accent,
                    borderLeftColor: palette.accent,
                  },
                ]}
              />
            </Animated.View>
            <Pressable
              style={styles.timerButton}
              onPress={active ? handleComplete : () => setStartModalVisible(true)}>
              <ThemedText style={styles.timerLabel}>{active ? 'Bitir' : 'Baslat'}</ThemedText>
              <ThemedText style={styles.timerTime}>
                {active ? formatTime(remainingSeconds) : `${selectedMinutes} dk`}
              </ThemedText>
            </Pressable>
          </View>
          {active ? (
            <View style={styles.sessionStats}>
              <View style={styles.progressBar}>
                <LinearGradient
                  colors={accentGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.progressFill, { width: `${progress * 100}%` }]}
                />
              </View>
              <View style={styles.sessionRow}>
                <ThemedText style={styles.sessionTime}>{formatTime(remainingSeconds)} kaldi</ThemedText>
                <ThemedText style={styles.subtle}>
                  Baslangic: {new Date(active.startAt).toLocaleTimeString()}
                </ThemedText>
              </View>
            </View>
          ) : (
            <ThemedText style={styles.subtle}>Henuz oturum yok. Dakika sec ve baslat.</ThemedText>
          )}
        </View>

        <Panel
          palette={palette}
          title="Aktif Oturum"
          subtitle="Odak suren premium bir akisla takip ediliyor"
        action={
          active ? (
            <View style={styles.statusPill}>
              <ThemedText style={styles.statusPillText}>canli</ThemedText>
            </View>
          ) : null
        }>
         {active ? (
           <>
              <ThemedText style={styles.subtle}>
                {Math.round(active.plannedDuration / 60)} dk - #{active.sessionId.slice(0, 6)}
              </ThemedText>
            </>
          ) : (
            <ThemedText style={styles.subtle}>Henuz oturum yok. Ritmini sec ve basla.</ThemedText>
          )}
        </Panel>

        <Panel title="Baslat" subtitle="Dakika ve aktiviteyi pop-up ile sec" palette={palette}>
          <View style={styles.actions}>
            <ActionButton
              label="Aktivite ekle"
              onPress={() => setAddModalVisible(true)}
              variant="ghost"
              palette={palette}
            />
            <ActionButton label={syncing ? 'Sync...' : 'Sync'} onPress={syncNow} variant="ghost" palette={palette} />
          </View>
        </Panel>

        <Panel title="Kaynaklar" subtitle="Odagin kasabada altin, odun, tas ve yemek olur" palette={palette}>
          <View style={styles.resources}>
            <ResourcePill label="Gold" value={town.resources.gold} />
            <ResourcePill label="Wood" value={town.resources.wood} />
            <ResourcePill label="Stone" value={town.resources.stone} />
            <ResourcePill label="Food" value={town.resources.food} />
          </View>
        </Panel>

        <Panel
          title="Gunluk Tablo"
          subtitle="Bugun hangi aktiviteye kac dakika ayirdin"
          palette={palette}
          action={
            <ActionButton label="Grafik" onPress={() => setChartVisible(true)} variant="ghost" palette={palette} />
          }>
          {todayChart.hasData ? (
            <View style={{ gap: 8 }}>
              <ThemedText style={styles.activityChipMeta}>Toplam: {todayChart.total} dk</ThemedText>
              {todayChart.byActivity.map((row) => (
                <View key={row.name} style={styles.tableRow}>
                  <ThemedText style={styles.activityChipTitle}>{row.name}</ThemedText>
                  <ThemedText style={styles.activityChipMeta}>{row.category}</ThemedText>
                  <ThemedText style={styles.activityChipTitle}>{row.minutes} dk</ThemedText>
                </View>
              ))}
            </View>
          ) : (
            <ThemedText style={styles.subtle}>Bugun icin veri yok</ThemedText>
          )}
        </Panel>

        <Panel title="Gorevler" subtitle="Kucuk isler icin ekstra XP" palette={palette}>
          <View style={styles.modalSection}>
            <TextInput
              placeholder="Gorev adi"
              placeholderTextColor={palette.inputPlaceholder}
              style={styles.textInput}
              value={newTask.name}
              onChangeText={(t) => setNewTask((p) => ({ ...p, name: t }))}
            />
            <View style={styles.actions}>
              <TextInput
                placeholder="Hedef (bos => tek adim)"
                placeholderTextColor={palette.inputPlaceholder}
                style={[styles.textInput, { flex: 1 }]}
                keyboardType="number-pad"
                value={newTask.target}
                onChangeText={(t) => setNewTask((p) => ({ ...p, target: t }))}
              />
              <ActionButton label="Ekle" onPress={handleAddTask} palette={palette} />
            </View>
          </View>
          {town.tasks.length === 0 ? (
            <ThemedText style={styles.subtle}>Gorev yok</ThemedText>
          ) : (
            town.tasks.map((task) => (
              <View key={task.id} style={styles.taskRow}>
                <View style={{ flex: 1 }}>
                  <ThemedText style={styles.activityChipTitle}>{task.name}</ThemedText>
                  <ThemedText style={styles.activityChipMeta}>
                    {task.progress}/{task.target} · {task.rewardXp} XP
                  </ThemedText>
                </View>
                {!task.completed ? (
                  task.target <= 1 ? (
                    <View style={styles.taskActions}>
                      <ActionButton
                        label="Tamamla"
                        onPress={() => enqueue(commands.completeTask(task.id))}
                        palette={palette}
                      />
                    </View>
                  ) : (
                    <View style={styles.taskActions}>
                      <TextInput
                        placeholder="+ miktar"
                        placeholderTextColor={palette.inputPlaceholder}
                        style={[styles.textInput, { width: 82, paddingVertical: 8 }]}
                        keyboardType="number-pad"
                        value={taskIncrements[task.id] ?? '1'}
                        onChangeText={(t) =>
                          setTaskIncrements((prev) => ({
                            ...prev,
                            [task.id]: t,
                          }))
                        }
                      />
                      <ActionButton
                        label="Ekle"
                        onPress={() => {
                          const parsed = parseInt(taskIncrements[task.id] ?? '1', 10);
                          const delta = Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
                          enqueue(commands.updateTaskProgress(task.id, delta));
                        }}
                        palette={palette}
                      />
                      <ActionButton
                        label="Tamamla"
                        onPress={() => enqueue(commands.completeTask(task.id))}
                        variant="ghost"
                        palette={palette}
                      />
                    </View>
                  )
                ) : (
                  <ThemedText style={styles.statusPillText}>Tamamlandi</ThemedText>
                )}
              </View>
            ))
          )}
        </Panel>
        </View>
      </ScrollView>

      <Modal transparent visible={startModalVisible} animationType="fade">
        <TouchableWithoutFeedback onPress={() => setStartModalVisible(false)}>
          <View style={styles.modalBackdrop} />
        </TouchableWithoutFeedback>
        <View style={styles.modalCard}>
          <ThemedText style={styles.modalTitle}>Pomodoro baslat</ThemedText>
          <ThemedText style={styles.modalSubtitle}>Dakika, aktivite ve kaynak sec</ThemedText>
          <View style={styles.modalSection}>
            <ThemedText style={styles.modalLabel}>Dakika</ThemedText>
            <View style={styles.chipRow}>
              {[5, 15, 25, 50].map((m) => (
                <Pressable
                  key={m}
                  onPress={() => setSelectedMinutes(m)}
                  style={[styles.durationChip, selectedMinutes === m && styles.durationChipActive]}>
                  <ThemedText
                    style={
                      selectedMinutes === m ? styles.durationChipTextActive : styles.durationChipText
                    }>
                    {m} dk
                  </ThemedText>
                </Pressable>
              ))}
            </View>
          </View>
          <View style={styles.modalSection}>
            <ThemedText style={styles.modalLabel}>Aktivite</ThemedText>
            {town.activities.length === 0 ? (
              <ThemedText style={styles.subtle}>Once aktivite ekle.</ThemedText>
            ) : (
              <View style={styles.activityChips}>
                {town.activities.map((act) => {
                  const progress = town.activityProgress[act.id] ?? { level: 1, xp: 0 };
                  const isActive = act.id === selectedActivityId;
                  return (
                    <Pressable
                      key={act.id}
                      onPress={() => setSelectedActivityId(act.id)}
                      style={[styles.activityChip, isActive && styles.activityChipActive]}>
                      <ThemedText style={styles.activityChipTitle}>{act.name}</ThemedText>
                      <ThemedText style={styles.activityChipMeta}>
                        {act.category} · Lv {progress.level}
                      </ThemedText>
                      <View style={styles.activityActionsRow}>
                        <ActionButton
                          label="Sec"
                          onPress={() => setSelectedActivityId(act.id)}
                          palette={palette}
                        />
                        <ActionButton
                          label="Sil"
                          onPress={() => handleDeleteActivity(act.id)}
                          variant="ghost"
                          palette={palette}
                        />
                      </View>
                    </Pressable>
                  );
                })}
              </View>
            )}
          </View>
          {selectedActivityId ? (
            <View style={styles.modalSection}>
              <ThemedText style={styles.modalLabel}>Kaynak turu</ThemedText>
              <View style={styles.chipRow}>
                {(['mine', 'sawmill', 'farm', 'market'] as const).map((rt) => (
                  <Pressable
                    key={rt}
                    onPress={() => setSelectedResource(rt)}
                    style={[styles.durationChip, selectedResource === rt && styles.durationChipActive]}>
                    <ThemedText
                      style={
                        selectedResource === rt ? styles.durationChipTextActive : styles.durationChipText
                      }>
                      {rt}
                    </ThemedText>
                  </Pressable>
                ))}
              </View>
            </View>
          ) : (
            <ThemedText style={styles.subtle}>Once bir aktivite ekle ve sec.</ThemedText>
          )}
          <ActionButton label="Baslat" onPress={() => handleStart(selectedMinutes)} palette={palette} />
        </View>
      </Modal>

      <Modal transparent visible={completionInfo.visible} animationType="fade">
        <TouchableWithoutFeedback
          onPress={() => setCompletionInfo((prev) => ({ ...prev, visible: false }))}>
          <View style={styles.modalBackdrop} />
        </TouchableWithoutFeedback>
        <View style={styles.modalCard}>
          <ThemedText style={styles.modalTitle}>Pomodoro bitti</ThemedText>
          <ThemedText style={styles.modalSubtitle}>
            {completionInfo.minutes} dk odak tamamlandi
          </ThemedText>
          <View style={styles.modalSection}>
            <ThemedText style={styles.modalLabel}>Kazanc</ThemedText>
            <ThemedText>
              {completionInfo.rewardAmount} {completionInfo.rewardResource}
            </ThemedText>
            <ThemedText>XP: {completionInfo.xp}</ThemedText>
          </View>
          <ActionButton
            label="Kapat"
            onPress={() => setCompletionInfo((prev) => ({ ...prev, visible: false }))}
            palette={palette}
          />
        </View>
      </Modal>

      <Modal transparent visible={chartVisible} animationType="fade">
        <TouchableWithoutFeedback onPress={() => setChartVisible(false)}>
          <View style={styles.modalBackdrop} />
        </TouchableWithoutFeedback>
        <View style={styles.modalCard}>
          <ThemedText style={styles.modalTitle}>Gunluk Pomodoro</ThemedText>
          <ThemedText style={styles.modalSubtitle}>Kategori bazli dakikalar</ThemedText>
          {renderChart()}
          <ActionButton label="Kapat" onPress={() => setChartVisible(false)} palette={palette} />
        </View>
      </Modal>

      <Modal transparent visible={addModalVisible} animationType="fade">
        <TouchableWithoutFeedback onPress={() => setAddModalVisible(false)}>
          <View style={styles.modalBackdrop} />
        </TouchableWithoutFeedback>
        <View style={styles.modalCard}>
          <ThemedText style={styles.modalTitle}>Yeni aktivite</ThemedText>
          <View style={styles.modalSection}>
            <TextInput
              placeholder="Ad"
              placeholderTextColor={palette.inputPlaceholder}
              style={styles.textInput}
              value={newActivity.name}
              onChangeText={(t) => setNewActivity((prev) => ({ ...prev, name: t }))}
            />
            <TextInput
              placeholder="Kategori (opsiyonel)"
              placeholderTextColor={palette.inputPlaceholder}
              style={styles.textInput}
              value={newActivity.category}
              onChangeText={(t) => setNewActivity((prev) => ({ ...prev, category: t }))}
            />
          </View>
          <ActionButton label="Ekle" onPress={handleAddActivity} palette={palette} />
        </View>
      </Modal>

      <Modal transparent visible={!!active} animationType="fade">
        <View style={styles.lockBackdrop}>
          <View style={styles.lockCard}>
            <ThemedText style={styles.modalTitle}>Pomodoro sürüyor</ThemedText>
            <ThemedText style={styles.modalSubtitle}>
              Süre bitene kadar ekran kilitli. Bitir’e basarak erkenden tamamlayabilirsin.
            </ThemedText>
            <View style={styles.modalSection}>
              <ThemedText style={styles.modalLabel}>Kalan süre</ThemedText>
              <ThemedText style={styles.timerTime}>{formatTime(remainingSeconds)}</ThemedText>
            </View>
            <ActionButton label="Bitir" onPress={handleComplete} palette={palette} />
          </View>
        </View>
      </Modal>
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
    starField: { position: 'absolute', inset: 0 },
    star: {
      position: 'absolute',
      backgroundColor: p.accent,
      borderRadius: 40,
      shadowColor: p.accent,
      shadowOpacity: 0.5,
      shadowRadius: 6,
      shadowOffset: { width: 0, height: 0 },
    },
    heroHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 8,
      flexWrap: 'wrap',
    },
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
    heroTitle: { color: p.textPrimary, fontSize: 30, fontWeight: '800', letterSpacing: -0.3 },
    heroSubtitle: { color: p.textSecondary, fontSize: 15, lineHeight: 22 },
    levelRow: {
      marginTop: 2,
      marginBottom: 4,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    levelText: { color: p.textPrimary, fontWeight: '700', fontSize: 14 },
    levelHint: { color: p.muted, fontSize: 12 },
    timerShell: {
      marginTop: 6,
      width: 192,
      height: 192,
      alignSelf: 'center',
      alignItems: 'center',
      justifyContent: 'center',
    },
    timerTrack: {
      position: 'absolute',
      backgroundColor: 'transparent',
    },
    halfWrap: {
      position: 'absolute',
      alignItems: 'center',
      justifyContent: 'center',
    },
    halfCircle: {
      position: 'absolute',
      backgroundColor: 'transparent',
      borderColor: 'transparent',
    },
    timerButton: {
      position: 'absolute',
      width: 150,
      height: 150,
      borderRadius: 999,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: p.surfaceAlt,
      borderWidth: 1,
      borderColor: p.border,
      shadowColor: p.shadow,
      shadowOpacity: 0.12,
      shadowRadius: 12,
      shadowOffset: { width: 0, height: 8 },
    },
    timerLabel: { color: p.textPrimary, fontWeight: '800', fontSize: 16 },
    timerTime: { color: p.textSecondary, fontWeight: '700', fontSize: 14 },
    syncChip: {
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 999,
      borderWidth: 1,
      borderColor: p.border,
      backgroundColor: p.surfaceAlt,
    },
    syncChipText: { color: p.textPrimary, fontWeight: '600', fontSize: 13 },
    sessionStats: { gap: 6, marginTop: 12 },
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
    panelHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
    panelTitle: { color: p.textPrimary, fontWeight: '800', fontSize: 17, letterSpacing: 0.2 },
    panelSubtitle: { color: p.muted, fontSize: 14 },
    subtle: { color: p.muted, fontSize: 13 },
    progressBar: {
      width: '100%',
      height: 14,
      backgroundColor: p.progressBase,
      borderRadius: 12,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: p.progressBorder,
    },
    progressFill: { height: '100%', borderRadius: 10 },
    progressGlow: {
      position: 'absolute',
      top: -6,
      left: -10,
      width: 140,
      height: 26,
      backgroundColor: p.glow,
      borderRadius: 20,
    },
    sessionRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    sessionTime: { color: p.textPrimary, fontWeight: '700', fontSize: 16 },
    resources: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
    resourcePill: {
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
    resourceLabel: { color: p.muted, fontSize: 12, marginBottom: 2 },
    resourceValue: { color: p.textPrimary, fontWeight: '700', fontSize: 16 },
    actions: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
    actionButton: {
      paddingHorizontal: 14,
      paddingVertical: 12,
      borderRadius: 12,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: p.border,
      minWidth: 92,
      alignItems: 'center',
      backgroundColor: p.surfaceAlt,
    },
    actionGhost: {
      backgroundColor: 'transparent',
      borderWidth: 1.2,
      borderColor: p.border,
    },
    actionText: { color: p.textPrimary, fontWeight: '700', letterSpacing: 0.1 },
    actionGhostText: { color: p.textPrimary, fontWeight: '600', letterSpacing: 0.1 },
    statusPill: {
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 999,
      backgroundColor: p.statusBg,
      borderWidth: 1,
      borderColor: p.chipBorder,
    },
    statusPillText: { color: p.textPrimary, fontWeight: '700', fontSize: 12 },
    activityChips: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
    activityChip: {
      padding: 12,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: p.border,
      backgroundColor: p.surfaceAlt,
      shadowColor: p.shadow,
      shadowOpacity: 0.04,
      shadowRadius: 6,
    },
    activityChipActive: {
      borderColor: p.chipActiveBorder,
      backgroundColor: p.chipActiveBg,
    },
    activityChipTitle: { color: p.textPrimary, fontWeight: '700' },
    activityChipMeta: { color: p.muted, fontSize: 12 },
    newActivityRow: { gap: 8, marginTop: 10 },
    textInput: {
      backgroundColor: p.surfaceAlt,
      borderRadius: 12,
      paddingHorizontal: 12,
      paddingVertical: 10,
      color: p.textPrimary,
      borderWidth: 1,
      borderColor: p.border,
    },
    addButton: { overflow: 'hidden', borderRadius: 12, paddingVertical: 12, alignItems: 'center' },
    addButtonText: { color: p.textPrimary, fontWeight: '800', letterSpacing: 0.2 },
    floatingGlows: {
      ...StyleSheet.absoluteFillObject,
    },
    floatingOrb: {
      position: 'absolute',
      width: 140,
      height: 140,
      borderRadius: 999,
      backgroundColor: p.orb,
    },
    modalBackdrop: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: p.backdrop,
    },
    lockBackdrop: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(0,0,0,0.55)',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 16,
    },
    lockCard: {
      width: '100%',
      maxWidth: 420,
      backgroundColor: p.surface,
      borderRadius: 18,
      padding: 18,
      borderWidth: 1,
      borderColor: p.border,
      gap: 12,
    },
    modalCard: {
      position: 'absolute',
      left: 16,
      right: 16,
      top: '18%',
      backgroundColor: p.surface,
      borderRadius: 18,
      padding: 18,
      borderWidth: 1,
      borderColor: p.border,
      gap: 12,
    },
    modalTitle: { color: p.textPrimary, fontWeight: '800', fontSize: 18 },
    modalSubtitle: { color: p.muted, fontSize: 14 },
    modalSection: { gap: 8 },
    modalLabel: { color: p.textPrimary, fontWeight: '700', fontSize: 13 },
    chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    durationChip: {
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: p.border,
      backgroundColor: p.surfaceAlt,
    },
    durationChipActive: {
      borderColor: p.chipActiveBorder,
      backgroundColor: p.chipActiveBg,
    },
    durationChipText: { color: p.muted },
    durationChipTextActive: { color: p.textPrimary, fontWeight: '700' },
    taskRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      paddingVertical: 8,
      borderBottomWidth: 1,
      borderBottomColor: p.borderSoft,
    },
    taskActions: { flexDirection: 'row', gap: 6 },
    activityActionsRow: { flexDirection: 'row', gap: 6, marginTop: 6 },
    chartBarTrack: {
      height: 10,
      borderRadius: 10,
      backgroundColor: p.progressBase,
      borderWidth: 1,
      borderColor: p.progressBorder,
      overflow: 'hidden',
    },
    chartBarFill: {
      height: '100%',
      borderRadius: 10,
    },
    tableRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 6,
      borderBottomWidth: 1,
      borderBottomColor: p.borderSoft,
    },
  });
