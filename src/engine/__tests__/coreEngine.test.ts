import { describe, expect, it } from 'vitest';
import { mulberry32Next } from '../prng';
import { createNewLife } from '../lifeInitializer';
import { evaluateConditions } from '../conditionEvaluator';
import { applyEffects } from '../effectApplier';
import { breakdownCopper, calculateRicePrice } from '../economy';
import {
  advanceChildhoodMonth,
  advanceChildhoodYear,
  getAvailableChildhoodActivities,
  resolveEventChoice,
} from '../childhoodEngine';
import { ALL_CHILDHOOD_EVENTS, CHILDHOOD_ACTIVITIES } from '../../data/registry';

describe('Core Engine (MVP 1)', () => {
  it('mulberry32 produces deterministic sequence for the same seed', () => {
    let s1 = 123456;
    let s2 = 123456;
    for (let i = 0; i < 10; i += 1) {
      const r1 = mulberry32Next(s1);
      const r2 = mulberry32Next(s2);
      expect(r1.value).toBe(r2.value);
      expect(r1.nextState).toBe(r2.nextState);
      s1 = r1.nextState;
      s2 = r2.nextState;
    }
  });

  it('createNewLife is 100% deterministic given a custom seed', () => {
    const a = createNewLife(987654321);
    const b = createNewLife(987654321);
    expect(a.profile.fullName).toBe(b.profile.fullName);
    expect(a.profile.originClass).toBe(b.profile.originClass);
    expect(a.profile.gender).toBe(b.profile.gender);
    expect(a.assets.wealthCopper).toBe(b.assets.wealthCopper);
    expect(a.prngState).toBe(b.prngState);
  });

  it('economy helpers convert copper and calculate rice prices accurately', () => {
    expect(breakdownCopper(12350)).toEqual({ gold: 1, silver: 2, copper: 350 });
    expect(calculateRicePrice('summer', 'mat_mua')).toBe(Math.round(12 * 1.25 * 1.8));
    expect(calculateRicePrice('autumn', 'binh_on')).toBe(Math.round(12 * 0.85 * 1.0));
  });

  it('ConditionEvaluator and EffectApplier handle stats, flags, NPC affinity, and death', () => {
    let life = createNewLife(42);
    expect(evaluateConditions(life, { min_age: 0, max_age: 0 })).toBe(true);
    expect(evaluateConditions(life, { min_age: 5 })).toBe(false);

    life = applyEffects(life, {
      education: 15,
      copper: 500,
      add_flags: ['duoc_thay_do_quy'],
      npc_affinity: [{ relation: 'parent', delta: 10 }],
    });

    expect(evaluateConditions(life, { min_education: 15, has_flags: ['duoc_thay_do_quy'] })).toBe(true);
    expect(life.stats.relationships).toBe(62); // 60 + 20% of 10

    life = applyEffects(life, { kill_reason: 'Bạo bệnh qua đời' });
    expect(life.isAlive).toBe(false);
    expect(life.stats.health).toBe(0);
    expect(life.deathReason).toBe('Bạo bệnh qua đời');
  });

  it('advances from 0 to 13 years old and triggers Lễ Thôi Nôi at age 1', () => {
    const events = ALL_CHILDHOOD_EVENTS;

    let life = createNewLife(777);
    const step1 = advanceChildhoodYear(life, events);
    expect(step1.pendingEvent?.id).toBe('evt_milestone_thoi_noi');
    life = resolveEventChoice(step1.state, step1.pendingEvent!, 0).state;
    expect(life.flags).toContain('thien_huong_but_long');

    for (let age = 2; age <= 13; age += 1) {
      const res = advanceChildhoodYear(life, events);
      life = res.state;
      if (res.pendingEvent) {
        life = resolveEventChoice(life, res.pendingEvent, 0).state;
      }
    }

    expect(life.profile.totalDays).toBe(13 * 360);
    expect(life.flags).toContain('da_truong_thanh_13');
    expect(life.assets.wealthCopper).toBeGreaterThan(0);
  });

  it('generates family context, traits/interests, and keeps personal copper at 0 until age 13', () => {
    let life = createNewLife(2025);
    expect(life.family).toBeDefined();
    expect(life.family!.familyWealthCopper).toBeGreaterThan(0);
    expect(life.assets.wealthCopper).toBe(0);
    expect(life.npcs.length).toBeGreaterThanOrEqual(2);

    life = applyEffects(life, {
      add_traits: ['ham_hoc'],
      add_interests: ['kinh_su'],
      family_copper: -10,
    });
    expect(evaluateConditions(life, { has_traits: ['ham_hoc'], has_interests: ['kinh_su'] })).toBe(true);

    const acts = getAvailableChildhoodActivities(
      { ...life, profile: { ...life.profile, totalDays: 10 * 360 } },
      CHILDHOOD_ACTIVITIES,
    );
    expect(acts.length).toBeGreaterThanOrEqual(4);
  });

  it('handles kill_npc_id, scale_family_copper, set_circumstance and hides father activities when orphaned', () => {
    let life = createNewLife(42);
    life = {
      ...life,
      profile: { ...life.profile, originClass: 'thu_cong', totalDays: 10 * 360 },
      family: {
        ...life.family!,
        fatherOccupation: 'tho_ren',
        fatherOccupationLabel: 'Thợ rèn rèn nông cụ',
        familyWealthCopper: 1000,
      },
      flags: life.flags.filter((f) => f !== 'mo_coi_cha'),
    };

    const beforeActs = getAvailableChildhoodActivities(life, CHILDHOOD_ACTIVITIES);
    expect(beforeActs.some((a) => a.id === 'phu_tho_ren')).toBe(true);
    expect(beforeActs.some((a) => a.id === 'phu_me_mo_coi')).toBe(false);

    life = applyEffects(life, {
      kill_npc_id: 'npc_father',
      scale_family_copper: 0.3,
      set_circumstance: { id: 'cha_quan_mat', label: 'Cha mất sớm, gia đạo sa sút' },
      add_flags: ['mo_coi_cha', 'gia_toc_sa_sut'],
    });

    const father = life.npcs.find((n) => n.id === 'npc_father');
    expect(father?.isAlive).toBe(false);
    expect(father?.role).toContain('Đã mất');
    expect(life.family?.familyWealthCopper).toBe(300);
    expect(life.family?.circumstance).toBe('cha_quan_mat');

    const afterActs = getAvailableChildhoodActivities(life, CHILDHOOD_ACTIVITIES);
    expect(afterActs.some((a) => a.id === 'phu_tho_ren')).toBe(false);
    expect(afterActs.some((a) => a.id === 'phu_me_mo_coi')).toBe(true);
  });

  it('never starts any origin with officialRank > 0 and supports varied hoang_toc/quan_lai circumstances', () => {
    const seenHoangTocCircs = new Set<string>();
    const seenQuanLaiCircs = new Set<string>();
    for (let s = 1; s <= 400; s += 1) {
      const life = createNewLife(s);
      expect(life.officialRank).toBe(0);
      if (life.profile.originClass === 'hoang_toc') {
        seenHoangTocCircs.add(life.family!.circumstance);
      } else if (life.profile.originClass === 'quan_lai') {
        seenQuanLaiCircs.add(life.family!.circumstance);
      }
    }
    expect(seenQuanLaiCircs.size).toBeGreaterThanOrEqual(3);
  });

  it('advanceChildhoodMonth updates stats monthly and reaches age 13 cleanly', () => {
    const events = ALL_CHILDHOOD_EVENTS;

    let life = createNewLife(123);
    life = {
      ...life,
      profile: { ...life.profile, totalDays: 6 * 360 },
      schedule: { ...life.schedule, childhoodFocus: 'hoc_tap' },
    };
    const eduBefore = life.stats.education;

    const month1 = advanceChildhoodMonth(life, events);
    life = month1.pendingEvent ? resolveEventChoice(month1.state, month1.pendingEvent, 0).state : month1.state;
    expect(life.profile.totalDays).toBe(6 * 360 + 30);
    expect(life.stats.education).toBeGreaterThan(eduBefore);

    // Advance remaining months to age 13
    for (let m = 1; m < 7 * 12; m += 1) {
      const res = advanceChildhoodMonth(life, events);
      life = res.pendingEvent ? resolveEventChoice(res.state, res.pendingEvent, 0).state : res.state;
    }

    expect(life.profile.totalDays).toBe(13 * 360);
    expect(life.flags).toContain('da_truong_thanh_13');
  });
});
