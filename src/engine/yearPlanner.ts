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

const PALACE_OR_EUNUCH_ALLOWED_PREFIXES = [
  'evt_harem_',
  'evt_fate_palace',
  'evt_fate_eunuch',
  'evt_court_',
  'evt_life_',
  'evt_elder_',
  'evt_chain_bao_hieu',
];

const PALACE_OR_EUNUCH_ALLOWED_IDS = new Set([
  'evt_family_father_old_age_passing',
  'evt_family_mother_old_age_passing',
  'evt_adult_exp_hoang_toc_slander',
  'evt_adult_exp_hoang_toc_vindication',
  'evt_adult_hoang_toc_teen_empress_dowager',
  'evt_adult_hoang_toc_clan_mediation',
  'evt_adult_hoang_toc_elder_memoirs',
]);

const SERVITUDE_BLOCKED_PREFIXES = [
  'evt_scholar_',
  'evt_official_',
  'evt_military_',
  'evt_jianghu_',
  'evt_biz_',
  'evt_wealth_',
  'evt_craft_',
  'evt_estate_',
];

const FEMALE_CROSSDRESS_ONLY_IDS = new Set([
  'evt_scholar_local_exam_temptation',
  'evt_scholar_road_to_capital',
  'evt_scholar_vinh_quy_bai_to',
  'evt_scholar_poor_exam_fail',
  'evt_scholar_rich_backdoor',
  'evt_adult_quan_lai_tap_am',
]);

const ROYAL_BLOCKED_COMMONER_IDS = new Set([
  'evt_adult_major_noble_patron',
  'evt_elder_village_scholarship',
  'evt_feed_adult_village_feast',
  'evt_feed_adult_neighbor_tea',
  'evt_feed_adult_tet_market',
  'evt_feed_adult_village_ceremony',
  'evt_feed_adult_homesick_meal',
  'evt_adult_martial_bandit_ambush',
]);

/**
 * Global narrative & identity guard enforcing status, gender, and origin boundaries
 * even when individual event JSON files omit redundant `missing_flags`.
 */
export function isEventContextuallyAllowed(state: ActiveLifeState, evt: GameEventDef): boolean {
  const isPrison = state.livelihoodStatus === 'prison' || state.flags.includes('dang_o_tu');
  if (isPrison) {
    return (
      evt.id.includes('prison') ||
      evt.id === 'evt_life_midlife_illness' ||
      evt.id === 'evt_family_father_old_age_passing' ||
      evt.id === 'evt_family_mother_old_age_passing'
    );
  }

  const inHarem = state.flags.includes('trong_hau_cung');
  const isEunuch = state.flags.includes('thai_giam');
  if (inHarem || isEunuch) {
    const hasExplicitPalaceFlag =
      (evt.conditions.has_flags ?? []).some((f) => f === 'trong_hau_cung' || f === 'thai_giam') ||
      (evt.conditions.has_any_flag ?? []).some((f) => f === 'trong_hau_cung' || f === 'thai_giam');
    const isAllowedPrefix = PALACE_OR_EUNUCH_ALLOWED_PREFIXES.some((p) => evt.id.startsWith(p));
    if (!hasExplicitPalaceFlag && !isAllowedPrefix && !PALACE_OR_EUNUCH_ALLOWED_IDS.has(evt.id)) {
      return false;
    }
  }

  if (state.flags.includes('bi_ep_lam_gia_no')) {
    if (SERVITUDE_BLOCKED_PREFIXES.some((p) => evt.id.startsWith(p))) {
      return false;
    }
  }

  const hasCrossDressAccess =
    state.profile.gender === 'male' ||
    state.flags.includes('nu_cai_nam_trang') ||
    state.flags.includes('nu_quan_dac_xa');
  if (!hasCrossDressAccess) {
    if (FEMALE_CROSSDRESS_ONLY_IDS.has(evt.id)) return false;
    if (evt.id.startsWith('evt_official_') && state.officialRank === 0) return false;
  }

  if (state.profile.originClass === 'hoang_toc') {
    if (ROYAL_BLOCKED_COMMONER_IDS.has(evt.id)) return false;
    const isDeclined =
      state.flags.includes('gia_toc_sa_sut') || state.flags.includes('that_sung_cung_dinh');
    if (!isDeclined && evt.id === 'evt_adult_major_desperate_theft') return false;
  }

  if (state.officialRank > 0 || state.flags.includes('dang_lam_quan')) {
    const OFFICIAL_BLOCKED_CIVILIAN_PREFIXES = [
      'evt_jianghu_',
      'evt_biz_',
      'evt_career_',
      'evt_craft_',
    ];
    const OFFICIAL_BLOCKED_CIVILIAN_IDS = new Set([
      'evt_chain_len_kinh_1',
      'evt_servitude_opportunity',
      'evt_adult_major_desperate_theft',
      'evt_scholar_local_exam_temptation',
      'evt_scholar_road_to_capital',
      'evt_scholar_poor_exam_fail',
      'evt_scholar_rich_backdoor',
      'evt_scholar_poor_copy_books',
      'evt_scholar_poor_mentor',
    ]);
    if (
      OFFICIAL_BLOCKED_CIVILIAN_PREFIXES.some((p) => evt.id.startsWith(p)) ||
      OFFICIAL_BLOCKED_CIVILIAN_IDS.has(evt.id)
    ) {
      return false;
    }
  }

  return true;
}

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
    if (!isEventContextuallyAllowed(state, evt)) return false;
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
