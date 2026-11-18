import { useEffect, useRef, useState } from 'react';
import { Play, Pause, RotateCcw, PenLine, SkipForward, Sparkles } from 'lucide-react';
import { useActiveLifeStore } from '../stores/useActiveLifeStore';
import { ColorModeToggle } from './ColorModeToggle';

interface LifeTopBarProps {
  ageYears: number;
  dayOfYear?: number;
  subMonthProgress?: number;
  dynastyName: string;
  yearInEra: number;
  seasonLabel?: string;
  seed: number;
  autoPlaySpeed: number;
  speedOptions: number[];
  onSetSpeed: (speed: number) => void;
  controlsDisabled?: boolean;
  onReset: () => void;
}

export function LifeTopBar({
  ageYears,
  dayOfYear = 0,
  subMonthProgress,
  dynastyName,
  yearInEra,
  seasonLabel,
  seed,
  autoPlaySpeed,
  speedOptions,
  onSetSpeed,
  controlsDisabled = false,
  onReset,
}: LifeTopBarProps) {
  const [showThoughtInput, setShowThoughtInput] = useState(false);
  const [thoughtText, setThoughtText] = useState('');
  const [confirmReset, setConfirmReset] = useState(false);

  const autoDecide = useActiveLifeStore((s) => s.autoDecide);
  const toggleAutoDecide = useActiveLifeStore((s) => s.toggleAutoDecide);
  const advanceToNextDecision = useActiveLifeStore((s) => s.advanceToNextDecision);
  const addPlayerThought = useActiveLifeStore((s) => s.addPlayerThought);

  const isRunning = autoPlaySpeed > 0;
  const smoothProgressPct =
    subMonthProgress !== undefined
      ? Math.min(100, Math.max(1, ((dayOfYear + subMonthProgress * 30) / 360) * 100))
      : Math.min(100, Math.max(4, Math.round(((dayOfYear + 1) / 360) * 100)));
  const yearSeconds = autoPlaySpeed > 0 ? Math.max(1, Math.round(52 / autoPlaySpeed)) : null;

  const lastSpeedRef = useRef<number>(speedOptions[0] ?? 1);
  useEffect(() => {
    if (autoPlaySpeed > 0) {
      lastSpeedRef.current = autoPlaySpeed;
    }
  }, [autoPlaySpeed]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (controlsDisabled) return;
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT' ||
          target.isContentEditable)
      ) {
        return;
      }

      if (e.code === 'Space') {
        e.preventDefault();
        if (autoPlaySpeed > 0) {
          onSetSpeed(0);
        } else {
          onSetSpeed(lastSpeedRef.current || speedOptions[0] || 1);
        }
        return;
      }

      const idx = Number(e.key) - 1;
      if (Number.isInteger(idx) && idx >= 0 && idx < speedOptions.length) {
        e.preventDefault();
        onSetSpeed(speedOptions[idx]);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [autoPlaySpeed, speedOptions, onSetSpeed, controlsDisabled]);

  return (
    <div className="space-y-2.5">
      {/* Row 1: Title + Age + Dynasty + Month */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-baseline gap-2.5 flex-wrap">
          <span className="font-serif text-base sm:text-lg font-bold text-amber-200">
            Nhất Kiếp Phong Trần
          </span>
          <span className="text-2xl font-bold text-stone-100 tabular-nums">
            {ageYears} <span className="text-sm font-normal text-stone-400">tuổi</span>
          </span>
          <span className="text-xs text-stone-400">
            Triều {dynastyName} năm thứ {yearInEra}
            {seasonLabel ? ` · ${seasonLabel}` : ''}
            {yearSeconds !== null ? ` · 1 năm ≈ ${yearSeconds} giây` : ''}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {isRunning && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-600/60 text-[11px] font-semibold text-emerald-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              Đang chạy {autoPlaySpeed}x
            </span>
          )}
          <span className="px-2 py-0.5 rounded bg-stone-900 border border-stone-800 font-mono text-[11px] text-stone-400">
            Số hiệu: NK-{seed}
          </span>
          <ColorModeToggle compact />
        </div>
      </div>

      {/* Row 2: Unified Control Bar (1in8b-style) */}
      <div className="relative overflow-hidden bg-stone-900/95 border border-stone-700/80 rounded-xl px-2.5 py-2 shadow-lg">
        <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-1.5">
          {/* Primary Play / Pause (1in8b-style) */}
          <button
            type="button"
            disabled={controlsDisabled}
            title="Phím tắt: Space để Tạm dừng / Tiếp tục"
            onClick={() => {
              if (isRunning) {
                onSetSpeed(0);
              } else {
                onSetSpeed(lastSpeedRef.current || speedOptions[0] || 1);
              }
            }}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer disabled:opacity-50 ${
              autoPlaySpeed === 0
                ? 'bg-amber-500 hover:bg-amber-400 text-stone-950'
                : 'bg-rose-700/90 hover:bg-rose-600 text-white'
            }`}
          >
            {isRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
            {isRunning ? 'Tạm dừng' : 'Tiếp tục'}
          </button>
          {speedOptions.map((spd) => (
            <button
              key={spd}
              type="button"
              disabled={controlsDisabled}
              onClick={() => onSetSpeed(spd)}
              className={`px-2 py-1.5 rounded-lg text-xs font-mono font-semibold transition cursor-pointer disabled:opacity-50 ${
                autoPlaySpeed === spd
                  ? 'bg-emerald-600 text-white'
                  : 'bg-stone-950/60 hover:bg-stone-800 text-stone-300'
              }`}
            >
              {spd}x
            </button>
          ))}

          <div className="h-4 w-px bg-stone-700 mx-1 hidden sm:block" />

          <button
            type="button"
            disabled={controlsDisabled}
            onClick={() => {
              onSetSpeed(0);
              advanceToNextDecision();
            }}
            title="Tua nhanh tới sự kiện có lựa chọn tiếp theo"
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 disabled:opacity-50 text-stone-200 text-xs font-medium transition cursor-pointer"
          >
            <SkipForward className="w-3 h-3 text-amber-400" />
            <span className="hidden md:inline">Tới quyết định tiếp theo »</span>
            <span className="md:hidden">Tới quyết định »</span>
          </button>

          <button
            type="button"
            onClick={toggleAutoDecide}
            title="Tự động chọn phương án phù hợp nhất khi gặp sự kiện"
            className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition cursor-pointer ${
              autoDecide
                ? 'bg-emerald-950/80 border-emerald-500 text-emerald-200'
                : 'bg-stone-950/60 hover:bg-stone-800 border-stone-700 text-stone-300'
            }`}
          >
            <Sparkles className="w-3 h-3" />
            <span>Tự động quyết định</span>
          </button>

          <button
            type="button"
            onClick={() => setShowThoughtInput((v) => !v)}
            title="Ghi một dòng tâm sự vào Ghi Chép Cuộc Đời"
            className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition cursor-pointer ${
              showThoughtInput
                ? 'bg-sky-950/70 border-sky-500 text-sky-200'
                : 'bg-stone-950/60 hover:bg-stone-800 border-stone-700 text-stone-300'
            }`}
          >
            <PenLine className="w-3 h-3" />
            <span>Ghi suy nghĩ</span>
          </button>
        </div>

          {confirmReset ? (
            <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-rose-950/80 border border-rose-700/70 text-xs">
              <span className="text-rose-200 font-medium">Bỏ kiếp hiện tại?</span>
              <button
                type="button"
                onClick={() => {
                  setConfirmReset(false);
                  onReset();
                }}
                className="px-2 py-0.5 rounded bg-rose-600 hover:bg-rose-500 text-white font-bold cursor-pointer"
              >
                Xác nhận
              </button>
              <button
                type="button"
                onClick={() => setConfirmReset(false)}
                className="px-2 py-0.5 rounded bg-stone-800 hover:bg-stone-700 text-stone-300 cursor-pointer"
              >
                Hủy
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setConfirmReset(true)}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-stone-800/80 hover:bg-stone-700 border border-stone-700 text-stone-300 text-xs font-medium transition cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              Đầu thai lại
            </button>
          )}
        </div>

        {/* Year Progress Bar */}
        <div className="mt-2 h-1.5 w-full rounded-full bg-stone-800 overflow-hidden relative">
          <div
            className={`h-full bg-gradient-to-r from-amber-500 to-emerald-400 ${
              isRunning && subMonthProgress !== undefined ? 'transition-none' : 'transition-all duration-300'
            }`}
            style={{ width: `${smoothProgressPct}%` }}
          />
          {isRunning && subMonthProgress === undefined && (
            <div className="absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-white/70 to-transparent animate-progress-sweep" />
          )}
        </div>

        {/* Inline Thought Input (1in8b style) */}
        {showThoughtInput && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!thoughtText.trim()) return;
              addPlayerThought(thoughtText);
              setThoughtText('');
              setShowThoughtInput(false);
            }}
            className="mt-2.5 flex items-center gap-2"
          >
            <input
              type="text"
              value={thoughtText}
              onChange={(e) => setThoughtText(e.target.value)}
              placeholder={`Ghi suy nghĩ ở tuổi ${ageYears}... (sẽ tự động gắn ★)`}
              maxLength={180}
              autoFocus
              className="flex-1 px-3 py-1.5 rounded-lg bg-stone-950 border border-stone-700 text-xs text-stone-100 placeholder:text-stone-500 focus:outline-none focus:border-amber-500"
            />
            <button
              type="submit"
              disabled={!thoughtText.trim()}
              className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-stone-950 font-bold text-xs cursor-pointer"
            >
              Lưu vào sử ký
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
