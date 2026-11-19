import { useState } from 'react';
import { GraduationCap, Store, Landmark, Flame } from 'lucide-react';
import { formatCopper } from '../engine/economy';
import {
  appointOrPromoteOfficial,
  buyOfficialTitle,
  buyProperty,
  canBuyOfficialTitle,
  canGrantRoyalPrivilege,
  canRecruitRebellionArmy,
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
  recruitRebellionArmy,
  sellProperty,
  takeExam,
  toggleCrossDress,
  upgradeHousing,
} from '../engine/progressionModules';
import {
  COMMERCIAL_PROPERTY_IDS,
  FACTION_LABELS,
  canBribeForPromotion,
  canRequestKhaoKhoa,
  checkHousingTiemLe,
  checkOfficialPropertyRule,
  donateDisasterReliefAsOfficial,
  equipMilitaryGear,
  getOfficialGradeAndTitle,
  getOfficialMonthlyUpkeepCopper,
  getOfficialPostingLabel,
  getOfficialRankSpec,
  getOfficialResidenceLabel,
  isOfficialPostedAway,
  manageOfficialStaff,
  rewardMilitaryTroops,
  sendSeasonalSuperiorGift,
  setOfficialFamilyAccompany,
  bribeForEarlyPromotion,
} from '../engine/officialSystem';
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

      {/* KHOA CỬ PANEL */}
      {effectiveTab === 'exam' && (
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
      {effectiveTab === 'trade' && (
        <div className="p-3 rounded-lg bg-stone-950/80 border border-stone-800 space-y-3 text-xs">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="font-semibold text-amber-200">
                {life.officialRank > 0
                  ? 'Điền Sản & Cơ Sở Công Ích (Thu mỗi mùa)'
                  : 'Tậu Điền Sản & Cửa Hiệu (Mua nhiều · Thu mỗi mùa)'}
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded bg-stone-800 text-stone-300">
                Thời thế: {getWorldStateLabel(life.world.worldState)}
              </span>
            </div>
            {life.officialRank > 0 && (
              <div className="p-2 rounded bg-sky-950/30 border border-sky-800/60 text-[11px] text-sky-200">
                <strong>Luật Quan trường:</strong> Cấm quan đương chức trực tiếp buôn bán ("Dữ dân tranh lợi"), các sản nghiệp thương mại đã được ẩn khỏi danh mục mua mới. Điền sản chịu giới hạn <em>Hạn điền</em> theo phẩm hàm.
              </div>
            )}
            {visibleProperties.map((prop) => {
              const ownedCount = life.assets.properties.filter((id) => id === prop.id).length;
              const marketCost = getPropertyMarketCost(prop, life.world.worldState);
              const seasonIncome = getPropertySeasonalIncome(prop, life.world.worldState, life.stats.craftTrade);
              const social = getPropertySeasonalSocial(prop);
              const sellValue = Math.round(marketCost * 0.7);
              const isCommercial = life.officialRank > 0 && COMMERCIAL_PROPERTY_IDS.has(prop.id);
              const effectiveCost = isCommercial ? Math.round(marketCost * 1.15) : marketCost;
              const propRule = checkOfficialPropertyRule(life, prop.id, isCommercial);
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
                      <span className="text-emerald-300 font-mono">
                        +{formatCopper(isCommercial ? Math.round(seasonIncome * 0.7) : seasonIncome)}
                      </span>
                      {social.fame > 0 && (
                        <span className="text-amber-300 font-mono"> · Thanh danh +{social.fame}</span>
                      )}
                      {social.relationships > 0 && (
                        <span className="text-sky-300 font-mono"> · Quan hệ +{social.relationships}</span>
                      )}
                    </div>
                    {!propRule.allowed && propRule.reason && (
                      <div className="text-[10px] text-rose-400 mt-0.5">{propRule.reason}</div>
                    )}
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
                      disabled={!propRule.allowed || life.assets.wealthCopper < effectiveCost}
                      onClick={() => applyLifeMutation((s) => buyProperty(s, prop.id, isCommercial))}
                      className={`px-2.5 py-1.5 rounded font-bold disabled:opacity-40 cursor-pointer ${
                        isCommercial
                          ? 'bg-rose-700 hover:bg-rose-600 text-white'
                          : 'bg-amber-600 hover:bg-amber-500 text-stone-950'
                      }`}
                    >
                      {isCommercial ? `Đứng tên ngầm ${formatCopper(effectiveCost)}` : `Mua ${formatCopper(effectiveCost)}`}
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
                const tiemLe = checkHousingTiemLe(life, h.tier);
                const cost = getHousingMarketCost(h.tier, life.world.worldState);
                return (
                  <button
                    key={h.tier}
                    type="button"
                    title={tiemLe.reason}
                    disabled={isCurrentOrLower || !tiemLe.allowed || life.assets.wealthCopper < cost}
                    onClick={() => applyLifeMutation((s) => upgradeHousing(s, h.tier))}
                    className="px-2.5 py-1.5 rounded bg-stone-800 hover:bg-stone-700 disabled:opacity-40 text-stone-200 cursor-pointer"
                  >
                    {life.assets.housing === h.tier
                      ? `${h.label} (Đang ở)`
                      : targetRank < currentRank
                        ? `${h.label} (Đã vượt cấp)`
                        : !tiemLe.allowed
                          ? `${h.label} (Cấm Tiếm lễ)`
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
                  <div className="text-stone-300">Quyên quan (Mua Cửu phẩm hư hàm bằng bạc)</div>
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
                  15 Vàng (150.000đ)
                </button>
              </div>
            );
          })()}
        </div>
      )}

      {/* CÔNG ĐƯỜNG PANEL */}
      {effectiveTab === 'court' && (
        <div className="p-3 rounded-lg bg-stone-950/80 border border-stone-800 space-y-3 text-xs">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              Chức vị:{' '}
              <strong className="text-sky-300">{getOfficialGradeAndTitle(life)}</strong>
              {life.official?.isHanhHam && (
                <span className="ml-1.5 px-1.5 py-0.5 rounded bg-amber-950 text-amber-300 text-[10px]">
                  Quyên quan (Trần Ngũ phẩm)
                </span>
              )}
            </div>
            {life.official && (
              <span className="text-[11px] text-stone-400">
                {getOfficialPostingLabel(life.official.track, life.official.posting)} ·{' '}
                {isOfficialPostedAway(life)
                  ? `${getOfficialResidenceLabel(life)} · ${life.official.familyAccompanied ? 'Cùng gia quyến tại phủ' : 'Gia quyến ở quê'}`
                  : 'Nhậm chức tại quê nhà / Kinh thành (Không phải đi xa)'}{' '}
                · {FACTION_LABELS[life.official.faction]}
              </span>
            )}
          </div>

          {life.official && life.officialRank > 0 && (() => {
            const off = life.official;
            const isVo = off.track === 'vo';
            const spec = getOfficialRankSpec(life.officialRank);
            const khaoKhoa = canRequestKhaoKhoa(life);
            const upkeep = getOfficialMonthlyUpkeepCopper(off);
            const seasonKey = `${ageYears}_${life.world.season}`;
            const sentBangKinh = off.lastSeasonalGiftKey === seasonKey;
            const sentNhaHoi = off.lastNhaHoiSeasonKey === seasonKey;
            const sentRelief = off.lastReliefSeasonKey === seasonKey;
            const sentMilReward = off.lastMilitaryRewardSeasonKey === seasonKey;
            const sentMilGear = off.lastMilitaryGearSeasonKey === seasonKey;
            const bangKinhCost = life.officialRank * 800;
            const nhaHoiCost = life.officialRank * 2200;
            const reliefCost = Math.max(1500, life.officialRank * 1200);
            const gearCost = Math.max(2000, life.officialRank * 1500);
            return (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <div className="p-2 rounded bg-stone-900 border border-stone-800">
                    <div className="text-[10px] text-stone-400">{isVo ? 'Quân công' : 'Chính tích'}</div>
                    <div className="font-mono text-emerald-300 font-bold">{Math.round(off.merit)}</div>
                  </div>
                  <div className="p-2 rounded bg-stone-900 border border-stone-800">
                    <div className="text-[10px] text-stone-400">{isVo ? 'Quân tâm / Dân tâm' : 'Dân tâm'}</div>
                    <div className={`font-mono font-bold ${off.publicTrust >= 0 ? 'text-sky-300' : 'text-rose-400'}`}>
                      {Math.round(off.publicTrust)}
                    </div>
                  </div>
                  <div className="p-2 rounded bg-stone-900 border border-stone-800">
                    <div className="text-[10px] text-stone-400">Thánh sủng</div>
                    <div className="font-mono text-amber-300 font-bold">{Math.round(off.imperialFavor)} / 100</div>
                  </div>
                  <div className="p-2 rounded bg-stone-900 border border-stone-800">
                    <div className="text-[10px] text-stone-400">Án tích / Hiềm nghi</div>
                    <div className={`font-mono font-bold ${off.scandalRisk >= 50 ? 'text-rose-400' : 'text-stone-300'}`}>
                      {Math.round(off.scandalRisk)} / 100
                    </div>
                  </div>
                </div>

                {/* Phủ đệ & Người hầu */}
                <div className="p-2.5 rounded bg-stone-900/70 border border-stone-800 space-y-2">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-semibold text-amber-200">
                      Phủ đệ &amp; Nhân khẩu (Chi phí: {formatCopper(upkeep)}/tháng · Bổng: {formatCopper(spec?.monthlySalaryCopper ?? 0)}/tháng)
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      disabled={off.maidsCount >= (spec?.maxMaids ?? 0) || life.assets.wealthCopper < 300}
                      onClick={() => applyLifeMutation((s) => manageOfficialStaff(s, 'hire_maid'))}
                      className="px-2 py-1 rounded bg-stone-800 hover:bg-stone-700 disabled:opacity-40 cursor-pointer"
                    >
                      + Nha hoàn ({off.maidsCount}/{spec?.maxMaids ?? 0}) -300đ
                    </button>
                    <button
                      type="button"
                      disabled={off.guardsCount >= (spec?.maxGuards ?? 0) || life.assets.wealthCopper < 450}
                      onClick={() => applyLifeMutation((s) => manageOfficialStaff(s, 'hire_guard'))}
                      className="px-2 py-1 rounded bg-stone-800 hover:bg-stone-700 disabled:opacity-40 cursor-pointer"
                    >
                      + Gia đinh ({off.guardsCount}/{spec?.maxGuards ?? 0}) -450đ
                    </button>
                    {!off.hasAdvisor && life.officialRank >= 2 && (
                      <button
                        type="button"
                        disabled={life.assets.wealthCopper < 1500}
                        onClick={() => applyLifeMutation((s) => manageOfficialStaff(s, 'hire_advisor'))}
                        className="px-2 py-1 rounded bg-sky-900/60 hover:bg-sky-800/60 border border-sky-700/50 text-sky-200 disabled:opacity-40 cursor-pointer"
                      >
                        {isVo ? 'Mời Mạc liêu quân vụ (-1.500đ, 600đ/tháng)' : 'Thuê Sư gia (-1.500đ, 600đ/tháng)'}
                      </button>
                    )}
                    {off.hasAdvisor && (
                      <span className="px-2 py-1 rounded bg-emerald-950/60 border border-emerald-800 text-emerald-300">
                        {isVo ? 'Đã có Mạc liêu hỗ trợ' : 'Đã có Sư gia hỗ trợ'}
                      </span>
                    )}
                    {isOfficialPostedAway(life) && !(isVo && off.posting === 'bien_ai') && (
                      <button
                        type="button"
                        disabled={!off.familyAccompanied && life.assets.wealthCopper < life.officialRank * 600}
                        onClick={() => applyLifeMutation((s) => setOfficialFamilyAccompany(s, !off.familyAccompanied))}
                        className="px-2 py-1 rounded bg-amber-950/70 hover:bg-amber-900/70 border border-amber-700/50 text-amber-200 disabled:opacity-40 cursor-pointer"
                      >
                        {off.familyAccompanied
                          ? 'Đưa gia quyến về quê giữ từ đường'
                          : `Đón gia quyến lên phủ (-${formatCopper(life.officialRank * 600)})`}
                      </button>
                    )}
                  </div>
                </div>

                {/* Tương tác Quan trường */}
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    disabled={sentBangKinh || life.assets.wealthCopper < bangKinhCost}
                    onClick={() => applyLifeMutation((s) => sendSeasonalSuperiorGift(s, 'bang_kinh'))}
                    className="px-2.5 py-1.5 rounded bg-stone-800 hover:bg-stone-700 disabled:opacity-40 cursor-pointer"
                  >
                    {sentBangKinh ? 'Đã gửi Băng/Thán kính mùa này' : `Gửi Băng/Thán kính (-${formatCopper(bangKinhCost)})`}
                  </button>
                  {isVo ? (
                    <>
                      <button
                        type="button"
                        disabled={sentMilReward || life.assets.wealthCopper < reliefCost}
                        onClick={() => applyLifeMutation(rewardMilitaryTroops)}
                        className="px-2.5 py-1.5 rounded bg-emerald-900/60 hover:bg-emerald-800/60 border border-emerald-700/50 text-emerald-200 disabled:opacity-40 cursor-pointer"
                      >
                        {sentMilReward ? 'Đã khao quân mùa này' : `Khao thưởng quân sĩ (-${formatCopper(reliefCost)})`}
                      </button>
                      <button
                        type="button"
                        disabled={sentMilGear || life.assets.wealthCopper < gearCost}
                        onClick={() => applyLifeMutation(equipMilitaryGear)}
                        className="px-2.5 py-1.5 rounded bg-amber-900/50 hover:bg-amber-800/50 border border-amber-700/50 text-amber-200 disabled:opacity-40 cursor-pointer"
                      >
                        {sentMilGear ? 'Đã sắm quân khí mùa này' : `Sắm chiến mã & Giáp trụ (-${formatCopper(gearCost)})`}
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        type="button"
                        disabled={sentNhaHoi || life.assets.wealthCopper < nhaHoiCost}
                        onClick={() => applyLifeMutation((s) => sendSeasonalSuperiorGift(s, 'nha_hoi'))}
                        className="px-2.5 py-1.5 rounded bg-stone-800 hover:bg-stone-700 disabled:opacity-40 cursor-pointer"
                      >
                        {sentNhaHoi ? 'Đã tặng Nhã hối mùa này' : `Tặng Nhã hối cổ vật (-${formatCopper(nhaHoiCost)})`}
                      </button>
                      <button
                        type="button"
                        disabled={sentRelief || life.assets.wealthCopper < reliefCost}
                        onClick={() => applyLifeMutation(donateDisasterReliefAsOfficial)}
                        className="px-2.5 py-1.5 rounded bg-emerald-900/60 hover:bg-emerald-800/60 border border-emerald-700/50 text-emerald-200 disabled:opacity-40 cursor-pointer"
                      >
                        {sentRelief ? 'Đã phát chẩn mùa này' : `Phát chẩn cứu dân (-${formatCopper(reliefCost)})`}
                      </button>
                    </>
                  )}
                </div>

                {life.officialRank < 9 && (() => {
                  const bribeElig = canBribeForPromotion(life);
                  return (
                    <div className="space-y-2">
                      <button
                        type="button"
                        disabled={!khaoKhoa.ok}
                        onClick={() => applyLifeMutation(appointOrPromoteOfficial)}
                        className="w-full py-2 rounded bg-sky-600 hover:bg-sky-500 disabled:opacity-40 text-stone-950 font-bold cursor-pointer"
                      >
                        {khaoKhoa.ok
                          ? `Dâng sớ xin Khảo khóa xét thăng ${getOfficialRankSpec(life.officialRank + 1)?.gradeLabel ?? 'Đại thần'}`
                          : khaoKhoa.reason}
                      </button>
                      <button
                        type="button"
                        disabled={!bribeElig.ok}
                        onClick={() => applyLifeMutation(bribeForEarlyPromotion)}
                        className="w-full py-1.5 rounded bg-rose-950/70 hover:bg-rose-900/70 border border-rose-700/60 disabled:opacity-40 text-rose-200 font-semibold cursor-pointer"
                      >
                        {bribeElig.ok
                          ? `Chạy chức / Đặc cách đề bạt (-${formatCopper(bribeElig.cost)} · Thành công ~${Math.round(bribeElig.successChance * 100)}% · Hiềm nghi +20)`
                          : `Chạy chức (${bribeElig.reason})`}
                      </button>
                    </div>
                  );
                })()}
              </>
            );
          })()}

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
          {life.officialRank === 0 &&
            (life.flags.includes('do_tu_tai') ||
              life.flags.includes('do_cu_nhan') ||
              life.flags.includes('do_tien_si') ||
              life.flags.includes('trong_quan_ngu')) && (
            <button
              type="button"
              onClick={() => applyLifeMutation(appointOrPromoteOfficial)}
              className="w-full py-2 rounded bg-sky-600 hover:bg-sky-500 text-stone-950 font-bold cursor-pointer"
            >
              Xin triều đình bổ nhiệm làm quan
            </button>
          )}
        </div>
      )}

      {/* MẬT THẤT KHỞI NGHĨA PANEL */}
      {effectiveTab === 'rebel' && (() => {
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
      })()}
    </div>
  );
}
