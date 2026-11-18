import { RotateCcw, Skull, Award, Star } from 'lucide-react';
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { getAgeYears } from '../types/activeLife';
import { formatCopper } from '../engine/economy';
import { ORIGIN_METADATA } from '../engine/lifeInitializer';
import { useActiveLifeStore } from '../stores/useActiveLifeStore';
import { useLegacyArchiveStore } from '../stores/useLegacyArchiveStore';
import { ColorModeToggle } from './ColorModeToggle';
import { LifeGrid } from './LifeGrid';

function computeFinalTitle(ageYears: number, fame: number, originLabel: string): string {
  if (ageYears < 13) return 'Yểu mệnh thuở thiếu thời';
  if (fame >= 80) return 'Danh chấn thiên hạ';
  if (ageYears >= 70) return `Thọ chung chính tẩm (${originLabel})`;
  return `Một kiếp phong trần (${originLabel})`;
}

export function TombstoneView() {
  const life = useActiveLifeStore((s) => s.life);
  const resetLife = useActiveLifeStore((s) => s.resetLife);
  const recordCompletedLife = useLegacyArchiveStore((s) => s.recordCompletedLife);

  if (!life || life.isAlive) return null;

  const ageYears = getAgeYears(life.profile.totalDays);
  const originMeta = ORIGIN_METADATA[life.profile.originClass];
  const titleAwarded = computeFinalTitle(ageYears, life.stats.fame, originMeta.label);

  const chartData = life.milestones.map((m) => ({
    age: `${m.ageYears}t`,
    netWorth: m.netWorthInCopper,
    fame: m.fame,
    title: m.title,
  }));
  const pinnedLogs = life.logs.filter((l) => l.pinned);

  const handleFinish = () => {
    recordCompletedLife(life, titleAwarded);
    resetLife();
  };

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 flex items-center justify-center p-4 sm:p-8">
      <div className="max-w-3xl w-full bg-stone-900/90 border border-stone-700 rounded-2xl p-6 sm:p-8 space-y-6 shadow-2xl">
        <div className="flex justify-end">
          <ColorModeToggle compact />
        </div>
        <div className="text-center space-y-2 border-b border-stone-800 pb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-stone-800 text-stone-300 mb-1">
            <Skull className="w-6 h-6" />
          </div>
          <h1 className="font-serif text-3xl font-bold text-amber-100">{life.profile.fullName}</h1>
          <p className="text-sm text-stone-400">
            Xuất thân: <span className="text-amber-300">{originMeta.label}</span> • Hưởng dương:{' '}
            <span className="text-stone-100 font-semibold">{ageYears} tuổi</span>
          </p>
          <p className="text-sm text-rose-400 font-medium">Nguyên nhân: {life.deathReason}</p>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-950/60 border border-amber-700/50 text-amber-200 text-xs font-semibold mt-2">
            <Award className="w-3.5 h-3.5" />
            Danh hiệu: {titleAwarded}
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-center">
          <div className="p-3 rounded-lg bg-stone-950 border border-stone-800">
            <div className="text-[11px] text-stone-400">Tài sản lúc mất</div>
            <div className="text-sm font-bold text-amber-300 mt-0.5">
              {formatCopper(life.assets.wealthCopper)}
            </div>
          </div>
          <div className="p-3 rounded-lg bg-stone-950 border border-stone-800">
            <div className="text-[11px] text-stone-400">Học thức</div>
            <div className="text-sm font-bold text-emerald-300 mt-0.5">
              {Math.round(life.stats.education)}%
            </div>
          </div>
          <div className="p-3 rounded-lg bg-stone-950 border border-stone-800 col-span-2 sm:col-span-1">
            <div className="text-[11px] text-stone-400">Thanh danh</div>
            <div className="text-sm font-bold text-sky-300 mt-0.5">{Math.round(life.stats.fame)}</div>
          </div>
        </div>

        {/* Milestones Chart */}
        {chartData.length > 0 && (
          <div className="space-y-2">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-stone-400">
              Biểu Đồ Sử Ký Một Đời (Tài sản & Thanh danh)
            </h2>
            <div className="h-56 w-full bg-stone-950/80 border border-stone-800 rounded-xl p-3">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#292524" />
                  <XAxis dataKey="age" stroke="#a8a29e" fontSize={11} />
                  <YAxis stroke="#a8a29e" fontSize={11} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1c1917',
                      borderColor: '#44403c',
                      fontSize: '12px',
                    }}
                  />
                  <Line type="monotone" dataKey="netWorth" name="Tài sản (đồng)" stroke="#f59e0b" strokeWidth={2} />
                  <Line type="monotone" dataKey="fame" name="Thanh danh" stroke="#38bdf8" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Complete Life Grid */}
        <LifeGrid
          ageYears={ageYears}
          milestones={life.milestones}
          yearlyHappiness={life.yearlyHappiness}
          expectedLifespan={originMeta.expectedLifespan}
          logs={life.logs}
        />

        {/* Pinned Logs & Thoughts */}
        {pinnedLogs.length > 0 && (
          <div className="space-y-2">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              Ký Ức Đã Gắn Sao ({pinnedLogs.length})
            </h2>
            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
              {pinnedLogs.map((entry, idx) => (
                <div
                  key={idx}
                  className="p-2.5 rounded-lg bg-stone-950 border border-stone-800 text-xs flex items-start gap-2.5"
                >
                  <span className="font-mono text-[11px] font-bold text-amber-300 shrink-0">
                    {Math.floor(entry.day / 360)}t
                  </span>
                  <span className="text-stone-200 leading-snug">{entry.text}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Cohort Peers Comparison */}
        {life.cohortPeers && life.cohortPeers.length > 0 && (
          <div className="space-y-2">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-stone-400">
              Đối Chiếu Người Đồng Niên
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {life.cohortPeers.map((peer) => {
                const diedBefore = peer.deathAge !== undefined && peer.deathAge < ageYears;
                return (
                  <div
                    key={peer.id}
                    className="p-2.5 rounded-lg bg-stone-950/80 border border-stone-800 flex items-center justify-between gap-2 text-xs"
                  >
                    <div className="min-w-0">
                      <div className="font-medium text-stone-200 truncate">{peer.name}</div>
                      <div className="text-[10px] text-stone-500 truncate">{peer.originLabel}</div>
                    </div>
                    <span
                      className={`text-[11px] shrink-0 ${
                        diedBefore ? 'text-stone-400' : 'text-emerald-300'
                      }`}
                    >
                      {peer.deathAge !== undefined
                        ? `Thọ ${peer.deathAge} tuổi`
                        : 'Vẫn còn sống'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={handleFinish}
          className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold text-sm transition cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" />
          Ghi Sử Vào Tàng Kinh Các & Đầu Thai Kiếp Mới
        </button>
      </div>
    </div>
  );
}
