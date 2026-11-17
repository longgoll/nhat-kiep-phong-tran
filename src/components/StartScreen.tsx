import { useRef, useState } from 'react';
import { Sparkles, Dices, ScrollText, ShieldAlert, BookMarked, Upload } from 'lucide-react';
import { ORIGIN_METADATA } from '../engine/lifeInitializer';
import type { OriginClass } from '../types/activeLife';
import { useActiveLifeStore } from '../stores/useActiveLifeStore';
import { getThemeWrapperClass, useLegacyArchiveStore } from '../stores/useLegacyArchiveStore';
import { LegacyArchiveModal } from './LegacyArchiveModal';
import { ColorModeToggle } from './ColorModeToggle';

const ORIGIN_ORDER: OriginClass[] = ['ban_nong', 'thu_cong', 'dia_chu', 'quan_lai', 'hoang_toc'];

export function StartScreen() {
  const [seedInput, setSeedInput] = useState('');
  const [showArchive, setShowArchive] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const startNewLife = useActiveLifeStore((s) => s.startNewLife);
  const importSaveJson = useActiveLifeStore((s) => s.importSaveJson);
  const totalLives = useLegacyArchiveStore((s) => s.totalLives);
  const activeTheme = useLegacyArchiveStore((s) => s.activeTheme);
  const colorMode = useLegacyArchiveStore((s) => s.colorMode ?? 'dark');
  const themeClass = getThemeWrapperClass(activeTheme, colorMode);

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const res = importSaveJson(String(reader.result ?? ''));
      if (!res.ok) setImportError(res.error ?? 'Lỗi nhập file.');
      else setImportError(null);
    };
    reader.readAsText(file);
  };

  const handleStart = () => {
    const trimmed = seedInput.trim();
    if (trimmed.length > 0) {
      const parsed = Number(trimmed);
      if (Number.isFinite(parsed) && parsed >= 0) {
        startNewLife(Math.floor(parsed));
        return;
      }
      // Simple string hash to uint32 seed
      let hash = 2166136261;
      for (let i = 0; i < trimmed.length; i += 1) {
        hash ^= trimmed.charCodeAt(i);
        hash = Math.imul(hash, 16777619);
      }
      startNewLife(hash >>> 0);
      return;
    }
    startNewLife();
  };

  return (
    <div className={`min-h-screen ${themeClass} flex items-center justify-center p-4 sm:p-8`}>
      <div className="max-w-4xl w-full space-y-6">
        {/* Header */}
        <div className="text-center space-y-2 border-b border-stone-800 pb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-950/60 border border-amber-700/40 text-amber-300 text-xs font-medium tracking-wide uppercase">
            <Sparkles className="w-3.5 h-3.5" />
            Single-Life Feudal Roguelite
          </div>
          <h1 className="text-3xl sm:text-5xl font-serif font-bold tracking-tight text-amber-100">
            Nhất Kiếp Phong Trần
          </h1>
          <p className="text-stone-400 text-sm sm:text-base max-w-2xl mx-auto">
            Mỗi kiếp người là một ván bài độc lập 100%, không truyền đời, không buff ngầm.
            Từ tiếng khóc chào đời đến khi nhắm mắt xuôi tay — số phận nằm trong lựa chọn của bạn.
          </p>
        </div>

        {/* Gacha Odds Table */}
        <div className="bg-stone-900/70 border border-stone-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-stone-300 flex items-center gap-2">
              <ScrollText className="w-4 h-4 text-amber-400" />
              Bảng Phân Tầng Xuất Thân (Gacha Ngẫu Nhiên)
            </h2>
            <span className="text-xs text-stone-400">Giới tính: 50% Nam / 50% Nữ</span>
          </div>

          <div className="grid gap-2.5">
            {ORIGIN_ORDER.map((key) => {
              const item = ORIGIN_METADATA[key];
              return (
                <div
                  key={key}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-lg bg-stone-950/60 border border-stone-800/80"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-amber-200">{item.label}</span>
                      <span className="text-xs px-2 py-0.5 rounded bg-stone-800 text-amber-300 font-mono">
                        {item.rateLabel}
                      </span>
                    </div>
                    <p className="text-xs text-stone-400">{item.summary}</p>
                  </div>
                  <div className="text-xs text-rose-300/90 flex items-start gap-1.5 sm:max-w-xs">
                    <ShieldAlert className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                    <span>{item.riskSummary}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Seed & Launch */}
        <div className="bg-stone-900/70 border border-stone-800 rounded-xl p-5 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="flex-1 space-y-1">
            <label htmlFor="seed-input" className="block text-xs font-medium text-stone-400">
              Hạt giống định mệnh (Seed — bỏ trống để quay ngẫu nhiên)
            </label>
            <input
              id="seed-input"
              type="text"
              value={seedInput}
              onChange={(e) => setSeedInput(e.target.value)}
              placeholder="VD: 123456 hoặc tên bất kỳ..."
              className="w-full px-3 py-2 rounded-lg bg-stone-950 border border-stone-700 text-sm text-stone-100 placeholder:text-stone-600 focus:outline-none focus:border-amber-500"
            />
          </div>

          <button
            type="button"
            onClick={handleStart}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-amber-600 hover:bg-amber-500 active:bg-amber-700 text-stone-950 font-bold text-base transition cursor-pointer shadow-lg shadow-amber-900/20"
          >
            <Dices className="w-5 h-5" />
            Đầu Thai Kiếp Mới
          </button>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => setShowArchive(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-stone-900 hover:bg-stone-800 border border-stone-700 text-xs font-semibold text-amber-200 cursor-pointer"
          >
            <BookMarked className="w-4 h-4 text-amber-400" />
            Mở Tàng Kinh Các ({totalLives} kiếp)
          </button>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-stone-900 hover:bg-stone-800 border border-stone-700 text-xs font-semibold text-stone-200 cursor-pointer"
          >
            <Upload className="w-4 h-4 text-sky-400" />
            Nhập File Save (.json)
          </button>
          <ColorModeToggle />
          <input
            ref={fileInputRef}
            type="file"
            accept=".json,application/json"
            onChange={handleImportFile}
            className="hidden"
          />
        </div>

        {importError && (
          <p className="text-center text-xs text-rose-400">{importError}</p>
        )}
      </div>
      {showArchive && <LegacyArchiveModal onClose={() => setShowArchive(false)} />}
    </div>
  );
}
