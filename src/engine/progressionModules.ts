import {
  DAYS_PER_YEAR,
  getAgeYears,
  type ActiveLifeState,
  type HousingTier,
  type OriginClass,
  type WorldState,
} from '../types/activeLife';
import { appendLog, applyEffects } from './effectApplier';
import { mulberry32Next } from './prng';
import {
  COMMERCIAL_PROPERTY_IDS,
  POSTING_LABELS,
  checkHousingTiemLe,
  checkOfficialPropertyRule,
  createOfficialProfile,
  evaluateKhaoKhoa,
  getOfficialTitle,
  isHomePostingAtBirthPlace,
} from './officialSystem';

export const OFFICIAL_RANKS = [
  'Dân thường',
  'Cửu phẩm · Điển sử',
  'Bát phẩm · Huyện thừa',
  'Thất phẩm · Tri huyện',
  'Lục phẩm · Tri châu',
  'Ngũ phẩm · Tri phủ',
  'Tứ phẩm · Án sát sứ',
  'Tam phẩm · Tuần phủ',
  'Nhị phẩm · Thượng thư',
  'Nhất phẩm · Tể tướng',
  'Khai quốc Hoàng đế',
] as const;

export interface PropertySpec {
  id: string;
  name: string;
  costCopper: number;
  seasonalIncomeCopper: number;
  seasonalFame?: number;
  seasonalRelationships?: number;
  requiresOrigins?: OriginClass[];
  description: string;
}

export const PROPERTY_CATALOG: PropertySpec[] = [
  {
    id: 'ruong_tu',
    name: 'Ruộng tư (5 mẫu)',
    costCopper: 3000,
    seasonalIncomeCopper: 150,
    description: 'Phát canh thu tô mỗi mùa 150 đồng, ổn định ít rủi ro.',
  },
  {
    id: 'nha_tro_cho_thue',
    name: 'Dãy nhà trọ cho thuê',
    costCopper: 4500,
    seasonalIncomeCopper: 230,
    description: 'Cho khách bộ hành, sĩ tử thuê trọ, thu tiền thuê 230 đồng mỗi mùa.',
  },
  {
    id: 'ki_ot_cho_thue',
    name: 'Sạp chợ phiên cho thuê',
    costCopper: 6000,
    seasonalIncomeCopper: 320,
    description: 'Cho tiểu thương thuê sạp buôn bán ngoài chợ phiên, thu 320 đồng/mùa.',
  },
  {
    id: 'cua_hieu_gao',
    name: 'Cửa hiệu lương thực',
    costCopper: 8000,
    seasonalIncomeCopper: 450,
    description: 'Kinh doanh thóc gạo, sinh lời 450 đồng mỗi mùa (tăng thêm theo Thương tài).',
  },
  {
    id: 'phu_cho_thue',
    name: 'Nhà gạch cho thương nhân thuê',
    costCopper: 12000,
    seasonalIncomeCopper: 680,
    description: 'Mua nhà phố khang trang cho thương hộ thuê dài hạn, thu 680 đồng/mùa.',
  },
  {
    id: 'xuong_gom',
    name: 'Xưởng gốm thủ công',
    costCopper: 15000,
    seasonalIncomeCopper: 900,
    description: 'Xưởng sản xuất quy mô lớn, thu 900 đồng mỗi mùa.',
  },
  {
    id: 'thuyen_buon',
    name: 'Thuyền buôn đường sông',
    costCopper: 22000,
    seasonalIncomeCopper: 1300,
    description: 'Vận chuyển hàng hóa liên tỉnh, thu lợi nhuận 1.300 đồng mỗi mùa.',
  },
  {
    id: 'trang_vien_cho_thue',
    name: 'Trang viên & Điền trang phát canh',
    costCopper: 45000,
    seasonalIncomeCopper: 2600,
    seasonalFame: 1.5,
    description: 'Điền trang rộng lớn cho tá điền thuê canh tác, thu 2.600 đồng mỗi mùa.',
  },
  {
    id: 'nghia_thuc_tu_vien',
    name: 'Nghĩa thục & Tàng thư quán',
    costCopper: 18000,
    seasonalIncomeCopper: 250,
    seasonalFame: 2.5,
    seasonalRelationships: 1.0,
    description: 'Mở thư quán bảo trợ sĩ tử, thu nhẹ 250đ nhưng tăng mạnh Thanh danh & Quan hệ mỗi mùa.',
  },
  {
    id: 'y_quan_tu_thien',
    name: 'Y quán tế thế',
    costCopper: 24000,
    seasonalIncomeCopper: 450,
    seasonalFame: 3.0,
    seasonalRelationships: 1.5,
    description: 'Lập y quán bốc thuốc cứu dân, thu 450đ cùng Thanh danh và Quan hệ bền vững mỗi mùa.',
  },
  {
    id: 'thuong_hoi_lien_tinh',
    name: 'Thương hội liên tỉnh',
    costCopper: 30000,
    seasonalIncomeCopper: 1800,
    seasonalFame: 1.0,
    seasonalRelationships: 2.0,
    description: 'Hùn vốn lập thương hội buôn bán lớn, thu 1.800đ, mở rộng Quan hệ và Thanh danh mỗi mùa.',
  },
  {
    id: 'tuu_lau_kinh_ky',
    name: 'Tửu lâu Kinh kỳ',
    costCopper: 36000,
    seasonalIncomeCopper: 2100,
    seasonalFame: 1.5,
    seasonalRelationships: 2.5,
    requiresOrigins: ['dia_chu', 'quan_lai', 'hoang_toc'],
    description: 'Nơi văn nhân, quan lại và thương gia tụ hội, thu 2.100đ cùng Quan hệ & Thanh danh mỗi mùa.',
  },
  {
    id: 'thai_ap_ton_that',
    name: 'Thái ấp & Trang viên Tôn thất',
    costCopper: 65000,
    seasonalIncomeCopper: 3900,
    seasonalFame: 3.5,
    seasonalRelationships: 1.5,
    requiresOrigins: ['hoang_toc', 'quan_lai'],
    description: 'Thực ấp và điền trang lớn của bậc công hầu, thu 3.900đ cùng Thanh danh & Quan hệ mỗi mùa.',
  },
];

export const HOUSING_UPGRADES: Array<{ tier: HousingTier; label: string; cost: number }> = [
  { tier: 'nha_tranh', label: 'Nhà tranh', cost: 500 },
  { tier: 'nha_gach', label: 'Nhà gạch khang trang', cost: 5000 },
  { tier: 'phu_de', label: 'Phủ đệ rộng lớn', cost: 25000 },
];

export const HOUSING_ORDER: Record<HousingTier, number> = {
  gam_cau: 0,
  nha_tranh: 1,
  nha_gach: 2,
  phu_de: 3,
};

export function getPropertyMarketCost(prop: PropertySpec, worldState: WorldState): number {
  const mult =
    worldState === 'chien_tranh'
      ? 0.75
      : worldState === 'mat_mua'
        ? 0.85
        : worldState === 'dich_benh'
          ? 0.9
          : 1.0;
  return Math.round(prop.costCopper * mult);
}

export function getHousingMarketCost(tier: HousingTier, worldState: WorldState): number {
  const spec = HOUSING_UPGRADES.find((h) => h.tier === tier);
  if (!spec) return 0;
  const mult =
    worldState === 'chien_tranh'
      ? 0.8
      : worldState === 'mat_mua' || worldState === 'dich_benh'
        ? 0.9
        : 1.0;
  return Math.round(spec.cost * mult);
}

export function getPropertySeasonalIncome(
  prop: PropertySpec,
  worldState: WorldState,
  craftTrade: number,
): number {
  let worldMult = 1.0;
  if (worldState === 'mat_mua') {
    if (prop.id === 'ruong_tu' || prop.id === 'trang_vien_cho_thue') worldMult = 0.55;
    else if (prop.id === 'cua_hieu_gao') worldMult = 1.25;
    else worldMult = 0.85;
  } else if (worldState === 'dich_benh') {
    if (prop.id === 'nha_tro_cho_thue' || prop.id === 'ki_ot_cho_thue' || prop.id === 'cua_hieu_gao') {
      worldMult = 0.65;
    } else {
      worldMult = 0.8;
    }
  } else if (worldState === 'chien_tranh') {
    if (prop.id === 'thuyen_buon' || prop.id === 'ki_ot_cho_thue' || prop.id === 'nha_tro_cho_thue') {
      worldMult = 0.5;
    } else {
      worldMult = 0.7;
    }
  }
  const tradeBonus = 1 + craftTrade * 0.01;
  return Math.round(prop.seasonalIncomeCopper * worldMult * tradeBonus);
}

export function getVisibleProperties(state: ActiveLifeState): PropertySpec[] {
  return PROPERTY_CATALOG.filter((prop) => {
    const owned = state.assets.properties.includes(prop.id);
    if (owned) return true;
    if (state.officialRank > 0 && COMMERCIAL_PROPERTY_IDS.has(prop.id)) {
      return false;
    }
    return !prop.requiresOrigins || prop.requiresOrigins.includes(state.profile.originClass);
  });
}

export function getPropertySeasonalSocial(prop: PropertySpec): {
  fame: number;
  relationships: number;
} {
  return {
    fame: prop.seasonalFame ?? 0,
    relationships: prop.seasonalRelationships ?? 0,
  };
}

export function toggleCrossDress(state: ActiveLifeState): ActiveLifeState {
  if (state.profile.gender !== 'female' || state.stats.education < 15) return state;
  if (state.flags.includes('nu_cai_nam_trang')) return state;

  const next = applyEffects(state, {
    add_flags: ['nu_cai_nam_trang'],
    milestone_title: 'Nữ cải nam trang bước vào trường thi',
  });
  return {
    ...next,
    exposureRisk: 5,
    logs: appendLog(
      next.logs,
      next.profile.totalDays,
      'event',
      'Bạn quyết định cải nam trang để mở cánh cửa Khoa cử & Quan trường.',
    ),
  };
}

export type ExamLevel = 'huong' | 'hoi' | 'dinh';

export function getExamEligibility(
  state: ActiveLifeState,
  level: ExamLevel,
): { ok: boolean; reason?: string; cost: number } {
  const age = getAgeYears(state.profile.totalDays);
  const currentYear = Math.floor(state.profile.totalDays / DAYS_PER_YEAR);
  if (state.livelihoodStatus === 'prison' || state.flags.includes('dang_o_tu')) {
    return { ok: false, reason: 'Đang chịu án tù, không thể dự khoa cử', cost: 0 };
  }
  if (state.flags.includes('bi_ep_lam_gia_no')) {
    return { ok: false, reason: 'Thân phận gia nô không thể dự khoa cử', cost: 0 };
  }
  if (state.flags.includes('bi_truy_na')) {
    return { ok: false, reason: 'Đang bị triều đình truy nã', cost: 0 };
  }
  if (state.flags.includes('thai_giam') || state.flags.includes('trong_hau_cung')) {
    return { ok: false, reason: 'Thân phận nội đình không thể dự khoa cử ngoại triều', cost: 0 };
  }
  if (state.officialRank > 0) {
    return { ok: false, reason: 'Quan viên đương chức thăng tiến qua Khảo khóa 3 năm, không dự thi Khoa cử', cost: 0 };
  }
  const canAttendAsFemale =
    state.profile.gender === 'male' ||
    state.flags.includes('nu_cai_nam_trang') ||
    state.flags.includes('nu_quan_dac_xa');
  if (!canAttendAsFemale) {
    return { ok: false, reason: 'Nữ giới cần cải nam trang để dự thi', cost: 0 };
  }

  const lastAttemptDay = state.eventCooldowns[`exam_${level}`];
  if (lastAttemptDay !== undefined && Math.floor(lastAttemptDay / DAYS_PER_YEAR) === currentYear) {
    const retryHint =
      level === 'huong'
        ? 'Năm nay bạn đã dự Thi Hương rồi, hãy đợi kỳ thi sau'
        : level === 'hoi'
          ? 'Năm nay bạn đã dự Thi Hội rồi, hãy đợi Mùa Xuân năm sau'
          : 'Năm nay bạn đã dự Thi Đình rồi';
    return {
      ok: false,
      reason: retryHint,
      cost: level === 'huong' ? 200 : level === 'hoi' ? 1000 : 0,
    };
  }

  if (level === 'huong') {
    const isExamSeason = state.world.season === 'autumn' && age % 3 === 0;
    if (!isExamSeason) {
      return { ok: false, reason: 'Thi Hương mở vào Mùa Thu các năm chia hết cho 3 (15, 18, 21... tuổi)', cost: 200 };
    }
    if (state.flags.includes('do_cu_nhan')) {
      return { ok: false, reason: 'Đã đỗ Cử nhân', cost: 200 };
    }
    if (state.stats.education < 25 && state.stats.martial < 30) {
      return { ok: false, reason: 'Cần Học thức >= 25 (hoặc Võ nghệ >= 30)', cost: 200 };
    }
    if (state.assets.wealthCopper < 200) {
      return { ok: false, reason: 'Cần 200 đồng lộ phí', cost: 200 };
    }
    return { ok: true, cost: 200 };
  }

  if (level === 'hoi') {
    if (!state.flags.includes('do_cu_nhan')) {
      return { ok: false, reason: 'Cần đỗ Cử nhân trước', cost: 1000 };
    }
    if (state.flags.includes('do_cong_si')) {
      return { ok: false, reason: 'Đã đỗ Cống sĩ', cost: 1000 };
    }
    if (state.world.season !== 'spring' || age % 3 !== 1) {
      return { ok: false, reason: 'Thi Hội mở vào Mùa Xuân năm sau kỳ Thi Hương (16, 19, 22... tuổi)', cost: 1000 };
    }
    if (state.stats.education < 50 && state.stats.martial < 55) {
      return {
        ok: false,
        reason: `Cần Học thức >= 50 (hiện có ${Math.round(state.stats.education)}) hoặc Võ nghệ >= 55`,
        cost: 1000,
      };
    }
    if (state.assets.wealthCopper < 1000) {
      return { ok: false, reason: 'Cần 1.000 đồng lộ phí lên kinh', cost: 1000 };
    }
    return { ok: true, cost: 1000 };
  }

  // dinh
  if (!state.flags.includes('do_cong_si')) {
    return { ok: false, reason: 'Cần đỗ Cống sĩ trước', cost: 0 };
  }
  if (state.flags.includes('do_tien_si')) {
    return { ok: false, reason: 'Đã đỗ Tiến sĩ', cost: 0 };
  }
  if (age % 3 !== 1 || state.world.season !== 'summer') {
    return { ok: false, reason: 'Thi Đình mở vào Mùa Hạ sau kỳ Thi Hội (16, 19, 22... tuổi)', cost: 0 };
  }
  if (state.stats.education < 75 && state.stats.martial < 80) {
    return { ok: false, reason: 'Cần Học thức >= 75 (hoặc Võ nghệ >= 80)', cost: 0 };
  }
  return { ok: true, cost: 0 };
}

export function takeExam(state: ActiveLifeState, level: ExamLevel): ActiveLifeState {
  const elig = getExamEligibility(state, level);
  if (!elig.ok) return state;

  let next = applyEffects(state, { copper: -elig.cost });
  const roll = mulberry32Next(next.prngState);
  next = {
    ...next,
    prngState: roll.nextState,
    eventCooldowns: {
      ...next.eventCooldowns,
      [`exam_${level}`]: next.profile.totalDays,
    },
  };

  const skill = Math.max(next.stats.education, next.stats.martial);
  const scholarBonus =
    (next.flags.includes('gia_phong_thu_huong') ? 0.05 : 0) +
    (next.traits?.includes('than_dong') ? 0.05 : 0);
  const exposureBump = next.flags.includes('nu_cai_nam_trang') ? 2 : 0;

  if (level === 'huong') {
    const passChance = Math.min(0.95, 0.35 + (skill - 25) * 0.02 + scholarBonus);
    if (roll.value > passChance) {
      return {
        ...next,
        logs: appendLog(next.logs, next.profile.totalDays, 'study', 'Kỳ Thi Hương năm nay bạn bị trượt bảng vàng, đành đợi 3 năm sau.'),
      };
    }
    const isGiaiNguyen = skill >= 65 && next.stats.fame >= 20 && roll.value < 0.2;
    const isCuNhan = isGiaiNguyen || skill >= 45 || roll.value < 0.25;
    const flag = isCuNhan ? 'do_cu_nhan' : 'do_tu_tai';
    const title = isGiaiNguyen ? 'Giải nguyên' : isCuNhan ? 'Cử nhân' : 'Tú tài';
    next = applyEffects(next, {
      add_flags: isGiaiNguyen ? [flag, 'giai_nguyen'] : [flag],
      fame: isGiaiNguyen ? 20 : isCuNhan ? 15 : 8,
      happiness: isGiaiNguyen ? 18 : 15,
      milestone_title: `Đỗ ${title} kỳ Thi Hương`,
    });
    return {
      ...next,
      exposureRisk: Math.min(100, next.exposureRisk + exposureBump),
      profile: { ...next.profile, currentRole: title },
      logs: appendLog(next.logs, next.profile.totalDays, 'study', `Chúc mừng! Bạn đã đỗ ${title} trong kỳ Thi Hương!`),
    };
  }

  if (level === 'hoi') {
    const passChance = Math.min(0.9, 0.3 + (skill - 55) * 0.025 + scholarBonus);
    if (roll.value > passChance) {
      return {
        ...next,
        logs: appendLog(next.logs, next.profile.totalDays, 'study', 'Thi Hội trường văn cạnh tranh khốc liệt, bạn lỡ hẹn bảng Cống sĩ.'),
      };
    }
    const isHoiNguyen = skill >= 80 && next.stats.fame >= 30 && roll.value < 0.25;
    const hoiTitle = isHoiNguyen ? 'Hội nguyên' : 'Cống sĩ';
    next = applyEffects(next, {
      add_flags: isHoiNguyen ? ['do_cong_si', 'hoi_nguyen'] : ['do_cong_si'],
      fame: isHoiNguyen ? 28 : 20,
      happiness: isHoiNguyen ? 18 : 15,
      milestone_title: `Đỗ ${hoiTitle} kỳ Thi Hội`,
    });
    return {
      ...next,
      exposureRisk: Math.min(100, next.exposureRisk + exposureBump),
      profile: { ...next.profile, currentRole: hoiTitle },
      logs: appendLog(next.logs, next.profile.totalDays, 'study', `Bạn xuất sắc đỗ ${hoiTitle} kỳ Thi Hội, được triệu vào Điện thí!`),
    };
  }

  // Thi Đình: Tam khôi (Trạng nguyên - Bảng nhãn - Thám hoa), Hoàng giáp, Đồng Tiến sĩ
  const isTrangNguyen = skill >= 90 && next.stats.fame >= 40 && roll.value < 0.35;
  const isBangNhan = !isTrangNguyen && skill >= 85 && next.stats.fame >= 30 && roll.value < 0.55;
  const isThamHoa = !isTrangNguyen && !isBangNhan && skill >= 80 && next.stats.fame >= 20 && roll.value < 0.7;
  const isHoangGiap = !isTrangNguyen && !isBangNhan && !isThamHoa && skill >= 78;

  const title = isTrangNguyen
    ? 'Trạng nguyên'
    : isBangNhan
      ? 'Bảng nhãn'
      : isThamHoa
        ? 'Thám hoa'
        : isHoangGiap
          ? 'Hoàng giáp'
          : 'Tiến sĩ';

  const flagsToAdd = isTrangNguyen
    ? ['do_tien_si', 'trang_nguyen']
    : isBangNhan
      ? ['do_tien_si', 'bang_nhan']
      : isThamHoa
        ? ['do_tien_si', 'tham_hoa']
        : isHoangGiap
          ? ['do_tien_si', 'hoang_giap']
          : ['do_tien_si'];

  const fameGain = isTrangNguyen ? 42 : isBangNhan ? 35 : isThamHoa ? 30 : isHoangGiap ? 27 : 25;

  next = applyEffects(next, {
    add_flags: flagsToAdd,
    fame: fameGain,
    happiness: isTrangNguyen ? 28 : 25,
    milestone_title: `Đỗ ${title} kỳ Thi Đình`,
  });
  return {
    ...next,
    exposureRisk: Math.min(100, next.exposureRisk + exposureBump),
    profile: { ...next.profile, currentRole: title },
    logs: appendLog(next.logs, next.profile.totalDays, 'study', `Vinh quy bái tổ! Hoàng thượng ngự phê bạn đỗ ${title}!`),
  };
}

function applyOfficialScheduleAndClearCareer(
  state: ActiveLifeState,
  track: 'van' | 'vo' | 'hoan_quan' = 'van',
  posting?: 'kinh_do' | 'dong_bang' | 'song_nuoc' | 'bien_ai',
): ActiveLifeState {
  const cleanFlags = state.flags.filter((f) => !f.startsWith('career_') && !f.startsWith('venture_'));
  if (
    posting &&
    !isHomePostingAtBirthPlace(state.family?.birthPlace, posting) &&
    !cleanFlags.includes('da_ra_o_rieng')
  ) {
    cleanFlags.push('da_ra_o_rieng');
  }
  const officialAction = track === 'vo' ? 'act_quan_vo_thao_luyen' : 'act_xu_an_cong_duong';
  return {
    ...state,
    flags: cleanFlags,
    isStudent: false,
    livelihoodStatus: 'employed',
    activeCareer: null,
    activeVenture: null,
    schedule: {
      ...state.schedule,
      morning: officialAction,
      afternoon: officialAction,
    },
  };
}

export function appointOrPromoteOfficial(state: ActiveLifeState): ActiveLifeState {
  if (state.officialRank >= 9) return state;

  if (state.officialRank === 0) {
    const canBeAppointed =
      state.flags.includes('do_tu_tai') ||
      state.flags.includes('do_cu_nhan') ||
      state.flags.includes('do_tien_si') ||
      state.flags.includes('trong_quan_ngu') ||
      state.flags.includes('thai_giam');
    if (!canBeAppointed) return state;

    const track = state.flags.includes('thai_giam')
      ? 'hoan_quan'
      : state.flags.includes('trong_quan_ngu') || state.stats.martial > state.stats.education + 12
        ? 'vo'
        : 'van';

    let startRank = 1;
    let examBonusCopper = 0;
    if (state.flags.includes('trang_nguyen') || state.flags.includes('bang_nhan')) {
      startRank = 5;
      examBonusCopper = 5000;
    } else if (state.flags.includes('tham_hoa') || state.flags.includes('hoang_giap')) {
      startRank = 4;
      examBonusCopper = 3500;
    } else if (state.flags.includes('do_tien_si') || state.flags.includes('giai_nguyen')) {
      startRank = 3;
      examBonusCopper = 2000;
    } else if (state.flags.includes('do_cu_nhan')) {
      startRank = 2;
      examBonusCopper = 800;
    }

    const { profile: offProfile, nextPrng } = createOfficialProfile(state, track, startRank, false);
    const roleName = getOfficialTitle(startRank, track);
    const atHome = isHomePostingAtBirthPlace(state.family?.birthPlace, offProfile.posting);
    const next = applyOfficialScheduleAndClearCareer(
      applyEffects(
        { ...state, prngState: nextPrng },
        {
          add_flags: ['dang_lam_quan'],
          copper: examBonusCopper,
          fame: 8,
          milestone_title: `Bổ nhiệm ${roleName}`,
        },
      ),
      track,
      offProfile.posting,
    );
    return {
      ...next,
      officialRank: startRank,
      official: offProfile,
      profile: { ...next.profile, currentRole: roleName },
      logs: appendLog(
        next.logs,
        next.profile.totalDays,
        'event',
        atHome
          ? `Triều đình hạ chỉ bổ nhiệm bạn làm ${roleName} (Nhiệm sở ngay tại ${POSTING_LABELS[offProfile.posting]}, không phải đi xa nhậm chức).`
          : `Triều đình hạ chỉ bổ nhiệm bạn làm ${roleName}. Bạn thu xếp hành trang tới ${POSTING_LABELS[offProfile.posting]} nhận chức và mở phủ nha riêng.`,
      ),
    };
  }

  return evaluateKhaoKhoa(state);
}

export function canGrantRoyalPrivilege(state: ActiveLifeState): { ok: boolean; reason?: string } {
  if (state.profile.originClass !== 'hoang_toc') {
    return { ok: false, reason: 'Chỉ dành cho thân thế Hoàng tộc' };
  }
  if (
    state.profile.gender === 'female' &&
    !state.flags.includes('nu_cai_nam_trang') &&
    !state.flags.includes('nu_quan_dac_xa')
  ) {
    return { ok: false, reason: 'Công chúa / Quận chúa cần cải nam trang để thụ phong ngoại triều' };
  }
  if (state.officialRank > 0) {
    return { ok: false, reason: 'Đã có chức vị triều đình' };
  }
  if (state.flags.includes('thai_giam') || state.flags.includes('trong_hau_cung') || state.flags.includes('bi_truy_na')) {
    return { ok: false, reason: 'Thân phận hiện tại không thể thụ phong ngoại triều' };
  }
  const age = getAgeYears(state.profile.totalDays);
  if (age < 16) {
    return { ok: false, reason: 'Cần đủ 16 tuổi để vào triều thụ phong' };
  }
  if (state.stats.education < 25 && state.stats.martial < 25 && state.stats.fame < 25) {
    return { ok: false, reason: 'Cần Học thức, Võ nghệ hoặc Thanh danh >= 25' };
  }
  return { ok: true };
}

export function grantRoyalPrivilege(state: ActiveLifeState): ActiveLifeState {
  if (!canGrantRoyalPrivilege(state).ok) return state;

  const isHighMerit =
    state.stats.fame >= 45 && (state.stats.education >= 50 || state.stats.martial >= 50);
  const startRank = isHighMerit ? 5 : 4;
  const track = state.stats.martial > state.stats.education + 10 ? 'vo' : 'van';
  const { profile: offProfile, nextPrng } = createOfficialProfile(state, track, startRank, false);
  const roleName = getOfficialTitle(startRank, track);

  const atHome = isHomePostingAtBirthPlace(state.family?.birthPlace, offProfile.posting);
  const next = applyOfficialScheduleAndClearCareer(
    applyEffects(
      { ...state, prngState: nextPrng },
      {
        add_flags: ['dang_lam_quan', 'tap_am_hoang_toc'],
        fame: 8,
        happiness: 10,
        milestone_title: `Thụ phong Hoàng thất: ${roleName}`,
      },
    ),
    track,
    offProfile.posting,
  );
  return {
    ...next,
    officialRank: startRank,
    official: offProfile,
    profile: { ...next.profile, currentRole: roleName },
    logs: appendLog(
      next.logs,
      next.profile.totalDays,
      'event',
      atHome
        ? `Theo lệ Tập ấm Hoàng thất, Bệ hạ hạ chỉ thụ phong bạn làm ${roleName} tại ${POSTING_LABELS[offProfile.posting]}!`
        : `Theo lệ Tập ấm Hoàng thất, Bệ hạ hạ chỉ thụ phong bạn làm ${roleName}, điều tới ${POSTING_LABELS[offProfile.posting]} mở phủ nhậm chức!`,
    ),
  };
}

export function canBuyOfficialTitle(state: ActiveLifeState): { ok: boolean; reason?: string; cost: number } {
  const COST = 150000;
  const age = getAgeYears(state.profile.totalDays);
  if (state.profile.originClass === 'hoang_toc') {
    return { ok: false, reason: 'Hoàng tộc dùng lệ Tập ấm, không cần quyên quan', cost: COST };
  }
  if (
    state.profile.gender === 'female' &&
    !state.flags.includes('nu_cai_nam_trang') &&
    !state.flags.includes('nu_quan_dac_xa')
  ) {
    return { ok: false, reason: 'Nữ giới cần cải nam trang hoặc có đặc xá mới được bổ quan', cost: COST };
  }
  if (state.flags.includes('thai_giam') || state.flags.includes('trong_hau_cung')) {
    return { ok: false, reason: 'Thân phận nội đình không thể quyên quan ngoại triều', cost: COST };
  }
  if (state.livelihoodStatus === 'prison' || state.flags.includes('dang_o_tu')) {
    return { ok: false, reason: 'Đang chịu án tù không thể quyên quan', cost: COST };
  }
  if (state.officialRank > 0) {
    return { ok: false, reason: 'Đã có phẩm hàm triều đình', cost: COST };
  }
  if (age < 18) {
    return { ok: false, reason: 'Cần đủ 18 tuổi mới được quyên quan hư hàm', cost: COST };
  }
  if (state.stats.education < 15) {
    return { ok: false, reason: 'Cần Học thức ≥ 15 (biết đọc viết công văn)', cost: COST };
  }
  if (state.assets.wealthCopper < COST) {
    return { ok: false, reason: 'Cần 15 Vàng (150.000đ) để mua Cửu phẩm hư hàm', cost: COST };
  }
  return { ok: true, cost: COST };
}

export function buyOfficialTitle(state: ActiveLifeState): ActiveLifeState {
  const elig = canBuyOfficialTitle(state);
  if (!elig.ok) return state;

  const { profile: offProfile, nextPrng } = createOfficialProfile(state, 'van', 1, true);
  const next = applyOfficialScheduleAndClearCareer(
    applyEffects(
      { ...state, prngState: nextPrng },
      {
        copper: -elig.cost,
        add_flags: ['dang_lam_quan', 'quyen_quan'],
        infamy: 10,
        milestone_title: 'Quyên quan mua Cửu phẩm hư hàm',
      },
    ),
    'van',
    offProfile.posting,
  );
  return {
    ...next,
    officialRank: 1,
    official: offProfile,
    profile: { ...next.profile, currentRole: `${offProfile.title} (Quyên quan)` },
    logs: appendLog(
      next.logs,
      next.profile.totalDays,
      'event',
      'Bạn bỏ 15 Vàng quyên quan, nhận Cửu phẩm hư hàm (trần thăng tiến tối đa Ngũ phẩm).',
    ),
  };
}

export function getMaxPropertyLimit(originClass: OriginClass): number {
  return originClass === 'dia_chu' || originClass === 'quan_lai' || originClass === 'hoang_toc' ? 12 : 8;
}

export function buyProperty(state: ActiveLifeState, propertyId: string, useProxy = false): ActiveLifeState {
  const spec = PROPERTY_CATALOG.find((p) => p.id === propertyId);
  if (!spec) return state;
  if (state.assets.properties.length >= getMaxPropertyLimit(state.profile.originClass)) {
    return state;
  }
  const rule = checkOfficialPropertyRule(state, propertyId, useProxy);
  if (!rule.allowed) return state;

  const baseCost = getPropertyMarketCost(spec, state.world.worldState);
  const cost = rule.isProxyViolationRisk ? Math.round(baseCost * 1.15) : baseCost;
  if (state.assets.wealthCopper < cost) return state;

  const next = applyEffects(state, {
    copper: -cost,
    fame: rule.isProxyViolationRisk ? 0 : 2,
    scandal_risk: rule.isProxyViolationRisk ? 8 : 0,
    milestone_title: state.assets.properties.includes(spec.id) ? undefined : `Mua ${spec.name}`,
  });
  return {
    ...next,
    official:
      rule.isProxyViolationRisk && next.official
        ? {
            ...next.official,
            proxyBusinessIds: [...next.official.proxyBusinessIds, spec.id],
          }
        : next.official,
    assets: {
      ...next.assets,
      properties: [...next.assets.properties, spec.id],
    },
    logs: appendLog(
      next.logs,
      next.profile.totalDays,
      rule.isProxyViolationRisk ? 'warning' : 'survival',
      rule.isProxyViolationRisk
        ? `Bạn nhờ gia nhân đứng tên ngầm mua ${spec.name} (-${cost}đ, Hiềm nghi +8).`
        : `Bạn tậu thêm ${spec.name} với giá ${cost} đồng.`,
    ),
  };
}

export function sellProperty(state: ActiveLifeState, propertyId: string): ActiveLifeState {
  const spec = PROPERTY_CATALOG.find((p) => p.id === propertyId);
  const idx = state.assets.properties.indexOf(propertyId);
  if (!spec || idx === -1) return state;

  const salePrice = Math.round(getPropertyMarketCost(spec, state.world.worldState) * 0.7);
  const nextProps = [...state.assets.properties];
  nextProps.splice(idx, 1);

  const next = applyEffects(state, { copper: salePrice });
  return {
    ...next,
    assets: {
      ...next.assets,
      properties: nextProps,
    },
    logs: appendLog(
      next.logs,
      next.profile.totalDays,
      'survival',
      `Bạn bán bớt 1 ${spec.name}, thu về ${salePrice} đồng.`,
    ),
  };
}

export function upgradeHousing(state: ActiveLifeState, tier: HousingTier): ActiveLifeState {
  const spec = HOUSING_UPGRADES.find((h) => h.tier === tier);
  if (!spec) return state;
  if (HOUSING_ORDER[tier] <= HOUSING_ORDER[state.assets.housing]) return state;
  if (!checkHousingTiemLe(state, tier).allowed) return state;
  const cost = getHousingMarketCost(tier, state.world.worldState);
  if (state.assets.wealthCopper < cost) return state;

  const next = applyEffects(state, {
    copper: -cost,
    set_housing: tier,
    happiness: 10,
  });
  return {
    ...next,
    logs: appendLog(next.logs, next.profile.totalDays, 'survival', `Bạn dọn sang nơi ở mới: ${spec.label} (-${cost}đ).`),
  };
}

export function contributeRebellionTreasury(state: ActiveLifeState, amountCopper: number): ActiveLifeState {
  if (amountCopper <= 0 || state.assets.wealthCopper < amountCopper) return state;
  const rebellion = state.rebellion ?? { treasuryCopper: 0, armyPower: 0 };
  const next = applyEffects(state, { copper: -amountCopper });
  return {
    ...next,
    rebellion: {
      ...rebellion,
      treasuryCopper: rebellion.treasuryCopper + amountCopper,
    },
    logs: appendLog(next.logs, next.profile.totalDays, 'event', `Chuyển ${amountCopper} đồng vào ngân khố mật thất.`),
  };
}

export function canRecruitRebellionArmy(state: ActiveLifeState): { ok: boolean; reason?: string; cost: number } {
  const COST = 25000;
  const hasBase =
    state.flags.includes('trong_quan_ngu') ||
    state.official?.track === 'vo' ||
    state.assets.properties.includes('trang_vien_cho_thue') ||
    state.assets.properties.includes('thai_ap_ton_that') ||
    state.stats.fame >= 80 ||
    state.stats.infamy >= 80;

  if (!hasBase) {
    return {
      ok: false,
      reason: 'Cần có căn cứ (Trang viên/Thái ấp, Quan Võ, hoặc Thanh danh/Tai tiếng >= 80) mới chiêu mộ được tử sĩ',
      cost: COST,
    };
  }
  const rebellion = state.rebellion ?? { treasuryCopper: 0, armyPower: 0 };
  if (rebellion.treasuryCopper < COST) {
    return { ok: false, reason: 'Cần 2.5 Vàng (25.000đ) trong ngân khố mật thất', cost: COST };
  }
  return { ok: true, cost: COST };
}

export function recruitRebellionArmy(state: ActiveLifeState): ActiveLifeState {
  const elig = canRecruitRebellionArmy(state);
  if (!elig.ok) return state;
  const rebellion = state.rebellion ?? { treasuryCopper: 0, armyPower: 0 };
  const next = applyEffects(state, {
    infamy: 8,
    scandal_risk: state.officialRank > 0 ? 12 : 0,
  });
  return {
    ...next,
    rebellion: {
      treasuryCopper: rebellion.treasuryCopper - elig.cost,
      armyPower: rebellion.armyPower + 10,
    },
    logs: appendLog(
      next.logs,
      next.profile.totalDays,
      'warning',
      'Chiêu mộ thêm 10 tử sĩ vào mật thất (-25.000đ, +10 Binh quyền, tốn lương nuôi hàng tháng).',
    ),
  };
}

export function getRebellionSuccessChance(state: ActiveLifeState): number {
  const rebellion = state.rebellion ?? { treasuryCopper: 0, armyPower: 0 };
  let chance = 0.25;
  if (rebellion.treasuryCopper >= 100000) chance += 0.2;
  if (state.stats.martial >= 50) chance += 0.15;
  if (rebellion.armyPower >= 100) chance += 0.2;

  if (state.world.worldState === 'binh_on') chance -= 0.4;
  else if (state.world.worldState === 'mat_mua') chance += 0.25;
  else if (state.world.worldState === 'dich_benh') chance += 0.3;
  else if (state.world.worldState === 'chien_tranh') chance += 0.4;

  return Math.max(0.05, Math.min(0.95, chance));
}

export function launchRebellion(state: ActiveLifeState): ActiveLifeState {
  const chance = getRebellionSuccessChance(state);
  const roll = mulberry32Next(state.prngState);
  let next: ActiveLifeState = { ...state, prngState: roll.nextState };

  if (roll.value <= chance) {
    const emperorTitle = next.profile.gender === 'female' ? 'Khai quốc Nữ đế' : 'Khai quốc Hoàng đế';
    next = applyEffects(next, {
      fame: 100,
      add_flags: ['khai_quoc_hoang_de'],
      milestone_title: `Phất cờ khởi nghĩa, đăng cơ ${emperorTitle}!`,
    });
    return {
      ...next,
      officialRank: 10,
      isAlive: false,
      deathReason: `Hoàn thành đại nghiệp: Đăng cơ ${emperorTitle}, lưu danh sử sách!`,
      profile: { ...next.profile, currentRole: emperorTitle },
      logs: appendLog(next.logs, next.profile.totalDays, 'event', `Đại quân tiến vào kinh thành! Bạn chính thức lên ngôi ${emperorTitle}!`),
    };
  }

  return applyEffects(next, {
    kill_reason: 'Khởi nghĩa thất bại, bị triều đình bắt giữ và xử trảm nơi pháp trường',
  });
}
