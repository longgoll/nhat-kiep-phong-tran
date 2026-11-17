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
    wealthRange: [30, 120],
    baseStats: {
      health: 76,
      happiness: 68,
      relationships: 68,
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
      morning: 'act_lam_thue_nong_vu',
      afternoon: 'act_lam_thue_nong_vu',
      evening: 'act_nghi_ngoi',
    },
  },
  thu_cong: {
    wealthRange: [400, 1100],
    baseStats: {
      health: 72,
      happiness: 70,
      relationships: 62,
      education: 0,
      martial: 0,
      craftTrade: 8,
      fame: 0,
    },
    defaultLifestyle: 'com_rau',
    declinedLifestyle: 'chao_loang',
    defaultChildhoodFocus: 'so_thich',
    innateInterests: ['thu_cong'],
    teenStarterSchedule: {
      morning: 'act_phu_ban_hang',
      afternoon: 'act_phu_ban_hang',
      evening: 'act_nghi_ngoi',
    },
  },
  dia_chu: {
    wealthRange: [5000, 15000],
    baseStats: {
      health: 74,
      happiness: 74,
      relationships: 58,
      education: 6,
      martial: 0,
      craftTrade: 0,
      fame: 6,
    },
    defaultLifestyle: 'thit_ca',
    declinedLifestyle: 'com_rau',
    defaultChildhoodFocus: 'hoc_tap',
    innateInterests: ['thuong_buon'],
    teenStarterSchedule: {
      morning: 'act_buon_ban_nho',
      afternoon: 'act_tu_hoc_chu',
      evening: 'act_nghi_ngoi',
    },
  },
  quan_lai: {
    wealthRange: [15000, 40000],
    baseStats: {
      health: 70,
      happiness: 72,
      relationships: 54,
      education: 12,
      martial: 0,
      craftTrade: 0,
      fame: 16,
    },
    defaultLifestyle: 'thit_ca',
    declinedLifestyle: 'com_rau',
    defaultChildhoodFocus: 'hoc_tap',
    innateInterests: ['kinh_su'],
    teenStarterSchedule: {
      morning: 'act_tu_hoc_chu',
      afternoon: 'act_luyen_vo_cong',
      evening: 'act_doc_sach_den_dau',
    },
  },
  hoang_toc: {
    wealthRange: [80000, 200000],
    baseStats: {
      health: 60,
      happiness: 68,
      relationships: 45,
      education: 14,
      martial: 0,
      craftTrade: 0,
      fame: 32,
    },
    defaultLifestyle: 'thit_ca',
    declinedLifestyle: 'com_rau',
    defaultChildhoodFocus: 'hoc_tap',
    innateInterests: ['kinh_su'],
    teenStarterSchedule: {
      morning: 'act_tu_hoc_chu',
      afternoon: 'act_luyen_vo_cong',
      evening: 'act_doc_sach_den_dau',
    },
  },
};
