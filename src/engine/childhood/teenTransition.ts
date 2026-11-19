import { type ActiveLifeState } from '../../types/activeLife';
import { appendLog, applyEffects } from '../effectApplier';
import { ORIGIN_CORE_CONFIG } from '../originConfigs';
import { getLivingParentTerm } from './focusOptions';

export function applyTeenTransition(inputState: ActiveLifeState): ActiveLifeState {
  const { originClass, gender } = inputState.profile;
  const { relationships } = inputState.stats;
  const familyWealth = inputState.family?.familyWealthCopper ?? inputState.assets.wealthCopper;
  const birthOrder = inputState.family?.birthOrder ?? 'con_mot';
  const isDeclined =
    inputState.flags.includes('gia_toc_sa_sut') || inputState.flags.includes('that_sung_cung_dinh');

  let keepRatio = 0.15;
  if (originClass === 'ban_nong') keepRatio = 0.15;
  else if (originClass === 'thu_cong') keepRatio = 0.25;
  else keepRatio = relationships >= 40 ? 0.35 : 0.1;

  if (birthOrder === 'con_truong' && originClass !== 'ban_nong') {
    keepRatio += 0.08;
  } else if (birthOrder === 'con_mot') {
    keepRatio += 0.1;
  }

  if (isDeclined) {
    keepRatio = Math.max(0.1, keepRatio * 0.6);
  }

  const maxGrantByOrigin: Record<ActiveLifeState['profile']['originClass'], number> = {
    ban_nong: 60,
    thu_cong: 250,
    dia_chu: 1200,
    quan_lai: 2500,
    hoang_toc: 6000,
  };
  const wasIndentured = inputState.flags.includes('tung_o_do');
  const continueServitude =
    wasIndentured &&
    (inputState.family?.familyLivingTier === 'tung_thieu' ||
      inputState.flags.includes('gia_dinh_mac_no'));

  const rawGrant = Math.round(familyWealth * keepRatio);
  const cappedGrant = Math.min(maxGrantByOrigin[originClass], rawGrant);
  const familyGrantCopper = continueServitude ? 0 : Math.max(15, Math.min(familyWealth, cappedGrant));
  const nextFamilyWealth = Math.max(0, familyWealth - familyGrantCopper);
  const personalCopper = inputState.assets.wealthCopper + familyGrantCopper;
  const baseRiceByOrigin: Record<ActiveLifeState['profile']['originClass'], number> = {
    ban_nong: 10,
    thu_cong: 12,
    dia_chu: 18,
    quan_lai: 24,
    hoang_toc: 30,
  };
  const riceMult = isDeclined ? 0.6 : 1.0;
  const personalRice = Math.max(5, Math.round(inputState.assets.rice + baseRiceByOrigin[originClass] * riceMult));

  let teenRole = 'Thanh niên tự lập';
  if (originClass === 'thu_cong') teenRole = 'Thiếu niên học nghề';
  else if (originClass === 'dia_chu') teenRole = isDeclined ? 'Thiếu gia sa sút' : 'Thiếu niên lập thân';
  else if (originClass === 'quan_lai') {
    teenRole = isDeclined
      ? 'Con quan thất thế'
      : gender === 'male'
        ? 'Công tử thế gia'
        : 'Thiên kim thế gia';
  } else if (originClass === 'hoang_toc') {
    teenRole = isDeclined ? 'Hoàng thân thất thế' : gender === 'male' ? 'Hoàng tử' : 'Công chúa';
  }

  // Assign a sensible starter schedule at age 13 if still on infant default ('act_nghi_ngoi')
  const starterCfg = ORIGIN_CORE_CONFIG[originClass].teenStarterSchedule;
  let starterMorning = inputState.schedule.morning;
  let starterAfternoon = inputState.schedule.afternoon;
  let starterEvening = inputState.schedule.evening;
  if (starterMorning === 'act_nghi_ngoi' && starterAfternoon === 'act_nghi_ngoi') {
    starterMorning = starterCfg.morning;
    starterAfternoon = starterCfg.afternoon;
    if (starterEvening === 'act_nghi_ngoi') {
      starterEvening = starterCfg.evening;
    }
  }

  const starterFallbackRules = inputState.schedule.fallbackRules;

  let state: ActiveLifeState = {
    ...inputState,
    profile: {
      ...inputState.profile,
      currentRole: teenRole,
    },
    assets: {
      ...inputState.assets,
      wealthCopper: personalCopper,
      rice: personalRice,
    },
    family: inputState.family
      ? {
          ...inputState.family,
          familyWealthCopper: nextFamilyWealth,
        }
      : inputState.family,
    schedule: {
      ...inputState.schedule,
      morning: starterMorning,
      afternoon: starterAfternoon,
      evening: starterEvening,
      fallbackRules: starterFallbackRules,
    },
  };

  const transitionAddFlags = ['da_truong_thanh_13'];
  const transitionRemoveFlags: string[] = [];
  if (wasIndentured) {
    transitionRemoveFlags.push('tung_o_do');
    transitionAddFlags.push('xuat_than_o_do');
    if (continueServitude) {
      transitionAddFlags.push('bi_ep_lam_gia_no');
    }
  }

  state = applyEffects(state, {
    add_flags: transitionAddFlags,
    remove_flags: transitionRemoveFlags.length > 0 ? transitionRemoveFlags : undefined,
    milestone_title: continueServitude
      ? 'Tuổi 13 tiếp tục kiếp gia nô trừ nợ'
      : 'Bước vào tuổi 13 tự lập',
  });

  const parentInfo = getLivingParentTerm(state);
  const teenGiver =
    parentInfo.hasFather && parentInfo.hasMother
      ? 'Cha mẹ'
      : parentInfo.hasFather
        ? 'Cha'
        : parentInfo.hasMother
          ? 'Mẹ'
          : 'Gia đình';

  const teenLogByOrigin: Record<ActiveLifeState['profile']['originClass'], string> = {
    ban_nong: `Tuổi 13 thành đinh! ${teenGiver} chắt chiu chia cho ${familyGrantCopper} đồng tiền vốn và ${personalRice} đấu gạo làm hành trang tự lập.`,
    thu_cong: `Tuổi 13 học nghề lập nghiệp! Gia đình trích ${familyGrantCopper} đồng vốn liếng cùng ${personalRice} đấu gạo để bạn tự xoay xở.`,
    dia_chu: `Tuổi 13 nối dõi cơ nghiệp! Gia đình cấp ${familyGrantCopper} đồng tiền tiêu và ${personalRice} đấu gạo làm vốn lập thân.`,
    quan_lai: isDeclined
      ? `Tuổi 13 giữa lúc gia đạo sa sút, nhà chỉ còn gom được ${familyGrantCopper} đồng và ${personalRice} đấu gạo cho bạn tự lập.`
      : `Tuổi 13 trưởng thành trong phủ quan! Gia đình cấp ${familyGrantCopper} đồng bạc cùng ${personalRice} đấu gạo để bạn dùi mài công danh.`,
    hoang_toc: isDeclined
      ? `Tuổi 13 nơi cung hẻo lánh, người nhà chỉ gom được ${familyGrantCopper} đồng tiền tiêu cùng ${personalRice} đấu gạo để bạn tự xoay xở.`
      : `Tuổi 13 vào Thượng Thư Phòng theo học lễ nghi và kinh sử! Khi chưa có tước vị chính thức, gia đình chỉ cấp ${familyGrantCopper} đồng tiền tiêu vặt cùng ${personalRice} đấu gạo.`,
  };

  const transitionLogText = wasIndentured
    ? continueServitude
      ? `Tuổi 13 mãn hạn ở đợ nhỏ nhưng gia cảnh vẫn túng thiếu, nhà địa chủ ép ký tiếp khế ước dài hạn làm gia nô trừ nợ.`
      : `Tuổi 13 mãn hạn ở đợ! Bạn rời phủ địa chủ trở về tự lập với ${familyGrantCopper} đồng vốn liếng và ${personalRice} đấu gạo.`
    : teenLogByOrigin[originClass];

  state = {
    ...state,
    logs: appendLog(
      state.logs,
      state.profile.totalDays,
      'childhood',
      transitionLogText,
    ),
  };

  return state;
}
