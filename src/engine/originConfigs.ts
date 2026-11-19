import type { LifestyleTier, OriginClass } from '../types/activeLife';

export interface OriginCoreConfig {
  wealthRange: [number, number];
  baseStats: {
    health: number;
    happiness: number;
    relationships: number;
    education: number;
    martial: number;
    craftTrade: number;
    fame: number;
  };
  defaultLifestyle: LifestyleTier;
  declinedLifestyle: LifestyleTier;
  defaultChildhoodFocus: string;
  innateInterests: string[];
  teenStarterSchedule: {
    morning: string;
    afternoon: string;
    evening: string;
  };
}

export const ORIGIN_CORE_CONFIG: Record<OriginClass, OriginCoreConfig> = {
  ban_nong: {
    wealthRange: [40, 150],
    baseStats: {
      health: 70,
      happiness: 62,
      relationships: 60,
      education: 0,
      martial: 0,
      craftTrade: 0,
      fame: 0,
    },
    defaultLifestyle: 'chao_loang',
    declinedLifestyle: 'chao_loang',
    defaultChildhoodFocus: 'giup_nha',
    innateInterests: ['dien_vien'],
    teenStarterSchedule: {
      morning: 'act_nghi_ngoi',
      afternoon: 'act_nghi_ngoi',
      evening: 'act_nghi_ngoi',
    },
  },
  thu_cong: {
    wealthRange: [800, 2200],
    baseStats: {
      health: 68,
      happiness: 64,
      relationships: 56,
      education: 0,
      martial: 0,
      craftTrade: 6,
      fame: 0,
    },
    defaultLifestyle: 'com_rau',
    declinedLifestyle: 'chao_loang',
    defaultChildhoodFocus: 'so_thich',
    innateInterests: ['thu_cong'],
    teenStarterSchedule: {
      morning: 'act_nghi_ngoi',
      afternoon: 'act_nghi_ngoi',
      evening: 'act_nghi_ngoi',
    },
  },
  dia_chu: {
    wealthRange: [15000, 40000],
    baseStats: {
      health: 68,
      happiness: 66,
      relationships: 52,
      education: 2,
      martial: 0,
      craftTrade: 0,
      fame: 3,
    },
    defaultLifestyle: 'thit_ca',
    declinedLifestyle: 'com_rau',
    defaultChildhoodFocus: 'hoc_tap',
    innateInterests: ['thuong_buon'],
    teenStarterSchedule: {
      morning: 'act_nghi_ngoi',
      afternoon: 'act_nghi_ngoi',
      evening: 'act_nghi_ngoi',
    },
  },
  quan_lai: {
    wealthRange: [45000, 110000],
    baseStats: {
      health: 65,
      happiness: 64,
      relationships: 48,
      education: 4,
      martial: 0,
      craftTrade: 0,
      fame: 6,
    },
    defaultLifestyle: 'thit_ca',
    declinedLifestyle: 'com_rau',
    defaultChildhoodFocus: 'hoc_tap',
    innateInterests: ['kinh_su'],
    teenStarterSchedule: {
      morning: 'act_nghi_ngoi',
      afternoon: 'act_nghi_ngoi',
      evening: 'act_nghi_ngoi',
    },
  },
  hoang_toc: {
    wealthRange: [500000, 1200000],
    baseStats: {
      health: 58,
      happiness: 62,
      relationships: 42,
      education: 5,
      martial: 0,
      craftTrade: 0,
      fame: 12,
    },
    defaultLifestyle: 'thit_ca',
    declinedLifestyle: 'com_rau',
    defaultChildhoodFocus: 'hoc_tap',
    innateInterests: ['kinh_su'],
    teenStarterSchedule: {
      morning: 'act_nghi_ngoi',
      afternoon: 'act_nghi_ngoi',
      evening: 'act_nghi_ngoi',
    },
  },
};
