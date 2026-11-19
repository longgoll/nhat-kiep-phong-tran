import {
  getAgeYears,
  type ActiveLifeState,
  type GiftEtiquetteTier,
  type LifeFocusId,
} from '../../types/activeLife';
import type { EffectSpec } from '../../types/dsl';
import { appendLog, applyEffects } from '../effectApplier';
import { INTEREST_LABELS } from '../lifeInitializer';
import { pickWeightedIndex, randomInt } from '../prng';
import type { LifeFocusOption } from './types';
import { INSTANT_ADULT_ACTIONS, executeInstantAdultAction } from './instantExecution';

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

export function getDailyFocusModifiers(focusId: string): {
  copperMult: number;
  studyMartialMult: number;
  dailyEffects: EffectSpec;
  dailyCopperCost: number;
} {
  switch (focusId) {
    case 'cong_danh':
      return {
        copperMult: 1.12,
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
