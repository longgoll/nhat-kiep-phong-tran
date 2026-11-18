import { getAgeYears, type ActiveLifeState, type CohortPeer } from '../types/activeLife';
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
 * Returns true if the character currently has an active job, venture, official post, or forced service.
 */
export function hasActiveLivelihood(state: ActiveLifeState): boolean {
  if (state.officialRank > 0) return true;
  if (getSpecialFateRole(state) !== null) return true;
  if (state.activeCareer || state.activeVenture) return true;
  return false;
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

  const age = getAgeYears(state.profile.totalDays);
  if (age < 13) return 'Chưa đi làm';
  if (age >= 60) return 'Nghỉ hưu';
  return 'Đang tìm việc';
}

/**
 * Dynamic 1in8b-style cohort peer status label that evolves with age.
 */
export function getCohortPeerStatusLabel(peer: CohortPeer, currentAge: number): {
  text: string;
  isDead: boolean;
} {
  if (peer.deathAge !== undefined && currentAge >= peer.deathAge) {
    return { text: `Mất năm ${peer.deathAge}t`, isDead: true };
  }
  if (currentAge < 6) return { text: `Ấu thơ · ${peer.originLabel}`, isDead: false };
  if (currentAge < 13) return { text: `Đang học chữ · ${peer.originLabel}`, isDead: false };
  if (currentAge < 18) return { text: `Thiếu niên · ${peer.originLabel}`, isDead: false };
  if (currentAge < 60) return { text: `Đang lập nghiệp · ${peer.originLabel}`, isDead: false };
  return { text: `Tuổi xế chiều · ${peer.originLabel}`, isDead: false };
}
