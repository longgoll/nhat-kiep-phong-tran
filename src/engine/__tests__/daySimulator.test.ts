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
    };

    life = applyEffects(life, {
      copper: 500,
      rice: 5,
      add_flags: ['dang_no_dia_chu'],
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
});
