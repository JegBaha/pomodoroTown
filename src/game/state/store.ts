import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

import { applyCommand, initialTownState } from './apply';
import { QueuedCommand, TownState, Command } from '../types';

type SyncStatus = 'idle' | 'syncing' | 'error';

export type GameStore = {
  town: TownState;
  queue: QueuedCommand[];
  syncStatus: SyncStatus;
  setAuthoritativeState: (state: TownState) => void;
  enqueue: (command: Command) => void;
  markAcked: (ids: string[]) => void;
  markRejected: (rejections: { id: string; reason: string }[]) => void;
  reset: () => void;
};

export const useGameStore = create<GameStore>()(
  immer((set, get) => ({
    town: initialTownState(),
    queue: [],
    syncStatus: 'idle',
    setAuthoritativeState: (state) =>
      set((draft) => {
        draft.town = state;
        // Re-apply optimistic commands so the UI stays in sync while offline.
        draft.queue
          .filter((item) => item.status === 'pending')
          .forEach((item) => {
            const result = applyCommand(draft.town, item.command);
            if (result.ok) draft.town = result.state;
          });
      }),
    enqueue: (command) =>
      set((draft) => {
        const result = applyCommand(draft.town, command);
        if (result.ok) {
          draft.town = result.state;
          draft.queue.push({ command, status: 'pending' });
        } else {
          draft.queue.push({ command, status: 'rejected', error: result.reason });
        }
      }),
    markAcked: (ids) =>
      set((draft) => {
        draft.queue = draft.queue.filter((item) => !ids.includes(item.command.id));
      }),
    markRejected: (rejections) =>
      set((draft) => {
        rejections.forEach((rej) => {
          const item = draft.queue.find((i) => i.command.id === rej.id);
          if (item) {
            item.status = 'rejected';
            item.error = rej.reason;
          }
        });
      }),
    reset: () =>
      set(() => ({
        town: initialTownState(),
        queue: [],
        syncStatus: 'idle',
      })),
  })),
);

export const useGameState = () => useGameStore((s) => s.town);
export const useCommandQueue = () => useGameStore((s) => s.queue);
