import {
  getAgeYears,
  type ActiveLifeState,
  type AnnualFinanceLedger,
  type FallbackRule,
  type LifestyleTier,
  type TimeSlot,
  type WorldState,
} from '../../types/activeLife';
import type { ActionDef, EffectSpec } from '../../types/dsl';
import { evaluateConditions } from '../conditionEvaluator';
import { getCareerIncomeMultiplier } from '../careerSystem';
import { calculateRicePrice } from '../economy';
import { appendLog, applyEffects } from '../effectApplier';
import { pickWeightedIndex } from '../prng';
import { getDailyFocusModifiers } from '../adultLifeActions';
import {
  HOUSING_DAILY_UPKEEP,
  LIFESTYLE_TABLE,
  WORLD_LIVING_COST_MULT,
  getAgingProfile,
} from './configAndHelpers';

function checkFallbackRule(state: ActiveLifeState, rule: FallbackRule): boolean {
  let val = 0;
  if (rule.stat === 'health') val = state.stats.health;
  else if (rule.stat === 'happiness') val = state.stats.happiness;
  else if (rule.stat === 'stamina') val = state.stats.stamina;
  else if (rule.stat === 'rice') val = state.assets.rice;
  else if (rule.stat === 'wealthCopper') val = state.assets.wealthCopper;

  return rule.operator === '<' ? val < rule.threshold : val <= rule.threshold;
}

export function resolveSlotAction(
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

export function scaleActionRewards(
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

  // craftTrade (0-100) boosts trade actions up to 1.25x; worldState dampens trade in war/plague
  let tradeMult = 1.0;
  if (category === 'trade') {
    const worldTradeMult =
      state.world.worldState === 'chien_tranh'
        ? 0.75
        : state.world.worldState === 'dich_benh'
          ? 0.85
          : 1.0;
    tradeMult = (1 + Math.min(100, state.stats.craftTrade) * 0.0025) * worldTradeMult;
  } else if (category === 'official') {
    tradeMult = 1 + Math.max(0, state.officialRank - 1) * 0.08;
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
  if (category === 'official' && state.officialRank > 0) {
    if (actionId === 'act_xu_an_cong_duong') {
      scaled.merit = Number((0.25 * workEfficiency).toFixed(2));
      scaled.public_trust = Number((0.15 * workEfficiency).toFixed(2));
    } else if (actionId === 'act_quan_vo_thao_luyen') {
      scaled.merit = Number((0.3 * workEfficiency).toFixed(2));
      scaled.public_trust = Number((0.1 * workEfficiency).toFixed(2));
    } else if (actionId === 'act_tham_o_nhan_hoi_lo') {
      scaled.scandal_risk = Number((0.35 * workEfficiency).toFixed(2));
      scaled.public_trust = -0.25;
    }
  }

  return scaled;
}

export function emptyLedger(): AnnualFinanceLedger {
  return {
    workIncomeCopper: 0,
    propertyIncomeCopper: 0,
    livingExpenseCopper: 0,
    otherExpenseCopper: 0,
  };
}

export function addLedger(
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
  if (state.flags.includes('that_sung_cung_dinh')) {
    return false;
  }
  if (state.flags.includes('gia_toc_sa_sut')) {
    // Even if declined, a household with some remaining wealth & living parent still shares basic meals
    return (
      (state.family?.familyWealthCopper ?? 0) >= 150 &&
      state.npcs.some((n) => n.relation === 'parent' && n.isAlive)
    );
  }
  return state.npcs.some((n) => n.relation === 'parent' && n.isAlive);
}

/**
 * Determines the highest lifestyle tier covered by the family household
 * while the character is still living at home (not moved out).
 */
export function getFamilyCoveredLifestyleTier(state: ActiveLifeState): LifestyleTier | null {
  // Gia nô trừ nợ được nhà địa chủ nuôi cơm cháo tối thiểu tại phủ chủ (không tự bỏ tiền mua gạo)
  if (state.flags.includes('bi_ep_lam_gia_no')) {
    return 'chao_loang';
  }
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
  const ageYears = getAgeYears(state.profile.totalDays);

  if (state.flags.includes('gia_toc_sa_sut')) {
    return familyWealth >= 400 ? 'com_rau' : 'chao_loang';
  }

  if (originClass === 'ban_nong') {
    if (familyWealth >= 600 && state.world.worldState !== 'mat_mua') return 'com_rau';
    if (familyWealth >= 120 || ageYears < 18) return 'chao_loang';
    return null;
  }
  if (originClass === 'thu_cong') {
    if (familyWealth >= 300) return 'com_rau';
    if (familyWealth >= 120 || ageYears < 18) return 'chao_loang';
    return null;
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

export function applyMonthlyFamilyAllowance(state: ActiveLifeState, ageYears: number): ActiveLifeState {
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

export function applyDailyLifestyle(inputState: ActiveLifeState): ActiveLifeState {
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

export function rollWorldStateOnNewSeason(state: ActiveLifeState): ActiveLifeState {
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
