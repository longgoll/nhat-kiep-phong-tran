import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  ActiveLifeState,
  FallbackRule,
  GiftEtiquetteTier,
  InvestmentChannel,
  LifestyleTier,
  TimeSlot,
} from '../types/activeLife';
import type { GameEventDef } from '../types/dsl';
import { createNewLife } from '../engine/lifeInitializer';
import { evaluateConditions } from '../engine/conditionEvaluator';
import { advanceChildhoodMonth, resolveEventChoice } from '../engine/childhoodEngine';
import { applyDynamicDecisionSideEffects } from '../engine/decisionGenerator';
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
import {
  ALL_ACTIONS,
  ALL_ADULTHOOD_EVENTS,
  ALL_CHILDHOOD_EVENTS,
  CHILDHOOD_ACTIVITIES,
  CHILDHOOD_AMBIENT_DATA,
} from '../data/registry';
import type { WorkerResponse } from '../workers/simulation.worker';

export { ALL_ACTIONS, CHILDHOOD_ACTIVITIES };

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
  autoDecide: boolean;
  autoPlaySpeed: 0 | 1 | 2 | 4 | 8 | 12 | 16;

  startNewLife: (customSeed?: number) => void;
  setAutoPlaySpeed: (speed: 0 | 1 | 2 | 4 | 8 | 12 | 16) => void;
  confirmBirthCertificate: () => void;
  stepChildhoodMonth: () => void;
  advanceToNextDecision: () => void;
  toggleAutoDecide: () => void;
  togglePinLog: (logIndex: number) => void;
  addPlayerThought: (text: string) => void;
  setChildhoodFocus: (focusId: string) => void;
  advanceAdultDays: (days: number) => void;
  chooseEventOption: (choiceIndex: number) => void;
  clearLastEventResult: () => void;
  clearPauseReason: () => void;

  setSlotAction: (slot: TimeSlot, actionId: string) => void;
  setLifestyle: (tier: LifestyleTier) => void;
  setLifeFocus: (focusId: string) => void;
  setGiftEtiquette: (tier: GiftEtiquetteTier) => void;
  setInvestmentChannel: (channel: InvestmentChannel) => void;
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

function pickAutoChoiceIndex(life: ActiveLifeState, event: GameEventDef): number {
  let bestIdx = 0;
  let bestScore = -Infinity;

  event.choices.forEach((choice, idx) => {
    if (!evaluateConditions(life, choice.conditions)) return;
    let avgScore = 0;
    let totalWeight = 0;
    for (const out of choice.outcomes) {
      const w = Math.max(1, out.weight.base);
      const e = out.effects;
      let score =
        (e.health ?? 0) * 1.5 +
        (e.happiness ?? 0) * 1.1 +
        (e.relationships ?? 0) * 1.0 +
        (e.education ?? 0) * 1.2 +
        (e.martial ?? 0) * 0.9 +
        (e.craft_trade ?? 0) * 0.9 +
        (e.fame ?? 0) * 0.8 +
        (e.copper ?? 0) * 0.02 +
        (e.family_copper ?? 0) * 0.02 +
        (e.rice ?? 0) * 0.3 -
        (e.infamy ?? 0) * 1.2;
      if (e.kill_reason) score -= 500;
      avgScore += score * w;
      totalWeight += w;
    }
    const finalScore = totalWeight > 0 ? avgScore / totalWeight : 0;
    if (finalScore > bestScore) {
      bestScore = finalScore;
      bestIdx = idx;
    }
  });

  return bestIdx;
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
      autoDecide: false,
      autoPlaySpeed: 0,

      setAutoPlaySpeed: (speed) => set({ autoPlaySpeed: speed }),

      startNewLife: (customSeed?: number) => {
        const life = createNewLife(customSeed);
        set({
          life,
          pendingEvent: null,
          lastEventResult: null,
          isSimulating: false,
          hasConfirmedBirthCertificate: false,
          lastPauseReason: null,
          autoPlaySpeed: 0,
        });
      },

      confirmBirthCertificate: () => {
        set({ hasConfirmedBirthCertificate: true });
      },

      stepChildhoodMonth: () => {
        const { life, pendingEvent, autoDecide } = get();
        if (!life || !life.isAlive || pendingEvent) return;

        const res = advanceChildhoodMonth(life, ALL_CHILDHOOD_EVENTS, CHILDHOOD_AMBIENT_DATA);
        if (res.pendingEvent && autoDecide) {
          const idx = pickAutoChoiceIndex(res.state, res.pendingEvent);
          const resolved = resolveEventChoice(res.state, res.pendingEvent, idx);
          set({
            life: resolved.state,
            pendingEvent: null,
            lastEventResult: `[Tự động chọn] ${resolved.resultText}`,
          });
          return;
        }
        set({
          life: res.state,
          pendingEvent: res.pendingEvent,
          lastEventResult: null,
        });
      },

      advanceToNextDecision: () => {
        const { life, pendingEvent, isSimulating, autoPauseConfig, autoDecide } = get();
        if (!life || !life.isAlive || pendingEvent || isSimulating) return;

        const age = Math.floor(life.profile.totalDays / 360);
        if (age < 13) {
          let current = life;
          for (let m = 0; m < 72; m += 1) {
            const res = advanceChildhoodMonth(current, ALL_CHILDHOOD_EVENTS, CHILDHOOD_AMBIENT_DATA);
            current = res.state;
            if (res.pendingEvent && autoDecide) {
              const idx = pickAutoChoiceIndex(current, res.pendingEvent);
              const resolved = resolveEventChoice(current, res.pendingEvent, idx);
              current = resolved.state;
              if (!current.isAlive || Math.floor(current.profile.totalDays / 360) >= 13) {
                set({ life: current, pendingEvent: null, lastEventResult: `[Tự động chọn] ${resolved.resultText}` });
                return;
              }
              continue;
            }
            if (res.pendingEvent || !current.isAlive || Math.floor(current.profile.totalDays / 360) >= 13) {
              set({
                life: current,
                pendingEvent: res.pendingEvent,
                lastEventResult: null,
              });
              return;
            }
          }
          set({ life: current, pendingEvent: null, lastEventResult: null });
          return;
        }

        // Adulthood: advance in chunks up to 3 years until a major event or pause triggers
        let current = life;
        for (let chunk = 0; chunk < 36; chunk += 1) {
          const res = advanceDays(current, 30, ALL_ACTIONS, ALL_ADULTHOOD_EVENTS, autoPauseConfig);
          current = res.state;
          if (res.pendingEvent && autoDecide) {
            const idx = pickAutoChoiceIndex(current, res.pendingEvent);
            const resolved = resolveEventChoice(current, res.pendingEvent, idx);
            current = res.pendingEvent.id.startsWith('dec_')
              ? applyDynamicDecisionSideEffects(resolved.state, res.pendingEvent.id, idx)
              : resolved.state;
            if (!current.isAlive) {
              set({ life: current, pendingEvent: null, lastPauseReason: res.pausedReason ?? null, lastEventResult: `[Tự động chọn] ${resolved.resultText}` });
              return;
            }
            continue;
          }
          if (res.pendingEvent || res.pausedReason || !current.isAlive) {
            set({
              life: current,
              pendingEvent: res.pendingEvent ?? null,
              lastPauseReason: res.pausedReason ?? null,
              lastEventResult: null,
            });
            return;
          }
        }
        set({ life: current, pendingEvent: null, lastPauseReason: null, lastEventResult: null });
      },

      toggleAutoDecide: () => {
        const next = !get().autoDecide;
        const { life, pendingEvent } = get();
        if (next && life && pendingEvent) {
          const idx = pickAutoChoiceIndex(life, pendingEvent);
          const resolved = resolveEventChoice(life, pendingEvent, idx);
          set({
            autoDecide: next,
            life: resolved.state,
            pendingEvent: null,
            lastEventResult: `[Tự động chọn] ${resolved.resultText}`,
          });
          return;
        }
        set({ autoDecide: next });
      },

      togglePinLog: (logIndex: number) => {
        const { life } = get();
        if (!life) return;
        const nextLogs = life.logs.map((entry, idx) =>
          idx === logIndex ? { ...entry, pinned: !entry.pinned } : entry,
        );
        set({ life: { ...life, logs: nextLogs } });
      },

      addPlayerThought: (text: string) => {
        const trimmed = text.trim();
        const { life } = get();
        if (!life || !trimmed) return;
        const entry = {
          day: life.profile.totalDays,
          category: 'event' as const,
          text: trimmed,
          tone: 'milestone' as const,
          pinned: true,
          isThought: true,
        };
        const nextLogs = [...life.logs, entry].slice(-150);
        set({ life: { ...life, logs: nextLogs } });
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

        const applyResult = (
          resState: ActiveLifeState,
          resPending: GameEventDef | null | undefined,
          resPaused: AutoPauseReason | null | undefined,
        ) => {
          const { autoDecide } = get();
          if (resPending && autoDecide) {
            const idx = pickAutoChoiceIndex(resState, resPending);
            const resolved = resolveEventChoice(resState, resPending, idx);
            const finalState = resPending.id.startsWith('dec_')
              ? applyDynamicDecisionSideEffects(resolved.state, resPending.id, idx)
              : resolved.state;
            set({
              life: finalState,
              pendingEvent: null,
              lastPauseReason: resPaused ?? null,
              lastEventResult: `[Tự động chọn] ${resolved.resultText}`,
              isSimulating: false,
            });
            return;
          }
          set({
            life: resState,
            pendingEvent: resPending ?? null,
            lastPauseReason: resPaused ?? null,
            lastEventResult: null,
            isSimulating: false,
          });
        };

        const worker = getWorker();
        if (!worker) {
          const res = advanceDays(life, days, ALL_ACTIONS, ALL_ADULTHOOD_EVENTS, autoPauseConfig);
          applyResult(res.state, res.pendingEvent, res.pausedReason);
          return;
        }

        set({ isSimulating: true, lastPauseReason: null, lastEventResult: null });
        const runSyncFallback = () => {
          const res = advanceDays(life, days, ALL_ACTIONS, ALL_ADULTHOOD_EVENTS, autoPauseConfig);
          applyResult(res.state, res.pendingEvent, res.pausedReason);
        };
        worker.onmessage = (e: MessageEvent<WorkerResponse>) => {
          const msg = e.data;
          if (msg.type === 'SIMULATION_DONE') {
            applyResult(msg.state, msg.pendingEvent, msg.pausedReason as AutoPauseReason | undefined);
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
        const finalState = pendingEvent.id.startsWith('dec_')
          ? applyDynamicDecisionSideEffects(res.state, pendingEvent.id, choiceIndex)
          : res.state;
        set({
          life: finalState,
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

      setInvestmentChannel: (channel) => {
        const { life } = get();
        if (!life) return;
        set({
          life: {
            ...life,
            investmentChannel: channel,
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
          autoPlaySpeed: 0,
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
