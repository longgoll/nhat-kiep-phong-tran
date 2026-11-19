import {
  type ActiveLifeState,
  type HousingTier,
  type OriginClass,
  type WorldState,
} from '../../types/activeLife';
import { appendLog, applyEffects } from '../effectApplier';
import {
  COMMERCIAL_PROPERTY_IDS,
  checkHousingTiemLe,
  checkOfficialPropertyRule,
} from '../officialSystem';

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
