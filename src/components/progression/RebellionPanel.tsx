import type { ActiveLifeState } from '../../types/activeLife';
import { formatCopper } from '../../engine/economy';
import {
  canRecruitRebellionArmy,
  contributeRebellionTreasury,
  getRebellionSuccessChance,
  launchRebellion,
  recruitRebellionArmy,
} from '../../engine/progressionModules';

export function RebellionPanel({
  life,
  applyLifeMutation,
}: {
  life: ActiveLifeState;
  applyLifeMutation: (fn: (s: ActiveLifeState) => ActiveLifeState) => void;
}) {
  const rebelChance = Math.round(getRebellionSuccessChance(life) * 100);
  const recruitElig = canRecruitRebellionArmy(life);

  return (
          <div className="p-3 rounded-lg bg-stone-950/80 border border-rose-900/50 space-y-3 text-xs">
            <div className="grid grid-cols-2 gap-2">
              <div className="p-2 rounded bg-stone-900 border border-stone-800">
                <div className="text-stone-400">Ngân khố mật thất</div>
                <div className="font-mono text-amber-300 font-bold">
                  {formatCopper(life.rebellion?.treasuryCopper ?? 0)} / 10 Vàng
                </div>
              </div>
              <div className="p-2 rounded bg-stone-900 border border-stone-800">
                <div className="text-stone-400">Binh quyền &amp; Tử sĩ (Nuôi: {(life.rebellion?.armyPower ?? 0) * 45}đ/tháng)</div>
                <div className="font-mono text-rose-300 font-bold">
                  {life.rebellion?.armyPower ?? 0} / 100
                </div>
              </div>
            </div>

            {!recruitElig.ok && recruitElig.reason && (
              <div className="text-[11px] text-rose-300">{recruitElig.reason}</div>
            )}

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                disabled={life.assets.wealthCopper < 10000}
                onClick={() => applyLifeMutation((s) => contributeRebellionTreasury(s, 10000))}
                className="px-3 py-1.5 rounded bg-stone-800 hover:bg-stone-700 disabled:opacity-40 cursor-pointer"
              >
                Góp 10.000đ vào mật thất
              </button>
              <button
                type="button"
                disabled={!recruitElig.ok}
                onClick={() => applyLifeMutation(recruitRebellionArmy)}
                className="px-3 py-1.5 rounded bg-stone-800 hover:bg-stone-700 disabled:opacity-40 cursor-pointer"
              >
                Chiêu mộ 10 tử sĩ (-25.000đ kho, +10 Binh quyền)
              </button>
            </div>

            <button
              type="button"
              onClick={() => applyLifeMutation(launchRebellion)}
              className="w-full py-2.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold cursor-pointer"
            >
              Phất Cờ Khởi Nghĩa! (Tỷ lệ thành công ước tính: {rebelChance}%)
            </button>
          </div>
  );
}
