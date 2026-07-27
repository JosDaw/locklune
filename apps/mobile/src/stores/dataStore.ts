import { create } from 'zustand';
import {
  DEFAULT_SETTINGS,
  predict,
  type Cycle,
  type DayLog,
  type EpochDay,
  type Prediction,
  type Settings,
} from '@locklune/core';
import * as db from '../lib/db';
import { syncReminders } from '../lib/notifications';

interface DataState {
  loaded: boolean;
  cycles: Cycle[];
  settings: Settings;
  prediction: Prediction;

  load: () => Promise<void>;
  reset: () => void;

  startPeriod: (day: EpochDay) => Promise<void>;
  setCurrentPeriodEnd: (day: EpochDay) => Promise<void>;
  deleteCycle: (id: number) => Promise<void>;

  logDay: (log: DayLog) => Promise<void>;
  getDayLog: (day: EpochDay) => Promise<DayLog | null>;
  getDayLogsInRange: (from: EpochDay, to: EpochDay) => Promise<DayLog[]>;

  updateSettings: (patch: Partial<Settings>) => Promise<void>;
}

const emptyPrediction = predict([]);

export const useDataStore = create<DataState>((set, get) => ({
  loaded: false,
  cycles: [],
  settings: { ...DEFAULT_SETTINGS },
  prediction: emptyPrediction,

  load: async () => {
    const [cycles, settings] = await Promise.all([db.getCycles(), db.getSettings()]);
    const prediction = predict(cycles, settings);
    set({ cycles, settings, prediction, loaded: true });
    void syncReminders(prediction, settings.reminderDaysBefore).catch(() => undefined);
  },

  reset: () =>
    set({
      loaded: false,
      cycles: [],
      settings: { ...DEFAULT_SETTINGS },
      prediction: emptyPrediction,
    }),

  startPeriod: async (day) => {
    await db.addCycle(day);
    const cycles = await db.getCycles();
    const prediction = predict(cycles, get().settings);
    set({ cycles, prediction });
    void syncReminders(prediction, get().settings.reminderDaysBefore).catch(() => undefined);
  },

  setCurrentPeriodEnd: async (day) => {
    const cycles = get().cycles;
    const last = cycles[cycles.length - 1];
    if (!last) return;
    await db.setCycleEnd(last.id, day);
    const next = await db.getCycles();
    set({ cycles: next, prediction: predict(next, get().settings) });
  },

  deleteCycle: async (id) => {
    await db.deleteCycle(id);
    const cycles = await db.getCycles();
    set({ cycles, prediction: predict(cycles, get().settings) });
  },

  logDay: async (log) => {
    await db.upsertDayLog(log);
  },
  getDayLog: (day) => db.getDayLog(day),
  getDayLogsInRange: (from, to) => db.getDayLogsInRange(from, to),

  updateSettings: async (patch) => {
    const next: Settings = { ...get().settings, ...patch };
    await db.saveSettings(next);
    const prediction = predict(get().cycles, next);
    set({ settings: next, prediction });
    void syncReminders(prediction, next.reminderDaysBefore).catch(() => undefined);
  },
}));
