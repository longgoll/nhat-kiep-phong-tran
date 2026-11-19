import { describe, expect, it } from 'vitest';
import { mulberry32Next } from '../prng';
import { createNewLife } from '../lifeInitializer';
import { evaluateConditions } from '../conditionEvaluator';
import { applyAnnualStatMeanReversion, applyEffects } from '../effectApplier';
import { buildEndingSummary } from '../endingSummary';
import { breakdownCopper, calculateRicePrice, formatCopper } from '../economy';
import {
  getCohortPeerStatusLabel,
  getCurrentLivelihoodLabel,
  getEducationLabel,
  getFocusStatusBadges,
} from '../lifeStatus';
import {
  canAffordInstantAction,
  ensureValidLifeFocus,
  executeInstantAdultAction,
  getLifeFocusOptions,
  INSTANT_ADULT_ACTIONS,
  rankInstantActions,
} from '../adultLifeActions';
import { applyDynamicDecisionSideEffects, generateDynamicDecision } from '../decisionGenerator';
import {
  advanceChildhoodMonth,
  computeFamilyMonthlyNetCopper,
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
    const relBefore = life.stats.relationships;
    expect(evaluateConditions(life, { min_age: 0, max_age: 0 })).toBe(true);
    expect(evaluateConditions(life, { min_age: 5 })).toBe(false);

    life = applyEffects(life, {
      education: 15,
      copper: 500,
      add_flags: ['duoc_thay_do_quy'],
      npc_affinity: [{ relation: 'parent', delta: 10 }],
    });

    expect(evaluateConditions(life, { min_education: 15, has_flags: ['duoc_thay_do_quy'] })).toBe(true);
    expect(life.stats.relationships).toBeGreaterThan(relBefore);
    expect(life.stats.relationships).toBeLessThanOrEqual(relBefore + 2);

    life = applyEffects(life, { kill_reason: 'Bạo bệnh qua đời' });
    expect(life.isAlive).toBe(false);
    expect(life.stats.health).toBe(0);
    expect(life.deathReason).toBe('Bạo bệnh qua đời');
  });

  it('advances from 0 to 13 years old and triggers Lễ Thôi Nôi at age 1', () => {
    const events = ALL_CHILDHOOD_EVENTS;

    let life = createNewLife(777);
    let thoiNoiTriggered = false;
    for (let m = 0; m < 12; m += 1) {
      const step = advanceChildhoodMonth(life, events);
      life = step.state;
      if (step.pendingEvent) {
        if (step.pendingEvent.id.startsWith('evt_milestone_thoi_noi')) {
          thoiNoiTriggered = true;
        }
        life = resolveEventChoice(life, step.pendingEvent, 0).state;
      }
    }
    expect(thoiNoiTriggered).toBe(true);

    for (let m = 12; m < 13 * 12; m += 1) {
      const res = advanceChildhoodMonth(life, events);
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

  it('differentiates all 5 origins with static core config and dynamic circumstance overrides', () => {
    const seenByOrigin = new Map<string, ReturnType<typeof createNewLife>>();
    for (let s = 1; s <= 800 && seenByOrigin.size < 5; s += 1) {
      const life = createNewLife(s);
      if (!seenByOrigin.has(life.profile.originClass)) {
        seenByOrigin.set(life.profile.originClass, life);
      }
    }

    expect(seenByOrigin.size).toBe(5);
    const banNong = seenByOrigin.get('ban_nong')!;
    const thuCong = seenByOrigin.get('thu_cong')!;
    const diaChu = seenByOrigin.get('dia_chu')!;
    const quanLai = seenByOrigin.get('quan_lai')!;
    const hoangToc = seenByOrigin.get('hoang_toc')!;

    expect(banNong.schedule.childhoodFocus).toBe('giup_nha');
    expect(thuCong.schedule.childhoodFocus).toBe('so_thich');
    expect(diaChu.schedule.childhoodFocus).toBe('hoc_tap');
    expect(quanLai.schedule.childhoodFocus).toBe('hoc_tap');
    expect(hoangToc.schedule.childhoodFocus).toBe('hoc_tap');

    expect(banNong.interests).toContain('dien_vien');
    expect(thuCong.interests).toContain('thu_cong');
    expect(quanLai.interests).toContain('kinh_su');
    expect(hoangToc.stats.fame).toBeGreaterThan(quanLai.stats.fame);
    expect(quanLai.stats.fame).toBeGreaterThan(diaChu.stats.fame);

    // Verify siblings never share age 0 with player at birth
    for (const life of seenByOrigin.values()) {
      const siblings = life.npcs.filter((n) => n.relation === 'sibling');
      for (const sib of siblings) {
        expect(sib.age).not.toBe(0);
      }
      expect(life.family?.familyAssetsSummary?.length).toBeGreaterThan(0);
    }
  });

  it('keeps hoang_toc birthplace, motherStatus, and that_sung cashflow consistent', () => {
    let checked = 0;
    for (let s = 1; s <= 1500 && checked < 20; s += 1) {
      const life = createNewLife(s);
      if (life.profile.originClass !== 'hoang_toc' || !life.family) continue;
      checked += 1;
      const circ = life.family.circumstance;
      if (circ === 'ton_that') {
        expect(life.family.birthPlace).toBe('Phủ Tôn thất Kinh thành');
      } else {
        expect(life.family.birthPlace).toBe('Hoàng cung Tử Cấm Thành');
      }
      if (circ === 'duoc_sung_ai') {
        expect(life.family.motherStatus).toBe('chinh_that');
      } else if (circ === 'that_sung') {
        expect(life.family.motherStatus).toBe('phi_tan');
        expect(computeFamilyMonthlyNetCopper(life).net).toBeGreaterThanOrEqual(0);
      }
    }
    expect(checked).toBeGreaterThan(0);
  });

  it('dismisses household staff and updates familyAssetsSummary when gia_toc_sa_sut triggers', () => {
    let quanLaiLife: ReturnType<typeof createNewLife> | null = null;
    for (let s = 1; s <= 1500; s += 1) {
      const life = createNewLife(s);
      if (
        life.profile.originClass === 'quan_lai' &&
        !life.flags.includes('gia_toc_sa_sut') &&
        life.npcs.some((n) => n.relation === 'household')
      ) {
        quanLaiLife = life;
        break;
      }
    }
    expect(quanLaiLife).not.toBeNull();
    const afterFall = applyEffects(quanLaiLife!, {
      set_housing: 'nha_gach',
      add_flags: ['gia_toc_sa_sut'],
    });

    expect(afterFall.npcs.some((n) => n.relation === 'household')).toBe(false);
    expect(afterFall.family?.familyAssetsSummary).toContain('Gian nhà nhỏ nơi quê cũ');
    expect(afterFall.family?.familyAssetsSummary).toContain('Gia nhân đã ly tán');
    expect(afterFall.family?.familyAssetsSummary?.some((s) => s.includes('Phủ đệ'))).toBe(false);
    expect(afterFall.profile.currentRole).toBe('Con nhà quan sa sút');
  });

  it('updates royal attendants and familyAssetsSummary when that_sung_cung_dinh triggers', () => {
    let royalLife: ReturnType<typeof createNewLife> | null = null;
    for (let s = 1; s <= 1500; s += 1) {
      const life = createNewLife(s);
      if (
        life.profile.originClass === 'hoang_toc' &&
        !life.flags.includes('that_sung_cung_dinh')
      ) {
        royalLife = life;
        break;
      }
    }
    expect(royalLife).not.toBeNull();
    const afterFall = applyEffects(royalLife!, {
      add_flags: ['that_sung_cung_dinh'],
    });

    expect(afterFall.family?.familyAssetsSummary).toContain('Tẩm cung hẻo lánh');
    expect(afterFall.family?.familyAssetsSummary).toContain('Bổng lộc bị cắt giảm');
    const butler = afterFall.npcs.find((n) => n.id === 'npc_butler');
    expect(butler?.role).toContain('lãnh cung');
  });

  it('supports 1in8b-aligned negative currency, contextual livelihood/focus, and spend ranking', () => {
    expect(formatCopper(-1250)).toBe('-1 Bạc 250 Đồng');
    expect(formatCopper(0)).toBe('0 Đồng');

    const base = createNewLife(42);
    const adultUnemployed = {
      ...base,
      profile: { ...base.profile, totalDays: 20 * 360 },
      activeCareer: null,
      activeVenture: null,
      officialRank: 0,
    };
    expect(getCurrentLivelihoodLabel(adultUnemployed)).toBe('Đang tìm việc');
    const unemployedFocusIds = getLifeFocusOptions(adultUnemployed).map((f) => f.id);
    expect(unemployedFocusIds).not.toContain('cong_danh');

    const elderRetired = {
      ...adultUnemployed,
      profile: { ...base.profile, totalDays: 65 * 360 },
    };
    expect(getCurrentLivelihoodLabel(elderRetired)).toBe('Nghỉ hưu');

    const sickAdult = {
      ...adultUnemployed,
      stats: { ...adultUnemployed.stats, health: 30 },
      assets: { ...adultUnemployed.assets, wealthCopper: 5000 },
    };
    const ranked = rankInstantActions(sickAdult, INSTANT_ADULT_ACTIONS, 4);
    expect(ranked.recommended.length).toBeLessThanOrEqual(4);
    expect(ranked.recommended.some((a) => a.category === 'medical')).toBe(true);

    const peer = base.cohortPeers?.[0];
    if (peer) {
      const s10 = getCohortPeerStatusLabel(peer, 10);
      expect(s10.isDead).toBe(false);
      expect(s10.text).toContain('Đang học chữ');
    }

    // Verify wealthCopper can go negative (debt) via applyEffects
    const indebted = applyEffects(
      { ...base, assets: { ...base.assets, wealthCopper: 100 } },
      { copper: -500 },
    );
    expect(indebted.assets.wealthCopper).toBe(-400);
    expect(formatCopper(indebted.assets.wealthCopper)).toBe('-400 Đồng');
  });

  it('generates and resolves 1in8b dynamic decision cards (college, job offers, retirement, debt)', () => {
    const base = createNewLife(77);

    // 1. College decision at age 18
    const at18 = {
      ...base,
      profile: { ...base.profile, totalDays: 18 * 360 },
      eduLevel: 3,
    };
    const collegeDec = generateDynamicDecision(at18);
    expect(collegeDec?.id).toBe('dec_college_18');
    const enrolled = applyDynamicDecisionSideEffects(
      { ...at18, flags: [...at18.flags, 'dec_college_done'] },
      'dec_college_18',
      0,
    );
    expect(enrolled.eduLevel).toBe(4);
    expect(enrolled.isStudent).toBe(true);
    expect(getEducationLabel(enrolled)).toContain('Quốc Tử Giám');
    expect(getCurrentLivelihoodLabel(enrolled)).toBe('Đang theo học');

    // 2. Job offers when unemployed & not student
    const seeking = {
      ...enrolled,
      isStudent: false,
      livelihoodStatus: 'seeking' as const,
    };
    const jobDec = generateDynamicDecision(seeking);
    expect(jobDec?.id).toBe('dec_job_offers');
    const hired = applyDynamicDecisionSideEffects(seeking, 'dec_job_offers', 0);
    expect(hired.activeCareer).not.toBeNull();
    expect(hired.livelihoodStatus).toBe('employed');

    // 3. Heavy debt decision when wealthCopper < -300
    const deepDebt = {
      ...hired,
      assets: { ...hired.assets, wealthCopper: -500 },
    };
    const loanDec = generateDynamicDecision(deepDebt);
    expect(loanDec?.id).toBe('dec_loan_heavy');

    // 4. Retirement decision at age 60
    const at60 = {
      ...hired,
      profile: { ...hired.profile, totalDays: 60 * 360 },
    };
    const retireDec = generateDynamicDecision(at60);
    expect(retireDec?.id).toBe('dec_retire_60');
    const retired = applyDynamicDecisionSideEffects(at60, 'dec_retire_60', 0);
    expect(retired.livelihoodStatus).toBe('retired');
    expect(getCurrentLivelihoodLabel(retired)).toBe('Nghỉ hưu');
  });

  it('applies direct 0-100 deltas for health/happiness/relationships and annual mean-reversion', () => {
    const base = createNewLife(99);
    const highBase = {
      ...base,
      stats: {
        ...base.stats,
        health: 80,
        happiness: 80,
        relationships: 80,
        education: 80,
      },
    };
    const boosted = applyEffects(highBase, {
      health: 5,
      happiness: 5,
      relationships: 5,
      education: 5,
    });
    // Direct clamp for health, happiness, relationships; diminishing returns above 70 for education
    expect(boosted.stats.health).toBe(85);
    expect(boosted.stats.happiness).toBe(85);
    expect(boosted.stats.relationships).toBe(85);
    expect(boosted.stats.education).toBeCloseTo(81.5, 2);

    // Annual mean-reversion pulls inflated health down at age 80, and pulls low relationships up with spouse
    const aged = {
      ...boosted,
      stats: { ...boosted.stats, health: 95, relationships: 30, happiness: 90 },
      npcs: [
        ...boosted.npcs,
        {
          id: 'spouse_1',
          name: 'Lan',
          gender: 'female' as const,
          relation: 'spouse' as const,
          affinity: 60,
          isAlive: true,
          role: 'Thê tử',
        },
      ],
    };
    const reverted = applyAnnualStatMeanReversion(aged, 80);
    expect(reverted.stats.health).toBeLessThan(95);
    expect(reverted.stats.relationships).toBeGreaterThan(30);
    expect(reverted.stats.happiness).toBeLessThan(90);
  });

  it('builds 1in8b-style ending summary with epitaph, last words, mourners, and happiest year', () => {
    const base = createNewLife(123);
    const deadLife = {
      ...base,
      isAlive: false,
      deathReason: 'Tuổi cao sức yếu',
      profile: { ...base.profile, totalDays: 72 * 360 },
      yearlyHappiness: { 20: 65, 35: 88, 70: 72 },
      npcs: [
        ...base.npcs,
        {
          id: 'sp_1',
          name: 'Thị Mai',
          gender: 'female' as const,
          relation: 'spouse' as const,
          affinity: 80,
          isAlive: true,
          role: 'Thê tử',
        },
        {
          id: 'ch_1',
          name: 'Minh An',
          gender: 'male' as const,
          relation: 'child' as const,
          affinity: 75,
          isAlive: true,
          role: 'Con trai',
        },
      ],
    };
    const summary = buildEndingSummary(deadLife);
    expect(summary.ageYears).toBe(72);
    expect(summary.epitaphLines.length).toBeGreaterThanOrEqual(3);
    expect(summary.lastWords).not.toBeNull();
    expect(summary.mourners.length).toBeGreaterThanOrEqual(2);
    expect(summary.happiestYear).toEqual({ age: 35, score: 88 });
    expect(summary.partnerCell).toContain('Thị Mai');
    expect(summary.kidsCell).toContain('1 người con còn sống');
  });

  it('adapts life focus options by circumstance and auto-transitions invalid focus', () => {
    const base = createNewLife(55);
    const prisoner = {
      ...base,
      livelihoodStatus: 'prison' as const,
      schedule: { ...base.schedule, lifeFocus: 'cong_danh' as const },
    };
    const prisonOpts = getLifeFocusOptions(prisoner);
    expect(prisonOpts.some((o) => o.id === 'cong_danh')).toBe(false);
    expect(prisonOpts.some((o) => o.id === 'nghi_ngoi')).toBe(true);

    const fixed = ensureValidLifeFocus(prisoner);
    expect(fixed.schedule.lifeFocus).toBe('can_bang');

    const student = {
      ...base,
      isStudent: true,
      livelihoodStatus: 'student' as const,
    };
    const studentOpts = getLifeFocusOptions(student);
    expect(studentOpts.some((o) => o.id === 'lam_them')).toBe(true);
  });

  it('supports 1in8b-style creditOK, PRISON_SHOP filtering, and contextual study ranking', () => {
    const base = createNewLife(77);
    const poorAdult = {
      ...base,
      profile: { ...base.profile, totalDays: 20 * 360 },
      stats: { ...base.stats, education: 10 },
      assets: { ...base.assets, wealthCopper: 10 },
    };
    const nightClass = INSTANT_ADULT_ACTIONS.find((a) => a.id === 'inst_night_class')!;
    const creditCheck = canAffordInstantAction(poorAdult, nightClass);
    expect(creditCheck.canPay).toBe(true);
    expect(creditCheck.onCredit).toBe(true);

    const exec = executeInstantAdultAction(poorAdult, 'inst_night_class');
    expect(exec.ok).toBe(true);
    expect(exec.state.assets.wealthCopper).toBeLessThan(10);

    const ranked = rankInstantActions(poorAdult);
    expect(ranked.recommended.some((a) => a.id === 'inst_night_class')).toBe(true);

    const prisoner = {
      ...poorAdult,
      livelihoodStatus: 'prison' as const,
      flags: [...poorAdult.flags, 'dang_o_tu'],
    };
    const prisonRanked = rankInstantActions(prisoner);
    expect(prisonRanked.recommended.every((a) => a.prisonAllowed)).toBe(true);
    expect(prisonRanked.recommended.some((a) => a.id === 'inst_prison_letter')).toBe(true);
  });

  it('includes loan-shark option in dec_loan_heavy when deeply in debt', () => {
    const base = createNewLife(88);
    const deepDebt = {
      ...base,
      profile: { ...base.profile, totalDays: 25 * 360 },
      assets: { ...base.assets, wealthCopper: -800 },
    };
    const dec = generateDynamicDecision(deepDebt);
    expect(dec?.id).toBe('dec_loan_heavy');
    expect(dec?.choices.some((c) => c.label.includes('Vay nóng lãi nặng'))).toBe(true);
  });

  it('shows study year progress on profile and triggers 1in8b-style job/biz Decision Cards from Chi tiêu · đầu tư', () => {
    const base = createNewLife(108);
    const studentAt19 = {
      ...base,
      profile: { ...base.profile, totalDays: 19 * 360 },
      eduLevel: 4,
      isStudent: true,
      major: 'Kinh sử · Chính trị',
    };
    expect(getEducationLabel(studentAt19)).toContain('Quốc Tử Giám (Kinh sử · Chính trị) · Năm 2/4');

    const adult = {
      ...base,
      profile: { ...base.profile, totalDays: 24 * 360 },
      assets: { ...base.assets, wealthCopper: 2000 },
      stats: { ...base.stats, education: 20, craftTrade: 20 },
    };
    const huntRes = executeInstantAdultAction(adult, 'inst_job_hunt');
    expect(huntRes.ok).toBe(true);
    const jobDec = generateDynamicDecision(huntRes.state);
    expect(jobDec?.id).toBe('dec_job_offers');

    const homemaker = {
      ...adult,
      livelihoodStatus: 'homemaker' as const,
    };
    const bizRes = executeInstantAdultAction(homemaker, 'inst_biz_plan');
    expect(bizRes.ok).toBe(true);
    const bizDec = generateDynamicDecision(bizRes.state);
    expect(bizDec?.id).toBe('dec_biz_offers');
  });

  it('computes compact focus status badges for hunger, empty rice, debt, and study', () => {
    const base = createNewLife(101);
    const hungry = {
      ...base,
      profile: { ...base.profile, totalDays: 20 * 360 },
      assets: { ...base.assets, rice: 0, wealthCopper: -150 },
      schedule: { ...base.schedule, lifestyle: 'nhin_doi' as const, autoBuyRice: false },
    };
    const badges = getFocusStatusBadges(hungry, { isCoveredByFamily: false });
    expect(badges.map((b) => b.id)).toEqual(['starving', 'out_of_rice', 'in_debt', 'need_job']);

    // Covered by family at home with 0 personal rice should not falsely show starving/out_of_rice
    const atHome = {
      ...base,
      profile: { ...base.profile, totalDays: 15 * 360 },
      assets: { ...base.assets, rice: 0, wealthCopper: 100 },
      schedule: { ...base.schedule, lifestyle: 'com_rau' as const },
    };
    expect(getFocusStatusBadges(atHome, { isCoveredByFamily: true })).toEqual([]);
  });
});
