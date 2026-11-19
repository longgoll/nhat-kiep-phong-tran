import { describe, expect, it } from 'vitest';
import { ALL_ACTIONS as ACTIONS, ALL_ADULTHOOD_EVENTS as EVENTS } from '../../data/registry';
import {
  DAYS_PER_YEAR,
  getAgeYears,
  type ActiveLifeState,
  type OriginClass,
} from '../../types/activeLife';
import type { GameEventDef } from '../../types/dsl';
import { resolveEventChoice } from '../childhoodEngine';
import { advanceDays, type AutoPauseConfig } from '../daySimulator';
import { applyDynamicDecisionSideEffects } from '../decisionGenerator';
import { createNewLife } from '../lifeInitializer';
import { planYear } from '../yearPlanner';

const SILENT_AUTOPAUSE: AutoPauseConfig = {
  pauseOnBirthday: false,
  pauseOnLowHealth: false,
  pauseOnLowHappiness: false,
  pauseOnNoFood: false,
};

type BotPersona = 'scholar' | 'worker' | 'balanced';

const ALL_ORIGINS: OriginClass[] = ['ban_nong', 'thu_cong', 'dia_chu', 'quan_lai', 'hoang_toc'];
const PERSONAS: BotPersona[] = ['scholar', 'worker', 'balanced'];

function pickBotChoice(state: ActiveLifeState, event: GameEventDef, persona: BotPersona): number {
  if (event.choices.length <= 1) return 0;

  if (event.id === 'dec_college_18') {
    if (persona === 'scholar') return 0;
    if (persona === 'balanced') return 1;
    return Math.min(3, event.choices.length - 1);
  }

  if (event.id === 'dec_job_offers') {
    // Pick first offered job unless none
    return 0;
  }

  if (event.id === 'dec_rankup') {
    return 0; // Accept promotion
  }

  if (event.id === 'dec_retire_60') {
    return persona === 'worker' ? 1 : 0;
  }

  // Deterministic persona-based choice selection for general events
  const idx = (state.profile.totalDays + persona.length) % event.choices.length;
  return idx;
}

function createAdultStarter(seed: number, originClass: OriginClass, persona: BotPersona): ActiveLifeState {
  let life = createNewLife(seed);
  const focus =
    persona === 'scholar' ? 'cong_danh' : persona === 'worker' ? 'lam_them' : 'can_bang';
  const morningAct =
    persona === 'scholar' ? 'act_tu_hoc_chu' : 'act_lam_thue_nong_vu';

  life = {
    ...life,
    profile: {
      ...life.profile,
      originClass,
      totalDays: 13 * DAYS_PER_YEAR,
      currentRole: 'Thiếu niên',
    },
    assets: {
      ...life.assets,
      rice: Math.max(life.assets.rice, 40),
      wealthCopper: Math.max(life.assets.wealthCopper, 300),
    },
    schedule: {
      ...life.schedule,
      lifeFocus: focus,
      morning: morningAct,
      afternoon: persona === 'scholar' ? 'act_tu_hoc_chu' : 'act_nghi_ngoi',
      evening: 'act_nghi_ngoi',
      night: 'act_ngu',
    },
  };
  return life;
}

interface SimulatedLifeReport {
  origin: OriginClass;
  persona: BotPersona;
  seed: number;
  finalAge: number;
  isAlive: boolean;
  deathReason?: string;
  finalCopper: number;
  finalEducation: number;
  decisionsFired: string[];
  eventsFired: string[];
  timeline: string[];
}

function simulateFullAdulthood(
  seed: number,
  origin: OriginClass,
  persona: BotPersona,
  maxAge = 80,
): SimulatedLifeReport {
  let state = createAdultStarter(seed, origin, persona);
  const decisionsFired: string[] = [];
  const eventsFired: string[] = [];
  const timeline: string[] = [];

  const maxTotalDays = maxAge * DAYS_PER_YEAR;
  let guard = 0;

  while (state.isAlive && state.profile.totalDays < maxTotalDays && guard < 300) {
    guard += 1;
    const remaining = maxTotalDays - state.profile.totalDays;
    const res = advanceDays(state, remaining, ACTIONS, EVENTS, SILENT_AUTOPAUSE);
    state = res.state;

    // Assert no NaN corruption at any step
    expect(Number.isNaN(state.stats.health)).toBe(false);
    expect(Number.isNaN(state.stats.happiness)).toBe(false);
    expect(Number.isNaN(state.stats.education)).toBe(false);
    expect(Number.isNaN(state.assets.wealthCopper)).toBe(false);

    if (res.pendingEvent) {
      const evt = res.pendingEvent;
      const age = getAgeYears(state.profile.totalDays);
      const choiceIdx = pickBotChoice(state, evt, persona);
      const resolved = resolveEventChoice(state, evt, choiceIdx);
      state = evt.id.startsWith('dec_')
        ? applyDynamicDecisionSideEffects(resolved.state, evt.id, choiceIdx)
        : resolved.state;

      if (evt.id.startsWith('dec_')) {
        decisionsFired.push(evt.id);
      } else {
        eventsFired.push(evt.id);
      }
      timeline.push(`[Tuổi ${age}] ${evt.id}: ${evt.title} -> chọn #${choiceIdx}`);
    }
  }

  return {
    origin,
    persona,
    seed,
    finalAge: getAgeYears(state.profile.totalDays),
    isAlive: state.isAlive,
    deathReason: state.deathReason,
    finalCopper: state.assets.wealthCopper,
    finalEducation: state.stats.education,
    decisionsFired,
    eventsFired,
    timeline,
  };
}

describe('YearPlanner & Headless Life Audit Simulation', () => {
  it('plans at most 2 decisions and 2-3 feed events per year with postponed priority boost', () => {
    let life = createNewLife(777);
    // Set age 18, unemployed, in heavy debt -> 3+ candidates eligible simultaneously
    life = {
      ...life,
      profile: { ...life.profile, totalDays: 18 * DAYS_PER_YEAR },
      assets: { ...life.assets, wealthCopper: -500 },
      livelihoodStatus: 'seeking',
    };

    const planned = planYear(life, EVENTS);
    expect(planned.yearPlan).toBeDefined();
    expect(planned.yearPlan!.scheduledDecisions.length).toBeLessThanOrEqual(2);
    expect(planned.yearPlan!.scheduledDecisions.length).toBe(2);
    expect(planned.yearPlan!.postponedDecisionIds.length).toBeGreaterThanOrEqual(1);
    expect(planned.yearPlan!.feedEventIds.length).toBeGreaterThanOrEqual(2);
    expect(planned.yearPlan!.feedEventIds.length).toBeLessThanOrEqual(3);

    // Ensure no duplicate feed event IDs in the same year
    const feedIds = planned.yearPlan!.feedEventIds.map((f) => f.eventId);
    expect(new Set(feedIds).size).toBe(feedIds.length);
  });

  it('audits 30 lifetimes across all 5 origins & 3 personas for pacing, coverage, and narrative sanity', () => {
    const reports: SimulatedLifeReport[] = [];
    const globalEventHits = new Map<string, number>();
    const globalDecisionHits = new Map<string, number>();

    let seedCounter = 1000;
    for (const origin of ALL_ORIGINS) {
      for (const persona of PERSONAS) {
        for (let run = 0; run < 2; run++) {
          seedCounter += 17;
          const report = simulateFullAdulthood(seedCounter, origin, persona, 75);
          reports.push(report);

          for (const id of report.eventsFired) {
            globalEventHits.set(id, (globalEventHits.get(id) ?? 0) + 1);
          }
          for (const id of report.decisionsFired) {
            globalDecisionHits.set(id, (globalDecisionHits.get(id) ?? 0) + 1);
          }
        }
      }
    }

    expect(reports.length).toBe(30);

    // 1. Check college decision fires reliably for eligible lives
    const collegeHits = globalDecisionHits.get('dec_college_18') ?? 0;
    expect(collegeHits).toBeGreaterThanOrEqual(20);

    // 2. Check annual pacing is bounded and healthy (not starved, not spammed)
    const avgYears =
      reports.reduce((acc, r) => acc + Math.max(1, r.finalAge - 13), 0) / reports.length;
    const avgMajorTriggersPerYear =
      reports.reduce(
        (acc, r) =>
          acc + (r.decisionsFired.length + r.eventsFired.length) / Math.max(1, r.finalAge - 13),
        0,
      ) / reports.length;

    expect(avgYears).toBeGreaterThan(20);
    expect(avgMajorTriggersPerYear).toBeGreaterThan(0.2);
    expect(avgMajorTriggersPerYear).toBeLessThan(5.0);

    // 3. Print compact audit summary for dev inspection
    const adulthoodMajorEvents = EVENTS.filter(
      (e) => (e.stage === 'adulthood' || e.stage === 'any') && e.severity === 'major' && e.cooldownDays > 0,
    );
    const untriggeredMajors = adulthoodMajorEvents
      .filter((e) => !globalEventHits.has(e.id))
      .map((e) => e.id);

    const richSample = reports.find((r) => r.timeline.length >= 10) ?? reports[0];
    const perOriginSummary = ALL_ORIGINS.map((orig) => {
      const sub = reports.filter((r) => r.origin === orig);
      const avgAge = sub.reduce((a, r) => a + r.finalAge, 0) / sub.length;
      const avgEvts = sub.reduce((a, r) => a + r.eventsFired.length + r.decisionsFired.length, 0) / sub.length;
      return `${orig}: avgAge=${avgAge.toFixed(1)}, avgTriggers=${avgEvts.toFixed(1)}`;
    });

    console.info('\n=== LIFE AUDIT SUMMARY (30 lives: 5 origins x 3 personas x 2 seeds) ===');
    console.info(`Avg adulthood years: ${avgYears.toFixed(1)}, Avg major triggers/yr: ${avgMajorTriggersPerYear.toFixed(2)}`);
    console.info('Per-origin:', perOriginSummary.join(' | '));
    console.info('Decision hits:', Object.fromEntries(globalDecisionHits.entries()));
    console.info(`Untriggered major pool events (${untriggeredMajors.length}/${adulthoodMajorEvents.length}):`, untriggeredMajors.slice(0, 15));
    console.info(`Sample chronicle (${richSample.origin}/${richSample.persona}, finalAge=${richSample.finalAge}):`, richSample.timeline.slice(0, 10));
  }, 60000);
});
