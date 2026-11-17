import { useEffect, useRef } from 'react';
import { Play, Pause, FastForward, RotateCcw } from 'lucide-react';
import { ColorModeToggle } from './ColorModeToggle';

interface StepButtonSpec {
  label: string;
  onClick: () => void;
  disabled?: boolean;
}

interface LifeTopBarProps {
  ageYears: number;
  dayOfYear?: number;
  subMonthProgress?: number;
  isChildhood?: boolean;
  dynastyName: string;
  yearInEra: number;
  seasonLabel?: string;
  seed: number;
  autoPlaySpeed: number;
  speedOptions: number[];
  onSetSpeed: (speed: number) => void;
  primaryStep: StepButtonSpec;
  extraSteps?: StepButtonSpec[];
  onReset: () => void;
}

export function LifeTopBar({
  ageYears,
  dayOfYear = 0,
  subMonthProgress,
  isChildhood = false,
  dynastyName,
  yearInEra,
  seasonLabel,
  seed,
  autoPlaySpeed,
  speedOptions,
  onSetSpeed,
  primaryStep,
  extraSteps,
  onReset,
}: LifeTopBarProps) {
  const monthIndex = Math.min(12, Math.floor(dayOfYear / 30) + 1);
  const isRunning = autoPlaySpeed > 0;
  const smoothProgressPct =
    subMonthProgress !== undefined
      ? Math.min(100, Math.max(1, ((dayOfYear + subMonthProgress * 30) / 360) * 100))
      : Math.min(100, Math.max(4, Math.round(((dayOfYear + 1) / 360) * 100)));
  const childhoodYearSeconds =
    isChildhood && autoPlaySpeed > 0 ? Math.round((52 / autoPlaySpeed) * 10) / 10 : null;

  const lastSpeedRef = useRef<number>(speedOptions[0] ?? 1);
  useEffect(() => {
    if (autoPlaySpeed > 0) {
      lastSpeedRef.current = autoPlaySpeed;
    }
  }, [autoPlaySpeed]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
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

      const num = Number(e.key);
      if (speedOptions.includes(num)) {
        e.preventDefault();
        onSetSpeed(num);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [autoPlaySpeed, speedOptions, onSetSpeed]);

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
          <span className="px-2 py-0.5 rounded bg-stone-900 border border-stone-800 font-mono text-[11px] text-amber-300 tabular-nums">
            Tháng {monthIndex}/12
          </span>
          <span className="text-xs text-stone-400">
            • Triều {dynastyName} năm thứ {yearInEra}
            {seasonLabel ? ` • ${seasonLabel}` : ''}
            {childhoodYearSeconds !== null ? ` • 1 năm = ${childhoodYearSeconds}s` : ''}
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
          {/* Primary Step / Play */}
          <button
            type="button"
            disabled={primaryStep.disabled}
            onClick={primaryStep.onClick}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-stone-950 font-bold text-xs transition cursor-pointer"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            {primaryStep.label}
          </button>

          {/* Extra Step Buttons (e.g. +1 Tuần, +1 Tháng, +1 Mùa) */}
          {extraSteps?.map((step) => (
            <button
              key={step.label}
              type="button"
              disabled={step.disabled}
              onClick={step.onClick}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 disabled:opacity-50 text-stone-200 font-medium text-xs transition cursor-pointer"
            >
              <FastForward className="w-3 h-3 text-amber-400" />
              {step.label}
            </button>
          ))}

          <div className="h-4 w-px bg-stone-700 mx-1 hidden sm:block" />

          {/* Auto-play Toggle & Speed Pills */}
          <button
            type="button"
            title="Phím tắt: Space để Tạm dừng / Tiếp tục theo tốc độ cũ"
            onClick={() => {
              if (isRunning) {
                onSetSpeed(0);
              } else {
                onSetSpeed(lastSpeedRef.current || speedOptions[0] || 1);
              }
            }}
            className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              autoPlaySpeed === 0
                ? 'bg-stone-700 hover:bg-stone-600 text-stone-100'
                : 'bg-rose-700/90 hover:bg-rose-600 text-white'
            }`}
          >
            {isRunning ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
            {isRunning ? 'Dừng' : `Chạy ${lastSpeedRef.current}x`}
            <span className="hidden md:inline text-[10px] opacity-75 font-mono ml-0.5">[Space]</span>
          </button>
          {speedOptions.map((spd) => (
            <button
              key={spd}
              type="button"
              onClick={() => onSetSpeed(spd)}
              className={`px-2 py-1.5 rounded-lg text-xs font-mono font-semibold transition cursor-pointer ${
                autoPlaySpeed === spd
                  ? 'bg-emerald-600 text-white'
                  : 'bg-stone-950/60 hover:bg-stone-800 text-stone-300'
              }`}
            >
              {spd}x
            </button>
          ))}
        </div>

          <button
            type="button"
            onClick={onReset}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-stone-800/80 hover:bg-stone-700 border border-stone-700 text-stone-300 text-xs font-medium transition cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            Đầu thai lại
          </button>
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
      </div>
    </div>
  );
}
