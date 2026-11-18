import {
  DAYS_PER_YEAR,
  getAgeYears,
  type ActiveLifeState,
  type ScheduledDecisionSlot,
  type YearPlanSnapshot,
} from '../types/activeLife';
import type { GameEventDef } from '../types/dsl';
import { computeWeight, evaluateConditions } from './conditionEvaluator';
import { collectDynamicDecisionCandidates } from './decisionGenerator';
import { mulberry32Next, pickWeightedIndex } from './prng';

const MAX_ANNUAL_DECISIONS = 2;
const POSTPONED_PRIORITY_BOOST = 15;
const MAJOR_EVENT_COOLDOWN_DAYS = 90;

function nextIntInRange(prngState: number, min: number, max: number): { value: number; nextState: number } {
  if (max <= min) {
    const r = mulberry32Next(prngState);
    return { value: min, nextState: r.nextState };
  }
  const r = mulberry32Next(prngState);
  const value = min + Math.floor(r.value * (max - min + 1));
  return { value, nextState: r.nextState };
}

/**
 * 1in8b-style Annual Scheduler (`planYear`):
 * - Channel 1 (`scheduledDecisions`): Up to 2 character-shaping decisions/year sorted by priority;
 *   overflows are postponed to next year with a priority boost.
 * - Channel 2 (`chooseFeed`): 2-3 regional/life feed events/year spread across [0.08, 0.94] of the year.
 */
export function planYear(state: ActiveLifeState, eventsPool: GameEventDef[]): ActiveLifeState {
  const totalDays = state.profile.totalDays;
  const yearAge = getAgeYears(totalDays);
  const dayOfYear = totalDays % DAYS_PER_YEAR;
  const yearEndDay = totalDays - dayOfYear + DAYS_PER_YEAR - 1;
  const remainingDays = Math.max(1, yearEndDay - totalDays);

  let prngState = state.prngState;

  // --- Channel 1: Scheduled Decisions (max 2/year) ---
  const prevPostponed = new Set(state.yearPlan?.postponedDecisionIds ?? []);
  const rawCandidates = collectDynamicDecisionCandidates(state).map((c) => ({
    ...c,
    effectivePriority: c.priority + (prevPostponed.has(c.id) ? POSTPONED_PRIORITY_BOOST : 0),
  }));
  rawCandidates.sort((a, b) => b.effectivePriority - a.effectivePriority);

  const chosenCandidates = rawCandidates.slice(0, MAX_ANNUAL_DECISIONS);
  const postponedDecisionIds = rawCandidates.slice(MAX_ANNUAL_DECISIONS).map((c) => c.id);

  const scheduledDecisions: ScheduledDecisionSlot[] = [];
  if (chosenCandidates.length >= 1) {
    const minOff = Math.min(remainingDays, 18);
    const maxOff = Math.min(remainingDays, Math.max(minOff, Math.floor(remainingDays * 0.42)));
    const r1 = nextIntInRange(prngState, minOff, maxOff);
    prngState = r1.nextState;
    scheduledDecisions.push({
      decisionId: chosenCandidates[0].id,
      triggerDay: totalDays + r1.value,
      priority: chosenCandidates[0].effectivePriority,
      status: 'pending',
    });
  }
  if (chosenCandidates.length >= 2) {
    const minOff = Math.min(remainingDays, Math.max(30, Math.floor(remainingDays * 0.55)));
    const maxOff = Math.min(remainingDays, Math.max(minOff, Math.floor(remainingDays * 0.88)));
    const r2 = nextIntInRange(prngState, minOff, maxOff);
    prngState = r2.nextState;
    scheduledDecisions.push({
      decisionId: chosenCandidates[1].id,
      triggerDay: totalDays + r2.value,
      priority: chosenCandidates[1].effectivePriority,
      status: 'pending',
    });
  }

  // --- Channel 2: Regional & Life Feed (`chooseFeed`, 2-3/year) ---
  const countRoll = mulberry32Next(prngState);
  prngState = countRoll.nextState;
  const targetFeedCount = countRoll.value < 0.5 ? 2 : 3;

  const alreadyQueuedIds = new Set(state.delayedEvents.map((d) => d.eventId));
  const eligibleFeed = eventsPool.filter((evt) => {
    if (evt.stage !== 'adulthood' && evt.stage !== 'any') return false;
    if (evt.cooldownDays === 0) return false; // chain/delayed-only events
    if (evt.oncePerLife && state.eventCooldowns[evt.id] !== undefined) return false;
    if (alreadyQueuedIds.has(evt.id)) return false;
    const last = state.eventCooldowns[evt.id] ?? -99999;
    if (totalDays - last < evt.cooldownDays) return false;
    return evaluateConditions(state, evt.conditions);
  });

  const pickedFeed: GameEventDef[] = [];
  let majorPickedThisYear = false;
  const usedIds = new Set<string>();

  for (let slotIdx = 0; slotIdx < targetFeedCount; slotIdx++) {
    const canPickMajor =
      !majorPickedThisYear &&
      totalDays - (state.lastMajorEventDay ?? -9999) >= MAJOR_EVENT_COOLDOWN_DAYS;

    const pool = eligibleFeed.filter((e) => {
      if (usedIds.has(e.id)) return false;
      if (e.severity === 'major' && !canPickMajor) return false;
      return true;
    });

    if (pool.length === 0) break;

    const weights = pool.map((e) => {
      const baseW = computeWeight(state, e.weight);
      const lastFired = state.eventCooldowns[e.id];
      if (lastFired !== undefined && totalDays - lastFired < 1800) {
        return Math.max(1, Math.round(baseW * 0.3));
      }
      return baseW;
    });
    const sumW = weights.reduce((a, b) => a + b, 0);
    if (sumW <= 0) break;

    const pick = pickWeightedIndex(prngState, weights);
    prngState = pick.nextState;
    const chosen = pool[pick.index];
    pickedFeed.push(chosen);
    usedIds.add(chosen.id);
    if (chosen.severity === 'major') {
      majorPickedThisYear = true;
    }
  }

  // Spread feed events across [0.08, 0.94] of remaining year
  const feedStart = Math.min(remainingDays, Math.max(10, Math.floor(DAYS_PER_YEAR * 0.08) - dayOfYear));
  const feedEnd = Math.min(remainingDays, Math.max(feedStart, Math.floor(DAYS_PER_YEAR * 0.94) - dayOfYear));
  const span = Math.max(1, feedEnd - feedStart);
  const occupiedDays = new Set(scheduledDecisions.map((s) => s.triggerDay));

  const newDelayedEvents = [...state.delayedEvents];
  const feedEventIds: Array<{ eventId: string; triggerDay: number }> = [];

  pickedFeed.forEach((evt, idx) => {
    const bucketStart = feedStart + Math.floor((span * idx) / pickedFeed.length);
    const bucketEnd = feedStart + Math.floor((span * (idx + 1)) / pickedFeed.length);
    const rDay = nextIntInRange(prngState, bucketStart, Math.max(bucketStart, bucketEnd));
    prngState = rDay.nextState;

    let triggerDay = totalDays + rDay.value;
    while (occupiedDays.has(triggerDay) && triggerDay < yearEndDay) {
      triggerDay += 1;
    }
    occupiedDays.add(triggerDay);

    newDelayedEvents.push({ eventId: evt.id, triggerDay });
    feedEventIds.push({ eventId: evt.id, triggerDay });
  });

  const yearPlan: YearPlanSnapshot = {
    yearAge,
    plannedAtDay: totalDays,
    scheduledDecisions,
    postponedDecisionIds,
    feedEventIds,
  };

  return {
    ...state,
    prngState,
    delayedEvents: newDelayedEvents,
    yearPlan,
  };
}
