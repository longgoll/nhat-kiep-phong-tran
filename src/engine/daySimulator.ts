import {
  DAYS_PER_SEASON,
  DAYS_PER_YEAR,
  getAgeYears,
  getSeasonFromDays,
  type ActiveLifeState,
  type AnnualFinanceLedger,
  type FallbackRule,
  type HousingTier,
  type LifestyleTier,
  type TimeSlot,
  type WorldState,
} from '../types/activeLife';
import type { ActionDef, EffectSpec, GameEventDef } from '../types/dsl';
import { computeWeight, evaluateConditions } from './conditionEvaluator';
import { calculateRicePrice, formatCopper } from './economy';
import { appendLog, applyEffects } from './effectApplier';
import { pickWeightedIndex } from './prng';
import { resolveEventChoice } from './childhoodEngine';
import { PROPERTY_CATALOG } from './progressionModules';
import {
  applyAnnualGiftEtiquette,
  applySeasonalGoldAndInflation,
  generateAnnualLifeFlavorLogs,
  getDailyFocusModifiers,
  runAnnualAutoActions,
} from './adultLifeActions';

export type AutoPauseReason =
  | 'dead'
  | 'major_event'
  | 'birthday'
  | 'low_health'
  | 'low_happiness'
  | 'no_food';

export interface AutoPauseConfig {
  pauseOnBirthday: boolean;
  pauseOnLowHealth: boolean;
  pauseOnLowHappiness: boolean;
  pauseOnNoFood: boolean;
}

export const DEFAULT_AUTO_PAUSE_CONFIG: AutoPauseConfig = {
  pauseOnBirthday: false,
  pauseOnLowHealth: true,
  pauseOnLowHappiness: false,
  pauseOnNoFood: true,
};

export interface AdvanceDaysResult {
  state: ActiveLifeState;
  daysSimulated: number;
  pausedReason?: AutoPauseReason;
  pendingEvent?: GameEventDef;
}

const LIFESTYLE_TABLE: Record<
  LifestyleTier,
  { rice: number; copper: number; stamina: number; health: number; happiness: number }
> = {
  nhin_doi: { rice: 0, copper: 0, stamina: 0, health: -3.0, happiness: -2.0 },
  chao_loang: { rice: 0.5, copper: 0, stamina: 5, health: -0.5, happiness: -0.5 },
  com_rau: { rice: 1.0, copper: 5, stamina: 15, health: 0.2, happiness: 0 },
  thit_ca: { rice: 1.5, copper: 30, stamina: 30, health: 1.0, happiness: 1.5 },
};

const HOUSING_SLEEP_RECOVERY: Record<
  HousingTier,
  { stamina: number; health: number; happiness: number }
> = {
  gam_cau: { stamina: 35, health: -0.5, happiness: 0 },
  nha_tranh: { stamina: 50, health: 0, happiness: 0 },
  nha_gach: { stamina: 65, health: 0.5, happiness: 0 },
  phu_de: { stamina: 80, health: 1.0, happiness: 0.5 },
};

export function getAgingProfile(ageYears: number): {
  maxStamina: number;
  seasonalHealthDecay: number;
  learningFactor: number;
} {
  if (ageYears <= 30) return { maxStamina: 100, seasonalHealthDecay: 0, learningFactor: 1.0 };
  if (ageYears <= 45) return { maxStamina: 85, seasonalHealthDecay: 0.5, learningFactor: 0.85 };
  if (ageYears <= 55) return { maxStamina: 75, seasonalHealthDecay: 1.5, learningFactor: 0.7 };
  if (ageYears <= 70) return { maxStamina: 60, seasonalHealthDecay: 3.5, learningFactor: 0.5 };
  return { maxStamina: 45, seasonalHealthDecay: 6.0, learningFactor: 0.3 };
}

function checkFallbackRule(state: ActiveLifeState, rule: FallbackRule): boolean {
  let val = 0;
  if (rule.stat === 'health') val = state.stats.health;
  else if (rule.stat === 'happiness') val = state.stats.happiness;
  else if (rule.stat === 'stamina') val = state.stats.stamina;
  else if (rule.stat === 'rice') val = state.assets.rice;
  else if (rule.stat === 'wealthCopper') val = state.assets.wealthCopper;

  return rule.operator === '<' ? val < rule.threshold : val <= rule.threshold;
}

function resolveSlotAction(
  state: ActiveLifeState,
  slot: TimeSlot,
  actionsMap: Map<string, ActionDef>,
): ActionDef | undefined {
  let actionId = state.schedule[slot];

  // Check fallback rules in priority order
  for (const rule of state.schedule.fallbackRules) {
    if (rule.targetSlot === slot && checkFallbackRule(state, rule)) {
      const fb = actionsMap.get(rule.fallbackActionId);
      if (fb && fb.allowedSlots.includes(slot) && canExecuteAction(state, fb)) {
        actionId = fb.id;
        break;
      }
    }
  }

  // Forced servitude override if flagged
  if (
    state.flags.includes('bi_ep_lam_gia_no') &&
    (slot === 'morning' || slot === 'afternoon')
  ) {
    const serv = actionsMap.get('act_lam_gia_no');
    if (serv && canExecuteAction(state, serv)) return serv;
  }

  const chosen = actionsMap.get(actionId);
  if (chosen && canExecuteAction(state, chosen)) {
    return chosen;
  }

  // Safe default fallback
  return actionsMap.get(slot === 'night' ? 'act_ngu' : 'act_nghi_ngoi');
}

export function canExecuteAction(state: ActiveLifeState, action: ActionDef): boolean {
  if (!evaluateConditions(state, action.conditions)) return false;
  if (action.costs.stamina && state.stats.stamina < action.costs.stamina) return false;
  if (action.costs.copper && state.assets.wealthCopper < action.costs.copper) return false;
  if (action.costs.rice && state.assets.rice < action.costs.rice) return false;
  return true;
}

function scaleActionRewards(state: ActiveLifeState, rewards: EffectSpec): EffectSpec {
  const age = getAgeYears(state.profile.totalDays);
  const { learningFactor } = getAgingProfile(age);

  let workEfficiency = 1.0;
  if (state.stats.happiness < 20) workEfficiency *= 0.7; // -30% despair penalty
  if (state.stats.health < 20) workEfficiency *= 0.75; // -25% illness penalty

  const tradeMult = 1 + state.stats.craftTrade * 0.015;
  const focusMod = getDailyFocusModifiers(state.schedule.lifeFocus);
  const scaled: EffectSpec = { ...rewards };

  if (scaled.education !== undefined && scaled.education > 0) {
    scaled.education = Number(
      (scaled.education * workEfficiency * learningFactor * focusMod.studyMartialMult).toFixed(2),
    );
  }
  if (scaled.martial !== undefined && scaled.martial > 0) {
    scaled.martial = Number(
      (scaled.martial * workEfficiency * learningFactor * focusMod.studyMartialMult).toFixed(2),
    );
  }
  if (scaled.copper !== undefined && scaled.copper > 0) {
    scaled.copper = Math.round(scaled.copper * workEfficiency * tradeMult * focusMod.copperMult);
  }
  if (scaled.rice !== undefined && scaled.rice > 0) {
    scaled.rice = Number((scaled.rice * workEfficiency).toFixed(2));
  }

  return scaled;
}

function emptyLedger(): AnnualFinanceLedger {
  return {
    workIncomeCopper: 0,
    propertyIncomeCopper: 0,
    livingExpenseCopper: 0,
    otherExpenseCopper: 0,
  };
}

function addLedger(
  state: ActiveLifeState,
  patch: Partial<AnnualFinanceLedger>,
): ActiveLifeState {
  const curr = state.finance?.currentYear ?? emptyLedger();
  return {
    ...state,
    finance: {
      ...state.finance,
      currentYear: {
        workIncomeCopper: curr.workIncomeCopper + (patch.workIncomeCopper ?? 0),
        propertyIncomeCopper: curr.propertyIncomeCopper + (patch.propertyIncomeCopper ?? 0),
        livingExpenseCopper: curr.livingExpenseCopper + (patch.livingExpenseCopper ?? 0),
        otherExpenseCopper: curr.otherExpenseCopper + (patch.otherExpenseCopper ?? 0),
      },
    },
  };
}

function applyDailyLifestyle(inputState: ActiveLifeState): ActiveLifeState {
  const order: LifestyleTier[] = ['thit_ca', 'com_rau', 'chao_loang', 'nhin_doi'];
  const startIdx = order.indexOf(inputState.schedule.lifestyle);
  let state = inputState;

  for (let i = startIdx; i < order.length; i += 1) {
    const tier = order[i];
    const spec = LIFESTYLE_TABLE[tier];

    let neededCopper = spec.copper;
    let riceToDeduct = spec.rice;

    if (state.assets.rice < spec.rice) {
      if (state.schedule.autoBuyRice) {
        const deficitRice = spec.rice - state.assets.rice;
        const buyCost = Math.ceil(deficitRice * state.world.ricePriceInCopper);
        if (state.assets.wealthCopper >= neededCopper + buyCost) {
          neededCopper += buyCost;
          riceToDeduct = state.assets.rice;
        } else {
          continue;
        }
      } else {
        continue;
      }
    }

    if (state.assets.wealthCopper < neededCopper) {
      continue;
    }

    state = applyEffects(state, {
      rice: -riceToDeduct,
      copper: -neededCopper,
      stamina: spec.stamina,
      health: spec.health,
      happiness: spec.happiness,
    });
    if (neededCopper > 0) {
      state = addLedger(state, { livingExpenseCopper: neededCopper });
    }

    if (tier !== inputState.schedule.lifestyle && i === order.length - 1) {
      state = {
        ...state,
        logs: appendLog(
          state.logs,
          state.profile.totalDays,
          'warning',
          'Hết lương thực và tiền bạc, bạn buộc phải nhịn đói qua ngày!',
        ),
      };
    }

    return state;
  }

  return state;
}

function rollWorldStateOnNewSeason(state: ActiveLifeState): ActiveLifeState {
  const weights: Array<{ ws: WorldState; w: number }> = [
    { ws: 'binh_on', w: 68 },
    { ws: 'mat_mua', w: 14 },
    { ws: 'dich_benh', w: 10 },
    { ws: 'chien_tranh', w: 8 },
  ];
  const pick = pickWeightedIndex(
    state.prngState,
    weights.map((x) => x.w),
  );
  const nextWorldState = weights[pick.index].ws;
  const nextPrice = calculateRicePrice(state.world.season, nextWorldState);

  return {
    ...state,
    prngState: pick.nextState,
    world: {
      ...state.world,
      worldState: nextWorldState,
      ricePriceInCopper: nextPrice,
    },
  };
}

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
  let lastMajorRollDay = -999;

  // Track initial warning states so auto-pause only fires on newly entering a critical state
  // (prevents trapping the player in a 1-day infinite pause loop when they click Continue).
  let wasLowHealth = state.stats.health < 20;
  let wasLowHappiness = state.stats.happiness < 20;
  let wasNoFood =
    state.assets.rice <= 0 && state.assets.wealthCopper < state.world.ricePriceInCopper;

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

    if (isNewSeason) {
      state = rollWorldStateOnNewSeason(state);
      state = applySeasonalGoldAndInflation(state);
      if (aging.seasonalHealthDecay > 0) {
        state = applyEffects(state, { health: -aging.seasonalHealthDecay });
      }
      // Passive income from owned properties
      if (state.assets.properties.length > 0) {
        let seasonalGain = 0;
        for (const propId of state.assets.properties) {
          const spec = PROPERTY_CATALOG.find((p) => p.id === propId);
          if (spec) seasonalGain += spec.seasonalIncomeCopper;
        }
        if (seasonalGain > 0) {
          const tradeBonus = 1 + state.stats.craftTrade * 0.01;
          const finalGain = Math.round(seasonalGain * tradeBonus);
          state = applyEffects(state, { copper: finalGain });
          state = addLedger(state, { propertyIncomeCopper: finalGain });
          state = {
            ...state,
            logs: appendLog(
              state.logs,
              nextTotalDays,
              'survival',
              `Thu hoạch điền sản & cửa hiệu đầu mùa: +${finalGain} đồng.`,
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
          return { state, daysSimulated, pausedReason: 'major_event', pendingEvent: expEvent };
        }
      }
    }

    // 1. Check delayed events due today
    const dueEvents = state.delayedEvents.filter((item) => item.triggerDay <= nextTotalDays);
    if (dueEvents.length > 0) {
      const remaining = state.delayedEvents.filter((item) => item.triggerDay > nextTotalDays);
      state = { ...state, delayedEvents: remaining };

      const target = eventsPool.find((e) => e.id === dueEvents[0].eventId);
      if (target) {
        daysSimulated += 1;
        if (target.severity === 'major') {
          return { state, daysSimulated, pausedReason: 'major_event', pendingEvent: target };
        }
        state = resolveEventChoice(state, target, 0).state;
      }
    }

    // 2. Execute 4 TimeSlots
    const slots: TimeSlot[] = ['morning', 'afternoon', 'evening', 'night'];
    for (const slot of slots) {
      const action = resolveSlotAction(state, slot, actionsMap);
      if (action) {
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

        const scaledRewards = scaleActionRewards(state, action.rewards);
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

    // 3. Daily lifestyle consumption & LifeFocus passive tick
    state = applyDailyLifestyle(state);
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

    // 4. Roll random adulthood event (pacing cap: major event at most once per 7 days)
    const canRollMajor = nextTotalDays - lastMajorRollDay >= 7;
    const eligibleEvents = eventsPool.filter((evt) => {
      if (evt.stage !== 'adulthood' && evt.stage !== 'any') return false;
      if (evt.cooldownDays === 0) return false; // delayed-only events
      if (evt.oncePerLife && state.eventCooldowns[evt.id] !== undefined) return false;
      if (evt.severity === 'major' && !canRollMajor) return false;
      const last = state.eventCooldowns[evt.id] ?? -99999;
      if (nextTotalDays - last < evt.cooldownDays) return false;
      return evaluateConditions(state, evt.conditions);
    });

    if (eligibleEvents.length > 0) {
      // ~7% chance per day to trigger an eligible event when pool is non-empty
      const triggerRoll = pickWeightedIndex(state.prngState, [7, 93]);
      state = { ...state, prngState: triggerRoll.nextState };

      if (triggerRoll.index === 0) {
        const weights = eligibleEvents.map((e) => computeWeight(state, e.weight));
        const sumW = weights.reduce((a, b) => a + b, 0);
        if (sumW > 0) {
          const pick = pickWeightedIndex(state.prngState, weights);
          state = { ...state, prngState: pick.nextState };
          const picked = eligibleEvents[pick.index];

          state = {
            ...state,
            eventCooldowns: { ...state.eventCooldowns, [picked.id]: nextTotalDays },
          };

          if (picked.severity === 'major') {
            lastMajorRollDay = nextTotalDays;
            return { state, daysSimulated, pausedReason: 'major_event', pendingEvent: picked };
          }
          state = resolveEventChoice(state, picked, 0).state;
        }
      }
    }

    // Annual birthday flavor logs, gift etiquette, auto-actions & hobby progression
    if (isBirthday) {
      const copperBeforeAnnual = state.assets.wealthCopper;
      state = applyAnnualGiftEtiquette(state);
      state = runAnnualAutoActions(state);
      const annualSpent = Math.max(0, copperBeforeAnnual - state.assets.wealthCopper);
      if (annualSpent > 0) {
        state = addLedger(state, { otherExpenseCopper: annualSpent });
      }
      state = generateAnnualLifeFlavorLogs(state);
      const prevYear = Math.max(0, newAge - 1);
      const roundedHappiness = Math.round(state.stats.happiness);
      const netWorthNow =
        state.assets.wealthCopper +
        (state.assets.goldReserveCopper ?? 0) +
        Math.round(state.assets.rice * state.world.ricePriceInCopper);
      const completedLedger = state.finance?.currentYear ?? emptyLedger();
      state = {
        ...state,
        finance: {
          currentYear: emptyLedger(),
          lastYear: completedLedger,
          lastYearNetWorthCopper: netWorthNow,
        },
        yearlyHappiness: {
          ...(state.yearlyHappiness ?? {}),
          [prevYear]: state.yearlyHappiness?.[prevYear] ?? roundedHappiness,
          [newAge]: roundedHappiness,
        },
        logs: appendLog(
          state.logs,
          nextTotalDays,
          'survival',
          `Tổng kết tuổi ${prevYear}: ${state.profile.currentRole} • Sức khỏe ${Math.round(state.stats.health)}%, Hạnh phúc ${roundedHappiness}%, Tài sản ${formatCopper(state.assets.wealthCopper)}.`,
        ),
      };
    }

    // 5. Auto-Pause checks
    if (isBirthday && autoPause.pauseOnBirthday) {
      state = {
        ...state,
        logs: appendLog(state.logs, nextTotalDays, 'survival', `Chúc mừng bạn bước sang tuổi ${newAge}.`),
      };
      return { state, daysSimulated, pausedReason: 'birthday' };
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

    const isNoFoodNow =
      state.assets.rice <= 0 && state.assets.wealthCopper < state.world.ricePriceInCopper;
    if (autoPause.pauseOnNoFood && isNoFoodNow && !wasNoFood) {
      return { state, daysSimulated, pausedReason: 'no_food' };
    }
    wasNoFood = isNoFoodNow;
  }

  return { state, daysSimulated };
}

export function getSeasonLabel(season: ActiveLifeState['world']['season']): string {
  switch (season) {
    case 'spring':
      return 'Mùa Xuân';
    case 'summer':
      return 'Mùa Hạ';
    case 'autumn':
      return 'Mùa Thu';
    case 'winter':
      return 'Mùa Đông';
  }
}

export function getWorldStateLabel(ws: WorldState): string {
  switch (ws) {
    case 'binh_on':
      return 'Thái bình ổn định';
    case 'mat_mua':
      return 'Mất mùa đói kém';
    case 'chien_tranh':
      return 'Chiến tranh loạn lạc';
    case 'dich_benh':
      return 'Dịch bệnh hoành hành';
  }
}

export function getDayInSeason(totalDays: number): number {
  return (totalDays % DAYS_PER_SEASON) + 1;
}

export function getYearCount(totalDays: number): number {
  return Math.floor(totalDays / DAYS_PER_YEAR);
}
