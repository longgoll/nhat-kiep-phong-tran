import { useState } from 'react';
import { GraduationCap, Store, Landmark, Flame } from 'lucide-react';
import { getAgeYears } from '../types/activeLife';
import { useActiveLifeStore } from '../stores/useActiveLifeStore';
import { ExamPanel } from './progression/ExamPanel';
import { GuildAndPropertyPanel } from './progression/GuildAndPropertyPanel';
import { OfficialCourtPanel } from './progression/OfficialCourtPanel';
import { RebellionPanel } from './progression/RebellionPanel';

export function ProgressionModules() {
  const life = useActiveLifeStore((s) => s.life);
  const applyLifeMutation = useActiveLifeStore((s) => s.applyLifeMutation);
  const [activeTab, setActiveTab] = useState<'exam' | 'trade' | 'court' | 'rebel' | null>('trade');

  if (!life) return null;

  const ageYears = getAgeYears(life.profile.totalDays);
  const canExam =
    life.officialRank === 0 &&
    (life.stats.education >= 10 ||
      life.stats.martial >= 15 ||
      life.flags.includes('duoc_thay_do_quy') ||
      life.flags.includes('do_cu_nhan') ||
      life.flags.includes('do_cong_si'));
  const canTrade = true;
  const canCourt =
    life.officialRank > 0 ||
    life.flags.includes('do_tu_tai') ||
    life.flags.includes('do_cu_nhan') ||
    life.flags.includes('do_tien_si') ||
    life.flags.includes('trong_quan_ngu') ||
    (life.profile.originClass === 'hoang_toc' &&
      ageYears >= 16 &&
      !life.flags.includes('thai_giam') &&
      !life.flags.includes('trong_hau_cung'));
  const canRebel = life.stats.fame >= 70 || life.stats.infamy >= 70;
  const effectiveTab =
    activeTab === 'exam' && !canExam
      ? canCourt
        ? 'court'
        : 'trade'
      : activeTab;

  if (!canExam && !canTrade && !canCourt && !canRebel) {
    return null;
  }

  return (
    <div className="bg-stone-900/75 border border-stone-800 rounded-xl p-4 space-y-3">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-stone-400">
        Sự Nghiệp · Sản Nghiệp
      </h3>

      <div className="flex flex-wrap gap-2">
        {canExam && (
          <button
            type="button"
            onClick={() => setActiveTab(effectiveTab === 'exam' ? null : 'exam')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border cursor-pointer transition ${
              effectiveTab === 'exam'
                ? 'bg-emerald-950/60 border-emerald-500 text-emerald-200'
                : 'bg-stone-950 border-stone-700 text-stone-300 hover:border-stone-500'
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5" /> Khoa cử
          </button>
        )}
        {canTrade && (
          <button
            type="button"
            onClick={() => setActiveTab(effectiveTab === 'trade' ? null : 'trade')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border cursor-pointer transition ${
              effectiveTab === 'trade'
                ? 'bg-amber-950/60 border-amber-500 text-amber-200'
                : 'bg-stone-950 border-stone-700 text-stone-300 hover:border-stone-500'
            }`}
          >
            <Store className="w-3.5 h-3.5" /> {life.officialRank > 0 ? 'Điền sản & Chỗ ở' : 'Đầu tư & Cho thuê'}
          </button>
        )}
        {canCourt && (
          <button
            type="button"
            onClick={() => setActiveTab(effectiveTab === 'court' ? null : 'court')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border cursor-pointer transition ${
              effectiveTab === 'court'
                ? 'bg-sky-950/60 border-sky-500 text-sky-200'
                : 'bg-stone-950 border-stone-700 text-stone-300 hover:border-stone-500'
            }`}
          >
            <Landmark className="w-3.5 h-3.5" /> Công đường
          </button>
        )}
        {canRebel && (
          <button
            type="button"
            onClick={() => setActiveTab(effectiveTab === 'rebel' ? null : 'rebel')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border cursor-pointer transition ${
              effectiveTab === 'rebel'
                ? 'bg-rose-950/60 border-rose-500 text-rose-200'
                : 'bg-stone-950 border-stone-700 text-stone-300 hover:border-stone-500'
            }`}
          >
            <Flame className="w-3.5 h-3.5" /> Mật thất Khởi nghĩa
          </button>
        )}
      </div>

      {effectiveTab === 'exam' && <ExamPanel life={life} applyLifeMutation={applyLifeMutation} />}
      {effectiveTab === 'trade' && <GuildAndPropertyPanel life={life} applyLifeMutation={applyLifeMutation} />}
      {effectiveTab === 'court' && <OfficialCourtPanel life={life} applyLifeMutation={applyLifeMutation} />}
      {effectiveTab === 'rebel' && <RebellionPanel life={life} applyLifeMutation={applyLifeMutation} />}
    </div>
  );
}
