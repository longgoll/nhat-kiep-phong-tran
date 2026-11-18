import type { Season, WorldState } from '../types/activeLife';

export const BASE_RICE_PRICE_COPPER = 12;

const SEASON_MULTIPLIER: Record<Season, number> = {
  spring: 1.1,
  summer: 1.25,
  autumn: 0.85,
  winter: 1.0,
};

const WORLD_MULTIPLIER: Record<WorldState, number> = {
  binh_on: 1.0,
  mat_mua: 1.8,
  chien_tranh: 2.2,
  dich_benh: 1.5,
};

export function calculateRicePrice(season: Season, worldState: WorldState): number {
  return Math.max(1, Math.round(BASE_RICE_PRICE_COPPER * SEASON_MULTIPLIER[season] * WORLD_MULTIPLIER[worldState]));
}

export interface CurrencyBreakdown {
  gold: number;
  silver: number;
  copper: number;
}

export function breakdownCopper(totalCopper: number): CurrencyBreakdown {
  const safe = Math.floor(Math.abs(totalCopper));
  const gold = Math.floor(safe / 10000);
  const remAfterGold = safe % 10000;
  const silver = Math.floor(remAfterGold / 1000);
  const copper = remAfterGold % 1000;
  return { gold, silver, copper };
}

export function formatCopper(totalCopper: number): string {
  const sign = totalCopper < 0 ? '-' : '';
  const { gold, silver, copper } = breakdownCopper(totalCopper);
  const parts: string[] = [];
  if (gold > 0) parts.push(`${gold} Vàng`);
  if (silver > 0) parts.push(`${silver} Bạc`);
  if (copper > 0 || parts.length === 0) parts.push(`${copper} Đồng`);
  return `${sign}${parts.join(' ')}`;
}
