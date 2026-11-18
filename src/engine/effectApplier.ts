import { getAgeYears, type ActiveLifeState, type LogEntry } from '../types/activeLife';
import type { EffectSpec } from '../types/dsl';

const MAX_LOGS = 150;
const MAX_MILESTONES = 30;

function clamp(val: number, min: number, max: number): number {
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

function computeFamilyLivingTier(
  wealthCopper: number,
  originClass: ActiveLifeState['profile']['originClass'],
): NonNullable<ActiveLifeState['family']>['familyLivingTier'] {
  if (originClass === 'hoang_toc') return 'hoang_gia';
  if (wealthCopper >= 12000) return 'sung_tuc';
  if (wealthCopper >= 3000) return 'kha_gia';
  if (wealthCopper >= 350) return 'du_an';
  return 'tung_thieu';
}

export function applyEffects(state: ActiveLifeState, effects: EffectSpec): ActiveLifeState {
  const stats = { ...state.stats };
  const assets = {
    ...state.assets,
    properties: [...state.assets.properties],
  };
  let flags = [...state.flags];
  let officialRank = state.officialRank;
  let currentRole = state.profile.currentRole;
  let traits = [...(state.traits ?? [])];
  let interests = [...(state.interests ?? [])];
  let family = state.family ? { ...state.family } : undefined;
  let npcs = state.npcs.map((n) => ({ ...n }));
  const delayedEvents = [...state.delayedEvents];
  let milestones = [...state.milestones];
  let isAlive = state.isAlive;
  let deathReason = state.deathReason;

  if (effects.health !== undefined) stats.health = applyDirectStatDelta(stats.health, effects.health);
  if (effects.happiness !== undefined) stats.happiness = applyDirectStatDelta(stats.happiness, effects.happiness);
  if (effects.relationships !== undefined) stats.relationships = applyDirectStatDelta(stats.relationships, effects.relationships);
  if (effects.education !== undefined) stats.education = applyStatDelta(stats.education, effects.education);
  if (effects.stamina !== undefined) stats.stamina = clamp(stats.stamina + effects.stamina, 0, stats.maxStamina);
  if (effects.martial !== undefined) stats.martial = Math.max(0, stats.martial + effects.martial);
  if (effects.craft_trade !== undefined) stats.craftTrade = applyStatDelta(stats.craftTrade, effects.craft_trade);
  if (effects.fame !== undefined) stats.fame = Math.max(0, stats.fame + effects.fame);
  if (effects.infamy !== undefined) stats.infamy = Math.max(0, stats.infamy + effects.infamy);

  if (effects.copper !== undefined) assets.wealthCopper = Math.round(assets.wealthCopper + effects.copper);
  if (effects.rice !== undefined) assets.rice = Math.max(0, Number((assets.rice + effects.rice).toFixed(2)));
  if (effects.set_housing !== undefined) assets.housing = effects.set_housing;
  if (effects.add_property && !assets.properties.includes(effects.add_property)) {
    assets.properties.push(effects.add_property);
  }

  let activeCareer = state.activeCareer;
  let schedule = state.schedule;

  if (effects.add_flags) {
    for (const f of effects.add_flags) {
      if (!flags.includes(f)) flags.push(f);
    }
    if (effects.add_flags.includes('gia_toc_sa_sut') && !state.flags.includes('gia_toc_sa_sut')) {
      npcs = npcs.filter((npc) => npc.relation !== 'household');
      if (family) {
        const keptAssets = (family.familyAssetsSummary ?? []).filter(
          (item) =>
            !item.includes('Phủ đệ') &&
            !item.includes('gia nhân') &&
            !item.includes('Quản gia') &&
            !item.includes('gia đinh') &&
            !item.includes('hòm bạc') &&
            !item.includes('Kho bạc'),
        );
        family = {
          ...family,
          familyAssetsSummary: ['Gian nhà nhỏ nơi quê cũ', ...keptAssets, 'Gia nhân đã ly tán'],
        };
      }
      if (state.profile.originClass === 'quan_lai' && officialRank === 0) {
        currentRole = 'Con nhà quan sa sút';
      }
    }
    if (
      effects.add_flags.includes('that_sung_cung_dinh') &&
      !state.flags.includes('that_sung_cung_dinh') &&
      state.profile.originClass === 'hoang_toc'
    ) {
      npcs = npcs.map((npc) => {
        if (npc.id === 'npc_butler' && npc.isAlive) {
          return { ...npc, role: 'Thái giám cũ trung thành nơi lãnh cung' };
        }
        if (npc.id === 'npc_wetnurse' && npc.isAlive) {
          return { ...npc, role: 'Cung nữ thân cận theo hầu mẫu phi' };
        }
        return npc;
      });
      if (family) {
        family = {
          ...family,
          familyAssetsSummary: [
            'Tẩm cung hẻo lánh',
            'Bổng lộc bị cắt giảm',
            'Lão thái giám & cung nữ trung thành',
          ],
        };
      }
    }

    // Sync special fate / servitude roles & clear civilian career
    if (effects.add_flags.includes('bi_ep_lam_gia_no')) {
      currentRole = 'Gia nô trừ nợ';
      activeCareer = null;
      flags = flags.filter((f) => !f.startsWith('career_'));
      schedule = { ...schedule, morning: 'act_lam_gia_no', afternoon: 'act_lam_gia_no' };
    } else if (effects.add_flags.includes('thai_giam')) {
      currentRole = 'Thái giám nội đình';
      activeCareer = null;
      flags = flags.filter((f) => !f.startsWith('career_'));
      schedule = { ...schedule, morning: 'act_hau_can_noi_dinh', afternoon: 'act_hau_can_noi_dinh' };
    } else if (effects.add_flags.includes('trong_hau_cung')) {
      currentRole = 'Cung nữ · Phi tần';
      activeCareer = null;
      flags = flags.filter((f) => !f.startsWith('career_'));
      schedule = { ...schedule, morning: 'act_hau_can_noi_dinh', afternoon: 'act_hau_can_noi_dinh' };
    } else if (effects.add_flags.includes('trong_quan_ngu')) {
      currentRole = 'Binh sĩ tại ngũ';
      activeCareer = null;
      flags = flags.filter((f) => !f.startsWith('career_'));
      schedule = { ...schedule, morning: 'act_tuan_tra_quan_ngu', afternoon: 'act_tuan_tra_quan_ngu' };
    } else if (
      effects.add_flags.includes('tung_o_do') &&
      Math.floor(state.profile.totalDays / 360) < 13
    ) {
      currentRole = 'Đi ở đợ nhà địa chủ';
    }
  }
  if (effects.remove_flags) {
    flags = flags.filter((f) => !effects.remove_flags!.includes(f));
    if (effects.remove_flags.includes('bi_ep_lam_gia_no') && currentRole === 'Gia nô trừ nợ') {
      currentRole = 'Dân thường';
      if (schedule.morning === 'act_lam_gia_no') schedule = { ...schedule, morning: 'act_nghi_ngoi' };
      if (schedule.afternoon === 'act_lam_gia_no') schedule = { ...schedule, afternoon: 'act_nghi_ngoi' };
    }
    if (effects.remove_flags.includes('trong_quan_ngu') && currentRole === 'Binh sĩ tại ngũ') {
      currentRole = 'Dân thường';
      if (schedule.morning === 'act_tuan_tra_quan_ngu') schedule = { ...schedule, morning: 'act_nghi_ngoi' };
      if (schedule.afternoon === 'act_tuan_tra_quan_ngu') schedule = { ...schedule, afternoon: 'act_nghi_ngoi' };
    }
    if (effects.remove_flags.includes('tung_o_do') && currentRole === 'Đi ở đợ nhà địa chủ') {
      currentRole = 'Thiếu niên';
    }
  }
  if (effects.reset_official_rank) {
    officialRank = 0;
    currentRole = 'Dân thường';
    flags = flags.filter((f) => f !== 'dang_lam_quan');
  }
  if (effects.official_rank_delta !== undefined && effects.official_rank_delta !== 0) {
    const rankNames = [
      'Dân thường',
      'Tri huyện',
      'Tri phủ',
      'Tuần phủ',
      'Thượng thư',
      'Tể tướng',
      'Khai quốc Hoàng đế',
    ];
    officialRank = Math.max(0, Math.min(5, officialRank + effects.official_rank_delta));
    currentRole = rankNames[officialRank] ?? 'Dân thường';
    if (officialRank === 0) {
      flags = flags.filter((f) => f !== 'dang_lam_quan');
    } else if (!flags.includes('dang_lam_quan')) {
      flags.push('dang_lam_quan');
    }
  }

  if (effects.add_traits) {
    for (const t of effects.add_traits) {
      if (!traits.includes(t)) traits.push(t);
    }
  }
  if (effects.remove_traits) {
    traits = traits.filter((t) => !effects.remove_traits!.includes(t));
  }
  if (effects.add_interests) {
    for (const i of effects.add_interests) {
      if (!interests.includes(i)) interests.push(i);
    }
  }
  if (effects.family_copper !== undefined && family) {
    family.familyWealthCopper = Math.max(0, family.familyWealthCopper + effects.family_copper);
    family.familyLivingTier = computeFamilyLivingTier(family.familyWealthCopper, state.profile.originClass);
  }
  if (effects.scale_family_copper !== undefined && family) {
    family.familyWealthCopper = Math.max(0, Math.round(family.familyWealthCopper * effects.scale_family_copper));
    family.familyLivingTier = computeFamilyLivingTier(family.familyWealthCopper, state.profile.originClass);
  }
  if (effects.set_circumstance && family) {
    family.circumstance = effects.set_circumstance.id;
    family.circumstanceLabel = effects.set_circumstance.label;
  }
  if (effects.kill_npc_id) {
    npcs = npcs.map((npc) => {
      if (npc.id === effects.kill_npc_id && npc.isAlive) {
        const cleanRole = npc.role.includes('(Đã mất)') ? npc.role : `${npc.role} (Đã mất)`;
        return { ...npc, isAlive: false, role: cleanRole };
      }
      return npc;
    });
  }

  if (effects.npc_affinity) {
    for (const mod of effects.npc_affinity) {
      let totalDelta = 0;
      let matched = 0;
      npcs = npcs.map((npc) => {
        const matchId = mod.npc_id && npc.id === mod.npc_id;
        const matchRel = mod.relation && npc.relation === mod.relation && npc.isAlive;
        if (matchId || matchRel) {
          matched += 1;
          totalDelta += mod.delta;
          return { ...npc, affinity: clamp(npc.affinity + mod.delta, -100, 100) };
        }
        return npc;
      });
      // Sync 20% of NPC affinity delta to general relationships stat (with diminishing returns above 70)
      if (matched > 0) {
        const avgDelta = totalDelta / matched;
        stats.relationships = Math.round(applyStatDelta(stats.relationships, avgDelta * 0.2));
      }
    }
  }

  if (effects.schedule_delayed) {
    for (const item of effects.schedule_delayed) {
      delayedEvents.push({
        eventId: item.event_id,
        triggerDay: state.profile.totalDays + item.delay_days,
      });
    }
  }

  if (effects.milestone_title && milestones.length < MAX_MILESTONES) {
    milestones = [
      ...milestones,
      {
        totalDays: state.profile.totalDays,
        ageYears: getAgeYears(state.profile.totalDays),
        title: effects.milestone_title,
        netWorthInCopper: assets.wealthCopper + Math.round(assets.rice * state.world.ricePriceInCopper),
        fame: stats.fame,
      },
    ];
  }

  if (effects.kill_reason) {
    stats.health = 0;
    isAlive = false;
    deathReason = effects.kill_reason;
  } else if (stats.health <= 0) {
    isAlive = false;
    deathReason = deathReason ?? 'Sức khỏe suy kiệt qua đời';
  }

  return {
    ...state,
    profile: {
      ...state.profile,
      currentRole,
    },
    officialRank,
    isAlive,
    deathReason,
    stats,
    assets,
    family,
    traits,
    interests,
    flags,
    activeCareer,
    schedule,
    npcs,
    delayedEvents,
    milestones,
  };
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
    45 +
    (hasLivingSpouse ? 12 : 0) +
    Math.min(15, livingChildren * 4) +
    (hasLivingParent ? 3 : 0) +
    ((state.interests?.length ?? 0) > 0 ? 3 : 0) +
    (state.traits?.includes('nhan_hau') ? 2 : 0) +
    (state.flags.includes('dang_o_tu') || state.livelihoodStatus === 'prison' ? -8 : 0),
    10,
    95,
  );
  const relRate = state.stats.relationships > relTarget ? 0.2 : 0.12;
  const nextRelationships = clamp(
    Number((state.stats.relationships + (relTarget - state.stats.relationships) * relRate).toFixed(2)),
    0,
    100,
  );

  const tierHappyBonus =
    state.family?.familyLivingTier === 'hoang_gia'
      ? 7
      : state.family?.familyLivingTier === 'sung_tuc'
        ? 5
        : state.family?.familyLivingTier === 'kha_gia'
          ? 2
          : state.family?.familyLivingTier === 'tung_thieu'
            ? -6
            : -2;
  const happyTarget = clamp(
    55 +
    tierHappyBonus +
    (nextRelationships - 50) * 0.25 +
    (nextHealth - expHl) * 0.2 +
    (state.flags.includes('dang_no_dia_chu') ? -6 : state.assets.wealthCopper < 0 ? -3 : 0) +
    (state.flags.includes('dang_o_tu') || state.livelihoodStatus === 'prison' ? -10 : 0),
    5,
    95,
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
