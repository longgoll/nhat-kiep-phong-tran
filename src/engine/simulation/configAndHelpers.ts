import {
  DAYS_PER_SEASON,
  DAYS_PER_YEAR,
  type ActiveLifeState,
  type HousingTier,
  type LifestyleTier,
  type WorldState,
} from '../../types/activeLife';
import type { GameEventDef } from '../../types/dsl';

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

export const LIFESTYLE_TABLE: Record<
  LifestyleTier,
  { rice: number; copper: number; stamina: number; health: number; happiness: number; fame?: number }
> = {
  nhin_doi: { rice: 0, copper: 0, stamina: 0, health: -1.8, happiness: -1.2 },
  chao_loang: { rice: 0.5, copper: 0, stamina: 5, health: -0.04, happiness: -0.05 },
  com_rau: { rice: 0.8, copper: 2, stamina: 15, health: 0, happiness: 0 },
  thit_ca: { rice: 1.5, copper: 30, stamina: 30, health: 0.015, happiness: 0.012 },
  son_hao: { rice: 2.0, copper: 120, stamina: 40, health: 0.025, happiness: 0.02, fame: 0.015 },
};

export const HOUSING_DAILY_UPKEEP: Record<HousingTier, number> = {
  gam_cau: 0,
  nha_tranh: 1,
  nha_gach: 5,
  phu_de: 18,
};

export const WORLD_LIVING_COST_MULT: Record<ActiveLifeState['world']['worldState'], number> = {
  binh_on: 1.0,
  dich_benh: 1.2,
  mat_mua: 1.35,
  chien_tranh: 1.5,
};

export const HOUSING_SLEEP_RECOVERY: Record<
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
