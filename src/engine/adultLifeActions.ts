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
import { appendLog, applyEffects } from './effectApplier';
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
    description: 'Dành nhiều tâm trí cho cha mẹ, anh chị em và bạn bè xung quanh.',
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
  blockedWorldStates?: WorldState[];
  requiresWorldStates?: WorldState[];
  category?: 'medical' | 'social' | 'economic' | 'growth';
  requiresNotHousing?: HousingTier;
  requiresHousingIn?: HousingTier[];
  requiresLivingFamily?: boolean;
  requiresLivingParent?: boolean;
  requiresFlag?: string;
  requiresOfficialOrNoble?: boolean;
  requiresOrigins?: OriginClass[];
  excludeOrigins?: OriginClass[];
  effects: EffectSpec;
  levelUpHobby?: boolean;
  logText: string;
}

export function isInstantActionVisible(state: ActiveLifeState, def: InstantAdultActionDef): boolean {
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
  if (def.requiresLivingParent) {
    const hasParent = state.npcs.some((n) => n.relation === 'parent' && n.isAlive);
    if (!hasParent) return false;
  }
  if (def.minEducation !== undefined && state.stats.education < def.minEducation) {
    return false;
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
    subtitle: 'Chỗ ở → Nhà tranh · Sức khỏe +5 · Hạnh phúc +8',
    costCopper: 180,
    cooldownDays: 90,
    requiresHousingIn: ['gam_cau'],
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
    subtitle: 'Nhận +7 đấu gạo · Hạnh phúc +2',
    costCopper: 120,
    cooldownDays: 90,
    excludeOrigins: ['hoang_toc', 'quan_lai'],
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
    subtitle: 'Thương tài +1.5 · Thu về 240đ (+60đ lãi)',
    costCopper: 180,
    cooldownDays: 90,
    excludeOrigins: ['hoang_toc', 'quan_lai'],
    effects: {
      copper: 240,
      craft_trade: 1.5,
      stamina: -15,
    },
    logText: 'Bạn thuê tạm một góc sạp chợ phiên bán hàng khô và vải vóc, xoay vòng vốn thu được chút lãi.',
  },
  {
    id: 'inst_send_parents_money',
    title: 'Gửi tiền phụng dưỡng cha mẹ phương xa',
    subtitle: 'Thân thiết cha mẹ +10 · Hạnh phúc +4 · Thanh danh +2',
    costCopper: 100,
    cooldownDays: 120,
    requiresFlag: 'da_ra_o_rieng',
    requiresLivingParent: true,
    effects: {
      happiness: 4,
      fame: 2,
      npc_affinity: [{ relation: 'parent', delta: 10 }],
    },
    logText: 'Bạn gửi người quen mang trăm đồng tiền kẽm cùng ít quà về biếu song thân.',
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
    title: 'Trả nợ thay cha mẹ · Xóa văn tự nợ',
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
    logText: 'Bạn mang tiền dành dụm về trả sạch món nợ cũ, xé bỏ văn tự nợ trước sự nhẹ nhõm và tự hào của cha mẹ.',
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
];

export function getEffectiveInstantActionCost(
  state: ActiveLifeState,
  def: InstantAdultActionDef,
): number {
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

  const effectiveCost = getEffectiveInstantActionCost(inputState, def);
  const remaining = getInstantActionCooldownRemaining(inputState, def.id, def.cooldownDays);
  if (remaining > 0) {
    return { ok: false, state: inputState, message: `Cần chờ thêm ${remaining} ngày nữa.` };
  }
  if (inputState.assets.wealthCopper < effectiveCost) {
    return { ok: false, state: inputState, message: 'Không đủ tiền đồng.' };
  }

  const scaledEffects: EffectSpec = { ...def.effects };
  if (def.id === 'inst_rent_land_season' && inputState.world.worldState === 'mat_mua') {
    scaledEffects.rice = 3;
  } else if (
    def.id === 'inst_rent_market_stall' ||
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

  let state = applyEffects(inputState, {
    ...scaledEffects,
    copper: -effectiveCost + (scaledEffects.copper ?? 0),
  });

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
      `${def.logText}${extraLog} (-${effectiveCost}đ)`,
    ),
  };

  return { ok: true, state, message: `${def.logText}${extraLog}` };
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
        dailyEffects: { health: -0.02, relationships: -0.015 },
        dailyCopperCost: 0,
      };
    case 'gia_dinh':
      return {
        copperMult: 0.95,
        studyMartialMult: 1.0,
        dailyEffects: { relationships: 0.1, happiness: 0.08 },
        dailyCopperCost: 0,
      };
    case 'suc_khoe':
      return {
        copperMult: 0.95,
        studyMartialMult: 1.0,
        dailyEffects: { health: 0.12, stamina: 4 },
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
        dailyEffects: { happiness: 0.1 },
        dailyCopperCost: 0,
      };
    case 'can_bang':
    default:
      return {
        copperMult: 1.0,
        studyMartialMult: 1.05,
        dailyEffects: { happiness: 0.02 },
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

export function canMarrySpouse(state: ActiveLifeState): { ok: boolean; reason?: string } {
  if (state.flags.includes('thai_giam')) return { ok: false, reason: 'Thân phận thái giám không thể thành hôn' };
  if (state.flags.includes('trong_hau_cung')) return { ok: false, reason: 'Đang mang thân phận hậu cung' };
  const age = getAgeYears(state.profile.totalDays);
  if (age < 18) return { ok: false, reason: 'Cần đủ 18 tuổi' };
  const hasSpouse = state.npcs.some((n) => n.relation === 'spouse' && n.isAlive);
  if (hasSpouse) return { ok: false, reason: 'Đã thành gia thất' };
  if (state.assets.wealthCopper < 300) return { ok: false, reason: 'Cần 300đ sính lễ' };
  return { ok: true };
}

export function marrySpouse(inputState: ActiveLifeState): ActiveLifeState {
  if (!canMarrySpouse(inputState).ok) return inputState;
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
      copper: -300,
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
  if (state.flags.includes('thai_giam')) return { ok: false, reason: 'Thân phận thái giám không thể sinh con' };
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

  const childNpc: NPC = {
    id: `npc_child_${inputState.profile.totalDays}`,
    name: childName,
    gender: cGender,
    relation: 'child',
    affinity: 75,
    isAlive: true,
    role: cGender === 'male' ? 'Con trai' : 'Con gái',
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
  const hasJob =
    state.officialRank > 0 ||
    Boolean(state.activeCareer) ||
    Boolean(state.activeVenture) ||
    state.flags.includes('trong_quan_ngu');

  if (hasJob) {
    return LIFE_FOCUS_OPTIONS;
  }

  if (age >= 60) {
    return LIFE_FOCUS_OPTIONS.filter((opt) => opt.id !== 'cong_danh').map((opt) => {
      if (opt.id === 'suc_khoe') {
        return { ...opt, label: 'An dưỡng tuổi già' };
      }
      if (opt.id === 'gia_dinh') {
        return { ...opt, label: 'Vui vầy con cháu' };
      }
      if (opt.id === 'tu_than') {
        return { ...opt, label: 'Đọc sách · Viết hồi ký' };
      }
      return opt;
    });
  }

  return LIFE_FOCUS_OPTIONS.filter((opt) => opt.id !== 'cong_danh').map((opt) => {
    if (opt.id === 'tu_than') {
      return {
        ...opt,
        label: 'Ôn luyện · Tìm cơ hội',
        effectHint: 'Học thức & Võ nghệ↑ (+25%) · Chuẩn bị tiến thân',
      };
    }
    return opt;
  });
}

/**
 * 1in8b-style `shopRank`: scores visible instant actions by current life context
 * and splits them into top recommended ("Nên làm lúc này") and collapsible ("Xem thêm").
 */
export function rankInstantActions(
  state: ActiveLifeState,
  actions: InstantAdultActionDef[] = INSTANT_ADULT_ACTIONS,
  maxRecommended = 4,
): { recommended: InstantAdultActionDef[]; others: InstantAdultActionDef[] } {
  const age = getAgeYears(state.profile.totalDays);
  const visible = actions.filter((act) => isInstantActionVisible(state, act));

  const scored = visible.map((act) => {
    let score = 0;
    const cost = getEffectiveInstantActionCost(state, act);
    const cd = getInstantActionCooldownRemaining(state, act.id, act.cooldownDays);
    const canAfford = state.assets.wealthCopper >= cost;
    const isInDebt = state.assets.wealthCopper < 0 || state.flags.includes('dang_no_dia_chu');

    if (cd > 0) score -= 20;
    if (!canAfford) score -= 10;

    if (act.category === 'medical') {
      if (state.stats.health < 55) score += 12;
      else if (age >= 50) score += 6;
      else score += 1;
    }

    if (act.category === 'social') {
      if (state.stats.happiness < 45 || state.stats.relationships < 40) score += 7;
      else score += 2;
      if (isInDebt && cost > 0) score -= 4;
    }

    if (act.category === 'growth') {
      if (age < 35) score += 5;
      else score += 2;
      if (isInDebt && cost > 0) score -= 3;
    }

    if (act.category === 'economic') {
      if (isInDebt && act.id.includes('sell')) score += 10;
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
