import { Footprint, TownState } from '../types';

export const isAreaFree = (
  state: TownState,
  x: number,
  y: number,
  footprint: Footprint,
  ignoreId?: string,
) => {
  const withinBounds =
    x >= 0 &&
    y >= 0 &&
    x + footprint.width <= state.map.width &&
    y + footprint.height <= state.map.height;

  if (!withinBounds) return false;

  const overlaps = state.buildings.some((b) => {
    if (ignoreId && b.id === ignoreId) return false;
    const bx2 = b.x + b.footprint.width;
    const by2 = b.y + b.footprint.height;
    const xOverlap = x < bx2 && x + footprint.width > b.x;
    const yOverlap = y < by2 && y + footprint.height > b.y;
    return xOverlap && yOverlap;
  });

  return !overlaps;
};

export const findNextOpenSlot = (state: TownState, footprint: Footprint) => {
  for (let row = 0; row < state.map.height; row += 1) {
    for (let col = 0; col < state.map.width; col += 1) {
      if (isAreaFree(state, col, row, footprint)) {
        return { x: col, y: row };
      }
    }
  }
  return undefined;
};
