import { DAYS_PER_YEAR, getAgeYears, type ActiveLifeState } from '../../types/activeLife';
import { appendLog, applyEffects } from '../effectApplier';
import { mulberry32Next } from '../prng';
import {
  getOfficialRankSpec,
  pickPostingByAvoidance,
} from './ranksAndMeta';

export function manageOfficialStaff(
  state: ActiveLifeState,
  action: 'hire_maid' | 'fire_maid' | 'hire_guard' | 'fire_guard' | 'hire_advisor' | 'fire_advisor',
): ActiveLifeState {
  if (!state.official || state.officialRank <= 0) return state;
  const spec = getOfficialRankSpec(state.officialRank);
  if (!spec) return state;

  const off = { ...state.official };
  if (action === 'hire_maid') {
    if (off.maidsCount >= spec.maxMaids || state.assets.wealthCopper < 300) return state;
    off.maidsCount += 1;
    const next = applyEffects(state, { copper: -300, happiness: 2 });
    return {
      ...next,
      official: off,
      logs: appendLog(next.logs, next.profile.totalDays, 'survival', `Tuyển thêm 1 nha hoàn vào phủ nha (-300đ).`),
    };
  }
  if (action === 'fire_maid') {
    if (off.maidsCount <= 0) return state;
    off.maidsCount -= 1;
    return { ...state, official: off };
  }
  if (action === 'hire_guard') {
    if (off.guardsCount >= spec.maxGuards || state.assets.wealthCopper < 450) return state;
    off.guardsCount += 1;
    const next = applyEffects(state, { copper: -450 });
    return {
      ...next,
      official: off,
      logs: appendLog(next.logs, next.profile.totalDays, 'survival', `Tuyển thêm 1 gia đinh / hộ vệ phủ nha (-450đ).`),
    };
  }
  if (action === 'fire_guard') {
    if (off.guardsCount <= 0) return state;
    off.guardsCount -= 1;
    return { ...state, official: off };
  }
  if (action === 'hire_advisor') {
    if (off.hasAdvisor || state.officialRank < 2 || state.assets.wealthCopper < 1500) return state;
    off.hasAdvisor = true;
    const next = applyEffects(state, { copper: -1500 });
    return {
      ...next,
      official: off,
      logs: appendLog(next.logs, next.profile.totalDays, 'event', `Mời được Sư gia (Thư lại riêng) vào phủ giúp việc công văn và xử án (-1.500đ).`),
    };
  }
  if (action === 'fire_advisor') {
    if (!off.hasAdvisor) return state;
    off.hasAdvisor = false;
    return { ...state, official: off };
  }
  return state;
}

export function sendSeasonalSuperiorGift(state: ActiveLifeState, kind: 'bang_kinh' | 'nha_hoi'): ActiveLifeState {
  if (!state.official || state.officialRank <= 0) return state;
  const seasonKey = `${getAgeYears(state.profile.totalDays)}_${state.world.season}`;
  if (kind === 'bang_kinh' && state.official.lastSeasonalGiftKey === seasonKey) return state;
  if (kind === 'nha_hoi' && state.official.lastNhaHoiSeasonKey === seasonKey) return state;

  const cost = kind === 'bang_kinh' ? state.officialRank * 800 : state.officialRank * 2200;
  if (state.assets.wealthCopper < cost) return state;

  const roll = mulberry32Next(state.prngState);
  let next = applyEffects(
    { ...state, prngState: roll.nextState },
    {
      copper: -cost,
      relationships: kind === 'bang_kinh' ? 3 : 6,
    },
  );

  const scandalDelta = kind === 'bang_kinh' ? 2 : 1;
  const favorDelta = kind === 'bang_kinh' ? 3 : 7;
  const meritDelta = kind === 'bang_kinh' ? 2 : 0;

  next = {
    ...next,
    official: {
      ...state.official,
      lastSeasonalGiftKey: kind === 'bang_kinh' ? seasonKey : state.official.lastSeasonalGiftKey,
      lastNhaHoiSeasonKey: kind === 'nha_hoi' ? seasonKey : state.official.lastNhaHoiSeasonKey,
      imperialFavor: Math.min(100, state.official.imperialFavor + favorDelta),
      merit: state.official.merit + meritDelta,
      scandalRisk: Math.min(100, state.official.scandalRisk + scandalDelta),
    },
    logs: appendLog(
      next.logs,
      next.profile.totalDays,
      'event',
      kind === 'bang_kinh'
        ? `Gửi lễ Băng kính/Thán kính theo lệ cho quan trên (-${cost}đ, Thánh sủng +${favorDelta}).`
        : `Mua cổ vật/thư họa làm Nhã hối biếu đại thần (-${cost}đ, Thánh sủng +${favorDelta}).`,
    ),
  };
  return next;
}

export function donateDisasterReliefAsOfficial(state: ActiveLifeState): ActiveLifeState {
  if (!state.official || state.officialRank <= 0) return state;
  const seasonKey = `${getAgeYears(state.profile.totalDays)}_${state.world.season}`;
  if (state.official.lastReliefSeasonKey === seasonKey) return state;
  const cost = Math.max(1500, state.officialRank * 1200);
  if (state.assets.wealthCopper < cost) return state;

  const next = applyEffects(state, {
    copper: -cost,
    fame: 8,
    happiness: 4,
  });
  return {
    ...next,
    official: {
      ...state.official,
      lastReliefSeasonKey: seasonKey,
      publicTrust: Math.min(100, state.official.publicTrust + 10),
      merit: state.official.merit + 6,
      scandalRisk: Math.max(0, state.official.scandalRisk - 4),
    },
    logs: appendLog(
      next.logs,
      next.profile.totalDays,
      'event',
      `Xuất tiền túi phát chẩn cứu dân (-${cost}đ, Dân tâm +10, Chính tích +6, Hiềm nghi -4).`,
    ),
  };
}

export function setOfficialFamilyAccompany(state: ActiveLifeState, accompany: boolean): ActiveLifeState {
  if (!state.official) return state;
  const movingCost = accompany ? state.officialRank * 600 : 0;
  let next = state;
  if (movingCost > 0 && state.assets.wealthCopper >= movingCost) {
    next = applyEffects(state, { copper: -movingCost, happiness: 5, relationships: 4 });
  } else if (!accompany) {
    next = applyEffects(state, { happiness: -4, relationships: -3 });
  }
  return {
    ...next,
    official: {
      ...state.official,
      familyAccompanied: accompany,
    },
    logs: appendLog(
      next.logs,
      next.profile.totalDays,
      'event',
      accompany
        ? `Bạn thu xếp đưa gia quyến cùng lên phủ nha nhậm chức (-${movingCost}đ lộ phí).`
        : `Bạn để gia quyến ở lại quê nhà giữ từ đường, một thân đi nhậm chức.`,
    ),
  };
}

export function triggerDingYouLeave(state: ActiveLifeState): ActiveLifeState {
  if (!state.official || state.official.track !== 'van' || state.officialRank <= 0) return state;
  const untilDay = state.profile.totalDays + 3 * DAYS_PER_YEAR;
  const next = applyEffects(state, {
    happiness: -20,
    remove_flags: ['dang_lam_quan'],
    milestone_title: 'Đinh ưu: Giao ấn chịu tang song thân 3 năm',
  });
  return {
    ...next,
    officialRank: 0,
    official: {
      ...state.official,
      dingYouUntilDay: untilDay,
      savedRankBeforeDingYou: state.officialRank,
      savedTrackBeforeDingYou: state.official.track,
    },
    profile: { ...next.profile, currentRole: 'Cư tang Đinh ưu' },
    logs: appendLog(
      next.logs,
      next.profile.totalDays,
      'event',
      'Theo lễ chế Đinh ưu, quan Văn phải giao ấn từ quan về quê chịu tang 3 năm trước khi phục chức.',
    ),
  };
}

export function triggerKimCachTongNhung(state: ActiveLifeState): ActiveLifeState {
  if (!state.official || state.official.track !== 'vo' || state.officialRank <= 0) return state;
  const next = applyEffects(state, {
    happiness: -15,
    imperial_favor: 5,
    merit: 4,
    fame: 6,
  });
  return {
    ...next,
    logs: appendLog(
      next.logs,
      next.profile.totalDays,
      'event',
      'Song thân qua đời nơi quê nhà, nhưng bạn đang giữ trọng trách quân vụ ngoài biên ải, đành tuân lệnh "Kim cách tòng nhung" nén đau thương giữ vững phòng tuyến (+5 Thánh sủng, +4 Quân công).',
    ),
  };
}

export function rewardMilitaryTroops(state: ActiveLifeState): ActiveLifeState {
  if (!state.official || state.official.track !== 'vo' || state.officialRank <= 0) return state;
  const seasonKey = `${getAgeYears(state.profile.totalDays)}_${state.world.season}`;
  if (state.official.lastMilitaryRewardSeasonKey === seasonKey) return state;
  const cost = Math.max(1500, state.officialRank * 1200);
  if (state.assets.wealthCopper < cost) return state;
  const next = applyEffects(state, {
    copper: -cost,
    fame: 6,
    happiness: 4,
  });
  return {
    ...next,
    official: {
      ...state.official,
      lastMilitaryRewardSeasonKey: seasonKey,
      publicTrust: Math.min(100, state.official.publicTrust + 12),
      merit: state.official.merit + 6,
      imperialFavor: Math.min(100, state.official.imperialFavor + 3),
    },
    logs: appendLog(
      next.logs,
      next.profile.totalDays,
      'event',
      `Xuất tiền túi khao thưởng quân sĩ dưới trướng (-${cost}đ, Quân tâm +12, Quân công +6).`,
    ),
  };
}

export function equipMilitaryGear(state: ActiveLifeState): ActiveLifeState {
  if (!state.official || state.official.track !== 'vo' || state.officialRank <= 0) return state;
  const seasonKey = `${getAgeYears(state.profile.totalDays)}_${state.world.season}`;
  if (state.official.lastMilitaryGearSeasonKey === seasonKey) return state;
  const cost = Math.max(2000, state.officialRank * 1500);
  if (state.assets.wealthCopper < cost) return state;
  const next = applyEffects(state, {
    copper: -cost,
    martial: 3,
    merit: 4,
  });
  return {
    ...next,
    official: {
      ...state.official,
      lastMilitaryGearSeasonKey: seasonKey,
    },
    logs: appendLog(
      next.logs,
      next.profile.totalDays,
      'event',
      `Sắm thêm chiến mã và giáp trụ tinh nhuệ cho quân doanh (-${cost}đ, Võ nghệ +3, Quân công +4).`,
    ),
  };
}

export function canBribeForPromotion(state: ActiveLifeState): {
  ok: boolean;
  reason?: string;
  cost: number;
  successChance: number;
} {
  const rank = state.officialRank;
  const cost = Math.max(12000, rank * rank * 3000);
  if (rank <= 0 || !state.official) {
    return { ok: false, reason: 'Chưa có chức vị triều đình', cost, successChance: 0 };
  }
  if (state.official.dingYouUntilDay && state.profile.totalDays < state.official.dingYouUntilDay) {
    return { ok: false, reason: 'Đang chịu tang Đinh ưu không thể chạy chức', cost, successChance: 0 };
  }
  if (rank >= 9) {
    return { ok: false, reason: 'Đã đạt tột đỉnh Nhất phẩm', cost, successChance: 0 };
  }
  if (state.official.isHanhHam && rank >= 5) {
    return { ok: false, reason: 'Quyên quan hư hàm không thể chạy vượt trần Ngũ phẩm', cost, successChance: 0 };
  }
  const spec = getOfficialRankSpec(rank);
  const halfTenure = Math.floor((spec?.tenureDaysRequired ?? 1080) / 2);
  const elapsed = state.profile.totalDays - state.official.lastReviewDay;
  if (elapsed < halfTenure) {
    return {
      ok: false,
      reason: `Cần giữ chức ít nhất nửa nhiệm kỳ (còn ${halfTenure - elapsed} ngày) mới chạy đặc cách được`,
      cost,
      successChance: 0,
    };
  }
  const lastAttempt = state.eventCooldowns['bribe_promote'] ?? -99999;
  if (state.profile.totalDays - lastAttempt < 360) {
    return { ok: false, reason: 'Vừa chạy chức gần đây, cần đợi 1 năm tránh bị Ngự sử soi xét', cost, successChance: 0 };
  }
  let successChance = 0.65;
  if (state.official.faction === 'quyen_than' || state.official.faction === 'yem_dang') successChance += 0.15;
  if (state.world.worldState === 'binh_on') successChance -= 0.15;
  if (state.official.scandalRisk >= 50) successChance -= 0.2;
  successChance = Math.max(0.2, Math.min(0.9, successChance));

  if (state.assets.wealthCopper < cost) {
    return { ok: false, reason: `Cần ${cost}đ để đút lót Bộ Lại / Quyền thần`, cost, successChance };
  }
  return { ok: true, cost, successChance };
}

export function bribeForEarlyPromotion(state: ActiveLifeState): ActiveLifeState {
  const elig = canBribeForPromotion(state);
  if (!elig.ok || !state.official) return state;

  const off = state.official;
  const roll = mulberry32Next(state.prngState);
  let next: ActiveLifeState = {
    ...state,
    prngState: roll.nextState,
    eventCooldowns: { ...state.eventCooldowns, bribe_promote: state.profile.totalDays },
  };

  if (roll.value <= elig.successChance) {
    const nextRank = off.rank + 1;
    const nextSpec = getOfficialRankSpec(nextRank)!;
    const newTitle = nextSpec.titles[off.track];
    const { posting, nextPrng } = pickPostingByAvoidance(nextRank, off.track, next.prngState);
    next = applyEffects(
      { ...next, prngState: nextPrng },
      {
        copper: -elig.cost,
        scandal_risk: 20,
        infamy: 8,
        happiness: 8,
        milestone_title: `Đặc cách thăng ${nextSpec.gradeLabel} (Chạy chức)`,
      },
    );
    return {
      ...next,
      officialRank: nextRank,
      official: {
        ...off,
        rank: nextRank,
        title: newTitle,
        posting,
        tenureStartDay: next.profile.totalDays,
        lastReviewDay: next.profile.totalDays,
        scandalRisk: Math.min(100, off.scandalRisk + 20),
      },
      profile: { ...next.profile, currentRole: newTitle },
      logs: appendLog(
        next.logs,
        next.profile.totalDays,
        'warning',
        `Nhờ đút lót ${elig.cost}đ cho Bộ Lại/Quyền thần, bạn được đặc cách thăng lên ${nextSpec.gradeLabel} · ${newTitle} (Hiềm nghi +20)!`,
      ),
    };
  }

  // Failed bribe
  const exposed = off.scandalRisk >= 65;
  next = applyEffects(next, {
    copper: -elig.cost,
    scandal_risk: 22,
    imperial_favor: -10,
    official_rank_delta: exposed ? -1 : 0,
    infamy: 12,
    happiness: -12,
  });
  return {
    ...next,
    logs: appendLog(
      next.logs,
      next.profile.totalDays,
      'warning',
      exposed
        ? `Chạy chức thất bại và bị Ngự sử Thanh lưu tố ngược! Mất trắng ${elig.cost}đ và bị giáng 1 phẩm!`
        : `Đút lót chạy chức bất thành, mất trắng ${elig.cost}đ (Hiềm nghi +22, Thánh sủng -10).`,
    ),
  };
}
