import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ActiveLifeState, FallbackRule, GiftEtiquetteTier, LifestyleTier, TimeSlot } from '../types/activeLife';
import type { ActionDef, ChildhoodActivityDef, GameEventDef } from '../types/dsl';
import { createNewLife } from '../engine/lifeInitializer';
import { advanceChildhoodMonth, advanceChildhoodYear, resolveEventChoice } from '../engine/childhoodEngine';
import {
  advanceDays,
  DEFAULT_AUTO_PAUSE_CONFIG,
  type AutoPauseConfig,
  type AutoPauseReason,
} from '../engine/daySimulator';
import { appendLog, applyEffects } from '../engine/effectApplier';
import {
  buyGoldReserve,
  executeInstantAdultAction,
  haveChild,
  marrySpouse,
  sellGoldReserve,
} from '../engine/adultLifeActions';
import thoAuEvents from '../data/events_tho_au.json';
import dongAuData from '../data/events_dong_au.json';
import actionsData from '../data/actions.json';
import adulthoodEvents from '../data/events_truong_thanh.json';
import type { WorkerResponse } from '../workers/simulation.worker';

const ALL_CHILDHOOD_EVENTS: GameEventDef[] = [
  ...(thoAuEvents as GameEventDef[]),
  ...(dongAuData.events as GameEventDef[]),
];

export const CHILDHOOD_ACTIVITIES: ChildhoodActivityDef[] =
  dongAuData.activities as ChildhoodActivityDef[];

export const ALL_ACTIONS: ActionDef[] = actionsData as ActionDef[];
const ALL_ADULTHOOD_EVENTS: GameEventDef[] = adulthoodEvents as GameEventDef[];

let simWorker: Worker | null = null;
function getWorker(): Worker | null {
  if (typeof Worker === 'undefined') return null;
  if (!simWorker) {
    simWorker = new Worker(new URL('../workers/simulation.worker.ts', import.meta.url), {
      type: 'module',
    });
  }
  return simWorker;
}

interface ActiveLifeStore {
  life: ActiveLifeState | null;
  pendingEvent: GameEventDef | null;
  lastEventResult: string | null;
  isSimulating: boolean;
  hasConfirmedBirthCertificate: boolean;
  autoPauseConfig: AutoPauseConfig;
  lastPauseReason: AutoPauseReason | null;

  startNewLife: (customSeed?: number) => void;
  confirmBirthCertificate: () => void;
  stepChildhoodYear: (activity?: ChildhoodActivityDef) => void;
  stepChildhoodMonth: () => void;
  setChildhoodFocus: (focusId: string) => void;
  advanceAdultDays: (days: number) => void;
  chooseEventOption: (choiceIndex: number) => void;
  clearLastEventResult: () => void;
  clearPauseReason: () => void;

  setSlotAction: (slot: TimeSlot, actionId: string) => void;
  setLifestyle: (tier: LifestyleTier) => void;
  setLifeFocus: (focusId: string) => void;
  setGiftEtiquette: (tier: GiftEtiquetteTier) => void;
  toggleAutoAction: (actionId: string) => void;
  buyGold: (amountCopper: number) => void;
  sellGold: (amountCopper: number) => void;
  marrySpouseAction: () => void;
  haveChildAction: () => void;
  performInstantAction: (actionId: string) => void;
  setAutoBuyRice: (enabled: boolean) => void;
  setAutoPauseConfig: (patch: Partial<AutoPauseConfig>) => void;
  addFallbackRule: (rule: FallbackRule) => void;
  removeFallbackRule: (id: string) => void;
  buyRice: (amount: number) => void;
  sellRice: (amount: number) => void;
  takeEmergencyLoan: () => void;
  applyLifeMutation: (mutator: (life: ActiveLifeState) => ActiveLifeState) => void;
  exportSaveJson: () => string | null;
  importSaveJson: (raw: string) => { ok: boolean; error?: string };
  resetLife: () => void;
}

export const useActiveLifeStore = create<ActiveLifeStore>()(
  persist(
    (set, get) => ({
      life: null,
      pendingEvent: null,
      lastEventResult: null,
      isSimulating: false,
      hasConfirmedBirthCertificate: true,
      autoPauseConfig: DEFAULT_AUTO_PAUSE_CONFIG,
      lastPauseReason: null,

      startNewLife: (customSeed?: number) => {
        const life = createNewLife(customSeed);
        set({
          life,
          pendingEvent: null,
          lastEventResult: null,
          isSimulating: false,
          hasConfirmedBirthCertificate: false,
          lastPauseReason: null,
        });
      },

      confirmBirthCertificate: () => {
        set({ hasConfirmedBirthCertificate: true });
      },

      stepChildhoodYear: (activity?: ChildhoodActivityDef) => {
        const { life, pendingEvent } = get();
        if (!life || !life.isAlive || pendingEvent) return;

        const res = advanceChildhoodYear(life, ALL_CHILDHOOD_EVENTS, activity);
        set({
          life: res.state,
          pendingEvent: res.pendingEvent,
          lastEventResult: null,
        });
      },

      stepChildhoodMonth: () => {
        const { life, pendingEvent } = get();
        if (!life || !life.isAlive || pendingEvent) return;

        const res = advanceChildhoodMonth(life, ALL_CHILDHOOD_EVENTS);
        set({
          life: res.state,
          pendingEvent: res.pendingEvent,
          lastEventResult: null,
        });
      },

      setChildhoodFocus: (focusId) => {
        const { life } = get();
        if (!life) return;
        set({
          life: {
            ...life,
            schedule: { ...life.schedule, childhoodFocus: focusId },
          },
        });
      },

      advanceAdultDays: (days: number) => {
        const { life, pendingEvent, isSimulating, autoPauseConfig } = get();
        if (!life || !life.isAlive || pendingEvent || isSimulating) return;

        const worker = getWorker();
        if (!worker) {
          const res = advanceDays(life, days, ALL_ACTIONS, ALL_ADULTHOOD_EVENTS, autoPauseConfig);
          set({
            life: res.state,
            pendingEvent: res.pendingEvent ?? null,
            lastPauseReason: res.pausedReason ?? null,
            lastEventResult: null,
          });
          return;
        }

        set({ isSimulating: true, lastPauseReason: null, lastEventResult: null });
        const runSyncFallback = () => {
          const res = advanceDays(life, days, ALL_ACTIONS, ALL_ADULTHOOD_EVENTS, autoPauseConfig);
          set({
            life: res.state,
            pendingEvent: res.pendingEvent ?? null,
            lastPauseReason: res.pausedReason ?? null,
            isSimulating: false,
          });
        };
        worker.onmessage = (e: MessageEvent<WorkerResponse>) => {
          const msg = e.data;
          if (msg.type === 'SIMULATION_DONE') {
            set({
              life: msg.state,
              pendingEvent: msg.pendingEvent ?? null,
              lastPauseReason: (msg.pausedReason as AutoPauseReason | undefined) ?? null,
              isSimulating: false,
            });
          } else if (msg.type === 'SIMULATION_ERROR') {
            runSyncFallback();
          }
        };
        worker.onerror = () => {
          runSyncFallback();
        };
        worker.postMessage({
          type: 'ADVANCE_DAYS',
          state: life,
          days,
          autoPauseConfig,
        });
      },

      chooseEventOption: (choiceIndex: number) => {
        const { life, pendingEvent } = get();
        if (!life || !pendingEvent) return;

        const res = resolveEventChoice(life, pendingEvent, choiceIndex);
        set({
          life: res.state,
          pendingEvent: null,
          lastEventResult: res.resultText,
        });
      },

      clearLastEventResult: () => set({ lastEventResult: null }),
      clearPauseReason: () => set({ lastPauseReason: null }),

      setSlotAction: (slot, actionId) => {
        const { life } = get();
        if (!life) return;
        set({
          life: {
            ...life,
            schedule: { ...life.schedule, [slot]: actionId },
          },
        });
      },

      setLifestyle: (tier) => {
        const { life } = get();
        if (!life) return;
        set({
          life: {
            ...life,
            schedule: { ...life.schedule, lifestyle: tier },
          },
        });
      },

      setLifeFocus: (focusId) => {
        const { life } = get();
        if (!life) return;
        set({
          life: {
            ...life,
            schedule: { ...life.schedule, lifeFocus: focusId },
          },
        });
      },

      setGiftEtiquette: (tier) => {
        const { life } = get();
        if (!life) return;
        set({
          life: {
            ...life,
            schedule: { ...life.schedule, giftEtiquette: tier },
          },
        });
      },

      toggleAutoAction: (actionId) => {
        const { life } = get();
        if (!life) return;
        const curr = life.autoActions ?? [];
        const next = curr.includes(actionId)
          ? curr.filter((id) => id !== actionId)
          : [...curr, actionId];
        set({
          life: {
            ...life,
            autoActions: next,
          },
        });
      },

      buyGold: (amountCopper) => {
        const { life } = get();
        if (!life || !life.isAlive) return;
        set({ life: buyGoldReserve(life, amountCopper) });
      },

      sellGold: (amountCopper) => {
        const { life } = get();
        if (!life || !life.isAlive) return;
        set({ life: sellGoldReserve(life, amountCopper) });
      },

      marrySpouseAction: () => {
        const { life } = get();
        if (!life || !life.isAlive) return;
        set({ life: marrySpouse(life) });
      },

      haveChildAction: () => {
        const { life } = get();
        if (!life || !life.isAlive) return;
        set({ life: haveChild(life) });
      },

      performInstantAction: (actionId) => {
        const { life } = get();
        if (!life || !life.isAlive) return;
        const res = executeInstantAdultAction(life, actionId);
        if (res.ok) {
          set({
            life: res.state,
            lastEventResult: res.message,
          });
        }
      },

      setAutoBuyRice: (enabled) => {
        const { life } = get();
        if (!life) return;
        set({
          life: {
            ...life,
            schedule: { ...life.schedule, autoBuyRice: enabled },
          },
        });
      },

      setAutoPauseConfig: (patch) => {
        set((s) => ({ autoPauseConfig: { ...s.autoPauseConfig, ...patch } }));
      },

      addFallbackRule: (rule) => {
        const { life } = get();
        if (!life) return;
        set({
          life: {
            ...life,
            schedule: {
              ...life.schedule,
              fallbackRules: [...life.schedule.fallbackRules, rule],
            },
          },
        });
      },

      removeFallbackRule: (id) => {
        const { life } = get();
        if (!life) return;
        set({
          life: {
            ...life,
            schedule: {
              ...life.schedule,
              fallbackRules: life.schedule.fallbackRules.filter((r) => r.id !== id),
            },
          },
        });
      },

      buyRice: (amount) => {
        const { life } = get();
        if (!life || amount <= 0) return;
        const cost = amount * life.world.ricePriceInCopper;
        if (life.assets.wealthCopper < cost) return;
        const next = applyEffects(life, { copper: -cost, rice: amount });
        set({
          life: {
            ...next,
            logs: appendLog(next.logs, next.profile.totalDays, 'survival', `Mua ${amount} đấu gạo với giá ${cost} đồng.`),
          },
        });
      },

      sellRice: (amount) => {
        const { life } = get();
        if (!life || amount <= 0 || life.assets.rice < amount) return;
        const gain = amount * life.world.ricePriceInCopper;
        const next = applyEffects(life, { copper: gain, rice: -amount });
        set({
          life: {
            ...next,
            logs: appendLog(next.logs, next.profile.totalDays, 'survival', `Bán ${amount} đấu gạo thu về ${gain} đồng.`),
          },
        });
      },

      takeEmergencyLoan: () => {
        const { life } = get();
        if (!life || life.flags.includes('dang_no_dia_chu')) return;
        const next = applyEffects(life, {
          copper: 500,
          rice: 5,
          add_flags: ['dang_no_dia_chu'],
          schedule_delayed: [{ event_id: 'evt_debt_collection_01', delay_days: 180 }],
        });
        set({
          life: {
            ...next,
            logs: appendLog(
              next.logs,
              next.profile.totalDays,
              'warning',
              'Vay nóng địa chủ 500 đồng và 5 đấu gạo. Sau 180 ngày phải trả đủ 800 đồng!',
            ),
          },
        });
      },

      applyLifeMutation: (mutator) => {
        const { life } = get();
        if (!life || !life.isAlive) return;
        set({ life: mutator(life) });
      },

      exportSaveJson: () => {
        const { life } = get();
        if (!life) return null;
        return JSON.stringify(
          {
            schemaVersion: life.schemaVersion,
            exportedAt: new Date().toISOString(),
            life,
          },
          null,
          2,
        );
      },

      importSaveJson: (raw: string) => {
        try {
          const parsed = JSON.parse(raw) as { schemaVersion?: number; life?: ActiveLifeState };
          const candidate = parsed.life;
          if (
            !candidate ||
            parsed.schemaVersion !== 1 ||
            typeof candidate.seed !== 'number' ||
            !candidate.profile ||
            !candidate.stats ||
            !candidate.assets
          ) {
            return { ok: false, error: 'File save không hợp lệ hoặc sai schemaVersion.' };
          }
          set({
            life: {
              ...candidate,
              officialRank: candidate.officialRank ?? 0,
              exposureRisk: candidate.exposureRisk ?? 0,
              rebellion: candidate.rebellion ?? { treasuryCopper: 0, armyPower: 0 },
            },
            pendingEvent: null,
            lastEventResult: null,
            lastPauseReason: null,
          });
          return { ok: true };
        } catch {
          return { ok: false, error: 'Không thể đọc định dạng JSON.' };
        }
      },

      resetLife: () =>
        set({
          life: null,
          pendingEvent: null,
          lastEventResult: null,
          isSimulating: false,
          lastPauseReason: null,
        }),
    }),
    {
      name: 'nkpt_active_life_v1',
      version: 1,
      partialize: (state) => ({
        life: state.life,
        autoPauseConfig: state.autoPauseConfig,
      }),
      merge: (persistedState, currentState) => {
        const persisted = persistedState as Partial<ActiveLifeStore> | undefined;
        const life = persisted?.life
          ? {
              ...persisted.life,
              officialRank: persisted.life.officialRank ?? 0,
              exposureRisk: persisted.life.exposureRisk ?? 0,
              rebellion: persisted.life.rebellion ?? { treasuryCopper: 0, armyPower: 0 },
              schedule: {
                ...persisted.life.schedule,
                autoBuyRice: persisted.life.schedule?.autoBuyRice ?? true,
                fallbackRules: persisted.life.schedule?.fallbackRules ?? [],
              },
            }
          : null;
        return {
          ...currentState,
          ...persisted,
          life,
        };
      },
    },
  ),
);
