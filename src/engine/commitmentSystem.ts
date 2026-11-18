import {
  getAgeYears,
  type ActiveCommitment,
  type ActiveLifeState,
  type OriginClass,
  type TimeSlot,
} from '../types/activeLife';
import type { EffectSpec } from '../types/dsl';
import { formatCopper } from './economy';
import { appendLog, applyEffects } from './effectApplier';

export interface CommitmentOption {
  id: string;
  stage: 'childhood' | 'adulthood' | 'any';
  category: ActiveCommitment['category'];
  title: string;
  description: string;
  durationDays: number;
  durationLabel: string;
  costCopper: number;
  lockedSlots: TimeSlot[];
  dailyActionId?: string;
  childhoodFocus?: string;
  rewardSummary: string;
  passSummary?: string;
  minAge: number;
  maxAge?: number;
  originIn?: OriginClass[];
  /** Conditions required for this course/career to even appear in the catalog */
  appearIf?: (state: ActiveLifeState, age: number, declined: boolean) => boolean;
  /** Additional readiness check when visible (shows lock reason if false) */
  forbidFlags?: string[];
  minEducation?: number;
  minMartial?: number;
  minCraftTrade?: number;
  forbidDeclined?: boolean;
  startEffects?: EffectSpec;
  completionEffects?: ActiveCommitment['completionEffects'];
  completionMessage: string;
  passCondition?: ActiveCommitment['passCondition'];
  failEffects?: ActiveCommitment['failEffects'];
  failMessage?: string;
  abandonPenalty?: ActiveCommitment['abandonPenalty'];
}

export interface EvaluatedCommitmentOption {
  option: CommitmentOption;
  eligible: boolean;
  reason?: string;
}

const STAT_LABELS: Record<'education' | 'martial' | 'craftTrade', string> = {
  education: 'Học thức',
  martial: 'Võ nghệ',
  craftTrade: 'Thương tài / Tay nghề',
};

function isFamilyDeclined(state: ActiveLifeState): boolean {
  const tier = state.family?.familyLivingTier;
  return (
    tier === 'tung_thieu' ||
    state.flags.includes('gia_toc_sa_sut') ||
    state.flags.includes('that_sung_cung_dinh')
  );
}

export const COMMITMENT_CATALOG: CommitmentOption[] = [
  // ================= BẬC KHAI TÂM & VÕ ĐƯỜNG (6 - 14 tuổi) =================
  {
    id: 'commit_edu_khai_tam',
    stage: 'any',
    category: 'study',
    title: 'Khai Tâm — Lớp Thầy Đồ Làng',
    description:
      'Theo học vỡ lòng Tam Tự Kinh, Minh Tâm Bảo Giám và tập viết chữ Hán suốt 1 năm. Phải đạt ngưỡng Học thức tối thiểu mới qua kỳ khảo hạch.',
    durationDays: 360,
    durationLabel: '1 năm (360 ngày)',
    costCopper: 220,
    lockedSlots: [],
    childhoodFocus: 'hoc_tap',
    rewardSummary: 'Đỗ Khai Tâm: Học thức +6, Danh vọng +3, mở khóa Trường Phủ Huyện',
    passSummary: 'Điều kiện đỗ cuối khóa: Học thức ≥ 16',
    minAge: 6,
    maxAge: 18,
    appearIf: (state) => !state.flags.includes('da_khai_tam'),
    passCondition: { stat: 'education', min: 16 },
    completionEffects: {
      education: 6,
      fame: 3,
      add_flags: ['da_khai_tam'],
      add_interests: ['kinh_su'],
      milestone_title: 'Đỗ bậc Khai Tâm lớp thầy đồ',
    },
    completionMessage: 'Chúc mừng! Bạn vượt qua kỳ khảo hạch của thầy đồ và chính thức hoàn thành bậc Khai Tâm.',
    failEffects: { happiness: -5 },
    failMessage: 'Chưa đủ sức học: Kết thúc khóa Khai Tâm nhưng Học thức chưa đạt 16 nên bạn bị trượt kỳ khảo hạch.',
  },
  {
    id: 'commit_edu_danh_su_nhi_dong',
    stage: 'childhood',
    category: 'study',
    title: 'Tư Thục Danh Sư · Gia Học Thế Gia',
    description:
      'Mời danh sư về phủ kèm cặp riêng hoặc vào lớp quý tộc suốt 1 năm. Học phí đắt đỏ nhưng nền tảng học vấn vượt trội.',
    durationDays: 360,
    durationLabel: '1 năm (360 ngày)',
    costCopper: 550,
    lockedSlots: [],
    childhoodFocus: 'hoc_tap',
    rewardSummary: 'Đỗ xuất sắc: Học thức +10, Danh vọng +5, mở khóa Trường Phủ Huyện',
    passSummary: 'Điều kiện đỗ cuối khóa: Học thức ≥ 24',
    minAge: 6,
    maxAge: 12,
    originIn: ['dia_chu', 'quan_lai', 'hoang_toc'],
    appearIf: (state, _age, declined) => !declined && !state.flags.includes('da_khai_tam'),
    forbidDeclined: true,
    passCondition: { stat: 'education', min: 24 },
    completionEffects: {
      education: 10,
      fame: 5,
      add_flags: ['da_khai_tam', 'duoc_danh_su_de_cu'],
      add_interests: ['kinh_su'],
      milestone_title: 'Hoàn thành xuất sắc Tư Thục Danh Sư',
    },
    completionMessage: 'Danh sư gật đầu tán thưởng: bạn hoàn thành xuất sắc bậc Khai Tâm với nền tảng kinh sử vững chắc.',
    failEffects: { happiness: -6, fame: -2 },
    failMessage: 'Kết thúc 1 năm học nhưng Học thức chưa đạt 24 — danh sư lắc đầu bảo bạn cần rèn thêm mới tiến lên được.',
  },
  {
    id: 'commit_child_vo_duong',
    stage: 'childhood',
    category: 'craft',
    title: 'Võ Đường Nhập Môn',
    description:
      'Ghi danh luyện tập gân cốt, quyền cước căn bản suốt 1 năm tại võ đường (hoặc võ sư trong phủ).',
    durationDays: 360,
    durationLabel: '1 năm (360 ngày)',
    costCopper: 200,
    lockedSlots: [],
    childhoodFocus: 'ren_vo',
    rewardSummary: 'Võ nghệ +7, Danh vọng +2, mở khóa Binh Pháp Cao Cấp sau này',
    passSummary: 'Điều kiện qua khóa: Võ nghệ ≥ 12',
    minAge: 7,
    maxAge: 12,
    appearIf: (state) => !state.flags.includes('da_luyen_vo_nhap_mon'),
    passCondition: { stat: 'martial', min: 12 },
    completionEffects: {
      martial: 7,
      fame: 2,
      add_flags: ['da_luyen_vo_nhap_mon'],
      add_interests: ['vo_nghe'],
      milestone_title: 'Tốt nghiệp Võ Đường Nhập Môn',
    },
    completionMessage: 'Hoàn thành 1 năm khổ luyện, bạn vượt qua bài sát hạch và chính thức xuất sư Võ Đường Nhập Môn.',
    failEffects: { happiness: -4 },
    failMessage: 'Thể lực và chiêu thức chưa đạt (Võ nghệ < 12), bạn chưa qua được bài sát hạch xuất sư.',
  },

  // ================= BẬC TRUNG HỌC / ĐẠI HỌC PHONG KIẾN & TAY NGHỀ (13+ tuổi) =================
  {
    id: 'commit_adult_truong_phu_huyen',
    stage: 'adulthood',
    category: 'study',
    title: 'Trường Phủ Huyện · Ôn Luyện Khóa Sinh',
    description:
      'Khóa học chính quy 6 tháng (khóa buổi Sáng) luyện kinh nghĩa, văn sách để chuẩn bị dự Thi Hương.',
    durationDays: 180,
    durationLabel: '6 tháng (180 ngày)',
    costCopper: 400,
    lockedSlots: ['morning'],
    dailyActionId: 'act_bai_danh_su',
    rewardSummary: 'Đỗ Khóa Sinh: Học thức +10, Danh vọng +5, mở khóa Quốc Tử Giám',
    passSummary: 'Điều kiện đỗ cuối khóa: Học thức ≥ 38',
    minAge: 13,
    appearIf: (state) =>
      !state.flags.includes('da_hoc_truong_huyen') &&
      (state.flags.includes('da_khai_tam') || state.stats.education >= 20),
    forbidFlags: ['bi_ep_lam_gia_no', 'trong_quan_ngu', 'thai_giam', 'trong_hau_cung'],
    passCondition: { stat: 'education', min: 38 },
    completionEffects: {
      education: 10,
      fame: 5,
      add_flags: ['da_hoc_truong_huyen'],
      add_interests: ['kinh_su'],
      milestone_title: 'Đỗ kỳ khảo hạch Trường Phủ Huyện',
    },
    completionMessage: 'Bạn vượt qua kỳ sát hạch cuối khóa tại Trường Phủ Huyện, đủ tư cách bước vào hàng Khóa sinh!',
    failEffects: { happiness: -6, fame: -2 },
    failMessage: 'Bài văn sách cuối khóa chưa đạt (Học thức < 38), bạn bị đánh trượt khỏi danh sách Khóa sinh.',
    abandonPenalty: { fame: -3, happiness: -5 },
  },
  {
    id: 'commit_adult_quoc_tu_giam',
    stage: 'adulthood',
    category: 'study',
    title: 'Quốc Tử Giám · Đại Nho Kinh Thành',
    description:
      'Bậc học cao nhất của triều đình (1 năm, khóa Sáng & Chiều). Chỉ nhận sĩ tử đã qua Trường Phủ Huyện, đỗ Cử nhân, hoặc con cháu Hoàng tộc.',
    durationDays: 360,
    durationLabel: '1 năm (360 ngày)',
    costCopper: 1200,
    lockedSlots: ['morning', 'afternoon'],
    dailyActionId: 'act_bai_danh_su',
    rewardSummary: 'Học thức +16, Danh vọng +10, danh hiệu Môn sinh Quốc Tử Giám',
    passSummary: 'Điều kiện tốt nghiệp: Học thức ≥ 62',
    minAge: 16,
    appearIf: (state, _age, declined) =>
      !state.flags.includes('mon_sinh_quoc_tu_giam') &&
      (state.flags.includes('da_hoc_truong_huyen') ||
        state.flags.includes('do_cu_nhan') ||
        (state.profile.originClass === 'hoang_toc' && !declined)),
    forbidFlags: ['bi_ep_lam_gia_no', 'trong_quan_ngu', 'thai_giam', 'trong_hau_cung'],
    passCondition: { stat: 'education', min: 62 },
    completionEffects: {
      education: 16,
      fame: 10,
      relationships: 6,
      add_flags: ['mon_sinh_quoc_tu_giam'],
      add_interests: ['kinh_su'],
      milestone_title: 'Tốt nghiệp Quốc Tử Giám Kinh Thành',
    },
    completionMessage: 'Vượt qua kỳ bình văn khắc nghiệt, bạn chính thức trở thành Môn sinh ưu tú của Quốc Tử Giám!',
    failEffects: { happiness: -8, fame: -4 },
    failMessage: 'Kỳ thi tốt nghiệp Quốc Tử Giám quá khắt khe (Học thức < 62), bạn đành ngậm ngùi thi trượt.',
    abandonPenalty: { fame: -6, happiness: -6 },
  },
  {
    id: 'commit_adult_hoc_nghe_phuong_hoi',
    stage: 'adulthood',
    category: 'craft',
    title: 'Học Nghề & Thương Mại Phường Hội',
    description:
      'Theo học nghề thủ công và sổ sách buôn bán trong 6 tháng (khóa buổi Sáng) để trở thành thợ lành nghề.',
    durationDays: 180,
    durationLabel: '6 tháng (180 ngày)',
    costCopper: 200,
    lockedSlots: ['morning'],
    dailyActionId: 'act_buon_ban_nho',
    rewardSummary: 'Thương tài +8, Bạc 300đ, mở khóa Bậc Thầy Phường Hội',
    passSummary: 'Điều kiện xuất sư: Thương tài / Tay nghề ≥ 18',
    minAge: 13,
    appearIf: (state) =>
      !state.flags.includes('tho_lanh_nghe') &&
      (state.profile.originClass === 'thu_cong' || state.stats.craftTrade >= 8),
    forbidFlags: ['bi_ep_lam_gia_no', 'trong_quan_ngu', 'thai_giam', 'trong_hau_cung'],
    passCondition: { stat: 'craftTrade', min: 18 },
    completionEffects: {
      craft_trade: 8,
      copper: 300,
      add_flags: ['tho_lanh_nghe'],
      add_interests: ['thuong_buon'],
      milestone_title: 'Xuất sư Thợ lành nghề Phường hội',
    },
    completionMessage: 'Bạn đã vượt qua kỳ kiểm tra tay nghề, chính thức được Phường hội công nhận là Thợ lành nghề!',
    failEffects: { happiness: -4 },
    failMessage: 'Tay nghề chưa vững (Thương tài < 18), trưởng phường chưa cho phép bạn xuất sư.',
    abandonPenalty: { happiness: -4 },
  },
  {
    id: 'commit_adult_bac_thay_phuong_hoi',
    stage: 'adulthood',
    category: 'craft',
    title: 'Nâng Cao Tay Nghề · Bậc Thầy Phường Hội',
    description:
      'Khóa đào tạo tinh hoa dành riêng cho người đã xuất sư (6 tháng, khóa buổi Sáng) để làm chủ thương hiệu và kỹ nghệ cao cấp.',
    durationDays: 180,
    durationLabel: '6 tháng (180 ngày)',
    costCopper: 650,
    lockedSlots: ['morning'],
    dailyActionId: 'act_buon_ban_nho',
    rewardSummary: 'Thương tài +14, Danh vọng +6, Bạc 900đ',
    passSummary: 'Điều kiện đạt chuẩn: Thương tài / Tay nghề ≥ 42',
    minAge: 16,
    appearIf: (state) =>
      state.flags.includes('tho_lanh_nghe') &&
      !state.flags.includes('bac_thay_phuong_hoi') &&
      state.stats.craftTrade >= 25,
    forbidFlags: ['bi_ep_lam_gia_no', 'trong_quan_ngu', 'thai_giam', 'trong_hau_cung'],
    passCondition: { stat: 'craftTrade', min: 42 },
    completionEffects: {
      craft_trade: 14,
      fame: 6,
      copper: 900,
      add_flags: ['bac_thay_phuong_hoi'],
      add_interests: ['thuong_buon'],
      milestone_title: 'Đạt danh hiệu Bậc thầy Phường hội',
    },
    completionMessage: 'Tác phẩm sát hạch của bạn khiến các lão nghệ nhân kinh ngạc — bạn chính thức đạt danh hiệu Bậc thầy Phường hội!',
    failEffects: { happiness: -6 },
    failMessage: 'Chế tác cuối khóa chưa đạt độ tinh xảo (Thương tài < 42), bạn lỡ hẹn với danh hiệu Bậc thầy.',
    abandonPenalty: { fame: -3, happiness: -5 },
  },
  {
    id: 'commit_adult_binh_phap_cao_cap',
    stage: 'adulthood',
    category: 'craft',
    title: 'Khóa Binh Pháp & Kỵ Xạ Cao Cấp',
    description:
      'Rèn luyện trận pháp, cung mã chuyên sâu trong 6 tháng (khóa buổi Sáng) dành cho người có căn cơ võ nghệ hoặc xuất thân tướng môn.',
    durationDays: 180,
    durationLabel: '6 tháng (180 ngày)',
    costCopper: 500,
    lockedSlots: ['morning'],
    dailyActionId: 'act_luyen_vo_cong',
    rewardSummary: 'Võ nghệ +12, Danh vọng +5, flag Thông thạo binh pháp',
    passSummary: 'Điều kiện đạt chuẩn: Võ nghệ ≥ 35',
    minAge: 16,
    appearIf: (state) =>
      !state.flags.includes('thong_thao_binh_phap') &&
      (state.flags.includes('da_luyen_vo_nhap_mon') ||
        state.stats.martial >= 22 ||
        state.family?.fatherOccupation === 'quan_vo'),
    forbidFlags: ['bi_ep_lam_gia_no', 'thai_giam', 'trong_hau_cung'],
    passCondition: { stat: 'martial', min: 35 },
    completionEffects: {
      martial: 12,
      fame: 5,
      add_flags: ['thong_thao_binh_phap'],
      add_interests: ['vo_nghe'],
      milestone_title: 'Thông thạo Binh pháp & Kỵ xạ',
    },
    completionMessage: 'Bạn vượt qua bài diễn võ tổng hợp và thông thạo binh pháp trận đồ!',
    failEffects: { happiness: -5 },
    failMessage: 'Võ nghệ chưa đạt ngưỡng 35 nên bạn chưa qua được kỳ sát hạch binh pháp.',
    abandonPenalty: { fame: -3, happiness: -4 },
  },
  {
    id: 'commit_adult_military_enlist',
    stage: 'adulthood',
    category: 'military',
    title: 'Tòng Quân Nhập Ngũ (Kỳ hạn 1 năm)',
    description:
      'Đầu quân vào quân ngũ triều đình suốt 1 năm (khóa Sáng & Chiều). Phải hoàn thành đủ kỳ hạn mới được giải ngũ trong danh dự.',
    durationDays: 360,
    durationLabel: '1 năm (360 ngày)',
    costCopper: 0,
    lockedSlots: ['morning', 'afternoon'],
    dailyActionId: 'act_tuan_tra_quan_ngu',
    rewardSummary: 'Võ nghệ +12, Danh vọng +8, Bạc thưởng 800đ khi giải ngũ',
    minAge: 16,
    maxAge: 45,
    appearIf: (state) =>
      state.stats.health >= 50 &&
      !state.flags.includes('trong_quan_ngu') &&
      !state.flags.includes('dang_lam_quan') &&
      !state.flags.includes('thai_giam') &&
      !state.flags.includes('trong_hau_cung') &&
      !state.flags.includes('nghe_ky_thanh_lau'),
    forbidFlags: ['bi_ep_lam_gia_no'],
    startEffects: {
      add_flags: ['trong_quan_ngu'],
      milestone_title: 'Tòng quân nhập ngũ',
    },
    completionEffects: {
      martial: 12,
      fame: 8,
      copper: 800,
      remove_flags: ['trong_quan_ngu'],
      add_interests: ['vo_nghe'],
      milestone_title: 'Hoàn thành kỳ hạn quân ngũ, vinh quy giải ngũ',
    },
    completionMessage: 'Bạn đã hoàn thành trọn vẹn 1 năm kỳ hạn quân ngũ, được ban thưởng 800 đồng và giải ngũ trong danh dự.',
    abandonPenalty: {
      fame: -12,
      happiness: -8,
      remove_flags: ['trong_quan_ngu'],
    },
  },
];

export function getAvailableCommitments(state: ActiveLifeState): EvaluatedCommitmentOption[] {
  const age = getAgeYears(state.profile.totalDays);
  const targetStage: CommitmentOption['stage'] = age < 13 ? 'childhood' : 'adulthood';
  const availableCopper =
    age < 13 ? (state.family?.familyWealthCopper ?? state.assets.wealthCopper) : state.assets.wealthCopper;
  const declined = isFamilyDeclined(state);

  return COMMITMENT_CATALOG.filter((opt) => {
    if (opt.stage !== 'any' && opt.stage !== targetStage) return false;
    if (opt.originIn && !opt.originIn.includes(state.profile.originClass)) return false;
    if (opt.appearIf && !opt.appearIf(state, age, declined)) return false;
    return true;
  }).map((opt) => {
    if (age < opt.minAge) {
      return { option: opt, eligible: false, reason: `Cần từ ${opt.minAge} tuổi trở lên` };
    }
    if (opt.maxAge !== undefined && age > opt.maxAge) {
      return { option: opt, eligible: false, reason: `Chỉ phù hợp đến ${opt.maxAge} tuổi` };
    }
    if (opt.forbidDeclined && declined) {
      return {
        option: opt,
        eligible: false,
        reason: 'Gia đạo hiện đang sa sút / thất sủng, không còn điều kiện theo học diện này',
      };
    }
    if (opt.forbidFlags?.some((f) => state.flags.includes(f))) {
      return {
        option: opt,
        eligible: false,
        reason: 'Thân phận hoặc trạng thái hiện tại không cho phép đăng ký',
      };
    }
    if (opt.minEducation !== undefined && state.stats.education < opt.minEducation) {
      return {
        option: opt,
        eligible: false,
        reason: `Cần Học thức tối thiểu ${opt.minEducation} (hiện có ${Math.round(state.stats.education)})`,
      };
    }
    if (opt.minMartial !== undefined && state.stats.martial < opt.minMartial) {
      return {
        option: opt,
        eligible: false,
        reason: `Cần Võ nghệ tối thiểu ${opt.minMartial}`,
      };
    }
    if (opt.minCraftTrade !== undefined && state.stats.craftTrade < opt.minCraftTrade) {
      return {
        option: opt,
        eligible: false,
        reason: `Cần Thương tài / Tay nghề tối thiểu ${opt.minCraftTrade}`,
      };
    }
    if (availableCopper < opt.costCopper) {
      return {
        option: opt,
        eligible: false,
        reason: `Thiếu ngân lượng (cần ${formatCopper(opt.costCopper)})`,
      };
    }
    return { option: opt, eligible: true };
  });
}

function addCommitmentLog(
  state: ActiveLifeState,
  text: string,
  tone: 'positive' | 'negative' | 'milestone',
): ActiveLifeState {
  const category = getAgeYears(state.profile.totalDays) < 13 ? 'childhood' : 'study';
  return {
    ...state,
    logs: appendLog(state.logs, state.profile.totalDays, category, text, { tone }),
  };
}

export function startCommitment(state: ActiveLifeState, optionId: string): ActiveLifeState {
  if (state.activeCommitment) return state;
  const evaluated = getAvailableCommitments(state).find((item) => item.option.id === optionId);
  if (!evaluated || !evaluated.eligible) return state;

  const opt = evaluated.option;
  const age = getAgeYears(state.profile.totalDays);
  let next = state;

  if (opt.costCopper > 0) {
    if (age < 13 && next.family) {
      next = applyEffects(next, { family_copper: -opt.costCopper });
    } else {
      next = applyEffects(next, { copper: -opt.costCopper });
    }
  }

  if (opt.startEffects) {
    next = applyEffects(next, opt.startEffects);
  }

  const commitment: ActiveCommitment = {
    id: opt.id,
    title: opt.title,
    category: opt.category,
    totalDays: opt.durationDays,
    remainingDays: opt.durationDays,
    lockedSlots: [...opt.lockedSlots],
    dailyActionId: opt.dailyActionId,
    childhoodFocus: opt.childhoodFocus,
    completionEffects: opt.completionEffects,
    completionMessage: opt.completionMessage,
    passCondition: opt.passCondition,
    failEffects: opt.failEffects,
    failMessage: opt.failMessage,
    abandonPenalty: opt.abandonPenalty,
  };

  next = {
    ...next,
    activeCommitment: commitment,
    schedule: opt.childhoodFocus
      ? { ...next.schedule, childhoodFocus: opt.childhoodFocus }
      : next.schedule,
  };

  const costNote = opt.costCopper > 0 ? ` (học phí/chi phí ${formatCopper(opt.costCopper)})` : '';
  return addCommitmentLog(
    next,
    `Đăng ký "${opt.title}" — thời hạn ${opt.durationLabel}${costNote}.`,
    'positive',
  );
}

export function completeCommitment(state: ActiveLifeState): ActiveLifeState {
  const current = state.activeCommitment;
  if (!current) return state;

  let next: ActiveLifeState = {
    ...state,
    activeCommitment: null,
  };

  if (current.passCondition) {
    const statVal = next.stats[current.passCondition.stat] ?? 0;
    if (statVal < current.passCondition.min) {
      if (current.failEffects) {
        next = applyEffects(next, current.failEffects);
      }
      const statName = STAT_LABELS[current.passCondition.stat];
      const msg =
        current.failMessage ||
        `Chưa đạt yêu cầu (${statName} ${Math.round(statVal)}/${current.passCondition.min}): trượt kỳ khảo hạch cuối khóa "${current.title}".`;
      return addCommitmentLog(next, msg, 'negative');
    }
  }

  if (current.completionEffects) {
    next = applyEffects(next, current.completionEffects);
  }

  return addCommitmentLog(
    next,
    current.completionMessage || `Đã hoàn thành "${current.title}".`,
    'milestone',
  );
}

export function tickCommitmentDays(state: ActiveLifeState, days: number): ActiveLifeState {
  const current = state.activeCommitment;
  if (!current || days <= 0) return state;

  const remainingDays = current.remainingDays - days;
  if (remainingDays <= 0) {
    return completeCommitment(state);
  }

  return {
    ...state,
    activeCommitment: {
      ...current,
      remainingDays,
    },
  };
}

export function abandonCommitment(state: ActiveLifeState): ActiveLifeState {
  const current = state.activeCommitment;
  if (!current) return state;

  let next: ActiveLifeState = {
    ...state,
    activeCommitment: null,
  };

  if (current.abandonPenalty) {
    next = applyEffects(next, current.abandonPenalty);
  }

  return addCommitmentLog(
    next,
    `Bạn đã bỏ dở "${current.title}" khi vẫn còn ${current.remainingDays} ngày.`,
    'negative',
  );
}

export function markLearningAgePrompted(state: ActiveLifeState, age: number): ActiveLifeState {
  const prev = state.promptedLearningAges ?? [];
  if (prev.includes(age)) return state;
  return {
    ...state,
    promptedLearningAges: [...prev, age],
  };
}
