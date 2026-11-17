import { BookMarked, Palette, History, X, Lock, Check } from 'lucide-react';
import {
  CODEX_CATALOG,
  THEME_LABELS,
  useLegacyArchiveStore,
} from '../stores/useLegacyArchiveStore';
import { formatCopper } from '../engine/economy';
import type { DashboardTheme } from '../types/legacy';

export function LegacyArchiveModal({ onClose }: { onClose: () => void }) {
  const archive = useLegacyArchiveStore();

  const avgAge =
    archive.tombstones.length > 0
      ? Math.round(
          archive.tombstones.reduce((s, t) => s + t.ageYears, 0) / archive.tombstones.length,
        )
      : 0;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="max-w-3xl w-full max-h-[88vh] bg-stone-900 border border-amber-700/50 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-stone-800 flex items-center justify-between bg-amber-950/30">
          <div>
            <h2 className="font-serif text-xl font-bold text-amber-100">
              Tàng Kinh Các (Pure Cosmetic Meta)
            </h2>
            <p className="text-xs text-stone-400">
              Lưu giữ sử ký, kết cục hiếm và giao diện cổ phong. Tuyệt đối không cộng buff cho kiếp sau.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-100 hover:bg-stone-800 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-5 overflow-y-auto space-y-6 text-xs">
          {/* Stats */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 rounded-lg bg-stone-950 border border-stone-800 text-center">
              <div className="text-stone-400">Tổng số kiếp</div>
              <div className="text-lg font-bold text-amber-300 mt-0.5">{archive.totalLives}</div>
            </div>
            <div className="p-3 rounded-lg bg-stone-950 border border-stone-800 text-center">
              <div className="text-stone-400">Tuổi thọ trung bình</div>
              <div className="text-lg font-bold text-emerald-300 mt-0.5">{avgAge} tuổi</div>
            </div>
            <div className="p-3 rounded-lg bg-stone-950 border border-stone-800 text-center">
              <div className="text-stone-400">Codex đã mở</div>
              <div className="text-lg font-bold text-sky-300 mt-0.5">
                {archive.unlockedCodexIds.length} / {CODEX_CATALOG.length}
              </div>
            </div>
          </div>

          {/* Themes */}
          <div className="space-y-2.5">
            <h3 className="font-semibold uppercase tracking-wider text-stone-300 flex items-center gap-1.5">
              <Palette className="w-4 h-4 text-amber-400" /> Giao Diện Cổ Phong
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {(Object.keys(THEME_LABELS) as DashboardTheme[]).map((themeKey) => {
                const info = THEME_LABELS[themeKey];
                const unlocked = archive.unlockedThemes.includes(themeKey);
                const active = archive.activeTheme === themeKey;
                return (
                  <button
                    key={themeKey}
                    type="button"
                    disabled={!unlocked}
                    onClick={() => archive.setActiveTheme(themeKey)}
                    className={`p-3 rounded-lg border text-left flex items-center justify-between transition ${
                      active
                        ? 'bg-amber-950/50 border-amber-500 text-amber-100'
                        : unlocked
                          ? 'bg-stone-950 border-stone-700 hover:border-stone-500 text-stone-200 cursor-pointer'
                          : 'bg-stone-950/40 border-stone-800 text-stone-500 opacity-60 cursor-not-allowed'
                    }`}
                  >
                    <div>
                      <div className="font-semibold">{info.name}</div>
                      <div className="text-[11px] text-stone-400 mt-0.5">{info.unlockHint}</div>
                    </div>
                    {active ? (
                      <Check className="w-4 h-4 text-amber-400 shrink-0" />
                    ) : !unlocked ? (
                      <Lock className="w-4 h-4 text-stone-600 shrink-0" />
                    ) : null}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Codex */}
          <div className="space-y-2.5">
            <h3 className="font-semibold uppercase tracking-wider text-stone-300 flex items-center gap-1.5">
              <BookMarked className="w-4 h-4 text-emerald-400" /> Bách Khoa Kết Cục (Codex)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {CODEX_CATALOG.map((entry) => {
                const unlocked = archive.unlockedCodexIds.includes(entry.id);
                return (
                  <div
                    key={entry.id}
                    className={`p-3 rounded-lg border ${
                      unlocked
                        ? 'bg-stone-950 border-emerald-800/60 text-stone-100'
                        : 'bg-stone-950/40 border-stone-800 text-stone-500'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold">
                        {unlocked ? entry.title : '??? (Chưa mở khóa)'}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-stone-800 text-amber-300">
                        {entry.rarity}
                      </span>
                    </div>
                    <p className="text-[11px] mt-1 text-stone-400">
                      {unlocked ? entry.description : 'Hãy khám phá thêm các nhánh cuộc đời để mở khóa.'}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Tombstones */}
          {archive.tombstones.length > 0 && (
            <div className="space-y-2.5">
              <h3 className="font-semibold uppercase tracking-wider text-stone-300 flex items-center gap-1.5">
                <History className="w-4 h-4 text-sky-400" /> Bia Mộ Gần Đây
              </h3>
              <div className="space-y-2">
                {archive.tombstones.slice(0, 10).map((t) => (
                  <div
                    key={t.id}
                    className="p-2.5 rounded-lg bg-stone-950 border border-stone-800 flex items-center justify-between gap-2"
                  >
                    <div>
                      <div className="font-semibold text-amber-200">
                        {t.fullName} ({t.ageYears} tuổi) — {t.titleAwarded}
                      </div>
                      <div className="text-[11px] text-stone-400">{t.deathReason}</div>
                    </div>
                    <div className="text-right font-mono text-[11px] text-stone-300 shrink-0">
                      {formatCopper(t.finalNetWorthCopper)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
