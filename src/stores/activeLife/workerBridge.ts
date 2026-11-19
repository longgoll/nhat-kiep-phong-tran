import type { ActiveLifeState } from '../../types/activeLife';
import type { GameEventDef } from '../../types/dsl';
import { evaluateConditions } from '../../engine/conditionEvaluator';

let simWorker: Worker | null = null;
export function getWorker(): Worker | null {
  if (typeof Worker === 'undefined') return null;
  if (!simWorker) {
    simWorker = new Worker(new URL('../../workers/simulation.worker.ts', import.meta.url), {
      type: 'module',
    });
  }
  return simWorker;
}

export function pickAutoChoiceIndex(life: ActiveLifeState, event: GameEventDef): number {
  let bestIdx = 0;
  let bestScore = -Infinity;

  event.choices.forEach((choice, idx) => {
    if (!evaluateConditions(life, choice.conditions)) return;
    let avgScore = 0;
    let totalWeight = 0;
    for (const out of choice.outcomes) {
      const w = Math.max(1, out.weight.base);
      const e = out.effects;
      let score =
        (e.health ?? 0) * 1.5 +
        (e.happiness ?? 0) * 1.1 +
        (e.relationships ?? 0) * 1.0 +
        (e.education ?? 0) * 1.2 +
        (e.martial ?? 0) * 0.9 +
        (e.craft_trade ?? 0) * 0.9 +
        (e.fame ?? 0) * 0.8 +
        (e.copper ?? 0) * 0.02 +
        (e.family_copper ?? 0) * 0.02 +
        (e.rice ?? 0) * 0.3 -
        (e.infamy ?? 0) * 1.2;
      if (e.kill_reason) score -= 500;
      avgScore += score * w;
      totalWeight += w;
    }
    const finalScore = totalWeight > 0 ? avgScore / totalWeight : 0;
    if (finalScore > bestScore) {
      bestScore = finalScore;
      bestIdx = idx;
    }
  });

  return bestIdx;
}
