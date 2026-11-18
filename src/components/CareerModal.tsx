import {
  TrendingUp,
  Store,
  LogOut,
  X,
} from 'lucide-react';
import { getAgeYears } from '../types/activeLife';
import { formatCopper } from '../engine/economy';
import { ORIGIN_METADATA } from '../engine/lifeInitializer';
import {
  canPromoteCareer,
  CAREER_CATALOG,
  CAREER_TRACK_LABELS,
  closeVenture,
  getCareerUpskillCooldownRemaining,
  promoteCareer,
  resignCareer,
  trainCurrentCareerSkill,
  upgradeVenture,
  VENTURE_CATALOG,
} from '../engine/careerSystem';
import { executeInstantAdultAction } from '../engine/adultLifeActions';
import { useActiveLifeStore } from '../stores/useActiveLifeStore';

interface CareerModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'current' | 'jobs' | 'ventures';
}

export function CareerModal({ isOpen, onClose }: CareerModalProps) {
  const life = useActiveLifeStore((s) => s.life);
  const applyLifeMutation = useActiveLifeStore((s) => s.applyLifeMutation);

  if (!isOpen || !life) return null;

  const age = getAgeYears(life.profile.totalDays);
  const originLabel = ORIGIN_METADATA[life.profile.originClass].label;
  const currentJob = life.activeCareer
    ? CAREER_CATALOG.find((j) => j.id === life.activeCareer!.jobId)
    : null;
  const currentVenture = life.activeVenture
    ? VENTURE_CATALOG.find((v) => v.id === life.activeVenture!.ventureId)
    : null;
  const promoteStatus = canPromoteCareer(life);

  return (
    <div
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl max-h-[88vh] bg-stone-900 border border-stone-700 rounded-2xl shadow-2xl flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Minimal Header (1in8b style) */}
        <div className="px-5 py-3.5 border-b border-stone-800 bg-stone-950/70 flex items-center justify-between gap-3">
          <div className="text-xs font-mono text-stone-400">
            {age} tuổi · {originLabel} · Tiền mặt{' '}
            <span className="text-amber-300 font-semibold">{formatCopper(life.assets.wealthCopper)}</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-stone-800 hover:bg-stone-700 text-xs text-stone-200 cursor-pointer"
          >
            Tạm gác lại <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Current Job / Venture Management Only (1in8b: job/biz offers go through Decision Cards) */}
        <div className="px-5 pt-2.5 pb-2 border-b border-stone-800 flex items-center justify-between gap-2 bg-stone-950/30">
          <span className="text-xs font-semibold text-emerald-200">
            Quản lý Công việc &amp; Cơ sở hiện tại
          </span>
          <span className="text-[11px] text-stone-400">
            Tìm việc / Khởi nghiệp qua Chi tiêu · đầu tư
          </span>
        </div>

        {/* Body */}
        <div className="p-5 overflow-y-auto space-y-4">
          {!currentJob && !currentVenture && (
            <div className="p-4 rounded-xl bg-stone-950/70 border border-stone-800 text-xs text-stone-300">
              Bạn hiện chưa có công việc hay cơ sở kinh doanh nào. Hãy chọn{' '}
              <span className="text-amber-300 font-semibold">Tìm chỗ làm mới</span> hoặc{' '}
              <span className="text-sky-300 font-semibold">Tìm hiểu việc khởi nghiệp</span> trong mục{' '}
              <strong>Chi tiêu · đầu tư</strong> để nhận lời mời ở kỳ quyết định tiếp theo.
            </div>
          )}

          {currentJob && life.activeCareer && (
            <div className="p-4 rounded-xl bg-stone-950/80 border border-emerald-700/50 space-y-3">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-emerald-400">
                    {CAREER_TRACK_LABELS[currentJob.track]} · Bậc {currentJob.tier}
                  </div>
                  <h3 className="text-lg font-serif font-bold text-stone-100 mt-0.5">{currentJob.title}</h3>
                  <p className="text-xs text-stone-400 mt-0.5">{currentJob.description}</p>
                </div>
                <button
                  type="button"
                  onClick={() => applyLifeMutation(resignCareer)}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-stone-900 hover:bg-rose-950/60 border border-stone-700 hover:border-rose-700 text-xs text-rose-300 cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" /> Nghỉ việc
                </button>
              </div>

              <div className="text-xs text-stone-300 font-mono">
                Đã làm {life.activeCareer.daysWorked} ngày · +{currentJob.baseDailyCopper}đ/buổi
                {currentJob.baseDailyRice ? ` + ${currentJob.baseDailyRice} gạo` : ''}
              </div>

              <div className="pt-2 border-t border-stone-800 flex flex-wrap gap-2">
                {currentJob.promoteToJobId && (
                  <button
                    type="button"
                    disabled={!promoteStatus.ok}
                    onClick={() => applyLifeMutation(promoteCareer)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:bg-stone-800 disabled:text-stone-500 text-stone-950 text-xs font-bold cursor-pointer disabled:cursor-not-allowed"
                  >
                    <TrendingUp className="w-3.5 h-3.5" />
                    {promoteStatus.ok
                      ? `Thăng tiến → ${promoteStatus.targetJob?.title}`
                      : `Thăng tiến (${promoteStatus.reason})`}
                  </button>
                )}

                {currentJob.spinoffVentureId && (
                  <button
                    type="button"
                    onClick={() => {
                      applyLifeMutation((s) => executeInstantAdultAction(s, 'inst_biz_plan').state);
                      onClose();
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-950/70 hover:bg-sky-900/70 border border-sky-700/60 text-sky-200 text-xs font-semibold cursor-pointer"
                  >
                    <Store className="w-3.5 h-3.5" />
                    Tìm hiểu tách ra khởi nghiệp (-30% vốn)
                  </button>
                )}

                {(() => {
                  const upskillCd = getCareerUpskillCooldownRemaining(life);
                  const canUpskill = upskillCd === 0 && life.assets.wealthCopper >= 120;
                  return (
                    <button
                      type="button"
                      disabled={!canUpskill}
                      onClick={() => applyLifeMutation(trainCurrentCareerSkill)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-950/70 hover:bg-amber-900/70 disabled:bg-stone-800 disabled:text-stone-500 border border-amber-700/60 disabled:border-stone-700 text-amber-200 text-xs font-semibold cursor-pointer disabled:cursor-not-allowed"
                    >
                      {upskillCd > 0
                        ? `Tu nghiệp chuyên môn (chờ ${upskillCd} ngày)`
                        : 'Học nâng cao chuyên môn (120đ · +45 ngày thâm niên)'}
                    </button>
                  );
                })()}
              </div>
            </div>
          )}

          {currentVenture && life.activeVenture && (
            <div className="p-4 rounded-xl bg-stone-950/80 border border-sky-700/50 space-y-3">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-sky-400">
                    Cơ sở Tự doanh · Cấp {life.activeVenture.level}/3
                  </div>
                  <h3 className="text-lg font-serif font-bold text-stone-100 mt-0.5">{currentVenture.title}</h3>
                  <p className="text-xs text-stone-400 mt-0.5">{currentVenture.description}</p>
                </div>
                <button
                  type="button"
                  onClick={() => applyLifeMutation(closeVenture)}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-stone-900 hover:bg-rose-950/60 border border-stone-700 hover:border-rose-700 text-xs text-rose-300 cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" /> Sang nhượng (+50% vốn)
                </button>
              </div>
              <div className="flex flex-wrap items-center gap-3 text-xs font-mono text-stone-300">
                <span>Đã mở {life.activeVenture.daysOperated} ngày · Lời +{Math.round((life.activeVenture.level - 1) * 25)}%</span>
                {life.activeVenture.level < 3 && (
                  <button
                    type="button"
                    disabled={
                      life.assets.wealthCopper <
                      currentVenture.upgradeBaseCopper * life.activeVenture.level
                    }
                    onClick={() => applyLifeMutation(upgradeVenture)}
                    className="px-3 py-1 rounded-lg bg-sky-600 hover:bg-sky-500 disabled:bg-stone-800 disabled:text-stone-500 text-stone-950 font-sans font-bold cursor-pointer disabled:cursor-not-allowed"
                  >
                    Mở rộng Cấp {life.activeVenture.level + 1} (
                    {formatCopper(currentVenture.upgradeBaseCopper * life.activeVenture.level)})
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
