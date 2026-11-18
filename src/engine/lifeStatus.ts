import { getAgeYears, type ActiveLifeState } from '../types/activeLife';
import { CAREER_CATALOG, VENTURE_CATALOG } from './careerSystem';
import { OFFICIAL_RANKS } from './progressionModules';

/**
 * Unified 1in8b-style education ladder from childhood to adulthood.
 */
export function getEducationLabel(state: ActiveLifeState): string {
  if (state.flags.includes('do_trang_nguyen')) return 'Trạng nguyên';
  if (state.flags.includes('do_tien_si')) return 'Tiến sĩ';
  if (state.flags.includes('do_cong_si')) return 'Cống sĩ';
  if (state.flags.includes('do_cu_nhan')) return 'Cử nhân';
  if (state.flags.includes('do_tu_tai')) return 'Tú tài';

  const edu = state.stats.education;
  if (edu >= 30) return 'Thông hiểu kinh sử';
  if (edu >= 15) return 'Biết chữ · Thư sinh';
  if (edu >= 5) return 'Vỡ lòng · Học lỏm';
  return 'Chưa biết chữ';
}

/**
 * Resolves special life/servitude/court fate labels from active flags.
 */
export function getSpecialFateRole(state: ActiveLifeState): string | null {
  if (state.flags.includes('bi_ep_lam_gia_no')) return 'Gia nô trừ nợ';
  if (state.flags.includes('thai_giam')) return 'Thái giám nội đình';
  if (state.flags.includes('trong_hau_cung')) return 'Cung nữ · Phi tần';
  if (state.flags.includes('trong_quan_ngu')) return 'Binh sĩ tại ngũ';
  if (getAgeYears(state.profile.totalDays) < 13 && state.flags.includes('tung_o_do')) {
    return 'Đi ở đợ nhà địa chủ';
  }
  return null;
}

/**
 * Resolves the character's true current livelihood/occupation for UI display
 * (independent of daily time-slot actions).
 */
export function getCurrentLivelihoodLabel(state: ActiveLifeState): string {
  if (state.officialRank > 0) {
    return `${OFFICIAL_RANKS[state.officialRank] ?? 'Quan viên'} (Triều đình)`;
  }

  const fateRole = getSpecialFateRole(state);
  if (fateRole) return fateRole;

  if (state.activeCareer) {
    const job = CAREER_CATALOG.find((j) => j.id === state.activeCareer!.jobId);
    if (job) return job.title;
  }

  if (state.activeVenture) {
    const venture = VENTURE_CATALOG.find((v) => v.id === state.activeVenture!.ventureId);
    if (venture) return `Chủ ${venture.title}`;
  }

  return 'Chưa có nghề nghiệp';
}
