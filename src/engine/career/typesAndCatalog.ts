import type { CareerTrack, OriginClass, TimeSlot } from '../../types/activeLife';

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
    baseDailyCopper: 8,
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
    baseDailyCopper: 12,
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
    baseDailyCopper: 14,
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
    baseDailyCopper: 17,
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
    baseDailyCopper: 7,
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
    baseDailyCopper: 11,
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
    baseDailyCopper: 18,
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
    baseDailyCopper: 9,
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
    baseDailyCopper: 17,
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
    baseDailyCopper: 8,
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
    baseDailyCopper: 13,
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
    baseDailyCopper: 19,
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
    baseDailyCopper: 5,
    baseDailyRice: 0.6,
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
    baseDailyCopper: 15,
    baseDailyRice: 0.4,
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
    baseDailyCopper: 18,
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

