import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { getFootprint } from '../util/footprint';
import { TownState } from '../types';
import { getPlaceCost } from '../util/economy';

type Props = {
  state: TownState;
  tileSize?: number;
  onTilePress?: (pos: { x: number; y: number }) => void;
  selectedBuildingId?: string;
  onBuildingPress?: (id: string) => void;
};

const palettes = {
  light: {
    tile: 'rgba(16,67,115,0.06)',
    grid: 'rgba(16,67,115,0.16)',
    border: 'rgba(16,67,115,0.16)',
    surface: 'rgba(255,255,255,0.82)',
    shadow: '#1b3a52',
    buildingBorder: 'rgba(74,182,255,0.55)',
  buildingTop: 'rgba(90,200,255,0.22)',
  buildingShadow: 'rgba(16,67,115,0.22)',
  buildingText: '#0f1f33',
  buildingMeta: '#1b3a52',
  labelBg: 'rgba(16,67,115,0.12)',
  },
  dark: {
    tile: 'rgba(92,230,255,0.06)',
    grid: 'rgba(92,230,255,0.22)',
    border: 'rgba(92,230,255,0.24)',
    surface: 'rgba(10,20,32,0.92)',
    shadow: '#5ac8ff',
    buildingBorder: 'rgba(92,230,255,0.65)',
  buildingTop: 'rgba(90,200,255,0.28)',
  buildingShadow: 'rgba(4,12,24,0.6)',
  buildingText: '#041018',
  buildingMeta: '#e7f6ff',
  labelBg: 'rgba(92,230,255,0.12)',
  },
};

const buildingColors: Record<string, string> = {
  town_hall: '#7ea1d6',
  farm: '#84b96f',
  sawmill: '#9b7a5a',
  mine: '#b2b7c5',
  market: '#dca564',
  decor: '#cfd4de',
};

export const TopDownMap: React.FC<Props> = ({
  state,
  tileSize = 44,
  onTilePress,
  selectedBuildingId,
  onBuildingPress,
}) => {
  const scheme = useColorScheme() ?? 'dark';
  const palette = scheme === 'dark' ? palettes.dark : palettes.light;
  const { map, buildings } = state;
  const widthPx = map.width * tileSize;
  const heightPx = map.height * tileSize;

  return (
    <View
      style={[
        styles.wrapper,
        {
          width: widthPx,
          height: heightPx,
          borderColor: palette.border,
          backgroundColor: palette.surface,
          shadowColor: palette.shadow,
        },
      ]}>
      <View style={styles.grid}>
        {Array.from({ length: map.height }).map((_, row) => (
          <View key={`row-${row}`} style={styles.row}>
            {Array.from({ length: map.width }).map((_, col) => (
              <Pressable
                key={`tile-${row}-${col}`}
                style={[
                  styles.tile,
                  {
                    width: tileSize,
                    height: tileSize,
                    backgroundColor: palette.tile,
                    borderColor: palette.grid,
                  },
                ]}
                disabled={!onTilePress}
                onPress={() => onTilePress?.({ x: col, y: row })}
              />
            ))}
          </View>
        ))}
      </View>

      {buildings.map((b) => {
        const footprint = b.footprint ?? getFootprint(b.type);
        const left = b.x * tileSize;
        const top = b.y * tileSize;
        const cost = getPlaceCost(b.type);
        const color = buildingColors[b.type] ?? palettes[scheme].buildingTop;
        const isSelected = selectedBuildingId === b.id;
        return (
          <React.Fragment key={b.id}>
            <View
              style={[
                styles.buildingShadow,
                {
                  left,
                  top: top + 6,
                  width: footprint.width * tileSize,
                  height: footprint.height * tileSize,
                  backgroundColor: palette.buildingShadow,
                  shadowColor: palette.shadow,
                },
              ]}
            />
          <Pressable
            onPress={() => onBuildingPress?.(b.id)}
            style={[
              styles.building,
              {
                left,
                top,
                width: footprint.width * tileSize,
                height: footprint.height * tileSize,
                borderColor: isSelected ? palette.buildingMeta : palette.buildingBorder,
                backgroundColor: color,
                shadowColor: palette.shadow,
                borderWidth: isSelected ? 2 : 1.2,
              },
            ]}>
            <Text style={[styles.buildingLabel, { color: palette.buildingText }]}>{`${b.type.replace('_', ' ')} Lv${b.level}`}</Text>
            <View style={[styles.buildingMetaPill, { backgroundColor: palette.labelBg }]}>
              <Text style={[styles.buildingMeta, { color: palette.buildingMeta }]}>{`G:${cost.gold ?? 0} W:${cost.wood ?? 0} S:${cost.stone ?? 0}`}</Text>
            </View>
          </Pressable>
          </React.Fragment>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    position: 'relative',
    overflow: 'hidden',
    borderWidth: 1,
    borderRadius: 16,
    shadowOpacity: 0.1,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 10 },
  },
  grid: {
    flexDirection: 'column',
  },
  row: {
    flexDirection: 'row',
  },
  tile: {
    borderWidth: 0.8,
  },
  building: {
    position: 'absolute',
    borderRadius: 12,
    borderWidth: 1.2,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 6,
    shadowOpacity: 0.12,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
  },
  buildingShadow: {
    position: 'absolute',
    borderRadius: 12,
    transform: [{ skewY: '-4deg' }],
    shadowOpacity: 0.22,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 10 },
  },
  buildingLabel: {
    fontWeight: '600',
    fontSize: 12,
  },
  buildingMeta: {
    fontSize: 11,
  },
  buildingMetaPill: {
    marginTop: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
});
