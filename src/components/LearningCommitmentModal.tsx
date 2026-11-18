import { BookOpen, Clock, Coins, Lock, Shield, Hammer, Briefcase, X, CheckCircle2 } from 'lucide-react';
import { getAgeYears, type TimeSlot } from '../types/activeLife';
import { formatCopper } from '../engine/economy';
import { ORIGIN_METADATA } from '../engine/lifeInitializer';
import {
  getAvailableCommitments,
  markLearningAgePrompted,
  startCommitment,
} from '../engine/commitmentSystem';
import { useActiveLifeStore } from '../stores/useActiveLifeStore';

const SLOT_SHORT_LABELS: Record<TimeSlot, string> = {
  morning: 'Sáng',
  afternoon: 'Chiều',
  evening: 'Tối',
  night: 'Đêm',
};

const CATEGORY_META = {
  study: { label: 'Học vấn', icon: BookOpen, badgeClass: 'bg-sky-950/70 text-sky-300 border-sky-700/50' },
  military: { label: 'Quân ngũ', icon: Shield, badgeClass: 'bg-rose-950/70 text-rose-300 border-rose-700/50' },
  craft: { label: 'Rèn luyện · Nghề', icon: Hammer, badgeClass: 'bg-amber-950/70 text-amber-300 border-amber-700/50' },
  work: { label: 'Mưu sinh', icon: Briefcase, badgeClass: 'bg-emerald-950/70 text-emerald-300 border-emerald-700/50' },
};

interface LearningCommitmentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function LearningCommitmentModal({ isOpen, onClose }: LearningCommitmentModalProps) {
  const life = useActiveLifeStore((s) => s.life);
  const applyLifeMutation = useActiveLifeStore((s) => s.applyLifeMutation);

  if (!isOpen || !life) return null;

  const age = getAgeYears(life.profile.totalDays);
  const originLabel = ORIGIN_METADATA[life.profile.originClass].label;
  const availableFunds =
    age < 13 ? (life.family?.familyWealthCopper ?? life.assets.wealthCopper) : life.assets.wealthCopper;
  const options = getAvailableCommitments(life);

  const handleClose = () => {
    applyLifeMutation((prev) => markLearningAgePrompted(prev, age));
    onClose();
  };

  const handleSelect = (optionId: string) => {
    applyLifeMutation((prev) => {
      const marked = markLearningAgePrompted(prev, age);
      return startCommitment(marked, optionId);
    });
    onClose();
  };

  const statusTags: string[] = [originLabel, `${age} tuổi`];
  if (life.flags.includes('gia_toc_sa_sut')) statusTags.push('Gia đạo sa sút');
  if (life.flags.includes('that_sung_cung_dinh')) statusTags.push('Thất sủng cung đình');
  if (life.flags.includes('dang_lam_quan')) statusTags.push('Đang làm quan');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl bg-stone-900 border border-stone-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[88vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-stone-800 bg-stone-950/70 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-amber-200">
              {age < 13 ? 'Đăng Ký Khóa Học · Trường Lớp' : 'Khóa Học · Tòng Quân · Nâng Cao Tay Nghề'}
            </h2>
            <p className="text-xs text-stone-400 mt-1">
              Các bậc học &amp; đào tạo chỉ mở ra khi bạn đạt điều kiện tương ứng. Nếu chỉ số chưa đủ khi mãn khóa sẽ bị trượt khảo hạch.
            </p>
            <div className="flex flex-wrap items-center gap-1.5 mt-2">
              {statusTags.map((tag) => (
                <span
                  key={tag}
                  className="text-[11px] px-2 py-0.5 rounded bg-stone-800 border border-stone-700 text-stone-300"
                >
                  {tag}
                </span>
              ))}
              <span className="text-[11px] px-2 py-0.5 rounded bg-amber-950/50 border border-amber-700/50 text-amber-300 font-medium">
                Ngân lượng hiện có: {formatCopper(availableFunds)}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-200 hover:bg-stone-800 cursor-pointer"
            title="Đóng"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 overflow-y-auto space-y-3">
          {options.length === 0 ? (
            <div className="p-6 text-center text-xs text-stone-400 bg-stone-950/50 rounded-xl border border-stone-800">
              Hiện chưa có khóa học hoặc lộ trình mới phù hợp với bậc học, chỉ số và hoàn cảnh hiện tại. Hãy tiếp tục rèn luyện thêm!
            </div>
          ) : (
            options.map(({ option, eligible, reason }) => {
            const cat = CATEGORY_META[option.category];
            const Icon = cat.icon;
            return (
              <div
                key={option.id}
                className={`rounded-xl border p-3.5 transition ${
                  eligible
                    ? 'bg-stone-950/70 border-stone-700 hover:border-amber-500/70'
                    : 'bg-stone-950/30 border-stone-800/80 opacity-65'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded border font-medium ${cat.badgeClass}`}
                      >
                        <Icon className="w-3 h-3" />
                        {cat.label}
                      </span>
                      <h3 className="text-sm font-bold text-stone-100">{option.title}</h3>
                    </div>
                    <p className="text-xs text-stone-400">{option.description}</p>

                    <div className="flex flex-wrap items-center gap-3 pt-1.5 text-[11px]">
                      <span className="inline-flex items-center gap-1 text-amber-300 font-medium">
                        <Clock className="w-3 h-3" />
                        Thời hạn: {option.durationLabel}
                      </span>
                      <span className="inline-flex items-center gap-1 text-stone-300">
                        <Coins className="w-3 h-3 text-amber-400" />
                        Chi phí: {option.costCopper > 0 ? formatCopper(option.costCopper) : 'Miễn phí'}
                      </span>
                      {option.lockedSlots.length > 0 && (
                        <span className="text-sky-300">
                          Khóa buổi: {option.lockedSlots.map((s) => SLOT_SHORT_LABELS[s]).join(' + ')}
                        </span>
                      )}
                    </div>

                    <div className="text-[11px] text-emerald-300 pt-0.5 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 shrink-0" />
                      <span>{option.rewardSummary}</span>
                    </div>
                    {option.passSummary && (
                      <div className="text-[11px] text-amber-200/90 pt-0.5">
                        {option.passSummary}
                      </div>
                    )}

                    {!eligible && reason && (
                      <div className="text-[11px] text-rose-300 pt-1 flex items-center gap-1">
                        <Lock className="w-3 h-3 shrink-0" />
                        <span>{reason}</span>
                      </div>
                    )}
                  </div>

                  <button
                    type="button"
                    disabled={!eligible}
                    onClick={() => handleSelect(option.id)}
                    className={`shrink-0 px-3 py-2 rounded-lg text-xs font-bold transition ${
                      eligible
                        ? 'bg-amber-600 hover:bg-amber-500 text-stone-950 cursor-pointer'
                        : 'bg-stone-800 text-stone-500 cursor-not-allowed'
                    }`}
                  >
                    {eligible ? 'Chọn lộ trình' : 'Chưa đủ ĐK'}
                  </button>
                </div>
              </div>
            );
          })
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-stone-800 bg-stone-950/60 flex items-center justify-between text-xs text-stone-400">
          <span>Bạn có thể mở lại bảng này bất cứ lúc nào khi chưa bận khóa học/nhiệm kỳ.</span>
          <button
            type="button"
            onClick={handleClose}
            className="px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 font-medium cursor-pointer"
          >
            Để sau
          </button>
        </div>
      </div>
    </div>
  );
}
