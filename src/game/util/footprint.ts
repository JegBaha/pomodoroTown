import { BuildingType, Footprint } from '../types';

const defaults: Record<BuildingType, Footprint> = {
  town_hall: { width: 3, height: 3 },
  farm: { width: 2, height: 2 },
  sawmill: { width: 2, height: 2 },
  mine: { width: 2, height: 2 },
  market: { width: 2, height: 2 },
  decor: { width: 1, height: 1 },
};

export const getFootprint = (type: BuildingType): Footprint => defaults[type] ?? { width: 1, height: 1 };
