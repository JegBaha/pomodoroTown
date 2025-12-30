import React, { useMemo } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';

import { useColorScheme } from '@/hooks/use-color-scheme';

const { width } = Dimensions.get('window');

export const ForestBackground: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const scheme = useColorScheme() ?? 'dark';
  const isDark = scheme === 'dark';

  const palette = useMemo(
    () =>
      isDark
        ? {
            base: ['#050910', '#0a1724', '#050910'] as const,
            accent: ['rgba(92,230,255,0.16)', 'transparent'] as const,
            layer2: ['#0e2435', '#0a1a2a'] as const,
            layer3: ['#124665', '#0c2438'] as const,
            haloColor: 'rgba(92,230,255,0.18)',
            blurTint: 'dark' as const,
            background: '#0b1a0d',
          }
        : {
            base: ['#f6f9ff', '#eef4fa', '#f9fbff'] as const,
            accent: ['rgba(74,182,255,0.16)', 'transparent'] as const,
            layer2: ['#e7f2ff', '#edf6ff'] as const,
            layer3: ['#cfe9ff', '#e8f4ff'] as const,
            haloColor: 'rgba(74,182,255,0.18)',
            blurTint: 'light' as const,
            background: '#eef3f8',
          },
    [isDark],
  );

  const styles = useMemo(() => createStyles(palette), [palette]);

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[...palette.base]}
        locations={[0, 0.55, 1]}
        style={StyleSheet.absoluteFillObject}
      />
      <LinearGradient
        colors={[...palette.accent]}
        start={{ x: 0.1, y: 0 }}
        end={{ x: 1, y: 0.8 }}
        style={[styles.layer, { top: -60, height: 260 }]}
      />
      <LinearGradient
        colors={[...palette.layer2]}
        start={{ x: 0, y: 1 }}
        end={{ x: 1, y: 0 }}
        style={[styles.layer, { top: 120, height: 320, opacity: 0.85 }]}
      />
      <LinearGradient
        colors={[...palette.layer3]}
        start={{ x: 1, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={[styles.layer, { top: 210, height: 340, opacity: 0.5 }]}
      />
      <View style={[styles.halo, { backgroundColor: palette.haloColor }]} />
      <BlurView intensity={55} tint={palette.blurTint} style={StyleSheet.absoluteFill} />
      <View style={styles.content}>{children}</View>
    </View>
  );
};

const createStyles = (palette: {
  background: string;
  haloColor: string;
}) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: palette.background,
    },
    layer: {
      position: 'absolute',
      width: width * 1.2,
      left: -(width * 0.1),
      borderBottomLeftRadius: width,
      borderBottomRightRadius: width,
      borderTopLeftRadius: width,
      borderTopRightRadius: width,
      transform: [{ scaleX: 1.2 }],
    },
    content: {
      flex: 1,
    },
    halo: {
      position: 'absolute',
      width: width * 0.7,
      height: 240,
      borderRadius: width,
      opacity: 0.22,
      top: 50,
      left: width * 0.18,
      transform: [{ rotate: '-8deg' }],
    },
  });
