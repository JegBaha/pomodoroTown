import { ActivityProgress, BuildingType, Command, TownState } from '../types';
import { getFootprint } from '../util/footprint';
import { isAreaFree } from '../map/occupancy';
import { getPlaceCost, getUpgradeCost, hasResources, payResources } from '../util/economy';

type ApplyResult =
  | { ok: true; state: TownState; message?: string }
  | { ok: false; reason: string; state: TownState };

const MIN_SESSION_SECONDS = 300; // 5 minutes
const MAX_SESSION_SECONDS = 3600; // 60 minutes
const XP_PER_LEVEL = (level: number) => 120 + (level - 1) * 30;

const resourceForBuilding: Record<BuildingType, keyof TownState['resources']> = {
  mine: 'stone',
  sawmill: 'wood',
  farm: 'food',
  town_hall: 'gold',
  market: 'gold',
  decor: 'gold',
};

const ensureActivityProgress = (progress: Record<string, ActivityProgress>, activityId: string) => {
  if (!progress[activityId]) {
    progress[activityId] = { activityId, level: 1, xp: 0 };
  }
  return progress;
};

export const calculateSessionXp = (minutes: number) => {
  let remaining = minutes;
  let multiplier = 1;
  let total = 0;
  while (remaining > 0) {
    const chunk = Math.min(10, remaining);
    total += chunk * multiplier;
    remaining -= chunk;
    multiplier *= 2;
  }
  return total;
};

const rewardPerMinuteForLevel = (level: number) => {
  const base = 1;
  const multiplier = 1 + Math.max(0, level - 1) * 0.1;
  return base * multiplier;
};

export const getSessionRewardPreview = (state: TownState, timestamp = Date.now()) => {
  const timer = state.timers.session;
  if (!timer || !timer.active) return null;
  const activity = state.activities.find((a) => a.id === timer.activityId);
  if (!activity) return null;
  const minutes = Math.max(0, Math.floor((timestamp - timer.startAt) / 60000));
  const rewardSource = timer.rewardBuildingType ?? activity.buildingType;
  const rewardResource = resourceForBuilding[rewardSource] ?? 'gold';
  const current = state.activityProgress[activity.id] ?? { activityId: activity.id, level: 1, xp: 0 };
  const buildingCount = state.buildings.filter((b) => b.type === rewardSource).length;
  const xp = calculateSessionXp(minutes);
  const perMinute = rewardPerMinuteForLevel(current.level);
  const rewardAmount = Math.max(0, Math.round(minutes * perMinute * Math.max(1, buildingCount)));
  return { minutes, xp, rewardAmount, rewardResource, activity, current, buildingCount };
};

export const applyCommand = (state: TownState, command: Command, timestamp = Date.now()): ApplyResult => {
  switch (command.type) {
    case 'START_SESSION': {
      if (command.duration < MIN_SESSION_SECONDS || command.duration > MAX_SESSION_SECONDS) {
        return { ok: false, reason: 'invalid-duration', state };
      }
      const alreadyActive = state.timers.session?.active;
      if (alreadyActive) {
        return { ok: false, reason: 'session-already-active', state };
      }
      const activityExists = state.activities.find((a) => a.id === command.activityId);
      if (!activityExists) {
        return { ok: false, reason: 'activity-not-found', state };
      }
      return {
        ok: true,
        state: {
          ...state,
          version: state.version + 1,
          timers: {
            ...state.timers,
            session: {
              active: true,
              sessionId: command.id,
              startAt: timestamp,
              plannedDuration: command.duration,
              activityId: command.activityId,
              rewardBuildingType: command.rewardBuildingType,
            },
          },
        },
      };
    }
    case 'COMPLETE_SESSION': {
      const timer = state.timers.session;
      if (!timer || !timer.active || timer.sessionId !== command.sessionId) {
        return { ok: false, reason: 'session-not-found', state };
      }
      const preview = getSessionRewardPreview(state, timestamp);
      if (!preview) {
        return { ok: false, reason: 'activity-not-found', state };
      }
      const { activity, minutes, xp: gainedXp, rewardAmount, rewardResource, current } = preview;

      const nextActivityProgress = { ...state.activityProgress };
      ensureActivityProgress(nextActivityProgress, activity.id);
      let newXp = current.xp + gainedXp;
      let newLevel = current.level;
      while (newXp >= XP_PER_LEVEL(newLevel)) {
        newXp -= XP_PER_LEVEL(newLevel);
        newLevel += 1;
      }
      nextActivityProgress[activity.id] = { ...current, level: newLevel, xp: newXp };
      return {
        ok: true,
        state: {
          ...state,
          version: state.version + 1,
          resources: {
            ...state.resources,
            [rewardResource]: state.resources[rewardResource] + rewardAmount,
          },
          timers: { ...state.timers, session: undefined },
          activityProgress: nextActivityProgress,
          sessionLog: [
            ...state.sessionLog,
            { id: command.id, activityId: activity.id, minutes, at: timestamp },
          ],
        },
        message: minutes > 0 ? 'session-complete' : 'session-ended-no-reward',
      };
    }
    case 'PLACE_BUILDING': {
      const footprint = getFootprint(command.buildingType);
      const occupied = !isAreaFree(state, command.x, command.y, footprint);
      if (occupied) {
        return { ok: false, reason: 'tile-occupied', state };
      }
      // Limit: before town hall level 10, en fazla 2 ayni tip bina
      const townHallLevel = state.buildings.find((b) => b.type === 'town_hall')?.level ?? 1;
      const maxPerType = townHallLevel < 10 ? 2 : Infinity;
      const sameTypeCount = state.buildings.filter((b) => b.type === command.buildingType).length;
      if (sameTypeCount >= maxPerType) {
        return { ok: false, reason: 'building-limit', state };
      }
      const cost = getPlaceCost(command.buildingType);
      if (!hasResources(state, cost)) {
        return { ok: false, reason: 'insufficient-resources', state };
      }
      const nextWithPayment = payResources(state, cost);
      return {
        ok: true,
        state: {
          ...nextWithPayment,
          version: nextWithPayment.version + 1,
          buildings: [
            ...nextWithPayment.buildings,
            {
              id: command.buildingId,
              type: command.buildingType,
              level: 1,
              x: command.x,
              y: command.y,
              rot: command.rot ?? 0,
              footprint,
              producedUntil: timestamp,
              state: {},
            },
          ],
        },
      };
    }
    case 'MOVE_BUILDING': {
      const building = state.buildings.find((b) => b.id === command.buildingId);
      if (!building) {
        return { ok: false, reason: 'building-missing', state };
      }
      const footprint = building.footprint ?? getFootprint(building.type);
      const occupied = !isAreaFree(state, command.x, command.y, footprint, command.buildingId);
      if (occupied) {
        return { ok: false, reason: 'tile-occupied', state };
      }
      return {
        ok: true,
        state: {
          ...state,
          version: state.version + 1,
          buildings: state.buildings.map((b) =>
            b.id === building.id
              ? { ...b, x: command.x, y: command.y, rot: command.rot ?? b.rot }
              : b,
          ),
        },
      };
    }
    case 'DELETE_BUILDING': {
      if (command.buildingId === 'town-hall') {
        return { ok: false, reason: 'protected-building', state };
      }
      const exists = state.buildings.find((b) => b.id === command.buildingId);
      if (!exists) return { ok: false, reason: 'building-missing', state };
      return {
        ok: true,
        state: {
          ...state,
          version: state.version + 1,
          buildings: state.buildings.filter((b) => b.id !== command.buildingId),
        },
      };
    }
    case 'UPGRADE_BUILDING': {
      const building = state.buildings.find((b) => b.id === command.buildingId);
      if (!building) {
        return { ok: false, reason: 'building-missing', state };
      }
      const cost = getUpgradeCost(building.type, building.level + 1);
      if (!hasResources(state, cost)) {
        return { ok: false, reason: 'insufficient-resources', state };
      }
      const nextWithPayment = payResources(state, cost);
      return {
        ok: true,
        state: {
          ...nextWithPayment,
          version: nextWithPayment.version + 1,
          buildings: nextWithPayment.buildings.map((b) =>
            b.id === building.id ? { ...b, level: b.level + 1 } : b,
          ),
        },
      };
    }
    case 'CLAIM_PRODUCTION': {
      const building = state.buildings.find((b) => b.id === command.buildingId);
      if (!building) {
        return { ok: false, reason: 'building-missing', state };
      }
      const reward = Math.max(1, building.level);
      return {
        ok: true,
        state: {
          ...state,
          version: state.version + 1,
          resources: {
            ...state.resources,
            gold: state.resources.gold + reward,
          },
          buildings: state.buildings.map((b) =>
            b.id === building.id ? { ...b, producedUntil: timestamp } : b,
          ),
        },
      };
    }
    case 'ADD_ACTIVITY': {
      if (state.activities.find((a) => a.id === command.activityId)) {
        return { ok: false, reason: 'activity-exists', state };
      }
      const nextActivities = [
        ...state.activities,
        {
          id: command.activityId,
          name: command.name.trim().slice(0, 30),
          category: command.category.trim().slice(0, 24) || 'Ozel',
          buildingType: command.buildingType,
        },
      ];
      const nextProgress = { ...state.activityProgress };
      ensureActivityProgress(nextProgress, command.activityId);
      return {
        ok: true,
        state: {
          ...state,
          version: state.version + 1,
          activities: nextActivities,
          activityProgress: nextProgress,
        },
      };
    }
    case 'DELETE_ACTIVITY': {
      const exists = state.activities.find((a) => a.id === command.activityId);
      if (!exists) return { ok: false, reason: 'activity-not-found', state };
      if (state.timers.session?.activityId === command.activityId) {
        return { ok: false, reason: 'activity-in-use', state };
      }
      const nextActivities = state.activities.filter((a) => a.id !== command.activityId);
      const nextProgress = { ...state.activityProgress };
      delete nextProgress[command.activityId];
      return {
        ok: true,
        state: { ...state, version: state.version + 1, activities: nextActivities, activityProgress: nextProgress },
      };
    }
    case 'ADD_TASK': {
      const newTask = {
        id: command.taskId,
        name: command.name.trim().slice(0, 40),
        progress: 0,
        target: Math.max(1, command.target),
        rewardXp: Math.max(0, command.rewardXp),
        completed: false,
      };
      return {
        ok: true,
        state: { ...state, version: state.version + 1, tasks: [...state.tasks, newTask] },
      };
    }
    case 'UPDATE_TASK_PROGRESS': {
      const task = state.tasks.find((t) => t.id === command.taskId);
      if (!task) return { ok: false, reason: 'task-missing', state };
      if (task.completed) return { ok: false, reason: 'task-complete', state };
      const nextTasks = state.tasks.map((t) =>
        t.id === task.id
          ? { ...t, progress: Math.max(0, t.progress + command.delta), completed: t.progress + command.delta >= t.target }
          : t,
      );
      return { ok: true, state: { ...state, version: state.version + 1, tasks: nextTasks } };
    }
    case 'COMPLETE_TASK': {
      const task = state.tasks.find((t) => t.id === command.taskId);
      if (!task) return { ok: false, reason: 'task-missing', state };
      const nextTasks = state.tasks.map((t) =>
        t.id === task.id ? { ...t, completed: true, progress: t.target } : t,
      );
      const rewardXp = task.rewardXp;
      const firstActivity = state.activities[0];
      const nextActivityProgress = { ...state.activityProgress };
      if (firstActivity) {
        ensureActivityProgress(nextActivityProgress, firstActivity.id);
        const current = nextActivityProgress[firstActivity.id];
        let newXp = current.xp + rewardXp;
        let newLevel = current.level;
        while (newXp >= XP_PER_LEVEL(newLevel)) {
          newXp -= XP_PER_LEVEL(newLevel);
          newLevel += 1;
        }
        nextActivityProgress[firstActivity.id] = { ...current, level: newLevel, xp: newXp };
      }
      return {
        ok: true,
        state: {
          ...state,
          version: state.version + 1,
          tasks: nextTasks,
          activityProgress: nextActivityProgress,
        },
      };
    }
    default:
      return { ok: false, reason: 'unknown-command', state };
  }
};

export const initialTownState = (): TownState => ({
  version: 1,
  resources: { gold: 500, wood: 400, stone: 200, food: 300 },
  buildings: [
    {
      id: 'town-hall',
      type: 'town_hall',
      level: 1,
      x: 4,
      y: 4,
      rot: 0,
      footprint: getFootprint('town_hall'),
      producedUntil: Date.now(),
      state: {},
    },
    {
      id: 'farm-1',
      type: 'farm',
      level: 1,
      x: 2,
      y: 6,
      rot: 0,
      footprint: getFootprint('farm'),
      producedUntil: Date.now(),
      state: {},
    },
    {
      id: 'sawmill-1',
      type: 'sawmill',
      level: 1,
      x: 6,
      y: 6,
      rot: 0,
      footprint: getFootprint('sawmill'),
      producedUntil: Date.now(),
      state: {},
    },
    {
      id: 'mine-1',
      type: 'mine',
      level: 1,
      x: 7,
      y: 3,
      rot: 0,
      footprint: getFootprint('mine'),
      producedUntil: Date.now(),
      state: {},
    },
  ],
  map: { width: 10, height: 10 },
  timers: {},
  activities: [],
  activityProgress: {},
  tasks: [
    { id: 'task-bed', name: 'Yatagi topla', progress: 0, target: 1, rewardXp: 5, completed: false },
    { id: 'task-water', name: 'Su ic', progress: 0, target: 200, rewardXp: 5, completed: false },
  ],
  sessionLog: [],
  meta: { lastServerSyncAt: Date.now() },
});
