import { DAYS_PER_YEAR, type ActiveLifeState } from '../../types/activeLife';
import { formatCopper } from '../economy';
import { appendLog, applyAnnualStatMeanReversion, applyEffects } from '../effectApplier';
import { computeFamilyMonthlyNetCopper } from '../familyEconomy';
import { getCurrentLivelihoodLabel } from '../lifeStatus';
import {
  getOfficialMonthlyUpkeepCopper,
  getOfficialRankSpec,
  getOfficialTitle,
  getRebellionMonthlyUpkeepCopper,
} from '../officialSystem';
import { mulberry32Next } from '../prng';
import { PROPERTY_CATALOG } from '../progressionModules';
import {
  applyAnnualGiftEtiquette,
  generateAnnualLifeFlavorLogs,
  getCreditLimitCopper,
  runAnnualAutoActions,
} from '../adultLifeActions';
import {
  addLedger,
  applyMonthlyFamilyAllowance,
  emptyLedger,
} from './dailyEconomy';

export function processMonthlyTick(
  inputState: ActiveLifeState,
  nextTotalDays: number,
  newAge: number,
): ActiveLifeState {
  let state = inputState;
      if (
        state.family &&
        !state.flags.includes('da_ra_o_rieng') &&
        state.npcs.some((n) => n.relation === 'parent' && n.isAlive)
      ) {
        const familyCashflow = computeFamilyMonthlyNetCopper(state);
        if (familyCashflow.net !== 0) {
          state = applyEffects(state, { family_copper: familyCashflow.net });
        }
      }
      state = applyMonthlyFamilyAllowance(state, newAge);

      // Monthly official salary & manor upkeep (Anti-inflation balance)
      if (state.officialRank > 0 && state.officialRank < 10 && state.official) {
        const off = state.official;
        const rankSpec = getOfficialRankSpec(state.officialRank);
        if (rankSpec) {
          const isSuspended =
            off.salarySuspendedUntilDay !== undefined &&
            nextTotalDays < off.salarySuspendedUntilDay;
          if (!isSuspended) {
            state = applyEffects(state, {
              copper: rankSpec.monthlySalaryCopper,
              rice: rankSpec.monthlyRiceDau,
            });
            state = addLedger(state, { workIncomeCopper: rankSpec.monthlySalaryCopper });
          }
          const upkeep = getOfficialMonthlyUpkeepCopper(off);
          if (upkeep > 0) {
            state = applyEffects(state, { copper: -upkeep });
            state = addLedger(state, { livingExpenseCopper: upkeep });
          }
        }
        // Proxy business monthly audit risk creep
        if (off.proxyBusinessIds.length > 0) {
          state = applyEffects(state, {
            scandal_risk: Math.min(4, off.proxyBusinessIds.length),
          });
        }
      }

      // Restore rank after 3-year DingYou (Đinh ưu) mourning period
      if (
        state.officialRank === 0 &&
        state.official?.dingYouUntilDay !== undefined &&
        nextTotalDays >= state.official.dingYouUntilDay
      ) {
        const dingOff = state.official;
        const restoredRank = dingOff.savedRankBeforeDingYou ?? 1;
        const restoredTrack = dingOff.savedTrackBeforeDingYou ?? dingOff.track;
        const restoredTitle = getOfficialTitle(restoredRank, restoredTrack);
        state = applyEffects(state, {
          add_flags: ['dang_lam_quan'],
          milestone_title: `Mãn tang Đinh ưu: Phục chức ${restoredTitle}`,
        });
        state = {
          ...state,
          officialRank: restoredRank,
          official: {
            ...dingOff,
            rank: restoredRank,
            title: restoredTitle,
            dingYouUntilDay: undefined,
            savedRankBeforeDingYou: undefined,
            savedTrackBeforeDingYou: undefined,
          },
          profile: { ...state.profile, currentRole: restoredTitle },
          logs: appendLog(
            state.logs,
            nextTotalDays,
            'event',
            `Hết 3 năm chịu tang Đinh ưu, triều đình phục chức ${restoredTitle} cho bạn.`,
          ),
        };
      }

      // Monthly rebellion army upkeep & desertion check
      if ((state.rebellion?.armyPower ?? 0) > 0) {
        const armyUpkeep = getRebellionMonthlyUpkeepCopper(state);
        if (state.rebellion.treasuryCopper >= armyUpkeep) {
          state = {
            ...state,
            rebellion: {
              ...state.rebellion,
              treasuryCopper: state.rebellion.treasuryCopper - armyUpkeep,
            },
          };
          if (state.officialRank > 0) {
            state = applyEffects(state, { scandal_risk: 2 });
          }
        } else {
          const deserted = Math.min(state.rebellion.armyPower, 10);
          state = {
            ...state,
            rebellion: {
              ...state.rebellion,
              armyPower: Math.max(0, state.rebellion.armyPower - deserted),
            },
            logs: appendLog(
              state.logs,
              nextTotalDays,
              'warning',
              `Ngân khố mật thất cạn tiền nuôi quân, ${deserted} tử sĩ bỏ trốn!`,
            ),
          };
          state = applyEffects(state, { infamy: 5, scandal_risk: state.officialRank > 0 ? 8 : 0 });
        }
      }
  return state;
}

export function processAnnualBirthdayTick(
  inputState: ActiveLifeState,
  nextTotalDays: number,
  newAge: number,
): { state: ActiveLifeState; diedOfOldAge: boolean } {
  let state = inputState;
      // Annual pension for retired officials / veteran workers
      if (state.flags.includes('co_luong_huu') && state.livelihoodStatus === 'retired') {
        const pension = state.officialRank > 0 ? 600 : 300;
        state = applyEffects(state, { copper: pension });
        state = addLedger(state, { propertyIncomeCopper: pension });
      }

      // Annual land tax & maintenance for owned properties (~2.5% of property value)
      if (state.assets.properties.length > 0) {
        let totalPropValue = 0;
        for (const propId of state.assets.properties) {
          const spec = PROPERTY_CATALOG.find((p) => p.id === propId);
          if (spec) totalPropValue += spec.costCopper;
        }
        const upkeepTax = Math.round(totalPropValue * 0.025);
        if (upkeepTax > 0) {
          state = applyEffects(state, { copper: -upkeepTax });
          state = addLedger(state, { otherExpenseCopper: upkeepTax });
        }
      }

      // Annual idle-cash investment return (1in8b INV_KS)
      if (state.assets.wealthCopper > 0 && state.investmentChannel && state.investmentChannel !== 'cash') {
        let rate = 0;
        if (state.investmentChannel === 'bank') rate = 0.015;
        else if (state.investmentChannel === 'guild') rate = 0.035;
        else if (state.investmentChannel === 'land_fund') rate = 0.04;
        else if (state.investmentChannel === 'caravan') {
          const invRoll = mulberry32Next(state.prngState);
          state = { ...state, prngState: invRoll.nextState };
          rate = -0.02 + invRoll.value * 0.11; // -2% to +9%
        }
        const cappedPrincipal = Math.min(state.assets.wealthCopper, 2_000_000);
        const invGain = Math.round(cappedPrincipal * rate);
        if (invGain !== 0) {
          state = applyEffects(state, { copper: invGain });
          if (invGain > 0) state = addLedger(state, { propertyIncomeCopper: invGain });
          else state = addLedger(state, { otherExpenseCopper: Math.abs(invGain) });
        }
      }

      const copperBeforeAnnual = state.assets.wealthCopper;
      state = applyAnnualGiftEtiquette(state);
      state = runAnnualAutoActions(state);
      const annualSpent = Math.max(0, copperBeforeAnnual - state.assets.wealthCopper);
      if (annualSpent > 0) {
        state = addLedger(state, { otherExpenseCopper: annualSpent });
      }

      // Family household finances (spouse & children)
      const hasSpouse = state.npcs.some((n) => n.relation === 'spouse' && n.isAlive);
      const livingChildren = state.npcs.filter((n) => n.relation === 'child' && n.isAlive);
      if (hasSpouse) {
        const spouseIncome = state.profile.originClass === 'ban_nong' ? 90 : 180;
        state = applyEffects(state, { copper: spouseIncome });
        state = addLedger(state, { workIncomeCopper: spouseIncome });
      }
      for (const child of livingChildren) {
        const childAge = (child.age ?? 0) + newAge;
        if (childAge < 18) {
          state = applyEffects(state, { copper: -60 });
          state = addLedger(state, { livingExpenseCopper: 60 });
        } else if (childAge >= 22 && newAge >= 60) {
          state = applyEffects(state, { copper: 120 });
          state = addLedger(state, { propertyIncomeCopper: 120 });
        }
      }

      const expectedHealth = Math.max(25, 82 - Math.max(0, newAge - 30) * 0.7);
      state = generateAnnualLifeFlavorLogs(state);
      state = applyAnnualStatMeanReversion(state, newAge);

      // 1in8b-style `tightY` / `bkYear`: track prolonged heavy debt and trigger bankruptcy relief at year 3
      const creditLimit = getCreditLimitCopper(state);
      const isDeepDebt =
        state.assets.wealthCopper < -Math.max(500, Math.round(creditLimit * 0.85));
      if (!isDeepDebt) {
        if (
          state.flags.includes('no_keo_dai_1') ||
          state.flags.includes('no_keo_dai_2')
        ) {
          state = {
            ...state,
            flags: state.flags.filter((f) => f !== 'no_keo_dai_1' && f !== 'no_keo_dai_2'),
          };
        }
      } else if (state.flags.includes('no_keo_dai_2')) {
        const tierOrder: Array<NonNullable<ActiveLifeState['family']>['familyLivingTier']> = [
          'tung_thieu',
          'du_an',
          'kha_gia',
          'sung_tuc',
          'hoang_gia',
        ];
        const nextTierIdx = state.family
          ? Math.max(0, tierOrder.indexOf(state.family.familyLivingTier) - 1)
          : 0;
        const nextProps = state.assets.properties.slice(1);
        const forgivenCash = Math.round(state.assets.wealthCopper * 0.4);
        state = applyEffects(
          {
            ...state,
            flags: state.flags.filter(
              (f) => f !== 'no_keo_dai_1' && f !== 'no_keo_dai_2' && f !== 'dang_no_dia_chu',
            ),
            assets: {
              ...state.assets,
              wealthCopper: forgivenCash,
              properties: nextProps,
            },
            family: state.family
              ? { ...state.family, familyLivingTier: tierOrder[nextTierIdx] }
              : undefined,
            logs: appendLog(
              state.logs,
              nextTotalDays,
              'warning',
              'Vỡ nợ kéo dài 3 năm: Quan nha và chủ nợ tịch biên một phần gia sản, phần nợ còn lại được khoanh giảm 60% để bạn làm lại cuộc đời.',
              { tone: 'negative' },
            ),
          },
          { happiness: -8, fame: -5 },
        );
      } else if (state.flags.includes('no_keo_dai_1')) {
        state = {
          ...state,
          flags: [...state.flags.filter((f) => f !== 'no_keo_dai_1'), 'no_keo_dai_2'],
          logs: appendLog(
            state.logs,
            nextTotalDays,
            'warning',
            'Nợ nần kéo sang năm thứ 2 liên tiếp: Chủ nợ đã đánh tiếng siết gia sản nếu không sớm trả bớt.',
            { tone: 'negative' },
          ),
        };
      } else {
        state = {
          ...state,
          flags: [...state.flags, 'no_keo_dai_1'],
        };
      }
      if ((state.focusTime?.cong_danh ?? 0) > DAYS_PER_YEAR * 0.6) {
        state = {
          ...state,
          logs: appendLog(
            state.logs,
            nextTotalDays,
            'warning',
            'Năm qua bạn dồn quá nhiều sức cho công danh, thân tâm có phần kiệt quệ.',
            { tone: 'negative' },
          ),
        };
      }
      const prevYear = Math.max(0, newAge - 1);
      const roundedHappiness = Math.round(state.stats.happiness);
      const netWorthNow =
        state.assets.wealthCopper +
        (state.assets.goldReserveCopper ?? 0) +
        Math.round(state.assets.rice * state.world.ricePriceInCopper);
      const completedLedger = state.finance?.currentYear ?? emptyLedger();
      const livelihoodSummary = getCurrentLivelihoodLabel(state);
      state = {
        ...state,
        finance: {
          currentYear: emptyLedger(),
          lastYear: completedLedger,
          lastYearNetWorthCopper: netWorthNow,
        },
        focusTime: {},
        yearlyHappiness: {
          ...(state.yearlyHappiness ?? {}),
          [prevYear]: state.yearlyHappiness?.[prevYear] ?? roundedHappiness,
          [newAge]: roundedHappiness,
        },
        logs: appendLog(
          state.logs,
          nextTotalDays,
          'survival',
          `Tổng kết tuổi ${prevYear}: ${livelihoodSummary} • Sức khỏe ${Math.round(state.stats.health)}%, Hạnh phúc ${roundedHappiness}%, Tài sản ${formatCopper(state.assets.wealthCopper)}.`,
        ),
      };

      // 1in8b annual age-based mortality roll (natural lifespan cap at 120)
      if (newAge >= 55 && state.isAlive) {
        const baseDeathProb =
          newAge >= 120
            ? 1.0
            : newAge >= 100
              ? 0.35
              : newAge >= 85
                ? 0.14
                : newAge >= 75
                  ? 0.055
                  : newAge >= 65
                    ? 0.02
                    : 0.005;
        const healthMult = Math.max(0.5, Math.exp((expectedHealth - state.stats.health) * 0.025));
        const finalProb = Math.min(1, baseDeathProb * healthMult);
        const roll = mulberry32Next(state.prngState);
        state = { ...state, prngState: roll.nextState };
        if (roll.value < finalProb) {
          const reason = 'Tuổi cao sức yếu, an nhiên qua đời';
          state = {
            ...state,
            isAlive: false,
            deathReason: reason,
            logs: appendLog(state.logs, nextTotalDays, 'survival', `Qua đời ở tuổi ${newAge}: ${reason}.`, {
              tone: 'negative',
            }),
          };
          return { state, diedOfOldAge: true };
        }
      }
  return { state, diedOfOldAge: false };
}
