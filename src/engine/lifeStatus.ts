import { getAgeYears, type ActiveLifeState, type CohortPeer } from '../types/activeLife';
import { CAREER_CATALOG, VENTURE_CATALOG } from './careerSystem';
import { OFFICIAL_RANKS } from './progressionModules';

/**
 * Unified 1in8b-style education ladder from childhood to adulthood.
 */
export function getEducationLabel(state: ActiveLifeState): string {
  if (state.flags.includes('do_trang_nguyen') || state.flags.includes('trang_nguyen')) return 'Trạng nguyên';
  if (state.flags.includes('do_tien_si')) return 'Tiến sĩ';
  if (state.flags.includes('do_cong_si')) return 'Cống sĩ';
  if (state.flags.includes('do_cu_nhan')) return 'Cử nhân';
  if (state.flags.includes('do_tu_tai')) return 'Tú tài';

  if (state.eduLevel !== undefined) {
    const majorSuffix = state.major ? ` (${state.major})` : '';
    if (state.eduLevel >= 5) return `Hàn Lâm Viện${majorSuffix}`;
    if (state.eduLevel === 4) return `Quốc Tử Giám${majorSuffix}`;
    if (state.eduLevel === 3) return 'Huyện học';
    if (state.eduLevel === 2) return 'Hương học';
    if (state.eduLevel === 1) return 'Vỡ lòng · Thầy đồ';
  }

  const age = getAgeYears(state.profile.totalDays);
  if (age >= 6 && age < 13 && state.schedule.childhoodFocus === 'hoc_tap') {
    const isDeclined =
      state.family?.familyLivingTier === 'tung_thieu' ||
      state.flags.includes('gia_toc_sa_sut') ||
      state.flags.includes('that_sung_cung_dinh');
    if (state.profile.originClass === 'ban_nong' && !state.flags.includes('duoc_thay_do_quy')) {
      return 'Đang tự học · Học lỏm';
    }
    if (state.profile.originClass === 'hoang_toc' && !isDeclined) {
      return 'Đang học Quốc Tử Giám';
    }
    if (state.profile.originClass === 'quan_lai' && !isDeclined) {
      return 'Đang theo học gia sư';
    }
    return 'Đang theo học thầy đồ';
  }

  const edu = state.stats.education;
  if (age < 6 && edu < 5) return 'Chưa đi học';
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
  if (state.livelihoodStatus === 'prison' || state.livelihoodStatus === 'homemaker' || state.livelihoodStatus === 'retired') {
    return false;
  }
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
  if (state.livelihoodStatus === 'prison' || state.flags.includes('dang_o_tu')) return 'Trong tù';
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

  if (state.isStudent || state.livelihoodStatus === 'student') return 'Đang theo học';
  if (state.livelihoodStatus === 'homemaker') return 'Nội trợ';
  if (state.livelihoodStatus === 'retired') return 'Nghỉ hưu';

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

/**
 * Computes feudal income percentile label (1in8b-style "Vị trí thu nhập").
 */
export function getFeudalIncomeRankLabel(annualIncomeCopper: number): string {
  if (annualIncomeCopper >= 50000) return 'Bản hạt: top 1% · Thiên hạ: top 1%';
  if (annualIncomeCopper >= 20000) return 'Bản hạt: top 3% · Thiên hạ: top 5%';
  if (annualIncomeCopper >= 10000) return 'Bản hạt: top 8% · Thiên hạ: top 12%';
  if (annualIncomeCopper >= 5000) return 'Bản hạt: top 18% · Thiên hạ: top 25%';
  if (annualIncomeCopper >= 2500) return 'Bản hạt: top 35% · Thiên hạ: top 45%';
  if (annualIncomeCopper >= 1000) return 'Bản hạt: top 60% · Thiên hạ: top 65%';
  if (annualIncomeCopper > 0) return 'Bản hạt: top 85% · Thiên hạ: top 85%';
  return 'Chưa có thu nhập';
}

/**
 * Derives personal possessions ("Những thứ bạn có") from assets, rank, and stats.
 */
export function getPersonalPossessions(state: ActiveLifeState): string[] {
  const items: string[] = [];
  if (state.officialRank > 0) items.push('Ấn tín · Quan phục triều đình');
  if ((state.assets.goldReserveCopper ?? 0) > 0) items.push('Vàng ròng tích trữ');
  if (state.assets.rice >= 30) items.push(`Kho thóc (${Math.floor(state.assets.rice)} đấu)`);
  if (state.stats.education >= 30 || (state.eduLevel ?? 0) >= 3) items.push('Sách vở kinh sử · Bút nghiên');
  if (state.stats.martial >= 30) items.push('Binh khí phòng thân');
  if (state.assets.housing === 'phu_de') items.push('Đồ cổ & Gia bảo phủ đệ');
  if (state.activeVenture) items.push('Sổ sách thương hội');
  return items;
}

/**
 * Derives feudal transport mode ("Phương tiện đi lại") from rank, housing, and wealth.
 */
export function getFeudalTransportLabel(state: ActiveLifeState): string {
  if (state.officialRank >= 5 || (state.profile.originClass === 'hoang_toc' && state.assets.housing === 'phu_de')) {
    return 'Kiệu bát cống · Có lính hầu mở đường';
  }
  if (state.officialRank >= 3 || state.assets.housing === 'phu_de' || state.assets.wealthCopper >= 20000) {
    return 'Kiệu bốn người khiêng · Đi lại nhàn nhã';
  }
  if (
    state.assets.wealthCopper >= 5000 ||
    state.profile.originClass === 'quan_lai' ||
    state.profile.originClass === 'hoang_toc'
  ) {
    return 'Ngựa tốt · Yên cương đầy đủ';
  }
  if (state.assets.housing === 'nha_gach' || state.assets.wealthCopper >= 1200) {
    return 'Xe bò / Xe ngựa thuê · Đi làm mất nửa canh giờ';
  }
  return 'Đi bộ · Chân đất hoặc guốc mộc';
}
