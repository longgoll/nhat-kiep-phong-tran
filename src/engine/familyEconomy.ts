import type { ActiveLifeState, OriginClass } from '../types/activeLife';
import { formatCopper } from './economy';
import { appendLog, applyEffects } from './effectApplier';
import { getParentMonthlyIncome } from './lifeInitializer';
import { isOfficialPostedAway } from './officialSystem';

export interface FamilyCashflowBreakdown {
  fatherIncome: number;
  motherIncome: number;
  income: number;
  expense: number;
  net: number;
  mouthsToFeed: number;
  foodSelfSufficient: boolean;
}

const PER_MOUTH_COST_BY_ORIGIN: Record<OriginClass, number> = {
  ban_nong: 4,
  thu_cong: 11,
  dia_chu: 55,
  quan_lai: 140,
  hoang_toc: 500,
};

/**
 * Computes detailed monthly family cashflow based on parents' actual occupations,
 * living status, family size, food self-sufficiency, debt, and world state.
 */
export function computeFamilyMonthlyNetCopper(state: ActiveLifeState): FamilyCashflowBreakdown {
  const origin = state.profile.originClass;
  const { fatherBase, motherBase } = getParentMonthlyIncome(
    origin,
    state.family?.fatherOccupation,
    state.family?.motherOccupation,
  );

  const fatherAlive = state.npcs.some((n) => n.id === 'npc_father' && n.isAlive) && !state.flags.includes('mo_coi_cha');
  const motherAlive = state.npcs.some((n) => n.id === 'npc_mother' && n.isAlive) && !state.flags.includes('mo_coi_me');

  let fatherIncome = fatherAlive ? fatherBase : 0;
  let motherIncome = motherAlive ? motherBase : 0;

  if (state.flags.includes('that_sung_cung_dinh')) {
    fatherIncome *= 0.15;
    motherIncome *= 0.4;
  } else if (state.flags.includes('gia_toc_sa_sut')) {
    fatherIncome *= 0.4;
    motherIncome *= 0.6;
  }

  const livingFamilyMembers = state.npcs.filter(
    (n) =>
      n.isAlive &&
      (n.relation === 'parent' || n.relation === 'sibling') &&
      !n.id.startsWith('npc_concubine_') &&
      n.id !== 'npc_grandmother',
  ).length;
  const livingAway =
    state.flags.includes('da_ra_o_rieng') ||
    state.flags.includes('da_khai_phu_hoang_toc') ||
    isOfficialPostedAway(state);
  const mouthsToFeed = livingAway ? Math.max(1, livingFamilyMembers) : 1 + livingFamilyMembers;

  const worldState = state.world.worldState;
  const isAgrarianOrigin = origin === 'ban_nong' || origin === 'dia_chu';
  const foodSelfSufficient = isAgrarianOrigin && worldState !== 'mat_mua';

  let expense = mouthsToFeed * PER_MOUTH_COST_BY_ORIGIN[origin];
  if (foodSelfSufficient) {
    expense *= 0.78;
  }

  // Upkeep for wealthier estates to prevent runaway inflation during childhood
  const familyWealth = state.family?.familyWealthCopper ?? 0;
  if (origin === 'dia_chu' || origin === 'quan_lai' || origin === 'hoang_toc') {
    expense += Math.round(familyWealth * 0.0012);
  }

  if (state.flags.includes('that_sung_cung_dinh')) {
    expense *= 0.5;
  }
  if (state.flags.includes('gia_dinh_mac_no')) {
    expense += origin === 'ban_nong' || origin === 'thu_cong' ? 8 : 30;
  }

  if (worldState === 'mat_mua') {
    if (isAgrarianOrigin) {
      fatherIncome *= 0.7;
      motherIncome *= 0.8;
    }
    expense *= 1.25;
  } else if (worldState === 'dich_benh') {
    fatherIncome *= 0.85;
    motherIncome *= 0.85;
    expense *= 1.2;
  } else if (worldState === 'chien_tranh') {
    fatherIncome *= 0.75;
    motherIncome *= 0.8;
    expense *= 1.3;
  }

  const roundedFather = Math.round(fatherIncome);
  const roundedMother = Math.round(motherIncome);
  const roundedIncome = roundedFather + roundedMother;
  const roundedExpense = Math.round(expense);

  return {
    fatherIncome: roundedFather,
    motherIncome: roundedMother,
    income: roundedIncome,
    expense: roundedExpense,
    net: roundedIncome - roundedExpense,
    mouthsToFeed,
    foodSelfSufficient,
  };
}

function getLivingSiblingCount(state: ActiveLifeState): number {
  return state.npcs.filter((n) => n.isAlive && n.relation === 'sibling').length;
}

/**
 * Grants a proportional share of family wealth when the character moves out (`da_ra_o_rieng`)
 * and deducts that exact amount from `family.familyWealthCopper`.
 */
export function applyMoveOutInheritance(state: ActiveLifeState): ActiveLifeState {
  if (!state.family || state.flags.includes('da_chia_gia_san_ra_rieng')) return state;
  if (state.flags.includes('thai_giam') || state.flags.includes('trong_hau_cung')) return state;

  const familyWealth = state.family.familyWealthCopper;
  if (familyWealth <= 20) return state;

  const siblings = getLivingSiblingCount(state);
  const birthOrder = state.family.birthOrder;
  const orderBonus = birthOrder === 'con_mot' ? 0.35 : birthOrder === 'con_truong' ? 0.25 : 0.18;
  const relScale = state.stats.relationships >= 50 ? 1.15 : state.stats.relationships < 20 ? 0.7 : 1.0;

  const rawShare = Math.round((familyWealth * orderBonus * relScale) / Math.max(1, 1 + siblings * 0.6));
  const cappedShare = Math.min(15000, Math.min(Math.floor(familyWealth * 0.6), rawShare));
  if (cappedShare <= 0) return state;

  const next = applyEffects(state, {
    copper: cappedShare,
    family_copper: -cappedShare,
    add_flags: ['da_chia_gia_san_ra_rieng'],
  });
  return {
    ...next,
    logs: appendLog(
      next.logs,
      next.profile.totalDays,
      'event',
      `Gia đình trích ${formatCopper(cappedShare)} từ gia sản làm vốn riêng khi bạn ra ở riêng.`,
      { tone: 'positive' },
    ),
  };
}

/**
 * Distributes remaining family estate when the last surviving parent passes away,
 * respecting birth order, living siblings, prior move-out share, and disinheritance/debt flags.
 */
export function applyFinalInheritanceIfEligible(state: ActiveLifeState): ActiveLifeState {
  if (!state.family || state.flags.includes('da_chia_di_san')) return state;
  if (state.npcs.some((n) => n.relation === 'parent' && n.isAlive)) return state;
  if (state.flags.includes('thai_giam') || state.flags.includes('trong_hau_cung') || state.flags.includes('bo_tron_o_do')) {
    return applyEffects(state, { add_flags: ['da_chia_di_san'] });
  }

  const remainingWealth = state.family.familyWealthCopper;
  if (remainingWealth <= 0 || state.flags.includes('gia_dinh_mac_no')) {
    return applyEffects(state, { add_flags: ['da_chia_di_san'] });
  }

  const siblings = getLivingSiblingCount(state);
  const birthOrder = state.family.birthOrder;
  const alreadyGotShare = state.flags.includes('da_chia_gia_san_ra_rieng');
  const orderWeight = birthOrder === 'con_truong' ? 1.3 : birthOrder === 'con_ut' ? 1.1 : 1.0;
  const totalShares = orderWeight + siblings;
  const baseShare = Math.round(remainingWealth * (orderWeight / Math.max(1, totalShares)));
  const finalShare = Math.min(
    remainingWealth,
    alreadyGotShare ? Math.round(baseShare * 0.65) : baseShare,
  );

  if (finalShare <= 0) {
    return applyEffects(state, { add_flags: ['da_chia_di_san'] });
  }

  const next = applyEffects(state, {
    copper: finalShare,
    family_copper: -remainingWealth,
    add_flags: ['da_chia_di_san'],
    milestone_title: 'Thừa kế gia sản của song thân',
  });

  return {
    ...next,
    logs: appendLog(
      next.logs,
      next.profile.totalDays,
      'event',
      `Cả hai đấng sinh thành đều đã quy tiên, bạn được chia ${formatCopper(finalShare)} di sản gia đình để lại.`,
      { tone: 'positive' },
    ),
  };
}
