import type { NPC } from '../types/activeLife';

interface FamilyLifeCardProps {
  npcs: NPC[];
  ageYears: number;
  onOpenDetails?: () => void;
  maxHeightClass?: string;
}

function getShortRelationLabel(npc: NPC): string {
  const roleLower = npc.role.toLowerCase();
  if (npc.relation === 'parent') {
    if (roleLower.includes('phụ hoàng')) return 'Phụ hoàng';
    if (roleLower.includes('mẫu hậu')) return 'Mẫu hậu';
    if (roleLower.includes('phi tần')) return 'Phi tần';
    if (roleLower.includes('thứ mẫu') || roleLower.includes('vợ lẽ')) return 'Thứ mẫu';
    if (roleLower.includes('cha')) return 'Cha';
    if (roleLower.includes('mẹ')) return 'Mẹ';
    return npc.gender === 'male' ? 'Cha' : 'Mẹ';
  }
  if (npc.relation === 'spouse') return npc.gender === 'male' ? 'Phu quân' : 'Thê tử';
  if (npc.relation === 'child') return npc.gender === 'male' ? 'Con trai' : 'Con gái';
  if (npc.relation === 'sibling') {
    if (roleLower.includes('anh trai')) return 'Anh trai';
    if (roleLower.includes('chị gái')) return 'Chị gái';
    if (roleLower.includes('em trai')) return 'Em trai';
    if (roleLower.includes('em gái')) return 'Em gái';
    return 'Anh chị em';
  }
  if (npc.relation === 'household') return 'Gia nhân';
  if (npc.relation === 'mentor') return 'Sư phụ';
  if (npc.relation === 'rival') return 'Đối thủ';
  return 'Bằng hữu';
}

export function FamilyLifeCard({
  npcs,
  ageYears,
  onOpenDetails,
  maxHeightClass,
}: FamilyLifeCardProps) {
  const visibleNpcs = npcs.filter((npc) => npc.age === undefined || npc.age + ageYears >= 0);

  return (
    <div className="bg-stone-900/80 border border-stone-800 rounded-xl p-3.5 space-y-2.5">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-stone-400">
          Gia Đình &amp; Cuộc Đời
        </h3>
        {onOpenDetails && (
          <button
            type="button"
            onClick={onOpenDetails}
            className="text-[11px] font-medium text-sky-400 hover:text-sky-300 cursor-pointer"
          >
            Chi tiết ({npcs.length})
          </button>
        )}
      </div>

      {visibleNpcs.length === 0 ? (
        <div className="text-xs text-stone-500 py-2">Chưa có thân nhân hay bằng hữu nào.</div>
      ) : (
        <div className={`divide-y divide-stone-800/70 ${maxHeightClass ? `${maxHeightClass} overflow-y-auto pr-1` : ''}`}>
          {visibleNpcs.map((npc) => {
            const currentAge = npc.age !== undefined ? npc.age + ageYears : undefined;
            const shortLabel = getShortRelationLabel(npc);
            return (
              <div
                key={npc.id}
                className="py-2 first:pt-0.5 last:pb-0.5 flex items-start justify-between gap-3 text-xs"
              >
                <span className="text-stone-500 shrink-0 w-20 pt-0.5 leading-snug">
                  {shortLabel}
                </span>

                <div className="min-w-0 flex-1">
                  <div className="font-medium text-stone-200 leading-snug">
                    <span>{npc.name}</span>
                    {npc.isAlive && currentAge !== undefined && (
                      <span className="text-[11px] font-normal text-stone-400 ml-1">
                        · {currentAge} tuổi
                      </span>
                    )}
                    {!npc.isAlive && (
                      <span className="text-[10px] font-normal text-rose-400 ml-1.5">
                        (Đã mất)
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-stone-400 leading-snug mt-0.5">
                    {npc.role}
                  </div>
                </div>

                <span
                  className={`font-mono text-[11px] shrink-0 pt-0.5 ${
                    npc.affinity >= 0 ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  {npc.affinity >= 0 ? `+${npc.affinity}` : npc.affinity}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
