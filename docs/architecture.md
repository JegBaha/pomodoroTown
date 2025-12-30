# Pomodoro Town — Top-down, multi-ready scaffold

- **Rendering:** top-down grid with a projection layer (`src/game/map/project.ts`) so an isometric renderer can be swapped later.
- **State model:** `TownState` + `Command` unions live in `src/game/types.ts`. Commands are the only way to mutate state.
- **Optimistic flow:** `useGameStore` (`src/game/state/store.ts`) applies commands locally and queues them. `GameProvider` (`src/game/game-provider.tsx`) syncs with `ServerAdapter` (fake now, real later).
- **Server adapter:** interface in `src/game/sync/server-adapter.ts`; in-memory `FakeServerAdapter` in `src/game/sync/fake-server-adapter.ts` reuses the same `applyCommand`.
- **Deterministic apply:** `applyCommand` in `src/game/state/apply.ts` runs validation (bounds/occupancy, session rules) and increments `version`.
- **Map:** `TopDownMap` in `src/game/map/TopDownMap.tsx` renders logical grid; occupancy helpers in `src/game/map/occupancy.ts`; footprints in `src/game/util/footprint.ts`.
- **SQLite schema draft:** `src/data/sqlite-schema.ts` lists tables for command queue, town snapshot, sessions, audit logs.

Next wiring steps
- Swap `FakeServerAdapter` with a real REST adapter (GET `/state`, POST `/commands`) using the same interface.
- Persist queue/state to SQLite and rehydrate on app start.
- Add gesture controls + Skia renderer once native module setup is ready.
