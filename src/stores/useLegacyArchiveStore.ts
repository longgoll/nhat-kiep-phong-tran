import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ActiveLifeState } from '../types/activeLife';
import type { ColorMode, DashboardTheme, LegacyArchiveState, TombstoneRecord } from '../types/legacy';
import { getAgeYears } from '../types/activeLife';

const MAX_TOMBSTONES = 50;

export interface CodexEntryDef {
  id: string;
  title: string;
  description: string;
  rarity: 'Thường' | 'Hiếm' | 'Truyền thuyết';
}

export const CODEX_CATALOG: CodexEntryDef[] = [
  {
    id: 'codex_ban_nong_tho',
    title: 'Lão Nông Tri Điền',
    description: 'Xuất thân Bần nông và sống thọ từ 60 tuổi trở lên.',
    rarity: 'Hiếm',
  },
  {
    id: 'codex_trang_nguyen',
    title: 'Bảng Vàng Đệ Nhất',
    description: 'Vượt qua Thi Hương, Thi Hội và đỗ Trạng nguyên ở Điện thí.',
    rarity: 'Truyền thuyết',
  },
  {
    id: 'codex_nu_quan',
    title: 'Nữ Lưu Hào Kiệt',
    description: 'Nữ cải nam trang làm quan và được Hoàng thượng đặc xá.',
    rarity: 'Truyền thuyết',
  },
  {
    id: 'codex_cu_phu',
    title: 'Phú Khả Địch Quốc',
    description: 'Tích lũy tổng tài sản từ 10 Vàng (100.000 đồng) trở lên.',
    rarity: 'Hiếm',
  },
  {
    id: 'codex_hoang_de',
    title: 'Khai Quốc Đế Vương',
    description: 'Phất cờ khởi nghĩa thành công, lập nên triều đại mới.',
    rarity: 'Truyền thuyết',
  },
  {
    id: 'codex_xu_tram',
    title: 'Pháp Trường Đẫm Máu',
    description: 'Kết thúc cuộc đời trên pháp trường vì tội Khi quân hoặc Mưu phản.',
    rarity: 'Thường',
  },
];

export const THEME_LABELS: Record<DashboardTheme, { name: string; unlockHint: string; wrapperClass: string }> = {
  default: {
    name: 'Mặc định (Đêm Trầm)',
    unlockHint: 'Mở sẵn',
    wrapperClass: 'bg-stone-950 text-stone-100',
  },
  giay_do: {
    name: 'Giấy Dó Cổ',
    unlockHint: 'Sống trọn vẹn ít nhất 1 kiếp',
    wrapperClass: 'bg-[#1f1b16] text-amber-50',
  },
  muc_tau: {
    name: 'Mực Tàu Thủy Mặc',
    unlockHint: 'Sống ít nhất 3 kiếp hoặc đỗ Tiến sĩ',
    wrapperClass: 'bg-[#0d1117] text-slate-100',
  },
  son_thep: {
    name: 'Son Thếp Hoàng Gia',
    unlockHint: 'Đạt Thanh danh >= 80 hoặc Khai quốc Hoàng đế',
    wrapperClass: 'bg-[#210d0f] text-amber-100',
  },
};

export function getThemeWrapperClass(theme: DashboardTheme, colorMode: ColorMode = 'dark'): string {
  if (colorMode === 'light') {
    return 'bg-stone-950 text-stone-100';
  }
  return THEME_LABELS[theme]?.wrapperClass ?? 'bg-stone-950 text-stone-100';
}

interface LegacyArchiveStore extends LegacyArchiveState {
  recordCompletedLife: (life: ActiveLifeState, titleAwarded: string) => void;
  setActiveTheme: (theme: DashboardTheme) => void;
  setColorMode: (mode: ColorMode) => void;
  toggleColorMode: () => void;
}

const initialState: LegacyArchiveState = {
  schemaVersion: 1,
  totalLives: 0,
  originCounts: {
    ban_nong: 0,
    thu_cong: 0,
    dia_chu: 0,
    quan_lai: 0,
    hoang_toc: 0,
  },
  unlockedCodexIds: [],
  unlockedThemes: ['default'],
  activeTheme: 'default',
  colorMode: 'dark',
  tombstones: [],
};

export const useLegacyArchiveStore = create<LegacyArchiveStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      recordCompletedLife: (life: ActiveLifeState, titleAwarded: string) => {
        const state = get();
        const ageYears = getAgeYears(life.profile.totalDays);
        const netWorth =
          life.assets.wealthCopper + Math.round(life.assets.rice * life.world.ricePriceInCopper);

        const tombstone: TombstoneRecord = {
          id: `${life.seed}_${Date.now()}`,
          seed: life.seed,
          fullName: life.profile.fullName,
          gender: life.profile.gender,
          originClass: life.profile.originClass,
          ageYears,
          deathReason: life.deathReason ?? 'Qua đời',
          titleAwarded,
          finalNetWorthCopper: netWorth,
          finalFame: life.stats.fame,
          createdAt: new Date().toISOString(),
        };

        const nextLives = state.totalLives + 1;
        const codex = new Set(state.unlockedCodexIds);
        if (life.profile.originClass === 'ban_nong' && ageYears >= 60) codex.add('codex_ban_nong_tho');
        if (life.flags.includes('trang_nguyen')) codex.add('codex_trang_nguyen');
        if (life.flags.includes('nu_quan_dac_xa')) codex.add('codex_nu_quan');
        if (netWorth >= 100000) codex.add('codex_cu_phu');
        if (life.flags.includes('khai_quoc_hoang_de')) codex.add('codex_hoang_de');
        if ((life.deathReason ?? '').toLowerCase().includes('xử trảm')) codex.add('codex_xu_tram');

        const themes = new Set<DashboardTheme>(state.unlockedThemes);
        if (nextLives >= 1) themes.add('giay_do');
        if (nextLives >= 3 || life.flags.includes('do_tien_si')) themes.add('muc_tau');
        if (life.stats.fame >= 80 || life.flags.includes('khai_quoc_hoang_de')) themes.add('son_thep');

        const nextTombstones = [tombstone, ...state.tombstones].slice(0, MAX_TOMBSTONES);
        const nextOriginCounts = {
          ...state.originCounts,
          [life.profile.originClass]: (state.originCounts[life.profile.originClass] ?? 0) + 1,
        };

        set({
          totalLives: nextLives,
          originCounts: nextOriginCounts,
          unlockedCodexIds: Array.from(codex),
          unlockedThemes: Array.from(themes),
          tombstones: nextTombstones,
        });
      },

      setActiveTheme: (theme: DashboardTheme) => {
        const state = get();
        if (state.unlockedThemes.includes(theme)) {
          set({ activeTheme: theme });
        }
      },

      setColorMode: (mode: ColorMode) => {
        set({ colorMode: mode });
      },

      toggleColorMode: () => {
        const current = get().colorMode ?? 'dark';
        set({ colorMode: current === 'dark' ? 'light' : 'dark' });
      },
    }),
    {
      name: 'nkpt_legacy_archive_v1',
      version: 1,
    },
  ),
);
