import { Clock, XCircle } from 'lucide-react';
import { abandonCommitment } from '../engine/commitmentSystem';
import { useActiveLifeStore } from '../stores/useActiveLifeStore';

export function ActiveCommitmentBanner({
  onOpenSelector,
  buttonLabel,
}: {
  onOpenSelector: () => void;
  buttonLabel: string;
}) {
  const life = useActiveLifeStore((s) => s.life);
  const applyLifeMutation = useActiveLifeStore((s) => s.applyLifeMutation);

  if (!life || !life.isAlive) return null;

  const commitment = life.activeCommitment;

  if (!commitment) {
    return (
      <div className="flex items-center justify-between gap-2 pt-2 border-t border-stone-800/80">
        <span className="text-[11px] text-stone-400">
          Chưa đăng ký khóa học / lộ trình có thời hạn.
        </span>
        <button
          type="button"
          onClick={onOpenSelector}
          className="px-2.5 py-1 rounded-lg bg-amber-600/90 hover:bg-amber-500 text-stone-950 font-bold text-[11px] cursor-pointer shrink-0 transition"
        >
          {buttonLabel}
        </button>
      </div>
    );
  }

  const doneDays = Math.max(0, commitment.totalDays - commitment.remainingDays);
  const pct = Math.min(100, Math.round((doneDays / Math.max(1, commitment.totalDays)) * 100));

  return (
    <div className="p-2.5 rounded-lg bg-sky-950/35 border border-sky-700/50 space-y-1.5">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-sky-200">
          <Clock className="w-3.5 h-3.5 text-sky-400 shrink-0" />
          <span>{commitment.title}</span>
        </div>
        <button
          type="button"
          onClick={() => applyLifeMutation(abandonCommitment)}
          title="Bỏ dở giữa chừng (có thể bị trừ nhẹ danh vọng hoặc tinh thần)"
          className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-stone-900 hover:bg-rose-950 border border-stone-700 hover:border-rose-700 text-[10px] text-stone-300 hover:text-rose-200 cursor-pointer shrink-0 transition"
        >
          <XCircle className="w-3 h-3" />
          Bỏ dở
        </button>
      </div>
      <div className="h-1.5 rounded-full bg-stone-800 overflow-hidden">
        <div
          className="h-full bg-sky-500 transition-all duration-300"
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="flex items-center justify-between text-[10px] text-stone-400">
        <span>
          Tiến độ: {doneDays} / {commitment.totalDays} ngày ({pct}%)
        </span>
        <span className="text-sky-300 font-medium">Còn {commitment.remainingDays} ngày</span>
      </div>
    </div>
  );
}
