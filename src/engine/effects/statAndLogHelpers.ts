import {
  type ActiveLifeState,
  type LogEntry,
} from '../../types/activeLife';

const MAX_LOGS = 150;
export const MAX_MILESTONES = 30;

export function clamp(val: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, val));
}

/**
 * Applies a direct clamped delta to a 0-100 stat (1in8b-style for health, happiness, relationships,
 * which are balanced long-term by annual mean-reversion toward the character's realistic baseline).
 */
export function applyDirectStatDelta(current: number, delta: number): number {
  return clamp(Number((current + delta).toFixed(2)), 0, 100);
}

/**
 * Applies a delta to mood/social 0-100 stats (happiness, relationships) with gentle diminishing
 * returns above 75 so they don't stay trivially pinned at 100, while negative hits apply in full.
 */
export function applyMoodSocialDelta(current: number, delta: number): number {
  if (delta <= 0) {
    return clamp(Number((current + delta).toFixed(2)), 0, 100);
  }
  let mult = 1.0;
  if (current >= 94) mult = 0.12;
  else if (current >= 88) mult = 0.35;
  return clamp(Number((current + delta * mult).toFixed(2)), 0, 100);
}

/**
 * Applies a delta to a 0-100 core stat with diminishing returns above 70
 * (used for cumulative mastery stats like education and craftTrade).
 */
export function applyStatDelta(current: number, delta: number): number {
  if (delta <= 0) {
    return clamp(Number((current + delta).toFixed(2)), 0, 100);
  }
  let mult = 1.0;
  if (current >= 95) mult = 0.06;
  else if (current >= 90) mult = 0.15;
  else if (current >= 80) mult = 0.30;
  else if (current >= 70) mult = 0.55;
  return clamp(Number((current + delta * mult).toFixed(2)), 0, 100);
}

export function appendLog(
  logs: LogEntry[],
  day: number,
  category: LogEntry['category'],
  text: string,
  options?: { tone?: LogEntry['tone']; subNote?: string },
): LogEntry[] {
  const entry: LogEntry = {
    day,
    category,
    text,
    ...(options?.tone ? { tone: options.tone } : {}),
    ...(options?.subNote ? { subNote: options.subNote } : {}),
  };
  const next = [...logs, entry];
  if (next.length > MAX_LOGS) {
    return next.slice(next.length - MAX_LOGS);
  }
  return next;
}

export function computeFamilyLivingTier(
  wealthCopper: number,
  originClass: ActiveLifeState['profile']['originClass'],
): NonNullable<ActiveLifeState['family']>['familyLivingTier'] {
  if (originClass === 'hoang_toc') return 'hoang_gia';
  if (wealthCopper >= 12000) return 'sung_tuc';
  if (wealthCopper >= 3000) return 'kha_gia';
  if (wealthCopper >= 350) return 'du_an';
  return 'tung_thieu';
}


export function getExpectedHealthBaseline(ageYears: number): number {
  if (ageYears < 1) return 74;
  if (ageYears < 5) return 80;
  if (ageYears < 30) return 88;
  if (ageYears < 60) return 88 - (ageYears - 30) * 0.6;
  return Math.max(15, 70 - (ageYears - 60) * 0.95);
}

/**
 * 1in8b-style annual mean-reversion: pulls health (25%), relationships (12-20%),
 * and happiness (22%) toward the character's realistic baseline at each birthday.
 */
export function applyAnnualStatMeanReversion(state: ActiveLifeState, ageYears: number): ActiveLifeState {
  const expHl = getExpectedHealthBaseline(ageYears);
  const lifestyleHlBonus =
    state.schedule.lifestyle === 'son_hao'
      ? 3
      : state.schedule.lifestyle === 'thit_ca'
        ? 2
        : state.schedule.lifestyle === 'chao_loang'
          ? -4
          : state.schedule.lifestyle === 'nhin_doi'
            ? -10
            : 0;
  const housingHlBonus =
    state.assets.housing === 'phu_de'
      ? 3
      : state.assets.housing === 'nha_gach'
        ? 1.5
        : state.assets.housing === 'gam_cau'
          ? -5
          : 0;
  const healthTarget = clamp(
    expHl +
    lifestyleHlBonus +
    housingHlBonus +
    (state.flags.includes('dang_no_dia_chu') ? -3 : 0) +
    (state.flags.includes('dang_o_tu') || state.livelihoodStatus === 'prison' ? -6 : 0) +
    (state.flags.includes('benh_man_tinh') ? -5 : 0) +
    (state.traits?.includes('khoe_manh') ? 2 : 0) +
    (state.schedule.lifeFocus === 'suc_khoe' || state.schedule.lifeFocus === 'nghi_ngoi' ? 1.5 : 0),
    5,
    98,
  );
  const nextHealth = clamp(
    Number((state.stats.health + (healthTarget - state.stats.health) * 0.25).toFixed(2)),
    1,
    100,
  );

  const hasLivingSpouse = state.npcs.some((n) => n.relation === 'spouse' && n.isAlive);
  const livingChildren = state.npcs.filter((n) => n.relation === 'child' && n.isAlive).length;
  const hasLivingParent = state.npcs.some((n) => n.relation === 'parent' && n.isAlive);
  const relTarget = clamp(
    32 +
    (hasLivingSpouse ? 14 : 0) +
    Math.min(16, livingChildren * 4) +
    (hasLivingParent ? 6 : 0) +
    ((state.interests?.length ?? 0) > 0 ? 4 : 0) +
    (state.traits?.includes('nhan_hau') ? 4 : 0) +
    (state.schedule.lifeFocus === 'gia_dinh' ? 4 : 0) +
    (state.flags.includes('dang_o_tu') || state.livelihoodStatus === 'prison' ? -8 : 0),
    10,
    92,
  );
  const relRate = state.stats.relationships > relTarget ? 0.2 : 0.14;
  const nextRelationships = clamp(
    Number((state.stats.relationships + (relTarget - state.stats.relationships) * relRate).toFixed(2)),
    0,
    100,
  );

  const tierHappyBonus =
    state.family?.familyLivingTier === 'hoang_gia'
      ? 5
      : state.family?.familyLivingTier === 'sung_tuc'
        ? 4
        : state.family?.familyLivingTier === 'kha_gia'
          ? 2
          : state.family?.familyLivingTier === 'tung_thieu'
            ? -6
            : 0;
  const happyTarget = clamp(
    50 +
    tierHappyBonus +
    (hasLivingSpouse ? 4 : 0) +
    (nextRelationships - 50) * 0.22 +
    (nextHealth - expHl) * 0.2 +
    (state.flags.includes('dang_no_dia_chu') ? -6 : state.assets.wealthCopper < 0 ? -4 : 0) +
    (state.flags.includes('dang_o_tu') || state.livelihoodStatus === 'prison' ? -12 : 0),
    5,
    92,
  );
  const nextHappiness = clamp(
    Number((state.stats.happiness + (happyTarget - state.stats.happiness) * 0.22).toFixed(2)),
    0,
    100,
  );

  return {
    ...state,
    stats: {
      ...state.stats,
      health: nextHealth,
      relationships: nextRelationships,
      happiness: nextHappiness,
    },
  };
}
