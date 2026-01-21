import React, { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { BuildingType } from '../types';
import { palette } from '@/constants/design-tokens';

type Props = {
  type: BuildingType;
  level: number;
  size: number;
  isDark: boolean;
};

// Building configurations with colors and emoji
const buildingConfig: Record<BuildingType, {
  emoji: string;
  label: string;
}> = {
  town_hall: { emoji: '🏰', label: 'Town Hall' },
  farm: { emoji: '🌾', label: 'Farm' },
  sawmill: { emoji: '🪵', label: 'Sawmill' },
  mine: { emoji: '⛏️', label: 'Mine' },
  market: { emoji: '🛒', label: 'Market' },
  decor: { emoji: '🌳', label: 'Decor' },
};

export const BuildingSprite: React.FC<Props> = React.memo(({
  type,
  level,
  size,
  isDark,
}) => {
  const colors = isDark ? palette.dark : palette.light;
  const config = buildingConfig[type] || buildingConfig.decor;

  // Get building-specific colors
  const buildingColors = useMemo(() => {
    const colorMap: Record<BuildingType, { main: string; light: string }> = {
      town_hall: { main: colors.buildingTownHall, light: colors.buildingTownHallLight },
      farm: { main: colors.buildingFarm, light: colors.buildingFarmLight },
      sawmill: { main: colors.buildingSawmill, light: colors.buildingSawmillLight },
      mine: { main: colors.buildingMine, light: colors.buildingMineLight },
      market: { main: colors.buildingMarket, light: colors.buildingMarketLight },
      decor: { main: colors.buildingDecor, light: colors.buildingDecorLight },
    };
    return colorMap[type] || colorMap.decor;
  }, [type, colors]);

  const emojiSize = Math.max(size * 0.5, 24);
  const labelSize = Math.max(size * 0.12, 10);

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      {/* Background Pattern - Pixel Art Style */}
      <View
        style={[
          styles.background,
          {
            backgroundColor: buildingColors.light,
            borderColor: buildingColors.main,
          },
        ]}
      />

      {/* Decorative Pixel Corners */}
      <View style={[styles.pixelCorner, styles.topLeft, { backgroundColor: buildingColors.main }]} />
      <View style={[styles.pixelCorner, styles.topRight, { backgroundColor: buildingColors.main }]} />
      <View style={[styles.pixelCorner, styles.bottomLeft, { backgroundColor: buildingColors.main }]} />
      <View style={[styles.pixelCorner, styles.bottomRight, { backgroundColor: buildingColors.main }]} />

      {/* Center Icon */}
      <View style={styles.iconContainer}>
        <ThemedText style={[styles.emoji, { fontSize: emojiSize }]}>
          {config.emoji}
        </ThemedText>
      </View>

      {/* Building Label */}
      {size > 60 && (
        <View
          style={[
            styles.labelContainer,
            { backgroundColor: `${buildingColors.main}20` },
          ]}>
          <ThemedText
            style={[
              styles.label,
              { fontSize: labelSize, color: colors.textPrimary },
            ]}>
            {config.label}
          </ThemedText>
        </View>
      )}

      {/* Level Indicator Dots */}
      {level > 1 && (
        <View style={styles.levelDots}>
          {Array.from({ length: Math.min(level - 1, 5) }).map((_, i) => (
            <View
              key={i}
              style={[
                styles.levelDot,
                { backgroundColor: buildingColors.main },
              ]}
            />
          ))}
        </View>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  background: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 8,
    borderWidth: 2,
    opacity: 0.3,
  },
  pixelCorner: {
    position: 'absolute',
    width: 6,
    height: 6,
    borderRadius: 1,
  },
  topLeft: {
    top: 2,
    left: 2,
  },
  topRight: {
    top: 2,
    right: 2,
  },
  bottomLeft: {
    bottom: 2,
    left: 2,
  },
  bottomRight: {
    bottom: 2,
    right: 2,
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: {
    textAlign: 'center',
  },
  labelContainer: {
    position: 'absolute',
    bottom: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  label: {
    fontWeight: '600',
    textAlign: 'center',
  },
  levelDots: {
    position: 'absolute',
    top: 4,
    left: 4,
    flexDirection: 'row',
    gap: 2,
  },
  levelDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
});

export default BuildingSprite;
