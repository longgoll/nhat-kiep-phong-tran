import type { LogEntry } from '../types/activeLife';

const CATEGORY_STYLES: Record<LogEntry['category'], { label: string; badgeClass: string; dotClass: string }> = {
  birth: {
    label: 'Chào đời',
    badgeClass: 'bg-rose-950/70 text-rose-200 border-rose-700/50',
    dotClass: 'bg-rose-400',
  },
  childhood: {
    label: 'Tuổi thơ',
    badgeClass: 'bg-amber-950/70 text-amber-200 border-amber-700/50',
    dotClass: 'bg-amber-400',
  },
  survival: {
    label: 'Đời sống',
    badgeClass: 'bg-emerald-950/70 text-emerald-200 border-emerald-700/50',
    dotClass: 'bg-emerald-400',
  },
  study: {
    label: 'Học hành',
    badgeClass: 'bg-sky-950/70 text-sky-200 border-sky-700/50',
    dotClass: 'bg-sky-400',
  },
  event: {
    label: 'Biến cố',
    badgeClass: 'bg-purple-950/70 text-purple-200 border-purple-700/50',
    dotClass: 'bg-purple-400',
  },
  warning: {
    label: 'Cảnh báo',
    badgeClass: 'bg-red-950/80 text-red-200 border-red-700/60',
    dotClass: 'bg-red-500',
  },
};

interface LifeTimelineProps {
  logs: LogEntry[];
  maxHeightClass?: string;
  isRunning?: boolean;
}

export function LifeTimeline({
  logs,
  maxHeightClass = 'max-h-[460px]',
  isRunning = false,
}: LifeTimelineProps) {
  const reversed = [...logs].reverse();

  return (
    <div className="bg-stone-900/85 border border-stone-800 rounded-xl p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-amber-200">
            Ghi Chép Cuộc Đời
          </h3>
          {isRunning && (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-950/70 border border-emerald-700/50 text-[10px] text-emerald-300">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              Đang chạy...
            </span>
          )}
        </div>
        <span className="text-[10px] text-stone-400">
          Mới nhất ở trên • {logs.length} sự kiện
        </span>
      </div>

      <div className={`${maxHeightClass} overflow-y-auto pr-2`}>
        <div className="relative border-l-2 border-stone-800 ml-2 pl-4 space-y-3 py-1">
          {reversed.map((entry, idx) => {
            const origIdx = logs.length - 1 - idx;
            const age = Math.floor(entry.day / 360);
            const style = CATEGORY_STYLES[entry.category] ?? CATEGORY_STYLES.survival;
            const isNewest = idx === 0;

            return (
              <div
                key={`${origIdx}-${entry.day}`}
                className={`relative ${isNewest ? 'animate-fade-slide-in' : ''}`}
              >
                {/* Timeline dot */}
                <span
                  className={`absolute -left-[23px] top-1.5 w-2.5 h-2.5 rounded-full border-2 border-stone-950 ${style.dotClass} ${
                    isNewest ? 'ring-4 ring-amber-400/25 scale-110' : 'opacity-75'
                  }`}
                />

                <div
                  className={`rounded-lg p-2.5 border transition-colors ${
                    isNewest
                      ? 'bg-stone-950 border-amber-600/50 shadow-sm'
                      : 'bg-stone-950/60 border-stone-800/70'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-[11px] font-bold text-amber-300">
                      {age} tuổi
                    </span>
                    <span
                      className={`px-1.5 py-0.5 rounded border text-[10px] font-medium ${style.badgeClass}`}
                    >
                      {style.label}
                    </span>
                    {isNewest && (
                      <span className="ml-auto text-[10px] font-semibold text-emerald-400 uppercase tracking-wider">
                        Mới nhất
                      </span>
                    )}
                  </div>
                  <p
                    className={`text-xs leading-relaxed ${
                      entry.tone === 'positive'
                        ? 'text-emerald-300'
                        : entry.tone === 'negative'
                          ? 'text-rose-300'
                          : entry.tone === 'milestone'
                            ? 'text-amber-200 font-medium'
                            : 'text-stone-200'
                    }`}
                  >
                    {entry.text}
                  </p>
                  {entry.subNote && (
                    <p className="text-[11px] leading-snug text-stone-400 mt-1">{entry.subNote}</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
