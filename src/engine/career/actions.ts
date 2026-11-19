import { getAgeYears, type ActiveLifeState, type TimeSlot } from '../../types/activeLife';
import { formatCopper } from '../economy';
import { appendLog, applyEffects } from '../effectApplier';
import { mulberry32Next } from '../prng';
import { CAREER_CATALOG, type CareerJobDef, type EvaluatedCareerOption } from './typesAndCatalog';
import { VENTURE_CATALOG } from './ventureCatalog';
import { evaluateCareerOption, getAvailableVentures } from './evaluation';

function clearCareerFlags(flags: string[]): string[] {
  return flags.filter((f) => !f.startsWith('career_'));
}

function clearVentureFlags(flags: string[]): string[] {
  return flags.filter((f) => !f.startsWith('venture_'));
}

function assignSlotsToSchedule(
  schedule: ActiveLifeState['schedule'],
  slots: TimeSlot[],
  actionId: string,
): ActiveLifeState['schedule'] {
  const next = { ...schedule };
  for (const slot of slots) {
    next[slot] = actionId;
  }
  return next;
}

export function applyForCareer(state: ActiveLifeState, jobId: string): ActiveLifeState {
  const job = CAREER_CATALOG.find((j) => j.id === jobId);
  if (!job) return state;

  const evaluated = evaluateCareerOption(state, job);
  if (!evaluated.eligible) return state;

  // If switching from a daytime venture to a daytime job, keep flags clean
  let nextFlags = clearCareerFlags(state.flags);
  if (job.flagId) {
    nextFlags = [...nextFlags, job.flagId];
  }

  let nextSchedule = state.schedule;
  // Release old job's slots if changing slot pattern (e.g. daytime -> evening)
  if (state.activeCareer) {
    const oldJob = CAREER_CATALOG.find((j) => j.id === state.activeCareer!.jobId);
    if (oldJob) {
      for (const s of oldJob.slots) {
        if (nextSchedule[s] === oldJob.dailyActionId) {
          nextSchedule = { ...nextSchedule, [s]: 'act_nghi_ngoi' };
        }
      }
    }
  }
  nextSchedule = assignSlotsToSchedule(nextSchedule, job.slots, job.dailyActionId);

  const shouldUpdateRole =
    state.officialRank === 0 &&
    !state.flags.includes('trong_quan_ngu') &&
    !state.flags.includes('thai_giam') &&
    !state.flags.includes('trong_hau_cung');

  return {
    ...state,
    flags: nextFlags,
    livelihoodStatus: state.isStudent ? 'student' : 'employed',
    profile: {
      ...state.profile,
      currentRole: shouldUpdateRole ? job.title : state.profile.currentRole,
    },
    activeCareer: {
      jobId: job.id,
      track: job.track,
      tier: job.tier,
      daysWorked: 0,
      startedDay: state.profile.totalDays,
    },
    schedule: nextSchedule,
    logs: appendLog(
      state.logs,
      state.profile.totalDays,
      'survival',
      `Bạn nhận việc mới: ${job.title} (${evaluated.unlockedVia ?? 'tự ứng tuyển'}). Lịch sinh hoạt đã tự động cập nhật.`,
      { tone: 'positive' },
    ),
  };
}

export function resignCareer(state: ActiveLifeState): ActiveLifeState {
  if (!state.activeCareer) return state;
  const oldJob = CAREER_CATALOG.find((j) => j.id === state.activeCareer!.jobId);
  const nextSchedule = { ...state.schedule };
  if (oldJob) {
    for (const s of oldJob.slots) {
      if (nextSchedule[s] === oldJob.dailyActionId) {
        nextSchedule[s] = 'act_nghi_ngoi';
      }
    }
  }
  const age = getAgeYears(state.profile.totalDays);
  return {
    ...state,
    flags: clearCareerFlags(state.flags),
    activeCareer: null,
    profile: {
      ...state.profile,
      currentRole: state.officialRank === 0 ? (age >= 60 ? 'Nghỉ hưu' : 'Đang tìm việc') : state.profile.currentRole,
    },
    schedule: nextSchedule,
    logs: appendLog(
      state.logs,
      state.profile.totalDays,
      'survival',
      `Bạn đã thôi việc ${oldJob?.title ?? 'hiện tại'}. Kinh nghiệm tích lũy vẫn được giữ lại.`,
    ),
  };
}

export function canPromoteCareer(state: ActiveLifeState): {
  ok: boolean;
  targetJob?: CareerJobDef;
  reason?: string;
} {
  if (!state.activeCareer) return { ok: false, reason: 'Chưa có nghề nghiệp' };
  const currentJob = CAREER_CATALOG.find((j) => j.id === state.activeCareer!.jobId);
  if (!currentJob?.promoteToJobId) {
    return { ok: false, reason: 'Đã đạt bậc cao nhất của nhánh nghề này' };
  }
  const targetJob = CAREER_CATALOG.find((j) => j.id === currentJob.promoteToJobId);
  if (!targetJob) return { ok: false, reason: 'Không tìm thấy vị trí thăng tiến' };

  const evalTarget = evaluateCareerOption(state, targetJob);
  if (!evalTarget.eligible) {
    return { ok: false, targetJob, reason: evalTarget.lockReason };
  }
  return { ok: true, targetJob };
}

export function promoteCareer(state: ActiveLifeState): ActiveLifeState {
  const check = canPromoteCareer(state);
  if (!check.ok || !check.targetJob) return state;
  const next = applyForCareer(state, check.targetJob.id);
  return applyEffects(next, {
    fame: 3,
    happiness: 5,
    milestone_title: `Thăng tiến lên ${check.targetJob.title}`,
  });
}

export function startVenture(state: ActiveLifeState, ventureId: string): ActiveLifeState {
  const evaluated = getAvailableVentures(state).find((v) => v.venture.id === ventureId);
  if (!evaluated || !evaluated.eligible) return state;

  const { venture, effectiveCapitalCopper, hasSpinoffDiscount } = evaluated;
  let nextState = applyEffects(state, {
    copper: -effectiveCapitalCopper,
    happiness: 4,
    fame: 2,
    milestone_title: `Khởi nghiệp: ${venture.title}`,
  });

  // Close previous venture if any (refund 50% old capital)
  if (state.activeVenture) {
    const refund = Math.round(state.activeVenture.capitalInvested * 0.5);
    nextState = applyEffects(nextState, { copper: refund });
  }

  const nextFlags = [...clearVentureFlags(nextState.flags), venture.flagId];
  const nextSchedule = assignSlotsToSchedule(nextState.schedule, venture.slots, venture.dailyActionId);

  return {
    ...nextState,
    flags: nextFlags,
    activeVenture: {
      ventureId: venture.id,
      track: venture.track,
      level: 1,
      capitalInvested: effectiveCapitalCopper,
      daysOperated: 0,
      startedDay: state.profile.totalDays,
    },
    profile: {
      ...nextState.profile,
      currentRole: nextState.officialRank === 0 ? `Chủ ${venture.title}` : nextState.profile.currentRole,
    },
    schedule: nextSchedule,
    logs: appendLog(
      nextState.logs,
      nextState.profile.totalDays,
      'survival',
      `Bạn bỏ vốn ${formatCopper(effectiveCapitalCopper)}${hasSpinoffDiscount ? ' (được giảm 30% nhờ kinh nghiệm trong nghề)' : ''} để khởi nghiệp: ${venture.title}!`,
      { tone: 'positive' },
    ),
  };
}

export function upgradeVenture(state: ActiveLifeState): ActiveLifeState {
  if (!state.activeVenture || state.activeVenture.level >= 3) return state;
  const venture = VENTURE_CATALOG.find((v) => v.id === state.activeVenture!.ventureId);
  if (!venture) return state;

  const upgradeCost = venture.upgradeBaseCopper * state.activeVenture.level;
  if (state.assets.wealthCopper < upgradeCost) return state;

  const newLevel = state.activeVenture.level + 1;
  let nextState = applyEffects(state, {
    copper: -upgradeCost,
    fame: 3,
    happiness: 4,
  });
  nextState = {
    ...nextState,
    activeVenture: {
      ...state.activeVenture,
      level: newLevel,
      capitalInvested: state.activeVenture.capitalInvested + upgradeCost,
    },
    logs: appendLog(
      nextState.logs,
      nextState.profile.totalDays,
      'survival',
      `Bạn chi ${formatCopper(upgradeCost)} mở rộng quy mô ${venture.title} lên Cấp ${newLevel} (+25% lợi nhuận mỗi ngày).`,
      { tone: 'positive' },
    ),
  };
  return nextState;
}

export function closeVenture(state: ActiveLifeState): ActiveLifeState {
  if (!state.activeVenture) return state;
  const venture = VENTURE_CATALOG.find((v) => v.id === state.activeVenture!.ventureId);
  const refund = Math.round(state.activeVenture.capitalInvested * 0.5);
  const nextSchedule = { ...state.schedule };
  if (venture) {
    for (const s of venture.slots) {
      if (nextSchedule[s] === venture.dailyActionId) {
        nextSchedule[s] = 'act_nghi_ngoi';
      }
    }
  }
  const nextState = applyEffects(state, { copper: refund });
  const age = getAgeYears(nextState.profile.totalDays);
  return {
    ...nextState,
    flags: clearVentureFlags(nextState.flags),
    activeVenture: null,
    profile: {
      ...nextState.profile,
      currentRole: nextState.officialRank === 0 ? (age >= 60 ? 'Nghỉ hưu' : 'Đang tìm việc') : nextState.profile.currentRole,
    },
    schedule: nextSchedule,
    logs: appendLog(
      nextState.logs,
      nextState.profile.totalDays,
      'survival',
      `Bạn sang nhượng / đóng cửa ${venture?.title ?? 'cơ sở tự doanh'}, thu hồi được ${formatCopper(refund)} vốn.`,
    ),
  };
}

export function getCareerIncomeMultiplier(state: ActiveLifeState, actionId: string): number {
  let mult = 1.0;

  if (state.activeCareer) {
    const job = CAREER_CATALOG.find((j) => j.id === state.activeCareer!.jobId);
    if (job && job.dailyActionId === actionId) {
      const xp = state.careerXp?.[job.track] ?? 0;
      // Up to +20% salary bonus from track experience (at 400 days)
      mult += Math.min(0.2, xp / 2000);
    }
  }

  if (state.activeVenture) {
    const venture = VENTURE_CATALOG.find((v) => v.id === state.activeVenture!.ventureId);
    if (venture && venture.dailyActionId === actionId) {
      // +15% per venture level above 1
      mult += Math.max(0, state.activeVenture.level - 1) * 0.15;
    }
  }

  return mult;
}

export function recordDailyCareerProgress(
  state: ActiveLifeState,
  executedActionIds: string[],
): ActiveLifeState {
  let next = state;

  if (next.activeCareer) {
    const job = CAREER_CATALOG.find((j) => j.id === next.activeCareer!.jobId);
    if (job && executedActionIds.includes(job.dailyActionId)) {
      const prevXp = next.careerXp?.[job.track] ?? 0;
      next = {
        ...next,
        activeCareer: {
          ...next.activeCareer,
          daysWorked: next.activeCareer.daysWorked + 1,
        },
        careerXp: {
          ...(next.careerXp ?? {}),
          [job.track]: prevXp + 1,
        },
      };
    }
  }

  if (next.activeVenture) {
    const venture = VENTURE_CATALOG.find((v) => v.id === next.activeVenture!.ventureId);
    if (venture && executedActionIds.includes(venture.dailyActionId)) {
      const prevXp = next.careerXp?.[venture.track] ?? 0;
      next = {
        ...next,
        activeVenture: {
          ...next.activeVenture,
          daysOperated: next.activeVenture.daysOperated + 1,
        },
        careerXp: {
          ...(next.careerXp ?? {}),
          [venture.track]: prevXp + 1,
        },
      };
    }
  }

  return next;
}

const JOB_APPLY_COOLDOWN_DAYS = 90;
const CAREER_UPSKILL_COST = 120;
const CAREER_UPSKILL_COOLDOWN_DAYS = 180;

export function getJobApplyCooldownRemaining(state: ActiveLifeState, jobId: string): number {
  const lastDay = state.actionCooldowns?.[`job_apply_cd:${jobId}`];
  if (lastDay === undefined) return 0;
  return Math.max(0, JOB_APPLY_COOLDOWN_DAYS - (state.profile.totalDays - lastDay));
}

export function getCareerAcceptanceChance(
  state: ActiveLifeState,
  evaluated: EvaluatedCareerOption,
): number {
  const { job, unlockedVia } = evaluated;
  let chance = job.tier === 1 ? 85 : job.tier === 2 ? 62 : 45;
  chance += Math.round(Math.max(-10, Math.min(20, (state.stats.relationships - 50) * 0.4)));
  if (unlockedVia) chance += 18;
  if (state.schedule.lifeFocus === 'tu_than' || state.schedule.lifeFocus === 'cong_danh') {
    chance += 8;
  }
  if (
    state.flags.includes('tung_o_tu') &&
    job.track !== 'underworld' &&
    job.track !== 'labor'
  ) {
    chance -= 35;
  }
  return Math.max(15, Math.min(96, chance));
}

/**
 * 1in8b-style job application: rolls acceptance probability based on tier,
 * relationships, referral shortcut, focus, and criminal record (`tung_o_tu`).
 */
export function attemptApplyForCareer(
  state: ActiveLifeState,
  jobId: string,
): { hired: boolean; state: ActiveLifeState; message: string } {
  const job = CAREER_CATALOG.find((j) => j.id === jobId);
  if (!job) {
    return { hired: false, state, message: 'Không tìm thấy công việc này.' };
  }
  const evaluated = evaluateCareerOption(state, job);
  if (!evaluated.eligible) {
    return {
      hired: false,
      state,
      message: evaluated.lockReason ?? 'Chưa đủ điều kiện ứng tuyển.',
    };
  }
  const cd = getJobApplyCooldownRemaining(state, jobId);
  if (cd > 0) {
    return {
      hired: false,
      state,
      message: `Mới bị từ chối gần đây, cần chờ ${cd} ngày nữa.`,
    };
  }

  const chance = getCareerAcceptanceChance(state, evaluated);
  const roll = mulberry32Next(state.prngState);
  const nextState: ActiveLifeState = { ...state, prngState: roll.nextState };

  if (roll.value * 100 < chance) {
    const hiredState = applyForCareer(nextState, jobId);
    return {
      hired: true,
      state: hiredState,
      message: `Trúng tuyển «${job.title}» (${chance}% cơ hội).`,
    };
  }

  const rejectedState: ActiveLifeState = {
    ...nextState,
    actionCooldowns: {
      ...(nextState.actionCooldowns ?? {}),
      [`job_apply_cd:${jobId}`]: nextState.profile.totalDays,
    },
    logs: appendLog(
      nextState.logs,
      nextState.profile.totalDays,
      'event',
      `Ứng tuyển «${job.title}» chưa thành công (tỷ lệ nhận ${chance}%). Hãy trau dồi thêm học thức, tay nghề hoặc quan hệ rồi thử lại sau 90 ngày.`,
      { tone: 'negative' },
    ),
  };
  return {
    hired: false,
    state: rejectedState,
    message: `Chưa được nhận vào «${job.title}» (tỷ lệ ${chance}%). Chờ 90 ngày hoặc học thêm để tăng cơ hội!`,
  };
}

export function getCareerUpskillCooldownRemaining(state: ActiveLifeState): number {
  const lastDay = state.actionCooldowns?.career_upskill;
  if (lastDay === undefined) return 0;
  return Math.max(0, CAREER_UPSKILL_COOLDOWN_DAYS - (state.profile.totalDays - lastDay));
}

/**
 * In-job upskilling ("Học nâng cao chuyên môn"): boosts the track's core stat
 * and adds 45 daysWorked toward the next promotion.
 */
export function trainCurrentCareerSkill(state: ActiveLifeState): ActiveLifeState {
  if (!state.activeCareer) return state;
  if (state.assets.wealthCopper < CAREER_UPSKILL_COST) return state;
  if (getCareerUpskillCooldownRemaining(state) > 0) return state;

  const track = state.activeCareer.track;
  const statDelta =
    track === 'scholar'
      ? { education: 4 }
      : track === 'martial'
        ? { martial: 4 }
        : track === 'craft' || track === 'trade'
          ? { craft_trade: 4 }
          : track === 'underworld'
            ? { infamy: 3, martial: 2 }
            : { health: 2, craft_trade: 2 };

  const updated = applyEffects(state, {
    copper: -CAREER_UPSKILL_COST,
    ...statDelta,
  });

  return {
    ...updated,
    activeCareer: updated.activeCareer
      ? {
          ...updated.activeCareer,
          daysWorked: updated.activeCareer.daysWorked + 45,
        }
      : null,
    actionCooldowns: {
      ...(updated.actionCooldowns ?? {}),
      career_upskill: updated.profile.totalDays,
    },
    logs: appendLog(
      updated.logs,
      updated.profile.totalDays,
      'study',
      'Bạn bỏ 120 đồng theo học nâng cao chuyên môn nghề nghiệp, tay nghề và thâm niên đều tăng tiến.',
      { tone: 'positive' },
    ),
  };
}
