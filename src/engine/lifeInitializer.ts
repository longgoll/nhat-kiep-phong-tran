import {
  DAYS_PER_YEAR,
  type ActiveLifeState,
  type BirthOrder,
  type CohortPeer,
  type FamilyContext,
  type FamilyLivingTier,
  type Gender,
  type HousingTier,
  type NPC,
  type OriginClass,
} from '../types/activeLife';
import { calculateRicePrice } from './economy';
import { generateRandomSeed, mulberry32Next, pickWeightedIndex, randomInt } from './prng';

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

const BIRTH_PLACES_BY_ORIGIN: Record<OriginClass, string[]> = {
  ban_nong: ['Làng quê đồng bằng Bắc Bộ', 'Xóm chài ven sông Hồng', 'Thôn nghèo vùng đồi trung du', 'Xã ven đê miền Trung'],
  thu_cong: ['Phố nghề Thăng Long', 'Thị tứ ven sông', 'Làng gốm cổ truyền', 'Chợ huyện sầm uất'],
  dia_chu: ['Điền trang vùng trù phú', 'Ấp lớn phủ Hải Dương', 'Thị trấn giao thương'],
  quan_lai: ['Phủ đệ Kinh thành', 'Dinh thự Phủ thành', 'Phố quan lại Tràng An'],
  hoang_toc: ['Hoàng cung Tử Cấm Thành', 'Phủ Tôn thất Kinh thành'],
};

const FAMILY_NAMES_BY_ORIGIN: Record<OriginClass, string[]> = {
  ban_nong: ['Nguyễn', 'Trần', 'Lê', 'Phạm', 'Hoàng', 'Vũ', 'Đặng', 'Bùi'],
  thu_cong: ['Đỗ', 'Hồ', 'Ngô', 'Dương', 'Lý', 'Phan'],
  dia_chu: ['Trịnh', 'Đoàn', 'Tạ', 'Chu', 'Vương'],
  quan_lai: ['Nguyễn', 'Trần', 'Lê', 'Phạm', 'Ngô'],
  hoang_toc: ['Lý', 'Trần', 'Lê', 'Nguyễn'],
};

const MALE_GIVEN_NAMES = ['An', 'Bình', 'Minh', 'Khang', 'Tuấn', 'Quân', 'Long', 'Hải', 'Khoa', 'Tâm', 'Đức', 'Phúc'];
const FEMALE_GIVEN_NAMES = ['Lan', 'Huệ', 'Mai', 'Cúc', 'Trúc', 'Ngọc', 'Hoa', 'Thảo', 'Liên', 'Nga', 'Vân', 'Chi'];
const RUSTIC_NICKNAMES = ['Cu Tí', 'Thằng Cò', 'Cái Hến', 'Con Mít', 'Thằng Đực', 'Cái Tẻo'];

const DYNASTY_NAMES = ['Đại Việt', 'Đại Ngu', 'Đại Nam', 'Hồng Đức', 'Thái Bình'];

export const TRAIT_LABELS: Record<string, string> = {
  ham_hoc: 'Ham học',
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
  wealthMult?: number;
  bonusStats?: { health?: number; education?: number; martial?: number; craftTrade?: number; fame?: number };
}

const FATHER_OCCUPATIONS: Record<OriginClass, OccupationSpec[]> = {
  ban_nong: [
    { id: 'ta_dien', label: 'Tá điền làm thuê', bonusStats: { health: 4 } },
    { id: 'tho_san', label: 'Thợ săn vùng đồi', bonusStats: { health: 5, martial: 3 } },
    { id: 'ngu_dan', label: 'Ngư dân chài lưới', bonusStats: { health: 4, craftTrade: 2 } },
    { id: 'thay_do_ngheo', label: 'Thầy đồ nghèo dạy chữ', wealthMult: 0.9, bonusStats: { education: 5, health: -3 } },
    { id: 'phu_khuon_vac', label: 'Phu khuân vác bến thuyền', bonusStats: { health: 5, martial: 2 } },
  ],
  thu_cong: [
    { id: 'tho_ren', label: 'Thợ rèn rèn nông cụ', bonusStats: { martial: 3, craftTrade: 4 } },
    { id: 'tho_moc', label: 'Thợ mộc đóng đồ gỗ', bonusStats: { craftTrade: 5 } },
    { id: 'thay_lang', label: 'Thầy lang bốc thuốc nam', bonusStats: { education: 4, craftTrade: 3 } },
    { id: 'lai_buon', label: 'Tiểu thương buôn chuyến', wealthMult: 1.15, bonusStats: { craftTrade: 6 } },
    { id: 'tho_gom', label: 'Thợ gốm làng nghề', bonusStats: { craftTrade: 5 } },
  ],
  dia_chu: [
    { id: 'dien_chu', label: 'Điền chủ nhiều ruộng đất', bonusStats: { fame: 3 } },
    { id: 'hao_phu', label: 'Hào phú buôn muối & tơ lụa', wealthMult: 1.2, bonusStats: { craftTrade: 6, fame: 2 } },
    { id: 'chu_duoc_phong', label: 'Chủ hiệu thuốc bắc lớn', bonusStats: { education: 4, craftTrade: 4 } },
  ],
  quan_lai: [
    { id: 'quan_van', label: 'Quan văn thanh liêm', wealthMult: 0.65, bonusStats: { education: 8, fame: 5 } },
    { id: 'quan_vo', label: 'Quan võ trấn ải', wealthMult: 0.85, bonusStats: { martial: 8, fame: 4 } },
    { id: 'tham_quan', label: 'Quan phủ nhiều mưu mẹo', wealthMult: 1.4, bonusStats: { craftTrade: 5, fame: 1 } },
  ],
  hoang_toc: [
    { id: 'hoang_de', label: 'Hoàng thượng trị vì', bonusStats: { fame: 10, education: 5 } },
  ],
};

const MOTHER_OCCUPATIONS: Record<OriginClass, OccupationSpec[]> = {
  ban_nong: [
    { id: 'lam_ruong', label: 'Làm ruộng & hái củi' },
    { id: 'det_vai', label: 'Dệt vải thô bán chợ' },
    { id: 'ban_hang_rong', label: 'Bán hàng rong đầu làng' },
  ],
  thu_cong: [
    { id: 'theu_thua', label: 'Thêu thùa & may vá' },
    { id: 'ban_hang_xom', label: 'Trông coi sạp hàng nhỏ' },
    { id: 'det_lua', label: 'Dệt lụa truyền thống' },
  ],
  dia_chu: [
    { id: 'quan_gia_noi_tro', label: 'Quản lý điền trang & gia nhân' },
    { id: 'tieu_thu', label: 'Tiểu thư khuê các' },
  ],
  quan_lai: [
    { id: 'phu_nhan', label: 'Phu nhân phủ quan' },
  ],
  hoang_toc: [
    { id: 'hoang_hau_phi_tan', label: 'Hoàng hậu / Phi tần' },
  ],
};

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

const CIRCUMSTANCES_BY_ORIGIN: Record<OriginClass, CircumstanceSpec[]> = {
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

const SIBLING_PERSONALITIES = ['Ngoan hiền', 'Nghịch ngợm', 'Ham học', 'Nhút nhát', 'Khéo léo', 'Hay ốm'];

function computeLivingTier(wealthCopper: number, originClass: OriginClass): FamilyLivingTier {
  if (originClass === 'hoang_toc') return 'hoang_gia';
  if (wealthCopper >= 12000) return 'sung_tuc';
  if (wealthCopper >= 3000) return 'kha_gia';
  if (wealthCopper >= 350) return 'du_an';
  return 'tung_thieu';
}

export function createNewLife(customSeed?: number): ActiveLifeState {
  const seed = customSeed !== undefined ? customSeed >>> 0 : generateRandomSeed();
  let prng = seed;

  // 1. Gender (50/50)
  const gRoll = mulberry32Next(prng);
  prng = gRoll.nextState;
  const gender: Gender = gRoll.value < 0.5 ? 'male' : 'female';

  // 2. Origin Class (weighted)
  const origins: OriginClass[] = ['ban_nong', 'thu_cong', 'dia_chu', 'quan_lai', 'hoang_toc'];
  const weights = origins.map((o) => ORIGIN_METADATA[o].weight);
  const oPick = pickWeightedIndex(prng, weights);
  prng = oPick.nextState;
  const originClass = origins[oPick.index];

  // 3. Name generation
  const surnames = FAMILY_NAMES_BY_ORIGIN[originClass];
  const sPick = randomInt(prng, 0, surnames.length - 1);
  prng = sPick.nextState;
  const surname = surnames[sPick.value];

  let fullName: string;
  if (originClass === 'ban_nong') {
    const nickRoll = mulberry32Next(prng);
    prng = nickRoll.nextState;
    if (nickRoll.value < 0.35) {
      const nPick = randomInt(prng, 0, RUSTIC_NICKNAMES.length - 1);
      prng = nPick.nextState;
      fullName = `${surname} ${RUSTIC_NICKNAMES[nPick.value]}`;
    } else {
      const pool = gender === 'male' ? MALE_GIVEN_NAMES : FEMALE_GIVEN_NAMES;
      const nPick = randomInt(prng, 0, pool.length - 1);
      prng = nPick.nextState;
      fullName = `${surname} Văn ${pool[nPick.value]}`.replace('Văn ', gender === 'male' ? 'Văn ' : 'Thị ');
    }
  } else {
    const pool = gender === 'male' ? MALE_GIVEN_NAMES : FEMALE_GIVEN_NAMES;
    const nPick = randomInt(prng, 0, pool.length - 1);
    prng = nPick.nextState;
    const middle = gender === 'male' ? 'Quang' : 'Ngọc';
    fullName = `${surname} ${middle} ${pool[nPick.value]}`;
  }

  // 4. Starting family wealth, rice, stats, occupations & circumstances
  let familyWealthCopper = 40;
  let health = 70;
  let happiness = 70;
  let education = 0;
  let martial = 0;
  let craftTrade = 0;
  let fame = 0;

  if (originClass === 'ban_nong') {
    const c = randomInt(prng, 30, 120);
    prng = c.nextState;
    familyWealthCopper = c.value;
    const r = randomInt(prng, 4, 10);
    prng = r.nextState;
    health = 75;
  } else if (originClass === 'thu_cong') {
    const c = randomInt(prng, 400, 1100);
    prng = c.nextState;
    familyWealthCopper = c.value;
    const r = randomInt(prng, 15, 30);
    prng = r.nextState;
    craftTrade = 5;
  } else if (originClass === 'dia_chu') {
    const c = randomInt(prng, 5000, 15000);
    prng = c.nextState;
    familyWealthCopper = c.value;
    const r = randomInt(prng, 100, 250);
    prng = r.nextState;
    health = 75;
    education = 5;
    fame = 5;
  } else if (originClass === 'quan_lai') {
    const c = randomInt(prng, 15000, 40000);
    prng = c.nextState;
    familyWealthCopper = c.value;
    const r = randomInt(prng, 200, 500);
    prng = r.nextState;
    health = 72;
    education = 10;
    fame = 15;
  } else {
    const c = randomInt(prng, 80000, 200000);
    prng = c.nextState;
    familyWealthCopper = c.value;
    health = 62;
    education = 12;
    fame = 30;
  }

  // Parent occupations
  const fOccList = FATHER_OCCUPATIONS[originClass];
  const fOccPick = randomInt(prng, 0, fOccList.length - 1);
  prng = fOccPick.nextState;
  let fatherOcc = fOccList[fOccPick.value];

  const mOccList = MOTHER_OCCUPATIONS[originClass];
  const mOccPick = randomInt(prng, 0, mOccList.length - 1);
  prng = mOccPick.nextState;
  let motherOcc = mOccList[mOccPick.value];

  if (fatherOcc.wealthMult !== undefined) {
    familyWealthCopper = Math.max(10, Math.round(familyWealthCopper * fatherOcc.wealthMult));
  }
  if (fatherOcc.bonusStats) {
    health += fatherOcc.bonusStats.health ?? 0;
    education += fatherOcc.bonusStats.education ?? 0;
    martial += fatherOcc.bonusStats.martial ?? 0;
    craftTrade += fatherOcc.bonusStats.craftTrade ?? 0;
    fame += fatherOcc.bonusStats.fame ?? 0;
  }

  // Family circumstance (origin-specific)
  const circList = CIRCUMSTANCES_BY_ORIGIN[originClass];
  const circPick = randomInt(prng, 0, circList.length - 1);
  prng = circPick.nextState;
  const circ = circList[circPick.value];

  if (circ.isTonThat) {
    fatherOcc = { id: 'quan_vuong', label: 'Quận vương Tôn thất' };
    motherOcc = { id: 'vuong_phi', label: 'Vương phi' };
  } else if (originClass === 'hoang_toc' && circ.fatherAlive === false) {
    fatherOcc = { id: 'tien_de', label: 'Tiên đế quá cố' };
  }

  familyWealthCopper = Math.max(10, Math.round(familyWealthCopper * circ.wealthMult));
  happiness = Math.max(30, Math.min(95, happiness + circ.happinessDelta));
  fame = Math.max(0, fame + (circ.fameDelta ?? 0));

  const initialFlags: string[] = [...(circ.extraFlags ?? [])];
  if (initialFlags.includes('gia_phong_thu_huong')) education += 3;
  if (initialFlags.includes('gia_phong_vo_hoc')) martial += 3;

  // 5. Initial NPCs (Named Parents + Siblings)
  const fNamePick = randomInt(prng, 0, MALE_GIVEN_NAMES.length - 1);
  prng = fNamePick.nextState;
  const fatherName =
    originClass === 'hoang_toc'
      ? circ.isTonThat
        ? `${surname} Quận Vương`
        : circ.fatherAlive === false
          ? `${surname} Tiên Đế`
          : `${surname} Hoàng Thượng`
      : `${surname} Văn ${MALE_GIVEN_NAMES[fNamePick.value]}`;

  const mNamePick = randomInt(prng, 0, FEMALE_GIVEN_NAMES.length - 1);
  prng = mNamePick.nextState;
  const motherName =
    originClass === 'hoang_toc'
      ? circ.isTonThat
        ? 'Vương Phi'
        : circ.id === 'that_sung'
          ? 'Phi Tần thất sủng'
          : 'Hoàng Hậu / Phi Tần'
      : `Bà Thị ${FEMALE_GIVEN_NAMES[mNamePick.value]}`;

  const fAff = randomInt(prng, 45, 80);
  prng = fAff.nextState;
  const mAff = randomInt(prng, 55, 85);
  prng = mAff.nextState;

  const mAgePick = randomInt(prng, 19, 34);
  prng = mAgePick.nextState;
  const motherAgeAtBirth = mAgePick.value;
  const fAgeDiffPick = randomInt(prng, 2, 9);
  prng = fAgeDiffPick.nextState;
  const fatherAgeAtBirth = motherAgeAtBirth + fAgeDiffPick.value;

  const npcs: NPC[] = [
    {
      id: 'npc_father',
      name: fatherName,
      gender: 'male',
      relation: 'parent',
      affinity: Math.min(100, Math.max(-100, fAff.value + circ.parentAffDelta)),
      isAlive: circ.fatherAlive !== false,
      role: circ.fatherAlive === false ? `Cha ruột (Đã mất) • ${fatherOcc.label}` : `Cha ruột • ${fatherOcc.label}`,
      age: fatherAgeAtBirth,
    },
    {
      id: 'npc_mother',
      name: motherName,
      gender: 'female',
      relation: 'parent',
      affinity: Math.min(100, Math.max(-100, mAff.value + circ.parentAffDelta)),
      isAlive: true,
      role: `Mẹ ruột • ${motherOcc.label}`,
      age: motherAgeAtBirth,
    },
  ];

  // Siblings & Birth order
  const sibCountRoll = randomInt(prng, 0, 3);
  prng = sibCountRoll.nextState;
  const sibCount = sibCountRoll.value;

  let birthOrder: BirthOrder = 'con_mot';
  let birthOrderLabel = 'Con một';
  if (sibCount > 0) {
    const orderRoll = randomInt(prng, 0, 2);
    prng = orderRoll.nextState;
    if (orderRoll.value === 0) {
      birthOrder = 'con_truong';
      birthOrderLabel = 'Con trưởng';
    } else if (orderRoll.value === 1 && sibCount >= 2) {
      birthOrder = 'con_thu';
      birthOrderLabel = 'Con thứ';
    } else {
      birthOrder = 'con_ut';
      birthOrderLabel = 'Con út';
    }
  }

  for (let i = 0; i < sibCount; i += 1) {
    const sgRoll = mulberry32Next(prng);
    prng = sgRoll.nextState;
    const sGender: Gender = sgRoll.value < 0.5 ? 'male' : 'female';
    const sPool = sGender === 'male' ? MALE_GIVEN_NAMES : FEMALE_GIVEN_NAMES;
    const snPick = randomInt(prng, 0, sPool.length - 1);
    prng = snPick.nextState;
    const spPick = randomInt(prng, 0, SIBLING_PERSONALITIES.length - 1);
    prng = spPick.nextState;
    const sAff = randomInt(prng, 35, 80);
    prng = sAff.nextState;

    const isOlder = birthOrder === 'con_ut' || (birthOrder === 'con_thu' && i === 0);
    const sibTitle = isOlder
      ? sGender === 'male'
        ? 'Anh trai'
        : 'Chị gái'
      : sGender === 'male'
        ? 'Em trai'
        : 'Em gái';
    const sibAgePick = randomInt(prng, 2, 7);
    prng = sibAgePick.nextState;
    const sibAge = isOlder ? sibAgePick.value : 0;

    npcs.push({
      id: `npc_sibling_${i + 1}`,
      name: `${surname} ${sGender === 'male' ? 'Văn' : 'Thị'} ${sPool[snPick.value]}`,
      gender: sGender,
      relation: 'sibling',
      affinity: sAff.value,
      isAlive: true,
      role: `${sibTitle} (${SIBLING_PERSONALITIES[spPick.value]})`,
      age: sibAge,
    });
  }

  if (originClass === 'hoang_toc') {
    const rAff = randomInt(prng, -15, 15);
    prng = rAff.nextState;
    npcs.push({
      id: 'npc_royal_rival',
      name: `${surname} Hoàng Huynh`,
      gender: 'male',
      relation: 'rival',
      affinity: rAff.value,
      isAlive: true,
      role: 'Hoàng tử tranh đoạt ngôi vị',
      age: 4,
    });
  }

  const bpPool = BIRTH_PLACES_BY_ORIGIN[originClass];
  const bpPick = randomInt(prng, 0, bpPool.length - 1);
  prng = bpPick.nextState;
  const birthPlace =
    originClass === 'hoang_toc' && circ.isTonThat
      ? 'Phủ Tôn thất Kinh thành'
      : originClass === 'quan_lai' && initialFlags.includes('gia_toc_sa_sut')
        ? 'Quê cũ vùng ngoại ô'
        : bpPool[bpPick.value];

  const family: FamilyContext = {
    fatherOccupation: fatherOcc.id,
    fatherOccupationLabel: fatherOcc.label,
    motherOccupation: motherOcc.id,
    motherOccupationLabel: motherOcc.label,
    circumstance: circ.id,
    circumstanceLabel: circ.label,
    birthOrder,
    birthOrderLabel,
    familyWealthCopper,
    familyLivingTier: computeLivingTier(familyWealthCopper, originClass),
    birthPlace,
    fatherAgeAtBirth,
    motherAgeAtBirth,
  };

  // Generate 4 cohort peers born at the exact same moment across the realm
  const peerOrigins: OriginClass[] = ['ban_nong', 'thu_cong', 'dia_chu', 'quan_lai'];
  const cohortPeers: CohortPeer[] = peerOrigins.map((pOrigin, idx) => {
    const pgRoll = mulberry32Next(prng);
    prng = pgRoll.nextState;
    const pGender: Gender = pgRoll.value < 0.5 ? 'male' : 'female';
    const pSurnames = FAMILY_NAMES_BY_ORIGIN[pOrigin];
    const psPick = randomInt(prng, 0, pSurnames.length - 1);
    prng = psPick.nextState;
    const pGivenPool = pGender === 'male' ? MALE_GIVEN_NAMES : FEMALE_GIVEN_NAMES;
    const pnPick = randomInt(prng, 0, pGivenPool.length - 1);
    prng = pnPick.nextState;
    const pName = `${pSurnames[psPick.value]} ${pGender === 'male' ? 'Văn' : 'Thị'} ${pGivenPool[pnPick.value]}`;
    const pPlacePool = BIRTH_PLACES_BY_ORIGIN[pOrigin];
    const pbPick = randomInt(prng, 0, pPlacePool.length - 1);
    prng = pbPick.nextState;
    const pCircPool = CIRCUMSTANCES_BY_ORIGIN[pOrigin];
    const pcPick = randomInt(prng, 0, Math.min(2, pCircPool.length - 1));
    prng = pcPick.nextState;
    const deathRoll = randomInt(prng, 28, 78);
    prng = deathRoll.nextState;

    return {
      id: `peer_${idx + 1}`,
      name: pName,
      gender: pGender,
      originClass: pOrigin,
      originLabel: ORIGIN_METADATA[pOrigin].label,
      birthPlace: pPlacePool[pbPick.value],
      circumstanceSummary: pCircPool[pcPick.value].label,
      deathAge: deathRoll.value,
    };
  });

  // Personal pocket assets at birth = 0 (family manages finances during 0-12)
  const wealthCopper = 0;
  const personalRice = 0;

  // 6. Dynasty
  const dPick = randomInt(prng, 0, DYNASTY_NAMES.length - 1);
  prng = dPick.nextState;
  const yPick = randomInt(prng, 1, 25);
  prng = yPick.nextState;

  const dynastyName = DYNASTY_NAMES[dPick.value];
  const meta = ORIGIN_METADATA[originClass];
  const initialHousing = circ.housingOverride ?? meta.housing;
  let initialRoleLabel = meta.roleLabel;
  if (originClass === 'hoang_toc' && circ.isTonThat) {
    initialRoleLabel = gender === 'male' ? 'Thế tử phủ Tôn thất' : 'Quận chúa phủ Tôn thất';
  } else if (originClass === 'quan_lai' && initialFlags.includes('gia_toc_sa_sut')) {
    initialRoleLabel = 'Con nhà quan sa sút';
  }
  const fatherLogDesc =
    circ.fatherAlive === false
      ? `cha (${fatherOcc.label.toLowerCase()}) đã mất sớm`
      : `cha làm ${fatherOcc.label.toLowerCase()}`;

  return {
    schemaVersion: 1,
    seed,
    prngState: prng,
    isAlive: true,
    profile: {
      fullName,
      gender,
      originClass,
      currentRole: initialRoleLabel,
      totalDays: 0,
    },
    family,
    traits: [],
    interests: [],
    stats: {
      health: Math.max(25, Math.min(100, health)),
      happiness,
      relationships: 60,
      education,
      stamina: 100,
      maxStamina: 100,
      martial,
      craftTrade,
      fame,
      infamy: 0,
    },
    assets: {
      wealthCopper,
      rice: personalRice,
      housing: initialHousing,
      properties: [],
    },
    world: {
      dynastyName,
      yearInEra: yPick.value,
      season: 'spring',
      ricePriceInCopper: calculateRicePrice('spring', 'binh_on'),
      worldState: 'binh_on',
    },
    schedule: {
      childhoodFocus: undefined,
      morning: 'act_nghi_ngoi',
      afternoon: 'act_nghi_ngoi',
      evening: 'act_nghi_ngoi',
      night: 'act_ngu',
      lifestyle: originClass === 'ban_nong' ? 'chao_loang' : 'com_rau',
      lifeFocus: 'sinh_ton',
      fallbackRules: [],
      autoBuyRice: true,
    },
    npcs,
    cohortPeers,
    flags: initialFlags,
    officialRank: 0,
    exposureRisk: 0,
    rebellion: {
      treasuryCopper: 0,
      armyPower: 0,
    },
    delayedEvents: [],
    eventCooldowns: {},
    milestones: [
      {
        totalDays: 0,
        ageYears: 0,
        title: `Chào đời (${meta.label})`,
        netWorthInCopper: familyWealthCopper,
        fame,
      },
    ],
    yearlyHappiness: { 0: happiness },
    logs: [
      {
        day: 0,
        category: 'birth',
        text: `Năm ${dynastyName} thứ ${yPick.value}, ${fullName} chào đời tại ${birthPlace} trong ${meta.label.toLowerCase()} (${birthOrderLabel}). ${fatherLogDesc}, mẹ là ${motherOcc.label.toLowerCase()}. ${circ.label}.`,
      },
    ],
  };
}

export function getBirthYearSummary(totalDays: number): number {
  return Math.floor(totalDays / DAYS_PER_YEAR);
}
