import {
  DAYS_PER_YEAR,
  type FamilyContext,
  type FamilyLivingTier,
  type Gender,
  type HousingTier,
  type OriginClass,
} from '../../types/activeLife';

export const ORIGIN_METADATA: Record<
  OriginClass,
  {
    label: string;
    weight: number;
    rateLabel: string;
    summary: string;
    riskSummary: string;
    housing: HousingTier;
    roleLabel: string;
    expectedLifespan: number;
    childMortalityRate: string;
  }
> = {
  ban_nong: {
    label: 'Nhà Bần Nông / Dân Đen',
    weight: 70.0,
    rateLabel: '70.0%',
    summary: 'Sinh ra trong gia đình không ruộng đất, tài sản gần như bằng 0, thể chất dẻo dai từ nhỏ.',
    riskSummary: 'Cái đói thường trực, sưu thuế nặng nề; cha mẹ dễ bị bắt đi phu hoặc quân dịch.',
    housing: 'nha_tranh',
    roleLabel: 'Con nhà bần nông',
    expectedLifespan: 48,
    childMortalityRate: '18.0%',
  },
  thu_cong: {
    label: 'Nhà Thợ Thủ Công / Tiểu Thương',
    weight: 18.0,
    rateLabel: '18.0%',
    summary: 'Sinh ra trong gia đình có chút vốn liếng, sớm tiếp xúc nghề thủ công hoặc tính toán buôn bán.',
    riskSummary: 'Địa vị xã hội thấp ("Sĩ, Nông, Công, Thương"), gia đình hay bị quan lại chèn ép.',
    housing: 'nha_tranh',
    roleLabel: 'Con nhà thợ thủ công',
    expectedLifespan: 55,
    childMortalityRate: '12.0%',
  },
  dia_chu: {
    label: 'Nhà Địa Chủ / Cự Phú',
    weight: 8.0,
    rateLabel: '8.0%',
    summary: 'Sinh ra trong gia đình giàu có, sẵn ruộng đất, đủ tiền mời thầy đồ dạy chữ từ bé.',
    riskSummary: 'Gia đình phải đút lót quan tham để giữ tài sản, nguy cơ bị cướp bóc khi loạn lạc.',
    housing: 'nha_gach',
    roleLabel: 'Thiếu gia / Tiểu thư nhà địa chủ',
    expectedLifespan: 62,
    childMortalityRate: '8.0%',
  },
  quan_lai: {
    label: 'Thế Gia Quan Lại',
    weight: 3.5,
    rateLabel: '3.5%',
    summary: 'Sinh ra trong phủ quan, sống trong nhung lụa, sẵn thư viện gia đình (bạn vẫn phải tự lập đường công danh).',
    riskSummary: 'Phụ thuộc vận mệnh quan trường của cha: cha mất sớm, bị biếm chức hay chọn sai phe có thể khiến gia đạo sa sút.',
    housing: 'phu_de',
    roleLabel: 'Công tử / Thiên kim phủ quan',
    expectedLifespan: 64,
    childMortalityRate: '6.5%',
  },
  hoang_toc: {
    label: 'Hoàng Thất / Tôn Thất',
    weight: 0.5,
    rateLabel: '0.5%',
    summary: 'Sinh ra mang dòng máu tôn quý trong cung đình hoặc phủ Tôn thất, tài sản và bổng lộc vượt trội.',
    riskSummary: 'Thể trạng cung đình yếu, âm mưu đầu độc từ bé; số phận tùy thuộc vị thế mẫu thân và biến động ngai vàng.',
    housing: 'phu_de',
    roleLabel: 'Hoàng tử / Công chúa',
    expectedLifespan: 58,
    childMortalityRate: '9.0%',
  },
};

export const BIRTH_PLACES_BY_ORIGIN: Record<OriginClass, string[]> = {
  ban_nong: ['Làng quê đồng bằng Bắc Bộ', 'Xóm chài ven sông Hồng', 'Thôn nghèo vùng đồi trung du', 'Xã ven đê miền Trung'],
  thu_cong: ['Phố nghề Thăng Long', 'Thị tứ ven sông', 'Làng gốm cổ truyền', 'Chợ huyện sầm uất'],
  dia_chu: ['Điền trang vùng trù phú', 'Ấp lớn phủ Hải Dương', 'Thị trấn giao thương'],
  quan_lai: ['Phủ đệ Kinh thành', 'Dinh thự Phủ thành', 'Phố quan lại Tràng An'],
  hoang_toc: ['Hoàng cung Tử Cấm Thành', 'Phủ Tôn thất Kinh thành'],
};

export const FAMILY_NAMES_BY_ORIGIN: Record<OriginClass, string[]> = {
  ban_nong: ['Nguyễn', 'Trần', 'Lê', 'Phạm', 'Hoàng', 'Vũ', 'Đặng', 'Bùi'],
  thu_cong: ['Đỗ', 'Hồ', 'Ngô', 'Dương', 'Lý', 'Phan'],
  dia_chu: ['Trịnh', 'Đoàn', 'Tạ', 'Chu', 'Vương'],
  quan_lai: ['Nguyễn', 'Trần', 'Lê', 'Phạm', 'Ngô'],
  hoang_toc: ['Lý', 'Trần', 'Lê', 'Nguyễn'],
};

export const MALE_GIVEN_NAMES = ['An', 'Bình', 'Minh', 'Khang', 'Tuấn', 'Quân', 'Long', 'Hải', 'Khoa', 'Tâm', 'Đức', 'Phúc'];
export const FEMALE_GIVEN_NAMES = ['Lan', 'Huệ', 'Mai', 'Cúc', 'Trúc', 'Ngọc', 'Hoa', 'Thảo', 'Liên', 'Nga', 'Vân', 'Chi'];
export const RUSTIC_MALE_NICKNAMES = ['Cu Tí', 'Thằng Cò', 'Thằng Đực', 'Cu Tẹo'];
export const RUSTIC_FEMALE_NICKNAMES = ['Cái Hến', 'Con Mít', 'Cái Tẻo', 'Cái Na'];

export const DYNASTY_NAMES = ['Đại Việt', 'Đại Ngu', 'Đại Nam', 'Hồng Đức', 'Thái Bình'];

export const TRAIT_LABELS: Record<string, string> = {
  ham_hoc: 'Ham học',
  than_dong: 'Thần đồng',
  hieu_dong: 'Hiếu động',
  kheo_tay: 'Khéo tay',
  trong_nghia: 'Trọng nghĩa',
  da_nghi: 'Đa nghi',
  nhut_nhat: 'Nhút nhát',
  kien_cuong: 'Kiên cường',
  tham_vong: 'Tham vọng',
};

export const INTEREST_LABELS: Record<string, string> = {
  kinh_su: 'Kinh sử & Văn chương',
  vo_nghe: 'Võ nghệ & Binh pháp',
  thuong_buon: 'Thương buôn & Tính toán',
  thu_cong: 'Nghề thủ công & Y dược',
  dien_vien: 'Điền viên & Thiên nhiên',
  giao_du: 'Giao du & Kết bạn',
};

export const FAMILY_TIER_LABELS: Record<FamilyLivingTier, string> = {
  tung_thieu: 'Túng thiếu',
  du_an: 'Đủ ăn',
  kha_gia: 'Khá giả',
  sung_tuc: 'Sung túc',
  hoang_gia: 'Hoàng gia',
};

interface OccupationSpec {
  id: string;
  label: string;
  monthlyIncome: number;
  wealthMult?: number;
  bonusStats?: { health?: number; education?: number; martial?: number; craftTrade?: number; fame?: number };
}

export const FATHER_OCCUPATIONS: Record<OriginClass, OccupationSpec[]> = {
  ban_nong: [
    { id: 'ta_dien', label: 'Tá điền làm thuê', monthlyIncome: 18, bonusStats: { health: 4 } },
    { id: 'tho_san', label: 'Thợ săn vùng đồi', monthlyIncome: 24, bonusStats: { health: 5, martial: 3 } },
    { id: 'ngu_dan', label: 'Ngư dân chài lưới', monthlyIncome: 21, bonusStats: { health: 4, craftTrade: 2 } },
    { id: 'thay_do_ngheo', label: 'Thầy đồ nghèo dạy chữ', monthlyIncome: 16, wealthMult: 0.9, bonusStats: { education: 5, health: -3 } },
    { id: 'phu_khuon_vac', label: 'Phu khuân vác bến thuyền', monthlyIncome: 22, bonusStats: { health: 5, martial: 2 } },
  ],
  thu_cong: [
    { id: 'tho_ren', label: 'Thợ rèn rèn nông cụ', monthlyIncome: 72, bonusStats: { martial: 3, craftTrade: 4 } },
    { id: 'tho_moc', label: 'Thợ mộc đóng đồ gỗ', monthlyIncome: 76, bonusStats: { craftTrade: 5 } },
    { id: 'thay_lang', label: 'Thầy lang bốc thuốc nam', monthlyIncome: 68, bonusStats: { education: 4, craftTrade: 3 } },
    { id: 'lai_buon', label: 'Tiểu thương buôn chuyến', monthlyIncome: 95, wealthMult: 1.15, bonusStats: { craftTrade: 6 } },
    { id: 'tho_gom', label: 'Thợ gốm làng nghề', monthlyIncome: 70, bonusStats: { craftTrade: 5 } },
  ],
  dia_chu: [
    { id: 'dien_chu', label: 'Điền chủ nhiều ruộng đất', monthlyIncome: 3500, bonusStats: { fame: 3 } },
    { id: 'hao_phu', label: 'Hào phú buôn muối & tơ lụa', monthlyIncome: 5200, wealthMult: 1.25, bonusStats: { craftTrade: 6, fame: 2 } },
    { id: 'chu_duoc_phong', label: 'Chủ hiệu thuốc bắc lớn', monthlyIncome: 4200, bonusStats: { education: 4, craftTrade: 4 } },
  ],
  quan_lai: [
    { id: 'quan_van', label: 'Quan văn thanh liêm', monthlyIncome: 12000, wealthMult: 0.8, bonusStats: { education: 8, fame: 5 } },
    { id: 'quan_vo', label: 'Quan võ trấn ải', monthlyIncome: 16000, wealthMult: 0.9, bonusStats: { martial: 8, fame: 4 } },
    { id: 'tham_quan', label: 'Quan phủ nhiều mưu mẹo', monthlyIncome: 25000, wealthMult: 1.35, bonusStats: { craftTrade: 5, fame: 1 } },
  ],
  hoang_toc: [
    { id: 'hoang_de', label: 'Hoàng thượng trị vì', monthlyIncome: 80000, bonusStats: { fame: 10, education: 5 } },
  ],
};

export const MOTHER_OCCUPATIONS: Record<OriginClass, OccupationSpec[]> = {
  ban_nong: [
    { id: 'lam_ruong', label: 'Làm ruộng & hái củi', monthlyIncome: 10 },
    { id: 'det_vai', label: 'Dệt vải thô bán chợ', monthlyIncome: 13 },
    { id: 'ban_hang_rong', label: 'Bán hàng rong đầu làng', monthlyIncome: 14 },
  ],
  thu_cong: [
    { id: 'theu_thua', label: 'Thêu thùa & may vá', monthlyIncome: 26 },
    { id: 'ban_hang_xom', label: 'Trông coi sạp hàng nhỏ', monthlyIncome: 34 },
    { id: 'det_lua', label: 'Dệt lụa truyền thống', monthlyIncome: 30 },
  ],
  dia_chu: [
    { id: 'quan_gia_noi_tro', label: 'Quản lý điền trang & gia nhân', monthlyIncome: 1200 },
    { id: 'tieu_thu', label: 'Tiểu thư khuê các', monthlyIncome: 600 },
  ],
  quan_lai: [
    { id: 'phu_nhan', label: 'Phu nhân phủ quan', monthlyIncome: 2000 },
  ],
  hoang_toc: [
    { id: 'hoang_hau_phi_tan', label: 'Hoàng hậu / Phi tần', monthlyIncome: 15000 },
  ],
};

/**
 * Returns base monthly income (in copper) for father and mother based on their exact occupations.
 */
export function getParentMonthlyIncome(
  originClass: OriginClass,
  fatherOccId?: string,
  motherOccId?: string,
): { fatherBase: number; motherBase: number } {
  const fList = FATHER_OCCUPATIONS[originClass] ?? [];
  const mList = MOTHER_OCCUPATIONS[originClass] ?? [];
  const extraFatherIncome: Record<string, number> = {
    quan_vuong: 42000,
    tien_de: 0,
  };
  const extraMotherIncome: Record<string, number> = {
    vuong_phi: 8000,
  };
  const fSpec = fList.find((o) => o.id === fatherOccId) ?? fList[0];
  const mSpec = mList.find((o) => o.id === motherOccId) ?? mList[0];
  return {
    fatherBase: fatherOccId && fatherOccId in extraFatherIncome ? extraFatherIncome[fatherOccId] : (fSpec?.monthlyIncome ?? 0),
    motherBase: motherOccId && motherOccId in extraMotherIncome ? extraMotherIncome[motherOccId] : (mSpec?.monthlyIncome ?? 0),
  };
}

interface CircumstanceSpec {
  id: string;
  label: string;
  wealthMult: number;
  parentAffDelta: number;
  happinessDelta: number;
  fameDelta?: number;
  fatherAlive?: boolean;
  housingOverride?: HousingTier;
  isTonThat?: boolean;
  extraFlags?: string[];
}

export const CIRCUMSTANCES_BY_ORIGIN: Record<OriginClass, CircumstanceSpec[]> = {
  ban_nong: [
    { id: 'binh_thuong', label: 'Gia cảnh cơ hàn nhưng êm ấm', wealthMult: 1.0, parentAffDelta: 0, happinessDelta: 0 },
    { id: 'hoa_thuan', label: 'Nhà nghèo nhưng cha mẹ thương yêu, đùm bọc', wealthMult: 1.05, parentAffDelta: 12, happinessDelta: 8 },
    { id: 'mac_no', label: 'Nhà đang gánh món nợ tô thuế cũ', wealthMult: 0.5, parentAffDelta: -5, happinessDelta: -6, extraFlags: ['gia_dinh_mac_no'] },
    { id: 'thu_huong', label: 'Nhà nghèo nhưng cha trọng chữ nghĩa, giữ gia phong', wealthMult: 0.9, parentAffDelta: 4, happinessDelta: 2, extraFlags: ['gia_phong_thu_huong'] },
    { id: 'mo_coi_cha', label: 'Cha đi phu mất sớm, mẹ tần tảo nuôi con', wealthMult: 0.6, parentAffDelta: 10, happinessDelta: -8, fatherAlive: false, extraFlags: ['mo_coi_cha'] },
  ],
  thu_cong: [
    { id: 'binh_thuong', label: 'Xưởng nhỏ làm ăn đều đặn, đủ ăn đủ mặc', wealthMult: 1.0, parentAffDelta: 0, happinessDelta: 0 },
    { id: 'hoa_thuan', label: 'Gia đình hòa thuận, trên dưới đồng lòng giữ nghề', wealthMult: 1.1, parentAffDelta: 10, happinessDelta: 6 },
    { id: 'mac_no', label: 'Vay vốn làm ăn thua lỗ, đang gánh nợ', wealthMult: 0.5, parentAffDelta: -5, happinessDelta: -6, extraFlags: ['gia_dinh_mac_no'] },
    { id: 'bi_chen_ep', label: 'Bị quan phủ và đầu gấu chèn ép thu tô nặng', wealthMult: 0.7, parentAffDelta: 0, happinessDelta: -5, extraFlags: ['gia_dinh_bi_chen_ep'] },
    { id: 'mo_coi_cha', label: 'Cha mất sớm, mẹ góa một mình giữ sạp hàng', wealthMult: 0.6, parentAffDelta: 10, happinessDelta: -8, fatherAlive: false, extraFlags: ['mo_coi_cha'] },
  ],
  dia_chu: [
    { id: 'binh_thuong', label: 'Điền trang vững vàng, thu tô đều đặn', wealthMult: 1.0, parentAffDelta: 0, happinessDelta: 0 },
    { id: 'hoa_thuan', label: 'Gia đạo hưng thịnh, trên dưới thuận hòa', wealthMult: 1.15, parentAffDelta: 10, happinessDelta: 6 },
    { id: 'thu_huong', label: 'Gia phong trọng nho học, nuôi chí cho con đỗ đạt', wealthMult: 1.0, parentAffDelta: 4, happinessDelta: 2, extraFlags: ['gia_phong_thu_huong'] },
    { id: 'vo_hoc', label: 'Nhà giàu có truyền thống luyện võ giữ điền trang', wealthMult: 1.0, parentAffDelta: 4, happinessDelta: 2, extraFlags: ['gia_phong_vo_hoc'] },
    { id: 'mo_coi_cha', label: 'Cha mất sớm, mẹ góa con côi giữ ruộng trước họ hàng dòm ngó', wealthMult: 0.65, parentAffDelta: 10, happinessDelta: -8, fatherAlive: false, extraFlags: ['mo_coi_cha'] },
    { id: 'sa_sut', label: 'Cha sa đà kiện tụng, gia sản suy vi gánh nợ', wealthMult: 0.35, parentAffDelta: -6, happinessDelta: -8, extraFlags: ['gia_dinh_mac_no'] },
  ],
  quan_lai: [
    { id: 'binh_thuong', label: 'Gia thế ổn định, cha đương chức yên ổn', wealthMult: 1.0, parentAffDelta: 0, happinessDelta: 0 },
    { id: 'hoa_thuan', label: 'Thế gia vọng tộc, cha mẹ hòa thuận, hết mực nâng đỡ', wealthMult: 1.1, parentAffDelta: 10, happinessDelta: 6 },
    { id: 'thu_huong', label: 'Dòng dõi khoa bảng, thư viện gia đình đồ sộ', wealthMult: 0.95, parentAffDelta: 4, happinessDelta: 2, extraFlags: ['gia_phong_thu_huong'] },
    { id: 'vo_hoc', label: 'Nhà tướng môn, từ nhỏ đã quen binh thư võ nghệ', wealthMult: 1.0, parentAffDelta: 4, happinessDelta: 2, extraFlags: ['gia_phong_vo_hoc'] },
    { id: 'cha_quan_mat', label: 'Cha làm quan mất sớm, mất chỗ dựa triều đình, gia đạo sa sút', wealthMult: 0.25, parentAffDelta: 8, happinessDelta: -10, fameDelta: -10, fatherAlive: false, housingOverride: 'nha_gach', extraFlags: ['mo_coi_cha', 'gia_toc_sa_sut'] },
    { id: 'biem_chuc', label: 'Cha bị biếm chức về quê vì vạ miệng trên triều', wealthMult: 0.3, parentAffDelta: -4, happinessDelta: -8, fameDelta: -8, housingOverride: 'nha_gach', extraFlags: ['gia_toc_sa_sut'] },
  ],
  hoang_toc: [
    { id: 'binh_thuong', label: 'Sống trong cung cấm yên bình, hưởng bổng lộc hoàng gia', wealthMult: 1.0, parentAffDelta: 0, happinessDelta: 0 },
    { id: 'duoc_sung_ai', label: 'Con đích Hoàng hậu, được Phụ hoàng hết mực sủng ái', wealthMult: 1.2, parentAffDelta: 12, happinessDelta: 8, fameDelta: 8 },
    { id: 'that_sung', label: 'Mẫu thân là phi tần thất sủng, sống ở cung hẻo lánh', wealthMult: 0.25, parentAffDelta: -10, happinessDelta: -10, fameDelta: -12, extraFlags: ['that_sung_cung_dinh'] },
    { id: 'tien_de_bang_ha', label: 'Tiên đế băng hà khi bạn còn nhỏ, sống nơm nớp tránh thanh trừng', wealthMult: 0.35, parentAffDelta: 6, happinessDelta: -12, fameDelta: -10, fatherAlive: false, extraFlags: ['mo_coi_cha', 'gia_toc_sa_sut'] },
    { id: 'ton_that', label: 'Nhánh Tôn thất / Quận vương ở phủ riêng, xa rời quyền lực trung tâm', wealthMult: 0.5, parentAffDelta: 4, happinessDelta: 2, fameDelta: -8, isTonThat: true },
  ],
};

export const SIBLING_PERSONALITIES = ['Ngoan hiền', 'Nghịch ngợm', 'Ham học', 'Nhút nhát', 'Khéo léo', 'Hay ốm'];

export function computeLivingTier(wealthCopper: number, originClass: OriginClass): FamilyLivingTier {
  if (originClass === 'hoang_toc') return 'hoang_gia';
  if (wealthCopper >= 35000) return 'sung_tuc';
  if (wealthCopper >= 10000) return 'kha_gia';
  if (wealthCopper >= 700) return 'du_an';
  return 'tung_thieu';
}

export function getBirthYearSummary(totalDays: number): number {
  return Math.floor(totalDays / DAYS_PER_YEAR);
}

const BASE_HOUSING_LABELS: Record<HousingTier, string> = {
  gam_cau: 'Gầm cầu / Mái hiên tạm',
  nha_tranh: 'Nhà tranh vách đất',
  nha_gach: 'Nhà gạch khang trang',
  phu_de: 'Phủ đệ son thiếp',
};

/**
 * Returns a contextual residence label reflecting royal palace quarters,
 * cold-palace exile, or adult estate separation choices.
 */
export function getHousingDisplayLabel(opts: {
  housing: HousingTier;
  originClass?: OriginClass;
  gender?: Gender;
  ageYears?: number;
  flags?: string[];
  family?: FamilyContext;
}): string {
  const { housing, originClass, gender, ageYears = 0, flags = [], family } = opts;
  if (originClass === 'hoang_toc' && housing === 'phu_de') {
    if (flags.includes('da_khai_phu_hoang_toc')) {
      return family?.circumstance === 'ton_that'
        ? 'Phủ Tôn thất riêng'
        : gender === 'female'
          ? 'Phủ Công chúa riêng'
          : 'Phủ Hoàng tử riêng';
    }
    if (flags.includes('da_nhan_tuoc_vi')) {
      return 'Phủ đệ nội triều';
    }
    if (flags.includes('dong_cung_thai_tu')) {
      return 'Đông Cung';
    }
    if (family?.circumstance === 'ton_that') {
      return 'Phủ Quận vương (Tôn thất)';
    }
    if (flags.includes('that_sung_cung_dinh')) {
      return 'Tẩm cung hẻo lánh (Lãnh cung)';
    }
    if (flags.includes('mau_phi_phuc_sung')) {
      return 'Tẩm cung trong Tử Cấm Thành';
    }
    if (family?.motherStatus === 'chinh_that') {
      return ageYears < 13 ? 'Chính cung Hoàng hậu' : 'Tẩm cung trong Tử Cấm Thành';
    }
    return ageYears < 13 ? 'Tẩm cung mẫu phi' : 'Tẩm cung trong Tử Cấm Thành';
  }
  return BASE_HOUSING_LABELS[housing] ?? housing;
}
