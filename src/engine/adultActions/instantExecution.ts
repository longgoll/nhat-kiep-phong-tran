import { getAgeYears, type ActiveLifeState } from '../../types/activeLife';
import type { EffectSpec } from '../../types/dsl';
import { appendLog, applyEffects } from '../effectApplier';
import { INTEREST_LABELS } from '../lifeInitializer';
import { mulberry32Next } from '../prng';
import { INSTANT_ACTIONS_CORE } from './instantCatalogCore';
import { INSTANT_ACTIONS_EXTENDED } from './instantCatalogExtended';
import type { InstantAdultActionDef } from './types';

export const INSTANT_ADULT_ACTIONS: InstantAdultActionDef[] = [
  ...INSTANT_ACTIONS_CORE,
  ...INSTANT_ACTIONS_EXTENDED,
];

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
      state.officialRank > 0 ||
      state.isStudent ||
      state.livelihoodStatus === 'student' ||
      state.flags.includes('trong_hau_cung') ||
      state.flags.includes('thai_giam') ||
      state.flags.includes('bi_ep_lam_gia_no')
    ) {
      return false;
    }
  }
  if (
    state.officialRank > 0 &&
    (def.id === 'inst_rent_room' ||
      def.id === 'inst_rent_land_season' ||
      def.id === 'inst_rent_market_stall' ||
      def.id === 'inst_night_class' ||
      def.id === 'inst_trade_course')
  ) {
    return false;
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
