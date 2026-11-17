/**
 * Deterministic 32-bit PRNG (mulberry32).
 * Returns both the float in [0, 1) and the updated state so callers can persist prngState.
 */
export function mulberry32Next(state: number): { value: number; nextState: number } {
  const nextState = (state + 0x6d2b79f5) | 0;
  let t = Math.imul(nextState ^ (nextState >>> 15), nextState | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  const value = ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  return { value, nextState };
}

export function generateRandomSeed(): number {
  if (typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function') {
    const arr = new Uint32Array(1);
    crypto.getRandomValues(arr);
    return arr[0] >>> 0;
  }
  return (Date.now() ^ Math.floor(Math.random() * 0xffffffff)) >>> 0;
}

export function randomInt(state: number, minInclusive: number, maxInclusive: number): { value: number; nextState: number } {
  const { value, nextState } = mulberry32Next(state);
  const span = maxInclusive - minInclusive + 1;
  return {
    value: minInclusive + Math.floor(value * span),
    nextState,
  };
}

export function pickWeightedIndex(
  state: number,
  weights: number[],
): { index: number; nextState: number } {
  const total = weights.reduce((sum, w) => sum + Math.max(0, w), 0);
  if (total <= 0) {
    return { index: 0, nextState: state };
  }
  const { value, nextState } = mulberry32Next(state);
  let cursor = value * total;
  for (let i = 0; i < weights.length; i += 1) {
    const w = Math.max(0, weights[i]);
    if (cursor < w) {
      return { index: i, nextState };
    }
    cursor -= w;
  }
  return { index: weights.length - 1, nextState };
}
