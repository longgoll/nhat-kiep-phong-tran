import { type ActiveLifeState } from '../../types/activeLife';
import type { ChildhoodActivityDef, EffectSpec } from '../../types/dsl';
import { evaluateConditions } from '../conditionEvaluator';

export interface ChildhoodFocusOption {
  id: string;
  label: string;
  effectHint: string;
  description: string;
  monthlyEffects: EffectSpec;
  interestOnBirthday?: string;
}

export const CHILDHOOD_FOCUS_OPTIONS: ChildhoodFocusOption[] = [
  {
    id: 'hoc_tap',
    label: 'Học chữ · Kinh sử',
    effectHint: 'Học thức↑ · Hạnh phúc↑',
    description: 'Miệt mài đọc sách, luyện chữ và nghe giảng kinh sử để mở đường khoa cử.',
    monthlyEffects: { education: 0.14, happiness: 0.03 },
    interestOnBirthday: 'kinh_su',
  },
  {
    id: 'ban_be',
    label: 'Bạn bè · Vui chơi',
    effectHint: 'Quan hệ↑ · Hạnh phúc↑',
    description: 'Chạy nhảy khắp xóm làng, kết thân với bạn đồng niên và giữ tâm hồn vui vẻ.',
    monthlyEffects: { relationships: 0.12, happiness: 0.08 },
  },
  {
    id: 'giup_nha',
    label: 'Phụ giúp gia đình',
    effectHint: 'Gia sản↑ · Gắn kết↑',
    description: 'Phụ cha mẹ việc đồng áng, buôn bán hoặc giữ nếp nhà để gia đình thêm khấm khá.',
    monthlyEffects: { relationships: 0.08, craft_trade: 0.09, family_copper: 12 },
  },
  {
    id: 'ren_vo',
    label: 'Rèn võ · Thể chất',
    effectHint: 'Sức khỏe↑ · Võ nghệ↑',
    description: 'Chạy bộ, tập quyền cước và rèn gân cốt từ nhỏ để thân thể cường tráng.',
    monthlyEffects: { health: 0.09, martial: 0.15 },
    interestOnBirthday: 'vo_nghe',
  },
  {
    id: 'so_thich',
    label: 'Thú vui · Sở thích',
    effectHint: 'Hạnh phúc↑ · Khéo tay↑',
    description: 'Dành thời gian cho những thú vui tao nhã, thư họa, đan lát hoặc ngắm cảnh.',
    monthlyEffects: { happiness: 0.09, craft_trade: 0.09 },
  },
];

/**
 * Returns an accurate Vietnamese parent reference based on which parents are alive.
 */
export function getLivingParentTerm(state: ActiveLifeState): {
  term: string;
  hasFather: boolean;
  hasMother: boolean;
  hasAny: boolean;
} {
  const hasFather =
    state.npcs.some((n) => n.id === 'npc_father' && n.isAlive) &&
    !state.flags.includes('mo_coi_cha');
  const hasMother =
    state.npcs.some((n) => n.id === 'npc_mother' && n.isAlive) &&
    !state.flags.includes('mo_coi_me');
  const term =
    hasFather && hasMother
      ? 'cha mẹ'
      : hasFather
        ? 'cha'
        : hasMother
          ? 'mẹ'
          : 'người nhà';
  return { term, hasFather, hasMother, hasAny: hasFather || hasMother };
}

/**
 * Returns childhood focus options tailored to the character's origin class, living tier, and traits.
 */
export function getChildhoodFocusOptions(state: ActiveLifeState): ChildhoodFocusOption[] {
  const origin = state.profile.originClass;
  const tier = state.family?.familyLivingTier ?? 'du_an';
  const isProdigy = state.traits?.includes('than_dong') ?? false;
  const prodigyEduBonus = isProdigy ? 0.1 : 0;
  const parentInfo = getLivingParentTerm(state);
  const isDeclined =
    tier === 'tung_thieu' ||
    state.flags.includes('gia_toc_sa_sut') ||
    state.flags.includes('that_sung_cung_dinh');

  const resolveStudyOption = (base: ChildhoodFocusOption): ChildhoodFocusOption => {
    const suffix = isProdigy ? ' (Thần đồng↑)' : '';
    switch (origin) {
      case 'ban_nong': {
        const hasTeacher = state.flags.includes('duoc_thay_do_quy');
        return hasTeacher
          ? {
              ...base,
              label: 'Theo học thầy đồ',
              effectHint: `Học thức↑${suffix} · Hạnh phúc↑`,
              description:
                'Nhờ được thầy đồ thương tình nhận dạy, bạn chăm chỉ mài mực, học chữ thánh hiền.',
              monthlyEffects: { education: 0.14 + prodigyEduBonus, happiness: 0.04 },
            }
          : {
              ...base,
              label: 'Tự học · Học lỏm',
              effectHint: `Học thức${isProdigy ? '↑ (Thần đồng)' : '↗'} · Hạnh phúc↑`,
              description:
                'Không có tiền đi học, bạn lén nghe thầy đồ giảng bài và lấy que tre vạch chữ xuống đất.',
              monthlyEffects: { education: 0.08 + prodigyEduBonus, happiness: 0.02 },
            };
      }
      case 'thu_cong':
        return {
          ...base,
          label: 'Học chữ · Tính sổ',
          effectHint: `Học thức↑${suffix} · Khéo tay↑`,
          description: parentInfo.hasAny
            ? `Theo học lớp thầy đồ làng và tập tính toán sổ sách buôn bán cùng ${parentInfo.term}.`
            : 'Theo học lớp thầy đồ làng và tự tập tính toán sổ sách buôn bán.',
          monthlyEffects: { education: 0.11 + prodigyEduBonus, craft_trade: 0.04, happiness: 0.02 },
        };
      case 'dia_chu':
        return {
          ...base,
          label: 'Học chữ · Sổ điền trang',
          effectHint: `Học thức↑${suffix} · Hạnh phúc↑`,
          description:
            'Nhà có điều kiện mời ông đồ về dạy chữ thánh hiền và tập đọc khế ước điền trang.',
          monthlyEffects: { education: 0.15 + prodigyEduBonus, happiness: 0.03 },
        };
      case 'quan_lai':
        return isDeclined
          ? {
              ...base,
              label: 'Tự đọc tàng thư cũ',
              effectHint: `Học thức↑${suffix} · Hạnh phúc↑`,
              description:
                'Gia đạo sa sút không còn mời được danh sư, bạn tự nghiền ngẫm sách vở cũ trong nhà.',
              monthlyEffects: { education: 0.11 + prodigyEduBonus, happiness: 0.02 },
            }
          : {
              ...base,
              label: 'Đèn sách · Gia học',
              effectHint: `Học thức↑↑${suffix} · Hạnh phúc↑`,
              description:
                'Dưới sự kèm cặp của danh sư và thư viện gia đình, bạn dùi mài kinh sử chuẩn bị khoa cử.',
              monthlyEffects: { education: 0.16 + prodigyEduBonus, happiness: 0.03 },
            };
      case 'hoang_toc':
        return isDeclined
          ? {
              ...base,
              label: 'Đọc sách nơi lãnh cung',
              effectHint: `Học thức↑${suffix} · Hạnh phúc↑`,
              description:
                'Thất sủng thiếu thầy chỉ dạy, bạn lặng lẽ tự đọc kinh sử để giữ phẩm cách Tôn thất.',
              monthlyEffects: { education: 0.11 + prodigyEduBonus, happiness: 0.01 },
            }
          : {
              ...base,
              label: 'Quốc Tử Giám · Kinh sử',
              effectHint: `Học thức↑↑${suffix} · Hạnh phúc↑`,
              description:
                'Được Thái phó và các bậc đại nho triều đình trực tiếp truyền thụ kinh sử, trị quốc.',
              monthlyEffects: { education: 0.18 + prodigyEduBonus, happiness: 0.03 },
            };
      default:
        return base;
    }
  };

  const isIndentured = state.flags.includes('tung_o_do');

  return CHILDHOOD_FOCUS_OPTIONS.map((opt) => {
    if (isIndentured) {
      switch (opt.id) {
        case 'hoc_tap':
          return {
            ...opt,
            label: 'Học lỏm thư phòng phủ chủ',
            effectHint: `Học thức↑${isProdigy ? ' (Thần đồng↑)' : ''} · Hạnh phúc↗`,
            description:
              'Tranh thủ lúc bưng trà, dọn dẹp thư phòng để nghe lỏm thầy đồ giảng chữ cho con nhà chủ.',
            monthlyEffects: { education: 0.18 + prodigyEduBonus, happiness: 0.03 },
          };
        case 'ban_be':
          return {
            ...opt,
            label: 'Kết giao gia nhân · Con nhà chủ',
            effectHint: 'Quan hệ↑ · Hạnh phúc↑',
            description:
              'Cư xử lễ phép, thật thà với đám gia nhân lâu năm và con cái nhà chủ để bớt phần cơ cực.',
            monthlyEffects: { relationships: 0.22, happiness: 0.1 },
          };
        case 'giup_nha':
          return {
            ...opt,
            label: 'Làm lụng trừ nợ · Tích cóp',
            effectHint: 'Gia sản↑ · Tiền riêng↑ · Khéo tay↑',
            description:
              'Chăm chỉ làm việc nhà chủ để trừ dần nợ cho gia đình và chắt chiu ít tiền công lẻ.',
            monthlyEffects: { craft_trade: 0.16, family_copper: 14, copper: 2 },
          };
        case 'ren_vo':
          return {
            ...opt,
            label: 'Gánh nước · Bổ củi rèn sức',
            effectHint: 'Sức khỏe↑ · Võ nghệ↗',
            description:
              'Mượn chính việc nặng nhọc hàng ngày như gánh nước, bổ củi để rèn gân cốt dẻo dai.',
            monthlyEffects: { health: 0.14, martial: 0.2 },
          };
        case 'so_thich':
          return {
            ...opt,
            label: 'Thủ công vặt lúc rảnh rỗi',
            effectHint: 'Hạnh phúc↑ · Khéo tay↑',
            description:
              'Tối đến tranh thủ đan lát, vá víu đồ đạc sau bếp để khuây khỏa nỗi nhớ nhà.',
            monthlyEffects: { happiness: 0.12, craft_trade: 0.18 },
          };
        default:
          return opt;
      }
    }

    if (opt.id === 'hoc_tap') {
      return resolveStudyOption(opt);
    }

    if (origin !== 'ban_nong') {
      if (opt.id === 'giup_nha') {
        return {
          ...opt,
          description: parentInfo.hasAny
            ? `Phụ ${parentInfo.term} việc đồng áng, buôn bán hoặc giữ nếp nhà để gia đình thêm khấm khá.`
            : 'Phụ giúp việc nhà cửa, buôn bán và giữ nếp sinh hoạt để gia cảnh thêm ổn định.',
        };
      }
      return opt;
    }

    switch (opt.id) {
      case 'ban_be':
        return {
          ...opt,
          label: 'Bạn bè · Thả diều',
          effectHint: 'Quan hệ↑ · Hạnh phúc↑',
          description: 'Chơi ô ăn quan, thả diều sáo ngoài bãi cỏ cùng đám trẻ con trong xóm.',
          monthlyEffects: { relationships: 0.12, happiness: 0.07 },
        };
      case 'giup_nha':
        return {
          ...opt,
          label: 'Chăn trâu · Phụ đồng áng',
          effectHint: 'Gia sản↑ · Sức khỏe↑ · Gắn kết↑',
          description: parentInfo.hasAny
            ? `Theo ${parentInfo.term} ra đồng cắt cỏ, chăn trâu, mót lúa để đỡ đần miếng cơm manh áo cho cả nhà.`
            : 'Ra đồng cắt cỏ, chăn trâu, mót lúa để tự lo miếng cơm manh áo cho gia đình.',
          monthlyEffects: { health: 0.05, relationships: 0.08, family_copper: 15 },
        };
      case 'ren_vo':
        return {
          ...opt,
          label: 'Chạy nhảy · Lội đồng',
          effectHint: 'Sức khỏe↑ · Võ nghệ↗',
          description:
            'Bơi sông, leo cây, chạy nhảy khắp triền đê giúp thân thể dẻo dai dù không có thầy dạy võ.',
          monthlyEffects: { health: 0.11, martial: 0.08 },
        };
      case 'so_thich':
        return {
          ...opt,
          label: 'Khéo tay · Đan lát',
          effectHint: 'Hạnh phúc↑ · Khéo tay↑',
          description: 'Thắt cào cào lá dừa, đẽo con quay gỗ hoặc tập đan rổ rá dưới gốc đa đầu làng.',
          monthlyEffects: { happiness: 0.08, craft_trade: 0.1 },
        };
      default:
        return opt;
    }
  });
}

export function getAvailableChildhoodActivities(
  state: ActiveLifeState,
  activities: ChildhoodActivityDef[],
): ChildhoodActivityDef[] {
  const familyFunds = state.family?.familyWealthCopper ?? state.assets.wealthCopper;
  return activities.filter(
    (act) => evaluateConditions(state, act.conditions) && familyFunds >= act.costCopper,
  );
}
