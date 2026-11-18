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
import { appendLog, applyEffects } from './effectApplier';
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

  const stage = newAge <= 5 ? 'infancy' : 'childhood';

  // Check data-driven milestone events (e.g. Lễ Thôi Nôi at age 1, etc.)
  const milestoneEvent = findEligibleMilestoneEvent(state, eventsPool, stage);
  if (milestoneEvent) {
    state = {
      ...state,
      eventCooldowns: {
        ...state.eventCooldowns,
        [milestoneEvent.id]: state.profile.totalDays,
      },
    };
    return { state, pendingEvent: milestoneEvent };
  }

  // Roll eligible events for current age (excluding deterministic milestones)
  const eligible = eventsPool.filter((evt) => {
    if (evt.isMilestone) return false;
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

  // Monthly stat progression (balanced with family tier & gentle equilibrium)
  const tier = state.family?.familyLivingTier ?? 'du_an';
  const happyBaseline =
    tier === 'tung_thieu' ? 56 : tier === 'du_an' ? 63 : tier === 'kha_gia' ? 69 : tier === 'sung_tuc' ? 73 : 70;

  if (prevAge >= 6) {
    const focusId =
      state.schedule.childhoodFocus || ORIGIN_CORE_CONFIG[state.profile.originClass].defaultChildhoodFocus;
    const focusOpt =
      CHILDHOOD_FOCUS_OPTIONS.find((f) => f.id === focusId) ?? CHILDHOOD_FOCUS_OPTIONS[2];
    state = applyEffects(state, focusOpt.monthlyEffects);
    if (isBirthday && focusOpt.interestOnBirthday) {
      state = applyEffects(state, { add_interests: [focusOpt.interestOnBirthday] });
    }
  } else {
    const healthGain = tier === 'tung_thieu' ? 0.02 : tier === 'du_an' ? 0.04 : 0.06;
    const happyDrift =
      state.stats.happiness < happyBaseline ? 0.08 : state.stats.happiness > happyBaseline + 12 ? -0.1 : 0.02;
    state = applyEffects(state, {
      health: healthGain,
      happiness: happyDrift,
      relationships: 0.04,
    });
  }

  // Gentle mean reversion at extremes so stats don't stay pinned at 100%
  if (state.stats.happiness > 84) {
    state = applyEffects(state, { happiness: -0.15 });
  }
  if (state.stats.relationships > 86) {
    state = applyEffects(state, { relationships: -0.1 });
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

  const stage = newAge <= 5 ? 'infancy' : 'childhood';

  // Check data-driven milestone events (e.g. Lễ Thôi Nôi at age 1, etc.)
  const milestoneEvent = findEligibleMilestoneEvent(state, eventsPool, stage);
  if (milestoneEvent) {
    state = {
      ...state,
      eventCooldowns: {
        ...state.eventCooldowns,
        [milestoneEvent.id]: state.profile.totalDays,
      },
    };
    return { state, pendingEvent: milestoneEvent };
  }

  // Roll eligible events on birthday OR ~22% chance each month
  const rollEventGate = mulberry32Next(state.prngState);
  state = { ...state, prngState: rollEventGate.nextState };
  const shouldRollEvent = isBirthday || rollEventGate.value < 0.22;

  let eventTriggered = false;
  if (shouldRollEvent) {
    const eligible = eventsPool.filter((evt) => {
      if (evt.isMilestone) return false;
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

  state = applyEffects(state, {
    add_flags: ['da_truong_thanh_13'],
    milestone_title: 'Bước vào tuổi 13 tự lập',
  });

  const teenLogByOrigin: Record<ActiveLifeState['profile']['originClass'], string> = {
    ban_nong: `Tuổi 13 thành đinh! Cha mẹ chắt chiu chia cho ${familyGrantCopper} đồng tiền vốn và ${personalRice} đấu gạo làm hành trang tự lập.`,
    thu_cong: `Tuổi 13 học nghề lập nghiệp! Gia đình trích ${familyGrantCopper} đồng vốn liếng cùng ${personalRice} đấu gạo để bạn tự xoay xở.`,
    dia_chu: `Tuổi 13 nối dõi cơ nghiệp! Gia đình cấp ${familyGrantCopper} đồng tiền tiêu và ${personalRice} đấu gạo làm vốn lập thân.`,
    quan_lai: isDeclined
      ? `Tuổi 13 giữa lúc gia đạo sa sút, nhà chỉ còn gom được ${familyGrantCopper} đồng và ${personalRice} đấu gạo cho bạn tự lập.`
      : `Tuổi 13 trưởng thành trong phủ quan! Gia đình cấp ${familyGrantCopper} đồng bạc cùng ${personalRice} đấu gạo để bạn dùi mài công danh.`,
    hoang_toc: isDeclined
      ? `Tuổi 13 nơi lãnh cung thất thế, bạn chỉ nhận được ${familyGrantCopper} đồng và ${personalRice} đấu gạo ít ỏi để tự mưu sinh.`
      : `Tuổi 13 khai phủ Tôn thất! Triều đình ban ${familyGrantCopper} đồng bổng lộc cùng ${personalRice} đấu gạo theo lệ Hoàng gia.`,
  };

  state = {
    ...state,
    logs: appendLog(
      state.logs,
      state.profile.totalDays,
      'childhood',
      teenLogByOrigin[originClass],
    ),
  };

  return state;
}
