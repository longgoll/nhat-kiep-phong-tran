import {
  getAgeYears,
  type ActiveLifeState,
  type NPC,
  type OriginClass,
} from '../../types/activeLife';
import { formatCopper } from '../economy';
import { appendLog, applyEffects } from '../effectApplier';
import { randomInt } from '../prng';

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
