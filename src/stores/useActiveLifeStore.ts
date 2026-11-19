import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ActiveLifeState } from '../types/activeLife';
import type { GameEventDef } from '../types/dsl';
import { createNewLife } from '../engine/lifeInitializer';
import { advanceChildhoodMonth, resolveEventChoice } from '../engine/childhoodEngine';
import { applyDynamicDecisionSideEffects } from '../engine/decisionGenerator';
import {
  advanceDays,
  DEFAULT_AUTO_PAUSE_CONFIG,
  type AutoPauseReason,
} from '../engine/daySimulator';
import {
  ALL_ACTIONS,
  ALL_ADULTHOOD_EVENTS,
  ALL_CHILDHOOD_EVENTS,
  CHILDHOOD_ACTIVITIES,
  CHILDHOOD_AMBIENT_DATA,
} from '../data/registry';
import type { WorkerResponse } from '../workers/simulation.worker';
import type { ActiveLifeStore } from './activeLife/types';
import { getWorker, pickAutoChoiceIndex } from './activeLife/workerBridge';
import { createScheduleAndEconomyActions } from './activeLife/scheduleAndEconomyActions';

export { ALL_ACTIONS, CHILDHOOD_ACTIVITIES };
export type { ActiveLifeStore };

export const useActiveLifeStore = create<ActiveLifeStore>()(
  persist(
    (set, get) => ({
      life: null,
      pendingEvent: null,
      lastEventResult: null,
      isSimulating: false,
      hasConfirmedBirthCertificate: true,
      autoPauseConfig: { ...DEFAULT_AUTO_PAUSE_CONFIG },
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
          // 'major_event' is handled by pendingEvent (EventModal) without killing autoPlaySpeed,
          // matching ChildhoodView behavior where playback resumes after choosing an option.
          const effectivePauseReason = resPaused === 'major_event' ? null : (resPaused ?? null);
          if (resPending && autoDecide) {
            const idx = pickAutoChoiceIndex(resState, resPending);
            const resolved = resolveEventChoice(resState, resPending, idx);
            const finalState = resPending.id.startsWith('dec_')
              ? applyDynamicDecisionSideEffects(resolved.state, resPending.id, idx)
              : resolved.state;
            set({
              life: finalState,
              pendingEvent: null,
              lastPauseReason: effectivePauseReason,
              lastEventResult: `[Tự động chọn] ${resolved.resultText}`,
              isSimulating: false,
            });
            return;
          }
          set({
            life: resState,
            pendingEvent: resPending ?? null,
            lastPauseReason: effectivePauseReason,
            lastEventResult: null,
            isSimulating: false,
          });
        };

        // Run short ticks (<= 30 days) synchronously so the rAF timeline bar stays 60fps
        // without Worker structuredClone latency or backwards progress jumps.
        const worker = days > 30 ? getWorker() : null;
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

      ...createScheduleAndEconomyActions(set, get),

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
