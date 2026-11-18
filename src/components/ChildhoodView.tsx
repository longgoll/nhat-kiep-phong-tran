import { useEffect, useRef, useState } from 'react';
import {
  Heart,
  Smile,
  Users,
  BookOpen,
  Coins,
  Wheat,
  RotateCcw,
  Swords,
  Hammer,
  Award,
  CheckCircle2,
  ScrollText,
} from 'lucide-react';
import { getAgeYears, type FamilyLivingTier } from '../types/activeLife';
import { formatCopper } from '../engine/economy';
import { getSeasonLabel } from '../engine/daySimulator';
import {
  FAMILY_TIER_LABELS,
  INTEREST_LABELS,
  ORIGIN_METADATA,
  TRAIT_LABELS,
} from '../engine/lifeInitializer';
import { getChildhoodFocusOptions } from '../engine/childhoodEngine';
import { useActiveLifeStore } from '../stores/useActiveLifeStore';
import { getThemeWrapperClass, useLegacyArchiveStore } from '../stores/useLegacyArchiveStore';
import { FeudalPortrait } from './FeudalPortrait';
import { FeudalSceneBanner } from './FeudalSceneBanner';
import { FamilyLifeCard } from './FamilyLifeCard';
import { FamilyWealthCard } from './FamilyWealthCard';
import { LifeGrid } from './LifeGrid';
import { LifeTimeline } from './LifeTimeline';
import { LifeTopBar } from './LifeTopBar';
import { StatExplainer } from './StatExplainer';

const TIER_DOTS: Record<FamilyLivingTier, number> = {
  tung_thieu: 1,
  du_an: 2,
  kha_gia: 3,
  sung_tuc: 4,
  hoang_gia: 5,
};

function StatBar({
  label,
  value,
  icon,
  colorClass,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  colorClass: string;
}) {
  const pct = Math.min(100, Math.max(0, Math.round(value)));
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="flex items-center gap-1.5 text-stone-300 font-medium">
          {icon}
          {label}
        </span>
        <span className="font-mono text-stone-200">{pct}%</span>
      </div>
      <div className="h-1.5 rounded-full bg-stone-800 overflow-hidden">
        <div className={`h-full transition-all duration-300 ${colorClass}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export function ChildhoodView() {
  const life = useActiveLifeStore((s) => s.life);
  const pendingEvent = useActiveLifeStore((s) => s.pendingEvent);
  const lastEventResult = useActiveLifeStore((s) => s.lastEventResult);
  const stepChildhoodMonth = useActiveLifeStore((s) => s.stepChildhoodMonth);
  const setChildhoodFocus = useActiveLifeStore((s) => s.setChildhoodFocus);
  const clearLastEventResult = useActiveLifeStore((s) => s.clearLastEventResult);
  const resetLife = useActiveLifeStore((s) => s.resetLife);
  const recordCompletedLife = useLegacyArchiveStore((s) => s.recordCompletedLife);
  const activeTheme = useLegacyArchiveStore((s) => s.activeTheme);
  const colorMode = useLegacyArchiveStore((s) => s.colorMode ?? 'dark');
  const themeClass = getThemeWrapperClass(activeTheme, colorMode);

  const [autoPlaySpeed, setAutoPlaySpeed] = useState<0 | 1 | 2 | 4 | 8>(0);
  const [subMonthProgress, setSubMonthProgress] = useState<number>(0);
  const lastTickTimeRef = useRef<number>(0);

  const currentAge = life ? getAgeYears(life.profile.totalDays) : 0;
  const isLifeAlive = life?.isAlive ?? false;
  const hasPendingEvent = Boolean(pendingEvent);

  useEffect(() => {
    if (autoPlaySpeed === 0) {
      setSubMonthProgress(0);
      return;
    }
    if (!isLifeAlive || hasPendingEvent || currentAge >= 13) {
      setAutoPlaySpeed(0);
      setSubMonthProgress(0);
      return;
    }

    // 1x = 52s/year (12 months) => ~4333ms/month, scaling down proportionally
    const monthMs = 52000 / 12 / autoPlaySpeed;
    lastTickTimeRef.current = performance.now();
    let rafId = 0;

    const frame = (now: number) => {
      const elapsed = now - lastTickTimeRef.current;
      if (elapsed >= monthMs) {
        lastTickTimeRef.current = now;
        setSubMonthProgress(0);
        const store = useActiveLifeStore.getState();
        store.clearLastEventResult();
        store.stepChildhoodMonth();
      } else {
        setSubMonthProgress(Math.min(1, elapsed / monthMs));
      }
      rafId = window.requestAnimationFrame(frame);
    };

    rafId = window.requestAnimationFrame(frame);
    return () => window.cancelAnimationFrame(rafId);
  }, [autoPlaySpeed, isLifeAlive, hasPendingEvent, currentAge]);

  if (!life) return null;

  const age = currentAge;
  const dayOfYear = life.profile.totalDays % 360;
  const originMeta = ORIGIN_METADATA[life.profile.originClass];
  const isInfancy = age < 6;
  const isTeenReady = age >= 13;
  const activeFocusId = life.schedule.childhoodFocus || 'giup_nha';

  const handleAdvance = () => {
    setAutoPlaySpeed(0);
    clearLastEventResult();
    stepChildhoodMonth();
  };

  const handleRestart = () => {
    if (!life.isAlive) {
      recordCompletedLife(life, 'Yểu mệnh thuở thiếu thời');
    }
    resetLife();
  };

  const tierDots = life.family ? TIER_DOTS[life.family.familyLivingTier] ?? 1 : 1;

  return (
    <div className={`min-h-screen ${themeClass} p-3 sm:p-5`}>
      <div className="max-w-7xl mx-auto space-y-4">
        {/* Top Unified Control Bar (1in8b style) */}
        <LifeTopBar
          ageYears={age}
          dayOfYear={dayOfYear}
          subMonthProgress={autoPlaySpeed > 0 ? subMonthProgress : 0}
          isChildhood
          dynastyName={life.world.dynastyName}
          yearInEra={life.world.yearInEra}
          seasonLabel={getSeasonLabel(life.world.season)}
          seed={life.seed}
          autoPlaySpeed={autoPlaySpeed}
          speedOptions={[1, 2, 4, 8]}
          onSetSpeed={(spd) => setAutoPlaySpeed(spd as 0 | 1 | 2 | 4 | 8)}
          primaryStep={{
            label: !life.isAlive
              ? 'Đã qua đời'
              : isTeenReady
                ? 'Đã thành niên'
                : 'Tiếp (+1 tháng)',
            onClick: handleAdvance,
            disabled: !life.isAlive || isTeenReady,
          }}
          onReset={resetLife}
        />

        {/* 3-Column Modular Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
          {/* LEFT COLUMN: Hồ Sơ Cá Nhân + Trạng Thái */}
          <div className="lg:col-span-3 space-y-4">
            {/* Passport / Hộ Khẩu Card */}
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
                    <p className="text-[11px] text-amber-300 font-medium truncate">{originMeta.label}</p>
                  </div>
                </div>

                {life.family && (
                  <div className="pt-2 border-t border-stone-800 space-y-1.5 text-[11px]">
                    {life.family.birthPlace && (
                      <div className="flex justify-between gap-2">
                        <span className="text-stone-500 shrink-0">Nơi sinh</span>
                        <span className="text-stone-200 text-right">{life.family.birthPlace}</span>
                      </div>
                    )}
                    <div className="flex justify-between gap-2">
                      <span className="text-stone-500 shrink-0">Thứ bậc</span>
                      <span className="text-stone-200 text-right">{life.family.birthOrderLabel}</span>
                    </div>
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
                    <div className="pt-1 text-stone-400 leading-snug">
                      <span className="text-stone-500">Hoàn cảnh: </span>
                      <span className="text-stone-200">{life.family.circumstanceLabel}</span>
                    </div>
                  </div>
                )}

                {!life.family && (
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-stone-800 text-xs">
                    <div className="flex items-center gap-1.5 text-amber-200">
                      <Coins className="w-3.5 h-3.5 text-amber-400" />
                      <span>{formatCopper(life.assets.wealthCopper)}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-emerald-200">
                      <Wheat className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{life.assets.rice} đấu gạo</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Trạng Thái Card */}
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
                  colorClass="bg-rose-500"
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
                  label="Quan hệ"
                  value={life.stats.relationships}
                  icon={<Users className="w-3.5 h-3.5 text-sky-400" />}
                  colorClass="bg-sky-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-stone-800 text-[11px] text-stone-300">
                <div className="flex items-center gap-1.5">
                  <Swords className="w-3.5 h-3.5 text-stone-400" />
                  <span>Võ nghệ: {life.stats.martial}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Hammer className="w-3.5 h-3.5 text-stone-400" />
                  <span>Thương tài: {life.stats.craftTrade}</span>
                </div>
                <div className="flex items-center gap-1.5 col-span-2">
                  <Award className="w-3.5 h-3.5 text-amber-400" />
                  <span>Thanh danh: {life.stats.fame}</span>
                </div>
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
                    {(life.interests ?? []).map((i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded bg-sky-950/60 border border-sky-700/40 text-[11px] text-sky-200"
                      >
                        {INTEREST_LABELS[i] ?? i}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <StatExplainer />
            </div>

            {/* Gia Sản & Tài Chính (1in8b-style) */}
            <FamilyWealthCard life={life} />
          </div>

          {/* CENTER COLUMN: Scene + Trọng Tâm Năm Nay + Ghi Chép Cuộc Đời */}
          <div className="lg:col-span-5 space-y-4">
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

            {/* Trọng Tâm Năm Nay (1in8b style, synced with AdultDashboard) */}
            <div className="bg-stone-900/75 border border-stone-800 rounded-xl p-3.5 space-y-2">
              {!life.isAlive ? (
                <div className="space-y-3 text-center py-2">
                  <p className="text-rose-400 font-semibold text-sm">
                    Kiếp này đã khép lại sớm: {life.deathReason}
                  </p>
                  <button
                    type="button"
                    onClick={handleRestart}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold text-xs cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Lưu sử ký &amp; Đầu thai kiếp khác
                  </button>
                </div>
              ) : isTeenReady ? (
                <div className="text-center py-2">
                  <p className="text-amber-300 font-semibold text-sm">Bạn đã bước sang tuổi 13 tự lập!</p>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between">
                    <h2 className="text-xs font-semibold uppercase tracking-wider text-amber-300">
                      Trọng Tâm Năm Nay
                    </h2>
                    <span className="text-[10px] text-stone-400">
                      {isInfancy ? 'Thơ ấu (0–5 tuổi)' : 'Có thể đổi bất cứ lúc nào'}
                    </span>
                  </div>

                  {isInfancy ? (
                    <p className="text-xs text-stone-400 leading-relaxed">
                      Bạn vẫn còn nhỏ, đang được cha mẹ nuôi dưỡng. Hãy theo dõi dòng thời gian trôi qua — từ 6 tuổi trở đi, bạn sẽ chọn được trọng tâm phát triển hàng tháng tại đây.
                    </p>
                  ) : (
                    <div className="flex flex-wrap gap-1.5">
                      {getChildhoodFocusOptions(life).map((opt) => {
                        const active = activeFocusId === opt.id;
                        return (
                          <button
                            key={opt.id}
                            type="button"
                            onClick={() => setChildhoodFocus(opt.id)}
                            title={opt.description}
                            className={`text-left px-2.5 py-1.5 rounded-lg border transition cursor-pointer ${
                              active
                                ? 'bg-emerald-950/70 border-emerald-500 text-emerald-100'
                                : 'bg-stone-950/60 border-stone-800 hover:border-stone-700 text-stone-300'
                            }`}
                          >
                            <div className="text-[11px] font-semibold leading-tight">{opt.label}</div>
                            <div className="text-[10px] text-stone-400 leading-tight mt-0.5">
                              {opt.effectHint}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </>
              )}
            </div>

            {lastEventResult && (
              <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-700/50 text-xs text-emerald-200 flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>{lastEventResult}</span>
              </div>
            )}

            <LifeTimeline
              logs={life.logs}
              maxHeightClass="max-h-[440px]"
              isRunning={autoPlaySpeed > 0}
            />
          </div>

          {/* RIGHT COLUMN: Gia Đình + Đồng Niên + Bản Đồ (1in8b order) */}
          <div className="lg:col-span-4 space-y-4">
            {/* Gia đình & Cuộc đời */}
            <FamilyLifeCard npcs={life.npcs} ageYears={age} />

            {/* Người Đồng Niên */}
            {life.cohortPeers && life.cohortPeers.length > 0 && (
              <div className="bg-stone-900/80 border border-stone-800 rounded-xl p-3.5 space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-stone-400">
                    Người Đồng Niên
                  </h3>
                  <span className="text-[10px] text-stone-500">Cùng {age} tuổi</span>
                </div>
                <div className="space-y-1.5">
                  {life.cohortPeers.map((peer) => {
                    const peerDead = peer.deathAge !== undefined && age >= peer.deathAge;
                    const stageLabel = peerDead
                      ? `Mất năm ${peer.deathAge} tuổi`
                      : age <= 5
                        ? 'thời thơ ấu'
                        : 'thời đồng ấu';
                    return (
                      <div
                        key={peer.id}
                        className="flex items-center justify-between gap-2 text-xs py-1 border-b border-stone-800/60 last:border-b-0"
                      >
                        <div className="min-w-0">
                          <div className="font-medium text-stone-200 truncate">{peer.name}</div>
                          <div className="text-[10px] text-stone-500 truncate">
                            {peer.birthPlace} • {peer.originLabel}
                          </div>
                        </div>
                        <span
                          className={`shrink-0 text-[10px] ${
                            peerDead ? 'text-rose-400' : 'text-stone-400'
                          }`}
                        >
                          {stageLabel}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Bản Đồ Cuộc Đời */}
            <LifeGrid
              ageYears={age}
              milestones={life.milestones}
              yearlyHappiness={life.yearlyHappiness}
              expectedLifespan={originMeta.expectedLifespan}
              logs={life.logs}
            />

            {/* Thông tin triều đại */}
            <div className="bg-stone-900/80 border border-stone-800 rounded-xl p-3.5 space-y-1.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-stone-400">Niên hiệu</span>
                <span className="font-semibold text-amber-200">
                  {life.world.dynastyName} năm thứ {life.world.yearInEra}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-stone-400">Giá lúa hiện tại</span>
                <span className="font-mono text-emerald-300">
                  {life.world.ricePriceInCopper} đồng / đấu
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
