import { useState } from 'react';
import type { LogEntry, MilestoneRecord } from '../types/activeLife';
import { formatCopper } from '../engine/economy';

interface LifeGridProps {
  ageYears: number;
  milestones: MilestoneRecord[];
  yearlyHappiness?: Record<number, number>;
  expectedLifespan?: number;
  logs?: LogEntry[];
}

function getHappinessCellClass(happiness: number | undefined): string {
  if (happiness === undefined) return 'bg-emerald-800/75 border-emerald-700/60 text-emerald-100';
  if (happiness < 35) return 'bg-rose-900/85 border-rose-700/70 text-rose-100';
  if (happiness < 55) return 'bg-amber-800/75 border-amber-700/70 text-amber-100';
  if (happiness < 75) return 'bg-emerald-700/85 border-emerald-600/70 text-emerald-50';
  return 'bg-emerald-500/90 border-emerald-400 text-stone-950';
}

function getHappinessLabel(happiness: number): string {
  if (happiness < 25) return 'U uất';
  if (happiness < 45) return 'Trầm lắng';
  if (happiness < 65) return 'Bình ổn';
  if (happiness < 80) return 'Vui vẻ';
  return 'Hạnh phúc tràn đầy';
}

function getMilestoneGlyph(title: string): string {
  const t = title.toLowerCase();
  if (t.includes('chào đời') || t.includes('sinh ra')) return 'S';
  if (t.includes('học') || t.includes('đồ') || t.includes('thi') || t.includes('đỗ') || t.includes('trạng')) return 'H';
  if (t.includes('cưới') || t.includes('thành gia') || t.includes('hôn')) return 'C';
  if (t.includes('quan') || t.includes('triều') || t.includes('hoàng') || t.includes('vương')) return 'Q';
  if (t.includes('ruộng') || t.includes('buôn') || t.includes('cửa hàng') || t.includes('phủ')) return 'T';
  return '★';
}

export function LifeGrid({
  ageYears,
  milestones,
  yearlyHappiness,
  expectedLifespan,
  logs = [],
}: LifeGridProps) {
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [hoveredYear, setHoveredYear] = useState<number | null>(null);

  const totalCells = Math.max(80, Math.ceil((ageYears + 1) / 10) * 10);

  const milestonesByYear = new Map<number, MilestoneRecord[]>();
  for (const m of milestones) {
    const list = milestonesByYear.get(m.ageYears) ?? [];
    list.push(m);
    milestonesByYear.set(m.ageYears, list);
  }

  const inspectedYear = hoveredYear ?? selectedYear;
  const inspectedMilestones =
    inspectedYear !== null ? milestonesByYear.get(inspectedYear) ?? [] : [];
  const inspectedHappiness =
    inspectedYear !== null ? yearlyHappiness?.[inspectedYear] : undefined;
  const inspectedLogs =
    inspectedYear !== null
      ? logs
          .filter((l) => Math.floor(l.day / 360) === inspectedYear)
          .sort((a, b) => {
            const score = (tone?: string) =>
              tone === 'milestone' ? 3 : tone === 'negative' || tone === 'positive' ? 2 : 1;
            return score(b.tone) - score(a.tone);
          })
          .slice(0, 2)
      : [];

  return (
    <div className="bg-stone-900/75 border border-stone-800 rounded-xl p-3.5 space-y-3">
      {/* Header (1in8b style) */}
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-stone-300">
          Bản Đồ Cuộc Đời
        </span>
        <span className="text-[10px] font-mono uppercase tracking-wider text-stone-400">
          1 ô = 1 năm · {ageYears} / {totalCells} tuổi
        </span>
      </div>

      {/* 10-column square grid */}
      <div
        className="grid grid-cols-10 gap-1.5"
        onMouseLeave={() => setHoveredYear(null)}
      >
        {Array.from({ length: totalCells }, (_, yr) => {
          const isCurrent = yr === ageYears;
          const isLived = yr < ageYears;
          const isExpectedEnd = expectedLifespan !== undefined && yr === expectedLifespan;
          const yearMilestones = milestonesByYear.get(yr);
          const hasMilestone = Boolean(yearMilestones && yearMilestones.length > 0);
          const hap = yearlyHappiness?.[yr];
          const isSelected = selectedYear === yr;

          let cellClass =
            'bg-stone-950/80 border-stone-800/80 text-stone-600 hover:border-stone-600';
          if (isLived) {
            cellClass = getHappinessCellClass(hap);
          } else if (isCurrent) {
            cellClass =
              hap !== undefined
                ? getHappinessCellClass(hap)
                : 'bg-amber-500/25 border-rose-500 text-amber-200';
          }

          const ringClass = isCurrent
            ? 'ring-2 ring-rose-500 ring-offset-1 ring-offset-stone-900'
            : isExpectedEnd
              ? 'ring-2 ring-sky-400/90'
              : isSelected
                ? 'ring-2 ring-amber-300'
                : '';

          const glyph = hasMilestone ? getMilestoneGlyph(yearMilestones![0].title) : null;

          return (
            <button
              key={yr}
              type="button"
              onMouseEnter={() => setHoveredYear(yr)}
              onClick={() => setSelectedYear((prev) => (prev === yr ? null : yr))}
              aria-label={`Tuổi ${yr}`}
              className={`relative aspect-square w-full rounded-[4px] border flex items-center justify-center text-[10px] font-bold leading-none transition-all cursor-pointer select-none ${cellClass} ${ringClass}`}
            >
              {glyph && <span>{glyph}</span>}
            </button>
          );
        })}
      </div>

      {/* Interactive Year Inspector (hover or click any cell) */}
      {inspectedYear !== null && (
        <div className="p-2.5 rounded-lg bg-stone-950/80 border border-stone-800 space-y-1.5 text-[11px]">
          <div className="flex items-center justify-between gap-2">
            <span className="font-semibold text-amber-200">
              Tuổi {inspectedYear}
              {inspectedYear === ageYears ? ' (Hiện tại)' : ''}
              {expectedLifespan !== undefined && inspectedYear === expectedLifespan
                ? ' • Tuổi thọ kỳ vọng'
                : ''}
            </span>
            {inspectedHappiness !== undefined && (inspectedYear <= ageYears) && (
              <span className="font-mono text-[10px] text-emerald-300">
                Hạnh phúc {inspectedHappiness}% ({getHappinessLabel(inspectedHappiness)})
              </span>
            )}
          </div>

          {inspectedMilestones.length > 0 && (
            <div className="space-y-0.5">
              {inspectedMilestones.map((m, i) => (
                <div key={i} className="text-amber-300 font-medium flex items-center justify-between gap-2">
                  <span>★ {m.title}</span>
                  <span className="font-mono text-[10px] text-stone-400 shrink-0">
                    {formatCopper(m.netWorthInCopper)}
                  </span>
                </div>
              ))}
            </div>
          )}

          {inspectedLogs.length > 0 && (
            <div className="space-y-0.5 text-stone-400 leading-snug">
              {inspectedLogs.map((l, idx) => (
                <p key={idx} className="line-clamp-2">
                  • {l.text}
                </p>
              ))}
            </div>
          )}

          {inspectedMilestones.length === 0 &&
            inspectedLogs.length === 0 &&
            inspectedYear > ageYears && (
              <div className="text-stone-500">Chưa bước tới độ tuổi này.</div>
            )}
          {inspectedMilestones.length === 0 &&
            inspectedLogs.length === 0 &&
            inspectedYear <= ageYears &&
            inspectedHappiness === undefined && (
              <div className="text-stone-500">Một năm bình lặng trôi qua.</div>
            )}
        </div>
      )}

      {/* Legend (1in8b style) */}
      <div className="space-y-1 text-[10px] text-stone-500">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="flex items-center gap-1">
            <span>Ít hạnh phúc</span>
            <span className="inline-block w-2.5 h-2.5 rounded-[2px] bg-rose-900/85 border border-rose-700/70" />
            <span className="inline-block w-2.5 h-2.5 rounded-[2px] bg-amber-800/75 border border-amber-700/70" />
            <span className="inline-block w-2.5 h-2.5 rounded-[2px] bg-emerald-700/85 border border-emerald-600/70" />
            <span className="inline-block w-2.5 h-2.5 rounded-[2px] bg-emerald-500/90 border border-emerald-400" />
            <span>Hạnh phúc hơn</span>
          </span>
          <span className="text-stone-400">Chữ trong ô = Cột mốc • Chạm để xem</span>
        </div>

        {expectedLifespan !== undefined && (
          <div className="flex items-center gap-1.5 text-sky-300/90">
            <span className="inline-block w-2.5 h-2.5 rounded-[2px] border border-sky-400 ring-1 ring-sky-400/70 bg-stone-950" />
            <span>Ô có viền xanh = tuổi thọ kỳ vọng theo xuất thân: {expectedLifespan} tuổi</span>
          </div>
        )}
      </div>
    </div>
  );
}
