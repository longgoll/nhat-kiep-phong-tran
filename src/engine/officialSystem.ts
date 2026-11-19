import {
  DAYS_PER_YEAR,
  getAgeYears,
  type ActiveLifeState,
  type HousingTier,
  type OfficialFaction,
  type OfficialPosting,
  type OfficialProfile,
  type OfficialTrack,
} from '../types/activeLife';
import { appendLog, applyEffects } from './effectApplier';
import { mulberry32Next } from './prng';

export interface OfficialRankSpec {
  rank: number; // 1..9
  gradeLabel: string; // Cửu phẩm .. Nhất phẩm
  titles: Record<OfficialTrack, string>;
  monthlySalaryCopper: number;
  monthlyRiceDau: number;
  maxLandProperties: number;
  maxMaids: number;
  maxGuards: number;
  allowedHousingTier: HousingTier;
  tenureDaysRequired: number;
  minSkillRequired: number; // education (van/hoan_quan) or martial (vo)
  minMeritRequired: number;
  minFameRequired: number;
  minImperialFavorRequired: number;
}

export const OFFICIAL_RANK_SPECS: OfficialRankSpec[] = [
  {
    rank: 1,
    gradeLabel: 'Cửu phẩm',
    titles: {
      van: 'Điển sử / Thư lại huyện',
      vo: 'Đội trưởng / Bách hộ',
      hoan_quan: 'Tiểu Thái giám',
    },
    monthlySalaryCopper: 450,
    monthlyRiceDau: 20,
    maxLandProperties: 1,
    maxMaids: 1,
    maxGuards: 1,
    allowedHousingTier: 'nha_tranh',
    tenureDaysRequired: 720,
    minSkillRequired: 20,
    minMeritRequired: 10,
    minFameRequired: 15,
    minImperialFavorRequired: 0,
  },
  {
    rank: 2,
    gradeLabel: 'Bát phẩm',
    titles: {
      van: 'Huyện thừa / Huấn đạo',
      vo: 'Phó Thiên hộ / Bả tổng',
      hoan_quan: 'Thủ lĩnh Thái giám',
    },
    monthlySalaryCopper: 750,
    monthlyRiceDau: 25,
    maxLandProperties: 2,
    maxMaids: 2,
    maxGuards: 2,
    allowedHousingTier: 'nha_gach',
    tenureDaysRequired: 720,
    minSkillRequired: 30,
    minMeritRequired: 22,
    minFameRequired: 35,
    minImperialFavorRequired: 10,
  },
  {
    rank: 3,
    gradeLabel: 'Thất phẩm',
    titles: {
      van: 'Tri huyện / Hàn lâm Biên tu',
      vo: 'Thiên hộ / Thủ bị',
      hoan_quan: 'Giám thừa Nội đình',
    },
    monthlySalaryCopper: 1200,
    monthlyRiceDau: 35,
    maxLandProperties: 3,
    maxMaids: 4,
    maxGuards: 4,
    allowedHousingTier: 'nha_gach',
    tenureDaysRequired: 1080,
    minSkillRequired: 42,
    minMeritRequired: 35,
    minFameRequired: 70,
    minImperialFavorRequired: 20,
  },
  {
    rank: 4,
    gradeLabel: 'Lục phẩm',
    titles: {
      van: 'Tri châu / Chủ sự Lục bộ',
      vo: 'Du kích / Chỉ huy Thiêm sự',
      hoan_quan: 'Thiếu giám',
    },
    monthlySalaryCopper: 1800,
    monthlyRiceDau: 45,
    maxLandProperties: 4,
    maxMaids: 6,
    maxGuards: 6,
    allowedHousingTier: 'phu_de',
    tenureDaysRequired: 1080,
    minSkillRequired: 52,
    minMeritRequired: 50,
    minFameRequired: 130,
    minImperialFavorRequired: 30,
  },
  {
    rank: 5,
    gradeLabel: 'Ngũ phẩm',
    titles: {
      van: 'Tri phủ / Lang trung',
      vo: 'Tham tướng / Chỉ huy sứ',
      hoan_quan: 'Đốc công Thái giám',
    },
    monthlySalaryCopper: 2600,
    monthlyRiceDau: 60,
    maxLandProperties: 6,
    maxMaids: 8,
    maxGuards: 8,
    allowedHousingTier: 'phu_de',
    tenureDaysRequired: 1080,
    minSkillRequired: 62,
    minMeritRequired: 65,
    minFameRequired: 220,
    minImperialFavorRequired: 42,
  },
  {
    rank: 6,
    gradeLabel: 'Tứ phẩm',
    titles: {
      van: 'Án sát sứ / Thiếu khanh',
      vo: 'Phó tướng / Phó Đô đốc',
      hoan_quan: 'Bỉnh bút Thái giám',
    },
    monthlySalaryCopper: 3800,
    monthlyRiceDau: 80,
    maxLandProperties: 8,
    maxMaids: 12,
    maxGuards: 12,
    allowedHousingTier: 'phu_de',
    tenureDaysRequired: 1080,
    minSkillRequired: 72,
    minMeritRequired: 80,
    minFameRequired: 360,
    minImperialFavorRequired: 55,
  },
  {
    rank: 7,
    gradeLabel: 'Tam phẩm',
    titles: {
      van: 'Bố chính sứ / Tuần phủ',
      vo: 'Tổng binh / Đô đốc Đồng tri',
      hoan_quan: 'Chưởng ấn Thái giám',
    },
    monthlySalaryCopper: 5500,
    monthlyRiceDau: 100,
    maxLandProperties: 10,
    maxMaids: 16,
    maxGuards: 16,
    allowedHousingTier: 'phu_de',
    tenureDaysRequired: 1080,
    minSkillRequired: 80,
    minMeritRequired: 95,
    minFameRequired: 550,
    minImperialFavorRequired: 68,
  },
  {
    rank: 8,
    gradeLabel: 'Nhị phẩm',
    titles: {
      van: 'Tổng đốc / Thượng thư Lục bộ',
      vo: 'Ngũ quân Đô đốc / Binh bộ Thượng thư',
      hoan_quan: 'Đề đốc Đông Xưởng',
    },
    monthlySalaryCopper: 8000,
    monthlyRiceDau: 130,
    maxLandProperties: 12,
    maxMaids: 20,
    maxGuards: 20,
    allowedHousingTier: 'phu_de',
    tenureDaysRequired: 1440,
    minSkillRequired: 88,
    minMeritRequired: 115,
    minFameRequired: 850,
    minImperialFavorRequired: 80,
  },
  {
    rank: 9,
    gradeLabel: 'Nhất phẩm',
    titles: {
      van: 'Tể tướng / Thái sư / Đại học sĩ',
      vo: 'Đại Nguyên soái / Thái úy',
      hoan_quan: 'Cửu Thiên Tuế',
    },
    monthlySalaryCopper: 12000,
    monthlyRiceDau: 180,
    maxLandProperties: 15,
    maxMaids: 24,
    maxGuards: 24,
    allowedHousingTier: 'phu_de',
    tenureDaysRequired: 1440,
    minSkillRequired: 94,
    minMeritRequired: 140,
    minFameRequired: 1200,
    minImperialFavorRequired: 90,
  },
];

export const COMMERCIAL_PROPERTY_IDS = new Set([
  'nha_tro_cho_thue',
  'ki_ot_cho_thue',
  'cua_hieu_gao',
  'phu_cho_thue',
  'xuong_gom',
  'thuyen_buon',
  'thuong_hoi_lien_tinh',
  'tuu_lau_kinh_ky',
]);

export const LAND_PROPERTY_IDS = new Set([
  'ruong_tu',
  'trang_vien_cho_thue',
  'thai_ap_ton_that',
]);

export const POSTING_LABELS: Record<OfficialPosting, string> = {
  kinh_do: 'Kinh đô (Nội triều / Lục bộ)',
  dong_bang: 'Phủ huyện Đồng bằng (Trù phú)',
  song_nuoc: 'Vùng Sông nước (Trị thủy / Đê điều)',
  bien_ai: 'Biên ải / Sơn cước (Gian khổ)',
};

export function getOfficialPostingLabel(track: OfficialTrack, posting: OfficialPosting): string {
  if (track === 'vo') {
    if (posting === 'kinh_do') return 'Cấm quân / Ngự lâm Kinh thành';
    if (posting === 'bien_ai') return 'Doanh trại Biên ải / Tiền tuyến (Cấm mang gia quyến)';
    return 'Trấn thủ Phủ thành / Đồn ải nội địa';
  }
  return POSTING_LABELS[posting];
}

export const FACTION_LABELS: Record<OfficialFaction, string> = {
  chua_dung_phe: 'Trung lập (Chưa đứng phe)',
  thanh_luu: 'Phe Thanh lưu (Sĩ phu)',
  quyen_than: 'Phe Quyền thần',
  yem_dang: 'Yêm đảng (Phe Hoạn quan)',
};

export function getOfficialRankSpec(rank: number): OfficialRankSpec | undefined {
  return OFFICIAL_RANK_SPECS.find((s) => s.rank === rank);
}

export function getOfficialTitle(rank: number, track: OfficialTrack = 'van'): string {
  if (rank <= 0) return 'Dân thường';
  if (rank >= 10) return 'Khai quốc Hoàng đế';
  const spec = getOfficialRankSpec(rank);
  return spec ? spec.titles[track] : 'Quan viên';
}

export function getOfficialGradeAndTitle(state: ActiveLifeState): string {
  if (state.officialRank <= 0) return 'Dân thường';
  if (state.officialRank >= 10) return 'Khai quốc Hoàng đế';
  const track: OfficialTrack = state.official?.track ?? (state.flags.includes('thai_giam') ? 'hoan_quan' : 'van');
  const spec = getOfficialRankSpec(state.officialRank);
  if (!spec) return 'Quan viên';
  return `${spec.gradeLabel} · ${spec.titles[track]}`;
}

export function pickPostingByAvoidance(
  rank: number,
  track: OfficialTrack,
  prngState: number,
): { posting: OfficialPosting; nextPrng: number } {
  if (track === 'hoan_quan') {
    return { posting: 'kinh_do', nextPrng: prngState };
  }
  const roll = mulberry32Next(prngState);
  if (rank >= 7) {
    return { posting: roll.value < 0.65 ? 'kinh_do' : 'dong_bang', nextPrng: roll.nextState };
  }
  if (track === 'vo') {
    if (roll.value < 0.55) return { posting: 'bien_ai', nextPrng: roll.nextState };
    if (roll.value < 0.8) return { posting: 'dong_bang', nextPrng: roll.nextState };
    return { posting: 'kinh_do', nextPrng: roll.nextState };
  }
  // Civil local postings obey Law of Avoidance (Hồi Tỵ)
  if (rank >= 5 && roll.value < 0.35) {
    return { posting: 'kinh_do', nextPrng: roll.nextState };
  }
  if (roll.value < 0.45) return { posting: 'dong_bang', nextPrng: roll.nextState };
  if (roll.value < 0.78) return { posting: 'song_nuoc', nextPrng: roll.nextState };
  return { posting: 'bien_ai', nextPrng: roll.nextState };
}

export function createOfficialProfile(
  state: ActiveLifeState,
  track: OfficialTrack,
  rank: number,
  isHanhHam = false,
): { profile: OfficialProfile; nextPrng: number } {
  const { posting, nextPrng } = pickPostingByAvoidance(rank, track, state.prngState);
  const spec = getOfficialRankSpec(rank) ?? OFFICIAL_RANK_SPECS[0];
  const initialMaids = rank >= 3 ? Math.min(2, spec.maxMaids) : 0;
  const initialGuards = rank >= 3 ? Math.min(2, spec.maxGuards) : 0;

  return {
    nextPrng,
    profile: {
      track,
      rank,
      title: spec.titles[track],
      posting,
      tenureStartDay: state.profile.totalDays,
      lastReviewDay: state.profile.totalDays,
      merit: Math.min(20, Math.round((state.stats.education + state.stats.martial) / 10)),
      publicTrust: 10,
      imperialFavor: track === 'hoan_quan' || state.profile.originClass === 'hoang_toc' ? 25 : 15,
      scandalRisk: isHanhHam ? 10 : 0,
      faction: track === 'hoan_quan' ? 'yem_dang' : 'chua_dung_phe',
      familyAccompanied: false,
      maidsCount: initialMaids,
      guardsCount: initialGuards,
      hasAdvisor: false,
      proxyBusinessIds: [],
      isHanhHam,
    },
  };
}

export function getOfficialMonthlyUpkeepCopper(official: OfficialProfile): number {
  const maidCost = official.maidsCount * 120;
  const guardCost = official.guardsCount * 180;
  const advisorCost = official.hasAdvisor ? 600 : 0;
  const familyTravelExtra = official.familyAccompanied ? 250 : 0;
  return maidCost + guardCost + advisorCost + familyTravelExtra;
}

export function getRebellionMonthlyUpkeepCopper(state: ActiveLifeState): number {
  const armyPower = state.rebellion?.armyPower ?? 0;
  if (armyPower <= 0) return 0;
  return armyPower * 45;
}

export function getOfficialMaxLandCount(state: ActiveLifeState): number {
  if (state.officialRank <= 0) return 99;
  const spec = getOfficialRankSpec(state.officialRank);
  return spec?.maxLandProperties ?? 1;
}

export function checkOfficialPropertyRule(
  state: ActiveLifeState,
  propertyId: string,
  useProxy: boolean,
): { allowed: boolean; reason?: string; isProxyViolationRisk: boolean } {
  if (state.officialRank <= 0) {
    return { allowed: true, isProxyViolationRisk: false };
  }

  if (COMMERCIAL_PROPERTY_IDS.has(propertyId)) {
    if (!useProxy) {
      return {
        allowed: false,
        reason: 'Luật triều đình cấm quan đương chức trực tiếp buôn bán ("Dữ dân tranh lợi"). Có thể nhờ gia nhân đứng tên ngầm.',
        isProxyViolationRisk: false,
      };
    }
    return { allowed: true, isProxyViolationRisk: true };
  }

  if (LAND_PROPERTY_IDS.has(propertyId)) {
    const ownedLandCount = state.assets.properties.filter((id) => LAND_PROPERTY_IDS.has(id)).length;
    const maxLand = getOfficialMaxLandCount(state);
    if (ownedLandCount >= maxLand) {
      return {
        allowed: false,
        reason: `Vượt hạn điền phẩm hàm hiện tại (tối đa ${maxLand} điền sản).`,
        isProxyViolationRisk: false,
      };
    }
    if (propertyId === 'trang_vien_cho_thue' && state.officialRank < 4) {
      return {
        allowed: false,
        reason: 'Cần đạt Lục phẩm trở lên mới được lập Trang viên.',
        isProxyViolationRisk: false,
      };
    }
    if (propertyId === 'thai_ap_ton_that' && state.officialRank < 7) {
      return {
        allowed: false,
        reason: 'Cần đạt Tam phẩm trở lên mới được lập Thái ấp.',
        isProxyViolationRisk: false,
      };
    }
  }

  return { allowed: true, isProxyViolationRisk: false };
}

export function checkHousingTiemLe(
  state: ActiveLifeState,
  targetTier: HousingTier,
): { allowed: boolean; reason?: string } {
  if (state.officialRank <= 0 || state.officialRank >= 10) return { allowed: true };
  const spec = getOfficialRankSpec(state.officialRank);
  if (!spec) return { allowed: true };
  const order: Record<HousingTier, number> = { gam_cau: 0, nha_tranh: 1, nha_gach: 2, phu_de: 3 };
  if (order[targetTier] > order[spec.allowedHousingTier]) {
    return {
      allowed: false,
      reason: `Phẩm ${spec.gradeLabel} không được ở vượt cấp (${targetTier === 'phu_de' ? 'Phủ đệ' : 'Nhà gạch'}), phạm tội Tiếm lễ!`,
    };
  }
  return { allowed: true };
}

export function canRequestKhaoKhoa(state: ActiveLifeState): { ok: boolean; reason?: string; daysRemaining: number } {
  if (state.officialRank <= 0 || !state.official) {
    return { ok: false, reason: 'Chưa có chức vị triều đình', daysRemaining: 0 };
  }
  if (state.official.dingYouUntilDay && state.profile.totalDays < state.official.dingYouUntilDay) {
    const left = Math.ceil((state.official.dingYouUntilDay - state.profile.totalDays) / DAYS_PER_YEAR);
    return { ok: false, reason: `Đang chịu tang Đinh ưu (còn ~${left} năm)`, daysRemaining: state.official.dingYouUntilDay - state.profile.totalDays };
  }
  if (state.officialRank >= 9) {
    return { ok: false, reason: 'Đã đạt tột đỉnh Nhất phẩm triều đình', daysRemaining: 0 };
  }
  if (state.official.isHanhHam && state.officialRank >= 5) {
    return { ok: false, reason: 'Xuất thân Quyên quan hư hàm, trần thăng tiến tối đa là Ngũ phẩm', daysRemaining: 0 };
  }

  const currentSpec = getOfficialRankSpec(state.officialRank);
  const requiredDays = currentSpec?.tenureDaysRequired ?? 1080;
  const elapsed = state.profile.totalDays - state.official.lastReviewDay;
  if (elapsed < requiredDays) {
    return {
      ok: false,
      reason: `Chưa đủ nhiệm kỳ Khảo khóa (còn ${requiredDays - elapsed} ngày)`,
      daysRemaining: requiredDays - elapsed,
    };
  }
  return { ok: true, daysRemaining: 0 };
}

export function evaluateKhaoKhoa(state: ActiveLifeState): ActiveLifeState {
  const elig = canRequestKhaoKhoa(state);
  if (!elig.ok || !state.official) return state;

  const off = state.official;
  const nextRank = off.rank + 1;
  const nextSpec = getOfficialRankSpec(nextRank);
  if (!nextSpec) return state;

  const relevantSkill = off.track === 'vo' ? state.stats.martial : state.stats.education;
  const advisorBonus = off.hasAdvisor ? 8 : 0;
  // Bảo cử (Patronage): from Ngũ phẩm (5) upward, lacking faction & relationships penalizes review
  const patronagePenalty = nextRank >= 5 && off.faction === 'chua_dung_phe' && state.stats.relationships < 55 ? 18 : 0;
  const score =
    off.merit +
    Math.max(-20, Math.min(25, Math.round(off.publicTrust * 0.25))) +
    Math.round(off.imperialFavor * 0.4) +
    advisorBonus -
    patronagePenalty -
    Math.round(off.scandalRisk * 0.8);

  const canPromoteByStats =
    relevantSkill >= nextSpec.minSkillRequired &&
    off.merit >= nextSpec.minMeritRequired &&
    state.stats.fame >= nextSpec.minFameRequired &&
    off.imperialFavor >= nextSpec.minImperialFavorRequired &&
    off.scandalRisk < 65;

  // Hạ khảo if scandal is high or merit/trust is terrible
  if (off.scandalRisk >= 75 || off.publicTrust <= -40 || score < 20) {
    if (off.rank <= 1) {
      const cleanedFlags = state.flags.filter((f) => f !== 'dang_lam_quan');
      const next = applyEffects(state, {
        fame: -15,
        happiness: -20,
        milestone_title: 'Bị Hạ khảo cách chức đuổi về quê',
      });
      return {
        ...next,
        officialRank: 0,
        official: undefined,
        flags: cleanedFlags,
        profile: { ...next.profile, currentRole: 'Dân thường' },
        logs: appendLog(next.logs, next.profile.totalDays, 'warning', 'Kỳ Khảo khóa bị đánh giá Hạ khảo, bạn bị cách chức thu ấn!'),
      };
    }

    const demotedRank = off.rank - 1;
    const demotedSpec = getOfficialRankSpec(demotedRank)!;
    const demotedTitle = demotedSpec.titles[off.track];
    const next = applyEffects(state, {
      fame: -10,
      happiness: -15,
      milestone_title: `Khảo khóa giáng chức xuống ${demotedSpec.gradeLabel}`,
    });
    return {
      ...next,
      officialRank: demotedRank,
      official: {
        ...off,
        rank: demotedRank,
        title: demotedTitle,
        lastReviewDay: next.profile.totalDays,
        tenureStartDay: next.profile.totalDays,
      },
      profile: { ...next.profile, currentRole: demotedTitle },
      logs: appendLog(next.logs, next.profile.totalDays, 'warning', `Kỳ Khảo khóa bị đánh giá Hạ khảo, bạn bị giáng xuống ${demotedSpec.gradeLabel} (${demotedTitle}).`),
    };
  }

  // Thượng khảo -> Check Khuyết vị (Vacancy Gate) for Tam phẩm (7) .. Nhất phẩm (9)
  if (canPromoteByStats && score >= nextSpec.minMeritRequired + 15) {
    let workingPrng = state.prngState;
    if (nextRank >= 7) {
      const baseVacancy = nextRank === 7 ? 0.65 : nextRank === 8 ? 0.45 : 0.25;
      const favorBonus = off.imperialFavor >= 80 ? 0.15 : 0;
      const factionBonus = off.faction !== 'chua_dung_phe' ? 0.12 : 0;
      const warBonus = state.world.worldState === 'chien_tranh' ? 0.15 : 0;
      const vacancyChance = Math.min(0.9, baseVacancy + favorBonus + factionBonus + warBonus);
      const vacancyRoll = mulberry32Next(workingPrng);
      workingPrng = vacancyRoll.nextState;
      if (vacancyRoll.value > vacancyChance) {
        const bonusCopper = off.rank * 800;
        const next = applyEffects(
          { ...state, prngState: workingPrng },
          { copper: bonusCopper, fame: 5 },
        );
        return {
          ...next,
          official: {
            ...off,
            lastReviewDay: next.profile.totalDays,
            imperialFavor: Math.min(100, off.imperialFavor + 3),
          },
          logs: appendLog(
            next.logs,
            next.profile.totalDays,
            'event',
            `Khảo khóa đạt Thượng khảo nhưng triều đình chưa có khuyết vị ${nextSpec.gradeLabel}! Bạn được Gia hàm thưởng ${bonusCopper}đ và đợi kỳ sau.`,
          ),
        };
      }
    }

    const newTitle = nextSpec.titles[off.track];
    const { posting, nextPrng } = pickPostingByAvoidance(nextRank, off.track, workingPrng);
    const next = applyEffects(
      { ...state, prngState: nextPrng },
      {
        fame: 12,
        happiness: 12,
        milestone_title: `Thăng ${nextSpec.gradeLabel}: ${newTitle}`,
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
      },
      profile: { ...next.profile, currentRole: newTitle },
      logs: appendLog(
        next.logs,
        next.profile.totalDays,
        'event',
        `Khảo khóa đạt Thượng khảo! Triều đình bổ bạn vào khuyết vị ${nextSpec.gradeLabel} · ${newTitle} (Nhiệm sở: ${getOfficialPostingLabel(off.track, posting)}).`,
      ),
    };
  }

  // Trung khảo -> Keep rank, reset review timer
  return {
    ...state,
    official: {
      ...off,
      lastReviewDay: state.profile.totalDays,
    },
    logs: appendLog(
      state.logs,
      state.profile.totalDays,
      'event',
      `Kỳ Khảo khóa đạt Trung khảo: giữ nguyên chức ${off.title}. Cần thêm Chính tích (${off.merit}/${nextSpec.minMeritRequired}), Thánh sủng (${off.imperialFavor}/${nextSpec.minImperialFavorRequired}) hoặc Thanh danh để được thăng ${nextSpec.gradeLabel}.`,
    ),
  };
}

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
