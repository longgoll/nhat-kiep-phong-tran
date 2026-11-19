import { describe, expect, it } from 'vitest';
import { createNewLife } from '../lifeInitializer';
import { advanceChildhoodMonth, resolveEventChoice } from '../childhoodEngine';
import { advanceDays, getFamilyCoveredLifestyleTier } from '../daySimulator';
import { executeInstantAdultAction } from '../adultLifeActions';
import { applyDynamicDecisionSideEffects } from '../decisionGenerator';
import { planYear } from '../yearPlanner';
import { ALL_ACTIONS, ALL_EVENTS, CHILDHOOD_AMBIENT_DATA } from '../../data/registry';
import { getAgeYears, type ActiveLifeState, type OriginClass } from '../../types/activeLife';

const ORIGINS: OriginClass[] = ['ban_nong', 'thu_cong', 'dia_chu', 'quan_lai', 'hoang_toc'];
const FOCUSES = ['can_bang', 'cong_danh', 'gia_dinh', 'lam_them'] as const;

describe('Full Life Balance, Economy, Spend-Invest & Story Audit (100 Lives)', () => {
  it('audits 100 lifetimes across 5 origins x 4 focuses x 5 seeds for Health, Happiness, Relationships, Family Wealth & Spend/Invest', () => {
    const byOrigin: Record<
      OriginClass,
      {
        count: number;
        ages: number[];
        health: number[];
        happiness: number[];
        relationships: number[];
        copper: number[];
        familyCopper: number[];
        pinnedHappy100: number;
        pinnedRel100: number;
        totalSamples: number;
      }
    > = {
      ban_nong: { count: 0, ages: [], health: [], happiness: [], relationships: [], copper: [], familyCopper: [], pinnedHappy100: 0, pinnedRel100: 0, totalSamples: 0 },
      thu_cong: { count: 0, ages: [], health: [], happiness: [], relationships: [], copper: [], familyCopper: [], pinnedHappy100: 0, pinnedRel100: 0, totalSamples: 0 },
      dia_chu: { count: 0, ages: [], health: [], happiness: [], relationships: [], copper: [], familyCopper: [], pinnedHappy100: 0, pinnedRel100: 0, totalSamples: 0 },
      quan_lai: { count: 0, ages: [], health: [], happiness: [], relationships: [], copper: [], familyCopper: [], pinnedHappy100: 0, pinnedRel100: 0, totalSamples: 0 },
      hoang_toc: { count: 0, ages: [], health: [], happiness: [], relationships: [], copper: [], familyCopper: [], pinnedHappy100: 0, pinnedRel100: 0, totalSamples: 0 },
    };

    let askMoneyAttempts = 0;
    let askMoneySuccesses = 0;
    let stallRentAttempts = 0;
    let stallRentLosses = 0;
    let landRentAttempts = 0;
    let rentalExpiryLogs = 0;
    let homeStarvationAnomalies = 0;
    let totalEventsTriggered = 0;

    for (const origin of ORIGINS) {
      for (let fIdx = 0; fIdx < FOCUSES.length; fIdx++) {
        const focus = FOCUSES[fIdx];
        for (let seedIdx = 1; seedIdx <= 5; seedIdx++) {
          const seed = seedIdx * 101 + ORIGINS.indexOf(origin) * 17 + fIdx * 7;
          const raw = createNewLife(seed);
          let state: ActiveLifeState = {
            ...raw,
            profile: { ...raw.profile, originClass: origin },
          };

          // Childhood (0 -> 13)
          let cGuard = 0;
          while (state.isAlive && getAgeYears(state.profile.totalDays) < 13 && cGuard < 200) {
            cGuard++;
            const res = advanceChildhoodMonth(state, ALL_EVENTS, CHILDHOOD_AMBIENT_DATA);
            state = res.state;
            if (res.pendingEvent) {
              totalEventsTriggered++;
              const choiceIdx = (seed + cGuard) % res.pendingEvent.choices.length;
              state = resolveEventChoice(state, res.pendingEvent, choiceIdx).state;
            }
          }

          if (state.isAlive) {
            state = {
              ...state,
              schedule: { ...state.schedule, lifeFocus: focus },
            };
          }

          // Adulthood (13 -> 75 or death)
          let aGuard = 0;
          while (state.isAlive && getAgeYears(state.profile.totalDays) < 75 && aGuard < 220) {
            aGuard++;
            const age = getAgeYears(state.profile.totalDays);

            if (state.yearPlan?.yearAge !== age) {
              state = planYear(state, ALL_EVENTS);
            }

            // Exercise Chi tiêu · Đầu tư actions periodically
            if (aGuard % 3 === 0) {
              if (state.assets.wealthCopper < 100) {
                const askRes = executeInstantAdultAction(state, 'inst_ask_family_money');
                if (askRes.ok) {
                  askMoneyAttempts++;
                  if (askRes.state.assets.wealthCopper > state.assets.wealthCopper) {
                    askMoneySuccesses++;
                  }
                  state = askRes.state;
                }
              }
              if (state.assets.wealthCopper >= 300) {
                const beforeW = state.assets.wealthCopper;
                const stallRes = executeInstantAdultAction(state, 'inst_rent_market_stall');
                if (stallRes.ok) {
                  stallRentAttempts++;
                  if (stallRes.state.assets.wealthCopper < beforeW) stallRentLosses++;
                  state = stallRes.state;
                }
              }
              if (state.assets.wealthCopper >= 200 && state.assets.rice < 15) {
                const landRes = executeInstantAdultAction(state, 'inst_rent_land_season');
                if (landRes.ok) {
                  landRentAttempts++;
                  state = landRes.state;
                }
              }
            }

            const prevLogs = state.logs.length;
            const res = advanceDays(state, 180, ALL_ACTIONS, ALL_EVENTS, {
              pauseOnBirthday: false,
              pauseOnLowHealth: false,
              pauseOnLowHappiness: false,
              pauseOnNoFood: false,
            });
            state = res.state;

            for (const l of state.logs.slice(prevLogs)) {
              if (l.text.includes('hết hạn 90 ngày') || l.text.includes('mãn hạn kỳ thuê')) {
                rentalExpiryLogs++;
              }
            }

            if (res.pendingEvent) {
              totalEventsTriggered++;
              const choiceIdx = (seed + aGuard) % res.pendingEvent.choices.length;
              if (res.pendingEvent.id.startsWith('dec_')) {
                state = applyDynamicDecisionSideEffects(state, res.pendingEvent.id, choiceIdx);
              }
              state = resolveEventChoice(state, res.pendingEvent, choiceIdx).state;
            }

            // Sample stats periodically in adulthood
            if (state.isAlive && aGuard % 4 === 0) {
              byOrigin[origin].health.push(state.stats.health);
              byOrigin[origin].happiness.push(state.stats.happiness);
              byOrigin[origin].relationships.push(state.stats.relationships);
              byOrigin[origin].totalSamples++;
              if (state.stats.happiness >= 99.5) byOrigin[origin].pinnedHappy100++;
              if (state.stats.relationships >= 99.5) byOrigin[origin].pinnedRel100++;
            }

            // Check no starvation while living at home with wealthy family
            if (
              !state.isAlive &&
              state.deathReason?.includes('Chết đói') &&
              !state.flags.includes('da_ra_o_rieng') &&
              getFamilyCoveredLifestyleTier(state) !== null
            ) {
              homeStarvationAnomalies++;
            }
          }

          const finalAge = getAgeYears(state.profile.totalDays);
          byOrigin[origin].count++;
          byOrigin[origin].ages.push(finalAge);
          byOrigin[origin].copper.push(state.assets.wealthCopper);
          byOrigin[origin].familyCopper.push(state.family?.familyWealthCopper ?? 0);

          expect(Number.isNaN(state.stats.health)).toBe(false);
          expect(Number.isNaN(state.stats.happiness)).toBe(false);
          expect(Number.isNaN(state.stats.relationships)).toBe(false);
          expect(Number.isNaN(state.assets.wealthCopper)).toBe(false);
        }
      }
    }

    const avg = (arr: number[]) => (arr.length ? (arr.reduce((a, b) => a + b, 0) / arr.length).toFixed(1) : '0');

    console.log('\n=== 100-LIFE BALANCE & SPEND-INVEST AUDIT ===');
    for (const o of ORIGINS) {
      const d = byOrigin[o];
      const pinH = ((d.pinnedHappy100 / Math.max(1, d.totalSamples)) * 100).toFixed(1);
      const pinR = ((d.pinnedRel100 / Math.max(1, d.totalSamples)) * 100).toFixed(1);
      console.log(
        `${o}: lives=${d.count} | avgAge=${avg(d.ages)} | HL=${avg(d.health)} | HP=${avg(d.happiness)}(pin100=${pinH}%) | QH=${avg(d.relationships)}(pin100=${pinR}%) | avgCopper=${avg(d.copper)} | avgFamCopper=${avg(d.familyCopper)}`,
      );
    }
    console.log(
      `Spend/Invest: askMoney=${askMoneySuccesses}/${askMoneyAttempts} | stallRentLosses=${stallRentLosses}/${stallRentAttempts} | landRents=${landRentAttempts} | rentalExpiryLogs=${rentalExpiryLogs} | eventsTriggered=${totalEventsTriggered} | homeStarvationAnomalies=${homeStarvationAnomalies}`,
    );

    expect(homeStarvationAnomalies).toBe(0);
    expect(askMoneyAttempts).toBeGreaterThan(0);
    expect(askMoneySuccesses).toBeGreaterThan(0);
    expect(askMoneySuccesses).toBeLessThan(askMoneyAttempts);
    expect(stallRentAttempts).toBeGreaterThan(0);
    expect(stallRentLosses).toBeGreaterThan(0);
    expect(rentalExpiryLogs).toBeGreaterThan(0);
    expect(totalEventsTriggered).toBeGreaterThan(1500);
  }, 120000);
});
