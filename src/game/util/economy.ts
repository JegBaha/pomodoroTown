import { BuildingType, Resources, TownState } from '../types';

const buildingPlaceCost: Record<BuildingType, Resources> = {
  town_hall: { gold: 0, wood: 0, stone: 0, food: 0 },
  farm: { gold: 40, wood: 60, stone: 10, food: 0 },
  sawmill: { gold: 50, wood: 80, stone: 20, food: 0 },
  mine: { gold: 80, wood: 40, stone: 40, food: 0 },
  market: { gold: 100, wood: 60, stone: 40, food: 0 },
  decor: { gold: 10, wood: 10, stone: 5, food: 0 },
};

const upgradeBaseCost: Record<BuildingType, Resources> = {
  town_hall: { gold: 120, wood: 80, stone: 60, food: 0 },
  farm: { gold: 60, wood: 60, stone: 20, food: 0 },
  sawmill: { gold: 70, wood: 80, stone: 30, food: 0 },
  mine: { gold: 90, wood: 60, stone: 60, food: 0 },
  market: { gold: 110, wood: 80, stone: 50, food: 0 },
  decor: { gold: 5, wood: 5, stone: 2, food: 0 },
};

export const getPlaceCost = (type: BuildingType): Resources => buildingPlaceCost[type];

export const getUpgradeCost = (type: BuildingType, level: number): Resources => {
  const base = upgradeBaseCost[type];
  if (!base) return base;
  // Simple scaling: cost grows 10% per level beyond 1
  const factor = 1 + (level - 1) * 0.1;
  return Object.fromEntries(
    Object.entries(base).map(([k, v]) => [k, Math.ceil((v as number) * factor)]),
  ) as Resources;
};

export const hasResources = (state: TownState, cost: Resources) =>
  Object.entries(cost).every(([key, value]) => state.resources[key as keyof Resources] >= value);

export const payResources = (state: TownState, cost: Resources): TownState => {
  const nextResources = { ...state.resources };
  (Object.keys(cost) as (keyof Resources)[]).forEach((k) => {
    nextResources[k] -= cost[k];
  });
  return { ...state, resources: nextResources };
};
