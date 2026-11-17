import actionsData from '../data/actions.json';
import adulthoodEvents from '../data/events_truong_thanh.json';
import type { ActiveLifeState } from '../types/activeLife';
import type { ActionDef, GameEventDef } from '../types/dsl';
import { advanceDays, type AutoPauseConfig } from '../engine/daySimulator';
import { resolveEventChoice } from '../engine/childhoodEngine';

const ACTIONS = actionsData as ActionDef[];
const EVENTS = adulthoodEvents as GameEventDef[];

export type WorkerRequest =
  | {
      type: 'ADVANCE_DAYS';
      state: ActiveLifeState;
      days: number;
      autoPauseConfig: AutoPauseConfig;
    }
  | {
      type: 'RESOLVE_EVENT_CHOICE';
      state: ActiveLifeState;
      event: GameEventDef;
      choiceIndex: number;
    };

export type WorkerResponse =
  | {
      type: 'SIMULATION_DONE';
      state: ActiveLifeState;
      daysSimulated: number;
      pausedReason?: string;
      pendingEvent?: GameEventDef;
    }
  | {
      type: 'EVENT_RESOLVED';
      state: ActiveLifeState;
      resultText: string;
    }
  | {
      type: 'SIMULATION_ERROR';
      error: string;
    };

self.onmessage = (e: MessageEvent<WorkerRequest>) => {
  const msg = e.data;
  try {
    if (msg.type === 'ADVANCE_DAYS') {
      const res = advanceDays(msg.state, msg.days, ACTIONS, EVENTS, msg.autoPauseConfig);
      const response: WorkerResponse = {
        type: 'SIMULATION_DONE',
        state: res.state,
        daysSimulated: res.daysSimulated,
        pausedReason: res.pausedReason,
        pendingEvent: res.pendingEvent,
      };
      self.postMessage(response);
    } else if (msg.type === 'RESOLVE_EVENT_CHOICE') {
      const res = resolveEventChoice(msg.state, msg.event, msg.choiceIndex);
      const response: WorkerResponse = {
        type: 'EVENT_RESOLVED',
        state: res.state,
        resultText: res.resultText,
      };
      self.postMessage(response);
    }
  } catch (err) {
    self.postMessage({
      type: 'SIMULATION_ERROR',
      error: err instanceof Error ? err.message : String(err),
    } satisfies WorkerResponse);
  }
};
