import type { ActiveLifeState } from '../../types/activeLife';
import { getExamEligibility, takeExam, toggleCrossDress } from '../../engine/progressionModules';

export function ExamPanel({
  life,
  applyLifeMutation,
}: {
  life: ActiveLifeState;
  applyLifeMutation: (fn: (s: ActiveLifeState) => ActiveLifeState) => void;
}) {
  const huongElig = getExamEligibility(life, 'huong');
  const hoiElig = getExamEligibility(life, 'hoi');
  const dinhElig = getExamEligibility(life, 'dinh');

  return (
        <div className="p-3 rounded-lg bg-stone-950/80 border border-stone-800 space-y-2.5 text-xs">
          {life.profile.gender === 'female' &&
            !life.flags.includes('nu_cai_nam_trang') &&
            !life.flags.includes('nu_quan_dac_xa') && (
              <div className="flex items-center justify-between gap-2 p-2 rounded bg-amber-950/30 border border-amber-700/40">
                <span className="text-amber-200">
                  Nữ giới muốn dự thi cần cải nam trang (rủi ro bại lộ tăng dần).
                </span>
                <button
                  type="button"
                  disabled={life.stats.education < 15}
                  onClick={() => applyLifeMutation(toggleCrossDress)}
                  className="px-2.5 py-1 rounded bg-amber-600 text-stone-950 font-bold shrink-0 cursor-pointer disabled:opacity-40"
                >
                  Cải nam trang
                </button>
              </div>
            )}

          {life.flags.includes('nu_cai_nam_trang') && (
            <div className="text-rose-300">
              Rủi ro bại lộ thân phận nữ nhi hiện tại: <strong>{life.exposureRisk}% / năm</strong>
            </div>
          )}

          <div className="grid gap-2">
            <button
              type="button"
              disabled={!huongElig.ok}
              onClick={() => applyLifeMutation((s) => takeExam(s, 'huong'))}
              className="w-full text-left p-2.5 rounded bg-stone-900 border border-stone-700 hover:border-emerald-500 disabled:opacity-45 cursor-pointer"
            >
              <div className="font-semibold text-emerald-300">Ứng thí Thi Hương (-200đ)</div>
              <div className="text-[11px] text-stone-400">
                {huongElig.ok ? 'Đủ điều kiện ứng thí ngay!' : huongElig.reason}
              </div>
            </button>

            <button
              type="button"
              disabled={!hoiElig.ok}
              onClick={() => applyLifeMutation((s) => takeExam(s, 'hoi'))}
              className="w-full text-left p-2.5 rounded bg-stone-900 border border-stone-700 hover:border-emerald-500 disabled:opacity-45 cursor-pointer"
            >
              <div className="font-semibold text-emerald-300">Ứng thí Thi Hội (-1.000đ)</div>
              <div className="text-[11px] text-stone-400">
                {hoiElig.ok ? 'Đủ điều kiện vào trường thi Kinh đô!' : hoiElig.reason}
              </div>
            </button>

            <button
              type="button"
              disabled={!dinhElig.ok}
              onClick={() => applyLifeMutation((s) => takeExam(s, 'dinh'))}
              className="w-full text-left p-2.5 rounded bg-stone-900 border border-stone-700 hover:border-emerald-500 disabled:opacity-45 cursor-pointer"
            >
              <div className="font-semibold text-emerald-300">Vào Điện thí Thi Đình</div>
              <div className="text-[11px] text-stone-400">
                {dinhElig.ok ? 'Hoàng thượng đang chờ ngự thí!' : dinhElig.reason}
              </div>
            </button>
          </div>
        </div>
  );
}
