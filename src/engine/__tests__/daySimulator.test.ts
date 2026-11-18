import { describe, expect, it } from 'vitest';
import { createNewLife } from '../lifeInitializer';
import { advanceDays } from '../daySimulator';
import {
  buyGoldReserve,
  executeInstantAdultAction,
  haveChild,
  marrySpouse,
  sellGoldReserve,
} from '../adultLifeActions';
import { applyEffects } from '../effectApplier';
import { ALL_ACTIONS as ACTIONS, ALL_ADULTHOOD_EVENTS as EVENTS } from '../../data/registry';

describe('Day Simulator (MVP 2)', () => {
  it('applies aging curve maxStamina and executes FallbackRules', () => {
    let life = createNewLife(101);
    life = {
      ...life,
      profile: { ...life.profile, totalDays: 15 * 360 },
      stats: { ...life.stats, stamina: 10, health: 80 },
      assets: { ...life.assets, rice: 50, wealthCopper: 1000 },
      schedule: {
        ...life.schedule,
        morning: 'act_lam_thue_nong_vu',
        afternoon: 'act_nghi_ngoi',
        evening: 'act_nghi_ngoi',
        night: 'act_ngu',
        fallbackRules: [
          {
            id: 'fb_test',
            stat: 'stamina',
            operator: '<',
            threshold: 25,
            targetSlot: 'morning',
            fallbackActionId: 'act_nghi_ngoi',
          },
        ],
      },
    };

    const res = advanceDays(life, 1, ACTIONS, EVENTS);
    expect(res.daysSimulated).toBe(1);
    expect(res.state.profile.totalDays).toBe(15 * 360 + 1);
    // Fallback switched morning to rest (+12 stamina) + lifestyle + sleep
    expect(res.state.stats.stamina).toBeGreaterThan(10);
  });

  it('triggers delayed debt collection event after 180 days', () => {
    let life = createNewLife(202);
    life = {
      ...life,
      profile: { ...life.profile, totalDays: 18 * 360 },
      assets: { ...life.assets, rice: 500, wealthCopper: 100 },
      livelihoodStatus: 'homemaker',
    };

    life = applyEffects(life, {
      copper: 500,
      rice: 5,
      add_flags: ['dang_no_dia_chu', 'dec_college_done'],
      schedule_delayed: [{ event_id: 'evt_debt_collection_01', delay_days: 180 }],
    });

    const debtOnlyEvents = EVENTS.filter((e) => e.id === 'evt_debt_collection_01');
    const res = advanceDays(life, 185, ACTIONS, debtOnlyEvents, {
      pauseOnBirthday: false,
      pauseOnLowHealth: false,
      pauseOnLowHappiness: false,
      pauseOnNoFood: false,
    });

    expect(res.pausedReason).toBe('major_event');
    expect(res.pendingEvent?.id).toBe('evt_debt_collection_01');
  });

  it('executes instant adult actions with cooldowns and levels hobbies on birthday when lifeFocus is so_thich', () => {
    let life = createNewLife(303);
    life = {
      ...life,
      profile: { ...life.profile, totalDays: 16 * 360 - 1 },
      assets: { ...life.assets, rice: 50, wealthCopper: 500 },
      interests: ['kinh_su'],
      schedule: { ...life.schedule, lifeFocus: 'so_thich' },
    };

    const act1 = executeInstantAdultAction(life, 'inst_hobby_practice');
    expect(act1.ok).toBe(true);
    expect(act1.state.hobbyLevels?.kinh_su).toBe(1);
    expect(act1.state.assets.wealthCopper).toBe(400);

    // Cooldown prevents immediate repeat
    const act2 = executeInstantAdultAction(act1.state, 'inst_hobby_practice');
    expect(act2.ok).toBe(false);

    // Advancing 1 day crosses birthday -> annual flavor + hobby Lv.2
    const sim = advanceDays(act1.state, 1, ACTIONS, [], {
      pauseOnBirthday: true,
      pauseOnLowHealth: false,
      pauseOnLowHappiness: false,
      pauseOnNoFood: false,
    });
    expect(sim.pausedReason).toBe('birthday');
    expect(sim.state.hobbyLevels?.kinh_su).toBe(2);
  });

  it('supports gold reserve, marriage, having a child, and annual auto-actions', () => {
    let life = createNewLife(404);
    life = {
      ...life,
      profile: { ...life.profile, totalDays: 20 * 360 - 1 },
      assets: { ...life.assets, rice: 50, wealthCopper: 2000 },
      autoActions: ['inst_see_physician'],
      schedule: { ...life.schedule, giftEtiquette: 'chu_dao' },
    };

    life = buyGoldReserve(life, 500);
    expect(life.assets.goldReserveCopper).toBe(500);
    expect(life.assets.wealthCopper).toBe(1500);

    life = sellGoldReserve(life, 500);
    expect(life.assets.goldReserveCopper).toBe(0);
    expect(life.assets.wealthCopper).toBe(1500 + 490);

    life = marrySpouse(life);
    expect(life.npcs.some((n) => n.relation === 'spouse')).toBe(true);

    life = haveChild(life);
    expect(life.npcs.some((n) => n.relation === 'child')).toBe(true);

    // Crossing birthday runs giftEtiquette (-100) + autoAction inst_see_physician (-150)
    const sim = advanceDays(life, 1, ACTIONS, [], {
      pauseOnBirthday: true,
      pauseOnLowHealth: false,
      pauseOnLowHappiness: false,
      pauseOnNoFood: false,
    });
    expect(sim.pausedReason).toBe('birthday');
    expect(sim.state.actionCooldowns?.inst_see_physician).toBe(20 * 360);
  });

  it('covers household meals and monthly allowance while living at home for wealthier origins', () => {
    let life = createNewLife(505);
    life = {
      ...life,
      profile: { ...life.profile, originClass: 'dia_chu', totalDays: 13 * 360 },
      family: {
        ...life.family!,
        familyWealthCopper: 10000,
      },
      npcs: life.npcs.map((n) => (n.relation === 'parent' ? { ...n, isAlive: true } : n)),
      flags: life.flags.filter((f) => f !== 'da_ra_o_rieng' && f !== 'gia_toc_sa_sut'),
      assets: { ...life.assets, rice: 10, wealthCopper: 500 },
      schedule: {
        ...life.schedule,
        lifestyle: 'thit_ca',
        morning: 'act_tu_hoc_chu',
        afternoon: 'act_nghi_ngoi',
        evening: 'act_nghi_ngoi',
        night: 'act_ngu',
      },
    };

    const res = advanceDays(life, 30, ACTIONS, [], {
      pauseOnBirthday: false,
      pauseOnLowHealth: false,
      pauseOnLowHappiness: false,
      pauseOnNoFood: true,
    });

    // Family covers thit_ca meals (rice & personal copper not drained) and grants monthly allowance
    expect(res.state.assets.rice).toBe(10);
    expect(res.state.finance?.currentYear.livingExpenseCopper).toBe(0);
    expect(res.state.assets.wealthCopper).toBeGreaterThan(500);
  });

  it('does not trap player in a 2-day no_food pause loop when foraging fallback runs', () => {
    let life = createNewLife(606);
    life = {
      ...life,
      profile: { ...life.profile, originClass: 'ban_nong', totalDays: 13 * 360 + 334 },
      assets: { ...life.assets, rice: 0, wealthCopper: 0 },
      schedule: {
        ...life.schedule,
        lifestyle: 'com_rau',
        morning: 'act_nghi_ngoi',
        afternoon: 'act_nghi_ngoi',
        evening: 'act_nghi_ngoi',
        night: 'act_ngu',
        fallbackRules: [
          {
            id: 'fb_auto_mot_lua',
            stat: 'rice',
            operator: '<=',
            threshold: 0,
            targetSlot: 'morning',
            fallbackActionId: 'act_survival_mot_lua',
          },
        ],
      },
    };

    const res = advanceDays(life, 30, ACTIONS, [], {
      pauseOnBirthday: false,
      pauseOnLowHealth: false,
      pauseOnLowHappiness: false,
      pauseOnNoFood: true,
    });

    expect(res.daysSimulated).toBe(30);
    expect(res.pausedReason).toBeUndefined();
  });

  it('enforces 25-day major event cooldown across separate advanceDays calls', () => {
    let life = createNewLife(707);
    life = {
      ...life,
      profile: { ...life.profile, totalDays: 20 * 360 },
      lastMajorEventDay: 20 * 360,
    };

    const majorEvt = {
      id: 'evt_test_major_pacing',
      stage: 'adulthood' as const,
      severity: 'major' as const,
      cooldownDays: 1,
      title: 'Test Major',
      description: 'Test',
      conditions: {},
      weight: { base: 100 },
      choices: [
        {
          label: 'OK',
          outcomes: [{ weight: { base: 100 }, resultText: 'Done', effects: {} }],
        },
      ],
    };

    // Advance 20 days: within 25-day cooldown, major event must NOT trigger
    const res = advanceDays(life, 20, ACTIONS, [majorEvt], {
      pauseOnBirthday: false,
      pauseOnLowHealth: false,
      pauseOnLowHappiness: false,
      pauseOnNoFood: false,
    });
    expect(res.pendingEvent).toBeUndefined();
    expect(res.daysSimulated).toBe(20);
  });

  it('preserves concurrent delayedEvents on the same triggerDay instead of dropping them', () => {
    let life = createNewLife(808);
    const startDay = 20 * 360;
    life = {
      ...life,
      profile: { ...life.profile, totalDays: startDay },
      delayedEvents: [
        { eventId: 'evt_delay_a', triggerDay: startDay + 1 },
        { eventId: 'evt_delay_b', triggerDay: startDay + 1 },
      ],
    };

    const evtA = {
      id: 'evt_delay_a',
      stage: 'adulthood' as const,
      severity: 'major' as const,
      cooldownDays: 0,
      title: 'Delay A',
      description: 'A',
      conditions: {},
      weight: { base: 100 },
      choices: [{ label: 'OK', outcomes: [{ weight: { base: 100 }, resultText: 'A', effects: {} }] }],
    };
    const evtB = {
      id: 'evt_delay_b',
      stage: 'adulthood' as const,
      severity: 'major' as const,
      cooldownDays: 0,
      title: 'Delay B',
      description: 'B',
      conditions: {},
      weight: { base: 100 },
      choices: [{ label: 'OK', outcomes: [{ weight: { base: 100 }, resultText: 'B', effects: {} }] }],
    };

    const res1 = advanceDays(life, 5, ACTIONS, [evtA, evtB], {
      pauseOnBirthday: false,
      pauseOnLowHealth: false,
      pauseOnLowHappiness: false,
      pauseOnNoFood: false,
    });
    expect(res1.pendingEvent?.id).toBe('evt_delay_a');
    expect(res1.state.delayedEvents.some((d) => d.eventId === 'evt_delay_b')).toBe(true);

    const res2 = advanceDays(res1.state, 5, ACTIONS, [evtA, evtB], {
      pauseOnBirthday: false,
      pauseOnLowHealth: false,
      pauseOnLowHappiness: false,
      pauseOnNoFood: false,
    });
    expect(res2.pendingEvent?.id).toBe('evt_delay_b');
    expect(res2.state.delayedEvents.length).toBe(0);
  });
});
