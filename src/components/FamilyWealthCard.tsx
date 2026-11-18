import type { ActiveLifeState, FamilyLivingTier } from '../types/activeLife';
import { formatCopper } from '../engine/economy';
import { FAMILY_TIER_LABELS } from '../engine/lifeInitializer';

export const HOUSING_NAMES: Record<string, string> = {
  gam_cau: 'Gầm cầu / Mái hiên tạm',
  nha_tranh: 'Nhà tranh vách đất',
  nha_gach: 'Nhà gạch khang trang',
  phu_de: 'Phủ đệ son thiếp',
};

const TIER_INDEX: Record<FamilyLivingTier, number> = {
  tung_thieu: 1,
  du_an: 2,
  kha_gia: 3,
  sung_tuc: 4,
  hoang_gia: 5,
};

interface FamilyWealthCardProps {
  life: ActiveLifeState;
}

export function FamilyWealthCard({ life }: FamilyWealthCardProps) {
  const family = life.family;
  const tierNum = family ? TIER_INDEX[family.familyLivingTier] ?? 1 : 1;
  const personalWealth = life.assets.wealthCopper;
  const personalRice = life.assets.rice;

  return (
    <div className="bg-stone-900/80 border border-stone-800 rounded-xl p-3.5 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-stone-400">
          Gia Sản &amp; Tài Chính
        </h3>
        {family && (
          <span className="text-[10px] text-amber-300 font-medium">
            Nhóm {tierNum}/5
          </span>
        )}
      </div>

      {/* 1in8b-style 2-column summary: Tài sản ròng & Thu nhập hằng năm */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <div className="text-[11px] text-stone-400">Tài sản ròng</div>
          <div className="text-base font-bold font-mono text-amber-100 leading-tight mt-0.5">
            {personalWealth > 0 ? formatCopper(personalWealth) : '—'}
          </div>
          <div className="text-[11px] text-stone-500 mt-0.5 leading-snug">
            Vẫn sống cùng cha mẹ
          </div>
        </div>

        <div>
          <div className="text-[11px] text-stone-400">Thu nhập hằng năm</div>
          <div className="text-base font-bold font-mono text-stone-400 leading-tight mt-0.5">
            —
          </div>
          <div className="text-[11px] text-stone-500 mt-0.5 leading-snug">
            {family
              ? `Gia cảnh: ${FAMILY_TIER_LABELS[family.familyLivingTier]} (${tierNum}/5)`
              : 'Phụ thuộc gia đình'}
          </div>
        </div>
      </div>

      {/* Giá trị gia sản của gia đình */}
      {family && (
        <div className="pt-2.5 border-t border-stone-800/80 space-y-2 text-xs">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] text-stone-400">Giá trị gia sản gia đình</span>
            <span className="font-mono font-bold text-amber-200">
              {formatCopper(family.familyWealthCopper)}
            </span>
          </div>

          {family.familyAssetsSummary && family.familyAssetsSummary.length > 0 && (
            <div className="space-y-1">
              <div className="text-[11px] text-stone-500">Điền sản &amp; cơ nghiệp</div>
              <div className="flex flex-wrap gap-1">
                {family.familyAssetsSummary.map((item, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 rounded bg-stone-950/80 border border-stone-800 text-[10px] text-stone-300"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Nơi ở & Lương thực riêng */}
      <div className="pt-2.5 border-t border-stone-800/80 space-y-1.5 text-[11px]">
        <div className="flex items-center justify-between gap-2">
          <span className="text-stone-500">Nơi ở hiện tại</span>
          <span className="text-stone-200 font-medium text-right">
            {HOUSING_NAMES[life.assets.housing] ?? life.assets.housing}
          </span>
        </div>
        {personalRice > 0 && (
          <div className="flex items-center justify-between gap-2">
            <span className="text-stone-500">Lương thực tích trữ</span>
            <span className="font-mono text-emerald-300">{personalRice} đấu gạo</span>
          </div>
        )}
      </div>
    </div>
  );
}
