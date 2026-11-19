import { DAYS_PER_YEAR, type ActiveLifeState, type HousingTier } from '../../types/activeLife';
import { appendLog, applyEffects } from '../effectApplier';
import { mulberry32Next } from '../prng';
import {
  COMMERCIAL_PROPERTY_IDS,
  LAND_PROPERTY_IDS,
  getOfficialMaxLandCount,
  getOfficialPostingLabel,
  getOfficialRankSpec,
  pickPostingByAvoidance,
} from './ranksAndMeta';

export function checkOfficialPropertyRule(
  state: ActiveLifeState,
  propertyId: string,
  useProxy: boolean,
): { allowed: boolean; reason?: string; isProxyViolationRisk: boolean } {
  if (state.officialRank <= 0) {
    return { allowed: true, isProxyViolationRisk: false };
  }

  if (COMMERCIAL_PROPERTY_IDS.has(propertyId)) {
    if (!useProxy) {
      return {
        allowed: false,
        reason: 'Luật triều đình cấm quan đương chức trực tiếp buôn bán ("Dữ dân tranh lợi"). Có thể nhờ gia nhân đứng tên ngầm.',
        isProxyViolationRisk: false,
      };
    }
    return { allowed: true, isProxyViolationRisk: true };
  }

  if (LAND_PROPERTY_IDS.has(propertyId)) {
    const ownedLandCount = state.assets.properties.filter((id) => LAND_PROPERTY_IDS.has(id)).length;
    const maxLand = getOfficialMaxLandCount(state);
    if (ownedLandCount >= maxLand) {
      return {
        allowed: false,
        reason: `Vượt hạn điền phẩm hàm hiện tại (tối đa ${maxLand} điền sản).`,
        isProxyViolationRisk: false,
      };
    }
    if (propertyId === 'trang_vien_cho_thue' && state.officialRank < 4) {
      return {
        allowed: false,
        reason: 'Cần đạt Lục phẩm trở lên mới được lập Trang viên.',
        isProxyViolationRisk: false,
      };
    }
    if (propertyId === 'thai_ap_ton_that' && state.officialRank < 7) {
      return {
        allowed: false,
        reason: 'Cần đạt Tam phẩm trở lên mới được lập Thái ấp.',
        isProxyViolationRisk: false,
      };
    }
  }

  return { allowed: true, isProxyViolationRisk: false };
}

export function checkHousingTiemLe(
  state: ActiveLifeState,
  targetTier: HousingTier,
): { allowed: boolean; reason?: string } {
  if (state.officialRank <= 0 || state.officialRank >= 10) return { allowed: true };
  const spec = getOfficialRankSpec(state.officialRank);
  if (!spec) return { allowed: true };
  const order: Record<HousingTier, number> = { gam_cau: 0, nha_tranh: 1, nha_gach: 2, phu_de: 3 };
  if (order[targetTier] > order[spec.allowedHousingTier]) {
    return {
      allowed: false,
      reason: `Phẩm ${spec.gradeLabel} không được ở vượt cấp (${targetTier === 'phu_de' ? 'Phủ đệ' : 'Nhà gạch'}), phạm tội Tiếm lễ!`,
    };
  }
  return { allowed: true };
}

export function canRequestKhaoKhoa(state: ActiveLifeState): { ok: boolean; reason?: string; daysRemaining: number } {
  if (state.officialRank <= 0 || !state.official) {
    return { ok: false, reason: 'Chưa có chức vị triều đình', daysRemaining: 0 };
  }
  if (state.official.dingYouUntilDay && state.profile.totalDays < state.official.dingYouUntilDay) {
    const left = Math.ceil((state.official.dingYouUntilDay - state.profile.totalDays) / DAYS_PER_YEAR);
    return { ok: false, reason: `Đang chịu tang Đinh ưu (còn ~${left} năm)`, daysRemaining: state.official.dingYouUntilDay - state.profile.totalDays };
  }
  if (state.officialRank >= 9) {
    return { ok: false, reason: 'Đã đạt tột đỉnh Nhất phẩm triều đình', daysRemaining: 0 };
  }
  if (state.official.isHanhHam && state.officialRank >= 5) {
    return { ok: false, reason: 'Xuất thân Quyên quan hư hàm, trần thăng tiến tối đa là Ngũ phẩm', daysRemaining: 0 };
  }

  const currentSpec = getOfficialRankSpec(state.officialRank);
  const requiredDays = currentSpec?.tenureDaysRequired ?? 1080;
  const elapsed = state.profile.totalDays - state.official.lastReviewDay;
  if (elapsed < requiredDays) {
    return {
      ok: false,
      reason: `Chưa đủ nhiệm kỳ Khảo khóa (còn ${requiredDays - elapsed} ngày)`,
      daysRemaining: requiredDays - elapsed,
    };
  }
  return { ok: true, daysRemaining: 0 };
}

export function evaluateKhaoKhoa(state: ActiveLifeState): ActiveLifeState {
  const elig = canRequestKhaoKhoa(state);
  if (!elig.ok || !state.official) return state;

  const off = state.official;
  const nextRank = off.rank + 1;
  const nextSpec = getOfficialRankSpec(nextRank);
  if (!nextSpec) return state;

  const relevantSkill = off.track === 'vo' ? state.stats.martial : state.stats.education;
  const advisorBonus = off.hasAdvisor ? 8 : 0;
  // Bảo cử (Patronage): from Ngũ phẩm (5) upward, lacking faction & relationships penalizes review
  const patronagePenalty = nextRank >= 5 && off.faction === 'chua_dung_phe' && state.stats.relationships < 55 ? 18 : 0;
  const score =
    off.merit +
    Math.max(-20, Math.min(25, Math.round(off.publicTrust * 0.25))) +
    Math.round(off.imperialFavor * 0.4) +
    advisorBonus -
    patronagePenalty -
    Math.round(off.scandalRisk * 0.8);

  const canPromoteByStats =
    relevantSkill >= nextSpec.minSkillRequired &&
    off.merit >= nextSpec.minMeritRequired &&
    state.stats.fame >= nextSpec.minFameRequired &&
    off.imperialFavor >= nextSpec.minImperialFavorRequired &&
    off.scandalRisk < 65;

  // Hạ khảo if scandal is high or merit/trust is terrible
  if (off.scandalRisk >= 75 || off.publicTrust <= -40 || score < 20) {
    if (off.rank <= 1) {
      const cleanedFlags = state.flags.filter((f) => f !== 'dang_lam_quan');
      const next = applyEffects(state, {
        fame: -15,
        happiness: -20,
        milestone_title: 'Bị Hạ khảo cách chức đuổi về quê',
      });
      return {
        ...next,
        officialRank: 0,
        official: undefined,
        flags: cleanedFlags,
        profile: { ...next.profile, currentRole: 'Dân thường' },
        logs: appendLog(next.logs, next.profile.totalDays, 'warning', 'Kỳ Khảo khóa bị đánh giá Hạ khảo, bạn bị cách chức thu ấn!'),
      };
    }

    const demotedRank = off.rank - 1;
    const demotedSpec = getOfficialRankSpec(demotedRank)!;
    const demotedTitle = demotedSpec.titles[off.track];
    const next = applyEffects(state, {
      fame: -10,
      happiness: -15,
      milestone_title: `Khảo khóa giáng chức xuống ${demotedSpec.gradeLabel}`,
    });
    return {
      ...next,
      officialRank: demotedRank,
      official: {
        ...off,
        rank: demotedRank,
        title: demotedTitle,
        lastReviewDay: next.profile.totalDays,
        tenureStartDay: next.profile.totalDays,
      },
      profile: { ...next.profile, currentRole: demotedTitle },
      logs: appendLog(next.logs, next.profile.totalDays, 'warning', `Kỳ Khảo khóa bị đánh giá Hạ khảo, bạn bị giáng xuống ${demotedSpec.gradeLabel} (${demotedTitle}).`),
    };
  }

  // Thượng khảo -> Check Khuyết vị (Vacancy Gate) for Tam phẩm (7) .. Nhất phẩm (9)
  if (canPromoteByStats && score >= nextSpec.minMeritRequired + 15) {
    let workingPrng = state.prngState;
    if (nextRank >= 7) {
      const baseVacancy = nextRank === 7 ? 0.65 : nextRank === 8 ? 0.45 : 0.25;
      const favorBonus = off.imperialFavor >= 80 ? 0.15 : 0;
      const factionBonus = off.faction !== 'chua_dung_phe' ? 0.12 : 0;
      const warBonus = state.world.worldState === 'chien_tranh' ? 0.15 : 0;
      const vacancyChance = Math.min(0.9, baseVacancy + favorBonus + factionBonus + warBonus);
      const vacancyRoll = mulberry32Next(workingPrng);
      workingPrng = vacancyRoll.nextState;
      if (vacancyRoll.value > vacancyChance) {
        const bonusCopper = off.rank * 800;
        const next = applyEffects(
          { ...state, prngState: workingPrng },
          { copper: bonusCopper, fame: 5 },
        );
        return {
          ...next,
          official: {
            ...off,
            lastReviewDay: next.profile.totalDays,
            imperialFavor: Math.min(100, off.imperialFavor + 3),
          },
          logs: appendLog(
            next.logs,
            next.profile.totalDays,
            'event',
            `Khảo khóa đạt Thượng khảo nhưng triều đình chưa có khuyết vị ${nextSpec.gradeLabel}! Bạn được Gia hàm thưởng ${bonusCopper}đ và đợi kỳ sau.`,
          ),
        };
      }
    }

    const newTitle = nextSpec.titles[off.track];
    const { posting, nextPrng } = pickPostingByAvoidance(nextRank, off.track, workingPrng);
    const next = applyEffects(
      { ...state, prngState: nextPrng },
      {
        fame: 12,
        happiness: 12,
        milestone_title: `Thăng ${nextSpec.gradeLabel}: ${newTitle}`,
      },
    );
    return {
      ...next,
      officialRank: nextRank,
      official: {
        ...off,
        rank: nextRank,
        title: newTitle,
        posting,
        tenureStartDay: next.profile.totalDays,
        lastReviewDay: next.profile.totalDays,
      },
      profile: { ...next.profile, currentRole: newTitle },
      logs: appendLog(
        next.logs,
        next.profile.totalDays,
        'event',
        `Khảo khóa đạt Thượng khảo! Triều đình bổ bạn vào khuyết vị ${nextSpec.gradeLabel} · ${newTitle} (Nhiệm sở: ${getOfficialPostingLabel(off.track, posting)}).`,
      ),
    };
  }

  // Trung khảo -> Keep rank, reset review timer
  return {
    ...state,
    official: {
      ...off,
      lastReviewDay: state.profile.totalDays,
    },
    logs: appendLog(
      state.logs,
      state.profile.totalDays,
      'event',
      `Kỳ Khảo khóa đạt Trung khảo: giữ nguyên chức ${off.title}. Cần thêm Chính tích (${off.merit}/${nextSpec.minMeritRequired}), Thánh sủng (${off.imperialFavor}/${nextSpec.minImperialFavorRequired}) hoặc Thanh danh để được thăng ${nextSpec.gradeLabel}.`,
    ),
  };
}
