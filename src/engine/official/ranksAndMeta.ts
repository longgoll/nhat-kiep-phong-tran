import {
  type ActiveLifeState,
  type HousingTier,
  type OfficialFaction,
  type OfficialPosting,
  type OfficialProfile,
  type OfficialTrack,
} from '../../types/activeLife';
import { mulberry32Next } from '../prng';

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

const CAPITAL_PLACE_KEYWORDS = ['kinh thành', 'tràng an', 'thăng long', 'tử cấm thành'];

/**
 * Checks whether the assigned official posting is right in the character's hometown/capital
 * so they do not have to leave their family estate to take office.
 */
export function isHomePostingAtBirthPlace(
  birthPlace: string | undefined,
  posting: OfficialPosting,
): boolean {
  if (posting !== 'kinh_do' || !birthPlace) return false;
  const normalized = birthPlace.toLowerCase();
  return CAPITAL_PLACE_KEYWORDS.some((kw) => normalized.includes(kw));
}

export function isOfficialPostedAway(
  state: Pick<ActiveLifeState, 'officialRank' | 'official' | 'family'>,
): boolean {
  if (state.officialRank <= 0 || !state.official) return false;
  return !isHomePostingAtBirthPlace(state.family?.birthPlace, state.official.posting);
}

export function getOfficialShortPostingPlace(
  track: OfficialTrack,
  posting: OfficialPosting,
): string {
  if (posting === 'kinh_do') return 'Kinh thành';
  if (posting === 'dong_bang') return 'Phủ huyện Đồng bằng';
  if (posting === 'song_nuoc') return 'Vùng Sông nước';
  return track === 'vo' ? 'Doanh trại Biên ải' : 'Biên ải / Sơn cước';
}

export function getOfficialResidenceLabel(
  state: Pick<ActiveLifeState, 'officialRank' | 'official'>,
): string {
  if (state.officialRank <= 0 || !state.official) return '';
  const { track, posting, rank } = state.official;
  if (track === 'vo' && posting === 'bien_ai') {
    return rank >= 6 ? 'Tướng phủ Tiền tuyến' : 'Doanh trại Biên ải';
  }
  if (track === 'hoan_quan') {
    return rank >= 6 ? 'Phủ Nội giám Kinh thành' : 'Nội đình Công đường';
  }
  if (rank >= 7) return 'Dinh thự Đại thần';
  if (rank >= 4) return 'Phủ nha Quan viên';
  return 'Tư thất Nha môn';
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
