import { useState } from 'react';
import { RotateCcw, Award, Star, ScrollText, Users, MessageSquareQuote } from 'lucide-react';
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { buildEndingSummary } from '../engine/endingSummary';
import { ORIGIN_METADATA } from '../engine/lifeInitializer';
import { useActiveLifeStore } from '../stores/useActiveLifeStore';
import { useLegacyArchiveStore } from '../stores/useLegacyArchiveStore';
import { ColorModeToggle } from './ColorModeToggle';
import { LifeGrid } from './LifeGrid';

export function TombstoneView() {
  const life = useActiveLifeStore((s) => s.life);
  const resetLife = useActiveLifeStore((s) => s.resetLife);
  const recordCompletedLife = useLegacyArchiveStore((s) => s.recordCompletedLife);

  const [farewellNote, setFarewellNote] = useState('');
  const [savedFarewell, setSavedFarewell] = useState('');

  if (!life || life.isAlive) return null;

  const summary = buildEndingSummary(life);
  const originMeta = ORIGIN_METADATA[life.profile.originClass];

  const chartData = life.milestones.map((m) => ({
    age: `${m.ageYears}t`,
    netWorth: m.netWorthInCopper,
    fame: m.fame,
    title: m.title,
  }));
  const pinnedLogs = life.logs.filter((l) => l.pinned);

  const handleFinish = () => {
    recordCompletedLife(life, summary.titleAwarded);
    resetLife();
  };

  const summaryCells: Array<{ label: string; value: string }> = [
    { label: 'Học vấn', value: summary.educationLabel },
    { label: 'Công việc cuối cùng', value: summary.lastWorkLabel },
    { label: 'Người bạn đời', value: summary.partnerCell },
    { label: 'Con cái', value: summary.kidsCell },
    { label: 'Người tiễn đưa lần cuối', value: summary.seeOffCell },
    {
      label: 'Năm hạnh phúc nhất',
      value: summary.happiestYear
        ? `${summary.happiestYear.age} tuổi (${summary.happiestYear.score}%)`
        : 'Bình lặng qua ngày',
    },
    { label: 'Tính cách & Sở thích', value: summary.traitsAndHobbies },
    { label: 'Tài sản để lại', value: summary.assetsLeftLabel },
  ];

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 flex items-center justify-center p-4 sm:p-8">
      <div className="max-w-4xl w-full bg-stone-900/90 border border-stone-700 rounded-2xl overflow-hidden shadow-2xl">
        {/* Top Record Band (1in8b-style) */}
        <div className="bg-stone-950 border-b border-stone-800 px-6 py-3 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 font-mono uppercase tracking-wider text-amber-300">
            <ScrollText className="w-4 h-4" />
            <span>Ghi chép cuối đời · CÁO PHÓ</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="font-mono text-[11px] text-stone-400">
              Số hiệu: NK-{life.seed}-{summary.ageYears}
            </span>
            <ColorModeToggle compact />
          </div>
        </div>

        <div className="p-6 sm:p-8 space-y-6">
          {/* Identity & Epitaph */}
          <div className="text-center space-y-2 border-b border-stone-800 pb-6">
            <p className="text-xs text-stone-400 uppercase tracking-wider">
              {originMeta.label} • {summary.birthPlace}
            </p>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-amber-100">
              {life.profile.fullName}
            </h1>
            <p className="text-sm text-stone-300">
              Hưởng dương <span className="text-amber-300 font-bold">{summary.ageYears} tuổi</span>{' '}
              <span className="text-stone-500">
                (
                {summary.lifeExpectancyDiff >= 0
                  ? `+${summary.lifeExpectancyDiff} năm so với mức trung bình`
                  : `${summary.lifeExpectancyDiff} năm so với mức trung bình`}
                )
              </span>
            </p>
            <p className="text-sm text-rose-400 font-medium">
              Nguyên nhân qua đời: {life.deathReason ?? 'Mệnh số đã tận'}
            </p>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-950/60 border border-amber-700/50 text-amber-200 text-xs font-semibold mt-1">
              <Award className="w-3.5 h-3.5" />
              Danh hiệu: {summary.titleAwarded}
            </div>

            {/* Văn bia */}
            <div className="max-w-xl mx-auto pt-4 space-y-1 text-xs sm:text-sm text-stone-300 italic leading-relaxed">
              {summary.epitaphLines.map((line, i) => (
                <p key={i}>{line}</p>
              ))}
              <p className="text-stone-500 pt-1">
                Giữa chốn hồng trần vạn nẻo, một kiếp người chỉ có một lần.
              </p>
            </div>
          </div>

          {/* Lời trăn trối & Tang lễ */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {summary.lastWords && (
              <div className="p-4 rounded-xl bg-stone-950/80 border border-stone-800 space-y-1.5">
                <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-amber-300">
                  <MessageSquareQuote className="w-3.5 h-3.5" />
                  Lời trăn trối sau cùng
                </div>
                <p className="text-sm text-stone-200 italic leading-relaxed">{summary.lastWords}</p>
              </div>
            )}
            <div
              className={`p-4 rounded-xl bg-stone-950/80 border border-stone-800 space-y-1.5 ${
                !summary.lastWords ? 'md:col-span-2' : ''
              }`}
            >
              <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-stone-400">
                <Users className="w-3.5 h-3.5" />
                Tang lễ &amp; Người tiễn đưa
              </div>
              <p className="text-xs text-stone-200">{summary.attendLine}</p>
              <p className="text-xs text-stone-400 italic">{summary.saidLine}</p>
            </div>
          </div>

          {/* Bảng tóm tắt cuộc đời (.summary) */}
          <div className="space-y-2">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-stone-400">
              Tổng Kết Một Đời
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
              {summaryCells.map((cell) => (
                <div
                  key={cell.label}
                  className="p-3 rounded-lg bg-stone-950/80 border border-stone-800 space-y-1"
                >
                  <div className="text-[11px] text-stone-400">{cell.label}</div>
                  <div className="text-xs font-semibold text-stone-100 leading-snug">
                    {cell.value}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Đôi lời gửi nhân vật */}
          <div className="p-4 rounded-xl bg-stone-950/70 border border-stone-800 space-y-2">
            <label
              htmlFor="farewell-note"
              className="block text-xs font-semibold text-stone-300"
            >
              Đôi lời gửi {life.profile.fullName}
            </label>
            <div className="flex gap-2">
              <input
                id="farewell-note"
                type="text"
                maxLength={80}
                value={farewellNote}
                onChange={(e) => setFarewellNote(e.target.value)}
                placeholder="Viết một câu tiễn biệt ngắn (tối đa 80 ký tự)..."
                className="flex-1 px-3 py-1.5 rounded-lg bg-stone-900 border border-stone-700 text-xs text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-500"
              />
              <button
                type="button"
                onClick={() => setSavedFarewell(farewellNote.trim())}
                className="px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-xs font-semibold text-amber-200 transition cursor-pointer"
              >
                Lưu
              </button>
            </div>
            {savedFarewell && (
              <p className="text-xs text-amber-200/90 italic pt-1">“{savedFarewell}”</p>
            )}
          </div>

          {/* Complete Life Grid */}
          <LifeGrid
            ageYears={summary.ageYears}
            milestones={life.milestones}
            yearlyHappiness={life.yearlyHappiness}
            expectedLifespan={originMeta.expectedLifespan}
            logs={life.logs}
          />

          {/* Milestones Chart */}
          {chartData.length > 0 && (
            <div className="space-y-2">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-stone-400">
                Biểu Đồ Sử Ký Một Đời (Tài sản &amp; Thanh danh)
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
                    <Line
                      type="monotone"
                      dataKey="netWorth"
                      name="Tài sản (đồng)"
                      stroke="#f59e0b"
                      strokeWidth={2}
                    />
                    <Line
                      type="monotone"
                      dataKey="fame"
                      name="Thanh danh"
                      stroke="#38bdf8"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Pinned Logs & Thoughts */}
          {pinnedLogs.length > 0 && (
            <div className="space-y-2">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                Những Khoảnh Khắc Đáng Nhớ ({pinnedLogs.length})
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
                  const diedBefore = peer.deathAge !== undefined && peer.deathAge < summary.ageYears;
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

          {/* Chi tiết nhật ký cuộc đời này (<details> như 1in8b) */}
          <details className="rounded-xl bg-stone-950/70 border border-stone-800 p-4">
            <summary className="text-xs font-semibold text-stone-300 cursor-pointer select-none">
              Chi tiết nhật ký cuộc đời này ({life.logs.length} ghi chép)
            </summary>
            <div className="mt-3 space-y-1.5 max-h-64 overflow-y-auto pr-1">
              {life.logs.map((entry, idx) => (
                <div
                  key={idx}
                  className="text-xs text-stone-300 flex items-start gap-2 border-b border-stone-900 pb-1"
                >
                  <span className="font-mono text-[11px] text-amber-300 shrink-0">
                    {Math.floor(entry.day / 360)}t
                  </span>
                  <span>{entry.text}</span>
                </div>
              ))}
            </div>
          </details>

          <button
            type="button"
            onClick={handleFinish}
            className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold text-sm transition cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            Ghi Sử Vào Tàng Kinh Các &amp; Chào Đời Lần Nữa
          </button>
        </div>
      </div>
    </div>
  );
}
