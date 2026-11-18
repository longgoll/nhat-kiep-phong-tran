import { useEffect, useRef, useState } from 'react';
import {
  Heart,
  Smile,
  Users,
  BookOpen,
  AlertCircle,
  RotateCcw,
  X,
  Download,
  BookMarked,
  User,
  CalendarClock,
  ScrollText,
  Briefcase,
} from 'lucide-react';
import {
  getAgeYears,
  type FamilyLivingTier,
  type GiftEtiquetteTier,
  type InvestmentChannel,
  type LifestyleTier,
} from '../types/activeLife';
import { formatCopper } from '../engine/economy';
import {
  getDailyFixedExpenseSummary,
  getSeasonLabel,
  getWorldStateLabel,
} from '../engine/daySimulator';
import {
  FAMILY_TIER_LABELS,
  INTEREST_LABELS,
  ORIGIN_METADATA,
  TRAIT_LABELS,
} from '../engine/lifeInitializer';
import {
  AUTO_ACTION_CANDIDATES,
  canAffordInstantAction,
  canHaveChild,
  canMarrySpouse,
  getCreditLimitCopper,
  getInstantActionCooldownRemaining,
  getLifeFocusOptions,
  GIFT_ETIQUETTE_OPTIONS,
  INSTANT_ADULT_ACTIONS,
  rankInstantActions,
  type InstantAdultActionDef,
} from '../engine/adultLifeActions';
import { useActiveLifeStore } from '../stores/useActiveLifeStore';
import { getPropertySeasonalIncome, PROPERTY_CATALOG } from '../engine/progressionModules';
import {
  getCohortPeerStatusLabel,
  getCurrentLivelihoodLabel,
  getEducationLabel,
  getFeudalIncomeRankLabel,
  getFeudalTransportLabel,
  getPersonalPossessions,
  hasActiveLivelihood,
} from '../engine/lifeStatus';
import { getThemeWrapperClass, useLegacyArchiveStore } from '../stores/useLegacyArchiveStore';
import { ProgressionModules } from './ProgressionModules';
import { LegacyArchiveModal } from './LegacyArchiveModal';
import { FeudalPortrait } from './FeudalPortrait';
import { FeudalSceneBanner } from './FeudalSceneBanner';
import { FamilyLifeCard } from './FamilyLifeCard';
import { HOUSING_NAMES } from './FamilyWealthCard';
import { LifeGrid } from './LifeGrid';
import { LifeTimeline } from './LifeTimeline';
import { LifeTopBar } from './LifeTopBar';
import { StatExplainer } from './StatExplainer';
import { CareerModal } from './CareerModal';
import { CAREER_CATALOG, VENTURE_CATALOG } from '../engine/careerSystem';

const TIER_DOTS: Record<FamilyLivingTier, number> = {
  tung_thieu: 1,
  du_an: 2,
  kha_gia: 3,
  sung_tuc: 4,
  hoang_gia: 5,
};

const LIFESTYLE_OPTIONS: Array<{ value: LifestyleTier; label: string; desc: string }> = [
  { value: 'nhin_doi', label: 'Nhịn đói', desc: '0 gạo, 0đ (-1.8 SK, -1.2 HP/ngày)' },
  { value: 'chao_loang', label: 'Cháo loãng', desc: '0.5 đấu gạo/ngày (-0.04 SK, -0.05 HP)' },
  { value: 'com_rau', label: 'Cơm rau đạm bạc', desc: '1 đấu gạo + 5đ/ngày (Giữ thể lực)' },
  { value: 'thit_ca', label: 'Thịt cá đủ đầy', desc: '1.5 đấu gạo + 30đ/ngày (+5 SK, +7 HP/năm)' },
  { value: 'son_hao', label: 'Yến tiệc · Sơn hào', desc: '2 đấu gạo + 120đ/ngày (+9 SK, +12 HP, +5 Danh/năm)' },
];

const PAUSE_MESSAGES: Record<string, string> = {
  birthday: 'Đã bước sang tuổi mới!',
  low_health: 'Cảnh báo: Sức khỏe xuống dưới 20%!',
  low_happiness: 'Cảnh báo: Tinh thần rơi vào U uất (< 20%)!',
  no_food: 'Cảnh báo: Cạn lương thực và hết tiền mua gạo!',
};

function StatBar({
  label,
  value,
  icon,
  colorClass,
  onClick,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  colorClass: string;
  onClick?: () => void;
}) {
  const pct = Math.min(100, Math.max(0, Math.round(value)));
  return (
    <div
      onClick={onClick}
      className={`space-y-1 ${onClick ? 'cursor-pointer hover:opacity-90' : ''}`}
    >
      <div className="flex items-center justify-between text-xs">
        <span className="flex items-center gap-1.5 text-stone-300 font-medium">
          {icon}
          {label}
        </span>
        <span className="font-mono text-stone-200">{pct}%</span>
      </div>
      <div className="h-2 rounded-full bg-stone-800 overflow-hidden">
        <div className={`h-full transition-all duration-300 ${colorClass}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export function AdultDashboard() {
  const life = useActiveLifeStore((s) => s.life);
  const pendingEvent = useActiveLifeStore((s) => s.pendingEvent);
  const isSimulating = useActiveLifeStore((s) => s.isSimulating);
  const lastPauseReason = useActiveLifeStore((s) => s.lastPauseReason);
  const lastEventResult = useActiveLifeStore((s) => s.lastEventResult);
  const autoPauseConfig = useActiveLifeStore((s) => s.autoPauseConfig);

  const advanceAdultDays = useActiveLifeStore((s) => s.advanceAdultDays);
  const setLifestyle = useActiveLifeStore((s) => s.setLifestyle);
  const setLifeFocus = useActiveLifeStore((s) => s.setLifeFocus);
  const setGiftEtiquette = useActiveLifeStore((s) => s.setGiftEtiquette);
  const setInvestmentChannel = useActiveLifeStore((s) => s.setInvestmentChannel);
  const toggleAutoAction = useActiveLifeStore((s) => s.toggleAutoAction);
  const marrySpouseAction = useActiveLifeStore((s) => s.marrySpouseAction);
  const haveChildAction = useActiveLifeStore((s) => s.haveChildAction);
  const performInstantAction = useActiveLifeStore((s) => s.performInstantAction);
  const setAutoBuyRice = useActiveLifeStore((s) => s.setAutoBuyRice);
  const setAutoPauseConfig = useActiveLifeStore((s) => s.setAutoPauseConfig);
  const clearPauseReason = useActiveLifeStore((s) => s.clearPauseReason);
  const takeEmergencyLoan = useActiveLifeStore((s) => s.takeEmergencyLoan);
  const buyRice = useActiveLifeStore((s) => s.buyRice);
  const sellRice = useActiveLifeStore((s) => s.sellRice);
  const buyGold = useActiveLifeStore((s) => s.buyGold);
  const sellGold = useActiveLifeStore((s) => s.sellGold);
  const exportSaveJson = useActiveLifeStore((s) => s.exportSaveJson);
  const resetLife = useActiveLifeStore((s) => s.resetLife);
  const activeTheme = useLegacyArchiveStore((s) => s.activeTheme);
  const colorMode = useLegacyArchiveStore((s) => s.colorMode ?? 'dark');
  const themeClass = getThemeWrapperClass(activeTheme, colorMode);

  const [showNpcModal, setShowNpcModal] = useState(false);
  const [showArchive, setShowArchive] = useState(false);
  const [showActionModal, setShowActionModal] = useState(false);
  const [mobileTab, setMobileTab] = useState<'profile' | 'planner' | 'logs'>('planner');
  const [autoPlaySpeed, setAutoPlaySpeed] = useState<0 | 1 | 2 | 4 | 8 | 12 | 16>(0);
  const [subMonthProgress, setSubMonthProgress] = useState<number>(0);
  const lastTickTimeRef = useRef<number>(0);
  const [showLifestyleDetails, setShowLifestyleDetails] = useState(false);
  const [showMoreSpendActions, setShowMoreSpendActions] = useState(false);
  const [isCareerModalOpen, setIsCareerModalOpen] = useState(false);
  const [careerModalTab, setCareerModalTab] = useState<'current' | 'jobs' | 'ventures'>('jobs');

  const openCareerModal = (tab: 'current' | 'jobs' | 'ventures') => {
    setCareerModalTab(tab);
    setShowActionModal(false);
    setIsCareerModalOpen(true);
  };

  const isLifeAlive = life?.isAlive ?? false;
  const hasPendingEvent = Boolean(pendingEvent);
  const hasPauseReason = Boolean(lastPauseReason);

  useEffect(() => {
    if (autoPlaySpeed === 0) {
      setSubMonthProgress(0);
      return;
    }
    if (!isLifeAlive || hasPendingEvent || hasPauseReason) {
      setAutoPlaySpeed(0);
      setSubMonthProgress(0);
      return;
    }
    if (isSimulating) return;

    const tickConfig: Record<1 | 2 | 4 | 8 | 12 | 16, { days: number; ms: number }> = {
      1: { days: 30, ms: 4333 },  // 1x: 1 năm ≈ 52 giây
      2: { days: 30, ms: 2167 },  // 2x: 1 năm ≈ 26 giây
      4: { days: 30, ms: 1083 },  // 4x: 1 năm ≈ 13 giây
      8: { days: 30, ms: 542 },   // 8x: 1 năm ≈ 6.5 giây
      12: { days: 30, ms: 361 },  // 12x: 1 năm ≈ 4.3 giây
      16: { days: 30, ms: 271 },  // 16x: 1 năm ≈ 3 giây
    };
    const cfg = tickConfig[autoPlaySpeed];
    lastTickTimeRef.current = performance.now();
    let rafId = 0;

    const frame = (now: number) => {
      const elapsed = now - lastTickTimeRef.current;
      if (elapsed >= cfg.ms) {
        lastTickTimeRef.current = now;
        setSubMonthProgress(0);
        advanceAdultDays(cfg.days);
        return;
      }
      setSubMonthProgress(Math.min(1, elapsed / cfg.ms));
      rafId = window.requestAnimationFrame(frame);
    };

    rafId = window.requestAnimationFrame(frame);
    return () => window.cancelAnimationFrame(rafId);
  }, [autoPlaySpeed, isLifeAlive, hasPendingEvent, hasPauseReason, isSimulating, advanceAdultDays]);

  if (!life) return null;

  const age = getAgeYears(life.profile.totalDays);
  const originMeta = ORIGIN_METADATA[life.profile.originClass];
  const isBroke = life.assets.rice <= 0 && life.assets.wealthCopper < life.world.ricePriceInCopper;
  const isInDebt = life.flags.includes('dang_no_dia_chu');
  const isInPrison = life.livelihoodStatus === 'prison' || life.flags.includes('dang_o_tu');
  const creditLimitCopper = getCreditLimitCopper(life);
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

  const currentJobLabel = getCurrentLivelihoodLabel(life);
  const educationLabel = getEducationLabel(life);
  const incomeRankLabel = getFeudalIncomeRankLabel(annualIncomeCopper);
  const personalPossessions = getPersonalPossessions(life);
  const transportLabel = getFeudalTransportLabel(life);
  const hasJob = hasActiveLivelihood(life);
  const tierDots = life.family ? TIER_DOTS[life.family.familyLivingTier] ?? 1 : 1;
  const focusOptions = getLifeFocusOptions(life);
  const { recommended: recommendedSpendActions, others: moreSpendActions } = rankInstantActions(
    life,
    INSTANT_ADULT_ACTIONS,
    4,
  );
  const hasNegativeCash = life.assets.wealthCopper < 0;

  const openActionModal = () => {
    setAutoPlaySpeed(0);
    setShowActionModal(true);
  };

  const handleExportSave = () => {
    const json = exportSaveJson();
    if (!json) return;
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nkpt_${life.seed}_age${age}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className={`min-h-screen ${themeClass} p-3 sm:p-5 pb-20 lg:pb-5`}>
      <div className="max-w-7xl mx-auto space-y-4">
        {/* Top Unified Control Bar (1in8b style) */}
        <LifeTopBar
          ageYears={age}
          dayOfYear={life.profile.totalDays % 360}
          subMonthProgress={autoPlaySpeed > 0 ? subMonthProgress : 0}
          dynastyName={life.world.dynastyName}
          yearInEra={life.world.yearInEra}
          seasonLabel={getSeasonLabel(life.world.season)}
          seed={life.seed}
          autoPlaySpeed={autoPlaySpeed}
          speedOptions={[1, 2, 4, 8, 12, 16]}
          onSetSpeed={(spd) => {
            if (spd > 0) clearPauseReason();
            setAutoPlaySpeed(spd as 0 | 1 | 2 | 4 | 8 | 12 | 16);
          }}
          controlsDisabled={isSimulating || !life.isAlive}
          onReset={resetLife}
        />

        {/* Banners */}
        {lastPauseReason && PAUSE_MESSAGES[lastPauseReason] && (
          <div className="px-4 py-2.5 rounded-lg bg-amber-950/60 border border-amber-600/50 text-amber-200 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>{PAUSE_MESSAGES[lastPauseReason]}</span>
          </div>
        )}
        {lastEventResult && (
          <div className="px-4 py-2.5 rounded-lg bg-stone-900 border border-stone-700 text-stone-200 text-xs">
            {lastEventResult}
          </div>
        )}

        {/* 3-Column Dashboard */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* LEFT COLUMN: Hồ Sơ Cá Nhân + Trạng Thái + Tài Sản (Unified with ChildhoodView) */}
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
              {(isInDebt || isBroke || hasNegativeCash) && (
                <div className="pt-2.5 border-t border-stone-800/80 space-y-1 text-xs">
                  <div className="text-[11px] text-stone-400">Nợ</div>
                  {hasNegativeCash && (
                    <div className="font-mono font-bold text-rose-400">
                      {formatCopper(Math.abs(life.assets.wealthCopper))}
                    </div>
                  )}
                  {isInDebt ? (
                    <div className="font-semibold text-rose-400">
                      Nợ địa chủ (Đáo hạn sau 180 ngày • lãi 60%)
                    </div>
                  ) : !hasJob && age < 60 ? (
                    <div className="space-y-1.5">
                      <div className="text-[11px] text-rose-400">
                        Cạn tiền &amp; lương thực! Hãy tìm việc làm thuê hoặc vay nóng.
                      </div>
                      <button
                        type="button"
                        onClick={() => openCareerModal('jobs')}
                        className="inline-flex items-center gap-1 px-2 py-1 rounded bg-amber-600/20 hover:bg-amber-600/35 border border-amber-500/50 text-[11px] font-semibold text-amber-200 cursor-pointer"
                      >
                        <Briefcase className="w-3 h-3" /> Tìm việc ngay
                      </button>
                    </div>
                  ) : null}
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
                      <span className="text-stone-300">Thu nhập lao động &amp; bổng lộc</span>
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
                    {HOUSING_NAMES[life.assets.housing] ?? life.assets.housing} • {activeLifestyleLabel}
                  </div>
                </div>
                {life.family && (
                  <div className="pt-2 border-t border-stone-800/70 space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[11px] text-stone-400">Gia sản gia đình gốc</span>
                      <span className="font-mono font-semibold text-amber-200">
                        {formatCopper(life.family.familyWealthCopper)}
                      </span>
                    </div>
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

              <button
                type="button"
                onClick={openActionModal}
                className="w-full py-2 px-3 rounded-lg bg-stone-950/70 hover:bg-stone-800 border border-stone-700 text-xs font-semibold text-stone-100 transition cursor-pointer"
              >
                Chi tiêu · Đầu tư
              </button>
            </div>
          </div>

          {/* CENTER COLUMN: Action Planner, Stamina, Fallback, Fast-Forward */}
          <div className={`lg:col-span-5 space-y-4 ${mobileTab === 'planner' ? 'block' : 'hidden lg:block'}`}>
            <FeudalSceneBanner
              housing={life.assets.housing}
              season={life.world.season}
              worldState={life.world.worldState}
              ageYears={age}
              gender={life.profile.gender}
              originClass={life.profile.originClass}
              birthPlace={life.family?.birthPlace}
              npcs={life.npcs}
              flags={life.flags}
              family={life.family}
            />

            {/* Trọng tâm hiện tại (Life Focus) */}
            <div className="bg-stone-900/75 border border-stone-800 rounded-xl p-3.5 space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-amber-300">
                  Trọng Tâm Hiện Tại
                </h3>
                <span className="text-[10px] text-stone-400">Có thể đổi bất cứ lúc nào</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {focusOptions.map((opt) => {
                  const active = (life.schedule.lifeFocus || 'can_bang') === opt.id || (life.schedule.lifeFocus === 'sinh_ton' && opt.id === 'can_bang');
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setLifeFocus(opt.id)}
                      title={opt.description}
                      className={`text-left px-2.5 py-1.5 rounded-lg border transition cursor-pointer ${
                        active
                          ? 'bg-emerald-950/70 border-emerald-500 text-emerald-100'
                          : 'bg-stone-950/60 border-stone-800 hover:border-stone-700 text-stone-300'
                      }`}
                    >
                      <div className="text-[11px] font-semibold leading-tight">{opt.label}</div>
                      <div className="text-[10px] text-stone-400 leading-tight mt-0.5">{opt.effectHint}</div>
                    </button>
                  );
                })}
              </div>

              <div className="pt-1.5 border-t border-stone-800/80 flex flex-wrap items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={openActionModal}
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-stone-950 hover:bg-stone-800 border border-stone-700 hover:border-amber-500/60 text-xs font-semibold text-amber-200 transition cursor-pointer"
                >
                  <span>Chi tiêu · Đầu tư</span>
                  <span className={`text-[10px] font-mono ${hasNegativeCash ? 'text-rose-400' : 'text-stone-400'}`}>
                    {formatCopper(life.assets.wealthCopper)}
                  </span>
                </button>
                <span className="text-[11px] text-stone-400 truncate max-w-[220px]">
                  {life.activeCareer
                    ? CAREER_CATALOG.find((j) => j.id === life.activeCareer!.jobId)?.title
                    : life.activeVenture
                      ? VENTURE_CATALOG.find((v) => v.id === life.activeVenture!.ventureId)?.title
                      : ''}
                </span>
              </div>
            </div>

            {/* Ghi Chép Cuộc Đời (Timeline Hero) */}
            <LifeTimeline
              logs={life.logs}
              maxHeightClass="max-h-96"
              isRunning={autoPlaySpeed > 0}
            />
          </div>

          {/* RIGHT COLUMN: Gia Đình + Đồng Niên + Bản Đồ (1in8b order) */}
          <div className={`lg:col-span-4 space-y-4 ${mobileTab === 'logs' ? 'block' : 'hidden lg:block'}`}>
            {/* Gia đình & Cuộc đời (liền mạch từ lúc nhỏ) */}
            <FamilyLifeCard
              npcs={life.npcs}
              ageYears={age}
              onOpenDetails={() => setShowNpcModal(true)}
              maxHeightClass="max-h-60"
            />

            {life.cohortPeers && life.cohortPeers.length > 0 && (
              <div className="bg-stone-900/75 border border-stone-800 rounded-xl p-3.5 space-y-1.5">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-semibold uppercase tracking-wider text-stone-400">
                    Người Đồng Niên
                  </span>
                  <span className="text-[10px] text-stone-500">Cùng {age} tuổi</span>
                </div>
                <div className="space-y-1">
                  {life.cohortPeers.slice(0, 4).map((peer) => {
                    const status = getCohortPeerStatusLabel(peer, age);
                    return (
                      <div
                        key={peer.id}
                        className="flex items-center justify-between gap-2 text-[11px]"
                      >
                        <span className="text-stone-300 truncate">{peer.name}</span>
                        <span className={status.isDead ? 'text-rose-400 shrink-0' : 'text-stone-500 shrink-0'}>
                          {status.text}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <LifeGrid
              ageYears={age}
              milestones={life.milestones}
              yearlyHappiness={life.yearlyHappiness}
              expectedLifespan={originMeta.expectedLifespan}
              logs={life.logs}
            />
            <div className="bg-stone-900/80 border border-stone-800 rounded-xl p-3.5 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-stone-400">Niên hiệu</span>
                <span className="font-semibold text-amber-200">
                  {life.world.dynastyName} năm thứ {life.world.yearInEra}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-stone-400">Thời cuộc</span>
                <span className="text-stone-200">{getWorldStateLabel(life.world.worldState)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-stone-400">Giá lúa hiện tại</span>
                <span className="font-mono text-emerald-300">{life.world.ricePriceInCopper} đồng / đấu</span>
              </div>
              <div className="pt-2 border-t border-stone-800 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => setShowArchive(true)}
                  className="inline-flex items-center gap-1 text-xs text-amber-400 hover:text-amber-300 cursor-pointer"
                >
                  <BookMarked className="w-3.5 h-3.5" /> Tàng Kinh Các
                </button>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handleExportSave}
                    className="inline-flex items-center gap-1 text-xs text-sky-400 hover:text-sky-300 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" /> Save
                  </button>
                  <button
                    type="button"
                    onClick={resetLife}
                    className="inline-flex items-center gap-1 text-xs text-stone-500 hover:text-stone-300 cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" /> Bỏ kiếp
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Chi tiêu · Đầu tư Modal (1in8b 3-tier structure) */}
      {showActionModal && (
        <div
          className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-3 sm:p-4"
          onClick={() => setShowActionModal(false)}
        >
          <div
            className="max-w-2xl w-full max-h-[88vh] bg-stone-900 border border-stone-700 rounded-xl flex flex-col overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-stone-800 bg-stone-950/60">
              <span className="text-xs font-semibold uppercase tracking-wider text-amber-300">
                Chi tiêu · Đầu tư
              </span>
              <button
                type="button"
                onClick={() => setShowActionModal(false)}
                className="inline-flex items-center gap-1 text-xs font-medium text-stone-300 hover:text-stone-100 cursor-pointer"
              >
                Đóng <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable Body */}
            <div className="p-5 space-y-4 overflow-y-auto">
              {/* Tier 1: Financial Header */}
              <div className="space-y-1">
                <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
                  <h2 className={`text-xl font-bold ${hasNegativeCash ? 'text-rose-400' : 'text-stone-100'}`}>
                    {hasNegativeCash ? `Đang nợ ${formatCopper(Math.abs(life.assets.wealthCopper))}` : `Tiền mặt ${formatCopper(life.assets.wealthCopper)}`}
                  </h2>
                  <span className="text-xs font-mono text-amber-300">
                    Gạo: {life.assets.rice.toFixed(1)} đấu
                  </span>
                  <span className="text-[11px] font-mono text-stone-400">
                    Hạn mức vay: {formatCopper(creditLimitCopper)}
                  </span>
                </div>
                {(() => {
                  const fixed = getDailyFixedExpenseSummary(life);
                  return (
                    <div className="text-[11px] text-stone-300 font-mono">
                      {fixed.isFamilyCovered
                        ? 'Chi cố định: 0đ/ngày (Đang được gia đình chu cấp)'
                        : `Chi cố định: ${fixed.totalCopper}đ/ngày (Ăn ${fixed.foodCopper}đ + ${fixed.ricePerDay} đấu gạo · Nhà ở ${fixed.housingCopper}đ)`}
                    </div>
                  );
                })()}
                <p className="text-xs text-stone-400">
                  Các lựa chọn hợp hoàn cảnh nhất được ưu tiên lên trên. Thời gian tự động tạm dừng khi bạn xem bảng này.
                </p>
              </div>

              {/* Tier 2: Nên làm lúc này (Top ranked) */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-sky-300">
                    Nên làm lúc này
                  </h3>
                  <span className="text-[10px] text-stone-400">
                    {isInPrison ? 'Đang trong ngục (PRISON_SHOP)' : 'Gợi ý theo hoàn cảnh'}
                  </span>
                </div>
                {(() => {
                  const renderActionCard = (act: InstantAdultActionDef) => {
                    const cd = getInstantActionCooldownRemaining(life, act.id, act.cooldownDays);
                    const ageBlocked = act.minAge !== undefined && age < act.minAge;
                    const maxAgeBlocked = act.maxAge !== undefined && age > act.maxAge;
                    const worldBlocked = act.blockedWorldStates?.includes(life.world.worldState) ?? false;
                    const houseBlocked =
                      act.requiresNotHousing !== undefined && life.assets.housing === act.requiresNotHousing;
                    const { canPay, onCredit, effectiveCost } = canAffordInstantAction(life, act);
                    const disabled =
                      cd > 0 || ageBlocked || maxAgeBlocked || worldBlocked || houseBlocked || !canPay;
                    return (
                      <button
                        key={act.id}
                        type="button"
                        disabled={disabled}
                        onClick={() => performInstantAction(act.id)}
                        className="text-left p-2.5 rounded-lg bg-stone-950/70 hover:bg-stone-800/70 border border-stone-800 hover:border-sky-600/60 disabled:opacity-45 disabled:cursor-not-allowed transition cursor-pointer space-y-1"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <span className="text-xs font-semibold text-stone-100 leading-snug">{act.title}</span>
                          <span className="shrink-0 text-[11px] font-mono text-amber-300">
                            {effectiveCost === 0 ? 'Miễn phí' : `${effectiveCost}đ`}
                          </span>
                        </div>
                        <div className="text-[11px] text-stone-400">{act.subtitle}</div>
                        {onCredit && !disabled && (
                          <div className="text-[10px] text-amber-400 font-medium">
                            Thiếu tiền mặt · Có thể vay để thực hiện
                          </div>
                        )}
                        {worldBlocked && (
                          <div className="text-[10px] text-rose-400 font-medium">Tạm khóa do thời cuộc loạn lạc</div>
                        )}
                        {cd > 0 && (
                          <div className="text-[10px] text-sky-400 font-mono">Chờ {cd} ngày</div>
                        )}
                      </button>
                    );
                  };

                  return (
                    <>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {!isInPrison && (
                          <>
                            {/* Tìm chỗ làm mới */}
                            <button
                              type="button"
                              onClick={() => openCareerModal('jobs')}
                              className="text-left p-2.5 rounded-lg bg-stone-950/70 hover:bg-stone-800/70 border border-emerald-700/50 hover:border-emerald-500 transition cursor-pointer space-y-1"
                            >
                              <div className="flex items-start justify-between gap-2">
                                <span className="text-xs font-semibold text-emerald-200 leading-snug">
                                  {hasJob ? 'Đổi chỗ làm mới' : 'Tìm chỗ làm mới'}
                                </span>
                                <span className="shrink-0 text-[11px] font-mono text-emerald-300">Miễn phí</span>
                              </div>
                              <div className="text-[11px] text-stone-400">
                                Xem các công việc phù hợp với học thức, tay nghề và mối quen hiện tại
                              </div>
                            </button>

                            {/* Tìm hiểu việc khởi nghiệp */}
                            <button
                              type="button"
                              onClick={() => openCareerModal('ventures')}
                              className="text-left p-2.5 rounded-lg bg-stone-950/70 hover:bg-stone-800/70 border border-sky-700/50 hover:border-sky-500 transition cursor-pointer space-y-1"
                            >
                              <div className="flex items-start justify-between gap-2">
                                <span className="text-xs font-semibold text-sky-200 leading-snug">
                                  Tìm hiểu việc khởi nghiệp
                                </span>
                                <span className="shrink-0 text-[11px] font-mono text-sky-300">Miễn phí</span>
                              </div>
                              <div className="text-[11px] text-stone-400">
                                Cân nhắc mô hình kinh doanh riêng vừa túi tiền &amp; tay nghề
                              </div>
                            </button>

                            {/* Quản lý công việc hiện tại */}
                            {(life.activeCareer || life.activeVenture) && (
                              <button
                                type="button"
                                onClick={() => openCareerModal('current')}
                                className="sm:col-span-2 text-left p-2.5 rounded-lg bg-emerald-950/30 hover:bg-emerald-950/50 border border-emerald-700/60 transition cursor-pointer flex items-center justify-between gap-3"
                              >
                                <div>
                                  <div className="text-xs font-semibold text-emerald-200">
                                    Công việc hiện tại:{' '}
                                    {life.activeCareer
                                      ? CAREER_CATALOG.find((j) => j.id === life.activeCareer!.jobId)?.title
                                      : VENTURE_CATALOG.find((v) => v.id === life.activeVenture!.ventureId)?.title}
                                  </div>
                                  <div className="text-[11px] text-stone-400">
                                    Bấm để xin thăng tiến, làm thêm ngoài giờ, tu nghiệp hoặc nghỉ việc
                                  </div>
                                </div>
                                <span className="text-[11px] font-semibold text-emerald-300 shrink-0">Quản lý →</span>
                              </button>
                            )}
                          </>
                        )}

                        {recommendedSpendActions.map(renderActionCard)}
                      </div>

                      {!isInPrison && (
                        <>
                          {/* Tier 3: Xem thêm (Collapsible by default - 1in8b pattern) */}
                          <div className="border border-stone-800 rounded-xl bg-stone-950/40 mt-4">
                            <button
                              type="button"
                              onClick={() => setShowMoreSpendActions((v) => !v)}
                              className="w-full flex items-center justify-between px-4 py-2.5 text-left cursor-pointer hover:bg-stone-900/60 transition rounded-xl"
                            >
                              <span className="text-xs font-semibold text-stone-200">
                                Xem thêm ({moreSpendActions.length + 4} mục · Gạo &amp; Vàng · Gia thất · Khoa cử · Điền sản)
                              </span>
                              <span className="text-[11px] text-sky-400 font-medium">
                                {showMoreSpendActions ? 'Thu gọn' : 'Mở rộng'}
                              </span>
                            </button>

                            {showMoreSpendActions && (
                              <div className="px-4 pb-4 pt-2 border-t border-stone-800 space-y-4">
                                {moreSpendActions.length > 0 && (
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    {moreSpendActions.map(renderActionCard)}
                                  </div>
                                )}

                    {/* Gia thất & Con cái */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {(() => {
                        const m = canMarrySpouse(life);
                        const c = canHaveChild(life);
                        return (
                          <>
                            <button
                              type="button"
                              disabled={!m.ok}
                              onClick={marrySpouseAction}
                              className="text-left p-2.5 rounded-lg bg-rose-950/30 hover:bg-rose-950/50 border border-rose-800/40 disabled:opacity-45 disabled:cursor-not-allowed cursor-pointer"
                            >
                              <div className="flex justify-between text-xs font-semibold text-rose-200">
                                <span>Thành gia lập thất</span>
                                <span className="font-mono text-amber-300">300đ</span>
                              </div>
                              <div className="text-[10px] text-stone-400 mt-0.5">
                                {m.ok ? 'Cưới vợ / gả chồng, +14 Hạnh phúc' : m.reason}
                              </div>
                            </button>
                            <button
                              type="button"
                              disabled={!c.ok}
                              onClick={haveChildAction}
                              className="text-left p-2.5 rounded-lg bg-emerald-950/30 hover:bg-emerald-950/50 border border-emerald-800/40 disabled:opacity-45 disabled:cursor-not-allowed cursor-pointer"
                            >
                              <div className="flex justify-between text-xs font-semibold text-emerald-200">
                                <span>Sinh con nối dõi</span>
                                <span className="font-mono text-amber-300">150đ</span>
                              </div>
                              <div className="text-[10px] text-stone-400 mt-0.5">
                                {c.ok ? 'Thêm thành viên mới, +15 Hạnh phúc' : c.reason}
                              </div>
                            </button>
                          </>
                        );
                      })()}
                    </div>

                    {/* Giao dịch Gạo & Vàng tích trữ */}
                    <div className="p-3 rounded-lg bg-stone-950/60 border border-stone-800 space-y-2">
                      <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                        <span className="font-semibold text-amber-200">Chợ Gạo &amp; Đổi Vàng tích trữ</span>
                        <span className="font-mono text-[11px] text-stone-400">
                          Giá lúa: {life.world.ricePriceInCopper}đ/đấu · Vàng giữ: {formatCopper(life.assets.goldReserveCopper ?? 0)}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2 text-[11px]">
                        <button
                          type="button"
                          disabled={life.assets.wealthCopper < life.world.ricePriceInCopper * 10}
                          onClick={() => buyRice(10)}
                          className="px-2.5 py-1 rounded bg-stone-900 hover:bg-stone-800 disabled:opacity-40 border border-stone-700 text-emerald-300 cursor-pointer"
                        >
                          Mua 10 đấu gạo (-{life.world.ricePriceInCopper * 10}đ)
                        </button>
                        <button
                          type="button"
                          disabled={life.assets.rice < 10}
                          onClick={() => sellRice(10)}
                          className="px-2.5 py-1 rounded bg-stone-900 hover:bg-stone-800 disabled:opacity-40 border border-stone-700 text-amber-300 cursor-pointer"
                        >
                          Bán 10 đấu gạo
                        </button>
                        <button
                          type="button"
                          disabled={life.assets.wealthCopper < 1000}
                          onClick={() => buyGold(1000)}
                          className="px-2.5 py-1 rounded bg-stone-900 hover:bg-stone-800 disabled:opacity-40 border border-stone-700 text-sky-300 cursor-pointer"
                        >
                          Tích 1 Bạc vàng
                        </button>
                        <button
                          type="button"
                          disabled={(life.assets.goldReserveCopper ?? 0) < 1000}
                          onClick={() => sellGold(1000)}
                          className="px-2.5 py-1 rounded bg-stone-900 hover:bg-stone-800 disabled:opacity-40 border border-stone-700 text-amber-200 cursor-pointer"
                        >
                          Đổi 1 Bạc ra tiền
                        </button>
                      </div>
                    </div>

                    {/* Sự nghiệp · Sản nghiệp */}
                    <ProgressionModules />

                    {/* Vay nóng địa chủ (khi túng quẫn) */}
                    <div className="pt-2 border-t border-stone-800 flex items-center justify-between gap-3">
                      <div className="text-[11px] text-stone-400">
                        <span className="font-semibold text-rose-400">Vay nóng Địa chủ:</span> Nhận 500đ khi túng quẫn (trả lãi 60% sau 180 ngày).
                      </div>
                      <button
                        type="button"
                        disabled={isInDebt}
                        onClick={takeEmergencyLoan}
                        className="shrink-0 px-3 py-1.5 rounded-lg bg-rose-950/70 hover:bg-rose-900/70 disabled:opacity-40 border border-rose-700/50 text-rose-100 text-xs font-semibold cursor-pointer"
                      >
                        {isInDebt ? 'Đang mang nợ' : 'Vay +500đ'}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Tier 4: Lối sống & Tự động (Collapsible by default) */}
              <div className="border border-stone-800 rounded-xl bg-stone-950/50">
                <button
                  type="button"
                  onClick={() => setShowLifestyleDetails((v) => !v)}
                  className="w-full flex items-center justify-between px-4 py-2.5 text-left cursor-pointer hover:bg-stone-900/60 transition rounded-xl"
                >
                  <div className="flex items-center gap-2 text-xs">
                    <span className="font-semibold text-amber-300">Lối sống &amp; Tự động hằng năm</span>
                    <span className="text-stone-400">
                      · {LIFESTYLE_OPTIONS.find((o) => o.value === life.schedule.lifestyle)?.label}
                    </span>
                  </div>
                  <span className="text-[11px] text-sky-400 font-medium">
                    {showLifestyleDetails ? 'Thu gọn' : 'Tùy chỉnh'}
                  </span>
                </button>

                {showLifestyleDetails && (
                  <div className="px-4 pb-4 pt-2 border-t border-stone-800 space-y-3">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-medium text-stone-300">Mức sống hàng ngày</label>
                        <label className="flex items-center gap-1.5 text-[11px] text-stone-400 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={life.schedule.autoBuyRice}
                            onChange={(e) => setAutoBuyRice(e.target.checked)}
                            className="accent-amber-500"
                          />
                          Tự động mua gạo khi thiếu
                        </label>
                      </div>
                      <select
                        value={life.schedule.lifestyle}
                        onChange={(e) => setLifestyle(e.target.value as LifestyleTier)}
                        className="w-full px-2.5 py-2 rounded-lg bg-stone-950 border border-stone-700 text-xs text-stone-100"
                      >
                        {LIFESTYLE_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label} — {opt.desc}
                          </option>
                        ))}
                      </select>

                      <div>
                        <label className="block text-[11px] font-medium text-stone-400 mb-1">
                          Đầu tư tiền nhàn rỗi (Sinh lời hằng năm)
                        </label>
                        <select
                          value={life.investmentChannel ?? 'cash'}
                          onChange={(e) => setInvestmentChannel(e.target.value as InvestmentChannel)}
                          className="w-full px-2.5 py-1.5 rounded-lg bg-stone-950 border border-stone-700 text-xs text-stone-100"
                        >
                          <option value="cash">Giữ tiền mặt (0%/năm · Thanh khoản tuyệt đối)</option>
                          <option value="bank">Gửi tiền trang (~1.5%/năm · An toàn)</option>
                          <option value="guild">Hùn vốn thương hội (~3.5%/năm · Ổn định)</option>
                          <option value="land_fund">Quỹ điền sản (~4.0%/năm · Dài hạn)</option>
                          <option value="caravan">Buôn chuyến đường dài (-2% đến +9%/năm · Rủi ro)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-medium text-stone-400 mb-1">
                          Tiền hiếu hỉ (ma chay, cưới hỏi họ hàng)
                        </label>
                        <select
                          value={life.schedule.giftEtiquette ?? 'tuy_kha_nang'}
                          onChange={(e) => setGiftEtiquette(e.target.value as GiftEtiquetteTier)}
                          className="w-full px-2.5 py-1.5 rounded-lg bg-stone-950 border border-stone-700 text-xs text-stone-100"
                        >
                          {GIFT_ETIQUETTE_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label} — {opt.desc}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Auto-Pause Toggles */}
                    <div className="pt-2 border-t border-stone-800 space-y-1.5">
                      <div className="text-[11px] text-stone-400">
                        Tự động dừng khi chạy tua nhanh:
                      </div>
                      <div className="flex flex-wrap gap-3 text-[11px] text-stone-400">
                        <label className="flex items-center gap-1 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={autoPauseConfig.pauseOnBirthday}
                            onChange={(e) => setAutoPauseConfig({ pauseOnBirthday: e.target.checked })}
                            className="accent-amber-500"
                          />
                          Dừng khi sinh nhật
                        </label>
                        <label className="flex items-center gap-1 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={autoPauseConfig.pauseOnLowHealth}
                            onChange={(e) => setAutoPauseConfig({ pauseOnLowHealth: e.target.checked })}
                            className="accent-amber-500"
                          />
                          Dừng khi HP &lt; 20%
                        </label>
                        <label className="flex items-center gap-1 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={autoPauseConfig.pauseOnNoFood}
                            onChange={(e) => setAutoPauseConfig({ pauseOnNoFood: e.target.checked })}
                            className="accent-amber-500"
                          />
                          Dừng khi hết gạo
                        </label>
                      </div>
                    </div>

                    {/* Tự động hằng năm */}
                    <div className="pt-2 border-t border-stone-800 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold uppercase tracking-wider text-stone-300">Tự động hằng năm</span>
                        <span className="text-[11px] text-stone-500">Chỉ chạy khi tiền mặt &gt; 3× chi phí</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                        {AUTO_ACTION_CANDIDATES.map((actId) => {
                          const def = INSTANT_ADULT_ACTIONS.find((a) => a.id === actId);
                          if (!def) return null;
                          const checked = (life.autoActions ?? []).includes(actId);
                          return (
                            <label
                              key={actId}
                              className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-stone-950/60 border border-stone-800 text-[11px] text-stone-300 cursor-pointer hover:border-stone-700"
                            >
                              <input
                                type="checkbox"
                                checked={checked}
                                onChange={() => toggleAutoAction(actId)}
                                className="accent-sky-500"
                              />
                              <span className="truncate">{def.title}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </div>
                        </>
                      )}
                    </>
                  );
                })()}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-5 py-2.5 border-t border-stone-800 bg-stone-950/60 flex justify-end">
              <button
                type="button"
                onClick={() => setShowActionModal(false)}
                className="px-4 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-xs font-semibold text-stone-200 cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* NPC Modal */}
      {showNpcModal && (
        <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-stone-900 border border-stone-700 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-serif font-bold text-lg text-amber-100">Danh Sách Quan Hệ NPC</h3>
              <button
                type="button"
                onClick={() => setShowNpcModal(false)}
                className="text-stone-400 hover:text-stone-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {life.npcs
                .filter((npc) => npc.age === undefined || npc.age + age >= 0)
                .map((npc) => (
                <div
                  key={npc.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-stone-950 border border-stone-800 text-xs"
                >
                  <div>
                    <div className="font-semibold text-stone-100">{npc.name}</div>
                    <div className="text-stone-400">{npc.role}</div>
                  </div>
                  <span className={`font-mono font-bold ${npc.affinity >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {npc.affinity >= 0 ? `+${npc.affinity}` : npc.affinity}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      {/* Mobile Bottom Tab Bar */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-stone-900/95 border-t border-stone-800 grid grid-cols-3">
        <button
          type="button"
          onClick={() => setMobileTab('profile')}
          className={`py-2.5 flex flex-col items-center gap-1 text-[11px] font-medium cursor-pointer ${
            mobileTab === 'profile' ? 'text-amber-400' : 'text-stone-400'
          }`}
        >
          <User className="w-4 h-4" /> Hồ sơ
        </button>
        <button
          type="button"
          onClick={() => setMobileTab('planner')}
          className={`py-2.5 flex flex-col items-center gap-1 text-[11px] font-medium cursor-pointer ${
            mobileTab === 'planner' ? 'text-amber-400' : 'text-stone-400'
          }`}
        >
          <CalendarClock className="w-4 h-4" /> Điều hành
        </button>
        <button
          type="button"
          onClick={() => setMobileTab('logs')}
          className={`py-2.5 flex flex-col items-center gap-1 text-[11px] font-medium cursor-pointer ${
            mobileTab === 'logs' ? 'text-amber-400' : 'text-stone-400'
          }`}
        >
          <ScrollText className="w-4 h-4" /> Nhật ký
        </button>
      </nav>

      {showArchive && <LegacyArchiveModal onClose={() => setShowArchive(false)} />}
      <CareerModal
        isOpen={isCareerModalOpen}
        onClose={() => setIsCareerModalOpen(false)}
        initialTab={careerModalTab}
      />
    </div>
  );
}
