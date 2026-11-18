import {
  DAYS_PER_MONTH,
  DAYS_PER_YEAR,
  getAgeYears,
  getSeasonFromDays,
  type ActiveLifeState,
  type LogEntry,
} from '../types/activeLife';
import type {
  ChildhoodActivityDef,
  ChildhoodAmbientData,
  EffectSpec,
  GameEventDef,
} from '../types/dsl';
import { computeWeight, evaluateConditions } from './conditionEvaluator';
import { appendLog, applyAnnualStatMeanReversion, applyEffects } from './effectApplier';
import { ORIGIN_CORE_CONFIG } from './originConfigs';
import { mulberry32Next, pickWeightedIndex } from './prng';

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
    monthlyEffects: { education: 0.25, happiness: 0.05 },
    interestOnBirthday: 'kinh_su',
  },
  {
    id: 'ban_be',
    label: 'Bạn bè · Vui chơi',
    effectHint: 'Quan hệ↑ · Hạnh phúc↑',
    description: 'Chạy nhảy khắp xóm làng, kết thân với bạn đồng niên và giữ tâm hồn vui vẻ.',
    monthlyEffects: { relationships: 0.22, happiness: 0.14 },
  },
  {
    id: 'giup_nha',
    label: 'Phụ giúp gia đình',
    effectHint: 'Gia sản↑ · Gắn kết↑',
    description: 'Phụ cha mẹ việc đồng áng, buôn bán hoặc giữ nếp nhà để gia đình thêm khấm khá.',
    monthlyEffects: { relationships: 0.14, craft_trade: 0.15, family_copper: 12 },
  },
  {
    id: 'ren_vo',
    label: 'Rèn võ · Thể chất',
    effectHint: 'Sức khỏe↑ · Võ nghệ↑',
    description: 'Chạy bộ, tập quyền cước và rèn gân cốt từ nhỏ để thân thể cường tráng.',
    monthlyEffects: { health: 0.16, martial: 0.28 },
    interestOnBirthday: 'vo_nghe',
  },
  {
    id: 'so_thich',
    label: 'Thú vui · Sở thích',
    effectHint: 'Hạnh phúc↑ · Khéo tay↑',
    description: 'Dành thời gian cho những thú vui tao nhã, thư họa, đan lát hoặc ngắm cảnh.',
    monthlyEffects: { happiness: 0.18, craft_trade: 0.15 },
  },
];

/**
 * Returns childhood focus options tailored to the character's origin class, living tier, and traits.
 */
export function getChildhoodFocusOptions(state: ActiveLifeState): ChildhoodFocusOption[] {
  const origin = state.profile.originClass;
  const tier = state.family?.familyLivingTier ?? 'du_an';
  const isProdigy = state.traits?.includes('than_dong') ?? false;
  const prodigyEduBonus = isProdigy ? 0.1 : 0;
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
              monthlyEffects: { education: 0.25 + prodigyEduBonus, happiness: 0.06 },
            }
          : {
              ...base,
              label: 'Tự học · Học lỏm',
              effectHint: `Học thức${isProdigy ? '↑ (Thần đồng)' : '↗'} · Hạnh phúc↑`,
              description:
                'Không có tiền đi học, bạn lén nghe thầy đồ giảng bài và lấy que tre vạch chữ xuống đất.',
              monthlyEffects: { education: 0.15 + prodigyEduBonus, happiness: 0.04 },
            };
      }
      case 'thu_cong':
        return {
          ...base,
          label: 'Học chữ · Tính sổ',
          effectHint: `Học thức↑${suffix} · Khéo tay↑`,
          description:
            'Theo học lớp thầy đồ làng và tập tính toán sổ sách buôn bán cùng cha mẹ.',
          monthlyEffects: { education: 0.2 + prodigyEduBonus, craft_trade: 0.06, happiness: 0.04 },
        };
      case 'dia_chu':
        return {
          ...base,
          label: 'Học chữ · Sổ điền trang',
          effectHint: `Học thức↑${suffix} · Hạnh phúc↑`,
          description:
            'Nhà có điều kiện mời ông đồ về dạy chữ thánh hiền và tập đọc khế ước điền trang.',
          monthlyEffects: { education: 0.26 + prodigyEduBonus, happiness: 0.05 },
        };
      case 'quan_lai':
        return isDeclined
          ? {
              ...base,
              label: 'Tự đọc tàng thư cũ',
              effectHint: `Học thức↑${suffix} · Hạnh phúc↑`,
              description:
                'Gia đạo sa sút không còn mời được danh sư, bạn tự nghiền ngẫm sách vở cũ trong nhà.',
              monthlyEffects: { education: 0.2 + prodigyEduBonus, happiness: 0.03 },
            }
          : {
              ...base,
              label: 'Đèn sách · Gia học',
              effectHint: `Học thức↑↑${suffix} · Hạnh phúc↑`,
              description:
                'Dưới sự kèm cặp của danh sư và thư viện gia đình, bạn dùi mài kinh sử chuẩn bị khoa cử.',
              monthlyEffects: { education: 0.3 + prodigyEduBonus, happiness: 0.05 },
            };
      case 'hoang_toc':
        return isDeclined
          ? {
              ...base,
              label: 'Đọc sách nơi lãnh cung',
              effectHint: `Học thức↑${suffix} · Hạnh phúc↑`,
              description:
                'Thất sủng thiếu thầy chỉ dạy, bạn lặng lẽ tự đọc kinh sử để giữ phẩm cách Tôn thất.',
              monthlyEffects: { education: 0.2 + prodigyEduBonus, happiness: 0.02 },
            }
          : {
              ...base,
              label: 'Quốc Tử Giám · Kinh sử',
              effectHint: `Học thức↑↑${suffix} · Hạnh phúc↑`,
              description:
                'Được Thái phó và các bậc đại nho triều đình trực tiếp truyền thụ kinh sử, trị quốc.',
              monthlyEffects: { education: 0.32 + prodigyEduBonus, happiness: 0.06 },
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
      return opt;
    }

    switch (opt.id) {
      case 'ban_be':
        return {
          ...opt,
          label: 'Bạn bè · Thả diều',
          effectHint: 'Quan hệ↑ · Hạnh phúc↑',
          description: 'Chơi ô ăn quan, thả diều sáo ngoài bãi cỏ cùng đám trẻ con trong xóm.',
          monthlyEffects: { relationships: 0.24, happiness: 0.14 },
        };
      case 'giup_nha':
        return {
          ...opt,
          label: 'Chăn trâu · Phụ đồng áng',
          effectHint: 'Gia sản↑ · Sức khỏe↑ · Gắn kết↑',
          description:
            'Theo cha mẹ ra đồng cắt cỏ, chăn trâu, mót lúa để đỡ đần miếng cơm manh áo cho cả nhà.',
          monthlyEffects: { health: 0.08, relationships: 0.14, family_copper: 15 },
        };
      case 'ren_vo':
        return {
          ...opt,
          label: 'Chạy nhảy · Lội đồng',
          effectHint: 'Sức khỏe↑ · Võ nghệ↗',
          description:
            'Bơi sông, leo cây, chạy nhảy khắp triền đê giúp thân thể dẻo dai dù không có thầy dạy võ.',
          monthlyEffects: { health: 0.22, martial: 0.14 },
        };
      case 'so_thich':
        return {
          ...opt,
          label: 'Khéo tay · Đan lát',
          effectHint: 'Hạnh phúc↑ · Khéo tay↑',
          description: 'Thắt cào cào lá dừa, đẽo con quay gỗ hoặc tập đan rổ rá dưới gốc đa đầu làng.',
          monthlyEffects: { happiness: 0.16, craft_trade: 0.18 },
        };
      default:
        return opt;
    }
  });
}

function inferOutcomeTone(effects: EffectSpec): LogEntry['tone'] {
  if (effects.kill_reason) return 'negative';
  const score =
    (effects.health ?? 0) +
    (effects.happiness ?? 0) +
    (effects.education ?? 0) +
    (effects.relationships ?? 0) +
    (effects.martial ?? 0) +
    (effects.fame ?? 0) +
    (effects.copper ?? 0) * 0.02 +
    (effects.family_copper ?? 0) * 0.02;
  if (score >= 2) return 'positive';
  if (score <= -2) return 'negative';
  return 'neutral';
}

export interface StepYearResult {
  state: ActiveLifeState;
  pendingEvent: GameEventDef | null;
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

export function resolveEventChoice(
  inputState: ActiveLifeState,
  event: GameEventDef,
  choiceIndex: number,
): { state: ActiveLifeState; resultText: string } {
  const choice = event.choices[choiceIndex] ?? event.choices[0];
  if (!choice || choice.outcomes.length === 0) {
    return { state: inputState, resultText: '' };
  }

  let prng = inputState.prngState;
  const weights = choice.outcomes.map((o) => computeWeight(inputState, o.weight));
  const pick = pickWeightedIndex(prng, weights);
  prng = pick.nextState;

  const outcome = choice.outcomes[pick.index];
  let nextState: ActiveLifeState = {
    ...inputState,
    prngState: prng,
    eventCooldowns: {
      ...inputState.eventCooldowns,
      [event.id]: inputState.profile.totalDays,
    },
  };

  nextState = applyEffects(nextState, outcome.effects);
  const tone = inferOutcomeTone(outcome.effects);
  nextState = {
    ...nextState,
    logs: appendLog(
      nextState.logs,
      nextState.profile.totalDays,
      'event',
      `[${event.title}] ${outcome.resultText}`,
      { tone },
    ),
  };

  return { state: nextState, resultText: outcome.resultText };
}

function findEligibleMilestoneEvent(
  state: ActiveLifeState,
  eventsPool: GameEventDef[],
  stage: 'infancy' | 'childhood',
): GameEventDef | undefined {
  return eventsPool.find((evt) => {
    if (!evt.isMilestone) return false;
    if (evt.stage !== stage && evt.stage !== 'any') return false;
    if (evt.oncePerLife && state.eventCooldowns[evt.id] !== undefined) return false;
    const lastDay = state.eventCooldowns[evt.id] ?? -99999;
    if (state.profile.totalDays - lastDay < evt.cooldownDays) return false;
    return evaluateConditions(state, evt.conditions);
  });
}

const DEFAULT_AMBIENT_DATA: ChildhoodAmbientData = {
  infancyMilestones: [
    { day: 240, text: 'Bạn đã biết lẫy và ê a gọi tên cha mẹ.', tone: 'positive' },
    { day: 420, text: 'Bạn chập chững những bước đi đầu tiên. Cả nhà vỗ tay reo mừng.', tone: 'milestone' },
    { day: 600, text: 'Bạn nói được từ đầu tiên rõ ràng, đôi mắt sáng long lanh.', tone: 'positive' },
    { day: 900, text: 'Chỉ một nắm đất, vài hòn sỏi cũng đủ để bạn chơi đùa suốt buổi.', tone: 'neutral' },
    { day: 1200, text: 'Tối nào trước khi ngủ, mẹ cũng kể chuyện cổ tích cho bạn nghe.', tone: 'positive' },
    { day: 1560, text: 'Bạn bắt đầu tò mò với thế giới bên ngoài, hay chạy quanh sân hỏi đủ chuyện.', tone: 'neutral' },
    { day: 1890, text: 'Người lớn trong xóm khen bạn lanh lợi, ngoan ngoãn.', tone: 'positive' },
  ],
  focusAmbientLogs: [
    { focusId: 'hoc_tap', text: 'Bạn mượn sách cũ ngồi đọc dưới hiên nhà, thuộc thêm nhiều mặt chữ.' },
    { focusId: 'hoc_tap', text: 'Buổi tối bên ánh đèn dầu, bạn chăm chỉ luyện viết từng nét chữ ngay ngắn.' },
    { focusId: 'ban_be', text: 'Bạn cùng đám trẻ trong xóm thả diều, chơi ô ăn quan rộn rã cả buổi chiều.' },
    { focusId: 'ban_be', text: 'Lũ bạn đồng niên kéo nhau ra bờ đê hóng gió và chia nhau trái ổi vườn nhà.' },
    { focusId: 'giup_nha', text: 'Bạn phụ cha mẹ thu dọn đồ đạc, quét sân và làm những việc vừa sức.' },
    { focusId: 'giup_nha', text: 'Thấy bạn chăm chỉ đỡ đần việc nhà, cha mẹ mỉm cười đầy tự hào.' },
    { focusId: 'ren_vo', text: 'Sáng sớm bạn ra sân hít thở khí trời, tập vài đường quyền cơ bản cho dẻo dai.' },
    { focusId: 'ren_vo', text: 'Bạn chạy quanh bờ ao rèn sức bền, mồ hôi ướt đẫm nhưng tinh thần rất sảng khoái.' },
    { focusId: 'so_thich', text: 'Bạn say sưa với thú vui riêng, quên cả thời gian trôi qua.' },
    { focusId: 'so_thich', text: 'Những giờ phút thư thái giúp tâm hồn bạn thêm nhẹ nhàng và sáng tạo.' },
  ],
};

/**
 * Estimates monthly family income, living expenses, and net copper change during childhood.
 */
export function computeFamilyMonthlyNetCopper(state: ActiveLifeState): {
  income: number;
  expense: number;
  net: number;
} {
  const origin = state.profile.originClass;
  const baseIncomeByOrigin: Record<ActiveLifeState['profile']['originClass'], number> = {
    ban_nong: 22,
    thu_cong: 65,
    dia_chu: 260,
    quan_lai: 520,
    hoang_toc: 1400,
  };
  const perMouthCostByOrigin: Record<ActiveLifeState['profile']['originClass'], number> = {
    ban_nong: 4,
    thu_cong: 11,
    dia_chu: 42,
    quan_lai: 85,
    hoang_toc: 220,
  };

  let income = baseIncomeByOrigin[origin];
  const fatherAlive = state.npcs.some((n) => n.id === 'npc_father' && n.isAlive);
  const motherAlive = state.npcs.some((n) => n.id === 'npc_mother' && n.isAlive);

  if (!fatherAlive || state.flags.includes('mo_coi_cha')) {
    income *= 0.55;
  }
  if (!motherAlive) {
    income *= 0.75;
  }
  if (state.flags.includes('gia_toc_sa_sut') || state.flags.includes('that_sung_cung_dinh')) {
    income *= 0.45;
  }

  const livingFamilyMembers = state.npcs.filter(
    (n) =>
      n.isAlive &&
      (n.relation === 'parent' || n.relation === 'sibling') &&
      !(origin === 'hoang_toc' && (n.id.startsWith('npc_concubine_') || n.id === 'npc_grandmother')),
  ).length;
  const mouthsToFeed = 1 + livingFamilyMembers;
  let expense = mouthsToFeed * perMouthCostByOrigin[origin];

  if (state.flags.includes('that_sung_cung_dinh')) {
    expense *= 0.5;
  }

  if (state.flags.includes('gia_dinh_mac_no')) {
    expense += origin === 'ban_nong' || origin === 'thu_cong' ? 8 : 30;
  }

  const worldState = state.world.worldState;
  if (worldState === 'mat_mua') {
    if (origin === 'ban_nong') income *= 0.75;
    expense *= 1.25;
  } else if (worldState === 'dich_benh') {
    income *= 0.85;
    expense *= 1.2;
  } else if (worldState === 'chien_tranh') {
    income *= 0.75;
    expense *= 1.3;
  }

  const roundedIncome = Math.round(income);
  const roundedExpense = Math.round(expense);
  return {
    income: roundedIncome,
    expense: roundedExpense,
    net: roundedIncome - roundedExpense,
  };
}

/**
 * Advances 1 month (30 days) during Infancy (0-5) or Childhood (6-12).
 * Updates stats every month and triggers milestone/conditional events organically.
 */
export function advanceChildhoodMonth(
  inputState: ActiveLifeState,
  eventsPool: GameEventDef[],
  ambientData: ChildhoodAmbientData = DEFAULT_AMBIENT_DATA,
): StepYearResult {
  if (!inputState.isAlive) {
    return { state: inputState, pendingEvent: null };
  }

  const prevAge = getAgeYears(inputState.profile.totalDays);
  const nextTotalDays = inputState.profile.totalDays + DAYS_PER_MONTH;
  const newAge = getAgeYears(nextTotalDays);
  const isBirthday = nextTotalDays % DAYS_PER_YEAR === 0;

  let state: ActiveLifeState = {
    ...inputState,
    profile: {
      ...inputState.profile,
      totalDays: nextTotalDays,
    },
    world: {
      ...inputState.world,
      yearInEra: isBirthday ? inputState.world.yearInEra + 1 : inputState.world.yearInEra,
      season: getSeasonFromDays(nextTotalDays),
    },
  };

  // Monthly family economy (income vs mouths to feed & debt interest)
  if (state.family) {
    const familyCashflow = computeFamilyMonthlyNetCopper(state);
    if (familyCashflow.net !== 0) {
      state = applyEffects(state, { family_copper: familyCashflow.net });
    }
  }

  // Monthly stat progression (balanced with family tier & gentle equilibrium)
  const tier = state.family?.familyLivingTier ?? 'du_an';
  const familyWealth = state.family?.familyWealthCopper ?? state.assets.wealthCopper;
  const happyBaseline =
    tier === 'tung_thieu' ? 56 : tier === 'du_an' ? 63 : tier === 'kha_gia' ? 69 : tier === 'sung_tuc' ? 73 : 70;

  if (prevAge >= 6) {
    const focusId =
      state.schedule.childhoodFocus || ORIGIN_CORE_CONFIG[state.profile.originClass].defaultChildhoodFocus;
    const focusOptions = getChildhoodFocusOptions(state);
    const focusOpt =
      focusOptions.find((f) => f.id === focusId) ?? focusOptions[2];
    state = applyEffects(state, focusOpt.monthlyEffects);
    if (isBirthday && focusOpt.interestOnBirthday) {
      state = applyEffects(state, { add_interests: [focusOpt.interestOnBirthday] });
    }
  } else {
    const healthGain =
      tier === 'tung_thieu'
        ? familyWealth < 40
          ? -0.06
          : 0.03
        : tier === 'du_an'
          ? 0.06
          : tier === 'kha_gia'
            ? 0.09
            : 0.11;
    const happyDrift =
      state.stats.happiness < happyBaseline ? 0.08 : state.stats.happiness > happyBaseline + 12 ? -0.1 : 0.02;
    state = applyEffects(state, {
      health: healthGain,
      happiness: happyDrift,
      relationships: 0.04,
    });
  }

  // Poverty & living-tier health/sickness simulation
  if (prevAge >= 6 && tier === 'tung_thieu' && familyWealth < 40) {
    state = applyEffects(state, { health: -0.06 });
  }
  const sickChance =
    (tier === 'tung_thieu' ? 0.045 : tier === 'du_an' ? 0.022 : 0.01) +
    (state.stats.health < 55 ? 0.025 : 0);
  const sickRoll = mulberry32Next(state.prngState);
  state = { ...state, prngState: sickRoll.nextState };
  if (sickRoll.value < sickChance) {
    const canAffordMedicine = familyWealth >= 45;
    if (canAffordMedicine) {
      state = applyEffects(state, { family_copper: -25, health: -1.5, happiness: -1 });
      const sickMsg =
        state.profile.originClass === 'hoang_toc'
          ? 'Trở trời bạn bị cảm sốt, trong cung vội mời thái y bắt mạch kê phương thuốc bổ cho uống nên mau khỏi.'
          : 'Trở trời bạn bị cảm sốt, cha mẹ vội trích tiền cắt thuốc bắc cho uống nên mau khỏi.';
      state = {
        ...state,
        logs: appendLog(
          state.logs,
          nextTotalDays,
          'childhood',
          sickMsg,
          { tone: 'neutral' },
        ),
      };
    } else {
      state = applyEffects(state, { health: -5, happiness: -3 });
      state = {
        ...state,
        logs: appendLog(
          state.logs,
          nextTotalDays,
          'warning',
          'Bạn lên cơn sốt nhưng nhà túng thiếu không có tiền mua thuốc, chỉ đành uống nước lá cầm cự khiến người gầy rộc.',
          { tone: 'negative' },
        ),
      };
    }
  }
  if (state.stats.health < 40 && !state.flags.includes('the_chat_yeu')) {
    state = applyEffects(state, { add_flags: ['the_chat_yeu'] });
  }

  // Gentle mean reversion at extremes so stats don't stay pinned at 100%
  if (state.stats.happiness > 84) {
    state = applyEffects(state, { happiness: -0.15 });
  }
  if (state.stats.relationships > 86) {
    state = applyEffects(state, { relationships: -0.1 });
  }

  if (isBirthday) {
    state = applyAnnualStatMeanReversion(state, newAge);
    state = {
      ...state,
      yearlyHappiness: {
        ...(state.yearlyHappiness ?? {}),
        [newAge]: Math.round(state.stats.happiness),
      },
    };
  }

  // Age 13 transition: Teenager independence milestone & starting capital split
  if (isBirthday && newAge === 13) {
    state = applyTeenTransition(state);
    return { state, pendingEvent: null };
  }

  const stage = newAge <= 5 ? 'infancy' : 'childhood';

  // Check data-driven milestone events (e.g. Lễ Thôi Nôi at age 1, etc.)
  const milestoneEvent = findEligibleMilestoneEvent(state, eventsPool, stage);
  if (milestoneEvent) {
    state = {
      ...state,
      lastMajorEventDay: milestoneEvent.severity === 'major' ? state.profile.totalDays : state.lastMajorEventDay,
      eventCooldowns: {
        ...state.eventCooldowns,
        [milestoneEvent.id]: state.profile.totalDays,
      },
    };
    return { state, pendingEvent: milestoneEvent };
  }

  // Roll eligible events: 45% on birthday OR ~10% each other month, with 180-day gap between non-milestone major events
  const rollEventGate = mulberry32Next(state.prngState);
  state = { ...state, prngState: rollEventGate.nextState };
  const shouldRollEvent =
    (isBirthday && rollEventGate.value < 0.45) || (!isBirthday && rollEventGate.value < 0.1);
  const canRollMajor = state.profile.totalDays - (state.lastMajorEventDay ?? -9999) >= 180;

  let eventTriggered = false;
  if (shouldRollEvent) {
    const eligible = eventsPool.filter((evt) => {
      if (evt.isMilestone) return false;
      if (evt.stage !== stage && evt.stage !== 'any') return false;
      if (evt.oncePerLife && state.eventCooldowns[evt.id] !== undefined) return false;
      if (evt.severity === 'major' && !canRollMajor) return false;
      const lastDay = state.eventCooldowns[evt.id] ?? -99999;
      if (state.profile.totalDays - lastDay < evt.cooldownDays) return false;
      return evaluateConditions(state, evt.conditions);
    });

    if (eligible.length > 0) {
      const weights = eligible.map((e) => computeWeight(state, e.weight));
      const totalWeight = weights.reduce((s, w) => s + w, 0);
      if (totalWeight > 0) {
        const pick = pickWeightedIndex(state.prngState, weights);
        state = { ...state, prngState: pick.nextState };
        const pickedEvent = eligible[pick.index];

        state = {
          ...state,
          eventCooldowns: {
            ...state.eventCooldowns,
            [pickedEvent.id]: state.profile.totalDays,
          },
        };

        if (pickedEvent.severity === 'major') {
          state = { ...state, lastMajorEventDay: state.profile.totalDays };
          return { state, pendingEvent: pickedEvent };
        }

        const resolved = resolveEventChoice(state, pickedEvent, 0);
        state = resolved.state;
        eventTriggered = true;
      }
    }
  }

  // Ambient / Milestone timeline entries when no event fired this month
  if (!eventTriggered) {
    const infancyNote = ambientData.infancyMilestones.find(
      (m) =>
        m.day === nextTotalDays &&
        (!m.conditions || evaluateConditions(state, m.conditions)),
    );
    if (infancyNote) {
      state = {
        ...state,
        logs: appendLog(state.logs, nextTotalDays, 'childhood', infancyNote.text, {
          tone: infancyNote.tone,
        }),
      };
    } else if (isBirthday) {
      const parents = state.npcs.filter((n) => n.relation === 'parent' && n.isAlive);
      const parentSubNote =
        parents.length > 0
          ? parents
              .map((p) => `${p.role}: ${p.age !== undefined ? `${p.age + newAge} tuổi` : ''}`)
              .join(' • ')
          : undefined;
      const birthdayText =
        newAge === 6
          ? 'Bạn tròn 6 tuổi! Đã đến lúc chọn trọng tâm đầu đời cho bản thân.'
          : `Bạn đón sinh nhật lần thứ ${newAge}.`;
      state = {
        ...state,
        logs: appendLog(state.logs, nextTotalDays, 'childhood', birthdayText, {
          tone: newAge === 6 ? 'milestone' : 'positive',
          subNote: parentSubNote,
        }),
      };
    } else if (prevAge >= 6) {
      const ambientRoll = mulberry32Next(state.prngState);
      state = { ...state, prngState: ambientRoll.nextState };
      if (ambientRoll.value < 0.2) {
        const focusId = state.schedule.childhoodFocus || 'giup_nha';
        const pool = ambientData.focusAmbientLogs.filter(
          (l) =>
            l.focusId === focusId &&
            (!l.conditions || evaluateConditions(state, l.conditions)),
        );
        if (pool.length > 0) {
          const idx = Math.floor((ambientRoll.value / 0.2) * pool.length) % pool.length;
          state = {
            ...state,
            logs: appendLog(state.logs, nextTotalDays, 'childhood', pool[idx].text, {
              tone: 'neutral',
            }),
          };
        }
      }
    }
  }

  return { state, pendingEvent: null };
}

function applyTeenTransition(inputState: ActiveLifeState): ActiveLifeState {
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

  const familyGrantCopper = Math.max(15, Math.round(familyWealth * keepRatio));
  const personalCopper = inputState.assets.wealthCopper + familyGrantCopper;
  const baseRiceByOrigin: Record<ActiveLifeState['profile']['originClass'], number> = {
    ban_nong: 12,
    thu_cong: 18,
    dia_chu: 35,
    quan_lai: 60,
    hoang_toc: 150,
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

  const starterFallbackRules =
    inputState.schedule.fallbackRules.length > 0
      ? inputState.schedule.fallbackRules
      : [
          {
            id: 'fb_auto_mot_lua',
            stat: 'rice' as const,
            operator: '<=' as const,
            threshold: 0,
            targetSlot: 'morning' as const,
            fallbackActionId: 'act_survival_mot_lua',
          },
        ];

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
    schedule: {
      ...inputState.schedule,
      morning: starterMorning,
      afternoon: starterAfternoon,
      evening: starterEvening,
      fallbackRules: starterFallbackRules,
    },
  };

  const wasIndentured = inputState.flags.includes('tung_o_do');
  const continueServitude =
    wasIndentured &&
    (inputState.family?.familyLivingTier === 'tung_thieu' ||
      inputState.flags.includes('gia_dinh_mac_no'));

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

  const teenLogByOrigin: Record<ActiveLifeState['profile']['originClass'], string> = {
    ban_nong: `Tuổi 13 thành đinh! Cha mẹ chắt chiu chia cho ${familyGrantCopper} đồng tiền vốn và ${personalRice} đấu gạo làm hành trang tự lập.`,
    thu_cong: `Tuổi 13 học nghề lập nghiệp! Gia đình trích ${familyGrantCopper} đồng vốn liếng cùng ${personalRice} đấu gạo để bạn tự xoay xở.`,
    dia_chu: `Tuổi 13 nối dõi cơ nghiệp! Gia đình cấp ${familyGrantCopper} đồng tiền tiêu và ${personalRice} đấu gạo làm vốn lập thân.`,
    quan_lai: isDeclined
      ? `Tuổi 13 giữa lúc gia đạo sa sút, nhà chỉ còn gom được ${familyGrantCopper} đồng và ${personalRice} đấu gạo cho bạn tự lập.`
      : `Tuổi 13 trưởng thành trong phủ quan! Gia đình cấp ${familyGrantCopper} đồng bạc cùng ${personalRice} đấu gạo để bạn dùi mài công danh.`,
    hoang_toc: isDeclined
      ? `Tuổi 13 nơi cung hẻo lánh, bạn chỉ nhận được ${familyGrantCopper} đồng bổng lộc ít ỏi cùng ${personalRice} đấu gạo để tự xoay xở.`
      : `Tuổi 13 vào Thượng Thư Phòng theo học lễ nghi và kinh sử! Triều đình cấp ${familyGrantCopper} đồng tiền tiêu cùng ${personalRice} đấu gạo theo lệ ${gender === 'male' ? 'Hoàng tử' : 'Công chúa'}.`,
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
