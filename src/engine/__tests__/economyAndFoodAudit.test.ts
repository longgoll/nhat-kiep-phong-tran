import { describe, expect, it } from 'vitest';
import {
  ALL_ACTIONS as ACTIONS,
  ALL_ADULTHOOD_EVENTS as EVENTS,
  ALL_CHILDHOOD_EVENTS as CHILDHOOD_EVENTS,
} from '../../data/registry';
import { DAYS_PER_YEAR, getAgeYears, type ActiveLifeState, type OriginClass } from '../../types/activeLife';
import { advanceDays, type AutoPauseConfig } from '../daySimulator';
import { advanceChildhoodMonth, resolveEventChoice } from '../childhoodEngine';
import { createNewLife } from '../lifeInitializer';
import { applyDynamicDecisionSideEffects } from '../decisionGenerator';

const SILENT_AUTOPAUSE: AutoPauseConfig = {
  pauseOnBirthday: false,
  pauseOnLowHealth: false,
  pauseOnLowHappiness: false,
  pauseOnNoFood: false,
};

const ALL_ORIGINS: OriginClass[] = ['ban_nong', 'thu_cong', 'dia_chu', 'quan_lai', 'hoang_toc'];
const CHILDHOOD_POOL = [...CHILDHOOD_EVENTS];

function createOriginLife(origin: OriginClass, seedOffset: number): ActiveLifeState {
  for (let s = 1 + seedOffset; s < 5000 + seedOffset; s += 1) {
    const life = createNewLife(s);
    if (life.profile.originClass === origin) {
      return life;
    }
  }
  throw new Error(`Could not find seed for origin ${origin}`);
}

function runChildhoodToAge13(initial: ActiveLifeState): ActiveLifeState {
  let life = initial;
  let guard = 0;
  while (life.isAlive && getAgeYears(life.profile.totalDays) < 13 && guard < 200) {
    guard += 1;
    const step = advanceChildhoodMonth(life, CHILDHOOD_POOL);
    life = step.state;
    if (step.pendingEvent) {
      life = resolveEventChoice(life, step.pendingEvent, 0).state;
    }
  }
  return life;
}

describe('Economy, Food & Stipend Integrity Audit', () => {
  it('does not grant unearned stipend or free cash at age 13 or during idle adulthood without job/title/study', () => {
    for (const origin of ALL_ORIGINS) {
      let life = createOriginLife(origin, 100);
      life = runChildhoodToAge13(life);

      expect(life.isAlive).toBe(true);
      expect(getAgeYears(life.profile.totalDays)).toBe(13);
      // Personal grant at age 13 must be bounded (never >450đ) and logs must not claim royal stipend without rank
      expect(life.assets.wealthCopper).toBeLessThanOrEqual(450);
      expect(life.assets.rice).toBeLessThanOrEqual(50);
      const lastTransitionLog = life.logs.find((l) => l.text.includes('Tuổi 13'));
      if (lastTransitionLog) {
        expect(lastTransitionLog.text).not.toContain('bổng lộc');
      }

      // Now stay completely idle (no job, no officialRank, no properties, not a student) for 1 full year
      const copperAt13 = life.assets.wealthCopper;
      const idleState: ActiveLifeState = {
        ...life,
        isStudent: false,
        officialRank: 0,
        activeCareer: null,
        activeVenture: null,
        assets: {
          ...life.assets,
          properties: [],
        },
        schedule: {
          ...life.schedule,
          morning: 'act_nghi_ngoi',
          afternoon: 'act_nghi_ngoi',
          evening: 'act_nghi_ngoi',
          night: 'act_ngu',
        },
      };

      const res14 = advanceDays(idleState, DAYS_PER_YEAR, ACTIONS, [], SILENT_AUTOPAUSE);
      // Without work, title, property, or student status, wealthCopper must NEVER increase on its own
      expect(res14.state.assets.wealthCopper).toBeLessThanOrEqual(copperAt13);
      expect(res14.state.finance?.currentYear.workIncomeCopper ?? 0).toBe(0);
    }
  });

  it('maintains valid money, rice, and ledger invariants across full lifetimes (birth to death/80) for all 5 origins', () => {
    for (let i = 0; i < ALL_ORIGINS.length; i += 1) {
      const origin = ALL_ORIGINS[i];
      for (let seedRun = 0; seedRun < 2; seedRun += 1) {
        let state = runChildhoodToAge13(createOriginLife(origin, i * 100 + seedRun * 17));
        let steps = 0;

        while (state.isAlive && getAgeYears(state.profile.totalDays) < 80 && steps < 300) {
          steps += 1;
          const res = advanceDays(state, 360, ACTIONS, EVENTS, SILENT_AUTOPAUSE);
          state = res.state;

          // Financial & food sanity invariants on every step
          expect(Number.isFinite(state.assets.wealthCopper)).toBe(true);
          expect(Number.isFinite(state.assets.rice)).toBe(true);
          expect(state.assets.rice).toBeGreaterThanOrEqual(0);
          expect(Number.isFinite(state.assets.goldReserveCopper ?? 0)).toBe(true);
          expect(state.assets.goldReserveCopper ?? 0).toBeGreaterThanOrEqual(0);

          if (state.family) {
            expect(Number.isFinite(state.family.familyWealthCopper)).toBe(true);
            expect(state.family.familyWealthCopper).toBeGreaterThanOrEqual(0);
          }

          if (state.finance) {
            expect(Number.isFinite(state.finance.currentYear.workIncomeCopper)).toBe(true);
            expect(Number.isFinite(state.finance.currentYear.propertyIncomeCopper)).toBe(true);
            expect(Number.isFinite(state.finance.currentYear.livingExpenseCopper)).toBe(true);
            expect(Number.isFinite(state.finance.currentYear.otherExpenseCopper)).toBe(true);
            expect(state.finance.currentYear.workIncomeCopper).toBeGreaterThanOrEqual(0);
            expect(state.finance.currentYear.livingExpenseCopper).toBeGreaterThanOrEqual(0);
          }

          if (res.pendingEvent) {
            const evt = res.pendingEvent;
            const choiceIdx = 0;
            state = resolveEventChoice(state, evt, choiceIdx).state;
            if (evt.id.startsWith('dec_')) {
              state = applyDynamicDecisionSideEffects(state, evt.id, choiceIdx);
            }
          }
        }
      }
    }
  }, 30000);
});
