import { X } from 'lucide-react';
import type { NPC } from '../../types/activeLife';

export function NpcListModal({ npcs, onClose }: { npcs: NPC[]; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4">
      <div className="max-w-lg w-full bg-stone-900 border border-stone-700 rounded-xl p-5 space-y-3 max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-amber-300">Gia Quyến &amp; Nhân Mạch</h3>
          <button type="button" onClick={onClose} className="text-stone-400 hover:text-stone-200 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="space-y-2">
          {npcs.map((n) => (
            <div key={n.id} className="p-2.5 rounded-lg bg-stone-950/60 border border-stone-800 flex items-center justify-between text-xs">
              <div>
                <div className="font-semibold text-stone-200">
                  {n.name} {!n.isAlive && <span className="text-rose-400">(Đã mất)</span>}
                </div>
                <div className="text-stone-400">{n.role}</div>
              </div>
              <div className="text-right">
                <div className="text-stone-400">Thân thiết</div>
                <div className="font-mono text-amber-300">{Math.round(n.affinity)}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
