import { type ActiveLifeState } from '../../types/activeLife';
import {
  CAREER_CATALOG,
  applyForCareer,
  getAvailableVentures,
  getRecommendedCareerOffers,
  promoteCareer,
  resignCareer,
  startVenture,
} from '../careerSystem';
import { appendLog, applyEffects } from '../effectApplier';
import {
  createOfficialProfile,
  getOfficialTitle,
  isHomePostingAtBirthPlace,
  setOfficialFamilyAccompany,
} from '../officialSystem';
import {
  appointOrPromoteOfficial,
  sellProperty,
  takeExam,
} from '../progressionModules';
import { getEligibleExamLevelForPrompt } from './careerAndExamDecisions';

/**
 * Applies post-choice side effects specific to dynamic 1in8b decision cards.
 */
export function applyDynamicDecisionSideEffects(
  state: ActiveLifeState,
  eventId: string,
  choiceIndex: number,
): ActiveLifeState {
  const totalDays = state.profile.totalDays;

  if (eventId === 'dec_college_18') {
    const activeJob = state.activeCareer
      ? CAREER_CATALOG.find((j) => j.id === state.activeCareer!.jobId)
      : undefined;
    const baseState =
      choiceIndex <= 2 && activeJob && activeJob.slots.some((s) => s === 'morning' || s === 'afternoon')
        ? resignCareer(state)
        : state;

    if (choiceIndex === 0) {
      return {
        ...baseState,
        eduLevel: 4,
        isStudent: true,
        major: 'Kinh sử · Chính trị',
        livelihoodStatus: 'student',
        profile: { ...baseState.profile, currentRole: 'Giám sinh Quốc Tử Giám' },
      };
    }
    if (choiceIndex === 1) {
      return {
        ...baseState,
        eduLevel: 4,
        isStudent: true,
        major: 'Y dược · Thương toán',
        livelihoodStatus: 'student',
        profile: { ...baseState.profile, currentRole: 'Học trò Thư viện lớn' },
      };
    }
    if (choiceIndex === 2) {
      return {
        ...baseState,
        eduLevel: 4,
        isStudent: true,
        major: 'Binh pháp',
        livelihoodStatus: 'student',
        profile: { ...baseState.profile, currentRole: 'Võ sinh Võ học đường' },
      };
    }
    return {
      ...state,
      eduLevel: Math.max(state.eduLevel ?? 2, 3),
      isStudent: false,
      livelihoodStatus: 'seeking',
      profile: { ...state.profile, currentRole: 'Đang tìm việc' },
    };
  }

  if (eventId === 'dec_retire_60') {
    const next = {
      ...state,
      eventCooldowns: { ...state.eventCooldowns, dec_retire_60: totalDays },
    };
    if (choiceIndex === 0) {
      const resigned = resignCareer(next);
      return {
        ...resigned,
        flags: resigned.flags.filter((f) => f !== 'dang_lam_quan'),
        livelihoodStatus: 'retired',
        officialRank: 0,
        profile: { ...resigned.profile, currentRole: 'Nghỉ hưu' },
      };
    }
    return next;
  }

  if (eventId === 'dec_official_appoint') {
    const stamped = {
      ...state,
      eventCooldowns: { ...state.eventCooldowns, dec_official_appoint: totalDays },
    };
    if (choiceIndex === 0) {
      if (
        stamped.flags.includes('do_tu_tai') ||
        stamped.flags.includes('do_cu_nhan') ||
        stamped.flags.includes('do_tien_si') ||
        stamped.flags.includes('trong_quan_ngu')
      ) {
        return appointOrPromoteOfficial(stamped);
      }
      const track = stamped.stats.martial > stamped.stats.education + 12 ? 'vo' : 'van';
      const { profile: offProfile, nextPrng } = createOfficialProfile(stamped, track, 1, false);
      const title = getOfficialTitle(1, track);
      const addFlags = ['dang_lam_quan'];
      if (
        !isHomePostingAtBirthPlace(stamped.family?.birthPlace, offProfile.posting) &&
        !stamped.flags.includes('da_ra_o_rieng')
      ) {
        addFlags.push('da_ra_o_rieng');
      }
      const next = applyEffects(
        { ...stamped, prngState: nextPrng },
        {
          official_rank_delta: 1,
          add_flags: addFlags,
          fame: 8,
          milestone_title: `Được tiến cử nhậm chức ${title}`,
        },
      );
      return {
        ...next,
        isStudent: false,
        livelihoodStatus: 'employed',
        official: offProfile,
        profile: { ...next.profile, currentRole: title },
      };
    }
    return stamped;
  }

  if (eventId === 'dec_official_family_move') {
    const stamped = {
      ...state,
      eventCooldowns: { ...state.eventCooldowns, dec_official_family_move: totalDays },
    };
    if (stamped.official?.track === 'vo' && stamped.official.posting === 'bien_ai') {
      return stamped;
    }
    return setOfficialFamilyAccompany(stamped, choiceIndex === 0);
  }

  if (eventId === 'dec_official_censor_audit') {
    return {
      ...state,
      eventCooldowns: { ...state.eventCooldowns, dec_official_censor_audit: totalDays },
    };
  }

  if (eventId === 'dec_official_cong_cao_chan_chu') {
    return {
      ...state,
      eventCooldowns: { ...state.eventCooldowns, dec_official_cong_cao_chan_chu: totalDays },
    };
  }

  if (eventId === 'dec_official_promote') {
    const next = {
      ...state,
      eventCooldowns: { ...state.eventCooldowns, dec_official_promote: totalDays },
    };
    if (choiceIndex === 0) {
      return appointOrPromoteOfficial(next);
    }
    return next;
  }

  if (eventId === 'dec_rankup') {
    const next = {
      ...state,
      eventCooldowns: { ...state.eventCooldowns, dec_rankup: totalDays },
    };
    if (choiceIndex === 0) {
      return promoteCareer(next);
    }
    return next;
  }

  if (eventId === 'dec_loan_heavy') {
    const next = {
      ...state,
      eventCooldowns: { ...state.eventCooldowns, dec_loan_heavy: totalDays },
    };
    const canFamilyHelp = (state.family?.familyWealthCopper ?? 0) >= 400;
    const hasProp = state.assets.properties.length > 0;
    if (hasProp && ((canFamilyHelp && choiceIndex === 1) || (!canFamilyHelp && choiceIndex === 0))) {
      return sellProperty(next, state.assets.properties[0]);
    }
    return next;
  }

  if (eventId === 'dec_job_offers') {
    const offers = getRecommendedCareerOffers(state, 3);
    const next = {
      ...state,
      flags: state.flags.filter((f) => f !== 'cho_tim_viec_moi'),
      eventCooldowns: { ...state.eventCooldowns, dec_job_offers: totalDays },
    };
    if (choiceIndex < offers.length) {
      const chosen = offers[choiceIndex];
      const hired = applyForCareer(next, chosen.job.id);
      return { ...hired, livelihoodStatus: 'employed' };
    }
    if (choiceIndex === offers.length + 1) {
      return {
        ...next,
        livelihoodStatus: 'homemaker',
        profile: { ...next.profile, currentRole: 'Nội trợ' },
      };
    }
    return {
      ...next,
      logs: appendLog(next.logs, totalDays, 'survival', 'Bạn tạm thời chưa nhận lời mời việc làm nào.'),
    };
  }

  if (eventId === 'dec_biz_offers') {
    const bizOffers = getAvailableVentures(state)
      .filter((v) => !v.isCurrent && v.eligible)
      .slice(0, 3);
    const next = {
      ...state,
      flags: state.flags.filter((f) => f !== 'cho_khoi_nghiep'),
      eventCooldowns: { ...state.eventCooldowns, dec_biz_offers: totalDays },
    };
    if (choiceIndex < bizOffers.length) {
      const chosen = bizOffers[choiceIndex];
      const started = startVenture(next, chosen.venture.id);
      return { ...started, livelihoodStatus: 'venture' };
    }
    return {
      ...next,
      logs: appendLog(next.logs, totalDays, 'survival', 'Bạn tạm gác ý định khởi nghiệp lúc này.'),
    };
  }

  if (eventId === 'dec_exam_prompt') {
    const examLevel = getEligibleExamLevelForPrompt(state);
    if (!examLevel) return state;
    const next = {
      ...state,
      eventCooldowns: { ...state.eventCooldowns, [`dec_exam_${examLevel}`]: totalDays },
    };
    if (choiceIndex === 0) {
      return takeExam(next, examLevel);
    }
    return {
      ...next,
      logs: appendLog(next.logs, totalDays, 'study', 'Bạn quyết định tạm gác kỳ thi năm nay để dùi mài thêm.'),
    };
  }

  return state;
}
