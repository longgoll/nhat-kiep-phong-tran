import { Heart, Smile, Users, BookOpen, ScrollText } from 'lucide-react';
import { getAgeYears } from '../../types/activeLife';
import { ALL_ACTIONS } from '../../data/registry';
import { computeFamilyMonthlyNetCopper } from '../../engine/childhoodEngine';
import { formatCopper } from '../../engine/economy';
import {
  FAMILY_TIER_LABELS,
  INTEREST_LABELS,
  ORIGIN_METADATA,
  TRAIT_LABELS,
} from '../../engine/lifeInitializer';
import {
  getOfficialResidenceLabel,
  getOfficialShortPostingPlace,
  isOfficialPostedAway,
} from '../../engine/officialSystem';
import { getPropertySeasonalIncome, PROPERTY_CATALOG } from '../../engine/progressionModules';
import {
  getCurrentLivelihoodLabel,
  getEducationLabel,
  getFeudalIncomeRankLabel,
  getFeudalTransportLabel,
  getPersonalPossessions,
  hasActiveLivelihood,
} from '../../engine/lifeStatus';
import { useActiveLifeStore } from '../../stores/useActiveLifeStore';
import { FeudalPortrait } from '../FeudalPortrait';
import { HOUSING_NAMES } from '../FamilyWealthCard';
import { StatExplainer } from '../StatExplainer';
import { LIFESTYLE_OPTIONS, StatBar, TIER_DOTS } from './constants';

export function AdultLeftColumn({
  mobileTab,
  onOpenActionModal,
  onOpenProgressionModal,
  onOpenNpcModal,
}: {
  mobileTab: 'profile' | 'planner' | 'logs';
  onOpenActionModal: () => void;
  onOpenProgressionModal: () => void;
  onOpenNpcModal: () => void;
}) {
  const life = useActiveLifeStore((s) => s.life);
  if (!life) return null;

  const age = getAgeYears(life.profile.totalDays);
  const originMeta = ORIGIN_METADATA[life.profile.originClass];
  const isInDebt = life.flags.includes('dang_no_dia_chu');
  const netWorthCopper =
    life.assets.wealthCopper +
    (life.assets.goldReserveCopper ?? 0) +
    Math.round(life.assets.rice * life.world.ricePriceInCopper);
  const activeLifestyleLabel =
    LIFESTYLE_OPTIONS.find((o) => o.value === life.schedule.lifestyle)?.label ?? life.schedule.lifestyle;
  const hasLastYearLedger = Boolean(life.finance?.lastYear);
  const ledger = life.finance?.lastYear ?? life.finance?.currentYear;
  const annualIncomeCopper =
    (ledger?.workIncomeCopper ?? 0) + (ledger?.propertyIncomeCopper ?? 0);
  const ownedProperties = Array.from(
    life.assets.properties.reduce((map, id) => {
      map.set(id, (map.get(id) ?? 0) + 1);
      return map;
    }, new Map<string, number>()),
  )
    .map(([id, count]) => {
      const spec = PROPERTY_CATALOG.find((p) => p.id === id);
      return spec ? { ...spec, count } : null;
    })
    .filter((p): p is NonNullable<typeof p> => Boolean(p));

  const rawJobLabel = getCurrentLivelihoodLabel(life);
  const freelanceAction = [life.schedule.morning, life.schedule.afternoon, life.schedule.evening]
    .map((id) => ALL_ACTIONS.find((a) => a.id === id))
    .find((a) => a && (a.rewards.copper ?? 0) > 0);
  const currentJobLabel =
    rawJobLabel === 'Đang tìm việc' && freelanceAction
      ? `Làm thêm tự do (${freelanceAction.name})`
      : rawJobLabel;
  const familyCashflow = life.family ? computeFamilyMonthlyNetCopper(life) : null;
  const educationLabel = getEducationLabel(life);
  const incomeRankLabel = getFeudalIncomeRankLabel(annualIncomeCopper);
  const personalPossessions = getPersonalPossessions(life);
  const transportLabel = getFeudalTransportLabel(life);
  const hasJob = hasActiveLivelihood(life);
  const tierDots = life.family ? TIER_DOTS[life.family.familyLivingTier] ?? 1 : 1;
  const hasNegativeCash = life.assets.wealthCopper < 0;

  const openActionModal = onOpenActionModal;
  const openProgressionModal = onOpenProgressionModal;
  const setShowNpcModal = (v: boolean) => { if (v) onOpenNpcModal(); };

  return (
          <div className={`lg:col-span-3 space-y-4 ${mobileTab === 'profile' ? 'block' : 'hidden lg:block'}`}>
            {/* Passport / Hồ Sơ Cá Nhân */}
            <div className="bg-stone-900/80 border border-stone-800 rounded-xl overflow-hidden">
              <div className="bg-gradient-to-r from-rose-900/90 to-amber-900/80 px-3.5 py-1.5 flex items-center justify-between text-[10px] font-semibold uppercase tracking-wider text-amber-100">
                <span className="flex items-center gap-1.5">
                  <ScrollText className="w-3 h-3 text-amber-300" />
                  Hồ Sơ Cá Nhân
                </span>
                <span className="font-mono">NK-{life.seed}</span>
              </div>

              <div className="p-3.5 space-y-3">
                <div className="flex items-center gap-3">
                  <FeudalPortrait
                    gender={life.profile.gender}
                    ageYears={age}
                    originClass={life.profile.originClass}
                    officialRank={life.officialRank ?? 0}
                  />
                  <div className="min-w-0">
                    <h2 className="font-serif text-base font-bold text-amber-100 truncate">
                      {life.profile.fullName}
                    </h2>
                    <p className="text-[11px] text-stone-400">
                      {life.profile.gender === 'male' ? 'Nam' : 'Nữ'} • {age} tuổi
                    </p>
                    <p className="text-[11px] text-amber-300 font-medium truncate">
                      {life.profile.currentRole} • {originMeta.label}
                    </p>
                  </div>
                </div>

                <div className="pt-2 border-t border-stone-800 space-y-1.5 text-[11px]">
                  {life.family?.birthPlace && (
                    <div className="flex justify-between gap-2">
                      <span className="text-stone-500 shrink-0">Quê quán</span>
                      <span className="text-stone-200 text-right">{life.family.birthPlace}</span>
                    </div>
                  )}
                  {life.official && isOfficialPostedAway(life) && (
                    <div className="flex justify-between gap-2">
                      <span className="text-stone-500 shrink-0">Nhiệm sở</span>
                      <span className="text-sky-300 font-medium text-right">
                        {getOfficialShortPostingPlace(life.official.track, life.official.posting)}
                      </span>
                    </div>
                  )}
                  {life.family && (
                    <div className="flex justify-between gap-2">
                      <span className="text-stone-500 shrink-0">Thứ bậc</span>
                      <span className="text-stone-200 text-right">{life.family.birthOrderLabel}</span>
                    </div>
                  )}
                  {life.family && (
                    <div className="flex justify-between gap-2 items-center">
                      <span className="text-stone-500 shrink-0">Gia cảnh</span>
                      <span className="text-amber-200 font-medium flex items-center gap-1">
                        <span className="inline-flex gap-0.5" aria-hidden="true">
                          {[1, 2, 3, 4, 5].map((i) => (
                            <span
                              key={i}
                              className={`w-1.5 h-1.5 rounded-full ${
                                i <= tierDots ? 'bg-amber-400' : 'bg-stone-700'
                              }`}
                            />
                          ))}
                        </span>
                        {FAMILY_TIER_LABELS[life.family.familyLivingTier]}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between gap-2">
                    <span className="text-stone-500 shrink-0">Học vấn</span>
                    <span className="text-emerald-300 font-medium text-right">{educationLabel}</span>
                  </div>
                  <div className="flex justify-between gap-2">
                    <span className="text-stone-500 shrink-0">Sinh kế</span>
                    <span
                      className={`text-right leading-snug font-medium ${
                        hasJob
                          ? 'text-amber-200'
                          : age >= 60
                            ? 'text-stone-400'
                            : 'text-rose-300'
                      }`}
                    >
                      {currentJobLabel}
                    </span>
                  </div>
                  {ownedProperties.length > 0 && (
                    <div className="flex justify-between gap-2">
                      <span className="text-stone-500 shrink-0">Sản nghiệp</span>
                      <span className="text-sky-300 text-right leading-snug">
                        {ownedProperties.length} cơ sở sinh lời
                      </span>
                    </div>
                  )}
                </div>

                {((life.traits && life.traits.length > 0) || (life.interests && life.interests.length > 0)) && (
                  <div className="pt-2 border-t border-stone-800 space-y-1.5">
                    <div className="text-[10px] font-semibold uppercase tracking-wider text-stone-400">
                      Tính cách &amp; Sở thích
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {(life.traits ?? []).map((t) => (
                        <span
                          key={t}
                          className="px-2 py-0.5 rounded bg-amber-950/60 border border-amber-700/40 text-[11px] text-amber-200"
                        >
                          {TRAIT_LABELS[t] ?? t}
                        </span>
                      ))}
                      {(life.interests ?? []).map((i) => {
                        const lv = life.hobbyLevels?.[i];
                        return (
                          <span
                            key={i}
                            className="px-2 py-0.5 rounded bg-sky-950/60 border border-sky-700/40 text-[11px] text-sky-200"
                          >
                            {INTEREST_LABELS[i] ?? i}
                            {lv ? ` Lv.${lv}` : ''}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Trạng Thái Card (Unified 4 Core Bars + Sub-stats) */}
            <div className="bg-stone-900/80 border border-stone-800 rounded-xl p-3.5 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-stone-400">
                  Trạng Thái
                </h3>
                <span className="text-[10px] font-mono text-stone-500">0–100</span>
              </div>

              <div className="space-y-2.5">
                <StatBar
                  label="Sức khỏe"
                  value={life.stats.health}
                  icon={<Heart className="w-3.5 h-3.5 text-rose-400" />}
                  colorClass={life.stats.health < 20 ? 'bg-rose-600 animate-pulse' : 'bg-rose-500'}
                />
                <StatBar
                  label="Hạnh phúc"
                  value={life.stats.happiness}
                  icon={<Smile className="w-3.5 h-3.5 text-amber-400" />}
                  colorClass="bg-amber-500"
                />
                <StatBar
                  label="Học thức"
                  value={life.stats.education}
                  icon={<BookOpen className="w-3.5 h-3.5 text-emerald-400" />}
                  colorClass="bg-emerald-500"
                />
                <StatBar
                  label="Quan hệ (Xem NPC)"
                  value={life.stats.relationships}
                  icon={<Users className="w-3.5 h-3.5 text-sky-400" />}
                  colorClass="bg-sky-500"
                  onClick={() => setShowNpcModal(true)}
                />
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-stone-800 text-[11px] text-stone-300">
                <div>Võ nghệ: <span className="font-mono text-stone-200">{life.stats.martial.toFixed(1)}</span></div>
                <div>Thương tài: <span className="font-mono text-stone-200">{life.stats.craftTrade.toFixed(1)}</span></div>
                <div>Thanh danh: <span className="font-mono text-emerald-300">{life.stats.fame.toFixed(1)}</span></div>
                <div>Tai tiếng: <span className="font-mono text-rose-300">{life.stats.infamy.toFixed(1)}</span></div>
              </div>

              <StatExplainer />
            </div>

            {/* Tài sản & Thu chi (1in8b-style) */}
            <div className="bg-stone-900/75 border border-stone-800 rounded-xl p-4 space-y-3.5">
              {/* Top 2 columns: Net Worth & Annual Income */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="text-[11px] text-stone-400">Tài sản ròng</div>
                  <div
                    className={`text-lg sm:text-xl font-bold font-mono leading-tight mt-0.5 ${
                      netWorthCopper < 0 ? 'text-rose-400' : 'text-amber-100'
                    }`}
                  >
                    {formatCopper(netWorthCopper)}
                  </div>
                  <div className={`text-[11px] mt-0.5 ${hasNegativeCash ? 'text-rose-400' : 'text-stone-500'}`}>
                    Tiền mặt: {formatCopper(life.assets.wealthCopper)}
                  </div>
                </div>
                <div>
                  <div className="text-[11px] text-stone-400">Thu nhập hằng năm</div>
                  {annualIncomeCopper > 0 ? (
                    <div className="text-sm sm:text-base font-bold font-mono text-emerald-300 leading-tight mt-0.5">
                      +{formatCopper(annualIncomeCopper)}
                    </div>
                  ) : (
                    <>
                      <div className="text-base font-bold text-stone-400 leading-tight mt-0.5">—</div>
                      <div className="text-[11px] text-stone-500">Không có thu nhập</div>
                    </>
                  )}
                </div>
              </div>

              {/* Vị trí thu nhập */}
              <div className="pt-2.5 border-t border-stone-800/80 text-xs">
                <div className="text-[11px] text-stone-400">Vị trí thu nhập</div>
                <div className="font-semibold text-stone-100 mt-0.5">{incomeRankLabel}</div>
              </div>

              {/* Nợ */}
              {(isInDebt || hasNegativeCash) && (
                <div className="pt-2.5 border-t border-stone-800/80 space-y-1 text-xs">
                  <div className="text-[11px] text-stone-400">Nợ</div>
                  {hasNegativeCash && (
                    <div className="font-mono font-bold text-rose-400">
                      {formatCopper(Math.abs(life.assets.wealthCopper))}
                    </div>
                  )}
                  {isInDebt && (
                    <div className="font-semibold text-rose-400">
                      Nợ địa chủ (Đáo hạn sau 180 ngày • lãi 60%)
                    </div>
                  )}
                </div>
              )}

              {/* Ledger breakdown: Tài sản ròng năm qua / Năm nay */}
              {ledger && (
                <div className="pt-2.5 border-t border-stone-800/80 space-y-1.5 text-xs">
                  <div className="text-[11px] text-stone-400">
                    {hasLastYearLedger ? 'Thu chi năm qua' : 'Thu chi năm nay'}
                    {life.finance?.lastYearNetWorthCopper !== undefined && hasLastYearLedger
                      ? ` • Tài sản: ${formatCopper(life.finance.lastYearNetWorthCopper)}`
                      : ''}
                  </div>
                  {ledger.workIncomeCopper > 0 && (
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-stone-300">
                        {life.officialRank > 0
                          ? 'Lương bổng quan chức & lao động'
                          : life.activeCareer || life.activeVenture
                            ? 'Thu nhập nghề nghiệp'
                            : 'Tiền công làm thêm tự do'}
                      </span>
                      <span className="font-mono font-semibold text-emerald-400 shrink-0">
                        +{formatCopper(ledger.workIncomeCopper)}
                      </span>
                    </div>
                  )}
                  {ledger.propertyIncomeCopper > 0 && (
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-stone-300">Thu hoạch điền sản &amp; buôn bán</span>
                      <span className="font-mono font-semibold text-emerald-400 shrink-0">
                        +{formatCopper(ledger.propertyIncomeCopper)}
                      </span>
                    </div>
                  )}
                  {ledger.livingExpenseCopper > 0 && (
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-stone-300">Sinh hoạt phí ({activeLifestyleLabel})</span>
                      <span className="font-mono font-semibold text-rose-400 shrink-0">
                        -{formatCopper(ledger.livingExpenseCopper)}
                      </span>
                    </div>
                  )}
                  {ledger.otherExpenseCopper > 0 && (
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-stone-300">Lễ nghĩa &amp; chi tiêu khác</span>
                      <span className="font-mono font-semibold text-rose-400 shrink-0">
                        -{formatCopper(ledger.otherExpenseCopper)}
                      </span>
                    </div>
                  )}
                  {ledger.workIncomeCopper === 0 &&
                    ledger.propertyIncomeCopper === 0 &&
                    ledger.livingExpenseCopper === 0 &&
                    ledger.otherExpenseCopper === 0 && (
                      <div className="text-[11px] text-stone-500">Chưa phát sinh thu chi.</div>
                    )}
                </div>
              )}

              {/* Những thứ bạn có & Nơi ở */}
              <div className="pt-2.5 border-t border-stone-800/80 space-y-2 text-xs">
                <div>
                  <div className="text-[11px] text-stone-400">Kinh doanh &amp; Cho thuê</div>
                  {ownedProperties.length > 0 ? (
                    <div className="space-y-1 mt-1">
                      {ownedProperties.map((prop) => (
                        <div
                          key={prop.id}
                          className="flex items-center justify-between gap-2 text-[11px] bg-stone-950/60 px-2 py-1 rounded border border-stone-800/70"
                        >
                          <span className="text-stone-200 font-medium truncate">
                            {prop.name} {prop.count > 1 ? `×${prop.count}` : ''}
                          </span>
                          <span className="font-mono text-emerald-400 shrink-0">
                            +{formatCopper(getPropertySeasonalIncome(prop, life.world.worldState, life.stats.craftTrade) * prop.count)}/mùa
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-stone-500 mt-0.5">Chưa có điền sản hay nhà cho thuê</div>
                  )}
                </div>
                <div>
                  <div className="text-[11px] text-stone-400">Những thứ bạn có</div>
                  {personalPossessions.length > 0 ? (
                    <div className="text-stone-200 font-medium mt-0.5">
                      {personalPossessions.join(' · ')}
                    </div>
                  ) : (
                    <div className="text-stone-500 mt-0.5">Chưa có tư trang đáng kể</div>
                  )}
                </div>
                <div>
                  <div className="text-[11px] text-stone-400">Phương tiện đi lại</div>
                  <div className="text-stone-200 font-medium mt-0.5">{transportLabel}</div>
                </div>
                <div>
                  <div className="text-[11px] text-stone-400">Nơi ở &amp; Nếp sống</div>
                  <div className="text-stone-200 font-medium mt-0.5">
                    {(isOfficialPostedAway(life)
                      ? getOfficialResidenceLabel(life)
                      : HOUSING_NAMES[life.assets.housing] ?? life.assets.housing)} • {activeLifestyleLabel}
                  </div>
                </div>
                {life.family && (
                  <div className="pt-2 border-t border-stone-800/70 space-y-1.5">
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[11px] text-stone-400">Quỹ gia sản tích lũy</span>
                        <span className="font-mono font-semibold text-amber-200">
                          {formatCopper(life.family.familyWealthCopper)}
                        </span>
                      </div>
                      <div className="text-[10px] text-stone-500">
                        Tiền &amp; tài sản sẵn có của nhà (biến động theo thu chi &amp; sự kiện)
                      </div>
                    </div>
                    {familyCashflow && (() => {
                      const fatherDead =
                        life.flags.includes('mo_coi_cha') ||
                        !life.npcs.some((n) => n.id === 'npc_father' && n.isAlive);
                      const motherDead =
                        life.flags.includes('mo_coi_me') ||
                        !life.npcs.some((n) => n.id === 'npc_mother' && n.isAlive);
                      return (
                        <div className="rounded bg-stone-950/60 border border-stone-800/70 p-1.5 space-y-0.5 text-[10px]">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-stone-400 truncate">
                              Cha ({life.family!.fatherOccupationLabel ?? 'Không rõ'}){fatherDead ? ' · Đã mất' : ''}
                            </span>
                            <span className={`font-mono shrink-0 ${fatherDead ? 'text-stone-500' : 'text-emerald-400'}`}>
                              {fatherDead ? '0đ' : `+${formatCopper(familyCashflow.fatherIncome)}/tháng`}
                            </span>
                          </div>
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-stone-400 truncate">
                              Mẹ ({life.family!.motherOccupationLabel ?? 'Nội trợ'}){motherDead ? ' · Đã mất' : ''}
                            </span>
                            <span className={`font-mono shrink-0 ${motherDead ? 'text-stone-500' : 'text-emerald-400'}`}>
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
                            <span className="font-mono text-rose-400 shrink-0">
                              -{formatCopper(familyCashflow.expense)}/tháng
                            </span>
                          </div>
                          <div className="flex items-center justify-between gap-2 pt-0.5 border-t border-stone-800/60">
                            <span className="text-stone-400">Tích lũy ròng</span>
                            <span className={`font-mono font-semibold shrink-0 ${familyCashflow.net >= 0 ? 'text-amber-300' : 'text-rose-400'}`}>
                              {familyCashflow.net >= 0 ? '+' : ''}
                              {formatCopper(familyCashflow.net)}/tháng ({familyCashflow.net >= 0 ? '+' : ''}
                              {formatCopper(familyCashflow.net * 12)}/năm)
                            </span>
                          </div>
                        </div>
                      );
                    })()}
                    {life.family.familyAssetsSummary && life.family.familyAssetsSummary.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-0.5">
                        {life.family.familyAssetsSummary.map((item, idx) => (
                          <span
                            key={idx}
                            className="px-1.5 py-0.5 rounded bg-stone-950 border border-stone-800 text-[10px] text-stone-300"
                          >
                            {item}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={openActionModal}
                  className="w-full py-2 px-2.5 rounded-lg bg-stone-950/70 hover:bg-stone-800 border border-stone-700 text-xs font-semibold text-stone-100 transition cursor-pointer"
                >
                  Chi tiêu · Đầu tư
                </button>
                <button
                  type="button"
                  onClick={openProgressionModal}
                  className="w-full py-2 px-2.5 rounded-lg bg-stone-950/70 hover:bg-stone-800 border border-amber-700/50 text-xs font-semibold text-amber-200 transition cursor-pointer"
                >
                  Sự nghiệp · Sản nghiệp
                </button>
              </div>
            </div>
          </div>
  );
}
