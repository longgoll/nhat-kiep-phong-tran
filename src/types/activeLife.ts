export type OriginClass = 'ban_nong' | 'thu_cong' | 'dia_chu' | 'quan_lai' | 'hoang_toc';
export type Gender = 'male' | 'female';
export type TimeSlot = 'morning' | 'afternoon' | 'evening' | 'night';
export type LifestyleTier = 'nhin_doi' | 'chao_loang' | 'com_rau' | 'thit_ca';
export type HousingTier = 'gam_cau' | 'nha_tranh' | 'nha_gach' | 'phu_de';
export type Season = 'spring' | 'summer' | 'autumn' | 'winter';
export type WorldState = 'binh_on' | 'mat_mua' | 'chien_tranh' | 'dich_benh';

export interface NPC {
  id: string;
  name: string;
  gender: Gender;
  relation: 'parent' | 'sibling' | 'spouse' | 'child' | 'friend' | 'rival' | 'mentor' | 'household';
  affinity: number; // -100 to +100
  isAlive: boolean;
  role: string;
  age?: number;
}

export interface CohortPeer {
  id: string;
  name: string;
  gender: Gender;
  originClass: OriginClass;
  originLabel: string;
  birthPlace: string;
  circumstanceSummary: string;
  deathAge?: number;
}

export interface FallbackRule {
  id: string;
  stat: 'health' | 'happiness' | 'stamina' | 'rice' | 'wealthCopper';
  operator: '<' | '<=';
  threshold: number;
  targetSlot: TimeSlot;
  fallbackActionId: string;
}

export interface MilestoneRecord {
  totalDays: number;
  ageYears: number;
  title: string;
  netWorthInCopper: number;
  fame: number;
}

export interface LogEntry {
  day: number;
  category: 'birth' | 'childhood' | 'survival' | 'study' | 'event' | 'warning';
  text: string;
  tone?: 'positive' | 'negative' | 'milestone' | 'neutral';
  subNote?: string;
}

export type BirthOrder = 'con_mot' | 'con_truong' | 'con_thu' | 'con_ut';
export type FamilyLivingTier = 'tung_thieu' | 'du_an' | 'kha_gia' | 'sung_tuc' | 'hoang_gia';
export type LifeFocusId = 'cong_danh' | 'can_bang' | 'gia_dinh' | 'suc_khoe' | 'tu_than' | 'so_thich';
export type GiftEtiquetteTier = 'chu_dao' | 'tuy_kha_nang' | 'chi_den_chia_vui';

export interface FamilyContext {
  fatherOccupation: string;
  fatherOccupationLabel: string;
  motherOccupation: string;
  motherOccupationLabel: string;
  circumstance: string;
  circumstanceLabel: string;
  birthOrder: BirthOrder;
  birthOrderLabel: string;
  familyWealthCopper: number;
  familyLivingTier: FamilyLivingTier;
  birthPlace?: string;
  fatherAgeAtBirth?: number;
  motherAgeAtBirth?: number;
  motherStatus?: 'chinh_that' | 'thu_that' | 'phi_tan';
  servantCount?: number;
  familyAssetsSummary?: string[];
}

export interface AnnualFinanceLedger {
  workIncomeCopper: number;
  propertyIncomeCopper: number;
  livingExpenseCopper: number;
  otherExpenseCopper: number;
}

export interface ActiveLifeState {
  schemaVersion: number;
  seed: number;
  prngState: number;
  isAlive: boolean;
  deathReason?: string;

  profile: {
    fullName: string;
    gender: Gender;
    originClass: OriginClass;
    currentRole: string;
    totalDays: number; // Single Source of Truth: 1 year = 360 days
  };

  family?: FamilyContext;
  traits?: string[];
  interests?: string[];
  hobbyLevels?: Record<string, number>;
  actionCooldowns?: Record<string, number>;
  autoActions?: string[];

  stats: {
    health: number; // 0 - 100
    happiness: number; // 0 - 100
    relationships: number; // 0 - 100
    education: number; // 0 - 100
    stamina: number; // 0 - maxStamina
    maxStamina: number;
    martial: number;
    craftTrade: number;
    fame: number;
    infamy: number;
  };

  assets: {
    wealthCopper: number; // Single Source of Truth (1 silver = 1000, 1 gold = 10000)
    goldReserveCopper?: number; // Vàng/bạc tích trữ chống mất mùa, chiến tranh
    rice: number; // unit: dau (10 dau = 1 thach)
    housing: HousingTier;
    properties: string[];
  };

  finance?: {
    currentYear: AnnualFinanceLedger;
    lastYear?: AnnualFinanceLedger;
    lastYearNetWorthCopper?: number;
  };

  world: {
    dynastyName: string;
    yearInEra: number;
    season: Season;
    ricePriceInCopper: number;
    worldState: WorldState;
  };

  schedule: {
    childhoodFocus?: string;
    morning: string;
    afternoon: string;
    evening: string;
    night: string;
    lifestyle: LifestyleTier;
    lifeFocus: string;
    giftEtiquette?: GiftEtiquetteTier;
    fallbackRules: FallbackRule[];
    autoBuyRice: boolean;
  };

  npcs: NPC[];
  cohortPeers?: CohortPeer[];
  flags: string[];
  officialRank: number; // 0: Dân thường, 1: Tri huyện, 2: Tri phủ, 3: Tuần phủ, 4: Thượng thư, 5: Tể tướng, 6: Khai quốc Hoàng đế
  exposureRisk: number; // 0 - 100 cho cơ chế Nữ cải nam trang
  rebellion: {
    treasuryCopper: number;
    armyPower: number;
  };
  delayedEvents: Array<{ eventId: string; triggerDay: number }>;
  eventCooldowns: Record<string, number>;
  milestones: MilestoneRecord[];
  yearlyHappiness?: Record<number, number>;
  logs: LogEntry[];
}

export const DAYS_PER_YEAR = 360;
export const DAYS_PER_SEASON = 90;
export const DAYS_PER_MONTH = 30;

export function getAgeYears(totalDays: number): number {
  return Math.floor(totalDays / DAYS_PER_YEAR);
}

export function getSeasonFromDays(totalDays: number): Season {
  const dayOfYear = totalDays % DAYS_PER_YEAR;
  const idx = Math.floor(dayOfYear / DAYS_PER_SEASON);
  const seasons: Season[] = ['spring', 'summer', 'autumn', 'winter'];
  return seasons[idx] ?? 'spring';
}
