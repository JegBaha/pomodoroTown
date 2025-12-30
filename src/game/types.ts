export type ResourceType = 'gold' | 'wood' | 'stone' | 'food';

export type Resources = Record<ResourceType, number>;

export type BuildingType = 'town_hall' | 'farm' | 'sawmill' | 'mine' | 'market' | 'decor';

export type Footprint = { width: number; height: number };

export type Building = {
  id: string;
  type: BuildingType;
  level: number;
  x: number;
  y: number;
  rot: number;
  footprint: Footprint;
  producedUntil?: number;
  state?: Record<string, unknown>;
};

export type Activity = {
  id: string;
  name: string;
  category: string;
  buildingType: BuildingType;
};

export type ActivityProgress = {
  activityId: string;
  level: number;
  xp: number;
};

export type SessionTimer = {
  active: boolean;
  sessionId: string;
  startAt: number;
  plannedDuration: number;
  activityId: string;
  rewardBuildingType?: BuildingType;
};

export type TownState = {
  version: number;
  resources: Resources;
  buildings: Building[];
  map: { width: number; height: number };
  timers: { session?: SessionTimer };
  activities: Activity[];
  activityProgress: Record<string, ActivityProgress>;
  tasks: Task[];
  sessionLog: SessionEntry[];
  meta: { lastServerSyncAt?: number };
};

type BaseCommand = {
  id: string;
  clientCreatedAt: number;
};

export type Command =
  | (BaseCommand & {
      type: 'START_SESSION';
      duration: number;
      activityId: string;
      rewardBuildingType?: BuildingType;
    }) // validated (300-3600) in apply
  | (BaseCommand & { type: 'COMPLETE_SESSION'; sessionId: string })
  | (BaseCommand & {
      type: 'PLACE_BUILDING';
      buildingId: string;
      buildingType: BuildingType;
      x: number;
      y: number;
      rot?: number;
    })
  | (BaseCommand & {
      type: 'MOVE_BUILDING';
      buildingId: string;
      x: number;
      y: number;
      rot?: number;
    })
  | (BaseCommand & { type: 'UPGRADE_BUILDING'; buildingId: string })
  | (BaseCommand & { type: 'CLAIM_PRODUCTION'; buildingId: string })
  | (BaseCommand & {
      type: 'ADD_ACTIVITY';
      name: string;
      category: string;
      buildingType: BuildingType;
      activityId: string;
    })
  | (BaseCommand & { type: 'DELETE_ACTIVITY'; activityId: string })
  | (BaseCommand & { type: 'DELETE_BUILDING'; buildingId: string })
  | (BaseCommand & {
      type: 'ADD_TASK';
      name: string;
      target: number;
      rewardXp: number;
      taskId: string;
    })
  | (BaseCommand & { type: 'UPDATE_TASK_PROGRESS'; taskId: string; delta: number })
  | (BaseCommand & { type: 'COMPLETE_TASK'; taskId: string });

export type QueueStatus = 'pending' | 'acked' | 'rejected';

export type QueuedCommand = {
  command: Command;
  status: QueueStatus;
  error?: string;
};

export type Task = {
  id: string;
  name: string;
  progress: number;
  target: number;
  rewardXp: number;
  completed: boolean;
};

export type SessionEntry = {
  id: string;
  activityId: string;
  minutes: number;
  at: number;
};
