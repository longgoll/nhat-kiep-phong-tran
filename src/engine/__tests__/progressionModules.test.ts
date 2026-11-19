import { describe, expect, it } from 'vitest';
import { createNewLife } from '../lifeInitializer';
import {
  buyOfficialTitle,
  buyProperty,
  canGrantRoyalPrivilege,
  getExamEligibility,
  getPropertyMarketCost,
  getPropertySeasonalIncome,
  getRebellionSuccessChance,
  getVisibleProperties,
  grantRoyalPrivilege,
  PROPERTY_CATALOG,
  sellProperty,
  takeExam,
  toggleCrossDress,
  upgradeHousing,
} from '../progressionModules';
import { INSTANT_ADULT_ACTIONS, canMarrySpouse, executeInstantAdultAction, isInstantActionVisible } from '../adultLifeActions';
import { advanceDays } from '../daySimulator';
import { applyDynamicDecisionSideEffects, buildDynamicDecisionById } from '../decisionGenerator';
import { evaluateConditions } from '../conditionEvaluator';
import { isEventContextuallyAllowed } from '../yearPlanner';
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
    // Cannot retake Thi Huong in the same year after passing/failing
    expect(getExamEligibility(life, 'huong').ok).toBe(false);
  });

  it('prevents retaking an exam in the same year and surfaces dec_exam_prompt when eligible', () => {
    let life = createNewLife(556);
    life = {
      ...life,
      profile: {
        ...life.profile,
        gender: 'male',
        totalDays: 15 * 360 + 180, // 15 tuổi, đầu Mùa Thu
      },
      world: { ...life.world, season: 'autumn' },
      stats: { ...life.stats, education: 30 },
      assets: { ...life.assets, wealthCopper: 1000 },
    };

    const prompt = buildDynamicDecisionById(life, 'dec_exam_prompt');
    expect(prompt?.id).toBe('dec_exam_prompt');
    expect(prompt?.choices.length).toBe(2);

    // Deferring exam sets cooldown for the year without deducting copper
    const deferred = applyDynamicDecisionSideEffects(life, 'dec_exam_prompt', 1);
    expect(deferred.assets.wealthCopper).toBe(1000);
    expect(buildDynamicDecisionById(deferred, 'dec_exam_prompt')).toBeNull();

    // Taking exam directly deducts cost and blocks another attempt in the same year
    const taken = applyDynamicDecisionSideEffects(life, 'dec_exam_prompt', 0);
    expect(taken.assets.wealthCopper).toBe(800);
    expect(getExamEligibility(taken, 'huong').ok).toBe(false);
    expect(buildDynamicDecisionById(taken, 'dec_exam_prompt')).toBeNull();
  });

  it('allows non-student 13+ characters to hunt for formal jobs', () => {
    const base = createNewLife(557);
    const teenWorker = {
      ...base,
      profile: { ...base.profile, totalDays: 13 * 360 + 5 },
      isStudent: false,
      livelihoodStatus: 'seeking' as const,
    };
    const huntRes = executeInstantAdultAction(teenWorker, 'inst_job_hunt');
    expect(huntRes.ok).toBe(true);
    expect(buildDynamicDecisionById(huntRes.state, 'dec_job_offers')?.id).toBe('dec_job_offers');

    const teenStudent = { ...teenWorker, isStudent: true, livelihoodStatus: 'student' as const };
    expect(executeInstantAdultAction(teenStudent, 'inst_job_hunt').ok).toBe(false);
  });

  it('earns seasonal passive income from owned properties and supports Quyên quan', () => {
    let life = createNewLife(666);
    life = {
      ...life,
      profile: { ...life.profile, gender: 'male', totalDays: 20 * 360 + 89 }, // 1 ngày trước sang Hạ
      world: { ...life.world, season: 'spring' },
      stats: { ...life.stats, education: 0 },
      assets: { ...life.assets, wealthCopper: 60000, rice: 100 },
    };

    life = buyProperty(life, 'ruong_tu');
    expect(life.assets.properties).toContain('ruong_tu');

    // Illiterate character cannot buy official title
    expect(buyOfficialTitle(life).officialRank).toBe(0);

    life = { ...life, stats: { ...life.stats, education: 20 } };
    life = buyOfficialTitle(life);
    expect(life.officialRank).toBe(1);
    expect(life.flags).toContain('quyen_quan');

    const res = advanceDays(life, 1, ACTIONS, EVENTS);
    expect(res.state.world.season).toBe('summer');
    // Should have received seasonal income (+420 copper)
    expect(res.state.assets.wealthCopper).toBeGreaterThan(60000 - 3000 - 50000);
  });

  it('enforces feudal marriage ages (15 female / 16 male), origin dowry, and 3-year Hoi/Dinh exam cycle', () => {
    const base = createNewLife(777);
    const poorGirl15 = {
      ...base,
      profile: { ...base.profile, gender: 'female' as const, originClass: 'ban_nong' as const, totalDays: 15 * 360 },
      assets: { ...base.assets, wealthCopper: 150 },
      flags: base.flags.filter((f) => f !== 'nu_cai_nam_trang'),
    };
    expect(canMarrySpouse(poorGirl15)).toEqual({ ok: true, cost: 120 });

    const royalBoy15 = {
      ...base,
      profile: { ...base.profile, gender: 'male' as const, originClass: 'hoang_toc' as const, totalDays: 15 * 360 },
      assets: { ...base.assets, wealthCopper: 6000 },
      flags: base.flags.filter((f) => f !== 'gia_toc_sa_sut' && f !== 'that_sung_cung_dinh'),
    };
    expect(canMarrySpouse(royalBoy15).ok).toBe(false);
    const royalBoy16 = {
      ...royalBoy15,
      profile: { ...royalBoy15.profile, totalDays: 16 * 360 },
    };
    expect(canMarrySpouse(royalBoy16)).toEqual({ ok: true, cost: 5000 });

    // Thi Hoi opens in Spring of age % 3 === 1 (e.g. 16), not 17
    const cuNhan17 = {
      ...base,
      profile: { ...base.profile, gender: 'male' as const, totalDays: 17 * 360 },
      world: { ...base.world, season: 'spring' as const },
      stats: { ...base.stats, education: 80 },
      assets: { ...base.assets, wealthCopper: 5000 },
      flags: [...base.flags, 'do_cu_nhan'],
    };
    expect(getExamEligibility(cuNhan17, 'hoi').ok).toBe(false);
    const cuNhan16 = { ...cuNhan17, profile: { ...cuNhan17.profile, totalDays: 16 * 360 } };
    expect(getExamEligibility(cuNhan16, 'hoi').ok).toBe(true);
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
    const royalGreetings = INSTANT_ADULT_ACTIONS.find((a) => a.id === 'inst_royal_family_greetings')!;
    const folkRemedy = INSTANT_ADULT_ACTIONS.find((a) => a.id === 'inst_folk_remedy')!;
    expect(isInstantActionVisible(royal, nobleBanquet)).toBe(true);
    expect(isInstantActionVisible(royal, rentStall)).toBe(false);
    expect(isInstantActionVisible(royal, rentRoom)).toBe(false);
    expect(isInstantActionVisible(royal, royalGreetings)).toBe(true);
    expect(isInstantActionVisible(royal, folkRemedy)).toBe(false);
    expect(isInstantActionVisible(peasant, royalGreetings)).toBe(false);
  });

  it('supports royal privilege appointment, blocks Quyên quan for hoang_toc, and grants seasonal fame/relationships from properties', () => {
    let royal = createNewLife(777);
    royal = {
      ...royal,
      profile: { ...royal.profile, gender: 'male', originClass: 'hoang_toc', totalDays: 18 * 360 + 89 },
      world: { ...royal.world, season: 'spring' },
      officialRank: 0,
      flags: royal.flags.filter((f) => f !== 'thai_giam' && f !== 'trong_hau_cung'),
      stats: { ...royal.stats, education: 40, fame: 30, relationships: 40 },
      assets: { ...royal.assets, wealthCopper: 100000, rice: 100 },
    };

    // Royal cannot buy low-level official title (Quyên quan)
    const afterBuyTitle = buyOfficialTitle(royal);
    expect(afterBuyTitle.officialRank).toBe(0);

    // Royal can be appointed via Tập ấm Hoàng thất
    expect(canGrantRoyalPrivilege(royal).ok).toBe(true);
    royal = grantRoyalPrivilege(royal);
    expect(royal.officialRank).toBeGreaterThanOrEqual(2);
    expect(royal.flags).toContain('tap_am_hoang_toc');

    // Visible properties include Thái ấp Tôn thất for hoang_toc
    expect(getVisibleProperties(royal).some((p) => p.id === 'thai_ap_ton_that')).toBe(true);

    // Buying Nghĩa thục & Tàng thư quán grants seasonal fame & relationships on season transition
    royal = buyProperty(royal, 'nghia_thuc_tu_vien');
    const fameBefore = royal.stats.fame;
    const relBefore = royal.stats.relationships;

    const res = advanceDays(royal, 1, ACTIONS, EVENTS);
    expect(res.state.world.season).toBe('summer');
    expect(res.state.stats.fame).toBeGreaterThan(fameBefore);
    expect(res.state.stats.relationships).toBeGreaterThan(relBefore);

    // Wealth-gated social actions unlock when wealthy
    const patronAction = INSTANT_ADULT_ACTIONS.find((a) => a.id === 'inst_patron_scholars')!;
    expect(isInstantActionVisible(res.state, patronAction)).toBe(true);
  });

  it('enforces gender, origin, and status narrative guards across decisions and events', () => {
    let princess = createNewLife(888);
    princess = {
      ...princess,
      profile: { ...princess.profile, gender: 'female', originClass: 'hoang_toc', totalDays: 20 * 360 },
      officialRank: 0,
      flags: princess.flags.filter((f) => f !== 'nu_cai_nam_trang' && f !== 'nu_quan_dac_xa'),
      stats: { ...princess.stats, education: 50 },
      assets: { ...princess.assets, wealthCopper: 60000 },
    };

    // Female without cross-dressing cannot be appointed official or take royal male privilege
    expect(canGrantRoyalPrivilege(princess).ok).toBe(false);
    expect(buildDynamicDecisionById(princess, 'dec_official_appoint')).toBeNull();
    expect(buyOfficialTitle(princess).officialRank).toBe(0);

    // dec_college_18 locks male-only Quốc Tử Giám Kinh sử & Võ học đường choices for non-crossdressing female
    const collegeDec = buildDynamicDecisionById(princess, 'dec_college_18');
    expect(collegeDec).not.toBeNull();
    expect(evaluateConditions(princess, collegeDec!.choices[0].conditions)).toBe(false);
    expect(evaluateConditions(princess, collegeDec!.choices[1].conditions)).toBe(true);
    expect(evaluateConditions(princess, collegeDec!.choices[2].conditions)).toBe(false);

    // Harem concubine / eunuch cannot receive outside civilian events
    const concubine = { ...princess, flags: [...princess.flags, 'trong_hau_cung'] };
    const outsideEvt = EVENTS.find((e) => e.id === 'evt_adult_exp_thu_cong_guild') ?? EVENTS[0];
    expect(isEventContextuallyAllowed(concubine, outsideEvt)).toBe(false);

    const haremEvt = EVENTS.find((e) => e.id === 'evt_harem_moonlight_pavilion')!;
    expect(isEventContextuallyAllowed(concubine, haremEvt)).toBe(true);
  });
});
