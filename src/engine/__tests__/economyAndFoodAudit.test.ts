import { describe, expect, it } from 'vitest';
import {
  ALL_ACTIONS as ACTIONS,
  ALL_ADULTHOOD_EVENTS as EVENTS,
  ALL_CHILDHOOD_EVENTS as CHILDHOOD_EVENTS,
} from '../../data/registry';
import { DAYS_PER_YEAR, getAgeYears, type ActiveLifeState, type OriginClass } from '../../types/activeLife';
import { advanceDays, type AutoPauseConfig } from '../daySimulator';
import { advanceChildhoodMonth, computeFamilyMonthlyNetCopper, resolveEventChoice } from '../childhoodEngine';
import { applyFinalInheritanceIfEligible, applyMoveOutInheritance } from '../familyEconomy';
import { createNewLife } from '../lifeInitializer';
import { getFeudalTransportLabel } from '../lifeStatus';
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
      // Age-13 transition must leave schedule & fallbackRules under player control (no auto-assigned work/study)
      expect(life.schedule.morning).toBe('act_nghi_ngoi');
      expect(life.schedule.afternoon).toBe('act_nghi_ngoi');
      expect(life.schedule.evening).toBe('act_nghi_ngoi');
      expect(life.schedule.fallbackRules).toEqual([]);
      // Personal grant at age 13 must be bounded by origin tier and logs must not claim royal stipend without rank
      const maxExpectedAt13: Record<OriginClass, number> = {
        ban_nong: 120,
        thu_cong: 350,
        dia_chu: 1650,
        quan_lai: 3200,
        hoang_toc: 8500,
      };
      expect(life.assets.wealthCopper).toBeLessThanOrEqual(maxExpectedAt13[origin]);
      expect(life.assets.rice).toBeLessThanOrEqual(50);
      const lastTransitionLog = life.logs.find((l) => l.text.includes('Tuổi 13'));
      if (lastTransitionLog) {
        expect(lastTransitionLog.text).not.toContain('bổng lộc');
      }

      // Advance 1 full year straight out of age-13 transition WITHOUT overriding schedule:
      // No origin should auto-assign paid work when the character has no job/title/student status.
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

  it('computes family cashflow by exact parent occupations, food self-sufficiency, and handles move-out & inheritance accurately', () => {
    // 1. Occupation-based income differences
    const officialLife = createOriginLife('quan_lai', 200);
    const cleanOfficial: ActiveLifeState = {
      ...officialLife,
      flags: officialLife.flags.filter((f) => f !== 'mo_coi_cha' && f !== 'gia_toc_sa_sut'),
      npcs: officialLife.npcs.map((n) => (n.relation === 'parent' ? { ...n, isAlive: true } : n)),
      family: { ...officialLife.family!, fatherOccupation: 'quan_van', motherOccupation: 'phu_nhan' },
    };
    const corruptOfficial: ActiveLifeState = {
      ...cleanOfficial,
      family: { ...cleanOfficial.family!, fatherOccupation: 'tham_quan', motherOccupation: 'phu_nhan' },
    };

    const cleanFlow = computeFamilyMonthlyNetCopper(cleanOfficial);
    const corruptFlow = computeFamilyMonthlyNetCopper(corruptOfficial);
    expect(corruptFlow.fatherIncome).toBeGreaterThan(cleanFlow.fatherIncome);
    expect(cleanFlow.foodSelfSufficient).toBe(false);

    // 2. Agrarian food self-sufficiency drops during famine (mat_mua)
    const farmerLife = createOriginLife('ban_nong', 300);
    const farmerNormal = computeFamilyMonthlyNetCopper({
      ...farmerLife,
      world: { ...farmerLife.world, worldState: 'binh_on' },
    });
    const farmerFamine = computeFamilyMonthlyNetCopper({
      ...farmerLife,
      world: { ...farmerLife.world, worldState: 'mat_mua' },
    });
    expect(farmerNormal.foodSelfSufficient).toBe(true);
    expect(farmerFamine.foodSelfSufficient).toBe(false);
    expect(farmerFamine.expense).toBeGreaterThan(farmerNormal.expense);

    // 3. Move-out share deducts exact copper from familyWealthCopper and adds to personal wealth
    const richBase: ActiveLifeState = {
      ...officialLife,
      assets: { ...officialLife.assets, wealthCopper: 100 },
      family: { ...officialLife.family!, familyWealthCopper: 5000, birthOrder: 'con_truong' },
    };
    const afterMoveOut = applyMoveOutInheritance(richBase);
    const movedShare = afterMoveOut.assets.wealthCopper - 100;
    expect(movedShare).toBeGreaterThan(0);
    expect(afterMoveOut.family!.familyWealthCopper).toBe(5000 - movedShare);
    // Idempotent: calling again does not grant a second share
    expect(applyMoveOutInheritance(afterMoveOut).assets.wealthCopper).toBe(afterMoveOut.assets.wealthCopper);

    // 4. Final inheritance on last parent passing, blocked for eunuch/harem/indebted
    const orphanRich: ActiveLifeState = {
      ...afterMoveOut,
      npcs: afterMoveOut.npcs.map((n) => (n.relation === 'parent' ? { ...n, isAlive: false } : n)),
    };
    const inherited = applyFinalInheritanceIfEligible(orphanRich);
    expect(inherited.assets.wealthCopper).toBeGreaterThan(afterMoveOut.assets.wealthCopper);
    expect(inherited.family!.familyWealthCopper).toBe(0);
    expect(inherited.flags).toContain('da_chia_di_san');

    const eunuchOrphan: ActiveLifeState = {
      ...orphanRich,
      flags: [...orphanRich.flags, 'thai_giam'],
    };
    const blocked = applyFinalInheritanceIfEligible(eunuchOrphan);
    expect(blocked.assets.wealthCopper).toBe(orphanRich.assets.wealthCopper);

    // 5. Transport label must match housing/rank rather than granting sedan chairs in a mud hut
    const mudHutCommoner: ActiveLifeState = {
      ...createOriginLife('thu_cong', 400),
      officialRank: 0,
      assets: { wealthCopper: 90000, rice: 10, housing: 'nha_tranh', properties: [] },
      schedule: { ...officialLife.schedule, lifestyle: 'com_rau' },
    };
    expect(getFeudalTransportLabel(mudHutCommoner)).not.toContain('Kiệu');
  });
});
