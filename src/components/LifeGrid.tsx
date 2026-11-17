import type { MilestoneRecord } from '../types/activeLife';

interface LifeGridProps {
  ageYears: number;
  milestones: MilestoneRecord[];
  yearlyHappiness?: Record<number, number>;
  expectedLifespan?: number;
}

function getHappinessCellClass(happiness: number | undefined): string {
  if (happiness === undefined) return 'bg-emerald-800/60 border-emerald-700/50';
  if (happiness < 35) return 'bg-rose-900/80 border-rose-700/60';
  if (happiness < 55) return 'bg-amber-800/70 border-amber-700/60';
  if (happiness < 75) return 'bg-emerald-700/80 border-emerald-600/60';
  return 'bg-emerald-400/90 border-emerald-300';
}

export function LifeGrid({
  ageYears,
  milestones,
  yearlyHappiness,
  expectedLifespan,
}: LifeGridProps) {
  const totalCells = 80; // 1 cell = 1 year (up to 80 years)
  const milestoneYears = new Map<number, string>();
  for (const m of milestones) {
    if (!milestoneYears.has(m.ageYears)) {
      milestoneYears.set(m.ageYears, m.title);
    }
  }

  return (
    <div className="bg-stone-900/75 border border-stone-800 rounded-xl p-3.5 space-y-2.5">
      <div className="flex items-center justify-between text-xs">
        <span className="font-semibold uppercase tracking-wider text-stone-400">
          Bản Đồ Cuộc Đời (1 ô = 1 năm)
        </span>
        <span className="font-mono text-[11px] text-amber-300">{ageYears} / 80 tuổi</span>
      </div>

      <div className="grid grid-cols-10 gap-1">
        {Array.from({ length: totalCells }, (_, yr) => {
          const isCurrent = yr === ageYears;
          const isLived = yr < ageYears;
          const isExpectedEnd = expectedLifespan !== undefined && yr === expectedLifespan;
          const milestoneTitle = milestoneYears.get(yr);
          const hap = yearlyHappiness?.[yr];

          let cellClass = 'bg-stone-950 border-stone-800/70';
          if (isCurrent) {
            cellClass = 'bg-amber-400 border-amber-200 ring-2 ring-amber-400/50';
          } else if (isLived) {
            cellClass = getHappinessCellClass(hap);
          }

          if (isExpectedEnd && !isCurrent) {
            cellClass += ' border-2 border-sky-400 ring-1 ring-sky-400/40';
          }

          const titleParts = [`Tuổi ${yr}`];
          if (isCurrent) titleParts.push('(Hiện tại)');
          if (hap !== undefined && (isLived || isCurrent)) titleParts.push(`• Hạnh phúc: ${hap}%`);
          if (milestoneTitle) titleParts.push(`• Cột mốc: ${milestoneTitle}`);
          if (isExpectedEnd) titleParts.push('• Tuổi thọ kỳ vọng');

          return (
            <div
              key={yr}
              title={titleParts.join(' ')}
              className={`relative h-3.5 rounded-[3px] border transition-colors ${cellClass}`}
            >
              {milestoneTitle && !isCurrent && (
                <span className="absolute top-0.5 right-0.5 w-1 h-1 rounded-full bg-amber-300" />
              )}
            </div>
          );
        })}
      </div>

      <div className="space-y-1 text-[10px] text-stone-500">
        <div className="flex items-center justify-between gap-2">
          <span className="flex items-center gap-1">
            <span>Ít hạnh phúc</span>
            <span className="inline-block w-2 h-2 rounded-xs bg-rose-900/80" />
            <span className="inline-block w-2 h-2 rounded-xs bg-amber-800/70" />
            <span className="inline-block w-2 h-2 rounded-xs bg-emerald-700/80" />
            <span className="inline-block w-2 h-2 rounded-xs bg-emerald-400/90" />
            <span>Hạnh phúc hơn</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block w-2 h-2 rounded-full bg-amber-300" /> Cột mốc
          </span>
        </div>
        {expectedLifespan !== undefined && (
          <div className="flex items-center gap-1.5 text-sky-300/80">
            <span className="inline-block w-2.5 h-2.5 rounded-[2px] border-2 border-sky-400 bg-stone-950" />
            <span>Ô có viền = tuổi thọ kỳ vọng theo xuất thân: {expectedLifespan} tuổi</span>
          </div>
        )}
      </div>
    </div>
  );
}
