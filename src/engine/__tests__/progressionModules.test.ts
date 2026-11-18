import { describe, expect, it } from 'vitest';
import { createNewLife } from '../lifeInitializer';
import {
  buyOfficialTitle,
  buyProperty,
  getExamEligibility,
  getPropertyMarketCost,
  getPropertySeasonalIncome,
  getRebellionSuccessChance,
  PROPERTY_CATALOG,
  sellProperty,
  takeExam,
  toggleCrossDress,
  upgradeHousing,
} from '../progressionModules';
import { INSTANT_ADULT_ACTIONS, isInstantActionVisible } from '../adultLifeActions';
import { advanceDays } from '../daySimulator';
import { ALL_ACTIONS as ACTIONS, ALL_ADULTHOOD_EVENTS as EVENTS } from '../../data/registry';

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

  it('allows buying multiple properties, selling properties, fluctuating by worldState, and prevents housing downgrade', () => {
    let life = createNewLife(999);
    life = {
      ...life,
      world: { ...life.world, worldState: 'binh_on' },
      assets: { ...life.assets, wealthCopper: 20000, housing: 'phu_de' },
    };

    life = buyProperty(life, 'ruong_tu');
    life = buyProperty(life, 'ruong_tu');
    expect(life.assets.properties.filter((p) => p === 'ruong_tu').length).toBe(2);

    life = sellProperty(life, 'ruong_tu');
    expect(life.assets.properties.filter((p) => p === 'ruong_tu').length).toBe(1);

    const ruongSpec = PROPERTY_CATALOG.find((p) => p.id === 'ruong_tu')!;
    expect(getPropertyMarketCost(ruongSpec, 'chien_tranh')).toBeLessThan(getPropertyMarketCost(ruongSpec, 'binh_on'));
    expect(getPropertySeasonalIncome(ruongSpec, 'mat_mua', 0)).toBeLessThan(
      getPropertySeasonalIncome(ruongSpec, 'binh_on', 0),
    );

    // Prevent downgrading from phu_de to nha_tranh
    const beforeCopper = life.assets.wealthCopper;
    life = upgradeHousing(life, 'nha_tranh');
    expect(life.assets.housing).toBe('phu_de');
    expect(life.assets.wealthCopper).toBe(beforeCopper);
  });

  it('filters instant adult actions by origin and circumstance', () => {
    let peasant = createNewLife(111);
    peasant = {
      ...peasant,
      profile: { ...peasant.profile, originClass: 'ban_nong' },
      officialRank: 0,
      assets: { ...peasant.assets, housing: 'gam_cau' },
    };

    const rentRoom = INSTANT_ADULT_ACTIONS.find((a) => a.id === 'inst_rent_room')!;
    const nobleBanquet = INSTANT_ADULT_ACTIONS.find((a) => a.id === 'inst_noble_banquet')!;
    expect(isInstantActionVisible(peasant, rentRoom)).toBe(true);
    expect(isInstantActionVisible(peasant, nobleBanquet)).toBe(false);

    let royal = createNewLife(222);
    royal = {
      ...royal,
      profile: { ...royal.profile, originClass: 'hoang_toc' },
      assets: { ...royal.assets, housing: 'phu_de' },
    };
    const rentStall = INSTANT_ADULT_ACTIONS.find((a) => a.id === 'inst_rent_market_stall')!;
    expect(isInstantActionVisible(royal, nobleBanquet)).toBe(true);
    expect(isInstantActionVisible(royal, rentStall)).toBe(false);
    expect(isInstantActionVisible(royal, rentRoom)).toBe(false);
  });
});
