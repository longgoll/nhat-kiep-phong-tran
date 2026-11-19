import type { ActiveLifeState, FamilyLivingTier } from '../types/activeLife';
import { computeFamilyMonthlyNetCopper } from '../engine/childhoodEngine';
import { formatCopper } from '../engine/economy';
import { FAMILY_TIER_LABELS, getHousingDisplayLabel } from '../engine/lifeInitializer';
import {
  getOfficialResidenceLabel,
  getOfficialShortPostingPlace,
  isOfficialPostedAway,
} from '../engine/officialSystem';

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
  const familyCashflow = family ? computeFamilyMonthlyNetCopper(life) : null;
  const annualFamilyNet = familyCashflow ? familyCashflow.net * 12 : 0;

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

      {/* 1in8b-style 2-column summary: Tài sản / Quỹ gia sản & Thu nhập hằng năm */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <div className="text-[11px] text-stone-400">
            {personalWealth === 0 && family ? 'Quỹ gia sản nhà' : 'Tài sản ròng'}
          </div>
          <div className="text-base font-bold font-mono text-amber-100 leading-tight mt-0.5">
            {personalWealth > 0
              ? formatCopper(personalWealth)
              : family
                ? formatCopper(family.familyWealthCopper)
                : '—'}
          </div>
          <div className="text-[11px] text-stone-500 mt-0.5 leading-snug">
            {(() => {
              if (life.flags.includes('tung_o_do')) return 'Đang đi ở đợ nhà địa chủ';
              if (life.official && isOfficialPostedAway(life)) {
                const place = getOfficialShortPostingPlace(life.official.track, life.official.posting);
                return life.official.familyAccompanied
                  ? `Đang sống cùng gia quyến tại ${place}`
                  : `Tạm xa gia đình · Đang nhậm chức tại ${place}`;
              }
              if (life.flags.includes('da_ra_o_rieng') || life.flags.includes('da_khai_phu_hoang_toc')) {
                return 'Đã tách hộ lập phủ riêng';
              }
              const fAlive =
                !life.flags.includes('mo_coi_cha') &&
                life.npcs.some((n) => n.id === 'npc_father' && n.isAlive);
              const mAlive =
                !life.flags.includes('mo_coi_me') &&
                life.npcs.some((n) => n.id === 'npc_mother' && n.isAlive);
              if (fAlive && mAlive) return 'Vẫn sống cùng cha mẹ';
              if (fAlive) return 'Đang sống cùng cha';
              if (mAlive) return 'Đang sống cùng mẹ';
              return 'Sống cùng người thân / tự lập';
            })()}
          </div>
        </div>

        <div>
          <div className="text-[11px] text-stone-400">Thu nhập gia đình / năm</div>
          <div
            className={`text-base font-bold font-mono leading-tight mt-0.5 ${
              !familyCashflow
                ? 'text-stone-400'
                : annualFamilyNet > 0
                  ? 'text-emerald-300'
                  : annualFamilyNet < 0
                    ? 'text-rose-400'
                    : 'text-stone-300'
            }`}
          >
            {!familyCashflow
              ? '—'
              : `${annualFamilyNet > 0 ? '+' : annualFamilyNet < 0 ? '-' : ''}${formatCopper(Math.abs(annualFamilyNet))}`}
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
          {personalWealth > 0 && (
            <div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] text-stone-400">Quỹ gia sản tích lũy</span>
                <span className="font-mono font-bold text-amber-200">
                  {formatCopper(family.familyWealthCopper)}
                </span>
              </div>
              <div className="text-[10px] text-stone-500 leading-snug">
                Tổng tiền &amp; tài sản sẵn có của nhà (tăng/giảm theo tích lũy ròng &amp; biến cố)
              </div>
            </div>
          )}

          {familyCashflow && (() => {
            const fatherDead =
              life.flags.includes('mo_coi_cha') ||
              !life.npcs.some((n) => n.id === 'npc_father' && n.isAlive);
            const motherDead =
              life.flags.includes('mo_coi_me') ||
              !life.npcs.some((n) => n.id === 'npc_mother' && n.isAlive);
            return (
              <div className="rounded-lg bg-stone-950/60 border border-stone-800/70 p-2 space-y-1 text-[11px]">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-stone-400 truncate">
                    Cha ({family.fatherOccupationLabel ?? 'Không rõ'}){fatherDead ? ' · Đã mất' : ''}
                  </span>
                  <span className={`font-mono shrink-0 ${fatherDead ? 'text-stone-500' : 'text-emerald-300'}`}>
                    {fatherDead ? '0đ' : `+${formatCopper(familyCashflow.fatherIncome)}/tháng`}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-stone-400 truncate">
                    Mẹ ({family.motherOccupationLabel ?? 'Nội trợ'}){motherDead ? ' · Đã mất' : ''}
                  </span>
                  <span className={`font-mono shrink-0 ${motherDead ? 'text-stone-500' : 'text-emerald-300'}`}>
                    {motherDead
                      ? '0đ'
                      : familyCashflow.motherIncome > 0
                        ? `+${formatCopper(familyCashflow.motherIncome)}/tháng`
                        : 'Nội trợ (0đ)'}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-2 pt-0.5 border-t border-stone-800/60">
                  <span className="text-stone-400">
                    Chi tiêu ({familyCashflow.mouthsToFeed} nhân khẩu: bạn &amp; {Math.max(0, familyCashflow.mouthsToFeed - 1)} người thân)
                    {familyCashflow.foodSelfSufficient ? ' · Tự túc gạo' : ''}
                  </span>
                  <span className="font-mono text-rose-300 shrink-0">
                    -{formatCopper(familyCashflow.expense)}/tháng
                  </span>
                </div>
                <div className="flex items-center justify-between gap-2 pt-0.5 border-t border-stone-800/60">
                  <span className="text-stone-400">Tích lũy ròng</span>
                  <span className={`font-mono font-semibold shrink-0 ${familyCashflow.net >= 0 ? 'text-amber-300' : 'text-rose-300'}`}>
                    {familyCashflow.net >= 0 ? '+' : ''}
                    {formatCopper(familyCashflow.net)}/tháng ({familyCashflow.net >= 0 ? '+' : ''}
                    {formatCopper(familyCashflow.net * 12)}/năm)
                  </span>
                </div>
              </div>
            );
          })()}

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
            {isOfficialPostedAway(life)
              ? getOfficialResidenceLabel(life)
              : getHousingDisplayLabel({
                  housing: life.assets.housing,
                  originClass: life.profile.originClass,
                  gender: life.profile.gender,
                  ageYears: Math.floor(life.profile.totalDays / 360),
                  flags: life.flags,
                  family: life.family,
                })}
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
