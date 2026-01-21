import React, { useMemo } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { useDesignTokens } from '@/hooks/use-design-tokens';
import { getFootprint } from '../util/footprint';
import { TownState, BuildingType } from '../types';
import { BuildingSprite } from './BuildingSprite';

type Props = {
  state: TownState;
  tileSize?: number;
  onTilePress?: (pos: { x: number; y: number }) => void;
  selectedBuildingId?: string;
  onBuildingPress?: (id: string) => void;
};

export const PixelTownMap: React.FC<Props> = React.memo(({
  state,
  tileSize = 48,
  onTilePress,
  selectedBuildingId,
  onBuildingPress,
}) => {
  const { colors, radius, shadows, isDark } = useDesignTokens();
  const { map, buildings } = state;

  const widthPx = useMemo(() => map.width * tileSize, [map.width, tileSize]);
  const heightPx = useMemo(() => map.height * tileSize, [map.height, tileSize]);

  // Generate checkerboard tile pattern
  const tileGrid = useMemo(() => {
    const rows = [];
    for (let row = 0; row < map.height; row++) {
      const tiles = [];
      for (let col = 0; col < map.width; col++) {
        const isAlternate = (row + col) % 2 === 0;
        tiles.push(
          <Pressable
            key={`tile-${row}-${col}`}
            style={[
              styles.tile,
              {
                width: tileSize,
                height: tileSize,
                backgroundColor: isAlternate ? colors.mapTile : colors.mapTileAlt,
              },
            ]}
            disabled={!onTilePress}
            onPress={() => onTilePress?.({ x: col, y: row })}
          />
        );
      }
      rows.push(
        <View key={`row-${row}`} style={styles.row}>
          {tiles}
        </View>
      );
    }
    return rows;
  }, [map.width, map.height, tileSize, colors, onTilePress]);

  // Render buildings with pixel art sprites
  const buildingElements = useMemo(() =>
    buildings.map((b) => {
      const footprint = b.footprint ?? getFootprint(b.type);
      const left = b.x * tileSize;
      const top = b.y * tileSize;
      const width = footprint.width * tileSize;
      const height = footprint.height * tileSize;
      const isSelected = selectedBuildingId === b.id;

      return (
        <Pressable
          key={b.id}
          onPress={() => onBuildingPress?.(b.id)}
          style={({ pressed }) => [
            styles.buildingContainer,
            {
              left,
              top,
              width,
              height,
              transform: [{ scale: pressed ? 0.98 : 1 }],
            },
          ]}>
          {/* Shadow */}
          <View
            style={[
              styles.buildingShadow,
              {
                backgroundColor: colors.mapShadow,
                width: width - 8,
                height: height - 8,
              },
            ]}
          />

          {/* Building Sprite */}
          <View
            style={[
              styles.building,
              {
                width: width - 4,
                height: height - 4,
                borderColor: isSelected ? colors.accent : colors.border,
                borderWidth: isSelected ? 2 : 1,
                backgroundColor: colors.surface,
                ...shadows.md,
              },
            ]}>
            <BuildingSprite
              type={b.type}
              level={b.level}
              size={Math.min(width, height) - 24}
              isDark={isDark}
            />

            {/* Level Badge */}
            <View
              style={[
                styles.levelBadge,
                {
                  backgroundColor: colors.accentSoft,
                  borderColor: colors.accent,
                },
              ]}>
              <ThemedText
                style={[
                  styles.levelText,
                  { color: colors.accent },
                ]}>
                {b.level}
              </ThemedText>
            </View>
          </View>

          {/* Selection Glow */}
          {isSelected && (
            <View
              style={[
                styles.selectionGlow,
                {
                  borderColor: colors.accent,
                  width: width - 2,
                  height: height - 2,
                },
              ]}
            />
          )}
        </Pressable>
      );
    }), [buildings, tileSize, colors, shadows, isDark, selectedBuildingId, onBuildingPress]);

  return (
    <View
      style={[
        styles.wrapper,
        {
          width: widthPx,
          height: heightPx,
          borderColor: colors.border,
          backgroundColor: colors.surface,
          borderRadius: radius.lg,
          ...shadows.lg,
        },
      ]}>
      {/* Grid Background */}
      <View style={styles.grid}>
        {tileGrid}
      </View>

      {/* Grid Lines Overlay */}
      <View
        style={[
          StyleSheet.absoluteFill,
          styles.gridOverlay,
          { borderColor: colors.mapGrid },
        ]}
        pointerEvents="none"
      />

      {/* Buildings */}
      {buildingElements}
    </View>
  );
}, (prevProps, nextProps) => {
  return (
    prevProps.tileSize === nextProps.tileSize &&
    prevProps.selectedBuildingId === nextProps.selectedBuildingId &&
    prevProps.state.buildings === nextProps.state.buildings &&
    prevProps.state.map.width === nextProps.state.map.width &&
    prevProps.state.map.height === nextProps.state.map.height
  );
});

const styles = StyleSheet.create({
  wrapper: {
    position: 'relative',
    overflow: 'hidden',
    borderWidth: 1,
  },
  grid: {
    flexDirection: 'column',
  },
  row: {
    flexDirection: 'row',
  },
  tile: {
    // Clean, minimal tiles
  },
  gridOverlay: {
    borderWidth: 0.5,
    opacity: 0.3,
  },
  buildingContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buildingShadow: {
    position: 'absolute',
    bottom: -2,
    borderRadius: 8,
    opacity: 0.4,
  },
  building: {
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  levelBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  levelText: {
    fontSize: 11,
    fontWeight: '700',
  },
  selectionGlow: {
    position: 'absolute',
    borderRadius: 12,
    borderWidth: 2,
    opacity: 0.6,
  },
});

export default PixelTownMap;
