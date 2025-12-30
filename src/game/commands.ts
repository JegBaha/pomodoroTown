import { BuildingType, Command } from './types';

const now = () => Date.now();

const makeId = () => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `cmd-${Math.random().toString(16).slice(2)}`;
};

export const commandFactory = {
  startSession(durationSeconds: number, activityId: string, rewardBuildingType?: BuildingType): Command {
    const clamped = Math.min(Math.max(durationSeconds, 300), 3600); // 5m - 60m
    return {
      id: makeId(),
      type: 'START_SESSION',
      duration: clamped,
      activityId,
      rewardBuildingType,
      clientCreatedAt: now(),
    };
  },
  completeSession(sessionId: string): Command {
    return {
      id: makeId(),
      type: 'COMPLETE_SESSION',
      sessionId,
      clientCreatedAt: now(),
    };
  },
  placeBuilding(buildingId: string, buildingType: BuildingType, x: number, y: number, rot = 0): Command {
    return {
      id: makeId(),
      type: 'PLACE_BUILDING',
      buildingId,
      buildingType,
      x,
      y,
      rot,
      clientCreatedAt: now(),
    };
  },
  moveBuilding(buildingId: string, x: number, y: number, rot = 0): Command {
    return {
      id: makeId(),
      type: 'MOVE_BUILDING',
      buildingId,
      x,
      y,
      rot,
      clientCreatedAt: now(),
    };
  },
  upgradeBuilding(buildingId: string): Command {
    return {
      id: makeId(),
      type: 'UPGRADE_BUILDING',
      buildingId,
      clientCreatedAt: now(),
    };
  },
  claimProduction(buildingId: string): Command {
    return {
      id: makeId(),
      type: 'CLAIM_PRODUCTION',
      buildingId,
      clientCreatedAt: now(),
    };
  },
  addActivity(name: string, category: string, buildingType: BuildingType): Command {
    return {
      id: makeId(),
      type: 'ADD_ACTIVITY',
      name,
      category,
      buildingType,
      activityId: makeId(),
      clientCreatedAt: now(),
    };
  },
  deleteActivity(activityId: string): Command {
    return {
      id: makeId(),
      type: 'DELETE_ACTIVITY',
      activityId,
      clientCreatedAt: now(),
    };
  },
  deleteBuilding(buildingId: string): Command {
    return {
      id: makeId(),
      type: 'DELETE_BUILDING',
      buildingId,
      clientCreatedAt: now(),
    };
  },
  addTask(name: string, target: number, rewardXp: number): Command {
    return {
      id: makeId(),
      type: 'ADD_TASK',
      name,
      target,
      rewardXp,
      taskId: makeId(),
      clientCreatedAt: now(),
    };
  },
  updateTaskProgress(taskId: string, delta: number): Command {
    return {
      id: makeId(),
      type: 'UPDATE_TASK_PROGRESS',
      taskId,
      delta,
      clientCreatedAt: now(),
    };
  },
  completeTask(taskId: string): Command {
    return {
      id: makeId(),
      type: 'COMPLETE_TASK',
      taskId,
      clientCreatedAt: now(),
    };
  },
};
