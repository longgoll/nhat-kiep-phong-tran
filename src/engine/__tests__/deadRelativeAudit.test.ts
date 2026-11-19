import { describe, expect, it } from 'vitest';
import { createNewLife } from '../lifeInitializer';
import { advanceChildhoodMonth, getChildhoodFocusOptions, resolveEventChoice } from '../childhoodEngine';
import { advanceDays } from '../daySimulator';
import { applyEffects } from '../effectApplier';
import { INSTANT_ADULT_ACTIONS, getLifeFocusOptions, isInstantActionVisible } from '../adultLifeActions';
import { ALL_ACTIONS, ALL_EVENTS, CHILDHOOD_AMBIENT_DATA } from '../../data/registry';
import activitiesDongAu from '../../data/activities/dong_au.json';
import { evaluateConditions } from '../conditionEvaluator';
import { getAgeYears, type ActiveLifeState, type OriginClass, type Gender } from '../../types/activeLife';
import type { ChildhoodActivityDef } from '../../types/dsl';

const ORIGINS: OriginClass[] = ['ban_nong', 'thu_cong', 'dia_chu', 'quan_lai', 'hoang_toc'];

const MEMORIAL_OR_SELF_PARENT_REGEX =
  /(mất|qua đời|tạ thế|băng hà|vắng bóng|mồ côi|giỗ|mộ phần|phần mộ|di vật|di ảnh|tưởng nhớ|vong linh|năm xưa|khi còn|lúc sinh thời|nơi suối vàng|nơi chín suối|nhang khói|thờ cúng|tảo mộ|cùng con|con bạn|con cái|các con|trở thành cha mẹ|làm cha mẹ)/i;

function checkTextForDeadRelatives(
  text: string,
  fatherAlive: boolean,
  motherAlive: boolean,
  hasSpouse: boolean,
  isPlayerParent: boolean,
): string[] {
  const violations: string[] = [];
  if (!text) return violations;

  // Split by sentence-like boundaries so memorial sentences don't mask unrelated sentences
  const sentences = text.split(/(?<=[.!?])\s+|\n+/);
  for (const s of sentences) {
    const isMemorial = MEMORIAL_OR_SELF_PARENT_REGEX.test(s);
    if (isMemorial) continue;

    if ((!fatherAlive || !motherAlive) && /(cha mẹ|song thân)/i.test(s)) {
      // Allow if player themselves is a parent talking about their own children/role
      if (!isPlayerParent || !/(con|cháu|dạy dỗ)/i.test(s)) {
        violations.push(`Mentions "cha mẹ/song thân" when parent dead (F=${fatherAlive}, M=${motherAlive}): "${s}"`);
      }
    }

    if (!fatherAlive) {
      if (/(phụ thân|phụ hoàng|cha bạn|cha mình|cùng cha|theo cha|của cha|cho cha|với cha|nhờ cha|lời cha|cha dặn|cha gọi|bên cha|cha đang|cha vội|cha già|cha ốm|cha bệnh)/i.test(s)) {
        violations.push(`Mentions living father when father dead: "${s}"`);
      }
    }

    if (!motherAlive) {
      if (/(mẫu thân|mẫu phi|mẫu hậu|mẹ bạn|mẹ mình|cùng mẹ|theo mẹ|của mẹ|cho mẹ|với mẹ|nhờ mẹ|lời mẹ|mẹ dặn|mẹ gọi|bên mẹ|mẹ đang|mẹ vội|mẹ già|mẹ ốm|mẹ bệnh|mẹ kể|mẹ góa|mẹ đi chợ)/i.test(s)) {
        violations.push(`Mentions living mother when mother dead: "${s}"`);
      }
    }

    if (!hasSpouse) {
      if (/(vợ bạn|chồng bạn|hiền thê|phu quân|thê tử|nương tử|bạn đời)/i.test(s)) {
        violations.push(`Mentions living spouse when no spouse alive: "${s}"`);
      }
    }
  }
  return violations;
}

function runLifeAndAuditLogs(
  seed: number,
  origin: OriginClass,
  gender: Gender,
  setupMutator?: (s: ActiveLifeState) => ActiveLifeState,
  midLifeMutator?: (s: ActiveLifeState, age: number) => ActiveLifeState,
): string[] {
  const raw = createNewLife(seed);
  let state: ActiveLifeState = {
    ...raw,
    profile: {
      ...raw.profile,
      fullName: `Audit_${origin}_${seed}`,
      gender,
      originClass: origin,
    },
  };
  if (setupMutator) {
    state = setupMutator(state);
  }

  const violations: string[] = [];
  let checkedLogCount = state.logs.length;

  const inspectNewLogsAndEvent = (
    prevFatherAlive: boolean,
    prevMotherAlive: boolean,
    prevSpouseAlive: boolean,
    nextState: ActiveLifeState,
    eventTitle?: string,
    eventDesc?: string,
    choiceText?: string,
  ) => {
    const fatherAlive =
      nextState.npcs.some((n) => n.id === 'npc_father' && n.isAlive) &&
      !nextState.flags.includes('mo_coi_cha');
    const motherAlive =
      nextState.npcs.some((n) => n.id === 'npc_mother' && n.isAlive) &&
      !nextState.flags.includes('mo_coi_me');
    const hasSpouse = nextState.npcs.some((n) => n.relation === 'spouse' && n.isAlive);
    const isPlayerParent = nextState.flags.includes('da_co_con') || nextState.npcs.some((n) => n.relation === 'child');

    // Only audit if they were ALREADY dead before this step (so death events themselves don't trigger false positives)
    const checkF = prevFatherAlive ? true : fatherAlive;
    const checkM = prevMotherAlive ? true : motherAlive;
    const checkS = prevSpouseAlive ? true : hasSpouse;

    const newLogs = nextState.logs.slice(checkedLogCount);
    checkedLogCount = nextState.logs.length;

    for (const log of newLogs) {
      const errs = checkTextForDeadRelatives(log.text, checkF, checkM, checkS, isPlayerParent);
      for (const e of errs) {
        violations.push(`[${origin}/seed=${seed}/age=${getAgeYears(nextState.profile.totalDays)}] LOG: ${e}`);
      }
    }

    if (eventTitle || eventDesc || choiceText) {
      const combined = [eventTitle ?? '', eventDesc ?? '', choiceText ?? ''].join(' ');
      const errs = checkTextForDeadRelatives(combined, checkF, checkM, checkS, isPlayerParent);
      for (const e of errs) {
        violations.push(`[${origin}/seed=${seed}/age=${getAgeYears(nextState.profile.totalDays)}] EVENT: ${e}`);
      }
    }
  };

  // Childhood (0 -> 13)
  let guard = 0;
  while (state.isAlive && getAgeYears(state.profile.totalDays) < 13 && guard < 200) {
    guard++;
    const prevF = state.npcs.some((n) => n.id === 'npc_father' && n.isAlive) && !state.flags.includes('mo_coi_cha');
    const prevM = state.npcs.some((n) => n.id === 'npc_mother' && n.isAlive) && !state.flags.includes('mo_coi_me');
    const prevS = state.npcs.some((n) => n.relation === 'spouse' && n.isAlive);

    if (midLifeMutator) {
      state = midLifeMutator(state, getAgeYears(state.profile.totalDays));
    }

    const res = advanceChildhoodMonth(state, ALL_EVENTS, CHILDHOOD_AMBIENT_DATA);
    state = res.state;

    if (res.pendingEvent) {
      const evt = res.pendingEvent;
      const choiceIdx = 0;
      const resolved = resolveEventChoice(state, evt, choiceIdx);
      state = resolved.state;
      inspectNewLogsAndEvent(
        prevF,
        prevM,
        prevS,
        state,
        evt.title,
        evt.description,
        evt.choices[choiceIdx]?.label,
      );
    } else {
      inspectNewLogsAndEvent(prevF, prevM, prevS, state);
    }
  }

  // Adulthood (13 -> 65)
  let adultGuard = 0;
  while (state.isAlive && getAgeYears(state.profile.totalDays) < 65 && adultGuard < 400) {
    adultGuard++;
    const prevF = state.npcs.some((n) => n.id === 'npc_father' && n.isAlive) && !state.flags.includes('mo_coi_cha');
    const prevM = state.npcs.some((n) => n.id === 'npc_mother' && n.isAlive) && !state.flags.includes('mo_coi_me');
    const prevS = state.npcs.some((n) => n.relation === 'spouse' && n.isAlive);

    if (midLifeMutator) {
      state = midLifeMutator(state, getAgeYears(state.profile.totalDays));
    }

    const res = advanceDays(state, 360, ALL_ACTIONS, ALL_EVENTS, {
      pauseOnBirthday: false,
      pauseOnLowHealth: false,
      pauseOnLowHappiness: false,
      pauseOnNoFood: false,
    });
    state = res.state;

    if (res.pendingEvent) {
      const evt = res.pendingEvent;
      const choiceIdx = 0;
      const resolved = resolveEventChoice(state, evt, choiceIdx);
      state = resolved.state;
      inspectNewLogsAndEvent(
        prevF,
        prevM,
        prevS,
        state,
        evt.title,
        evt.description,
        evt.choices[choiceIdx]?.label,
      );
    } else {
      inspectNewLogsAndEvent(prevF, prevM, prevS, state);
    }
  }

  return violations;
}

describe('Dead Relative & Narrative Consistency Audit', () => {
  it('keeps mo_coi_cha / mo_coi_me flags in sync with kill_npc_id', () => {
    const base = createNewLife(101);
    const livingStart: ActiveLifeState = {
      ...base,
      flags: base.flags.filter((f) => f !== 'mo_coi_cha' && f !== 'mo_coi_me'),
      npcs: base.npcs.map((n) => (n.relation === 'parent' ? { ...n, isAlive: true } : n)),
    };

    const afterFatherKill = applyEffects(livingStart, { kill_npc_id: 'npc_father' });
    expect(afterFatherKill.npcs.find((n) => n.id === 'npc_father')?.isAlive).toBe(false);
    expect(afterFatherKill.flags).toContain('mo_coi_cha');

    const afterMotherKill = applyEffects(afterFatherKill, { kill_npc_id: 'npc_mother' });
    expect(afterMotherKill.npcs.find((n) => n.id === 'npc_mother')?.isAlive).toBe(false);
    expect(afterMotherKill.flags).toContain('mo_coi_me');
  });

  it('does not generate dead-parent text in childhood focus options or activities when orphaned', () => {
    const baseRaw = createNewLife(202);
    const base: ActiveLifeState = {
      ...baseRaw,
      profile: { ...baseRaw.profile, fullName: 'Orphan Child', gender: 'male', originClass: 'ban_nong' },
    };
    const fatherDead: ActiveLifeState = {
      ...base,
      profile: { ...base.profile, totalDays: 360 * 8 },
      flags: [...base.flags.filter((f) => f !== 'mo_coi_cha'), 'mo_coi_cha'],
      npcs: base.npcs.map((n) => (n.id === 'npc_father' ? { ...n, isAlive: false } : n)),
    };
    const bothDead: ActiveLifeState = {
      ...fatherDead,
      flags: [...fatherDead.flags, 'mo_coi_me'],
      npcs: fatherDead.npcs.map((n) => (n.id === 'npc_mother' ? { ...n, isAlive: false } : n)),
    };

    for (const st of [fatherDead, bothDead]) {
      const fAlive = st.npcs.some((n) => n.id === 'npc_father' && n.isAlive);
      const mAlive = st.npcs.some((n) => n.id === 'npc_mother' && n.isAlive);

      const focuses = getChildhoodFocusOptions(st);
      for (const f of focuses) {
        const errs = checkTextForDeadRelatives(`${f.label} ${f.description}`, fAlive, mAlive, false, false);
        expect(errs, `Focus ${f.id} failed for F=${fAlive}, M=${mAlive}`).toEqual([]);
      }

      const acts = (activitiesDongAu as ChildhoodActivityDef[]).filter((a) => evaluateConditions(st, a.conditions));
      for (const a of acts) {
        const errs = checkTextForDeadRelatives(`${a.name} ${a.description}`, fAlive, mAlive, false, false);
        expect(errs, `Activity ${a.id} failed for F=${fAlive}, M=${mAlive}`).toEqual([]);
      }
    }

    // Adult actions when both parents are dead
    const adultBothDead: ActiveLifeState = {
      ...bothDead,
      profile: { ...bothDead.profile, totalDays: 360 * 20 },
      flags: [...bothDead.flags, 'da_ra_o_rieng', 'gia_dinh_mac_no'],
    };
    const adultActions = INSTANT_ADULT_ACTIONS.filter((a) => isInstantActionVisible(adultBothDead, a));
    for (const act of adultActions) {
      const errs = checkTextForDeadRelatives(
        `${act.title} ${act.subtitle} ${act.logText}`,
        false,
        false,
        false,
        false,
      );
      expect(errs, `Adult action ${act.id} failed when both parents dead`).toEqual([]);
    }

    const lifeFocuses = getLifeFocusOptions(adultBothDead);
    for (const lf of lifeFocuses) {
      const errs = checkTextForDeadRelatives(`${lf.label} ${lf.description}`, false, false, false, false);
      expect(errs, `Life focus ${lf.id} failed when both parents dead`).toEqual([]);
    }
  });

  it('audits simulated lifetimes when father or both parents die for stale logs/events', () => {
    const allViolations: string[] = [];

    for (const origin of ORIGINS) {
      // Case 1: Father dead from birth (mo_coi_cha)
      for (let seed = 1; seed <= 3; seed++) {
        const v = runLifeAndAuditLogs(seed * 17, origin, seed % 2 === 0 ? 'female' : 'male', (s) => ({
          ...s,
          flags: s.flags.includes('mo_coi_cha') ? s.flags : [...s.flags, 'mo_coi_cha'],
          npcs: s.npcs.map((n) => (n.id === 'npc_father' ? { ...n, isAlive: false } : n)),
        }));
        allViolations.push(...v);
      }

      // Case 2: Mother dies at age 3, father dies at age 7
      const v2 = runLifeAndAuditLogs(
        999 + ORIGINS.indexOf(origin),
        origin,
        'male',
        (s) => ({
          ...s,
          flags: s.flags.filter((f) => f !== 'mo_coi_cha' && f !== 'mo_coi_me'),
          npcs: s.npcs.map((n) => (n.relation === 'parent' ? { ...n, isAlive: true } : n)),
        }),
        (s, age) => {
          let next = s;
          if (age === 3 && next.npcs.some((n) => n.id === 'npc_mother' && n.isAlive)) {
            next = applyEffects(next, { kill_npc_id: 'npc_mother' });
          }
          if (age === 7 && next.npcs.some((n) => n.id === 'npc_father' && n.isAlive)) {
            next = applyEffects(next, { kill_npc_id: 'npc_father' });
          }
          return next;
        },
      );
      allViolations.push(...v2);
    }

    if (allViolations.length > 0) {
      console.log('DEAD RELATIVE AUDIT VIOLATIONS:\n' + allViolations.slice(0, 40).join('\n'));
    }
    expect(allViolations).toEqual([]);
  }, 60000);
});
