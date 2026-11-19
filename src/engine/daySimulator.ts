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
import { evaluateConditions } from './conditionEvaluator';
import { getCareerIncomeMultiplier, recordDailyCareerProgress } from './careerSystem';
import { calculateRicePrice, formatCopper } from './economy';
import { appendLog, applyAnnualStatMeanReversion, applyEffects } from './effectApplier';
import { mulberry32Next, pickWeightedIndex } from './prng';
import { getCurrentLivelihoodLabel, hasActiveLivelihood } from './lifeStatus';
import { buildDynamicDecisionById } from './decisionGenerator';
import { isEventContextuallyAllowed, planYear } from './yearPlanner';
import { resolveEventChoice } from './childhoodEngine';
import { getPropertySeasonalIncome, getPropertySeasonalSocial, PROPERTY_CATALOG } from './progressionModules';
import {
  applyAnnualGiftEtiquette,
  applySeasonalGoldAndInflation,
  ensureValidLifeFocus,
  generateAnnualLifeFlavorLogs,
  getCreditLimitCopper,
  processRentalExpirations,
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
  { rice: number; copper: number; stamina: number; health: number; happiness: number; fame?: number }
> = {
  nhin_doi: { rice: 0, copper: 0, stamina: 0, health: -1.8, happiness: -1.2 },
  chao_loang: { rice: 0.5, copper: 0, stamina: 5, health: -0.04, happiness: -0.05 },
  com_rau: { rice: 1.0, copper: 5, stamina: 15, health: 0, happiness: 0 },
  thit_ca: { rice: 1.5, copper: 30, stamina: 30, health: 0.015, happiness: 0.012 },
  son_hao: { rice: 2.0, copper: 120, stamina: 40, health: 0.025, happiness: 0.02, fame: 0.015 },
};

const HOUSING_DAILY_UPKEEP: Record<HousingTier, number> = {
  gam_cau: 0,
  nha_tranh: 2,
  nha_gach: 8,
  phu_de: 25,
};

const WORLD_LIVING_COST_MULT: Record<ActiveLifeState['world']['worldState'], number> = {
  binh_on: 1.0,
  dich_benh: 1.2,
  mat_mua: 1.35,
  chien_tranh: 1.5,
};

const HOUSING_SLEEP_RECOVERY: Record<
  HousingTier,
  { stamina: number; health: number; happiness: number }
> = {
  gam_cau: { stamina: 35, health: -0.08, happiness: -0.04 },
  nha_tranh: { stamina: 50, health: 0, happiness: 0 },
  nha_gach: { stamina: 65, health: 0.01, happiness: 0.003 },
  phu_de: { stamina: 80, health: 0.02, happiness: 0.008 },
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
  if (action.costs.copper && state.assets.wealthCopper < action.costs.copper) return false;
  if (action.costs.rice && state.assets.rice < action.costs.rice) return false;
  return true;
}

function scaleActionRewards(
  state: ActiveLifeState,
  rewards: EffectSpec,
  category?: ActionDef['category'],
  actionId?: string,
): EffectSpec {
  const age = getAgeYears(state.profile.totalDays);
  const { learningFactor } = getAgingProfile(age);

  let workEfficiency = 1.0;
  if (state.stats.happiness < 20) workEfficiency *= 0.7; // -30% despair penalty
  if (state.stats.health < 20) workEfficiency *= 0.75; // -25% illness penalty

  // craftTrade (0-100) boosts trade actions up to 2.0x; worldState dampens trade in war/plague
  let tradeMult = 1.0;
  if (category === 'trade') {
    const worldTradeMult =
      state.world.worldState === 'chien_tranh'
        ? 0.75
        : state.world.worldState === 'dich_benh'
          ? 0.85
          : 1.0;
    tradeMult = (1 + Math.min(100, state.stats.craftTrade) * 0.01) * worldTradeMult;
  } else if (category === 'official') {
    tradeMult = 1 + Math.max(0, state.officialRank - 1) * 0.25;
  }

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
    const careerMult = actionId ? getCareerIncomeMultiplier(state, actionId) : 1.0;
    scaled.copper = Math.round(scaled.copper * workEfficiency * tradeMult * focusMod.copperMult * careerMult);
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

const LIFESTYLE_ORDER: LifestyleTier[] = ['son_hao', 'thit_ca', 'com_rau', 'chao_loang', 'nhin_doi'];

function canReceiveFamilySupport(state: ActiveLifeState): boolean {
  if (!state.family) return false;
  if (state.flags.includes('da_ra_o_rieng')) return false;
  if (state.flags.includes('gia_toc_sa_sut') || state.flags.includes('that_sung_cung_dinh')) {
    return false;
  }
  return state.npcs.some((n) => n.relation === 'parent' && n.isAlive);
}

/**
 * Determines the highest lifestyle tier covered by the family household
 * while the character is still living at home (not moved out, not declined).
 */
export function getFamilyCoveredLifestyleTier(state: ActiveLifeState): LifestyleTier | null {
  if (!state.family) return null;

  const { originClass } = state.profile;
  // Hoàng thân thất thế ở Lãnh cung vẫn được cấp cơm rau tối thiểu và miễn phí bảo trì cung thất trước khi khai phủ riêng
  if (
    originClass === 'hoang_toc' &&
    state.flags.includes('that_sung_cung_dinh') &&
    !state.flags.includes('da_ra_o_rieng') &&
    !state.flags.includes('da_khai_phu_hoang_toc') &&
    state.npcs.some((n) => n.relation === 'parent' && n.isAlive)
  ) {
    return 'com_rau';
  }

  if (!canReceiveFamilySupport(state)) return null;

  const familyWealth = state.family.familyWealthCopper;

  if (originClass === 'ban_nong') {
    const ageYears = getAgeYears(state.profile.totalDays);
    return ageYears < 18 ? 'chao_loang' : null;
  }
  if (originClass === 'thu_cong') {
    if (familyWealth >= 300) return 'com_rau';
    return getAgeYears(state.profile.totalDays) < 18 ? 'chao_loang' : null;
  }
  if (originClass === 'dia_chu') {
    return familyWealth >= 3000 ? 'thit_ca' : 'com_rau';
  }
  if (originClass === 'quan_lai') {
    return familyWealth >= 5000 ? 'thit_ca' : 'com_rau';
  }
  // hoang_toc
  return 'thit_ca';
}

function applyMonthlyFamilyAllowance(state: ActiveLifeState, ageYears: number): ActiveLifeState {
  if (ageYears < 13 || ageYears > 20) return state;
  // Chỉ chu cấp tiền tiêu vặt khi đang thực sự đi học; người không danh phận/chức vụ/việc làm chỉ được bao cơm áo tại nhà.
  if (!state.isStudent) return state;
  if (!canReceiveFamilySupport(state) || !state.family) return state;

  const { originClass } = state.profile;
  const familyWealth = state.family.familyWealthCopper;
  let baseAllowance = 0;

  if (originClass === 'thu_cong') {
    baseAllowance = Math.min(40, Math.round(familyWealth * 0.01));
  } else if (originClass === 'dia_chu') {
    baseAllowance = Math.min(120, Math.round(familyWealth * 0.01));
  } else if (originClass === 'quan_lai') {
    baseAllowance = Math.min(200, Math.round(familyWealth * 0.01));
  } else if (originClass === 'hoang_toc') {
    baseAllowance = Math.min(300, Math.round(familyWealth * 0.008));
  }

  if (baseAllowance <= 0) return state;
  const ageScale = ageYears <= 17 ? 1 : 0.5;
  const allowance = Math.round(baseAllowance * ageScale);
  if (allowance <= 0 || familyWealth < allowance * 2) return state;

  const nextState = applyEffects(state, { copper: allowance });
  return {
    ...addLedger(nextState, { propertyIncomeCopper: allowance }),
    family: {
      ...nextState.family!,
      familyWealthCopper: Math.max(0, familyWealth - allowance),
    },
  };
}

export function getDailyFixedExpenseSummary(state: ActiveLifeState): {
  foodCopper: number;
  ricePerDay: number;
  housingCopper: number;
  totalCopper: number;
  isFamilyCovered: boolean;
} {
  const tier = state.schedule.lifestyle;
  const spec = LIFESTYLE_TABLE[tier];
  const familyCoveredTier = getFamilyCoveredLifestyleTier(state);
  const familyCoveredIdx = familyCoveredTier ? LIFESTYLE_ORDER.indexOf(familyCoveredTier) : -1;
  const tierIdx = LIFESTYLE_ORDER.indexOf(tier);
  const isFamilyCovered = familyCoveredIdx !== -1 && tierIdx >= familyCoveredIdx;

  const worldMult = WORLD_LIVING_COST_MULT[state.world.worldState] ?? 1.0;
  const foodCopper = isFamilyCovered ? 0 : Math.round(spec.copper * worldMult);
  const ricePerDay = isFamilyCovered ? 0 : spec.rice;
  const housingCopper = familyCoveredIdx === -1 ? (HOUSING_DAILY_UPKEEP[state.assets.housing] ?? 0) : 0;

  return {
    foodCopper,
    ricePerDay,
    housingCopper,
    totalCopper: foodCopper + housingCopper,
    isFamilyCovered,
  };
}

function applyDailyLifestyle(inputState: ActiveLifeState): ActiveLifeState {
  const startIdx = LIFESTYLE_ORDER.indexOf(inputState.schedule.lifestyle);
  const familyCoveredTier = getFamilyCoveredLifestyleTier(inputState);
  const familyCoveredIdx = familyCoveredTier ? LIFESTYLE_ORDER.indexOf(familyCoveredTier) : -1;
  let state = inputState;

  for (let i = startIdx; i < LIFESTYLE_ORDER.length; i += 1) {
    const tier = LIFESTYLE_ORDER[i];
    const spec = LIFESTYLE_TABLE[tier];

    // If the family household covers this tier (i >= familyCoveredIdx since order is rich -> poor),
    // the character eats at the family table with no personal copper/rice cost.
    const isCoveredByFamily = familyCoveredIdx !== -1 && i >= familyCoveredIdx;
    const worldMult = WORLD_LIVING_COST_MULT[inputState.world.worldState] ?? 1.0;

    let neededCopper = isCoveredByFamily ? 0 : Math.round(spec.copper * worldMult);
    let riceToDeduct = isCoveredByFamily ? 0 : spec.rice;

    if (!isCoveredByFamily && state.assets.rice < spec.rice) {
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

    const housingUpkeep =
      familyCoveredIdx === -1 ? (HOUSING_DAILY_UPKEEP[state.assets.housing] ?? 0) : 0;
    const paidUpkeep =
      housingUpkeep > 0 && state.assets.wealthCopper >= neededCopper + housingUpkeep
        ? housingUpkeep
        : 0;
    const totalCopperSpent = neededCopper + paidUpkeep;

    state = applyEffects(state, {
      rice: -riceToDeduct,
      copper: -totalCopperSpent,
      stamina: spec.stamina,
      health: spec.health,
      happiness: spec.happiness,
      ...(spec.fame ? { fame: spec.fame } : {}),
    });
    if (totalCopperSpent > 0) {
      state = addLedger(state, { livingExpenseCopper: totalCopperSpent });
    }

    if (tier !== inputState.schedule.lifestyle && i === LIFESTYLE_ORDER.length - 1) {
      const lastLog = state.logs[state.logs.length - 1];
      const alreadyWarnedRecently =
        lastLog &&
        lastLog.text.startsWith('Hết lương thực và tiền bạc') &&
        state.profile.totalDays - lastLog.day < 7;
      if (!state.isAlive) {
        const starveReason = 'Chết đói vì hết lương thực và tiền bạc';
        const starveLogText = `Qua đời ở tuổi ${getAgeYears(state.profile.totalDays)}: ${starveReason}.`;
        const updatedLogs =
          lastLog && lastLog.day === state.profile.totalDays && lastLog.text.startsWith('Qua đời ở tuổi')
            ? [...state.logs.slice(0, -1), { ...lastLog, text: starveLogText }]
            : appendLog(state.logs, state.profile.totalDays, 'warning', starveLogText, { tone: 'negative' });
        state = {
          ...state,
          deathReason: starveReason,
          logs: updatedLogs,
        };
      } else if (!alreadyWarnedRecently) {
        state = {
          ...state,
          logs: appendLog(
            state.logs,
            state.profile.totalDays,
            'warning',
            `Hết lương thực và tiền bạc, bạn buộc phải nhịn đói qua ngày! (Sức khỏe còn ${Math.round(state.stats.health)}%)`,
            { tone: 'negative' },
          ),
        };
      }
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
            seasonalGain += getPropertySeasonalIncome(spec, state.world.worldState, state.stats.craftTrade);
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
      state = applyMonthlyFamilyAllowance(state, newAge);
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

    // Annual birthday flavor logs, gift etiquette, auto-actions, mean-reversion & natural mortality (1in8b style)
    if (isBirthday) {
      // Graduate from Quốc Tử Giám at age 22
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

      // Annual pension for retired officials / veteran workers
      if (state.flags.includes('co_luong_huu') && state.livelihoodStatus === 'retired') {
        const pension = state.officialRank > 0 ? 600 : 300;
        state = applyEffects(state, { copper: pension });
        state = addLedger(state, { propertyIncomeCopper: pension });
      }

      // Annual land tax & maintenance for owned properties (~2.5% of property value)
      if (state.assets.properties.length > 0) {
        let totalPropValue = 0;
        for (const propId of state.assets.properties) {
          const spec = PROPERTY_CATALOG.find((p) => p.id === propId);
          if (spec) totalPropValue += spec.costCopper;
        }
        const upkeepTax = Math.round(totalPropValue * 0.025);
        if (upkeepTax > 0) {
          state = applyEffects(state, { copper: -upkeepTax });
          state = addLedger(state, { otherExpenseCopper: upkeepTax });
        }
      }

      // Annual idle-cash investment return (1in8b INV_KS)
      if (state.assets.wealthCopper > 0 && state.investmentChannel && state.investmentChannel !== 'cash') {
        let rate = 0;
        if (state.investmentChannel === 'bank') rate = 0.015;
        else if (state.investmentChannel === 'guild') rate = 0.035;
        else if (state.investmentChannel === 'land_fund') rate = 0.04;
        else if (state.investmentChannel === 'caravan') {
          const invRoll = mulberry32Next(state.prngState);
          state = { ...state, prngState: invRoll.nextState };
          rate = -0.02 + invRoll.value * 0.11; // -2% to +9%
        }
        const cappedPrincipal = Math.min(state.assets.wealthCopper, 2_000_000);
        const invGain = Math.round(cappedPrincipal * rate);
        if (invGain !== 0) {
          state = applyEffects(state, { copper: invGain });
          if (invGain > 0) state = addLedger(state, { propertyIncomeCopper: invGain });
          else state = addLedger(state, { otherExpenseCopper: Math.abs(invGain) });
        }
      }

      const copperBeforeAnnual = state.assets.wealthCopper;
      state = applyAnnualGiftEtiquette(state);
      state = runAnnualAutoActions(state);
      const annualSpent = Math.max(0, copperBeforeAnnual - state.assets.wealthCopper);
      if (annualSpent > 0) {
        state = addLedger(state, { otherExpenseCopper: annualSpent });
      }

      // Family household finances (spouse & children)
      const hasSpouse = state.npcs.some((n) => n.relation === 'spouse' && n.isAlive);
      const livingChildren = state.npcs.filter((n) => n.relation === 'child' && n.isAlive);
      if (hasSpouse) {
        const spouseIncome = state.profile.originClass === 'ban_nong' ? 90 : 180;
        state = applyEffects(state, { copper: spouseIncome });
        state = addLedger(state, { workIncomeCopper: spouseIncome });
      }
      for (const child of livingChildren) {
        const childAge = (child.age ?? 0) + newAge;
        if (childAge < 18) {
          state = applyEffects(state, { copper: -60 });
          state = addLedger(state, { livingExpenseCopper: 60 });
        } else if (childAge >= 22 && newAge >= 60) {
          state = applyEffects(state, { copper: 120 });
          state = addLedger(state, { propertyIncomeCopper: 120 });
        }
      }

      const expectedHealth = Math.max(25, 82 - Math.max(0, newAge - 30) * 0.7);
      state = generateAnnualLifeFlavorLogs(state);
      state = applyAnnualStatMeanReversion(state, newAge);

      // 1in8b-style `tightY` / `bkYear`: track prolonged heavy debt and trigger bankruptcy relief at year 3
      const creditLimit = getCreditLimitCopper(state);
      const isDeepDebt =
        state.assets.wealthCopper < -Math.max(500, Math.round(creditLimit * 0.85));
      if (!isDeepDebt) {
        if (
          state.flags.includes('no_keo_dai_1') ||
          state.flags.includes('no_keo_dai_2')
        ) {
          state = {
            ...state,
            flags: state.flags.filter((f) => f !== 'no_keo_dai_1' && f !== 'no_keo_dai_2'),
          };
        }
      } else if (state.flags.includes('no_keo_dai_2')) {
        const tierOrder: Array<NonNullable<ActiveLifeState['family']>['familyLivingTier']> = [
          'tung_thieu',
          'du_an',
          'kha_gia',
          'sung_tuc',
          'hoang_gia',
        ];
        const nextTierIdx = state.family
          ? Math.max(0, tierOrder.indexOf(state.family.familyLivingTier) - 1)
          : 0;
        const nextProps = state.assets.properties.slice(1);
        const forgivenCash = Math.round(state.assets.wealthCopper * 0.4);
        state = applyEffects(
          {
            ...state,
            flags: state.flags.filter(
              (f) => f !== 'no_keo_dai_1' && f !== 'no_keo_dai_2' && f !== 'dang_no_dia_chu',
            ),
            assets: {
              ...state.assets,
              wealthCopper: forgivenCash,
              properties: nextProps,
            },
            family: state.family
              ? { ...state.family, familyLivingTier: tierOrder[nextTierIdx] }
              : undefined,
            logs: appendLog(
              state.logs,
              nextTotalDays,
              'warning',
              'Vỡ nợ kéo dài 3 năm: Quan nha và chủ nợ tịch biên một phần gia sản, phần nợ còn lại được khoanh giảm 60% để bạn làm lại cuộc đời.',
              { tone: 'negative' },
            ),
          },
          { happiness: -8, fame: -5 },
        );
      } else if (state.flags.includes('no_keo_dai_1')) {
        state = {
          ...state,
          flags: [...state.flags.filter((f) => f !== 'no_keo_dai_1'), 'no_keo_dai_2'],
          logs: appendLog(
            state.logs,
            nextTotalDays,
            'warning',
            'Nợ nần kéo sang năm thứ 2 liên tiếp: Chủ nợ đã đánh tiếng siết gia sản nếu không sớm trả bớt.',
            { tone: 'negative' },
          ),
        };
      } else {
        state = {
          ...state,
          flags: [...state.flags, 'no_keo_dai_1'],
        };
      }
      if ((state.focusTime?.cong_danh ?? 0) > DAYS_PER_YEAR * 0.6) {
        state = {
          ...state,
          logs: appendLog(
            state.logs,
            nextTotalDays,
            'warning',
            'Năm qua bạn dồn quá nhiều sức cho công danh, thân tâm có phần kiệt quệ.',
            { tone: 'negative' },
          ),
        };
      }
      const prevYear = Math.max(0, newAge - 1);
      const roundedHappiness = Math.round(state.stats.happiness);
      const netWorthNow =
        state.assets.wealthCopper +
        (state.assets.goldReserveCopper ?? 0) +
        Math.round(state.assets.rice * state.world.ricePriceInCopper);
      const completedLedger = state.finance?.currentYear ?? emptyLedger();
      const livelihoodSummary = getCurrentLivelihoodLabel(state);
      state = {
        ...state,
        finance: {
          currentYear: emptyLedger(),
          lastYear: completedLedger,
          lastYearNetWorthCopper: netWorthNow,
        },
        focusTime: {},
        yearlyHappiness: {
          ...(state.yearlyHappiness ?? {}),
          [prevYear]: state.yearlyHappiness?.[prevYear] ?? roundedHappiness,
          [newAge]: roundedHappiness,
        },
        logs: appendLog(
          state.logs,
          nextTotalDays,
          'survival',
          `Tổng kết tuổi ${prevYear}: ${livelihoodSummary} • Sức khỏe ${Math.round(state.stats.health)}%, Hạnh phúc ${roundedHappiness}%, Tài sản ${formatCopper(state.assets.wealthCopper)}.`,
        ),
      };

      // 1in8b annual age-based mortality roll (natural lifespan cap at 120)
      if (newAge >= 55 && state.isAlive) {
        const baseDeathProb =
          newAge >= 120
            ? 1.0
            : newAge >= 100
              ? 0.35
              : newAge >= 85
                ? 0.14
                : newAge >= 75
                  ? 0.055
                  : newAge >= 65
                    ? 0.02
                    : 0.005;
        const healthMult = Math.max(0.5, Math.exp((expectedHealth - state.stats.health) * 0.025));
        const finalProb = Math.min(1, baseDeathProb * healthMult);
        const roll = mulberry32Next(state.prngState);
        state = { ...state, prngState: roll.nextState };
        if (roll.value < finalProb) {
          const reason = 'Tuổi cao sức yếu, an nhiên qua đời';
          state = {
            ...state,
            isAlive: false,
            deathReason: reason,
            logs: appendLog(state.logs, nextTotalDays, 'survival', `Qua đời ở tuổi ${newAge}: ${reason}.`, {
              tone: 'negative',
            }),
          };
          return { state, daysSimulated, pausedReason: 'dead' };
        }
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
