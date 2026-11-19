import {
  getAgeYears,
  getSeasonFromDays,
  type ActiveLifeState,
  type TimeSlot,
} from '../../types/activeLife';
import type { ActionDef, EffectSpec, GameEventDef } from '../../types/dsl';
import { evaluateConditions } from '../conditionEvaluator';
import { recordDailyCareerProgress } from '../careerSystem';
import { appendLog, applyEffects } from '../effectApplier';
import { pickWeightedIndex } from '../prng';
import { hasActiveLivelihood } from '../lifeStatus';
import { buildDynamicDecisionById } from '../decisionGenerator';
import { isEventContextuallyAllowed, planYear } from '../yearPlanner';
import { resolveEventChoice } from '../childhoodEngine';
import { getPropertySeasonalIncome, getPropertySeasonalSocial, PROPERTY_CATALOG } from '../progressionModules';
import {
  applySeasonalGoldAndInflation,
  ensureValidLifeFocus,
  processRentalExpirations,
  getDailyFocusModifiers,
} from '../adultLifeActions';
import {
  DEFAULT_AUTO_PAUSE_CONFIG,
  HOUSING_SLEEP_RECOVERY,
  getAgingProfile,
  getWorldStateLabel,
  type AdvanceDaysResult,
  type AutoPauseConfig,
} from './configAndHelpers';
import {
  addLedger,
  applyDailyLifestyle,
  getFamilyCoveredLifestyleTier,
  resolveSlotAction,
  rollWorldStateOnNewSeason,
  scaleActionRewards,
} from './dailyEconomy';
import { processAnnualBirthdayTick, processMonthlyTick } from './periodicTicks';

export function advanceDays(
  inputState: ActiveLifeState,
  daysToRun: number,
  actionsList: ActionDef[],
  eventsPool: GameEventDef[],
  autoPause: AutoPauseConfig = DEFAULT_AUTO_PAUSE_CONFIG,
): AdvanceDaysResult {
  const actionsMap = new Map(actionsList.map((a) => [a.id, a]));
  let state = inputState;
  let daysSimulated = 0;

  // Track initial warning states so auto-pause only fires on newly entering a critical state
  // (prevents trapping the player in a 1-day infinite pause loop when they click Continue).
  let wasLowHealth = state.stats.health < 20;
  let wasLowHappiness = state.stats.happiness < 20;
  let wasNoFood =
    getFamilyCoveredLifestyleTier(state) === null &&
    state.assets.rice <= 0 &&
    state.assets.wealthCopper < state.world.ricePriceInCopper;

  for (let d = 0; d < daysToRun; d += 1) {
    if (!state.isAlive) {
      return { state, daysSimulated, pausedReason: 'dead' };
    }

    const nextTotalDays = state.profile.totalDays + 1;
    const prevAge = getAgeYears(state.profile.totalDays);
    const newAge = getAgeYears(nextTotalDays);
    const newSeason = getSeasonFromDays(nextTotalDays);
    const isNewSeason = newSeason !== state.world.season;
    const isBirthday = newAge > prevAge;

    const aging = getAgingProfile(newAge);

    state = {
      ...state,
      profile: {
        ...state.profile,
        totalDays: nextTotalDays,
      },
      stats: {
        ...state.stats,
        maxStamina: aging.maxStamina,
        stamina: Math.min(state.stats.stamina, aging.maxStamina),
      },
      world: {
        ...state.world,
        season: newSeason,
        yearInEra: isBirthday ? state.world.yearInEra + 1 : state.world.yearInEra,
      },
    };

    state = processRentalExpirations(state);

    if (isNewSeason) {
      state = rollWorldStateOnNewSeason(state);
      state = applySeasonalGoldAndInflation(state);
      if (aging.seasonalHealthDecay > 0) {
        state = applyEffects(state, { health: -aging.seasonalHealthDecay });
      }
      // Passive income & social prestige from owned properties (fluctuates with world state & craftTrade)
      if (state.assets.properties.length > 0) {
        let seasonalGain = 0;
        let seasonalFame = 0;
        let seasonalRelationships = 0;
        for (const propId of state.assets.properties) {
          const spec = PROPERTY_CATALOG.find((p) => p.id === propId);
          if (spec) {
            const rawIncome = getPropertySeasonalIncome(spec, state.world.worldState, state.stats.craftTrade);
            const isProxy = state.official?.proxyBusinessIds.includes(propId) ?? false;
            seasonalGain += isProxy ? Math.round(rawIncome * 0.7) : rawIncome;
            const social = getPropertySeasonalSocial(spec);
            seasonalFame += social.fame;
            seasonalRelationships += social.relationships;
          }
        }
        if (seasonalGain > 0 || seasonalFame > 0 || seasonalRelationships > 0) {
          state = applyEffects(state, {
            copper: seasonalGain,
            fame: seasonalFame > 0 ? Math.round(seasonalFame * 10) / 10 : undefined,
            relationships: seasonalRelationships > 0 ? Math.round(seasonalRelationships * 10) / 10 : undefined,
          });
          if (seasonalGain > 0) {
            state = addLedger(state, { propertyIncomeCopper: seasonalGain });
          }
          const extras: string[] = [];
          if (seasonalGain > 0) extras.push(`+${seasonalGain} đồng`);
          if (seasonalFame > 0) extras.push(`Thanh danh +${Math.round(seasonalFame * 10) / 10}`);
          if (seasonalRelationships > 0) extras.push(`Quan hệ +${Math.round(seasonalRelationships * 10) / 10}`);
          state = {
            ...state,
            logs: appendLog(
              state.logs,
              nextTotalDays,
              'survival',
              `Thu hoạch điền sản & sản nghiệp đầu mùa (${getWorldStateLabel(state.world.worldState)}): ${extras.join(' · ')}.`,
            ),
          };
        }
      }
    }

    // Annual exposureRisk increase for Female Cross-Dressing (nu_cai_nam_trang)
    if (isBirthday && state.flags.includes('nu_cai_nam_trang')) {
      const bump = state.officialRank > 0 ? 5 : 1;
      const nextRisk = Math.min(100, state.exposureRisk + bump);
      state = { ...state, exposureRisk: nextRisk };
      const expRoll = pickWeightedIndex(state.prngState, [nextRisk, 100 - nextRisk]);
      state = { ...state, prngState: expRoll.nextState };
      if (expRoll.index === 0) {
        const expEvent = eventsPool.find((e) => e.id === 'evt_nu_cai_nam_trang_exposed');
        if (expEvent) {
          daysSimulated += 1;
          state = { ...state, lastMajorEventDay: nextTotalDays };
          return { state, daysSimulated, pausedReason: 'major_event', pendingEvent: expEvent };
        }
      }
    }

    // 1. Check delayed events due today (pop one at a time so concurrent delayed events are not dropped)
    while (true) {
      const dueIdx = state.delayedEvents.findIndex((item) => item.triggerDay <= nextTotalDays);
      if (dueIdx === -1) break;
      const dueItem = state.delayedEvents[dueIdx];
      const remaining = state.delayedEvents.filter((_, idx) => idx !== dueIdx);
      state = { ...state, delayedEvents: remaining };

      const target = eventsPool.find((e) => e.id === dueItem.eventId);
      if (target && isEventContextuallyAllowed(state, target) && evaluateConditions(state, target.conditions)) {
        state = {
          ...state,
          eventCooldowns: { ...state.eventCooldowns, [target.id]: nextTotalDays },
        };
        if (target.severity === 'major') {
          daysSimulated += 1;
          state = { ...state, lastMajorEventDay: nextTotalDays };
          return { state, daysSimulated, pausedReason: 'major_event', pendingEvent: target };
        }
        state = resolveEventChoice(state, target, 0).state;
      }
    }

    // 2. Execute 4 TimeSlots
    const slots: TimeSlot[] = ['morning', 'afternoon', 'evening', 'night'];
    const executedActionIds: string[] = [];
    for (const slot of slots) {
      const action = resolveSlotAction(state, slot, actionsMap);
      if (action) {
        executedActionIds.push(action.id);
        if (action.costs) {
          const negCosts: EffectSpec = {};
          if (action.costs.stamina) negCosts.stamina = -action.costs.stamina;
          if (action.costs.copper) {
            negCosts.copper = -action.costs.copper;
            state = addLedger(state, { otherExpenseCopper: action.costs.copper });
          }
          if (action.costs.rice) negCosts.rice = -action.costs.rice;
          if (action.costs.health) negCosts.health = -action.costs.health;
          if (action.costs.happiness) negCosts.happiness = -action.costs.happiness;
          state = applyEffects(state, negCosts);
        }

        const scaledRewards = scaleActionRewards(state, action.rewards, action.category, action.id);
        state = applyEffects(state, scaledRewards);
        if (scaledRewards.copper && scaledRewards.copper > 0) {
          state = addLedger(state, { workIncomeCopper: scaledRewards.copper });
        }

        if (slot === 'night' && action.id === 'act_ngu') {
          const sleep = HOUSING_SLEEP_RECOVERY[state.assets.housing];
          state = applyEffects(state, {
            stamina: sleep.stamina,
            health: sleep.health,
            happiness: sleep.happiness,
          });
        }
      }
      if (!state.isAlive) break;
    }

    if (!state.isAlive) {
      daysSimulated += 1;
      return { state, daysSimulated, pausedReason: 'dead' };
    }

    state = recordDailyCareerProgress(state, executedActionIds);

    // 3. Daily lifestyle consumption & LifeFocus passive tick
    state = applyDailyLifestyle(state);
    state = ensureValidLifeFocus(state);
    const activeFocusKey = state.schedule.lifeFocus || 'can_bang';
    state = {
      ...state,
      focusTime: {
        ...(state.focusTime ?? {}),
        [activeFocusKey]: ((state.focusTime ?? {})[activeFocusKey] ?? 0) + 1,
      },
    };
    if (nextTotalDays % 30 === 0) {
      state = processMonthlyTick(state, nextTotalDays, newAge);
    }
    const focusMod = getDailyFocusModifiers(state.schedule.lifeFocus);
    if (
      Object.keys(focusMod.dailyEffects).length > 0 ||
      (focusMod.dailyCopperCost > 0 && state.assets.wealthCopper >= focusMod.dailyCopperCost)
    ) {
      state = applyEffects(state, {
        ...focusMod.dailyEffects,
        copper:
          focusMod.dailyCopperCost > 0 && state.assets.wealthCopper >= focusMod.dailyCopperCost
            ? -focusMod.dailyCopperCost
            : 0,
      });
    }
    daysSimulated += 1;

    if (!state.isAlive) {
      return { state, daysSimulated, pausedReason: 'dead' };
    }

    // Graduate from Quốc Tử Giám / Academy at age 22 (run before planYear & major event early returns)
    if (newAge >= 22 && state.isStudent) {
      const graduatedHasLivelihood = hasActiveLivelihood(state);
      const isStudentRole =
        state.profile.currentRole === 'Giám sinh Quốc Tử Giám' ||
        state.profile.currentRole === 'Học trò Thư viện lớn' ||
        state.profile.currentRole === 'Võ sinh Võ học đường';
      state = {
        ...state,
        isStudent: false,
        livelihoodStatus: graduatedHasLivelihood ? 'employed' : 'seeking',
        profile: {
          ...state.profile,
          currentRole:
            !graduatedHasLivelihood && state.officialRank === 0 && isStudentRole
              ? 'Đã tốt nghiệp'
              : state.profile.currentRole,
        },
        logs: appendLog(
          state.logs,
          nextTotalDays,
          'study',
          `Bạn đã hoàn thành chương trình học ở tuổi ${newAge}, chính thức bước vào đời lập nghiệp.`,
          { tone: 'positive' },
        ),
      };
    }

    // 4. 1in8b Annual Event & Decision Scheduler (`planYear` + `scheduledDecisions`)
    if (newAge >= 13 && state.yearPlan?.yearAge !== newAge) {
      state = planYear(state, eventsPool);
    }

    // Immediate player-requested decisions (job hunt / business startup via Chi tiêu · đầu tư)
    if (state.flags.includes('cho_tim_viec_moi')) {
      const immediateJob = buildDynamicDecisionById(state, 'dec_job_offers');
      if (immediateJob) {
        state = { ...state, lastMajorEventDay: nextTotalDays };
        return { state, daysSimulated, pausedReason: 'major_event', pendingEvent: immediateJob };
      }
    }
    if (state.flags.includes('cho_khoi_nghiep')) {
      const immediateBiz = buildDynamicDecisionById(state, 'dec_biz_offers');
      if (immediateBiz) {
        state = { ...state, lastMajorEventDay: nextTotalDays };
        return { state, daysSimulated, pausedReason: 'major_event', pendingEvent: immediateBiz };
      }
    }

    // Seasonal/contextual Khoa cử prompt when eligible and not yet prompted this year
    const examPrompt = buildDynamicDecisionById(state, 'dec_exam_prompt');
    if (examPrompt) {
      state = { ...state, lastMajorEventDay: nextTotalDays };
      return { state, daysSimulated, pausedReason: 'major_event', pendingEvent: examPrompt };
    }

    // Due scheduled decision from this year's planYear
    if (state.yearPlan && state.yearPlan.scheduledDecisions.length > 0) {
      const dueIdx = state.yearPlan.scheduledDecisions.findIndex(
        (slot) => slot.status === 'pending' && slot.triggerDay <= nextTotalDays,
      );
      if (dueIdx !== -1) {
        const slot = state.yearPlan.scheduledDecisions[dueIdx];
        const dynDecision = buildDynamicDecisionById(state, slot.decisionId);
        const updatedSlots = state.yearPlan.scheduledDecisions.map((s, idx) =>
          idx === dueIdx ? { ...s, status: dynDecision ? ('triggered' as const) : ('skipped' as const) } : s,
        );
        state = {
          ...state,
          yearPlan: { ...state.yearPlan, scheduledDecisions: updatedSlots },
        };
        if (dynDecision) {
          state = { ...state, lastMajorEventDay: nextTotalDays };
          return { state, daysSimulated, pausedReason: 'major_event', pendingEvent: dynDecision };
        }
      }
    }

    if (isBirthday) {
      const annualRes = processAnnualBirthdayTick(state, nextTotalDays, newAge);
      state = annualRes.state;
      if (annualRes.diedOfOldAge) {
        return { state, daysSimulated, pausedReason: 'dead' };
      }
    }

    // 5. Auto-Pause checks
    if (isBirthday && autoPause.pauseOnBirthday) {
      state = {
        ...state,
        logs: appendLog(state.logs, nextTotalDays, 'survival', `Chúc mừng bạn bước sang tuổi ${newAge}.`),
      };
      return { state, daysSimulated, pausedReason: 'birthday' };
    }

    if (isBirthday && newAge >= 13 && state.yearPlan?.yearAge !== newAge) {
      state = planYear(state, eventsPool);
    }

    const isLowHealthNow = state.stats.health < 20;
    if (autoPause.pauseOnLowHealth && isLowHealthNow && !wasLowHealth) {
      return { state, daysSimulated, pausedReason: 'low_health' };
    }
    wasLowHealth = isLowHealthNow;

    const isLowHappinessNow = state.stats.happiness < 20;
    if (autoPause.pauseOnLowHappiness && isLowHappinessNow && !wasLowHappiness) {
      return { state, daysSimulated, pausedReason: 'low_happiness' };
    }
    wasLowHappiness = isLowHappinessNow;

    const isFamilySupported = getFamilyCoveredLifestyleTier(state) !== null;
    const isNoFoodNow =
      !isFamilySupported &&
      state.assets.rice <= 0 &&
      state.assets.wealthCopper < state.world.ricePriceInCopper;
    if (autoPause.pauseOnNoFood && isNoFoodNow && !wasNoFood) {
      return { state, daysSimulated, pausedReason: 'no_food' };
    }
    if (isNoFoodNow) {
      wasNoFood = true;
    } else if (
      isFamilySupported ||
      state.assets.rice >= 3 ||
      state.assets.wealthCopper >= state.world.ricePriceInCopper * 3
    ) {
      // Only re-arm no_food pause after a real recovery (prevents 2-day loop with act_survival_mot_lua)
      wasNoFood = false;
    }
  }

  return { state, daysSimulated };
}

