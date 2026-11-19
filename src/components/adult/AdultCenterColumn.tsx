import { getAgeYears } from '../../types/activeLife';
import { formatCopper } from '../../engine/economy';
import { getFamilyCoveredLifestyleTier } from '../../engine/daySimulator';
import { getLifeFocusOptions } from '../../engine/adultLifeActions';
import { CAREER_CATALOG, VENTURE_CATALOG } from '../../engine/careerSystem';
import { getFocusStatusBadges, getStatusLineParts } from '../../engine/lifeStatus';
import { useActiveLifeStore } from '../../stores/useActiveLifeStore';
import { FeudalSceneBanner } from '../FeudalSceneBanner';
import { LifeTimeline } from '../LifeTimeline';

export function AdultCenterColumn({
  mobileTab,
  onOpenActionModal,
  onOpenProgressionModal,
}: {
  mobileTab: 'profile' | 'planner' | 'logs';
  onOpenActionModal: () => void;
  onOpenProgressionModal: () => void;
}) {
  const life = useActiveLifeStore((s) => s.life);
  const pendingEvent = useActiveLifeStore((s) => s.pendingEvent);
  const autoPlaySpeed = useActiveLifeStore((s) => s.autoPlaySpeed);
  const setLifeFocus = useActiveLifeStore((s) => s.setLifeFocus);
  const performInstantAction = useActiveLifeStore((s) => s.performInstantAction);

  if (!life) return null;

  const age = getAgeYears(life.profile.totalDays);
  const hasPendingEvent = Boolean(pendingEvent);
  const statusLine = getStatusLineParts(life);
  const focusBadges = getFocusStatusBadges(life, {
    isCoveredByFamily: getFamilyCoveredLifestyleTier(life) !== null,
  });
  const focusOptions = getLifeFocusOptions(life);
  const hasNegativeCash = life.assets.wealthCopper < 0;
  const openActionModal = onOpenActionModal;
  const openProgressionModal = onOpenProgressionModal;

  return (
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
              officialRank={life.officialRank}
              official={life.official}
            />

            {/* Trọng tâm hiện tại (Life Focus) */}
            <div className="bg-stone-900/75 border border-stone-800 rounded-xl p-3.5 space-y-2">
              <div className="pb-2 border-b border-stone-800/80 space-y-1.5">
                <div className="text-xs text-stone-300">
                  <span className="font-bold text-stone-100">{statusLine.primary}</span>{' '}
                  <span className="text-stone-400">· {statusLine.detail}</span>
                </div>
                {focusBadges.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {focusBadges.map((badge) => {
                      const toneCls =
                        badge.tone === 'danger'
                          ? 'bg-rose-950/70 border-rose-500/50 text-rose-200 hover:bg-rose-900/60'
                          : badge.tone === 'warning'
                            ? 'bg-amber-950/70 border-amber-500/50 text-amber-200 hover:bg-amber-900/60'
                            : 'bg-sky-950/60 border-sky-500/40 text-sky-200';
                      const handleClick =
                        badge.action === 'open_spend_modal'
                          ? openActionModal
                          : badge.action === 'job_hunt'
                            ? () => performInstantAction('inst_job_hunt')
                            : undefined;
                      return handleClick ? (
                        <button
                          key={badge.id}
                          type="button"
                          onClick={handleClick}
                          title={badge.title}
                          className={`px-2 py-0.5 rounded-md border text-[10px] font-semibold transition cursor-pointer ${toneCls}`}
                        >
                          {badge.label}
                        </button>
                      ) : (
                        <span
                          key={badge.id}
                          title={badge.title}
                          className={`px-2 py-0.5 rounded-md border text-[10px] font-semibold ${toneCls}`}
                        >
                          {badge.label}
                        </span>
                      );
                    })}
                  </div>
                )}
              </div>
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
                <div className="flex flex-wrap items-center gap-2">
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
                  <button
                    type="button"
                    onClick={openProgressionModal}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-950 hover:bg-stone-800 border border-stone-700 hover:border-sky-500/60 text-xs font-semibold text-sky-200 transition cursor-pointer"
                  >
                    <span>Sự nghiệp · Sản nghiệp</span>
                  </button>
                </div>
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
              maxHeightClass="max-h-[440px]"
              isRunning={autoPlaySpeed > 0 && !hasPendingEvent}
            />
          </div>
  );
}
