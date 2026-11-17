import {
  DAYS_PER_MONTH,
  DAYS_PER_YEAR,
  getAgeYears,
  getSeasonFromDays,
  type ActiveLifeState,
  type LogEntry,
} from '../types/activeLife';
import type { ChildhoodActivityDef, EffectSpec, GameEventDef } from '../types/dsl';
import { computeWeight, evaluateConditions } from './conditionEvaluator';
import { appendLog, applyEffects } from './effectApplier';
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
    monthlyEffects: { education: 0.45, happiness: 0.15 },
    interestOnBirthday: 'kinh_su',
  },
  {
    id: 'ban_be',
    label: 'Bạn bè · Vui chơi',
    effectHint: 'Quan hệ↑ · Hạnh phúc↑',
    description: 'Chạy nhảy khắp xóm làng, kết thân với bạn đồng niên và giữ tâm hồn vui vẻ.',
    monthlyEffects: { relationships: 0.45, happiness: 0.35 },
  },
  {
    id: 'giup_nha',
    label: 'Phụ giúp gia đình',
    effectHint: 'Gia sản↑ · Gắn kết↑',
    description: 'Phụ cha mẹ việc đồng áng, buôn bán hoặc giữ nếp nhà để gia đình thêm khấm khá.',
    monthlyEffects: { relationships: 0.25, craft_trade: 0.25, family_copper: 14 },
  },
  {
    id: 'ren_vo',
    label: 'Rèn võ · Thể chất',
    effectHint: 'Sức khỏe↑ · Võ nghệ↑',
    description: 'Chạy bộ, tập quyền cước và rèn gân cốt từ nhỏ để thân thể cường tráng.',
    monthlyEffects: { health: 0.35, martial: 0.45 },
    interestOnBirthday: 'vo_nghe',
  },
  {
    id: 'so_thich',
    label: 'Thú vui · Sở thích',
    effectHint: 'Hạnh phúc↑ · Khéo tay↑',
    description: 'Dành thời gian cho những thú vui tao nhã, thư họa, đan lát hoặc ngắm cảnh.',
    monthlyEffects: { happiness: 0.45, craft_trade: 0.25 },
  },
];

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

/**
 * Advances 1 year (360 days) during Infancy (0-5) or Childhood (6-12).
 */
export function advanceChildhoodYear(
  inputState: ActiveLifeState,
  eventsPool: GameEventDef[],
  chosenActivity?: ChildhoodActivityDef,
): StepYearResult {
  if (!inputState.isAlive) {
    return { state: inputState, pendingEvent: null };
  }

  let state: ActiveLifeState = {
    ...inputState,
    profile: {
      ...inputState.profile,
      totalDays: inputState.profile.totalDays + DAYS_PER_YEAR,
    },
    world: {
      ...inputState.world,
      yearInEra: inputState.world.yearInEra + 1,
      season: getSeasonFromDays(inputState.profile.totalDays + DAYS_PER_YEAR),
    },
    schedule: {
      ...inputState.schedule,
      childhoodFocus: chosenActivity ? chosenActivity.id : inputState.schedule.childhoodFocus,
    },
  };

  const newAge = getAgeYears(state.profile.totalDays);

  // Apply chosen childhood activity (ages 6-12)
  if (chosenActivity) {
    if (chosenActivity.costCopper > 0) {
      if (state.family) {
        state = applyEffects(state, { family_copper: -chosenActivity.costCopper });
      } else {
        state = applyEffects(state, { copper: -chosenActivity.costCopper });
      }
    }
    state = applyEffects(state, chosenActivity.effects);
    state = {
      ...state,
      logs: appendLog(
        state.logs,
        state.profile.totalDays,
        'childhood',
        `Tuổi ${newAge}: Bạn chọn "${chosenActivity.name}".`,
      ),
    };
  } else {
    state = {
      ...state,
      logs: appendLog(
        state.logs,
        state.profile.totalDays,
        'childhood',
        `Tuổi ${newAge}: Bạn lớn lên từng ngày trong vòng tay gia đình.`,
      ),
    };
  }

  // Age 13 transition: Teenager independence milestone & starting capital split
  if (newAge === 13) {
    state = applyTeenTransition(state);
    state = {
      ...state,
      yearlyHappiness: {
        ...(state.yearlyHappiness ?? {}),
        [newAge]: Math.round(state.stats.happiness),
      },
    };
    return { state, pendingEvent: null };
  }

  // Check fixed milestone event: Lễ Thôi Nôi at age 1
  if (newAge === 1) {
    const thoiNoi = eventsPool.find((e) => e.id === 'evt_milestone_thoi_noi');
    if (thoiNoi && evaluateConditions(state, thoiNoi.conditions)) {
      return { state, pendingEvent: thoiNoi };
    }
  }

  // Roll eligible events for current age
  const stage = newAge <= 5 ? 'infancy' : 'childhood';
  const eligible = eventsPool.filter((evt) => {
    if (evt.id === 'evt_milestone_thoi_noi') return false;
    if (evt.stage !== stage && evt.stage !== 'any') return false;
    if (evt.oncePerLife && state.eventCooldowns[evt.id] !== undefined) return false;
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
        return { state, pendingEvent: pickedEvent };
      }

      // Minor event: auto-resolve choice 0
      const resolved = resolveEventChoice(state, pickedEvent, 0);
      state = resolved.state;
    }
  }

  return {
    state: {
      ...state,
      yearlyHappiness: {
        ...(state.yearlyHappiness ?? {}),
        [newAge]: Math.round(state.stats.happiness),
      },
    },
    pendingEvent: null,
  };
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

const INFANCY_MILESTONE_LOGS: Record<number, { text: string; tone: LogEntry['tone'] }> = {
  240: { text: 'Bạn đã biết lẫy và ê a gọi tên cha mẹ.', tone: 'positive' },
  420: { text: 'Bạn chập chững những bước đi đầu tiên. Cả nhà vỗ tay reo mừng.', tone: 'milestone' },
  600: { text: 'Bạn nói được từ đầu tiên rõ ràng, đôi mắt sáng long lanh.', tone: 'positive' },
  900: { text: 'Chỉ một nắm đất, vài hòn sỏi cũng đủ để bạn chơi đùa suốt buổi.', tone: 'neutral' },
  1200: { text: 'Tối nào trước khi ngủ, mẹ cũng kể chuyện cổ tích cho bạn nghe.', tone: 'positive' },
  1560: { text: 'Bạn bắt đầu tò mò với thế giới bên ngoài, hay chạy quanh sân hỏi đủ chuyện.', tone: 'neutral' },
  1890: { text: 'Người lớn trong xóm khen bạn lanh lợi, ngoan ngoãn.', tone: 'positive' },
};

const FOCUS_AMBIENT_LOGS: Record<string, string[]> = {
  hoc_tap: [
    'Bạn mượn sách cũ ngồi đọc dưới hiên nhà, thuộc thêm nhiều mặt chữ.',
    'Buổi tối bên ánh đèn dầu, bạn chăm chỉ luyện viết từng nét chữ ngay ngắn.',
  ],
  ban_be: [
    'Bạn cùng đám trẻ trong xóm thả diều, chơi ô ăn quan rộn rã cả buổi chiều.',
    'Lũ bạn đồng niên kéo nhau ra bờ đê hóng gió và chia nhau trái ổi vườn nhà.',
  ],
  giup_nha: [
    'Bạn phụ cha mẹ thu dọn đồ đạc, quét sân và làm những việc vừa sức.',
    'Thấy bạn chăm chỉ đỡ đần việc nhà, cha mẹ mỉm cười đầy tự hào.',
  ],
  ren_vo: [
    'Sáng sớm bạn ra sân hít thở khí trời, tập vài đường quyền cơ bản cho dẻo dai.',
    'Bạn chạy quanh bờ ao rèn sức bền, mồ hôi ướt đẫm nhưng tinh thần rất sảng khoái.',
  ],
  so_thich: [
    'Bạn say sưa với thú vui riêng, quên cả thời gian trôi qua.',
    'Những giờ phút thư thái giúp tâm hồn bạn thêm nhẹ nhàng và sáng tạo.',
  ],
};

/**
 * Advances 1 month (30 days) during Infancy (0-5) or Childhood (6-12).
 * Updates stats every month and triggers milestone/conditional events organically.
 */
export function advanceChildhoodMonth(
  inputState: ActiveLifeState,
  eventsPool: GameEventDef[],
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

  // Monthly stat progression
  if (prevAge >= 6) {
    const focusId = state.schedule.childhoodFocus || 'giup_nha';
    const focusOpt =
      CHILDHOOD_FOCUS_OPTIONS.find((f) => f.id === focusId) ?? CHILDHOOD_FOCUS_OPTIONS[2];
    state = applyEffects(state, focusOpt.monthlyEffects);
    if (isBirthday && focusOpt.interestOnBirthday) {
      state = applyEffects(state, { add_interests: [focusOpt.interestOnBirthday] });
    }
  } else {
    state = applyEffects(state, { health: 0.12, happiness: 0.15, relationships: 0.1 });
  }

  if (isBirthday) {
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

  // Fixed milestone event: Lễ Thôi Nôi at age 1
  if (isBirthday && newAge === 1) {
    const thoiNoi = eventsPool.find((e) => e.id === 'evt_milestone_thoi_noi');
    if (thoiNoi && evaluateConditions(state, thoiNoi.conditions)) {
      return { state, pendingEvent: thoiNoi };
    }
  }

  // Roll eligible events on birthday OR ~22% chance each month
  const rollEventGate = mulberry32Next(state.prngState);
  state = { ...state, prngState: rollEventGate.nextState };
  const shouldRollEvent = isBirthday || rollEventGate.value < 0.22;

  let eventTriggered = false;
  if (shouldRollEvent) {
    const stage = newAge <= 5 ? 'infancy' : 'childhood';
    const eligible = eventsPool.filter((evt) => {
      if (evt.id === 'evt_milestone_thoi_noi') return false;
      if (evt.stage !== stage && evt.stage !== 'any') return false;
      if (evt.oncePerLife && state.eventCooldowns[evt.id] !== undefined) return false;
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
    const infancyNote = INFANCY_MILESTONE_LOGS[nextTotalDays];
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
        const pool = FOCUS_AMBIENT_LOGS[focusId] ?? FOCUS_AMBIENT_LOGS.giup_nha;
        const idx = Math.floor((ambientRoll.value / 0.2) * pool.length) % pool.length;
        state = {
          ...state,
          logs: appendLog(state.logs, nextTotalDays, 'childhood', pool[idx], {
            tone: 'neutral',
          }),
        };
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
  let starterMorning = inputState.schedule.morning;
  let starterAfternoon = inputState.schedule.afternoon;
  if (starterMorning === 'act_nghi_ngoi' && starterAfternoon === 'act_nghi_ngoi') {
    if (originClass === 'ban_nong') {
      starterMorning = 'act_lam_thue_nong_vu';
      starterAfternoon = 'act_lam_thue_nong_vu';
    } else if (originClass === 'thu_cong') {
      starterMorning = 'act_phu_ban_hang';
      starterAfternoon = 'act_phu_ban_hang';
    } else if (originClass === 'dia_chu') {
      starterMorning = 'act_buon_ban_nho';
      starterAfternoon = 'act_tu_hoc_chu';
    } else {
      starterMorning = 'act_tu_hoc_chu';
      starterAfternoon = 'act_luyen_vo_cong';
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
      fallbackRules: starterFallbackRules,
    },
  };

  state = applyEffects(state, {
    add_flags: ['da_truong_thanh_13'],
    milestone_title: 'Bước vào tuổi 13 tự lập',
  });

  state = {
    ...state,
    logs: appendLog(
      state.logs,
      state.profile.totalDays,
      'childhood',
      `Tuổi 13 thành đinh tự lập! Gia đình chia cho ${familyGrantCopper} đồng tiền vốn và ${personalRice} đấu gạo làm hành trang bước vào đời.`,
    ),
  };

  return state;
}
