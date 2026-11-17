import type { Gender, OriginClass } from './activeLife';

export interface TombstoneRecord {
  id: string;
  seed: number;
  fullName: string;
  gender: Gender;
  originClass: OriginClass;
  ageYears: number;
  deathReason: string;
  titleAwarded: string;
  finalNetWorthCopper: number;
  finalFame: number;
  createdAt: string;
}

export type DashboardTheme = 'default' | 'giay_do' | 'muc_tau' | 'son_thep';
export type ColorMode = 'dark' | 'light';

export interface LegacyArchiveState {
  schemaVersion: number;
  totalLives: number;
  originCounts: Record<OriginClass, number>;
  unlockedCodexIds: string[];
  unlockedThemes: DashboardTheme[];
  activeTheme: DashboardTheme;
  colorMode?: ColorMode;
  tombstones: TombstoneRecord[]; // Max 50
}
