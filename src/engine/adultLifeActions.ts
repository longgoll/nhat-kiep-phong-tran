import {
  getAgeYears,
  type ActiveLifeState,
  type GiftEtiquetteTier,
  type HousingTier,
  type LifeFocusId,
  type NPC,
  type OriginClass,
  type WorldState,
} from '../types/activeLife';
import type { EffectSpec } from '../types/dsl';
import { formatCopper } from './economy';
import { appendLog, applyEffects } from './effectApplier';
import { mulberry32Next } from './prng';
import { INTEREST_LABELS } from './lifeInitializer';
import { pickWeightedIndex, randomInt } from './prng';

export interface LifeFocusOption {
  id: LifeFocusId;
  label: string;
  effectHint: string;
  description: string;
}

export const LIFE_FOCUS_OPTIONS: LifeFocusOption[] = [
  {
    id: 'cong_danh',
    label: 'Dồn sức làm ăn · Công danh',
    effectHint: 'Thu nhập↑ · Tiến độ↑ · Sức khỏe↓ · Quan hệ↓',
    description: 'Tập trung tối đa cho công việc và tiền bạc (+20% tiền công), nhưng dễ hao mòn sức khỏe và tình cảm.',
  },
  {
    id: 'can_bang',
    label: 'Cân bằng cuộc sống',
    effectHint: 'Ổn định mọi mặt',
    description: 'Giữ nhịp sống điều độ, không thiên lệch bên nào.',
  },
  {
    id: 'gia_dinh',
    label: 'Gia đình · Bằng hữu',
    effectHint: 'Quan hệ↑ · Hạnh phúc↑',
    description: 'Dành nhiều tâm trí cho người thân trong gia đình và bạn bè xung quanh.',
  },
  {
    id: 'suc_khoe',
    label: 'Dưỡng sinh · Sức khỏe',
    effectHint: 'Sức khỏe↑ · Thể lực↑ · Tốn ít trà thuốc',
    description: 'Chú ý nghỉ ngơi, điều dưỡng thân thể và hồi phục thể lực nhanh hơn.',
  },
  {
    id: 'tu_than',
    label: 'Tu thân · Đọc sách / Luyện võ',
    effectHint: 'Học thức & Võ nghệ↑ (+25%)',
    description: 'Nâng cao hiệu quả khi tự học kinh sử và rèn luyện võ nghệ.',
  },
  {
    id: 'so_thich',
    label: 'Phát triển Sở thích',
    effectHint: 'Hạnh phúc↑ · Cấp Sở thích↑',
    description: 'Dành thời gian cho thú vui tao nhã, tăng cấp độ sở thích qua từng năm.',
  },
];

const EXTRA_FOCUS_OPTIONS: Record<'nghi_ngoi' | 'hanh_thien' | 'lam_them', LifeFocusOption> = {
  nghi_ngoi: {
    id: 'nghi_ngoi',
    label: 'Nghỉ ngơi · Tĩnh dưỡng',
    effectHint: 'Sức khỏe↑ · Hạnh phúc↑ · Thể lực↑',
    description: 'Tạm gác lo toan, nghỉ ngơi tĩnh dưỡng để hồi phục tinh thần và khí huyết.',
  },
  hanh_thien: {
    id: 'hanh_thien',
    label: 'Lễ Phật · Hành thiện',
    effectHint: 'Quan hệ↑ · Hạnh phúc↑ · Tích phúc',
    description: 'Đi chùa lễ Phật, làm việc thiện và giữ tâm thanh tịnh giữa dòng đời.',
  },
  lam_them: {
    id: 'lam_them',
    label: 'Chép sách · Dạy kèm',
    effectHint: 'Kiếm tiền lẻ↑ · Hạnh phúc↓ nhẹ',
    description: 'Nhận chép thuê kinh sử hoặc dạy trẻ trong xóm để trang trải chi phí học hành.',
  },
};

export interface InstantAdultActionDef {
  id: string;
  title: string;
  subtitle: string;
  costCopper: number;
  cooldownDays: number;
  minAge?: number;
  maxAge?: number;
  minEducation?: number;
  minMartial?: number;
  minCraftTrade?: number;
  minFame?: number;
  minWealthCopper?: number;
  maxEducation?: number;
  blockedWorldStates?: WorldState[];
  requiresWorldStates?: WorldState[];
  category?: 'medical' | 'social' | 'economic' | 'growth';
  allowCredit?: boolean;
  prisonAllowed?: boolean;
  requiresNotHousing?: HousingTier;
  requiresHousingIn?: HousingTier[];
  requiresLivingFamily?: boolean;
  requiresLivingParent?: boolean;
  requiresLivingChild?: boolean;
  requiresFlag?: string;
  requiresOfficialOrNoble?: boolean;
  requiresOrigins?: OriginClass[];
  excludeOrigins?: OriginClass[];
  effects: EffectSpec;
  levelUpHobby?: boolean;
  isRental?: boolean;
  rentalExpiryLog?: string;
  logText: string;
}

export function isInstantActionVisible(state: ActiveLifeState, def: InstantAdultActionDef): boolean {
  const isInPrison = state.livelihoodStatus === 'prison' || state.flags.includes('dang_o_tu');
  if (isInPrison) {
    if (!def.prisonAllowed) return false;
  } else if (def.prisonAllowed) {
    return false;
  }
  if (def.requiresOrigins && !def.requiresOrigins.includes(state.profile.originClass)) {
    return false;
  }
  if (def.excludeOrigins && def.excludeOrigins.includes(state.profile.originClass)) {
    return false;
  }
  if (def.requiresOfficialOrNoble) {
    const isNobleOrOfficial =
      state.officialRank > 0 ||
      state.profile.originClass === 'hoang_toc' ||
      state.profile.originClass === 'quan_lai' ||
      state.profile.originClass === 'dia_chu';
    if (!isNobleOrOfficial) return false;
  }
  if (def.requiresFlag && !state.flags.includes(def.requiresFlag)) {
    return false;
  }
  if (def.requiresHousingIn && !def.requiresHousingIn.includes(state.assets.housing)) {
    return false;
  }
  if (def.id === 'inst_contribute_family_money') {
    if (state.flags.includes('da_ra_o_rieng') || state.flags.includes('trong_hau_cung')) return false;
  }
  if (def.id === 'inst_ask_family_money') {
    if (state.flags.includes('trong_hau_cung')) return false;
    if ((state.family?.familyWealthCopper ?? 0) < 60) return false;
  }
  if (def.id === 'inst_job_hunt' || def.id === 'inst_biz_plan') {
    if (
      state.isStudent ||
      state.livelihoodStatus === 'student' ||
      state.flags.includes('trong_hau_cung') ||
      state.flags.includes('thai_giam') ||
      state.flags.includes('bi_ep_lam_gia_no')
    ) {
      return false;
    }
  }
  if (def.requiresLivingParent) {
    const hasParent = state.npcs.some((n) => n.relation === 'parent' && n.isAlive);
    if (!hasParent) return false;
  }
  if (def.minEducation !== undefined && state.stats.education < def.minEducation) {
    return false;
  }
  if (def.maxEducation !== undefined && state.stats.education > def.maxEducation) {
    return false;
  }
  if (def.requiresLivingChild) {
    const hasChild = state.npcs.some((n) => n.relation === 'child' && n.isAlive);
    if (!hasChild) return false;
  }
  if (def.minMartial !== undefined && state.stats.martial < def.minMartial) {
    return false;
  }
  if (def.minCraftTrade !== undefined && state.stats.craftTrade < def.minCraftTrade) {
    return false;
  }
  if (def.minFame !== undefined && state.stats.fame < def.minFame) {
    return false;
  }
  if (def.minWealthCopper !== undefined && state.assets.wealthCopper < def.minWealthCopper) {
    return false;
  }
  if (def.requiresWorldStates && !def.requiresWorldStates.includes(state.world.worldState)) {
    return false;
  }
  if (def.requiresLivingFamily) {
    const hasFamily = state.npcs.some(
      (n) => (n.relation === 'parent' || n.relation === 'sibling' || n.relation === 'spouse' || n.relation === 'child') && n.isAlive,
    );
    if (!hasFamily) return false;
  }
  return true;
}

export const INSTANT_ADULT_ACTIONS: InstantAdultActionDef[] = [
  {
    id: 'inst_family_meal',
    title: 'Bày mâm cơm ấm cúng · Tặng quà gia đình',
    subtitle: 'Quan hệ +4 · Hạnh phúc +3 · Thân thiết người nhà +6',
    costCopper: 60,
    cooldownDays: 90,
    requiresLivingFamily: true,
    excludeOrigins: ['hoang_toc'],
    effects: {
      relationships: 4,
      happiness: 3,
      npc_affinity: [
        { relation: 'parent', delta: 6 },
        { relation: 'sibling', delta: 6 },
      ],
    },
    logText: 'Bạn mua thêm thịt cá về làm mâm cơm sum vầy cùng gia đình, không khí trong nhà thêm đầm ấm.',
  },
  {
    id: 'inst_tea_stall',
    title: 'Uống chén trà xanh, tán gẫu đầu ngõ',
    subtitle: 'Hạnh phúc +3 · Quan hệ +2 (Chi tiêu bình dân)',
    costCopper: 15,
    cooldownDays: 45,
    excludeOrigins: ['hoang_toc', 'quan_lai'],
    effects: {
      happiness: 3,
      relationships: 2,
    },
    logText: 'Bạn ghé quán nước đầu làng làm bát chè xanh, nghe chuyện thiên hạ thấy lòng nhẹ nhõm hẳn.',
  },
  {
    id: 'inst_rent_room',
    title: 'Thuê gian trọ bình dân tránh mưa nắng',
    subtitle: 'Chỗ ở → Nhà tranh · Kỳ hạn 90 ngày · Sức khỏe +5 · Hạnh phúc +8',
    costCopper: 180,
    cooldownDays: 90,
    requiresHousingIn: ['gam_cau'],
    isRental: true,
    rentalExpiryLog: 'Đã hết hạn kỳ thuê trọ 90 ngày; tiền trọ vẫn được tính vào chi phí nhà ở hằng ngày.',
    effects: {
      set_housing: 'nha_tranh',
      health: 5,
      happiness: 8,
    },
    logText: 'Bạn thuê được một gian trọ mái tranh khô ráo, từ nay không còn cảnh màn trời chiếu đất.',
  },
  {
    id: 'inst_rent_land_season',
    title: 'Thuê 2 sào ruộng công cày thêm vụ mùa',
    subtitle: 'Nhận 0–10 đấu gạo tùy mùa vụ · Kỳ hạn 90 ngày (Có rủi ro mất mùa)',
    costCopper: 120,
    cooldownDays: 90,
    excludeOrigins: ['hoang_toc', 'quan_lai'],
    isRental: true,
    rentalExpiryLog: 'Đã mãn hạn kỳ thuê 2 sào ruộng công vụ vừa qua, có thể thuê lại cho vụ mới.',
    effects: {
      rice: 7,
      happiness: 2,
      stamina: -15,
    },
    logText: 'Bạn bỏ tiền thuê thêm hai sào ruộng công chăm bón, thu hoạch được kha khá thóc gạo dự trữ.',
  },
  {
    id: 'inst_rent_market_stall',
    title: 'Thuê sạp chợ buôn chuyến ngắn ngày',
    subtitle: 'Thương tài +1.5 · Thu 95–320đ tùy chợ · Kỳ hạn 90 ngày (Có rủi ro lỗ vốn)',
    costCopper: 180,
    cooldownDays: 90,
    excludeOrigins: ['hoang_toc', 'quan_lai'],
    isRental: true,
    rentalExpiryLog: 'Đã hết hạn 90 ngày thuê sạp chợ buôn chuyến, có thể thuê lại kỳ mới.',
    effects: {
      copper: 240,
      craft_trade: 1.5,
      stamina: -15,
    },
    logText: 'Bạn thuê tạm một góc sạp chợ phiên bán hàng khô và vải vóc, xoay vòng vốn thu được chút lãi.',
  },
  {
    id: 'inst_ask_family_money',
    title: 'Xin tiền gia đình hỗ trợ',
    subtitle: 'Nhận 30–400đ từ gia sản gốc · Có tỷ lệ thành công theo thân thiết & gia cảnh',
    costCopper: 0,
    cooldownDays: 90,
    requiresLivingParent: true,
    category: 'economic',
    effects: {},
    logText: 'Bạn mở lời xin gia đình hỗ trợ thêm chút tiền tiêu.',
  },
  {
    id: 'inst_contribute_family_money',
    title: 'Đưa tiền phụ giúp kinh tế gia đình',
    subtitle: 'Chuyển 80đ vào gia sản gốc · Thân thiết cha mẹ +8 · Hạnh phúc +3',
    costCopper: 80,
    cooldownDays: 90,
    requiresLivingParent: true,
    category: 'social',
    effects: {
      family_copper: 80,
      happiness: 3,
      fame: 1,
      npc_affinity: [{ relation: 'parent', delta: 8 }],
    },
    logText: 'Bạn trích tiền tự kiếm được đưa cho gia đình trang trải chi tiêu và tích cóp thêm.',
  },
  {
    id: 'inst_send_parents_money',
    title: 'Gửi tiền phụng dưỡng bậc sinh thành',
    subtitle: 'Chuyển 100đ vào gia sản gốc · Thân thiết +10 · Hạnh phúc +4 · Thanh danh +2',
    costCopper: 100,
    cooldownDays: 120,
    requiresFlag: 'da_ra_o_rieng',
    requiresLivingParent: true,
    effects: {
      family_copper: 100,
      happiness: 4,
      fame: 2,
      npc_affinity: [{ relation: 'parent', delta: 10 }],
    },
    logText: 'Bạn gửi người quen mang trăm đồng tiền kẽm cùng ít quà về quê phụng dưỡng bậc sinh thành.',
  },
  {
    id: 'inst_treat_friends',
    title: 'Khao bằng hữu một chầu tửu lầu',
    subtitle: 'Quan hệ +6 · Thanh danh +2',
    costCopper: 120,
    cooldownDays: 120,
    minAge: 15,
    effects: {
      relationships: 6,
      fame: 2,
      happiness: 3,
    },
    logText: 'Bạn mời bằng hữu ra tửu lầu uống rượu đàm đạo, tiếng cười nói rôm rả làm tình giao hảo thêm bền chặt.',
  },
  {
    id: 'inst_see_physician',
    title: 'Mời thầy lang bắt mạch · Bốc thuốc bổ',
    subtitle: 'Sức khỏe +10 · Giảm nguy cơ đổ bệnh',
    costCopper: 150,
    cooldownDays: 180,
    category: 'medical',
    effects: {
      health: 10,
      stamina: 15,
    },
    logText: 'Bạn ghé hiệu thuốc bắc bắt mạch điều dưỡng, uống ba thang thuốc bổ giúp khí huyết lưu thông.',
  },
  {
    id: 'inst_folk_remedy',
    title: 'Cắt thang thuốc nam bình dân',
    subtitle: 'Sức khỏe +4 · Thể lực +10 (Giá rẻ cho dân thường)',
    costCopper: 25,
    cooldownDays: 90,
    excludeOrigins: ['hoang_toc', 'quan_lai'],
    category: 'medical',
    effects: {
      health: 4,
      stamina: 10,
    },
    logText: 'Bạn ra chợ mua ít lá thuốc nam sắc uống giải cảm, cơ thể nhẹ nhõm và đỡ mệt mỏi hơn.',
  },
  {
    id: 'inst_travel_solo',
    title: 'Du ngoạn vãn cảnh một mình',
    subtitle: 'Hạnh phúc +5 · Học thức +2',
    costCopper: 45,
    cooldownDays: 180,
    blockedWorldStates: ['chien_tranh'],
    effects: {
      happiness: 5,
      education: 2,
    },
    logText: 'Bạn một mình dạo bước ngắm non xanh nước biếc, lòng nhẹ nhõm và mở mang thêm nhiều điều.',
  },
  {
    id: 'inst_travel_family',
    title: 'Đưa cả nhà đi trẩy hội · Lễ chùa',
    subtitle: 'Hạnh phúc +7 · Quan hệ +5 · Thân thiết người nhà +8',
    costCopper: 140,
    cooldownDays: 180,
    blockedWorldStates: ['chien_tranh'],
    requiresLivingFamily: true,
    excludeOrigins: ['hoang_toc'],
    effects: {
      happiness: 7,
      relationships: 5,
      npc_affinity: [
        { relation: 'parent', delta: 8 },
        { relation: 'sibling', delta: 8 },
      ],
    },
    logText: 'Cả gia đình cùng nhau đi trẩy hội đầu mùa, ai nấy đều tươi cười rạng rỡ.',
  },
  {
    id: 'inst_charity_alms',
    title: 'Bố thí cháo · Quyên góp sửa đình chùa',
    subtitle: 'Thanh danh +5 · Hạnh phúc +6 · Quan hệ +2',
    costCopper: 200,
    cooldownDays: 180,
    excludeOrigins: ['hoang_toc'],
    effects: {
      fame: 5,
      happiness: 6,
      relationships: 2,
    },
    logText: 'Bạn bỏ tiền phát cháo cho người nghèo và công đức sửa mái đình, bà con trong vùng hết lời khen ngợi.',
  },
  {
    id: 'inst_hobby_practice',
    title: 'Sắm dụng cụ · Rèn luyện sở thích',
    subtitle: 'Nâng cấp Sở thích +1 Lv · Hạnh phúc +5',
    costCopper: 100,
    cooldownDays: 120,
    effects: {
      happiness: 5,
    },
    levelUpHobby: true,
    logText: 'Bạn bỏ tiền mua thêm sách vở và dụng cụ để trau dồi thú vui tao nhã của mình.',
  },
  {
    id: 'inst_repair_house',
    title: 'Sửa sang, tu bổ lại nhà cửa',
    subtitle: 'Hạnh phúc +8 · Quan hệ +3',
    costCopper: 350,
    cooldownDays: 360,
    requiresNotHousing: 'gam_cau',
    excludeOrigins: ['hoang_toc'],
    effects: {
      happiness: 8,
      relationships: 3,
    },
    logText: 'Bạn thuê thợ lợp lại mái nhà và quét dọn sân vườn khang trang sạch đẹp hẳn lên.',
  },
  {
    id: 'inst_noble_banquet',
    title: 'Mở tiệc chiêu đãi tân khách · đồng liêu',
    subtitle: 'Quan hệ +8 · Thanh danh +6 · Hạnh phúc +5',
    costCopper: 500,
    cooldownDays: 120,
    requiresOfficialOrNoble: true,
    effects: {
      relationships: 8,
      fame: 6,
      happiness: 5,
    },
    logText: 'Bạn bày yến tiệc trong phủ tiếp đãi bằng hữu và đồng liêu, thanh thế giao hảo tăng lên rõ rệt.',
  },
  {
    id: 'inst_royal_physician',
    title: 'Mời danh y · thái y điều dưỡng khí huyết',
    subtitle: 'Sức khỏe +18 · Thể lực +25',
    costCopper: 450,
    cooldownDays: 180,
    category: 'medical',
    requiresOfficialOrNoble: true,
    effects: {
      health: 18,
      stamina: 25,
    },
    logText: 'Bạn mời bậc danh y kê đơn sâm nhung điều dưỡng cơ thể, tinh thần phấn chấn hẳn lên.',
  },
  {
    id: 'inst_temple_donation',
    title: 'Quyên bạc tu sửa Văn Miếu · Từ đường',
    subtitle: 'Thanh danh +10 · Hạnh phúc +8 · Quan hệ +6',
    costCopper: 600,
    cooldownDays: 180,
    requiresOfficialOrNoble: true,
    effects: {
      fame: 10,
      happiness: 8,
      relationships: 6,
    },
    logText: 'Bạn xuất tiền công đức tu sửa Văn Miếu và từ đường dòng họ, được sĩ phu và thân hào hết mực khen ngợi.',
  },
  {
    id: 'inst_reward_servants',
    title: 'Ban thưởng gia nhân trong phủ đệ',
    subtitle: 'Hạnh phúc +6 · Quan hệ +4 · Thanh danh +2',
    costCopper: 250,
    cooldownDays: 150,
    requiresHousingIn: ['nha_gach', 'phu_de'],
    effects: {
      happiness: 6,
      relationships: 4,
      fame: 2,
    },
    logText: 'Bạn ban thưởng tiền lụa cho gia nhân trong nhà, trên dưới đều tận tụy đồng lòng.',
  },
  {
    id: 'inst_scholar_books',
    title: 'Mua sách quý · Mài mực luyện văn',
    subtitle: 'Học thức +3 · Thanh danh +2 · Hạnh phúc +2 (Học thức ≥ 20)',
    costCopper: 90,
    cooldownDays: 120,
    minEducation: 20,
    category: 'growth',
    effects: {
      education: 3,
      fame: 2,
      happiness: 2,
    },
    logText: 'Bạn tìm mua thêm sách kinh sử và giấy bút tốt, nghiền ngẫm thâu đêm giúp văn phong sắc sảo hẳn.',
  },
  {
    id: 'inst_weapon_training',
    title: 'Sắm binh khí · Tỉ thí luyện võ',
    subtitle: 'Võ nghệ +3 · Sức khỏe +2 (Võ nghệ ≥ 18)',
    costCopper: 90,
    cooldownDays: 120,
    minMartial: 18,
    category: 'growth',
    effects: {
      martial: 3,
      health: 2,
      stamina: -10,
    },
    logText: 'Bạn sắm sửa binh khí mới và mời bạn đồng môn ra bãi tập giao đấu, chiêu thức ngày càng thuần thục.',
  },
  {
    id: 'inst_trade_expand',
    title: 'Nhập nguyên liệu · Mở rộng tay nghề',
    subtitle: 'Thương tài +2.5 · Thu về ~190đ (Thương tài ≥ 15)',
    costCopper: 120,
    cooldownDays: 120,
    minCraftTrade: 15,
    category: 'economic',
    effects: {
      copper: 190,
      craft_trade: 2.5,
      stamina: -15,
    },
    logText: 'Nhờ tay nghề vững vàng, bạn mạnh dạn nhập thêm nguyên liệu làm hàng bán được giá hơn hẳn.',
  },
  {
    id: 'inst_elder_memoir',
    title: 'Viết gia phả · Truyền kinh nghiệm cho hậu thế',
    subtitle: 'Thanh danh +6 · Hạnh phúc +6 · Quan hệ +4 (50+ tuổi)',
    costCopper: 80,
    cooldownDays: 360,
    minAge: 50,
    category: 'social',
    effects: {
      fame: 6,
      happiness: 6,
      relationships: 4,
      education: 2,
    },
    logText: 'Tuổi đã cao, bạn ngồi ghi chép lại gia phả và lời răn dạy cho con cháu đời sau noi theo.',
  },
  {
    id: 'inst_ancestor_worship',
    title: 'Cúng giỗ tổ tiên · Hương khói từ đường',
    subtitle: 'Hạnh phúc +5 · Thanh danh +3 · Quan hệ +4 (18+ tuổi)',
    costCopper: 60,
    cooldownDays: 180,
    minAge: 18,
    category: 'social',
    effects: {
      happiness: 5,
      fame: 3,
      relationships: 4,
    },
    logText: 'Bạn sắm sửa mâm cỗ cúng giỗ tổ tiên, họ hàng quây quần thắp hương tưởng nhớ cội nguồn.',
  },
  {
    id: 'inst_pay_family_debt',
    title: 'Trả nợ cũ gia đình · Xóa văn tự nợ',
    subtitle: 'Xóa cờ mắc nợ · Hạnh phúc +14 · Thanh danh +6 · Thân thiết +15',
    costCopper: 220,
    cooldownDays: 9999,
    requiresFlag: 'gia_dinh_mac_no',
    category: 'social',
    effects: {
      remove_flags: ['gia_dinh_mac_no'],
      happiness: 14,
      fame: 6,
      npc_affinity: [{ relation: 'parent', delta: 15 }],
      milestone_title: 'Trả sạch nợ nần cho gia đình',
    },
    logText: 'Bạn mang tiền dành dụm về trả sạch món nợ cũ, xé bỏ văn tự nợ, trút được gánh nặng nghìn cân cho gia đình.',
  },
  {
    id: 'inst_plague_prayer',
    title: 'Lập đàn cầu an · Cắt thuốc phòng dịch',
    subtitle: 'Sức khỏe +6 · Hạnh phúc +5 (Mùa dịch / Mất mùa)',
    costCopper: 70,
    cooldownDays: 90,
    requiresWorldStates: ['dich_benh', 'mat_mua'],
    category: 'medical',
    effects: {
      health: 6,
      happiness: 5,
    },
    logText: 'Giữa buổi thời cuộc nhiễu nhương, bạn sắc thuốc phòng bệnh và làm lễ cầu bình an cho cả nhà.',
  },
  {
    id: 'inst_village_chess',
    title: 'Đánh cờ tướng · Xem hội làng',
    subtitle: 'Hạnh phúc +4 · Quan hệ +3 (Giải trí bình dân)',
    costCopper: 20,
    cooldownDays: 60,
    excludeOrigins: ['hoang_toc', 'quan_lai'],
    category: 'social',
    effects: {
      happiness: 4,
      relationships: 3,
    },
    logText: 'Bạn ra sân đình đánh vài ván cờ tướng và xem trò vui hội làng, tinh thần sảng khoái hẳn.',
  },
  {
    id: 'inst_poetry_gathering',
    title: 'Ngâm thơ xướng họa cùng tao nhân',
    subtitle: 'Thanh danh +4 · Quan hệ +5 · Học thức +1 (Học thức ≥ 25)',
    costCopper: 140,
    cooldownDays: 120,
    minEducation: 25,
    category: 'social',
    effects: {
      fame: 4,
      relationships: 5,
      happiness: 4,
      education: 1,
    },
    logText: 'Bạn cùng các bậc văn nhân uống trà ngâm vịnh, câu đối hay được truyền tụng khắp vùng.',
  },
  {
    id: 'inst_startup_tea_cart',
    title: 'Mở quán nước chè · Bánh rán đầu ngõ',
    subtitle: 'Khởi nghiệp nhỏ · Thương tài +1.5 · Thu về ~115đ',
    costCopper: 80,
    cooldownDays: 90,
    excludeOrigins: ['hoang_toc', 'quan_lai'],
    category: 'economic',
    effects: {
      copper: 115,
      craft_trade: 1.5,
      stamina: -10,
      add_flags: ['khoi_nghiep_quan_nuoc'],
    },
    logText: 'Bạn dọn một góc quán nước chè xanh và mẹt bánh rán đầu ngõ bán cho khách qua đường, thu được đồng ra đồng vào.',
  },
  {
    id: 'inst_startup_scribe',
    title: 'Mở bàn viết thư thuê · Cho chữ đầu xuân',
    subtitle: 'Lập nghề chữ nghĩa · Học thức +1.5 · Thu về ~110đ (Học thức ≥ 18)',
    costCopper: 50,
    cooldownDays: 90,
    minEducation: 18,
    excludeOrigins: ['hoang_toc', 'quan_lai'],
    category: 'economic',
    effects: {
      copper: 110,
      education: 1.5,
      fame: 1,
      stamina: -10,
      add_flags: ['khoi_nghiep_thay_do_viet_thue'],
    },
    logText: 'Bạn bày nghiên mực giấy đỏ viết đơn từ, câu đối thuê cho bà con trong vùng, vừa có tiền vừa giữ nếp chữ.',
  },
  {
    id: 'inst_startup_apothecary',
    title: 'Bào chế cao dán · Bán thuốc nam dạo',
    subtitle: 'Thương tài +2 · Sức khỏe +1 · Thu về ~220đ (Thương tài ≥ 10)',
    costCopper: 140,
    cooldownDays: 120,
    minCraftTrade: 10,
    excludeOrigins: ['hoang_toc', 'quan_lai'],
    category: 'economic',
    effects: {
      copper: 220,
      craft_trade: 2,
      health: 1,
      stamina: -15,
      add_flags: ['khoi_nghiep_thuoc_nam'],
    },
    logText: 'Bạn hái thuốc nam phơi sấy, sắc cao dán bán khắp chợ phiên, đắt hàng nhất là lúc trái gió trở trời.',
  },
  {
    id: 'inst_startup_craft_guild',
    title: 'Góp vốn lập phường thợ · Buôn hàng thủ công',
    subtitle: 'Khởi nghiệp vừa · Thương tài +3 · Thanh danh +3 · Thu về ~860đ (Thương tài ≥ 20)',
    costCopper: 600,
    cooldownDays: 180,
    minCraftTrade: 20,
    category: 'economic',
    effects: {
      copper: 860,
      craft_trade: 3,
      fame: 3,
      stamina: -20,
      add_flags: ['khoi_nghiep_phuong_tho'],
    },
    logText: 'Bạn chung vốn cùng mấy tay thợ giỏi lập phường sản xuất đồ thủ công giao mối cho thương nhân, lợi nhuận rất khá.',
  },
  {
    id: 'inst_royal_family_greetings',
    title: 'Vấn an · Dâng lễ trưởng bối trong cung',
    subtitle: 'Quan hệ +5 · Hạnh phúc +4 · Thân thiết người nhà +8',
    costCopper: 350,
    cooldownDays: 90,
    requiresLivingFamily: true,
    requiresOrigins: ['hoang_toc'],
    category: 'social',
    effects: {
      relationships: 5,
      happiness: 4,
      npc_affinity: [
        { relation: 'parent', delta: 8 },
        { relation: 'sibling', delta: 6 },
      ],
    },
    logText: 'Bạn chuẩn bị trà quý và lễ vật vào cung vấn an trưởng bối, giữ trọn lễ nghi hiếu đễ chốn Hoàng gia.',
  },
  {
    id: 'inst_royal_garden_tour',
    title: 'Du xuân vãn cảnh Hoàng tự · Ngự hoa viên',
    subtitle: 'Hạnh phúc +8 · Quan hệ +6 · Thanh danh +3',
    costCopper: 420,
    cooldownDays: 180,
    blockedWorldStates: ['chien_tranh'],
    requiresLivingFamily: true,
    requiresOrigins: ['hoang_toc'],
    category: 'social',
    effects: {
      happiness: 8,
      relationships: 6,
      fame: 3,
      npc_affinity: [
        { relation: 'parent', delta: 8 },
        { relation: 'sibling', delta: 8 },
      ],
    },
    logText: 'Bạn cùng gia quyến dạo bước vãn cảnh Hoàng tự dâng hương cầu phúc, không khí thanh nhã ấm áp.',
  },
  {
    id: 'inst_royal_palace_renovation',
    title: 'Tu bổ, trang hoàng phủ đệ Tôn thất',
    subtitle: 'Hạnh phúc +9 · Thanh danh +5 · Quan hệ +4',
    costCopper: 900,
    cooldownDays: 360,
    requiresHousingIn: ['nha_gach', 'phu_de'],
    requiresOrigins: ['hoang_toc'],
    category: 'social',
    effects: {
      happiness: 9,
      fame: 5,
      relationships: 4,
    },
    logText: 'Bạn cho thợ khéo chạm trổ lại hoành phi, trồng thêm tùng trúc trong phủ đệ, uy nghi tôn thất thêm phần rạng rỡ.',
  },
  {
    id: 'inst_royal_relief_granary',
    title: 'Phát chẩn cứu tế bách tính · Lập y quán',
    subtitle: 'Thanh danh +10 · Hạnh phúc +7 · Quan hệ +5',
    costCopper: 750,
    cooldownDays: 180,
    requiresOrigins: ['hoang_toc'],
    category: 'social',
    effects: {
      fame: 10,
      happiness: 7,
      relationships: 5,
    },
    logText: 'Bạn xuất bạc kho riêng mở điểm phát lương và bốc thuốc miễn phí cho dân nghèo Kinh kỳ, tiếng thơm lan truyền khắp nơi.',
  },
  {
    id: 'inst_royal_imperial_collection',
    title: 'Sưu tầm cổ thư · Bảo kiếm & Ngự trà',
    subtitle: 'Nâng cấp Sở thích +1 Lv · Học thức +2 · Thanh danh +3',
    costCopper: 480,
    cooldownDays: 150,
    requiresOrigins: ['hoang_toc'],
    category: 'growth',
    levelUpHobby: true,
    effects: {
      happiness: 7,
      education: 2,
      fame: 3,
    },
    logText: 'Bạn thỉnh về những bộ tàng thư quý hiếm và trà ngon tiến cung, thú vui tao nhã thêm phần tinh tế.',
  },
  {
    id: 'inst_patron_scholars',
    title: 'Bảo trợ Sĩ tử · Lập quỹ khuyến học',
    subtitle: 'Thanh danh +8 · Quan hệ +6 · Học thức +2 (Tài sản ≥ 5.000đ)',
    costCopper: 800,
    cooldownDays: 180,
    minWealthCopper: 5000,
    category: 'social',
    effects: {
      fame: 8,
      relationships: 6,
      education: 2,
      happiness: 5,
    },
    logText: 'Bạn xuất tiền lập quỹ khuyến học trợ cấp cho các sĩ tử nghèo, được giới nho lâm hết lời ca ngợi.',
  },
  {
    id: 'inst_merchant_guild_alliance',
    title: 'Mở yến kết giao Thương hội liên tỉnh',
    subtitle: 'Quan hệ +10 · Thanh danh +6 · Thương tài +3 (Tài sản ≥ 8.000đ)',
    costCopper: 1200,
    cooldownDays: 150,
    minWealthCopper: 8000,
    minCraftTrade: 15,
    excludeOrigins: ['hoang_toc'],
    category: 'social',
    effects: {
      relationships: 10,
      fame: 6,
      craft_trade: 3,
      happiness: 5,
    },
    logText: 'Bạn đặt tiệc lớn tại thương quán kết giao với các đại thương nhân tứ phương, mạng lưới làm ăn mở rộng vượt bậc.',
  },
  {
    id: 'inst_recruit_retainers',
    title: 'Chiêu mộ Môn khách · Kết giao hào kiệt',
    subtitle: 'Thanh danh +10 · Quan hệ +10 · Võ nghệ +2 (Tài sản ≥ 10.000đ)',
    costCopper: 1500,
    cooldownDays: 180,
    minAge: 18,
    minWealthCopper: 10000,
    category: 'social',
    effects: {
      fame: 10,
      relationships: 10,
      martial: 2,
      happiness: 4,
    },
    logText: 'Bạn rộng cửa phủ đệ nuôi dưỡng môn khách và kết giao hào kiệt bốn phương, thanh thế ngày càng lừng lẫy.',
  },
  {
    id: 'inst_grand_court_networking',
    title: 'Mở đại yến phủ đệ · Giao hảo triều thần',
    subtitle: 'Thanh danh +14 · Quan hệ +12 · Hạnh phúc +6 (Tài sản ≥ 15.000đ)',
    costCopper: 2500,
    cooldownDays: 180,
    minWealthCopper: 15000,
    requiresOfficialOrNoble: true,
    category: 'social',
    effects: {
      fame: 14,
      relationships: 12,
      happiness: 6,
    },
    logText: 'Bạn mở đại yến xa hoa trong phủ đệ thết đãi các bậc công khanh và danh sĩ Kinh kỳ, uy tín trên triều đình tăng vọt.',
  },
  {
    id: 'inst_night_class',
    title: 'Theo lớp học đêm · Bổ túc kinh sử',
    subtitle: 'Học thức +6 · Hạnh phúc +1 (Cho người chưa thông kinh sử, cho phép vay học phí)',
    costCopper: 80,
    cooldownDays: 360,
    minAge: 16,
    maxAge: 80,
    maxEducation: 35,
    category: 'growth',
    allowCredit: true,
    effects: {
      education: 6,
      happiness: 1,
    },
    logText: 'Ban ngày mưu sinh, tối về bạn chong đèn theo học lớp bổ túc của thầy đồ già để mở mang chữ nghĩa.',
  },
  {
    id: 'inst_trade_course',
    title: 'Học nghề · Rèn kỹ năng mưu sinh',
    subtitle: 'Khéo tay +6 · Học thức +3 (Mở rộng cơ hội thăng tiến & buôn bán)',
    costCopper: 150,
    cooldownDays: 360,
    minAge: 18,
    maxAge: 55,
    category: 'growth',
    allowCredit: true,
    effects: {
      craft_trade: 6,
      education: 3,
    },
    logText: 'Bạn bỏ tiền theo học thợ cả trong phường nghề, tay nghề và khả năng tính toán sổ sách tăng tiến rõ rệt.',
  },
  {
    id: 'inst_open_academy',
    title: 'Nghe giảng thư viện · Tuổi cao hiếu học',
    subtitle: 'Học thức +5 · Hạnh phúc +4 (Dành cho người từ 50 tuổi trở lên)',
    costCopper: 120,
    cooldownDays: 360,
    minAge: 50,
    maxAge: 78,
    category: 'growth',
    effects: {
      education: 5,
      happiness: 4,
    },
    logText: 'Ở tuổi xế chiều, bạn vẫn đều đặn tới thư viện nghe các bậc túc nho giảng luận cổ kim, tinh thần thêm minh mẫn.',
  },
  {
    id: 'inst_hire_child_tutor',
    title: 'Mời thầy đồ dạy chữ cho con',
    subtitle: 'Quan hệ +3 · Hạnh phúc +3 · Thân thiết con cái +6',
    costCopper: 180,
    cooldownDays: 360,
    minAge: 24,
    requiresLivingChild: true,
    category: 'social',
    allowCredit: true,
    effects: {
      relationships: 3,
      happiness: 3,
      npc_affinity: [{ relation: 'child', delta: 6 }],
    },
    logText: 'Bạn chắt chiu mời thầy đồ giỏi về kèm cặp chữ nghĩa cho con nhỏ, mong đời con khấm khá hơn.',
  },
  {
    id: 'inst_prison_letter',
    title: 'Nhờ cai ngục chuyển thư về gia đình',
    subtitle: 'Quan hệ +3 · Hạnh phúc +3 (Trong ngục)',
    costCopper: 40,
    cooldownDays: 180,
    prisonAllowed: true,
    requiresLivingFamily: true,
    category: 'social',
    allowCredit: true,
    effects: {
      relationships: 3,
      happiness: 3,
    },
    logText: 'Bạn nhờ người đưa lá thư nhắn nhủ bình an về cho gia đình nơi quê nhà.',
  },
  {
    id: 'inst_prison_will',
    title: 'Viết di chúc · Dặn dò hậu sự',
    subtitle: 'Hạnh phúc +2 · An lòng nơi ngục tối',
    costCopper: 0,
    cooldownDays: 720,
    minAge: 35,
    prisonAllowed: true,
    category: 'social',
    effects: {
      happiness: 2,
      add_flags: ['da_lap_di_chuc'],
    },
    logText: 'Bạn cẩn thận viết lại đôi lời dặn dò hậu sự và phân chia gia sản nếu chẳng may bất trắc.',
  },
  {
    id: 'inst_job_hunt',
    title: 'Tìm chỗ làm mới · Nghe ngóng cơ hội',
    subtitle: 'Miễn phí · Hẹn 3 lời mời việc làm phù hợp ở kỳ quyết định tiếp theo (Chờ 1 năm)',
    costCopper: 0,
    cooldownDays: 360,
    minAge: 13,
    maxAge: 62,
    category: 'growth',
    effects: {
      add_flags: ['cho_tim_viec_moi'],
    },
    logText: 'Bạn nhờ người quen dò hỏi khắp nơi để tìm một công việc phù hợp hơn với hoàn cảnh hiện tại.',
  },
  {
    id: 'inst_biz_plan',
    title: 'Tìm hiểu việc khởi nghiệp',
    subtitle: 'Miễn phí · Lập kế hoạch mở cơ sở riêng phù hợp vốn liếng (Chờ 1 năm)',
    costCopper: 0,
    cooldownDays: 360,
    minAge: 15,
    maxAge: 65,
    category: 'economic',
    effects: {
      add_flags: ['cho_khoi_nghiep'],
    },
    logText: 'Bạn đi khảo sát chợ búa, tính toán vốn liếng và tìm hiểu các mối hàng để chuẩn bị khởi nghiệp.',
  },
];

export function getEffectiveInstantActionCost(
  state: ActiveLifeState,
  def: InstantAdultActionDef,
): number {
  if (def.costCopper <= 0) return 0;
  let mult = 1.0;
  const ws = state.world.worldState;
  if (ws === 'dich_benh') {
    mult *= def.category === 'medical' ? 1.5 : 1.2;
  } else if (ws === 'mat_mua') {
    mult *= 1.25;
  } else if (ws === 'chien_tranh') {
    mult *= 1.4;
  }

  const place = state.family?.birthPlace ?? '';
  if (place.includes('Thăng Long') || place.includes('Kinh') || place.includes('Phủ thành')) {
    mult *= 1.15;
  } else if (place.includes('Thị trấn')) {
    mult *= 1.05;
  }

  return Math.max(1, Math.round(def.costCopper * mult));
}

export function getInstantActionCooldownRemaining(
  state: ActiveLifeState,
  actionId: string,
  cooldownDays: number,
): number {
  const lastDay = state.actionCooldowns?.[actionId];
  if (lastDay === undefined) return 0;
  return Math.max(0, cooldownDays - (state.profile.totalDays - lastDay));
}

export function getCreditLimitCopper(state: ActiveLifeState): number {
  const housingCredit =
    state.assets.housing === 'phu_de' ? 2000 : state.assets.housing === 'nha_gach' ? 600 : 100;
  const propertyCredit = state.assets.properties.length * 800;
  const rankCredit = state.officialRank * 500;
  return Math.round(300 + housingCredit + propertyCredit + rankCredit);
}

/**
 * 1in8b-style `creditOK`: checks whether an action can be paid in cash
 * or bought on credit within the character's credit limit.
 */
export function canAffordInstantAction(
  state: ActiveLifeState,
  def: InstantAdultActionDef,
): { canPay: boolean; onCredit: boolean; effectiveCost: number } {
  const effectiveCost = getEffectiveInstantActionCost(state, def);
  if (effectiveCost <= 0 || state.assets.wealthCopper >= effectiveCost) {
    return { canPay: true, onCredit: false, effectiveCost };
  }
  const creditLimit = getCreditLimitCopper(state);
  const canCredit =
    Boolean(def.allowCredit) && state.assets.wealthCopper - effectiveCost >= -creditLimit;
  return { canPay: canCredit, onCredit: canCredit, effectiveCost };
}

export function getAskFamilyMoneyProfile(state: ActiveLifeState): {
  chancePct: number;
  amount: number;
  canAsk: boolean;
} {
  const familyWealth = state.family?.familyWealthCopper ?? 0;
  const livingParents = state.npcs.filter((n) => n.relation === 'parent' && n.isAlive);
  if (!state.family || livingParents.length === 0 || familyWealth < 60) {
    return { chancePct: 0, amount: 0, canAsk: false };
  }

  const avgParentAffinity =
    livingParents.reduce((sum, p) => sum + p.affinity, 0) / livingParents.length;
  const age = getAgeYears(state.profile.totalDays);
  const tier = state.family.familyLivingTier;

  let chance = 45;
  chance += Math.round((avgParentAffinity - 50) * 0.5);
  if (tier === 'hoang_gia' || tier === 'sung_tuc') chance += 15;
  else if (tier === 'kha_gia') chance += 8;
  else if (tier === 'tung_thieu') chance -= 15;

  if (age <= 18) chance += 10;
  else if (age >= 25) chance -= 15;

  if (state.isStudent) chance += 10;
  if (state.assets.wealthCopper >= 500) chance -= 15;
  if (state.flags.includes('da_ra_o_rieng')) chance -= 15;
  if (state.flags.includes('gia_dinh_mac_no')) chance -= 10;

  const chancePct = Math.max(10, Math.min(85, chance));
  const rawAmount = Math.round(familyWealth * 0.08);
  const amount = Math.max(30, Math.min(400, Math.min(Math.floor(familyWealth * 0.25), rawAmount)));

  return { chancePct, amount, canAsk: amount > 0 };
}

export function executeInstantAdultAction(
  inputState: ActiveLifeState,
  actionId: string,
): { ok: boolean; state: ActiveLifeState; message: string } {
  const def = INSTANT_ADULT_ACTIONS.find((a) => a.id === actionId);
  if (!def || !isInstantActionVisible(inputState, def)) {
    return { ok: false, state: inputState, message: 'Hoạt động không phù hợp với hoàn cảnh hiện tại.' };
  }

  const age = getAgeYears(inputState.profile.totalDays);
  if (def.minAge && age < def.minAge) {
    return { ok: false, state: inputState, message: `Cần đủ ${def.minAge} tuổi để thực hiện.` };
  }
  if (def.maxAge && age > def.maxAge) {
    return { ok: false, state: inputState, message: `Không còn phù hợp ở độ tuổi hiện tại.` };
  }
  if (def.blockedWorldStates?.includes(inputState.world.worldState)) {
    return { ok: false, state: inputState, message: 'Thời cuộc đang loạn lạc, không thể thực hiện lúc này.' };
  }
  if (def.requiresNotHousing && inputState.assets.housing === def.requiresNotHousing) {
    return { ok: false, state: inputState, message: 'Chưa có nhà riêng để sửa sang.' };
  }

  const { canPay, effectiveCost } = canAffordInstantAction(inputState, def);
  const remaining = getInstantActionCooldownRemaining(inputState, def.id, def.cooldownDays);
  if (remaining > 0) {
    return { ok: false, state: inputState, message: `Cần chờ thêm ${remaining} ngày nữa.` };
  }
  if (!canPay) {
    return { ok: false, state: inputState, message: 'Không đủ tiền đồng hoặc vượt hạn mức vay.' };
  }

  const scaledEffects: EffectSpec = { ...def.effects };
  let customLogText = def.logText;
  let nextPrngState = inputState.prngState;

  if (def.id === 'inst_ask_family_money') {
    const profile = getAskFamilyMoneyProfile(inputState);
    if (!profile.canAsk) {
      return { ok: false, state: inputState, message: 'Gia đình hiện không đủ điều kiện để hỗ trợ.' };
    }
    const roll = mulberry32Next(nextPrngState);
    nextPrngState = roll.nextState;
    const succeeded = roll.value < profile.chancePct / 100;
    if (succeeded) {
      scaledEffects.copper = profile.amount;
      scaledEffects.family_copper = -profile.amount;
      scaledEffects.happiness = 3;
      scaledEffects.npc_affinity = [{ relation: 'parent', delta: -2 }];
      customLogText = `Bạn ngỏ lời xin gia đình hỗ trợ tiền tiêu (tỷ lệ ${profile.chancePct}%). Người nhà ưng thuận trích ${profile.amount}đ từ gia sản cho bạn`;
    } else {
      scaledEffects.copper = 0;
      scaledEffects.happiness = -3;
      scaledEffects.npc_affinity = [{ relation: 'parent', delta: -4 }];
      customLogText = `Bạn ngỏ lời xin gia đình hỗ trợ (tỷ lệ ${profile.chancePct}%) nhưng bị từ chối khéo, khuyên nên tự lực cánh sinh`;
    }
  } else if (def.id === 'inst_rent_land_season') {
    const roll = mulberry32Next(nextPrngState);
    nextPrngState = roll.nextState;
    const ws = inputState.world.worldState;
    if (ws === 'mat_mua') {
      if (roll.value < 0.3) {
        scaledEffects.rice = 0;
        scaledEffects.happiness = -3;
        customLogText =
          'Thuê 2 sào ruộng công gặp đúng năm đại hạn mất mùa, lúa chết khô gần hết khiến bạn trắng tay mất vốn.';
      } else if (roll.value < 0.85) {
        scaledEffects.rice = 2;
        scaledEffects.happiness = -1;
        customLogText =
          'Thuê 2 sào ruộng công giữa mùa mất mùa, đất khô nẻ chỉ gặt vớt vát được 2 đấu gạo.';
      } else {
        scaledEffects.rice = 4;
        scaledEffects.happiness = 1;
        customLogText =
          'Dù trời hạn mất mùa nhưng nhờ chịu khó tát nước đêm ngày, 2 sào ruộng thuê cũng thu về được 4 đấu gạo.';
      }
    } else if (ws === 'chien_tranh' || ws === 'dich_benh') {
      if (roll.value < 0.25) {
        scaledEffects.rice = 1;
        scaledEffects.happiness = -2;
        customLogText =
          'Thời cuộc loạn lạc, ruộng thuê bị giẫm phá và trưng thu bớt nên chỉ còn thu lại vỏn vẹn 1 đấu gạo.';
      } else if (roll.value < 0.75) {
        scaledEffects.rice = 4;
        scaledEffects.happiness = 0;
        customLogText =
          'Thuê 2 sào ruộng công trong lúc thời thế bất ổn, thu hoạch giảm sút còn 4 đấu gạo.';
      } else {
        scaledEffects.rice = 7;
        scaledEffects.happiness = 2;
        customLogText =
          'May mắn giữ được 2 sào ruộng thuê yên ổn giữa buổi loạn lạc, thu hoạch đủ 7 đấu gạo.';
      }
    } else {
      if (roll.value < 0.15) {
        scaledEffects.rice = 3;
        scaledEffects.happiness = -1;
        customLogText =
          'Thuê 2 sào ruộng công nhưng nửa vụ gặp sâu bệnh và mưa dầm, năng suất giảm chỉ thu được 3 đấu gạo.';
      } else if (roll.value < 0.8) {
        scaledEffects.rice = 7;
        scaledEffects.happiness = 2;
        customLogText =
          'Bạn bỏ tiền thuê 2 sào ruộng công chăm bón thuận lợi, thu hoạch được 7 đấu thóc gạo dự trữ.';
      } else {
        scaledEffects.rice = 10;
        scaledEffects.happiness = 3;
        customLogText =
          'Mưa thuận gió hòa, 2 sào ruộng công thuê được mùa bội thu hẳn 10 đấu gạo đầy bồ!';
      }
    }
  } else if (def.id === 'inst_rent_market_stall') {
    const roll = mulberry32Next(nextPrngState);
    nextPrngState = roll.nextState;
    const ws = inputState.world.worldState;
    const tradeSkillBonus = Math.min(0.12, inputState.stats.craftTrade * 0.0015);
    const lossProb =
      (ws === 'binh_on' ? 0.18 : ws === 'mat_mua' ? 0.32 : 0.42) - tradeSkillBonus * 0.5;
    const boomProb = (ws === 'binh_on' ? 0.26 : 0.14) + tradeSkillBonus;

    if (roll.value < lossProb) {
      const lossReturn = Math.round((ws === 'chien_tranh' ? 95 : 120) + inputState.stats.craftTrade * 0.5);
      scaledEffects.copper = Math.min(effectiveCost - 25, lossReturn);
      scaledEffects.craft_trade = 1.0;
      scaledEffects.happiness = -2;
      customLogText = `Thuê sạp chợ gặp cảnh chợ chiều ế ẩm, hàng hóa ẩm mốc phải bán tháo chỉ thu hồi được ${scaledEffects.copper}đ (lỗ vốn).`;
    } else if (roll.value < lossProb + boomProb) {
      scaledEffects.copper = Math.round(295 + inputState.stats.craftTrade * 2.0);
      scaledEffects.craft_trade = 1.8;
      scaledEffects.happiness = 2;
      customLogText = `Phiên chợ đông khách bất ngờ, sạp hàng của bạn bán đắt như tôm tươi, thu về ${scaledEffects.copper}đ!`;
    } else {
      const mult = ws === 'binh_on' ? 1.05 : ws === 'mat_mua' ? 0.92 : 0.85;
      scaledEffects.copper = Math.round(230 * mult + inputState.stats.craftTrade * 1.4);
      customLogText = `Bạn thuê góc sạp chợ phiên bán hàng khô và vải vóc, xoay vòng vốn thu về ${scaledEffects.copper}đ.`;
    }
  } else if (
    def.id === 'inst_startup_tea_cart' ||
    def.id === 'inst_startup_craft_guild'
  ) {
    const baseGain = scaledEffects.copper ?? 240;
    const mult =
      inputState.world.worldState === 'binh_on'
        ? 1.15
        : inputState.world.worldState === 'chien_tranh' || inputState.world.worldState === 'dich_benh'
          ? 0.72
          : 0.9;
    scaledEffects.copper = Math.round(baseGain * mult + inputState.stats.craftTrade * 1.5);
  } else if (def.id === 'inst_startup_scribe') {
    const baseGain = scaledEffects.copper ?? 110;
    scaledEffects.copper = Math.round(baseGain + inputState.stats.education * 1.2);
  } else if (def.id === 'inst_startup_apothecary') {
    const baseGain = scaledEffects.copper ?? 220;
    const plagueMult = inputState.world.worldState === 'dich_benh' ? 1.3 : 1.0;
    scaledEffects.copper = Math.round(baseGain * plagueMult + inputState.stats.craftTrade * 2);
  }

  let state = applyEffects(
    { ...inputState, prngState: nextPrngState },
    {
      ...scaledEffects,
      copper: -effectiveCost + (scaledEffects.copper ?? 0),
    },
  );

  const hobbyLevels = { ...(state.hobbyLevels ?? {}) };
  let extraLog = '';
  if (def.levelUpHobby) {
    const interests = state.interests && state.interests.length > 0 ? state.interests : ['kinh_su'];
    const targetHobby = interests[0];
    const nextLv = (hobbyLevels[targetHobby] ?? 0) + 1;
    hobbyLevels[targetHobby] = nextLv;
    if (!state.interests?.includes(targetHobby)) {
      state = applyEffects(state, { add_interests: [targetHobby] });
    }
    const label = INTEREST_LABELS[targetHobby] ?? targetHobby;
    extraLog = ` (${label} đạt Lv.${nextLv})`;
  }

  state = {
    ...state,
    hobbyLevels,
    actionCooldowns: {
      ...(state.actionCooldowns ?? {}),
      [def.id]: state.profile.totalDays,
    },
    logs: appendLog(
      state.logs,
      state.profile.totalDays,
      'survival',
      `${customLogText}${extraLog}${effectiveCost > 0 ? ` (-${effectiveCost}đ)` : ''}`,
    ),
  };

  return { ok: true, state, message: `${customLogText}${extraLog}` };
}

/**
 * Checks if any timed rental action (90-day lease) expired on the current day and appends
 * a clear notification into Ghi Chép Cuộc Đời.
 */
export function processRentalExpirations(inputState: ActiveLifeState): ActiveLifeState {
  const cooldowns = inputState.actionCooldowns;
  if (!cooldowns) return inputState;

  let state = inputState;
  const currentDay = state.profile.totalDays;
  for (const def of INSTANT_ADULT_ACTIONS) {
    if (!def.isRental || !def.rentalExpiryLog) continue;
    const startDay = cooldowns[def.id];
    if (startDay !== undefined && currentDay === startDay + def.cooldownDays) {
      state = {
        ...state,
        logs: appendLog(state.logs, currentDay, 'survival', def.rentalExpiryLog),
      };
    }
  }
  return state;
}

export function getDailyFocusModifiers(focusId: string): {
  copperMult: number;
  studyMartialMult: number;
  dailyEffects: EffectSpec;
  dailyCopperCost: number;
} {
  switch (focusId) {
    case 'cong_danh':
      return {
        copperMult: 1.2,
        studyMartialMult: 1.0,
        dailyEffects: { health: -0.01, relationships: -0.008 },
        dailyCopperCost: 0,
      };
    case 'gia_dinh':
      return {
        copperMult: 0.95,
        studyMartialMult: 1.0,
        dailyEffects: { relationships: 0.014, happiness: 0.01 },
        dailyCopperCost: 0,
      };
    case 'suc_khoe':
      return {
        copperMult: 0.95,
        studyMartialMult: 1.0,
        dailyEffects: { health: 0.014, stamina: 4 },
        dailyCopperCost: 1,
      };
    case 'tu_than':
      return {
        copperMult: 1.0,
        studyMartialMult: 1.25,
        dailyEffects: {},
        dailyCopperCost: 0,
      };
    case 'so_thich':
      return {
        copperMult: 1.0,
        studyMartialMult: 1.0,
        dailyEffects: { happiness: 0.012 },
        dailyCopperCost: 0,
      };
    case 'nghi_ngoi':
      return {
        copperMult: 0.9,
        studyMartialMult: 0.95,
        dailyEffects: { health: 0.008, happiness: 0.008, stamina: 5 },
        dailyCopperCost: 0,
      };
    case 'hanh_thien':
      return {
        copperMult: 0.95,
        studyMartialMult: 1.0,
        dailyEffects: { relationships: 0.012, happiness: 0.01 },
        dailyCopperCost: 0,
      };
    case 'lam_them':
      return {
        copperMult: 1.0,
        studyMartialMult: 0.95,
        dailyEffects: { copper: 4, happiness: -0.004, relationships: 0.003 },
        dailyCopperCost: 0,
      };
    case 'can_bang':
    default:
      return {
        copperMult: 1.0,
        studyMartialMult: 1.05,
        dailyEffects: { health: 0.003, happiness: 0.004, relationships: 0.003 },
        dailyCopperCost: 0,
      };
  }
}

export function generateAnnualLifeFlavorLogs(inputState: ActiveLifeState): ActiveLifeState {
  let state = inputState;
  const age = getAgeYears(state.profile.totalDays);
  const day = state.profile.totalDays;

  // Level up primary hobby annually if lifeFocus is 'so_thich'
  if (state.schedule.lifeFocus === 'so_thich') {
    const interests = state.interests && state.interests.length > 0 ? state.interests : ['kinh_su'];
    const targetHobby = interests[0];
    const hobbyLevels = { ...(state.hobbyLevels ?? {}) };
    const nextLv = (hobbyLevels[targetHobby] ?? 0) + 1;
    hobbyLevels[targetHobby] = nextLv;
    const label = INTEREST_LABELS[targetHobby] ?? targetHobby;
    state = {
      ...state,
      hobbyLevels,
      logs: appendLog(
        state.logs,
        day,
        'study',
        `Nhờ chăm chút sở thích trong năm qua, tài nghệ "${label}" của bạn đã lên Lv.${nextLv}.`,
      ),
    };
  }

  // Pick 1 NPC annual flavor update
  const aliveNpcs = state.npcs.filter((n) => n.isAlive);
  if (aliveNpcs.length > 0) {
    const npcPick = randomInt(state.prngState, 0, aliveNpcs.length - 1);
    state = { ...state, prngState: npcPick.nextState };
    const npc = aliveNpcs[npcPick.value];

    const npcSnippets =
      npc.relation === 'parent'
        ? [
            `${npc.name} tuổi ngày một cao, dặn dò bạn chú ý giữ gìn sức khỏe.`,
            `${npc.name} sai người gửi cho bạn ít quà quê, hỏi thăm chuyện làm ăn.`,
          ]
        : npc.relation === 'sibling'
          ? [
              `${npc.name} ghé chơi kể chuyện gia đình, hai anh em trò chuyện tới khuya.`,
              `${npc.name} dạo này buôn bán/làm ăn cũng có chút khởi sắc.`,
            ]
          : npc.relation === 'spouse'
            ? [
                `${npc.name} cùng bạn ngồi uống chén trà tối, bàn chuyện thu vén cửa nhà.`,
                `${npc.name} khéo léo quán xuyến việc nhà giúp bạn yên tâm làm ăn.`,
              ]
            : npc.relation === 'child'
              ? [
                  `Con của bạn (${npc.name}) ngày một khôn lớn, biết phụ giúp vài việc lặt vặt trong nhà.`,
                  `${npc.name} khoe với bạn vài chữ mới học được, khiến bạn mỉm cười tự hào.`,
                ]
              : [
                  `${npc.name} vẫn giữ liên lạc, thỉnh thoảng hỏi thăm tin tức của bạn.`,
                ];

    const snipPick = randomInt(state.prngState, 0, npcSnippets.length - 1);
    state = { ...state, prngState: snipPick.nextState };
    state = {
      ...state,
      logs: appendLog(state.logs, day, 'survival', npcSnippets[snipPick.value]),
    };
  }

  // Pick 1 age / world / lifestyle flavor line
  const lifePool: string[] = [];
  if (age >= 40 && age <= 55) {
    lifePool.push('Chữ viết trong sách bắt đầu hơi nhòe khi đọc gần, có lẽ mắt bạn đã bắt đầu lão thị.');
  }
  if (age >= 55) {
    lifePool.push('Tóc đã điểm bạc, những hôm gió bấc về khớp xương lại nhức mỏi hơn trước.');
  }
  if (state.schedule.lifeFocus === 'cong_danh' && state.stats.health < 55) {
    lifePool.push('Ngày nào cũng lao lực làm việc từ sáng sớm đến tối mịt khiến bạn thường xuyên mệt mỏi.');
  }
  if (state.world.worldState === 'mat_mua' || state.world.worldState === 'chien_tranh') {
    lifePool.push(
      state.assets.rice >= 25
        ? 'Thời cuộc biến động làm giá gạo tăng cao, nhưng nhờ trữ sẵn thóc trong nhà nên bạn vẫn yên tâm.'
        : 'Giá gạo ngoài chợ tăng vọt vì thời cuộc rối ren, khiến chi tiêu sinh hoạt thêm đắt đỏ.',
    );
  }
  if (lifePool.length === 0) {
    lifePool.push(
      'Một năm trôi qua bình lặng, bạn nhìn lại chặng đường đã đi qua và chuẩn bị cho năm mới.',
      'Thỉnh thoảng đi dạo qua những con đường quen, bạn bắt gặp vài người hàng xóm niềm nở hỏi thăm.',
    );
  }

  const linePick = pickWeightedIndex(
    state.prngState,
    lifePool.map(() => 1),
  );
  state = {
    ...state,
    prngState: linePick.nextState,
    logs: appendLog(state.logs, day, 'survival', lifePool[linePick.index]),
  };

  return state;
}

export const AUTO_ACTION_CANDIDATES = [
  'inst_see_physician',
  'inst_family_meal',
  'inst_hobby_practice',
  'inst_charity_alms',
];

export const GIFT_ETIQUETTE_OPTIONS: Array<{ value: GiftEtiquetteTier; label: string; desc: string }> = [
  { value: 'chu_dao', label: 'Gửi chu đáo (100đ/năm)', desc: '+3 Quan hệ, +2 Thanh danh mỗi năm' },
  { value: 'tuy_kha_nang', label: 'Tùy khả năng (40đ/năm)', desc: '+1 Quan hệ mỗi năm' },
  { value: 'chi_den_chia_vui', label: 'Chỉ đến chung vui (0đ)', desc: 'Tiết kiệm tiền nhưng -1 Quan hệ/năm' },
];

export function buyGoldReserve(inputState: ActiveLifeState, amountCopper: number): ActiveLifeState {
  if (amountCopper <= 0 || inputState.assets.wealthCopper < amountCopper) return inputState;
  const nextGold = (inputState.assets.goldReserveCopper ?? 0) + amountCopper;
  return {
    ...inputState,
    assets: {
      ...inputState.assets,
      wealthCopper: inputState.assets.wealthCopper - amountCopper,
      goldReserveCopper: nextGold,
    },
    logs: appendLog(
      inputState.logs,
      inputState.profile.totalDays,
      'survival',
      `Đổi ${amountCopper} đồng tiền mặt sang bạc nén / vàng tích trữ.`,
    ),
  };
}

export function sellGoldReserve(inputState: ActiveLifeState, amountCopper: number): ActiveLifeState {
  const currentGold = inputState.assets.goldReserveCopper ?? 0;
  const sellAmt = Math.min(currentGold, amountCopper);
  if (sellAmt <= 0) return inputState;
  const netCash = Math.round(sellAmt * 0.98); // 2% phí đổi bạc
  return {
    ...inputState,
    assets: {
      ...inputState.assets,
      wealthCopper: inputState.assets.wealthCopper + netCash,
      goldReserveCopper: currentGold - sellAmt,
    },
    logs: appendLog(
      inputState.logs,
      inputState.profile.totalDays,
      'survival',
      `Bán bạc nén / vàng tích trữ thu về ${netCash} đồng (đã trừ 2% phí đổi).`,
    ),
  };
}

export function applySeasonalGoldAndInflation(inputState: ActiveLifeState): ActiveLifeState {
  const ws = inputState.world.worldState;
  const gold = inputState.assets.goldReserveCopper ?? 0;
  if (ws !== 'mat_mua' && ws !== 'chien_tranh') return inputState;

  let state = inputState;
  if (gold > 0) {
    const gain = Math.max(5, Math.round(gold * 0.04));
    state = {
      ...state,
      assets: { ...state.assets, goldReserveCopper: gold + gain },
      logs: appendLog(
        state.logs,
        state.profile.totalDays,
        'survival',
        `Thời cuộc bất ổn khiến giá vàng bạc tăng (+${gain}đ giá trị dự trữ).`,
      ),
    };
  }
  return state;
}

export function applyAnnualGiftEtiquette(inputState: ActiveLifeState): ActiveLifeState {
  const age = getAgeYears(inputState.profile.totalDays);
  if (age < 16) return inputState;
  const tier = inputState.schedule.giftEtiquette ?? 'tuy_kha_nang';
  const day = inputState.profile.totalDays;

  if (tier === 'chu_dao' && inputState.assets.wealthCopper >= 100) {
    let s = applyEffects(inputState, { copper: -100, relationships: 3, fame: 2 });
    return {
      ...s,
      logs: appendLog(s.logs, day, 'survival', 'Trong năm bạn gửi tiền mừng cưới hỏi, hiếu hỉ họ hàng rất chu đáo (-100đ).'),
    };
  }
  if (tier === 'tuy_kha_nang' && inputState.assets.wealthCopper >= 40) {
    return applyEffects(inputState, { copper: -40, relationships: 1 });
  }
  if (tier === 'chi_den_chia_vui') {
    return applyEffects(inputState, { relationships: -1 });
  }
  return inputState;
}

export function runAnnualAutoActions(inputState: ActiveLifeState): ActiveLifeState {
  const age = getAgeYears(inputState.profile.totalDays);
  if (age < 15) return inputState;
  const enabled = inputState.autoActions ?? [];
  let state = inputState;

  for (const actId of enabled) {
    const def = INSTANT_ADULT_ACTIONS.find((a) => a.id === actId);
    if (!def) continue;
    // Only auto-run when cash reserve is at least 3x cost (safe buffer like 1in8b)
    if (state.assets.wealthCopper >= def.costCopper * 3) {
      const res = executeInstantAdultAction(state, actId);
      if (res.ok) state = res.state;
    }
  }
  return state;
}

const MARRIAGE_DOWRY_BY_ORIGIN: Record<OriginClass, number> = {
  ban_nong: 120,
  thu_cong: 300,
  dia_chu: 1000,
  quan_lai: 2500,
  hoang_toc: 5000,
};

export function getMarriageRequirements(state: ActiveLifeState): { minAge: number; cost: number } {
  const minAge = state.profile.gender === 'female' ? 15 : 16;
  const baseCost = MARRIAGE_DOWRY_BY_ORIGIN[state.profile.originClass];
  const isDeclined =
    state.flags.includes('gia_toc_sa_sut') || state.flags.includes('that_sung_cung_dinh');
  const cost = isDeclined ? Math.max(120, Math.round(baseCost * 0.5)) : baseCost;
  return { minAge, cost };
}

export function canMarrySpouse(state: ActiveLifeState): { ok: boolean; reason?: string; cost: number } {
  const { minAge, cost } = getMarriageRequirements(state);
  if (state.livelihoodStatus === 'prison' || state.flags.includes('dang_o_tu')) {
    return { ok: false, reason: 'Đang trong lao ngục không thể thành hôn', cost };
  }
  if (state.flags.includes('bi_truy_na')) return { ok: false, reason: 'Đang bị truy nã không thể công khai thành hôn', cost };
  if (state.flags.includes('thai_giam')) return { ok: false, reason: 'Thân phận thái giám không thể thành hôn', cost };
  if (state.flags.includes('trong_hau_cung')) return { ok: false, reason: 'Đang mang thân phận hậu cung', cost };
  if (state.flags.includes('nu_cai_nam_trang') && !state.flags.includes('nu_quan_dac_xa')) {
    return { ok: false, reason: 'Đang cải nam trang ẩn thân phận, không thể công khai thành hôn', cost };
  }
  const age = getAgeYears(state.profile.totalDays);
  if (age < minAge) return { ok: false, reason: `Cần đủ ${minAge} tuổi`, cost };
  const hasSpouse = state.npcs.some((n) => n.relation === 'spouse' && n.isAlive);
  if (hasSpouse) return { ok: false, reason: 'Đã thành gia thất', cost };
  if (state.assets.wealthCopper < cost) return { ok: false, reason: `Cần ${formatCopper(cost)} sính lễ`, cost };
  return { ok: true, cost };
}

export function marrySpouse(inputState: ActiveLifeState): ActiveLifeState {
  const elig = canMarrySpouse(inputState);
  if (!elig.ok) return inputState;
  const spouseGender = inputState.profile.gender === 'male' ? 'female' : 'male';
  const surnames = ['Nguyễn', 'Trần', 'Lê', 'Phạm', 'Hoàng', 'Vũ', 'Đặng'];
  const given = spouseGender === 'female' ? ['Lan', 'Huệ', 'Mai', 'Ngọc', 'Thảo', 'Liên'] : ['Minh', 'Tuấn', 'Hùng', 'Quân', 'Đức', 'Phúc'];
  const sPick = randomInt(inputState.prngState, 0, surnames.length - 1);
  const gPick = randomInt(sPick.nextState, 0, given.length - 1);
  const spouseName = `${surnames[sPick.value]} ${spouseGender === 'female' ? 'Thị' : 'Văn'} ${given[gPick.value]}`;

  const spouseNpc: NPC = {
    id: `npc_spouse_${inputState.profile.totalDays}`,
    name: spouseName,
    gender: spouseGender,
    relation: 'spouse',
    affinity: 70,
    isAlive: true,
    role: spouseGender === 'female' ? 'Hiền thê' : 'Phu quân',
  };

  let state = applyEffects(
    {
      ...inputState,
      prngState: gPick.nextState,
      npcs: [...inputState.npcs, spouseNpc],
    },
    {
      copper: -elig.cost,
      happiness: 14,
      relationships: 8,
      add_flags: ['da_ket_hon'],
      milestone_title: `Thành hôn cùng ${spouseName}`,
    },
  );
  return {
    ...state,
    logs: appendLog(state.logs, state.profile.totalDays, 'event', `Bạn làm lễ thành hôn cùng ${spouseName} (-300đ sính lễ).`),
  };
}

export function canHaveChild(state: ActiveLifeState): { ok: boolean; reason?: string } {
  if (state.livelihoodStatus === 'prison' || state.flags.includes('dang_o_tu')) {
    return { ok: false, reason: 'Đang trong lao ngục' };
  }
  if (state.flags.includes('thai_giam')) return { ok: false, reason: 'Thân phận thái giám không thể sinh con' };
  if (state.flags.includes('trong_hau_cung')) return { ok: false, reason: 'Đang mang thân phận hậu cung' };
  const age = getAgeYears(state.profile.totalDays);
  const hasSpouse = state.npcs.some((n) => n.relation === 'spouse' && n.isAlive);
  if (!hasSpouse) return { ok: false, reason: 'Cần thành hôn trước' };
  if (age < 18 || age > 48) return { ok: false, reason: 'Độ tuổi phù hợp 18–48' };
  const childCount = state.npcs.filter((n) => n.relation === 'child').length;
  if (childCount >= 4) return { ok: false, reason: 'Đã đủ 4 người con' };
  if (state.assets.wealthCopper < 150) return { ok: false, reason: 'Cần 150đ chi phí sinh nở' };
  return { ok: true };
}

export function haveChild(inputState: ActiveLifeState): ActiveLifeState {
  if (!canHaveChild(inputState).ok) return inputState;
  const surname = inputState.profile.fullName.split(' ')[0] || 'Nguyễn';
  const gRoll = randomInt(inputState.prngState, 0, 1);
  const cGender = gRoll.value === 0 ? 'male' : 'female';
  const pool = cGender === 'male' ? ['An', 'Bình', 'Khang', 'Long', 'Tâm'] : ['Chi', 'Hoa', 'Ngọc', 'Vân', 'Mai'];
  const nPick = randomInt(gRoll.nextState, 0, pool.length - 1);
  const childName = `${surname} ${cGender === 'male' ? 'Quang' : 'Ngọc'} ${pool[nPick.value]}`;
  const isFirst = inputState.npcs.filter((n) => n.relation === 'child').length === 0;

  const parentAge = getAgeYears(inputState.profile.totalDays);
  const childNpc: NPC = {
    id: `npc_child_${inputState.profile.totalDays}`,
    name: childName,
    gender: cGender,
    relation: 'child',
    affinity: 75,
    isAlive: true,
    role: cGender === 'male' ? 'Con trai' : 'Con gái',
    age: -parentAge,
  };

  let state = applyEffects(
    {
      ...inputState,
      prngState: nPick.nextState,
      npcs: [...inputState.npcs, childNpc],
    },
    {
      copper: -150,
      happiness: 15,
      relationships: 5,
      add_flags: ['da_co_con'],
      milestone_title: isFirst ? `Đón con đầu lòng (${childName})` : undefined,
    },
  );
  return {
    ...state,
    logs: appendLog(state.logs, state.profile.totalDays, 'event', `Gia đình vui mừng đón chào bé ${childName} chào đời (-150đ).`),
  };
}

/**
 * 1in8b-style contextual LifeFocus options:
 * - Employed / Official / Venture: full 6 options including 'cong_danh'.
 * - Seeking work (< 60y): replaces 'cong_danh' with 'tu_than' ("Ôn luyện · Tìm cơ hội").
 * - Retired / Elderly (>= 60y, no livelihood): focuses on health, family, hobbies & reflection.
 */
export function getLifeFocusOptions(state: ActiveLifeState): LifeFocusOption[] {
  const age = getAgeYears(state.profile.totalDays);
  const byId = (id: LifeFocusId): LifeFocusOption =>
    LIFE_FOCUS_OPTIONS.find((o) => o.id === id) ??
    EXTRA_FOCUS_OPTIONS[id as keyof typeof EXTRA_FOCUS_OPTIONS];

  if (state.livelihoodStatus === 'prison' || state.flags.includes('dang_o_tu')) {
    return [
      byId('can_bang'),
      { ...byId('suc_khoe'), label: 'Giữ gìn thân thể' },
      { ...byId('nghi_ngoi'), label: 'Tĩnh tâm · Nghỉ ngơi' },
      { ...byId('tu_than'), label: 'Ngẫm sự đời' },
    ];
  }

  if (state.flags.includes('trong_quan_ngu')) {
    return [
      byId('can_bang'),
      { ...byId('suc_khoe'), label: 'Thao luyện · Thể chất' },
      { ...byId('gia_dinh'), label: 'Nhớ nhà · Thư từ gia đình' },
      { ...byId('tu_than'), label: 'Rèn binh pháp · Võ nghệ' },
    ];
  }

  if (state.isStudent || state.livelihoodStatus === 'student') {
    return [
      { ...byId('tu_than'), label: 'Đèn sách · Ôn thi' },
      { ...byId('gia_dinh'), label: 'Đồng môn · Bằng hữu' },
      byId('lam_them'),
      byId('suc_khoe'),
      byId('so_thich'),
    ];
  }

  const hasJob =
    state.officialRank > 0 ||
    Boolean(state.activeCareer) ||
    Boolean(state.activeVenture);

  if (age >= 60 || state.livelihoodStatus === 'retired') {
    const elderList: LifeFocusOption[] = [
      ...(hasJob ? [byId('cong_danh')] : []),
      { ...byId('gia_dinh'), label: 'Vui vầy con cháu' },
      { ...byId('suc_khoe'), label: 'An dưỡng tuổi già' },
      { ...byId('tu_than'), label: 'Đọc sách · Viết hồi ký' },
      byId('hanh_thien'),
      ...(!hasJob ? [byId('nghi_ngoi')] : []),
      byId('so_thich'),
    ];
    return elderList;
  }

  if (hasJob) {
    return LIFE_FOCUS_OPTIONS;
  }

  return [
    byId('can_bang'),
    byId('gia_dinh'),
    byId('suc_khoe'),
    {
      ...byId('tu_than'),
      label: 'Ôn luyện · Tìm cơ hội',
      effectHint: 'Học thức & Võ nghệ↑ (+25%) · Chuẩn bị tiến thân',
    },
    byId('hanh_thien'),
    byId('nghi_ngoi'),
    byId('so_thich'),
  ];
}

/**
 * 1in8b-style `ensureFocus`: automatically transitions `schedule.lifeFocus`
 * to a valid contextual option when the character changes life stage or circumstance.
 */
export function ensureValidLifeFocus(state: ActiveLifeState): ActiveLifeState {
  const options = getLifeFocusOptions(state);
  if (options.some((o) => o.id === state.schedule.lifeFocus)) {
    return state;
  }
  const fallback = options.find((o) => o.id === 'can_bang') ?? options[0];
  if (!fallback) return state;
  return {
    ...state,
    schedule: {
      ...state.schedule,
      lifeFocus: fallback.id,
    },
    logs: appendLog(
      state.logs,
      state.profile.totalDays,
      'survival',
      `Chuyển trọng tâm năm sang «${fallback.label}» cho phù hợp hoàn cảnh hiện tại.`,
    ),
  };
}

/**
 * 1in8b-style `shopRank`: scores visible instant actions by current life context
 * and splits them into top recommended ("Nên làm lúc này") and collapsible ("Xem thêm").
 */
export function rankInstantActions(
  state: ActiveLifeState,
  actions: InstantAdultActionDef[] = INSTANT_ADULT_ACTIONS,
  maxRecommended = 6,
): { recommended: InstantAdultActionDef[]; others: InstantAdultActionDef[] } {
  const age = getAgeYears(state.profile.totalDays);
  const visible = actions.filter((act) => isInstantActionVisible(state, act));
  const hasJob =
    state.officialRank > 0 || Boolean(state.activeCareer) || Boolean(state.activeVenture);

  const scored = visible.map((act) => {
    let score = 0;
    const { canPay, effectiveCost: cost } = canAffordInstantAction(state, act);
    const cd = getInstantActionCooldownRemaining(state, act.id, act.cooldownDays);
    const isInDebt = state.assets.wealthCopper < 0 || state.flags.includes('dang_no_dia_chu');

    if (cd > 0) score -= 20;
    if (!canPay) score -= 10;

    if (act.category === 'medical') {
      if (state.stats.health < 55) score += 12;
      else if (age >= 50) score += 7;
      else score += 1;
    }

    if (act.id === 'inst_night_class' && state.stats.education < 30) score += 9;
    if (act.id === 'inst_trade_course' && hasJob && age < 50) score += 7;
    if (act.id === 'inst_open_academy' && age >= 50) score += 7;
    if (act.id === 'inst_hire_child_tutor') score += 7;
    if (act.id === 'inst_job_hunt' && (!hasJob || age <= 45)) score += !hasJob ? 10 : 6;
    if (act.id === 'inst_biz_plan' && !state.activeVenture && state.assets.wealthCopper >= 500) score += 5;

    if (act.category === 'social') {
      if (state.stats.happiness < 45 || state.stats.relationships < 40) score += 7;
      else score += 2;
      if (isInDebt && cost > 0) score -= 3;
    }

    if (act.category === 'growth') {
      if (age < 35) score += 5;
      else score += 2;
      if (isInDebt && cost > 0) score -= 3;
    }

    if (act.category === 'economic') {
      if (isInDebt && act.id.includes('sell')) score += 12;
      else if (state.assets.wealthCopper > 2000) score += 4;
    }

    if (act.minAge !== undefined && age < act.minAge) score -= 30;
    if (act.maxAge !== undefined && age > act.maxAge) score -= 30;

    return { act, score };
  });

  scored.sort((a, b) => b.score - a.score);

  const recommended = scored.slice(0, maxRecommended).map((s) => s.act);
  const others = scored.slice(maxRecommended).map((s) => s.act);
  return { recommended, others };
}
