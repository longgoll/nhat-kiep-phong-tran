import { describe, expect, it } from 'vitest';
import { createNewLife } from '../lifeInitializer';
import {
  buyOfficialTitle,
  buyProperty,
  getExamEligibility,
  getRebellionSuccessChance,
  takeExam,
  toggleCrossDress,
} from '../progressionModules';
import { advanceDays } from '../daySimulator';
import actionsData from '../../data/actions.json';
import adulthoodEvents from '../../data/events_truong_thanh.json';
import type { ActionDef, GameEventDef } from '../../types/dsl';

const ACTIONS = actionsData as ActionDef[];
const EVENTS = adulthoodEvents as GameEventDef[];

describe('Progression Modules (MVP 3)', () => {
  it('supports female cross-dressing and Thi Huong exam in autumn every 3 years', () => {
    let life = createNewLife(555);
    life = {
      ...life,
      profile: {
        ...life.profile,
        gender: 'female',
        totalDays: 15 * 360 + 180, // 15 tuổi, đầu Mùa Thu
      },
      world: { ...life.world, season: 'autumn' },
      stats: { ...life.stats, education: 50 },
      assets: { ...life.assets, wealthCopper: 1000 },
    };

    expect(getExamEligibility(life, 'huong').ok).toBe(false);
    life = toggleCrossDress(life);
    expect(life.flags).toContain('nu_cai_nam_trang');
    expect(getExamEligibility(life, 'huong').ok).toBe(true);

    life = takeExam(life, 'huong');
    expect(life.assets.wealthCopper).toBe(800);
  });

  it('earns seasonal passive income from owned properties and supports Quyên quan', () => {
    let life = createNewLife(666);
    life = {
      ...life,
      profile: { ...life.profile, totalDays: 20 * 360 + 89 }, // 1 ngày trước sang Hạ
      world: { ...life.world, season: 'spring' },
      assets: { ...life.assets, wealthCopper: 60000, rice: 100 },
    };

    life = buyProperty(life, 'ruong_tu');
    expect(life.assets.properties).toContain('ruong_tu');

    life = buyOfficialTitle(life);
    expect(life.officialRank).toBe(1);
    expect(life.flags).toContain('quyen_quan');

    const res = advanceDays(life, 1, ACTIONS, EVENTS);
    expect(res.state.world.season).toBe('summer');
    // Should have received seasonal income (+420 copper)
    expect(res.state.assets.wealthCopper).toBeGreaterThan(60000 - 3000 - 50000);
  });

  it('computes rebellion success chance based on worldState and pillars', () => {
    let life = createNewLife(888);
    life = {
      ...life,
      stats: { ...life.stats, martial: 60, fame: 80 },
      rebellion: { treasuryCopper: 100000, armyPower: 100 },
      world: { ...life.world, worldState: 'chien_tranh' },
    };
    const chance = getRebellionSuccessChance(life);
    expect(chance).toBe(0.95);
  });
});
