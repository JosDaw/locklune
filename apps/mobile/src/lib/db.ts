/**
 * Encrypted local database (SQLCipher via expo-sqlite). The whole database file
 * is AES-256 encrypted; the key is the DEK unwrapped from the user's PIN. The
 * key is applied with `PRAGMA key` before any other statement.
 *
 * Storage is deliberately compact: one row per cycle, and day-logs are sparse
 * (a row exists only when the user recorded something).
 */
import * as SQLite from 'expo-sqlite';
import {
  DEFAULT_SETTINGS,
  type Cycle,
  type DayLog,
  type EpochDay,
  type Flow,
  type Mood,
  type Settings,
} from '@locklune/core';

const DB_NAME = 'locklune.db';

let db: SQLite.SQLiteDatabase | null = null;

function requireDb(): SQLite.SQLiteDatabase {
  if (!db) throw new Error('Database is locked/closed');
  return db;
}

/** Open + unlock the encrypted database and run migrations. Idempotent. */
export async function openEncryptedDb(dekHex: string): Promise<void> {
  if (db) return;
  const database = await SQLite.openDatabaseAsync(DB_NAME);
  // SQLCipher: the key MUST be set before touching any table.
  await database.execAsync(`PRAGMA key = "x'${dekHex}'";`);
  await database.execAsync('PRAGMA journal_mode = WAL;');
  await migrate(database);
  db = database;
}

export async function closeDb(): Promise<void> {
  if (db) {
    await db.closeAsync();
    db = null;
  }
}

/** Delete the encrypted database file entirely (used by "wipe all data"). */
export async function deleteDb(): Promise<void> {
  await closeDb();
  try {
    await SQLite.deleteDatabaseAsync(DB_NAME);
  } catch {
    // already gone
  }
}

async function migrate(database: SQLite.SQLiteDatabase): Promise<void> {
  await database.execAsync(`
    CREATE TABLE IF NOT EXISTS cycles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      start_day INTEGER NOT NULL UNIQUE,
      end_day INTEGER
    );
    CREATE TABLE IF NOT EXISTS day_logs (
      day INTEGER PRIMARY KEY,
      flow INTEGER,
      mood INTEGER,
      symptoms TEXT,
      note TEXT
    );
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
  `);
}

// --- Cycles -----------------------------------------------------------------

interface CycleRow {
  id: number;
  startDay: number;
  endDay: number | null;
}

export async function getCycles(): Promise<Cycle[]> {
  const rows = await requireDb().getAllAsync<CycleRow>(
    'SELECT id, start_day AS startDay, end_day AS endDay FROM cycles ORDER BY start_day ASC',
  );
  return rows.map((r) => ({ id: r.id, startDay: r.startDay, endDay: r.endDay }));
}

export async function addCycle(startDay: EpochDay, endDay: EpochDay | null = null): Promise<void> {
  await requireDb().runAsync(
    'INSERT OR IGNORE INTO cycles (start_day, end_day) VALUES (?, ?)',
    startDay,
    endDay,
  );
}

export async function setCycleEnd(id: number, endDay: EpochDay | null): Promise<void> {
  await requireDb().runAsync('UPDATE cycles SET end_day = ? WHERE id = ?', endDay, id);
}

export async function deleteCycle(id: number): Promise<void> {
  await requireDb().runAsync('DELETE FROM cycles WHERE id = ?', id);
}

// --- Day logs (sparse) ------------------------------------------------------

interface DayLogRow {
  day: number;
  flow: number | null;
  mood: number | null;
  symptoms: string | null;
  note: string | null;
}

function rowToDayLog(r: DayLogRow): DayLog {
  return {
    day: r.day,
    flow: (r.flow as Flow | null) ?? null,
    mood: (r.mood as Mood | null) ?? null,
    symptoms: r.symptoms ? (JSON.parse(r.symptoms) as string[]) : [],
    note: r.note,
  };
}

function isEmptyLog(log: DayLog): boolean {
  return log.flow === null && log.mood === null && log.symptoms.length === 0 && !log.note;
}

export async function getDayLog(day: EpochDay): Promise<DayLog | null> {
  const row = await requireDb().getFirstAsync<DayLogRow>(
    'SELECT day, flow, mood, symptoms, note FROM day_logs WHERE day = ?',
    day,
  );
  return row ? rowToDayLog(row) : null;
}

export async function getDayLogsInRange(from: EpochDay, to: EpochDay): Promise<DayLog[]> {
  const rows = await requireDb().getAllAsync<DayLogRow>(
    'SELECT day, flow, mood, symptoms, note FROM day_logs WHERE day BETWEEN ? AND ? ORDER BY day',
    from,
    to,
  );
  return rows.map(rowToDayLog);
}

/** Insert/update a day-log; if the log is empty, the row is removed (stays sparse). */
export async function upsertDayLog(log: DayLog): Promise<void> {
  if (isEmptyLog(log)) {
    await requireDb().runAsync('DELETE FROM day_logs WHERE day = ?', log.day);
    return;
  }
  await requireDb().runAsync(
    `INSERT INTO day_logs (day, flow, mood, symptoms, note)
     VALUES (?, ?, ?, ?, ?)
     ON CONFLICT(day) DO UPDATE SET flow = excluded.flow, mood = excluded.mood,
       symptoms = excluded.symptoms, note = excluded.note`,
    log.day,
    log.flow,
    log.mood,
    log.symptoms.length > 0 ? JSON.stringify(log.symptoms) : null,
    log.note,
  );
}

// --- Settings (single JSON row) ---------------------------------------------

const SETTINGS_KEY = 'app';

export async function getSettings(): Promise<Settings> {
  const row = await requireDb().getFirstAsync<{ value: string }>(
    'SELECT value FROM settings WHERE key = ?',
    SETTINGS_KEY,
  );
  if (!row) return { ...DEFAULT_SETTINGS };
  try {
    return { ...DEFAULT_SETTINGS, ...(JSON.parse(row.value) as Partial<Settings>) };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

export async function saveSettings(settings: Settings): Promise<void> {
  await requireDb().runAsync(
    `INSERT INTO settings (key, value) VALUES (?, ?)
     ON CONFLICT(key) DO UPDATE SET value = excluded.value`,
    SETTINGS_KEY,
    JSON.stringify(settings),
  );
}
