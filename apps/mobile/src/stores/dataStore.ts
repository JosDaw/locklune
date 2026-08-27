import { create } from 'zustand';
import {
  DEFAULT_SETTINGS,
  predict,
  type Cycle,
  type DayLog,
  type EpochDay,
  type Flow,
  type Prediction,
  type Settings,
} from '@locklune/core';
import * as db from '../lib/db';
import { syncReminders } from '../lib/notifications';
import * as toast from '../lib/toast';

interface DataState {
  loaded: boolean;
  cycles: Cycle[];
  /** Whether the user has recorded at least one day-log (drives the home screen
   * away from the first-run welcome state, even without a period on record). */
  hasLogs: boolean;
  /** Days the user has confirmed ovulation (feeds the prediction). */
  ovulationDays: EpochDay[];
  /** Logged flow per day, so prediction can anchor a spotting-led period on its
   * first real-flow day. */
  flowByDay: ReadonlyMap<EpochDay, Flow>;
  settings: Settings;
  prediction: Prediction;

  load: () => Promise<void>;
  reset: () => void;

  /** Mutations resolve to `true` on success; on failure they toast and resolve `false`. */
  startPeriod: (day: EpochDay) => Promise<boolean>;
  setCurrentPeriodEnd: (day: EpochDay) => Promise<boolean>;
  endCycle: (id: number, day: EpochDay | null) => Promise<boolean>;
  deleteCycle: (id: number) => Promise<boolean>;

  logDay: (log: DayLog) => Promise<boolean>;
  deleteLog: (day: EpochDay) => Promise<boolean>;
  getDayLog: (day: EpochDay) => Promise<DayLog | null>;
  getDayLogsInRange: (from: EpochDay, to: EpochDay) => Promise<DayLog[]>;

  updateSettings: (patch: Partial<Settings>) => Promise<boolean>;
}

const emptyPrediction = predict([]);

export const useDataStore = create<DataState>((set, get) => {
  /** Reload cycles + confirmed ovulations and recompute prediction + reminders. */
  async function refreshAll(): Promise<void> {
    const [cycles, ovulationDays, hasLogs, flowDays] = await Promise.all([
      db.getCycles(),
      db.getConfirmedOvulations(),
      db.hasAnyDayLog(),
      db.getFlowDays(),
    ]);
    const flowByDay = new Map(flowDays.map((entry) => [entry.day, entry.flow]));
    const prediction = predict(cycles, get().settings, {
      confirmedOvulations: ovulationDays,
      flowByDay,
      count: 6,
    });
    set({ cycles, ovulationDays, hasLogs, flowByDay, prediction });
    void syncReminders(prediction, get().settings).catch(() => undefined);
  }

  /** Run a DB mutation, surfacing a toast (and resolving `false`) on failure. */
  async function mutate(action: () => Promise<void>, failMessage: string): Promise<boolean> {
    try {
      await action();
      return true;
    } catch {
      toast.error(failMessage);
      return false;
    }
  }

  return {
    loaded: false,
    cycles: [],
    hasLogs: false,
    ovulationDays: [],
    flowByDay: new Map(),
    settings: { ...DEFAULT_SETTINGS },
    prediction: emptyPrediction,

    load: async () => {
      try {
        const [cycles, settings, ovulationDays, hasLogs, flowDays] = await Promise.all([
          db.getCycles(),
          db.getSettings(),
          db.getConfirmedOvulations(),
          db.hasAnyDayLog(),
          db.getFlowDays(),
        ]);
        const flowByDay = new Map(flowDays.map((entry) => [entry.day, entry.flow]));
        const prediction = predict(cycles, settings, {
          confirmedOvulations: ovulationDays,
          flowByDay,
          count: 6,
        });
        set({ cycles, settings, ovulationDays, hasLogs, flowByDay, prediction, loaded: true });
        void syncReminders(prediction, settings).catch(() => undefined);
      } catch {
        toast.error('Could not load your data.');
      }
    },

    reset: () =>
      set({
        loaded: false,
        cycles: [],
        hasLogs: false,
        ovulationDays: [],
        flowByDay: new Map(),
        settings: { ...DEFAULT_SETTINGS },
        prediction: emptyPrediction,
      }),

    startPeriod: (day) =>
      mutate(async () => {
        // If a period is already open, a nearby new "start" is a correction of that
        // same period (real cycles are never < ~2 weeks apart), so move its start
        // rather than create a second, overlapping open period.
        const RECONCILE_DAYS = 15;
        const ongoing = [...get().cycles].reverse().find((cycle) => cycle.endDay === null);
        if (ongoing && Math.abs(ongoing.startDay - day) < RECONCILE_DAYS) {
          if (day !== ongoing.startDay) await db.moveCycleStart(ongoing.id, day);
        } else {
          // A genuinely new cycle begins. If the previous period was never given an
          // end, finalise it now so it stops counting as "ongoing" - otherwise it
          // keeps painting up to today (colliding with the new cycle's fertile
          // window) and collapses to a single day once it is no longer the latest
          // cycle. Bound the bleed to the learned average, never past the new start.
          if (ongoing && ongoing.startDay < day) {
            const bleed = Math.max(1, Math.round(get().prediction.averagePeriodLength));
            await db.setCycleEnd(ongoing.id, Math.min(day - 1, ongoing.startDay + bleed - 1));
          }
          await db.addCycle(day);
        }
        // refreshAll re-derives cycles + confirmed ovulations and recomputes the
        // prediction, so the next period, ovulation and fertile window all re-anchor
        // to this new start.
        await refreshAll();
      }, 'Could not save the period.'),

    setCurrentPeriodEnd: (day) =>
      mutate(async () => {
        const last = get().cycles[get().cycles.length - 1];
        if (!last) return;
        await db.setCycleEnd(last.id, day);
        await refreshAll();
      }, 'Could not update the period.'),

    endCycle: (id, day) =>
      mutate(async () => {
        await db.setCycleEnd(id, day);
        await refreshAll();
      }, 'Could not update the end date.'),

    deleteCycle: (id) =>
      mutate(async () => {
        const cycle = get().cycles.find((candidate) => candidate.id === id);
        if (cycle) {
          const endDay = cycle.endDay ?? cycle.startDay + 14;
          await db.deleteDayLogsInRange(cycle.startDay, endDay);
        }
        await db.deleteCycle(id);
        await refreshAll();
      }, 'Could not remove the period.'),

    logDay: (log) =>
      mutate(async () => {
        await db.upsertDayLog(log);
        // A log can add/remove a confirmed ovulation, which changes the prediction.
        await refreshAll();
      }, 'Could not save your log.'),
    deleteLog: (day) =>
      mutate(async () => {
        await db.deleteDayLog(day);
        await refreshAll();
      }, 'Could not delete the log.'),
    getDayLog: async (day) => {
      try {
        return await db.getDayLog(day);
      } catch {
        return null;
      }
    },
    getDayLogsInRange: async (from, to) => {
      try {
        return await db.getDayLogsInRange(from, to);
      } catch {
        return [];
      }
    },

    updateSettings: (patch) =>
      mutate(async () => {
        let next: Settings = { ...get().settings, ...patch };
        const prediction = predict(get().cycles, next, {
          confirmedOvulations: get().ovulationDays,
          flowByDay: get().flowByDay,
          count: 6,
        });
        // If fertility no longer applies (e.g. period-only, pregnant, or hormonal
        // contraception), switch off fertility reminders so none stay enabled or
        // scheduled. syncReminders below then clears any already on the device.
        if (!prediction.fertilityApplicable) {
          next = { ...next, notifyFertileTomorrow: false, notifyFertileStart: false };
        }
        await db.saveSettings(next);
        set({ settings: next, prediction });
        void syncReminders(prediction, next).catch(() => undefined);
      }, 'Could not save your settings.'),
  };
});
