import { type ActiveLifeState } from '../../types/activeLife';
import { appendLog, applyEffects } from '../effectApplier';
import { mulberry32Next } from '../prng';

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
