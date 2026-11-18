import { useEffect, useState } from 'react';
import {
  TrendingUp,
  Store,
  Lock,
  LogOut,
  X,
} from 'lucide-react';
import { getAgeYears } from '../types/activeLife';
import { formatCopper } from '../engine/economy';
import { ORIGIN_METADATA } from '../engine/lifeInitializer';
import {
  attemptApplyForCareer,
  canPromoteCareer,
  CAREER_CATALOG,
  CAREER_TRACK_LABELS,
  closeVenture,
  getAvailableCareers,
  getAvailableVentures,
  getCareerAcceptanceChance,
  getCareerUpskillCooldownRemaining,
  getJobApplyCooldownRemaining,
  getRecommendedCareerOffers,
  promoteCareer,
  resignCareer,
  startVenture,
  trainCurrentCareerSkill,
  upgradeVenture,
  VENTURE_CATALOG,
} from '../engine/careerSystem';
import { useActiveLifeStore } from '../stores/useActiveLifeStore';

interface CareerModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'current' | 'jobs' | 'ventures';
}

export function CareerModal({ isOpen, onClose, initialTab }: CareerModalProps) {
  const life = useActiveLifeStore((s) => s.life);
  const applyLifeMutation = useActiveLifeStore((s) => s.applyLifeMutation);

  const hasCurrent = Boolean(life?.activeCareer || life?.activeVenture);
  const [activeTab, setActiveTab] = useState<'current' | 'jobs' | 'ventures'>(
    initialTab ?? (hasCurrent ? 'current' : 'jobs'),
  );
  const [showAllJobs, setShowAllJobs] = useState(false);
  const [jobFeedback, setJobFeedback] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setJobFeedback(null);
      if (initialTab) setActiveTab(initialTab);
    }
  }, [isOpen, initialTab]);

  if (!isOpen || !life) return null;

  const age = getAgeYears(life.profile.totalDays);
  const originLabel = ORIGIN_METADATA[life.profile.originClass].label;
  const recommendedOffers = getRecommendedCareerOffers(life, 5);
  const allCareers = getAvailableCareers(life);
  const ventures = getAvailableVentures(life);
  const currentJob = life.activeCareer
    ? CAREER_CATALOG.find((j) => j.id === life.activeCareer!.jobId)
    : null;
  const currentVenture = life.activeVenture
    ? VENTURE_CATALOG.find((v) => v.id === life.activeVenture!.ventureId)
    : null;
  const promoteStatus = canPromoteCareer(life);

  const effectiveTab =
    activeTab === 'current' && !currentJob && !currentVenture ? 'jobs' : activeTab;

  const displayedJobs = showAllJobs ? allCareers : recommendedOffers;

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

        {/* Simple Mode Tabs */}
        <div className="px-5 pt-2.5 pb-2 border-b border-stone-800 flex flex-wrap gap-2 bg-stone-950/30">
          {(currentJob || currentVenture) && (
            <button
              type="button"
              onClick={() => setActiveTab('current')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold border cursor-pointer transition ${
                effectiveTab === 'current'
                  ? 'bg-emerald-950/70 border-emerald-500 text-emerald-200'
                  : 'bg-stone-950 border-stone-700 text-stone-300 hover:border-stone-500'
              }`}
            >
              Công việc hiện tại
            </button>
          )}
          <button
            type="button"
            onClick={() => setActiveTab('jobs')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold border cursor-pointer transition ${
              effectiveTab === 'jobs'
                ? 'bg-amber-950/70 border-amber-500 text-amber-200'
                : 'bg-stone-950 border-stone-700 text-stone-300 hover:border-stone-500'
            }`}
          >
            Chọn chỗ làm
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('ventures')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold border cursor-pointer transition ${
              effectiveTab === 'ventures'
                ? 'bg-sky-950/70 border-sky-500 text-sky-200'
                : 'bg-stone-950 border-stone-700 text-stone-300 hover:border-stone-500'
            }`}
          >
            Khởi nghiệp
          </button>
        </div>

        {/* Body */}
        <div className="p-5 overflow-y-auto space-y-4">
          {/* TAB 1: CURRENT CAREER & ADVANCED OPTIONS */}
          {effectiveTab === 'current' && (currentJob || currentVenture) && (
            <div className="space-y-4">
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
                        onClick={() => setActiveTab('ventures')}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-950/70 hover:bg-sky-900/70 border border-sky-700/60 text-sky-200 text-xs font-semibold cursor-pointer"
                      >
                        <Store className="w-3.5 h-3.5" />
                        Tách ra khởi nghiệp (-30% vốn)
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
          )}

          {/* TAB 2: 1IN8B-STYLE JOB OFFER LIST */}
          {effectiveTab === 'jobs' && (
            <div className="space-y-3">
              <div>
                <h3 className="text-xl font-serif font-bold text-stone-100">
                  {life.activeCareer ? 'Tìm chỗ làm mới' : 'Chọn công việc phù hợp'}
                </h3>
                <p className="text-xs text-stone-400 mt-1">
                  Học thức {Math.round(life.stats.education)} · Võ nghệ {Math.round(life.stats.martial)} · Thương tài {Math.round(life.stats.craftTrade)} · Quan hệ {Math.round(life.stats.relationships)}. Đây là những việc phù hợp với hoàn cảnh và người quen của bạn.
                </p>
              </div>

              {jobFeedback && (
                <div className="p-3 rounded-lg bg-rose-950/50 border border-rose-700/60 text-xs text-rose-200">
                  {jobFeedback}
                </div>
              )}

              <div className="space-y-2">
                {displayedJobs.map((opt, idx) => {
                  const { job, eligible, unlockedVia, lockReason, isCurrent } = opt;
                  const cd = getJobApplyCooldownRemaining(life, job.id);
                  const chance = eligible ? getCareerAcceptanceChance(life, opt) : 0;
                  const disabled = !eligible || isCurrent || cd > 0;
                  return (
                  <button
                    key={job.id}
                    type="button"
                    disabled={disabled}
                    onClick={() => {
                      const res = attemptApplyForCareer(life, job.id);
                      applyLifeMutation(() => res.state);
                      if (res.hired) {
                        onClose();
                      } else {
                        setJobFeedback(res.message);
                      }
                    }}
                    className={`w-full text-left p-3.5 rounded-xl border transition flex items-start gap-3 ${
                      isCurrent
                        ? 'bg-emerald-950/30 border-emerald-600/60'
                        : !disabled
                          ? 'bg-stone-950/75 hover:bg-stone-800/80 border-stone-700 hover:border-amber-500/70 cursor-pointer'
                          : 'bg-stone-950/35 border-stone-800/70 opacity-55 cursor-not-allowed'
                    }`}
                  >
                    <span className="text-xs font-mono text-stone-500 mt-0.5 w-4 shrink-0">
                      {idx + 1}
                    </span>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-bold text-stone-100">{job.title}</span>
                        <span className="text-xs font-mono text-emerald-300 shrink-0">
                          +{job.baseDailyCopper}đ/buổi{job.baseDailyRice ? ` + ${job.baseDailyRice} gạo` : ''}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-stone-400">
                        <span>
                          {CAREER_TRACK_LABELS[job.track]}
                          {unlockedVia ? ` · ${unlockedVia}` : ''}
                        </span>
                        {eligible && !isCurrent && (
                          <span className={`font-mono text-[11px] ${cd > 0 ? 'text-rose-400' : 'text-amber-300'}`}>
                            {cd > 0 ? `Chờ ${cd} ngày` : `Tỷ lệ nhận: ${chance}%`}
                          </span>
                        )}
                      </div>
                      {!eligible && lockReason && (
                        <div className="text-[11px] text-rose-300 flex items-center gap-1">
                          <Lock className="w-3 h-3 shrink-0" />
                          <span>{lockReason}</span>
                        </div>
                      )}
                    </div>
                  </button>
                  );
                })}

                <button
                  type="button"
                  onClick={onClose}
                  className="w-full text-left p-3.5 rounded-xl border border-stone-800 bg-stone-950/50 hover:bg-stone-800/60 transition flex items-start gap-3 cursor-pointer"
                >
                  <span className="text-xs font-mono text-stone-500 mt-0.5 w-4 shrink-0">
                    {displayedJobs.length + 1}
                  </span>
                  <div>
                    <div className="text-sm font-bold text-stone-200">Chờ một công việc tốt hơn</div>
                    <div className="text-xs text-stone-400">Tạm giữ nguyên lịch hiện tại, tự rèn luyện thêm rồi quay lại sau</div>
                  </div>
                </button>
              </div>

              <div className="pt-1 flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowAllJobs((v) => !v)}
                  className="text-xs text-sky-400 hover:text-sky-300 cursor-pointer"
                >
                  {showAllJobs
                    ? 'Chỉ hiện việc phù hợp nhất'
                    : `Xem tất cả nghề nghiệp (${allCareers.length})`}
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: STARTUP / VENTURES */}
          {effectiveTab === 'ventures' && (
            <div className="space-y-3">
              <div>
                <h3 className="text-xl font-serif font-bold text-stone-100">Tìm hiểu việc khởi nghiệp</h3>
                <p className="text-xs text-stone-400 mt-1">
                  Cân nhắc mô hình kinh doanh vừa túi tiền. Nếu đã có kinh nghiệm trong nghề liên quan, vốn khởi nghiệp được giảm 30%.
                </p>
              </div>
              <div className="space-y-2">
                {ventures.map(
                  ({ venture, effectiveCapitalCopper, hasSpinoffDiscount, eligible, lockReason, isCurrent }, idx) => (
                    <button
                      key={venture.id}
                      type="button"
                      disabled={!eligible || isCurrent}
                      onClick={() => {
                        applyLifeMutation((s) => startVenture(s, venture.id));
                        onClose();
                      }}
                      className={`w-full text-left p-3.5 rounded-xl border transition flex items-start gap-3 ${
                        isCurrent
                          ? 'bg-sky-950/30 border-sky-600/60'
                          : eligible
                            ? 'bg-stone-950/75 hover:bg-stone-800/80 border-stone-700 hover:border-sky-500/70 cursor-pointer'
                            : 'bg-stone-950/35 border-stone-800/70 opacity-55 cursor-not-allowed'
                      }`}
                    >
                      <span className="text-xs font-mono text-stone-500 mt-0.5 w-4 shrink-0">
                        {idx + 1}
                      </span>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-sm font-bold text-stone-100">{venture.title}</span>
                          <span className="text-xs font-mono text-amber-300 shrink-0">
                            Vốn {formatCopper(effectiveCapitalCopper)}
                            {hasSpinoffDiscount ? ' (-30%)' : ''}
                          </span>
                        </div>
                        <div className="text-xs text-stone-400">
                          {venture.description} · Thu +{venture.baseDailyCopper}đ/buổi
                          {venture.baseDailyRice ? ` + ${venture.baseDailyRice} gạo` : ''}
                        </div>
                        {!eligible && lockReason && (
                          <div className="text-[11px] text-rose-300 flex items-center gap-1">
                            <Lock className="w-3 h-3 shrink-0" />
                            <span>{lockReason}</span>
                          </div>
                        )}
                      </div>
                    </button>
                  ),
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
