import { useEffect, useRef, useState } from 'react';
import {
  AlertCircle,
  X,
  User,
  CalendarClock,
  ScrollText,
} from 'lucide-react';
import { getAgeYears } from '../types/activeLife';
import { getSeasonLabel } from '../engine/daySimulator';
import { useActiveLifeStore } from '../stores/useActiveLifeStore';
import { getThemeWrapperClass, useLegacyArchiveStore } from '../stores/useLegacyArchiveStore';
import { ProgressionModules } from './ProgressionModules';
import { LegacyArchiveModal } from './LegacyArchiveModal';
import { LifeTopBar } from './LifeTopBar';
import { CareerModal } from './CareerModal';
import { PAUSE_MESSAGES } from './adult/constants';
import { AdultLeftColumn } from './adult/AdultLeftColumn';
import { AdultCenterColumn } from './adult/AdultCenterColumn';
import { AdultRightColumn } from './adult/AdultRightColumn';
import { SpendInvestModal } from './adult/SpendInvestModal';
import { NpcListModal } from './adult/NpcListModal';

export function AdultDashboard() {
  const life = useActiveLifeStore((s) => s.life);
  const pendingEvent = useActiveLifeStore((s) => s.pendingEvent);
  const isSimulating = useActiveLifeStore((s) => s.isSimulating);
  const lastPauseReason = useActiveLifeStore((s) => s.lastPauseReason);
  const lastEventResult = useActiveLifeStore((s) => s.lastEventResult);

  const advanceAdultDays = useActiveLifeStore((s) => s.advanceAdultDays);
  const clearPauseReason = useActiveLifeStore((s) => s.clearPauseReason);
  const exportSaveJson = useActiveLifeStore((s) => s.exportSaveJson);
  const resetLife = useActiveLifeStore((s) => s.resetLife);
  const autoPlaySpeed = useActiveLifeStore((s) => s.autoPlaySpeed);
  const setAutoPlaySpeed = useActiveLifeStore((s) => s.setAutoPlaySpeed);

  const activeTheme = useLegacyArchiveStore((s) => s.activeTheme);
  const colorMode = useLegacyArchiveStore((s) => s.colorMode ?? 'dark');
  const themeClass = getThemeWrapperClass(activeTheme, colorMode);

  const [showNpcModal, setShowNpcModal] = useState(false);
  const [showArchive, setShowArchive] = useState(false);
  const [showActionModal, setShowActionModal] = useState(false);
  const [showProgressionModal, setShowProgressionModal] = useState(false);
  const [mobileTab, setMobileTab] = useState<'profile' | 'planner' | 'logs'>('planner');
  const [subMonthProgress, setSubMonthProgress] = useState<number>(0);
  const lastTickTimeRef = useRef<number>(0);
  const [isCareerModalOpen, setIsCareerModalOpen] = useState(false);
  const [careerModalTab, setCareerModalTab] = useState<'current' | 'jobs' | 'ventures'>('jobs');

  const openCareerModal = (tab: 'current' | 'jobs' | 'ventures') => {
    setCareerModalTab(tab);
    setShowActionModal(false);
    setShowProgressionModal(false);
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
    if (!isLifeAlive || hasPauseReason) {
      setAutoPlaySpeed(0);
      setSubMonthProgress(0);
      return;
    }
    if (hasPendingEvent) {
      setSubMonthProgress(0);
      return;
    }
    if (isSimulating) return;

    const tickConfig: Record<1 | 2 | 4 | 8 | 12 | 16, { days: number; ms: number }> = {
      1: { days: 30, ms: 4333 },
      2: { days: 30, ms: 2167 },
      4: { days: 30, ms: 1083 },
      8: { days: 30, ms: 542 },
      12: { days: 30, ms: 361 },
      16: { days: 30, ms: 271 },
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
        if (useActiveLifeStore.getState().isSimulating) {
          return;
        }
      } else {
        setSubMonthProgress(Math.min(1, elapsed / cfg.ms));
      }
      rafId = window.requestAnimationFrame(frame);
    };

    rafId = window.requestAnimationFrame(frame);
    return () => window.cancelAnimationFrame(rafId);
  }, [autoPlaySpeed, isLifeAlive, hasPendingEvent, hasPauseReason, isSimulating, advanceAdultDays, setAutoPlaySpeed]);

  if (!life) return null;

  const age = getAgeYears(life.profile.totalDays);

  const openActionModal = () => {
    setAutoPlaySpeed(0);
    setShowActionModal(true);
  };

  const openProgressionModal = () => {
    setAutoPlaySpeed(0);
    setShowProgressionModal(true);
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
        <LifeTopBar
          ageYears={age}
          dayOfYear={life.profile.totalDays % 360}
          subMonthProgress={autoPlaySpeed > 0 && !hasPendingEvent ? subMonthProgress : 0}
          dynastyName={life.world.dynastyName}
          yearInEra={life.world.yearInEra}
          seasonLabel={getSeasonLabel(life.world.season)}
          seed={life.seed}
          autoPlaySpeed={hasPendingEvent ? 0 : autoPlaySpeed}
          speedOptions={[1, 2, 4, 8, 12, 16]}
          onSetSpeed={(spd) => {
            if (spd > 0) clearPauseReason();
            setAutoPlaySpeed(spd as 0 | 1 | 2 | 4 | 8 | 12 | 16);
          }}
          controlsDisabled={!life.isAlive || hasPendingEvent}
          onReset={resetLife}
        />

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

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
          <AdultLeftColumn
            mobileTab={mobileTab}
            onOpenActionModal={openActionModal}
            onOpenProgressionModal={openProgressionModal}
            onOpenNpcModal={() => setShowNpcModal(true)}
          />
          <AdultCenterColumn
            mobileTab={mobileTab}
            onOpenActionModal={openActionModal}
            onOpenProgressionModal={openProgressionModal}
          />
          <AdultRightColumn
            mobileTab={mobileTab}
            onOpenNpcModal={() => setShowNpcModal(true)}
            onOpenArchive={() => setShowArchive(true)}
            onExportSave={handleExportSave}
          />
        </div>
      </div>

      {showProgressionModal && (
        <div
          className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-3 sm:p-4"
          onClick={() => setShowProgressionModal(false)}
        >
          <div
            className="max-w-2xl w-full max-h-[88vh] bg-stone-900 border border-stone-700 rounded-xl flex flex-col overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-3 border-b border-stone-800 bg-stone-950/60">
              <span className="text-xs font-semibold uppercase tracking-wider text-sky-300">
                Sự Nghiệp · Sản Nghiệp
              </span>
              <button
                type="button"
                onClick={() => setShowProgressionModal(false)}
                className="inline-flex items-center gap-1 text-xs font-medium text-stone-300 hover:text-stone-100 cursor-pointer"
              >
                Đóng <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-4 sm:p-5 overflow-y-auto">
              <ProgressionModules />
            </div>
          </div>
        </div>
      )}

      {showActionModal && (
        <SpendInvestModal
          onClose={() => setShowActionModal(false)}
          onOpenCareerModal={openCareerModal}
        />
      )}
      {showNpcModal && <NpcListModal npcs={life.npcs} onClose={() => setShowNpcModal(false)} />}
      {showArchive && <LegacyArchiveModal onClose={() => setShowArchive(false)} />}
      <CareerModal
        isOpen={isCareerModalOpen}
        onClose={() => setIsCareerModalOpen(false)}
        initialTab={careerModalTab}
      />

      <div className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-stone-950/95 border-t border-stone-800 grid grid-cols-3">
        <button
          type="button"
          onClick={() => setMobileTab('profile')}
          className={`py-2.5 flex flex-col items-center gap-0.5 text-[11px] cursor-pointer ${
            mobileTab === 'profile' ? 'text-amber-300 font-semibold' : 'text-stone-400'
          }`}
        >
          <User className="w-4 h-4" /> Hồ sơ
        </button>
        <button
          type="button"
          onClick={() => setMobileTab('planner')}
          className={`py-2.5 flex flex-col items-center gap-0.5 text-[11px] cursor-pointer ${
            mobileTab === 'planner' ? 'text-amber-300 font-semibold' : 'text-stone-400'
          }`}
        >
          <CalendarClock className="w-4 h-4" /> Trọng tâm
        </button>
        <button
          type="button"
          onClick={() => setMobileTab('logs')}
          className={`py-2.5 flex flex-col items-center gap-0.5 text-[11px] cursor-pointer ${
            mobileTab === 'logs' ? 'text-amber-300 font-semibold' : 'text-stone-400'
          }`}
        >
          <ScrollText className="w-4 h-4" /> Gia đình
        </button>
      </div>
    </div>
  );
}
