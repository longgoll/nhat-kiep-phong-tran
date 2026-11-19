import { useState } from 'react';
import { GraduationCap, Store, Landmark, Flame } from 'lucide-react';
import { formatCopper } from '../engine/economy';
import {
  appointOrPromoteOfficial,
  buyOfficialTitle,
  buyProperty,
  canBuyOfficialTitle,
  canGrantRoyalPrivilege,
  contributeRebellionTreasury,
  getExamEligibility,
  getHousingMarketCost,
  getPropertyMarketCost,
  getPropertySeasonalIncome,
  getPropertySeasonalSocial,
  getRebellionSuccessChance,
  getVisibleProperties,
  grantRoyalPrivilege,
  HOUSING_ORDER,
  HOUSING_UPGRADES,
  launchRebellion,
  OFFICIAL_RANKS,
  recruitRebellionArmy,
  sellProperty,
  takeExam,
  toggleCrossDress,
  upgradeHousing,
} from '../engine/progressionModules';
import { getAgeYears } from '../types/activeLife';
import { getWorldStateLabel } from '../engine/daySimulator';
import { useActiveLifeStore } from '../stores/useActiveLifeStore';

export function ProgressionModules() {
  const life = useActiveLifeStore((s) => s.life);
  const applyLifeMutation = useActiveLifeStore((s) => s.applyLifeMutation);
  const [activeTab, setActiveTab] = useState<'exam' | 'trade' | 'court' | 'rebel' | null>('trade');

  if (!life) return null;

  const ageYears = getAgeYears(life.profile.totalDays);
  const canExam =
    life.stats.education >= 10 ||
    life.stats.martial >= 15 ||
    life.flags.includes('duoc_thay_do_quy') ||
    life.flags.includes('do_cu_nhan') ||
    life.flags.includes('do_cong_si');
  const canTrade = true;
  const canCourt =
    life.officialRank > 0 ||
    life.flags.includes('do_cu_nhan') ||
    life.flags.includes('do_tien_si') ||
    (life.profile.originClass === 'hoang_toc' &&
      ageYears >= 16 &&
      !life.flags.includes('thai_giam') &&
      !life.flags.includes('trong_hau_cung'));
  const canRebel = life.stats.fame >= 70 || life.stats.infamy >= 70;
  const royalPrivilege = canGrantRoyalPrivilege(life);
  const visibleProperties = getVisibleProperties(life);

  if (!canExam && !canTrade && !canCourt && !canRebel) {
    return null;
  }

  const huongElig = getExamEligibility(life, 'huong');
  const hoiElig = getExamEligibility(life, 'hoi');
  const dinhElig = getExamEligibility(life, 'dinh');
  const rebelChance = Math.round(getRebellionSuccessChance(life) * 100);

  return (
    <div className="bg-stone-900/75 border border-stone-800 rounded-xl p-4 space-y-3">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-stone-400">
        Sự Nghiệp · Sản Nghiệp
      </h3>

      {/* Module Selector Pills */}
      <div className="flex flex-wrap gap-2">
        {canExam && (
          <button
            type="button"
            onClick={() => setActiveTab(activeTab === 'exam' ? null : 'exam')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border cursor-pointer transition ${
              activeTab === 'exam'
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
            onClick={() => setActiveTab(activeTab === 'trade' ? null : 'trade')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border cursor-pointer transition ${
              activeTab === 'trade'
                ? 'bg-amber-950/60 border-amber-500 text-amber-200'
                : 'bg-stone-950 border-stone-700 text-stone-300 hover:border-stone-500'
            }`}
          >
            <Store className="w-3.5 h-3.5" /> Đầu tư &amp; Cho thuê
          </button>
        )}
        {canCourt && (
          <button
            type="button"
            onClick={() => setActiveTab(activeTab === 'court' ? null : 'court')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border cursor-pointer transition ${
              activeTab === 'court'
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
            onClick={() => setActiveTab(activeTab === 'rebel' ? null : 'rebel')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border cursor-pointer transition ${
              activeTab === 'rebel'
                ? 'bg-rose-950/60 border-rose-500 text-rose-200'
                : 'bg-stone-950 border-stone-700 text-stone-300 hover:border-stone-500'
            }`}
          >
            <Flame className="w-3.5 h-3.5" /> Mật thất Khởi nghĩa
          </button>
        )}
      </div>

      {/* KHOA CỬ PANEL */}
      {activeTab === 'exam' && (
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
      )}

      {/* THƯƠNG HỘI & ĐIỀN SẢN PANEL */}
      {activeTab === 'trade' && (
        <div className="p-3 rounded-lg bg-stone-950/80 border border-stone-800 space-y-3 text-xs">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="font-semibold text-amber-200">Tậu Điền Sản &amp; Cửa Hiệu (Mua nhiều · Thu mỗi mùa)</div>
              <span className="text-[10px] px-2 py-0.5 rounded bg-stone-800 text-stone-300">
                Thời thế: {getWorldStateLabel(life.world.worldState)}
              </span>
            </div>
            {visibleProperties.map((prop) => {
              const ownedCount = life.assets.properties.filter((id) => id === prop.id).length;
              const marketCost = getPropertyMarketCost(prop, life.world.worldState);
              const seasonIncome = getPropertySeasonalIncome(prop, life.world.worldState, life.stats.craftTrade);
              const social = getPropertySeasonalSocial(prop);
              const sellValue = Math.round(marketCost * 0.7);
              return (
                <div
                  key={prop.id}
                  className="flex items-center justify-between gap-2 p-2 rounded bg-stone-900 border border-stone-800"
                >
                  <div className="min-w-0">
                    <div className="font-medium text-stone-200 flex items-center gap-1.5">
                      <span>{prop.name}</span>
                      {ownedCount > 0 && (
                        <span className="px-1.5 py-0.5 rounded bg-emerald-950/80 border border-emerald-700/50 text-emerald-300 text-[10px] font-mono">
                          x{ownedCount}
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-stone-400">
                      {prop.description} · Thu mùa này:{' '}
                      <span className="text-emerald-300 font-mono">+{formatCopper(seasonIncome)}</span>
                      {social.fame > 0 && (
                        <span className="text-amber-300 font-mono"> · Thanh danh +{social.fame}</span>
                      )}
                      {social.relationships > 0 && (
                        <span className="text-sky-300 font-mono"> · Quan hệ +{social.relationships}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    {ownedCount > 0 && (
                      <button
                        type="button"
                        onClick={() => applyLifeMutation((s) => sellProperty(s, prop.id))}
                        className="px-2 py-1.5 rounded bg-stone-800 hover:bg-rose-950/70 border border-stone-700 hover:border-rose-700 text-rose-300 text-[11px] font-semibold cursor-pointer"
                        title={`Bán lại 1 ${prop.name} (+${formatCopper(sellValue)})`}
                      >
                        Bán +{formatCopper(sellValue)}
                      </button>
                    )}
                    <button
                      type="button"
                      disabled={life.assets.wealthCopper < marketCost}
                      onClick={() => applyLifeMutation((s) => buyProperty(s, prop.id))}
                      className="px-2.5 py-1.5 rounded bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold disabled:opacity-40 cursor-pointer"
                    >
                      Mua {formatCopper(marketCost)}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="space-y-1.5 pt-2 border-t border-stone-800">
            <div className="font-semibold text-amber-200">Nâng cấp chỗ ở</div>
            <div className="flex flex-wrap gap-2">
              {HOUSING_UPGRADES.map((h) => {
                const currentRank = HOUSING_ORDER[life.assets.housing];
                const targetRank = HOUSING_ORDER[h.tier];
                const isCurrentOrLower = targetRank <= currentRank;
                const cost = getHousingMarketCost(h.tier, life.world.worldState);
                return (
                  <button
                    key={h.tier}
                    type="button"
                    disabled={isCurrentOrLower || life.assets.wealthCopper < cost}
                    onClick={() => applyLifeMutation((s) => upgradeHousing(s, h.tier))}
                    className="px-2.5 py-1.5 rounded bg-stone-800 hover:bg-stone-700 disabled:opacity-40 text-stone-200 cursor-pointer"
                  >
                    {life.assets.housing === h.tier
                      ? `${h.label} (Đang ở)`
                      : targetRank < currentRank
                        ? `${h.label} (Đã vượt cấp)`
                        : `${h.label} (${formatCopper(cost)})`}
                  </button>
                );
              })}
            </div>
          </div>

          {life.officialRank === 0 && life.profile.originClass !== 'hoang_toc' && (() => {
            const buyTitleElig = canBuyOfficialTitle(life);
            return (
              <div className="pt-2 border-t border-stone-800 flex items-center justify-between gap-2">
                <div>
                  <div className="text-stone-300">Quyên quan (Mua hàm Tri huyện bằng bạc)</div>
                  {!buyTitleElig.ok && buyTitleElig.reason && (
                    <div className="text-[11px] text-stone-500">{buyTitleElig.reason}</div>
                  )}
                </div>
                <button
                  type="button"
                  disabled={!buyTitleElig.ok}
                  onClick={() => applyLifeMutation(buyOfficialTitle)}
                  className="px-3 py-1.5 rounded bg-amber-600 text-stone-950 font-bold disabled:opacity-40 cursor-pointer shrink-0"
                >
                  5 Vàng (50.000đ)
                </button>
              </div>
            );
          })()}
        </div>
      )}

      {/* CÔNG ĐƯỜNG PANEL */}
      {activeTab === 'court' && (
        <div className="p-3 rounded-lg bg-stone-950/80 border border-stone-800 space-y-2.5 text-xs">
          <div>
            Chức vị hiện tại:{' '}
            <strong className="text-sky-300">{OFFICIAL_RANKS[life.officialRank]}</strong>
          </div>
          {life.officialRank === 0 && life.profile.originClass === 'hoang_toc' && (
            <button
              type="button"
              disabled={!royalPrivilege.ok}
              onClick={() => applyLifeMutation(grantRoyalPrivilege)}
              className="w-full py-2 rounded bg-amber-600 hover:bg-amber-500 disabled:opacity-40 text-stone-950 font-bold cursor-pointer"
            >
              {royalPrivilege.ok
                ? 'Thỉnh phong Tập ấm Hoàng thất (Vào triều nhậm chức)'
                : `Thỉnh phong Tập ấm (${royalPrivilege.reason})`}
            </button>
          )}
          {life.officialRank < 5 &&
            (life.officialRank > 0 ||
              life.flags.includes('do_cu_nhan') ||
              life.flags.includes('do_tien_si')) && (
            <button
              type="button"
              disabled={
                life.officialRank > 0 && life.stats.fame < life.officialRank * 25
              }
              onClick={() => applyLifeMutation(appointOrPromoteOfficial)}
              className="w-full py-2 rounded bg-sky-600 hover:bg-sky-500 disabled:opacity-40 text-stone-950 font-bold cursor-pointer"
            >
              {life.officialRank === 0
                ? 'Xin triều đình bổ nhiệm làm quan'
                : `Thăng chức lên ${OFFICIAL_RANKS[life.officialRank + 1]} (Cần Thanh danh >= ${life.officialRank * 25})`}
            </button>
          )}
        </div>
      )}

      {/* MẬT THẤT KHỞI NGHĨA PANEL */}
      {activeTab === 'rebel' && (
        <div className="p-3 rounded-lg bg-stone-950/80 border border-rose-900/50 space-y-3 text-xs">
          <div className="grid grid-cols-2 gap-2">
            <div className="p-2 rounded bg-stone-900 border border-stone-800">
              <div className="text-stone-400">Ngân khố mật thất</div>
              <div className="font-mono text-amber-300 font-bold">
                {formatCopper(life.rebellion?.treasuryCopper ?? 0)} / 10 Vàng
              </div>
            </div>
            <div className="p-2 rounded bg-stone-900 border border-stone-800">
              <div className="text-stone-400">Binh quyền & Tử sĩ</div>
              <div className="font-mono text-rose-300 font-bold">
                {life.rebellion?.armyPower ?? 0} / 100
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={life.assets.wealthCopper < 5000}
              onClick={() => applyLifeMutation((s) => contributeRebellionTreasury(s, 5000))}
              className="px-3 py-1.5 rounded bg-stone-800 hover:bg-stone-700 disabled:opacity-40 cursor-pointer"
            >
              Góp 5.000đ vào mật thất
            </button>
            <button
              type="button"
              disabled={(life.rebellion?.treasuryCopper ?? 0) < 2000}
              onClick={() => applyLifeMutation(recruitRebellionArmy)}
              className="px-3 py-1.5 rounded bg-stone-800 hover:bg-stone-700 disabled:opacity-40 cursor-pointer"
            >
              Chiêu mộ tử sĩ (-2.000đ kho, +20 Binh quyền)
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
      )}
    </div>
  );
}
