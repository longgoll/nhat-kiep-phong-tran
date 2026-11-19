import { RotateCcw, Download, BookMarked } from 'lucide-react';
import { getAgeYears } from '../../types/activeLife';
import { getWorldStateLabel } from '../../engine/daySimulator';
import { ORIGIN_METADATA } from '../../engine/lifeInitializer';
import { getCohortPeerStatusLabel } from '../../engine/lifeStatus';
import { useActiveLifeStore } from '../../stores/useActiveLifeStore';
import { FamilyLifeCard } from '../FamilyLifeCard';
import { LifeGrid } from '../LifeGrid';

export function AdultRightColumn({
  mobileTab,
  onOpenNpcModal,
  onOpenArchive,
  onExportSave,
}: {
  mobileTab: 'profile' | 'planner' | 'logs';
  onOpenNpcModal: () => void;
  onOpenArchive: () => void;
  onExportSave: () => void;
}) {
  const life = useActiveLifeStore((s) => s.life);
  const resetLife = useActiveLifeStore((s) => s.resetLife);

  if (!life) return null;

  const age = getAgeYears(life.profile.totalDays);
  const originMeta = ORIGIN_METADATA[life.profile.originClass];
  const setShowNpcModal = (v: boolean) => { if (v) onOpenNpcModal(); };
  const setShowArchive = (v: boolean) => { if (v) onOpenArchive(); };
  const handleExportSave = onExportSave;

  return (
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
  );
}
