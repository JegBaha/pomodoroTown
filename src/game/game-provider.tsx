import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { commandFactory } from './commands';
import { useCommandQueue, useGameStore, useGameState } from './state/store';
import { FakeServerAdapter } from './sync/fake-server-adapter';
import { ServerAdapter } from './sync/server-adapter';
import { Command } from './types';

type GameContextValue = {
  adapter: ServerAdapter;
  syncNow: () => Promise<void>;
  enqueue: (command: Command) => void;
  syncing: boolean;
};

const GameContext = createContext<GameContextValue | null>(null);

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const adapterRef = useRef<ServerAdapter>(undefined);
  const setAuthoritativeState = useGameStore((s) => s.setAuthoritativeState);
  const enqueue = useGameStore((s) => s.enqueue);
  const markAcked = useGameStore((s) => s.markAcked);
  const markRejected = useGameStore((s) => s.markRejected);
  const queue = useCommandQueue();
  const [syncing, setSyncing] = useState(false);

  if (!adapterRef.current) {
    adapterRef.current = new FakeServerAdapter();
  }

  useEffect(() => {
    adapterRef.current?.fetchState().then((state) => {
      setAuthoritativeState(state);
    });
  }, [setAuthoritativeState]);

  const syncNow = useCallback(async () => {
    if (!adapterRef.current) return;
    setSyncing(true);
    try {
      const pending = queue.filter((c) => c.status === 'pending').map((c) => c.command);
      if (pending.length === 0) {
        const latest = await adapterRef.current.fetchState();
        setAuthoritativeState(latest);
        setSyncing(false);
        return;
      }
      const result = await adapterRef.current.pushCommands(pending);
      if (result.newState) {
        setAuthoritativeState(result.newState);
      }
      markAcked(result.acked);
      markRejected(result.rejected);
    } catch (err) {
      console.error('sync failed', err);
    } finally {
      setSyncing(false);
    }
  }, [markAcked, markRejected, queue, setAuthoritativeState]);

  const value = useMemo(
    () => ({
      adapter: adapterRef.current as ServerAdapter,
      syncNow,
      enqueue,
      syncing,
    }),
    [enqueue, syncNow, syncing],
  );

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
};

export const useGame = () => {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame must be used inside GameProvider');
  const town = useGameState();
  const queue = useCommandQueue();
  return {
    town,
    queue,
    enqueue: ctx.enqueue,
    syncNow: ctx.syncNow,
    syncing: ctx.syncing,
    commands: commandFactory,
  };
};
