export const commandQueueTable = `
CREATE TABLE IF NOT EXISTS command_queue (
  id TEXT PRIMARY KEY,
  created_at INTEGER,
  payload TEXT,
  status TEXT,
  retry_count INTEGER DEFAULT 0
);`;

export const townStateTable = `
CREATE TABLE IF NOT EXISTS town_state (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  version INTEGER,
  snapshot TEXT,
  updated_at INTEGER
);`;

export const sessionsTable = `
CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  start_at INTEGER,
  planned_duration INTEGER,
  status TEXT,
  reward TEXT
);`;

export const economyLogsTable = `
CREATE TABLE IF NOT EXISTS economy_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  created_at INTEGER,
  type TEXT,
  delta TEXT,
  note TEXT
);`;

export const sqliteTables = [
  commandQueueTable,
  townStateTable,
  sessionsTable,
  economyLogsTable,
];
