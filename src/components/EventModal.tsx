import { AlertTriangle } from 'lucide-react';
import { evaluateConditions } from '../engine/conditionEvaluator';
import { useActiveLifeStore } from '../stores/useActiveLifeStore';

export function EventModal() {
  const life = useActiveLifeStore((s) => s.life);
  const pendingEvent = useActiveLifeStore((s) => s.pendingEvent);
  const chooseEventOption = useActiveLifeStore((s) => s.chooseEventOption);

  if (!life || !pendingEvent) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="max-w-lg w-full bg-stone-900 border border-amber-700/50 rounded-xl shadow-2xl overflow-hidden">
        <div className="px-5 py-4 bg-amber-950/40 border-b border-stone-800 flex items-center gap-2.5">
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
          <h3 className="font-serif font-bold text-lg text-amber-100">{pendingEvent.title}</h3>
        </div>

        <div className="p-5 space-y-5">
          <p className="text-sm leading-relaxed text-stone-200">{pendingEvent.description}</p>

          <div className="space-y-2.5">
            {pendingEvent.choices.map((choice, idx) => {
              const allowed = evaluateConditions(life, choice.conditions);
              return (
                <button
                  key={idx}
                  type="button"
                  disabled={!allowed}
                  onClick={() => chooseEventOption(idx)}
                  className={`w-full text-left px-4 py-3 rounded-lg border text-sm font-medium transition ${
                    allowed
                      ? 'bg-stone-950 hover:bg-amber-950/40 border-stone-700 hover:border-amber-500 text-stone-100 cursor-pointer'
                      : 'bg-stone-950/40 border-stone-800 text-stone-500 cursor-not-allowed'
                  }`}
                >
                  <div>{choice.label}</div>
                  {!allowed && (
                    <div className="text-xs text-rose-400/80 mt-0.5">Chưa đủ điều kiện để thực hiện</div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
