import {
  getAgeYears,
  type ActiveLifeState,
  type CareerTrack,
  type OriginClass,
  type TimeSlot,
} from '../types/activeLife';
import { formatCopper } from './economy';
import { appendLog, applyEffects } from './effectApplier';
import { mulberry32Next } from './prng';

export const CAREER_TRACK_LABELS: Record<CareerTrack, string> = {
  labor: 'Nông lâm · Lao động',
  craft: 'Thủ công · Phường hội',
  trade: 'Thương mại · Chợ búa',
  scholar: 'Văn thư · Sư phạm · Y thuật',
  martial: 'Võ nghệ · Bảo tiêu',
  underworld: 'Đường ngầm · Giang hồ',
};

export interface CareerRequirement {
  minEducation?: number;
  minMartial?: number;
  minCraftTrade?: number;
  minFame?: number;
  minInfamy?: number;
  minRelationships?: number;
  minTrackXp?: number;
  requiredFlags?: string[];
  /** Alternative social/origin unlock path (e.g. high affinity NPC or peer connection) */
  socialShortcut?: {
    label: string;
    minRelationships?: number;
    requiresLivingNpcAffinity?: number;
    requiresPeerOrigin?: OriginClass[];
    requiresOriginIn?: OriginClass[];
    requiredFlags?: string[];
    minEducation?: number;
    minMartial?: number;
    minCraftTrade?: number;
  };
}

export interface CareerJobDef {
  id: string;
  title: string;
  track: CareerTrack;
  tier: 1 | 2 | 3;
  slots: TimeSlot[];
  dailyActionId: string;
  flagId?: string;
  baseDailyCopper: number;
  baseDailyRice?: number;
  description: string;
  unlockSummary: string;
  minAge: number;
  maxAge?: number;
  forbidFlags?: string[];
  requirements: CareerRequirement;
  promoteToJobId?: string;
  promoteMinDays?: number;
  pivotJobIds?: string[];
  spinoffVentureId?: string;
}

export interface EvaluatedCareerOption {
  job: CareerJobDef;
  eligible: boolean;
  unlockedVia?: string;
  lockReason?: string;
  slotConflictReason?: string;
  isCurrent: boolean;
}

export interface VentureDef {
  id: string;
  title: string;
  track: CareerTrack;
  capitalCopper: number;
  upgradeBaseCopper: number;
  slots: TimeSlot[];
  dailyActionId: string;
  flagId: string;
  baseDailyCopper: number;
  baseDailyRice?: number;
  description: string;
  minAge: number;
  minEducation?: number;
  minCraftTrade?: number;
  relatedCareerIds: string[];
}

export interface EvaluatedVentureOption {
  venture: VentureDef;
  effectiveCapitalCopper: number;
  hasSpinoffDiscount: boolean;
  eligible: boolean;
  lockReason?: string;
  slotConflictReason?: string;
  isCurrent: boolean;
}

export const CAREER_CATALOG: CareerJobDef[] = [
  // ===== NHÁNH VĂN THƯ · SƯ PHẠM · Y THUẬT =====
  {
    id: 'job_chep_kinh',
    title: 'Chép kinh sách · Viết thư thuê',
    track: 'scholar',
    tier: 1,
    slots: ['morning', 'afternoon'],
    dailyActionId: 'act_chep_kinh_cung_dinh',
    baseDailyCopper: 12,
    description: 'Chép kinh sử, viết liễn hoặc thư từ thuê. Phù hợp sĩ tử nghèo hoặc con quan sa sút.',
    unlockSummary: 'Học thức ≥ 12 (hoặc xuất thân Quan lại / Hoàng tộc có Học thức ≥ 8)',
    minAge: 13,
    forbidFlags: ['bi_ep_lam_gia_no', 'thai_giam', 'trong_hau_cung'],
    requirements: {
      minEducation: 12,
      socialShortcut: {
        label: 'Xuất thân thư hương (Học thức ≥ 8)',
        requiresOriginIn: ['quan_lai', 'hoang_toc', 'dia_chu'],
        minEducation: 8,
      },
    },
    promoteToJobId: 'job_thu_lai',
    pivotJobIds: ['job_thay_lang'],
  },
  {
    id: 'job_thu_lai',
    title: 'Thư lại giữ sổ sách',
    track: 'scholar',
    tier: 2,
    slots: ['morning', 'afternoon'],
    dailyActionId: 'act_career_thu_lai',
    flagId: 'career_thu_lai',
    baseDailyCopper: 20,
    description: 'Giữ sổ sách công nợ cho cửa hiệu hoặc nha môn địa phương.',
    unlockSummary: 'Học thức ≥ 20 & Thương tài ≥ 8 (hoặc Quan hệ ≥ 55 + Học thức ≥ 14)',
    minAge: 14,
    forbidFlags: ['bi_ep_lam_gia_no', 'thai_giam', 'trong_hau_cung'],
    requirements: {
      minEducation: 20,
      minCraftTrade: 8,
      socialShortcut: {
        label: 'Người quen tiến cử (Quan hệ ≥ 55 & Học thức ≥ 14)',
        minRelationships: 55,
        minEducation: 14,
      },
    },
    promoteToJobId: 'job_thay_do',
    pivotJobIds: ['job_chao_hang', 'job_chuong_quy'],
    spinoffVentureId: 'venture_sap_cho',
  },
  {
    id: 'job_thay_do',
    title: 'Thầy đồ dạy chữ trẻ làng',
    track: 'scholar',
    tier: 3,
    slots: ['morning', 'afternoon'],
    dailyActionId: 'act_career_thay_do',
    flagId: 'career_thay_do',
    baseDailyCopper: 28,
    description: 'Mở lớp dạy vỡ lòng cho trẻ em quanh vùng, giữ nếp thanh cao.',
    unlockSummary: 'Học thức ≥ 26 (hoặc Thanh danh ≥ 12 & Học thức ≥ 18)',
    minAge: 15,
    forbidFlags: ['bi_ep_lam_gia_no', 'thai_giam', 'trong_hau_cung'],
    requirements: {
      minEducation: 26,
      socialShortcut: {
        label: 'Văn phong uy tín (Học thức ≥ 18)',
        minEducation: 18,
      },
    },
    spinoffVentureId: 'venture_thu_quan',
  },
  {
    id: 'job_thay_lang',
    title: 'Thầy lang bắt mạch · Bốc thuốc',
    track: 'scholar',
    tier: 3,
    slots: ['morning', 'afternoon'],
    dailyActionId: 'act_career_thay_lang',
    flagId: 'career_thay_lang',
    baseDailyCopper: 36,
    description: 'Khám bệnh bốc thuốc cứu dân, vừa có thu nhập cao vừa tăng danh vọng.',
    unlockSummary: 'Học thức ≥ 28',
    minAge: 16,
    forbidFlags: ['bi_ep_lam_gia_no', 'thai_giam', 'trong_hau_cung'],
    requirements: {
      minEducation: 28,
    },
    spinoffVentureId: 'venture_y_quan',
  },

  // ===== NHÁNH THƯƠNG MẠI · CHỢ BÚA =====
  {
    id: 'job_phu_ban_hang',
    title: 'Chạy bàn · Phụ việc cửa hiệu',
    track: 'trade',
    tier: 1,
    slots: ['morning', 'afternoon'],
    dailyActionId: 'act_phu_ban_hang',
    baseDailyCopper: 10,
    description: 'Làm thuê ở quán xá hoặc cửa hiệu, không đòi hỏi vốn hay bằng cấp.',
    unlockSummary: 'Phù hợp mọi xuất thân từ 13 tuổi',
    minAge: 13,
    forbidFlags: ['bi_ep_lam_gia_no', 'thai_giam', 'trong_hau_cung'],
    requirements: {},
    promoteToJobId: 'job_chao_hang',
    promoteMinDays: 180,
    pivotJobIds: ['job_tho_phu', 'job_thu_lai'],
    spinoffVentureId: 'venture_ganh_hang',
  },
  {
    id: 'job_chao_hang',
    title: 'Chạy mối buôn · Giao nhận hàng',
    track: 'trade',
    tier: 2,
    slots: ['morning', 'afternoon'],
    dailyActionId: 'act_career_chao_hang',
    flagId: 'career_chao_hang',
    baseDailyCopper: 18,
    description: 'Chạy hàng giữa các chợ phiên, ăn hoa hồng và tích lũy mối lái.',
    unlockSummary: 'Thương tài ≥ 12 & Quan hệ ≥ 45 (hoặc Đồng niên Thủ công/Địa chủ giới thiệu)',
    minAge: 14,
    forbidFlags: ['bi_ep_lam_gia_no', 'thai_giam', 'trong_hau_cung'],
    requirements: {
      minCraftTrade: 12,
      minRelationships: 45,
      socialShortcut: {
        label: 'Đồng niên nhà buôn tiến cử (Thương tài ≥ 8)',
        requiresPeerOrigin: ['thu_cong', 'dia_chu'],
        minCraftTrade: 8,
      },
    },
    promoteToJobId: 'job_chuong_quy',
    promoteMinDays: 240,
    spinoffVentureId: 'venture_sap_cho',
  },
  {
    id: 'job_chuong_quy',
    title: 'Chưởng quỹ quản lý tiệm buôn',
    track: 'trade',
    tier: 3,
    slots: ['morning', 'afternoon'],
    dailyActionId: 'act_career_chuong_quy',
    flagId: 'career_chuong_quy',
    baseDailyCopper: 38,
    description: 'Thay mặt chủ tiệm điều hành cửa hiệu lớn, lương thưởng rất hậu.',
    unlockSummary: 'Thương tài ≥ 30, Học thức ≥ 15 & Kinh nghiệm buôn bán ≥ 150 ngày',
    minAge: 16,
    forbidFlags: ['bi_ep_lam_gia_no', 'thai_giam', 'trong_hau_cung'],
    requirements: {
      minCraftTrade: 30,
      minEducation: 15,
      minTrackXp: 150,
    },
    spinoffVentureId: 'venture_sap_cho',
  },

  // ===== NHÁNH THỦ CÔNG · PHƯỜNG HỘI =====
  {
    id: 'job_tho_phu',
    title: 'Thợ phụ xưởng thủ công',
    track: 'craft',
    tier: 1,
    slots: ['morning', 'afternoon'],
    dailyActionId: 'act_career_tho_phu',
    flagId: 'career_tho_phu',
    baseDailyCopper: 14,
    description: 'Làm thợ phụ trong xưởng mộc, gốm hoặc rèn của phường hội.',
    unlockSummary: 'Thương tài / Tay nghề ≥ 8 (hoặc xuất thân Thủ công / có Thợ lành nghề)',
    minAge: 13,
    forbidFlags: ['bi_ep_lam_gia_no', 'thai_giam', 'trong_hau_cung'],
    requirements: {
      minCraftTrade: 8,
      socialShortcut: {
        label: 'Xuất thân Nhà Thợ Thủ Công',
        requiresOriginIn: ['thu_cong'],
      },
    },
    promoteToJobId: 'job_tho_ca',
    promoteMinDays: 180,
    spinoffVentureId: 'venture_xuong_nho',
  },
  {
    id: 'job_tho_ca',
    title: 'Thợ cả · Đốc công phường hội',
    track: 'craft',
    tier: 3,
    slots: ['morning', 'afternoon'],
    dailyActionId: 'act_career_tho_ca',
    flagId: 'career_tho_ca',
    baseDailyCopper: 36,
    description: 'Đứng đầu toán thợ chế tác đồ mỹ nghệ cao cấp cho phủ quan.',
    unlockSummary: 'Thương tài / Tay nghề ≥ 36 & Kinh nghiệm nghề ≥ 150 ngày (hoặc flag Bậc thầy phường hội)',
    minAge: 16,
    forbidFlags: ['bi_ep_lam_gia_no', 'thai_giam', 'trong_hau_cung'],
    requirements: {
      minCraftTrade: 36,
      minTrackXp: 150,
      socialShortcut: {
        label: 'Đã đỗ Thợ lành nghề / Bậc thầy Phường hội',
        requiredFlags: ['tho_lanh_nghe'],
        minCraftTrade: 24,
      },
    },
    spinoffVentureId: 'venture_xuong_nho',
  },

  // ===== NHÁNH VÕ NGHỆ · BẢO TIÊU =====
  {
    id: 'job_tuan_dem',
    title: 'Tuần đêm · Canh gác phủ đệ (Buổi tối)',
    track: 'martial',
    tier: 1,
    slots: ['evening'],
    dailyActionId: 'act_career_tuan_dem',
    flagId: 'career_tuan_dem',
    baseDailyCopper: 12,
    description: 'Làm ca tối canh gác phủ lớn hoặc phố chợ — không vướng lịch học/làm ban ngày.',
    unlockSummary: 'Võ nghệ ≥ 6 (hoặc từ 13 tuổi sức khỏe tốt)',
    minAge: 13,
    forbidFlags: ['bi_ep_lam_gia_no', 'thai_giam', 'trong_hau_cung'],
    requirements: { minMartial: 6 },
    promoteToJobId: 'job_bao_tieu',
    promoteMinDays: 180,
  },
  {
    id: 'job_bao_tieu',
    title: 'Hộ vệ thương đoàn · Bảo tiêu',
    track: 'martial',
    tier: 2,
    slots: ['morning', 'afternoon'],
    dailyActionId: 'act_career_bao_tieu',
    flagId: 'career_bao_tieu',
    baseDailyCopper: 26,
    description: 'Áp tải hàng hóa liên vùng, lương cao nhưng đòi hỏi võ nghệ vững.',
    unlockSummary: 'Võ nghệ ≥ 20 (hoặc Võ nghệ ≥ 14 + Kinh nghiệm tuần đêm ≥ 90 ngày)',
    minAge: 16,
    forbidFlags: ['bi_ep_lam_gia_no', 'thai_giam', 'trong_hau_cung'],
    requirements: {
      minMartial: 20,
      socialShortcut: {
        label: 'Kinh nghiệm canh gác (Võ ≥ 14 & KN ≥ 90 ngày)',
        minMartial: 14,
      },
    },
    promoteToJobId: 'job_vo_su',
    promoteMinDays: 240,
  },
  {
    id: 'job_vo_su',
    title: 'Đầu mục tiêu cục · Võ sư',
    track: 'martial',
    tier: 3,
    slots: ['morning', 'afternoon'],
    dailyActionId: 'act_career_vo_su',
    flagId: 'career_vo_su',
    baseDailyCopper: 40,
    description: 'Chỉ huy đội tiêu sư hoặc mở lớp dạy võ cho con nhà võ.',
    unlockSummary: 'Võ nghệ ≥ 38 & Thanh danh ≥ 15 (hoặc Thông thạo binh pháp)',
    minAge: 18,
    forbidFlags: ['bi_ep_lam_gia_no', 'thai_giam', 'trong_hau_cung'],
    requirements: {
      minMartial: 38,
      minFame: 15,
    },
  },

  // ===== NHÁNH NÔNG LÂM · LAO ĐỘNG =====
  {
    id: 'job_nong_vu',
    title: 'Làm thuê cày cấy cho địa chủ',
    track: 'labor',
    tier: 1,
    slots: ['morning', 'afternoon'],
    dailyActionId: 'act_lam_thue_nong_vu',
    baseDailyCopper: 8,
    baseDailyRice: 1,
    description: 'Nhận tiền công lẫn gạo ăn mỗi ngày, cứu đói trực tiếp.',
    unlockSummary: 'Từ 13 tuổi, không yêu cầu chỉ số',
    minAge: 13,
    forbidFlags: ['bi_ep_lam_gia_no', 'thai_giam', 'trong_hau_cung'],
    requirements: {},
    promoteToJobId: 'job_quan_trang',
    spinoffVentureId: 'venture_thue_ruong',
  },
  {
    id: 'job_quan_trang',
    title: 'Quản trang điền địa',
    track: 'labor',
    tier: 3,
    slots: ['morning', 'afternoon'],
    dailyActionId: 'act_career_quan_trang',
    flagId: 'career_quan_trang',
    baseDailyCopper: 32,
    baseDailyRice: 0.8,
    description: 'Thay mặt điền chủ cai quản tá điền và mùa vụ, có cả lương bạc lẫn thóc gạo.',
    unlockSummary: 'Kinh nghiệm nông vụ ≥ 150 ngày & Quan hệ ≥ 55 (hoặc Đồng niên Địa chủ giới thiệu)',
    minAge: 16,
    forbidFlags: ['bi_ep_lam_gia_no', 'thai_giam', 'trong_hau_cung'],
    requirements: {
      minTrackXp: 150,
      minRelationships: 55,
      socialShortcut: {
        label: 'Đồng niên nhà Địa chủ tiến cử (Quan hệ ≥ 48)',
        requiresPeerOrigin: ['dia_chu'],
        minRelationships: 48,
      },
    },
    spinoffVentureId: 'venture_thue_ruong',
  },

  // ===== NHÁNH ĐƯỜNG NGẦM · GIANG HỒ =====
  {
    id: 'job_dau_nau',
    title: 'Đầu nậu chợ đen · Buôn lậu (Buổi tối)',
    track: 'underworld',
    tier: 2,
    slots: ['evening'],
    dailyActionId: 'act_career_dau_nau',
    flagId: 'career_dau_nau',
    baseDailyCopper: 38,
    description: 'Giao dịch hàng cấm ban đêm. Tiền vào như nước nhưng tăng Tai tiếng rất nhanh.',
    unlockSummary: 'Từ 16 tuổi, Thương tài ≥ 15 & (Tai tiếng ≥ 15 hoặc Quan hệ ≥ 55)',
    minAge: 16,
    forbidFlags: ['bi_ep_lam_gia_no', 'thai_giam', 'trong_hau_cung', 'dang_lam_quan'],
    requirements: {
      minCraftTrade: 15,
      minInfamy: 15,
      socialShortcut: {
        label: 'Mối lái ngầm (Quan hệ ≥ 55 & Thương tài ≥ 18)',
        minRelationships: 55,
        minCraftTrade: 18,
      },
    },
  },
];

export const VENTURE_CATALOG: VentureDef[] = [
  {
    id: 'venture_ganh_hang',
    title: 'Gánh hàng rong · Quán nước đầu ngõ',
    track: 'trade',
    capitalCopper: 150,
    upgradeBaseCopper: 250,
    slots: ['morning', 'afternoon'],
    dailyActionId: 'act_venture_ganh_hang',
    flagId: 'venture_ganh_hang',
    baseDailyCopper: 22,
    description: 'Khởi nghiệp vốn siêu nhỏ, tự làm tự ăn ngoài ngõ hoặc chợ phiên.',
    minAge: 13,
    relatedCareerIds: ['job_phu_ban_hang', 'job_chao_hang'],
  },
  {
    id: 'venture_thue_ruong',
    title: 'Canh tác ruộng thuê làm chủ vụ mùa',
    track: 'labor',
    capitalCopper: 250,
    upgradeBaseCopper: 400,
    slots: ['morning', 'afternoon'],
    dailyActionId: 'act_venture_thue_ruong',
    flagId: 'venture_thue_ruong',
    baseDailyCopper: 24,
    baseDailyRice: 1.2,
    description: 'Thuê ruộng tự canh tác, vừa thu tiền bán nông sản vừa có gạo dư ăn.',
    minAge: 14,
    relatedCareerIds: ['job_nong_vu', 'job_quan_trang'],
  },
  {
    id: 'venture_sap_cho',
    title: 'Sạp chợ · Tiệm buôn nhỏ',
    track: 'trade',
    capitalCopper: 600,
    upgradeBaseCopper: 800,
    slots: ['morning', 'afternoon'],
    dailyActionId: 'act_venture_sap_cho',
    flagId: 'venture_sap_cho',
    baseDailyCopper: 36,
    description: 'Mở sạp cố định giữa chợ huyện buôn vải vóc, gia vị và hàng khô.',
    minAge: 14,
    minCraftTrade: 10,
    relatedCareerIds: ['job_chao_hang', 'job_chuong_quy', 'job_thu_lai'],
  },
  {
    id: 'venture_thu_quan',
    title: 'Thư quán dạy chữ tại gia',
    track: 'scholar',
    capitalCopper: 500,
    upgradeBaseCopper: 700,
    slots: ['morning', 'afternoon'],
    dailyActionId: 'act_venture_thu_quan',
    flagId: 'venture_thu_quan',
    baseDailyCopper: 38,
    description: 'Tự mở lớp tư thục nhận học trò, tăng nhanh Học thức và Thanh danh.',
    minAge: 16,
    minEducation: 24,
    relatedCareerIds: ['job_thay_do', 'job_chep_kinh'],
  },
  {
    id: 'venture_xuong_nho',
    title: 'Xưởng thủ công gia đình',
    track: 'craft',
    capitalCopper: 900,
    upgradeBaseCopper: 1100,
    slots: ['morning', 'afternoon'],
    dailyActionId: 'act_venture_xuong_nho',
    flagId: 'venture_xuong_nho',
    baseDailyCopper: 42,
    description: 'Mở xưởng riêng nhận đơn chế tác mộc/gốm/rèn bán cho thương lái.',
    minAge: 15,
    minCraftTrade: 18,
    relatedCareerIds: ['job_tho_phu', 'job_tho_ca'],
  },
  {
    id: 'venture_y_quan',
    title: 'Y quán tế dân tại gia',
    track: 'scholar',
    capitalCopper: 1100,
    upgradeBaseCopper: 1200,
    slots: ['morning', 'afternoon'],
    dailyActionId: 'act_venture_y_quan',
    flagId: 'venture_y_quan',
    baseDailyCopper: 45,
    description: 'Mở tiệm thuốc riêng bắt mạch cứu người, danh lợi song toàn.',
    minAge: 16,
    minEducation: 26,
    relatedCareerIds: ['job_thay_lang'],
  },
];

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
      // Up to +40% salary bonus from track experience (at 400 days)
      mult += Math.min(0.4, xp / 1000);
    }
  }

  if (state.activeVenture) {
    const venture = VENTURE_CATALOG.find((v) => v.id === state.activeVenture!.ventureId);
    if (venture && venture.dailyActionId === actionId) {
      // +25% per venture level above 1
      mult += Math.max(0, state.activeVenture.level - 1) * 0.25;
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
