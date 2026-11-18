import { describe, expect, it } from 'vitest';
import { createNewLife } from '../lifeInitializer';
import { applyEffects } from '../effectApplier';
import { advanceChildhoodMonth } from '../childhoodEngine';
import { advanceDays } from '../daySimulator';
import { ALL_ACTIONS } from '../../data/registry';
import {
  abandonCommitment,
  getAvailableCommitments,
  startCommitment,
  tickCommitmentDays,
} from '../commitmentSystem';

describe('Commitment & Feudal Education Progression System', () => {
  it('hides noble academy when gia_toc_sa_sut and gates higher tiers behind prerequisites', () => {
    let quanLai = createNewLife(42);
    for (let s = 1; s <= 1500; s += 1) {
      const candidate = createNewLife(s);
      if (
        candidate.profile.originClass === 'quan_lai' &&
        !candidate.flags.includes('gia_toc_sa_sut') &&
        (candidate.family?.familyWealthCopper ?? 0) >= 1000
      ) {
        quanLai = candidate;
        break;
      }
    }
    quanLai = {
      ...quanLai,
      profile: { ...quanLai.profile, totalDays: 6 * 360 },
    };

    const normalOpts = getAvailableCommitments(quanLai);
    expect(normalOpts.some((o) => o.option.id === 'commit_edu_danh_su_nhi_dong' && o.eligible)).toBe(
      true,
    );

    const declined = applyEffects(quanLai, { add_flags: ['gia_toc_sa_sut'] });
    const declinedOpts = getAvailableCommitments(declined);
    expect(declinedOpts.some((o) => o.option.id === 'commit_edu_danh_su_nhi_dong')).toBe(false);

    // Adulthood: Truong Phu Huyen only appears if da_khai_tam or education >= 20
    const lowEduAdult = {
      ...declined,
      profile: { ...declined.profile, totalDays: 14 * 360 },
      stats: { ...declined.stats, education: 10 },
      flags: declined.flags.filter((f) => f !== 'da_khai_tam'),
    };
    expect(
      getAvailableCommitments(lowEduAdult).some(
        (o) => o.option.id === 'commit_adult_truong_phu_huyen',
      ),
    ).toBe(false);

    const khaiTamAdult = applyEffects(lowEduAdult, { add_flags: ['da_khai_tam'] });
    expect(
      getAvailableCommitments(khaiTamAdult).some(
        (o) => o.option.id === 'commit_adult_truong_phu_huyen',
      ),
    ).toBe(true);
  });

  it('passes or fails final exam based on passCondition threshold', () => {
    let life = createNewLife(10);
    life = {
      ...life,
      profile: { ...life.profile, totalDays: 6 * 360 },
      stats: { ...life.stats, education: 5 },
      assets: { ...life.assets, wealthCopper: 1000 },
    };
    if (life.family) {
      life = {
        ...life,
        family: { ...life.family, familyWealthCopper: 1000 },
      };
    }

    // Fail case: education stays below 16
    let startedFail = startCommitment(life, 'commit_edu_khai_tam');
    expect(startedFail.activeCommitment?.remainingDays).toBe(360);
    startedFail = tickCommitmentDays(startedFail, 360);
    expect(startedFail.activeCommitment).toBeNull();
    expect(startedFail.flags).not.toContain('da_khai_tam');

    // Pass case: education reaches >= 16 before end of term
    let startedPass = startCommitment(
      { ...life, stats: { ...life.stats, education: 16 } },
      'commit_edu_khai_tam',
    );
    for (let m = 0; m < 12; m += 1) {
      startedPass = advanceChildhoodMonth(startedPass, []).state;
    }
    expect(startedPass.activeCommitment).toBeNull();
    expect(startedPass.flags).toContain('da_khai_tam');
  });

  it('locks military slots, sets trong_quan_ngu, and handles completion or early abandon', () => {
    let life = createNewLife(77);
    life = {
      ...life,
      profile: { ...life.profile, totalDays: 18 * 360, stage: 'adulthood' },
      stats: { ...life.stats, health: 80 },
      flags: life.flags.filter((f) => f !== 'dang_lam_quan' && f !== 'trong_quan_ngu'),
    };

    const enlisted = startCommitment(life, 'commit_adult_military_enlist');
    expect(enlisted.flags).toContain('trong_quan_ngu');
    expect(enlisted.activeCommitment?.lockedSlots).toEqual(['morning', 'afternoon']);

    const after5Days = advanceDays(enlisted, 5, [], ALL_ACTIONS).state;
    expect(after5Days.activeCommitment?.remainingDays).toBe(355);

    const copperBefore = after5Days.assets.wealthCopper;
    const completed = tickCommitmentDays(after5Days, 355);
    expect(completed.activeCommitment).toBeNull();
    expect(completed.flags).not.toContain('trong_quan_ngu');
    expect(completed.assets.wealthCopper).toBe(copperBefore + 800);

    const enlisted2 = startCommitment(life, 'commit_adult_military_enlist');
    const fameBefore = enlisted2.stats.fame;
    const abandoned = abandonCommitment(enlisted2);
    expect(abandoned.activeCommitment).toBeNull();
    expect(abandoned.flags).not.toContain('trong_quan_ngu');
    expect(abandoned.stats.fame).toBe(Math.max(0, fameBefore - 12));
  });
});
