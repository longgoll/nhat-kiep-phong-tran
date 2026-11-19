import { describe, expect, it } from 'vitest';
import { ALL_ACTIONS, ALL_ADULTHOOD_EVENTS } from '../../data/registry';
import {
  applyForCareer,
  attemptApplyForCareer,
  canPromoteCareer,
  closeVenture,
  getAvailableCareers,
  getAvailableVentures,
  getCareerAcceptanceChance,
  getJobApplyCooldownRemaining,
  promoteCareer,
  startVenture,
  trainCurrentCareerSkill,
  upgradeVenture,
} from '../careerSystem';
import { advanceDays, DEFAULT_AUTO_PAUSE_CONFIG } from '../daySimulator';
import { applyDynamicDecisionSideEffects } from '../decisionGenerator';
import { createNewLife } from '../lifeInitializer';
import { appointOrPromoteOfficial } from '../progressionModules';

function createTeenLife(origin: 'ban_nong' | 'thu_cong' | 'dia_chu' | 'quan_lai' | 'hoang_toc' = 'quan_lai') {
  const base = createNewLife(4242);
  return {
    ...base,
    profile: {
      ...base.profile,
      originClass: origin,
      totalDays: 13 * 360,
    },
    stats: {
      ...base.stats,
      health: 80,
      happiness: 75,
      stamina: 100,
      maxStamina: 100,
      education: 10,
      martial: 10,
      craftTrade: 10,
      relationships: 60,
      fame: 10,
    },
    assets: {
      ...base.assets,
      wealthCopper: 1500,
      rice: 20,
    },
    flags: [...base.flags, 'da_truong_thanh_13'],
  };
}

describe('Career & Venture System', () => {
  it('unlocks scholar job for fallen noble teen via origin shortcut and updates schedule', () => {
    const life = createTeenLife('quan_lai');
    const chepKinh = getAvailableCareers(life).find((c) => c.job.id === 'job_chep_kinh');
    expect(chepKinh?.eligible).toBe(true);

    const hired = applyForCareer(life, 'job_chep_kinh');
    expect(hired.activeCareer?.jobId).toBe('job_chep_kinh');
    expect(hired.schedule.morning).toBe('act_chep_kinh_cung_dinh');
    expect(hired.schedule.afternoon).toBe('act_chep_kinh_cung_dinh');
  });

  it('tracks career XP & daysWorked during daily simulation and allows promotion without day-count gate', () => {
    let life = createTeenLife('thu_cong');
    life = applyForCareer(life, 'job_phu_ban_hang');

    const sim = advanceDays(life, 10, ALL_ACTIONS, ALL_ADULTHOOD_EVENTS, {
      ...DEFAULT_AUTO_PAUSE_CONFIG,
      pauseOnBirthday: false,
      pauseOnLowHealth: false,
      pauseOnNoFood: false,
    });
    expect(sim.state.activeCareer?.daysWorked).toBeGreaterThan(0);
    expect(sim.state.careerXp?.trade).toBeGreaterThan(0);

    const readyToPromote = {
      ...sim.state,
      profile: { ...sim.state.profile, totalDays: 14 * 360 },
      stats: { ...sim.state.stats, craftTrade: 18, relationships: 55 },
    };
    expect(canPromoteCareer(readyToPromote).ok).toBe(true);
    const promoted = promoteCareer(readyToPromote);
    expect(promoted.activeCareer?.jobId).toBe('job_chao_hang');
    expect(promoted.flags).toContain('career_chao_hang');
  });

  it('supports spinoff venture with 30% discount, upgrade, and close', () => {
    let life = createTeenLife('thu_cong');
    life = applyForCareer(life, 'job_phu_ban_hang');

    const ventureOpt = getAvailableVentures(life).find(
      (v) => v.venture.id === 'venture_ganh_hang',
    );
    expect(ventureOpt?.hasSpinoffDiscount).toBe(true);
    expect(ventureOpt?.effectiveCapitalCopper).toBe(105); // 150 * 0.7

    const started = startVenture(life, 'venture_ganh_hang');
    expect(started.activeVenture?.ventureId).toBe('venture_ganh_hang');
    expect(started.flags).toContain('venture_ganh_hang');

    const upgraded = upgradeVenture(started);
    expect(upgraded.activeVenture?.level).toBe(2);

    const closed = closeVenture(upgraded);
    expect(closed.activeVenture).toBeNull();
    expect(closed.flags).not.toContain('venture_ganh_hang');
  });

  it('clears civilian career and blocks civilian jobs when appointed as an official', () => {
    let life = createTeenLife('quan_lai');
    life = applyForCareer(life, 'job_chep_kinh');
    life = {
      ...life,
      profile: { ...life.profile, totalDays: 20 * 360 },
      flags: [...life.flags, 'do_cu_nhan'],
    };

    const official = appointOrPromoteOfficial(life);
    expect(official.officialRank).toBe(2);
    expect(official.activeCareer).toBeNull();
    expect(official.schedule.morning).toBe('act_xu_an_cong_duong');

    const jobs = getAvailableCareers(official);
    expect(jobs.every((c) => !c.eligible)).toBe(true);
  });

  it('applies criminal record penalty to job acceptance odds and supports in-job upskilling', () => {
    const clean = createTeenLife('quan_lai');
    const cleanOpt = getAvailableCareers(clean).find((c) => c.job.id === 'job_chep_kinh')!;
    const criminal = { ...clean, flags: [...clean.flags, 'tung_o_tu'] };
    const crimOpt = getAvailableCareers(criminal).find((c) => c.job.id === 'job_chep_kinh')!;

    expect(getCareerAcceptanceChance(criminal, crimOpt)).toBeLessThan(
      getCareerAcceptanceChance(clean, cleanOpt),
    );

    const appRes = attemptApplyForCareer(clean, 'job_chep_kinh');
    if (!appRes.hired) {
      expect(getJobApplyCooldownRemaining(appRes.state, 'job_chep_kinh')).toBe(90);
    } else {
      const upskilled = trainCurrentCareerSkill(appRes.state);
      expect(upskilled.activeCareer?.daysWorked).toBe(45);
      expect(upskilled.stats.education).toBeGreaterThan(appRes.state.stats.education);
    }
  });

  it('blocks daytime jobs for students, resigns daytime jobs on college entry, and clears student status on graduation', () => {
    let life = createTeenLife('ban_nong');
    life = { ...life, profile: { ...life.profile, totalDays: 18 * 360 - 1 } };
    life = applyForCareer(life, 'job_nong_vu');
    expect(life.activeCareer?.jobId).toBe('job_nong_vu');

    // Entering college resigns previous daytime job
    let student = applyDynamicDecisionSideEffects(life, 'dec_college_18', 2);
    expect(student.isStudent).toBe(true);
    expect(student.livelihoodStatus).toBe('student');
    expect(student.activeCareer).toBeNull();

    // Students cannot take daytime jobs, but can take evening jobs
    const options = getAvailableCareers(student);
    const daytimeOpt = options.find((o) => o.job.id === 'job_nong_vu')!;
    const eveningOpt = options.find((o) => o.job.id === 'job_tuan_dem')!;
    expect(daytimeOpt.eligible).toBe(false);
    expect(eveningOpt.eligible).toBe(true);

    student = applyForCareer(student, 'job_tuan_dem');
    expect(student.livelihoodStatus).toBe('student');

    // Graduating at age 22 must transition livelihoodStatus out of 'student'
    const preGrad = { ...student, profile: { ...student.profile, totalDays: 22 * 360 - 1 } };
    const gradRes = advanceDays(
      preGrad,
      1,
      ALL_ACTIONS,
      ALL_ADULTHOOD_EVENTS,
      { ...DEFAULT_AUTO_PAUSE_CONFIG, pauseOnBirthday: false },
    );
    expect(gradRes.state.isStudent).toBe(false);
    expect(gradRes.state.livelihoodStatus).toBe('employed');
  });
});
