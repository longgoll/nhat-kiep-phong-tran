import { getAgeYears, type ActiveLifeState, type TimeSlot } from '../../types/activeLife';
import { formatCopper } from '../economy';
import {
  CAREER_CATALOG,
  type CareerJobDef,
  type CareerRequirement,
  type EvaluatedCareerOption,
  type EvaluatedVentureOption,
} from './typesAndCatalog';
import { VENTURE_CATALOG } from './ventureCatalog';

function checkSocialShortcut(state: ActiveLifeState, req: CareerRequirement): string | null {
  const sc = req.socialShortcut;
  if (!sc) return null;

  if (sc.requiresOriginIn && !sc.requiresOriginIn.includes(state.profile.originClass)) {
    return null;
  }
  if (sc.requiresPeerOrigin) {
    const hasPeer = (state.cohortPeers ?? []).some((p) =>
      sc.requiresPeerOrigin!.includes(p.originClass),
    );
    if (!hasPeer) return null;
  }
  if (sc.requiredFlags && !sc.requiredFlags.every((f) => state.flags.includes(f))) {
    return null;
  }
  if (sc.minRelationships !== undefined && state.stats.relationships < sc.minRelationships) {
    return null;
  }
  if (
    sc.requiresLivingNpcAffinity !== undefined &&
    !state.npcs.some((n) => n.isAlive && n.affinity >= sc.requiresLivingNpcAffinity!)
  ) {
    return null;
  }
  if (sc.minEducation !== undefined && state.stats.education < sc.minEducation) {
    return null;
  }
  if (sc.minMartial !== undefined && state.stats.martial < sc.minMartial) {
    return null;
  }
  if (sc.minCraftTrade !== undefined && state.stats.craftTrade < sc.minCraftTrade) {
    return null;
  }
  return sc.label;
}

export function getSlotConflictReason(state: ActiveLifeState, slots: TimeSlot[]): string | undefined {
  if (state.flags.includes('bi_ep_lam_gia_no') && slots.some((s) => s === 'morning' || s === 'afternoon')) {
    return 'Đang bị ép lao dịch trả nợ buổi Sáng/Chiều';
  }
  return undefined;
}

export function evaluateCareerOption(state: ActiveLifeState, job: CareerJobDef): EvaluatedCareerOption {
  const age = getAgeYears(state.profile.totalDays);
  const isCurrent = state.activeCareer?.jobId === job.id;
  const slotConflictReason = getSlotConflictReason(state, job.slots);

  if (age < job.minAge) {
    return { job, eligible: false, lockReason: `Cần từ ${job.minAge} tuổi`, slotConflictReason, isCurrent };
  }
  if (job.maxAge !== undefined && age > job.maxAge) {
    return { job, eligible: false, lockReason: `Chỉ phù hợp đến ${job.maxAge} tuổi`, slotConflictReason, isCurrent };
  }
  if (state.livelihoodStatus === 'prison') {
    return {
      job,
      eligible: false,
      lockReason: 'Đang chịu án tù, không thể nhận việc làm',
      slotConflictReason,
      isCurrent,
    };
  }
  if (
    (state.isStudent || state.livelihoodStatus === 'student') &&
    job.slots.some((s) => s === 'morning' || s === 'afternoon')
  ) {
    return {
      job,
      eligible: false,
      lockReason: 'Đang theo học ban ngày, chỉ có thể nhận việc làm buổi tối',
      slotConflictReason,
      isCurrent,
    };
  }
  if (
    state.officialRank > 0 ||
    state.flags.includes('dang_lam_quan') ||
    state.flags.includes('trong_quan_ngu')
  ) {
    return {
      job,
      eligible: false,
      lockReason:
        state.flags.includes('trong_quan_ngu')
          ? 'Đang tại ngũ trong quân đội, không thể nhận việc dân sự'
          : 'Đang làm quan triều đình, không thể đi làm thuê dân sự',
      slotConflictReason,
      isCurrent,
    };
  }
  if (job.forbidFlags?.some((f) => state.flags.includes(f))) {
    return {
      job,
      eligible: false,
      lockReason: 'Thân phận hiện tại không phù hợp công việc này',
      slotConflictReason,
      isCurrent,
    };
  }

  const req = job.requirements;
  const trackXp = state.careerXp?.[job.track] ?? 0;
  const missing: string[] = [];

  if (req.requiredFlags && !req.requiredFlags.every((f) => state.flags.includes(f))) {
    missing.push('Chưa qua khóa học / chứng chỉ yêu cầu');
  }

  if (req.minEducation !== undefined && state.stats.education < req.minEducation) {
    missing.push(`Học thức ≥ ${req.minEducation}`);
  }
  if (req.minMartial !== undefined && state.stats.martial < req.minMartial) {
    missing.push(`Võ nghệ ≥ ${req.minMartial}`);
  }
  if (req.minCraftTrade !== undefined && state.stats.craftTrade < req.minCraftTrade) {
    missing.push(`Thương tài ≥ ${req.minCraftTrade}`);
  }
  if (req.minFame !== undefined && state.stats.fame < req.minFame) {
    missing.push(`Thanh danh ≥ ${req.minFame}`);
  }
  if (req.minInfamy !== undefined && state.stats.infamy < req.minInfamy) {
    missing.push(`Tai tiếng ≥ ${req.minInfamy}`);
  }
  if (req.minRelationships !== undefined && state.stats.relationships < req.minRelationships) {
    missing.push(`Quan hệ ≥ ${req.minRelationships}`);
  }
  if (req.minTrackXp !== undefined && trackXp < req.minTrackXp) {
    missing.push(`Kinh nghiệm ngành ≥ ${req.minTrackXp} ngày`);
  }

  if (missing.length === 0) {
    return {
      job,
      eligible: !slotConflictReason,
      unlockedVia: req.minTrackXp ? 'Đủ chỉ số & kinh nghiệm' : 'Đủ điều kiện năng lực',
      lockReason: slotConflictReason,
      slotConflictReason,
      isCurrent,
    };
  }

  const shortcutLabel = checkSocialShortcut(state, req);
  if (shortcutLabel) {
    return {
      job,
      eligible: !slotConflictReason,
      unlockedVia: shortcutLabel,
      lockReason: slotConflictReason,
      slotConflictReason,
      isCurrent,
    };
  }

  return {
    job,
    eligible: false,
    lockReason: `Cần ${missing.join(' · ')}`,
    slotConflictReason,
    isCurrent,
  };
}

export function getAvailableCareers(state: ActiveLifeState): EvaluatedCareerOption[] {
  return CAREER_CATALOG.map((job) => evaluateCareerOption(state, job));
}

/**
 * Picks up to `maxCount` best-matching job offers for the 1in8b-style job selection card,
 * prioritizing higher tier jobs, social shortcuts, and income.
 */
export function getRecommendedCareerOffers(
  state: ActiveLifeState,
  maxCount = 4,
): EvaluatedCareerOption[] {
  const eligible = getAvailableCareers(state).filter((c) => c.eligible && !c.isCurrent);
  const sorted = [...eligible].sort((a, b) => {
    if (b.job.tier !== a.job.tier) return b.job.tier - a.job.tier;
    return b.job.baseDailyCopper - a.job.baseDailyCopper;
  });
  return sorted.slice(0, maxCount);
}

export function getAvailableVentures(state: ActiveLifeState): EvaluatedVentureOption[] {
  const age = getAgeYears(state.profile.totalDays);
  return VENTURE_CATALOG.map((venture) => {
    const isCurrent = state.activeVenture?.ventureId === venture.id;
    const hasSpinoffDiscount = Boolean(
      state.activeCareer && venture.relatedCareerIds.includes(state.activeCareer.jobId),
    );
    const effectiveCapitalCopper = hasSpinoffDiscount
      ? Math.round(venture.capitalCopper * 0.7)
      : venture.capitalCopper;
    const slotConflictReason = getSlotConflictReason(state, venture.slots);

    if (age < venture.minAge) {
      return {
        venture,
        effectiveCapitalCopper,
        hasSpinoffDiscount,
        eligible: false,
        lockReason: `Cần từ ${venture.minAge} tuổi`,
        slotConflictReason,
        isCurrent,
      };
    }
    if (
      state.officialRank > 0 ||
      state.flags.includes('dang_lam_quan') ||
      state.flags.includes('trong_quan_ngu') ||
      state.flags.includes('bi_ep_lam_gia_no') ||
      state.flags.includes('thai_giam') ||
      state.flags.includes('trong_hau_cung')
    ) {
      return {
        venture,
        effectiveCapitalCopper,
        hasSpinoffDiscount,
        eligible: false,
        lockReason: 'Thân phận hiện tại (làm quan / quân ngũ / nội đình) không thể tự mở cơ sở',
        slotConflictReason,
        isCurrent,
      };
    }
    if (venture.minEducation !== undefined && state.stats.education < venture.minEducation) {
      return {
        venture,
        effectiveCapitalCopper,
        hasSpinoffDiscount,
        eligible: false,
        lockReason: `Cần Học thức ≥ ${venture.minEducation}`,
        slotConflictReason,
        isCurrent,
      };
    }
    if (venture.minCraftTrade !== undefined && state.stats.craftTrade < venture.minCraftTrade) {
      return {
        venture,
        effectiveCapitalCopper,
        hasSpinoffDiscount,
        eligible: false,
        lockReason: `Cần Thương tài ≥ ${venture.minCraftTrade}`,
        slotConflictReason,
        isCurrent,
      };
    }
    if (slotConflictReason) {
      return {
        venture,
        effectiveCapitalCopper,
        hasSpinoffDiscount,
        eligible: false,
        lockReason: slotConflictReason,
        slotConflictReason,
        isCurrent,
      };
    }
    if (state.assets.wealthCopper < effectiveCapitalCopper) {
      return {
        venture,
        effectiveCapitalCopper,
        hasSpinoffDiscount,
        eligible: false,
        lockReason: `Thiếu vốn khởi nghiệp (cần ${formatCopper(effectiveCapitalCopper)})`,
        slotConflictReason,
        isCurrent,
      };
    }

    return {
      venture,
      effectiveCapitalCopper,
      hasSpinoffDiscount,
      eligible: true,
      isCurrent,
    };
  });
}
