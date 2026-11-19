import {
  DAYS_PER_MONTH,
  DAYS_PER_YEAR,
  getAgeYears,
  getSeasonFromDays,
  type ActiveLifeState,
  type LogEntry,
} from '../../types/activeLife';
import type {
  ChildhoodAmbientData,
  EffectSpec,
  GameEventDef,
} from '../../types/dsl';
import { computeWeight, evaluateConditions } from '../conditionEvaluator';
import { appendLog, applyAnnualStatMeanReversion, applyEffects } from '../effectApplier';
import {
  applyFinalInheritanceIfEligible,
  applyMoveOutInheritance,
  computeFamilyMonthlyNetCopper,
} from '../familyEconomy';
import { ORIGIN_CORE_CONFIG } from '../originConfigs';
import { triggerDingYouLeave, triggerKimCachTongNhung } from '../officialSystem';
import { mulberry32Next, pickWeightedIndex } from '../prng';
import { getChildhoodFocusOptions, getLivingParentTerm } from './focusOptions';
import { applyTeenTransition } from './teenTransition';

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

  const hadLivingParentBefore = inputState.npcs.some((n) => n.relation === 'parent' && n.isAlive);
  const hadMovedOutBefore = inputState.flags.includes('da_ra_o_rieng');

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

  if (!hadMovedOutBefore && nextState.flags.includes('da_ra_o_rieng') && choiceIndex === 0) {
    nextState = applyMoveOutInheritance(nextState);
  }
  const livingParentsBefore = inputState.npcs.filter((n) => n.relation === 'parent' && n.isAlive).length;
  const livingParentsAfter = nextState.npcs.filter((n) => n.relation === 'parent' && n.isAlive).length;
  if (hadLivingParentBefore && livingParentsAfter === 0) {
    nextState = applyFinalInheritanceIfEligible(nextState);
  }
  if (
    livingParentsAfter < livingParentsBefore &&
    nextState.officialRank > 0 &&
    nextState.official
  ) {
    if (nextState.official.track === 'van' && nextState.world.worldState !== 'chien_tranh') {
      nextState = triggerDingYouLeave(nextState);
    } else if (
      nextState.official.track === 'vo' &&
      (nextState.official.posting === 'bien_ai' || nextState.world.worldState === 'chien_tranh')
    ) {
      nextState = triggerKimCachTongNhung(nextState);
    }
  }

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
    { day: 240, text: 'Bạn đã biết lẫy và ê a gọi tên cha mẹ.', tone: 'positive', conditions: { missing_flags: ['mo_coi_cha', 'mo_coi_me'] } },
    { day: 240, text: 'Bạn đã biết lẫy và ê a tập gọi tiếng đầu đời.', tone: 'positive', conditions: { has_any_flag: ['mo_coi_cha', 'mo_coi_me'] } },
    { day: 420, text: 'Bạn chập chững những bước đi đầu tiên. Cả nhà vỗ tay reo mừng.', tone: 'milestone' },
    { day: 600, text: 'Bạn nói được từ đầu tiên rõ ràng, đôi mắt sáng long lanh.', tone: 'positive' },
    { day: 900, text: 'Chỉ một nắm đất, vài hòn sỏi cũng đủ để bạn chơi đùa suốt buổi.', tone: 'neutral' },
    { day: 1200, text: 'Tối nào trước khi ngủ, mẹ cũng kể chuyện cổ tích cho bạn nghe.', tone: 'positive', conditions: { missing_flags: ['mo_coi_me'] } },
    { day: 1560, text: 'Bạn bắt đầu tò mò với thế giới bên ngoài, hay chạy quanh sân hỏi đủ chuyện.', tone: 'neutral' },
    { day: 1890, text: 'Người lớn trong xóm khen bạn lanh lợi, ngoan ngoãn.', tone: 'positive' },
  ],
  focusAmbientLogs: [
    { focusId: 'hoc_tap', text: 'Bạn mượn sách cũ ngồi đọc dưới hiên nhà, thuộc thêm nhiều mặt chữ.' },
    { focusId: 'hoc_tap', text: 'Buổi tối bên ánh đèn dầu, bạn chăm chỉ luyện viết từng nét chữ ngay ngắn.' },
    { focusId: 'ban_be', text: 'Bạn cùng đám trẻ trong xóm thả diều, chơi ô ăn quan rộn rã cả buổi chiều.' },
    { focusId: 'ban_be', text: 'Lũ bạn đồng niên kéo nhau ra bờ đê hóng gió và chia nhau trái ổi vườn nhà.' },
    { focusId: 'giup_nha', text: 'Bạn phụ cha mẹ thu dọn đồ đạc, quét sân và làm những việc vừa sức.', conditions: { missing_flags: ['mo_coi_cha', 'mo_coi_me'] } },
    { focusId: 'giup_nha', text: 'Thấy bạn chăm chỉ đỡ đần việc nhà, cha mẹ mỉm cười đầy tự hào.', conditions: { missing_flags: ['mo_coi_cha', 'mo_coi_me'] } },
    { focusId: 'giup_nha', text: 'Bạn chăm chỉ thu dọn đồ đạc, quét sân và đỡ đần việc nhà vừa sức.' },
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
          : 0.015
        : tier === 'du_an'
          ? 0.03
          : tier === 'kha_gia'
            ? 0.04
            : 0.05;
    const happyDrift =
      state.stats.happiness < happyBaseline ? 0.05 : state.stats.happiness > happyBaseline + 12 ? -0.1 : 0.01;
    state = applyEffects(state, {
      health: healthGain,
      happiness: happyDrift,
      relationships: 0.015,
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
      const parentInfo = getLivingParentTerm(state);
      const sickMsg =
        state.profile.originClass === 'hoang_toc'
          ? 'Trở trời bạn bị cảm sốt, trong cung vội mời thái y bắt mạch kê phương thuốc bổ cho uống nên mau khỏi.'
          : parentInfo.hasAny
            ? `Trở trời bạn bị cảm sốt, ${parentInfo.term} vội trích tiền cắt thuốc bắc cho uống nên mau khỏi.`
            : 'Trở trời bạn bị cảm sốt, may còn chút tiền trong nhà cắt thuốc bắc uống nên mau khỏi.';
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
