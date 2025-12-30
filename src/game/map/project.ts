import { Footprint } from '../types';

export type WorldPoint = { x: number; y: number };
export type ScreenPoint = { x: number; y: number };

export type Projection = {
  worldToScreen: (point: WorldPoint) => ScreenPoint;
  screenToWorld: (point: ScreenPoint) => WorldPoint;
};

// Top-down orthographic projection (identity).
export const topDownProjection: Projection = {
  worldToScreen: (point) => point,
  screenToWorld: (point) => point,
};

export const projectFootprint = (origin: WorldPoint, footprint: Footprint) => ({
  width: footprint.width,
  height: footprint.height,
  x: origin.x,
  y: origin.y,
});
