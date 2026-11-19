import { describe, expect, it } from 'vitest';
import { createNewLife } from '../lifeInitializer';
import {
  appointOrPromoteOfficial,
  buyOfficialTitle,
  buyProperty,
  grantRoyalPrivilege,
  launchRebellion,
  recruitRebellionArmy,
  upgradeHousing,
} from '../progressionModules';
import {
  bribeForEarlyPromotion,
  canBribeForPromotion,
  canRequestKhaoKhoa,
  checkHousingTiemLe,
  checkOfficialPropertyRule,
  donateDisasterReliefAsOfficial,
  equipMilitaryGear,
  evaluateKhaoKhoa,
  manageOfficialStaff,
  rewardMilitaryTroops,
  sendSeasonalSuperiorGift,
  setOfficialFamilyAccompany,
  triggerDingYouLeave,
  triggerKimCachTongNhung,
} from '../officialSystem';
import { DAYS_PER_YEAR } from '../../types/activeLife';

function makeAdultLife(origin: 'ban_nong' | 'thu_cong' | 'dia_chu' | 'quan_lai' | 'hoang_toc' = 'quan_lai', seed = 101) {
  const base = createNewLife(seed);
  return {
    ...base,
    profile: { ...base.profile, originClass: origin, gender: 'male' as const, totalDays: 22 * DAYS_PER_YEAR },
    stats: { ...base.stats, education: 80, martial: 30, fame: 100, happiness: 70, health: 85 },
    assets: { ...base.assets, wealthCopper: 300000, rice: 100 },
  };
}

describe('Feudal Official System (Văn · Võ · Hoạn Quan & Luật Triều Đình)', () => {
  it('assigns distinct starting ranks by exam tier and track (Văn vs Võ)', () => {
    const cuNhan = { ...makeAdultLife(), flags: ['do_cu_nhan'] };
    const offCuNhan = appointOrPromoteOfficial(cuNhan);
    expect(offCuNhan.officialRank).toBe(2); // Bát phẩm
    expect(offCuNhan.official?.track).toBe('van');

    const trangNguyen = { ...makeAdultLife(), flags: ['do_tien_si', 'trang_nguyen'] };
    const offTrangNguyen = appointOrPromoteOfficial(trangNguyen);
    expect(offTrangNguyen.officialRank).toBe(5); // Ngũ phẩm

    const voGeneral = {
      ...makeAdultLife(),
      flags: ['trong_quan_ngu'],
      stats: { ...makeAdultLife().stats, martial: 85, education: 40 },
    };
    const offVo = appointOrPromoteOfficial(voGeneral);
    expect(offVo.officialRank).toBe(1); // Cửu phẩm Bách hộ
    expect(offVo.official?.track).toBe('vo');
  });

  it('requires 15 Vàng for Quyên quan, grants Cửu phẩm Hư hàm, and caps promotion at Ngũ phẩm (5)', () => {
    const poor = { ...makeAdultLife(), assets: { ...makeAdultLife().assets, wealthCopper: 50000 } };
    expect(buyOfficialTitle(poor).officialRank).toBe(0);

    const rich = makeAdultLife();
    const bought = buyOfficialTitle(rich);
    expect(bought.officialRank).toBe(1);
    expect(bought.official?.isHanhHam).toBe(true);
    expect(bought.assets.wealthCopper).toBe(150000);

    // Even if somehow at rank 5, isHanhHam cannot request Khảo khóa to Lục phẩm (6)
    const capped = {
      ...bought,
      officialRank: 5,
      official: { ...bought.official!, rank: 5, lastReviewDay: 0 },
    };
    expect(canRequestKhaoKhoa(capped).ok).toBe(false);
  });

  it('blocks instant promotion without 3-year tenure and promotes on Thượng khảo when stats & merit meet thresholds', () => {
    const cuNhan = { ...makeAdultLife(), flags: ['do_cu_nhan'] };
    const official = appointOrPromoteOfficial(cuNhan);
    expect(canRequestKhaoKhoa(official).ok).toBe(false);

    // Fast-forward 3 years (1080 days) with high merit, fame, imperialFavor, low scandal
    const ready = {
      ...official,
      profile: { ...official.profile, totalDays: official.profile.totalDays + 1080 },
      stats: { ...official.stats, education: 60, fame: 120 },
      official: {
        ...official.official!,
        merit: 60,
        publicTrust: 40,
        imperialFavor: 40,
        scandalRisk: 5,
      },
    };
    expect(canRequestKhaoKhoa(ready).ok).toBe(true);
    const promoted = evaluateKhaoKhoa(ready);
    expect(promoted.officialRank).toBe(3); // Bát phẩm -> Thất phẩm
  });

  it('enforces commercial business ban, proxy business risk, Hạn điền, and Tiếm lễ', () => {
    const cuNhan = { ...makeAdultLife(), flags: ['do_cu_nhan'] };
    const official = appointOrPromoteOfficial(cuNhan); // Rank 2 (Bát phẩm)

    // Direct commercial purchase blocked
    const directRule = checkOfficialPropertyRule(official, 'cua_hieu_gao', false);
    expect(directRule.allowed).toBe(false);

    // Proxy purchase allowed at +15% cost and +8 scandalRisk
    const withProxy = buyProperty(official, 'cua_hieu_gao', true);
    expect(withProxy.assets.properties).toContain('cua_hieu_gao');
    expect(withProxy.official?.proxyBusinessIds).toContain('cua_hieu_gao');
    expect(withProxy.official?.scandalRisk).toBeGreaterThan(0);

    // Tiếm lễ: Rank 2 cannot buy phu_de (requires Rank 4+)
    expect(checkHousingTiemLe(official, 'phu_de').allowed).toBe(false);
    const beforeHousing = official.assets.housing;
    expect(upgradeHousing(official, 'phu_de').assets.housing).toBe(beforeHousing);

    // Hạn điền: Rank 2 max 2 land properties
    const l1 = buyProperty(official, 'ruong_tu');
    const l2 = buyProperty(l1, 'ruong_tu');
    const l3 = buyProperty(l2, 'ruong_tu');
    expect(l3.assets.properties.filter((p) => p === 'ruong_tu').length).toBe(2);
  });

  it('supports manor staff, seasonal gifts, disaster relief, family accompany, and Đinh ưu 3-year leave', () => {
    const cuNhan = { ...makeAdultLife(), flags: ['do_cu_nhan'] };
    let off = appointOrPromoteOfficial(cuNhan);

    off = manageOfficialStaff(off, 'hire_maid');
    off = manageOfficialStaff(off, 'hire_guard');
    off = manageOfficialStaff(off, 'hire_advisor');
    expect(off.official?.maidsCount).toBe(1);
    expect(off.official?.guardsCount).toBe(1);
    expect(off.official?.hasAdvisor).toBe(true);

    const favorBefore = off.official?.imperialFavor ?? 0;
    off = sendSeasonalSuperiorGift(off, 'bang_kinh');
    expect(off.official?.imperialFavor).toBeGreaterThan(favorBefore);

    const trustBefore = off.official?.publicTrust ?? 0;
    off = donateDisasterReliefAsOfficial(off);
    expect(off.official?.publicTrust).toBeGreaterThan(trustBefore);

    off = setOfficialFamilyAccompany(off, true);
    expect(off.official?.familyAccompanied).toBe(true);

    // Đinh ưu for Civil Official
    const mourning = triggerDingYouLeave(off);
    expect(mourning.officialRank).toBe(0);
    expect(mourning.official?.savedRankBeforeDingYou).toBe(2);
    expect(mourning.official?.dingYouUntilDay).toBe(off.profile.totalDays + 3 * DAYS_PER_YEAR);
  });

  it('requires base and 25.000đ per 10 armyPower for rebellion recruitment', () => {
    const base = makeAdultLife('ban_nong');
    const noBase = {
      ...base,
      stats: { ...base.stats, fame: 10, infamy: 10 },
      assets: { ...base.assets, properties: [] },
      rebellion: { treasuryCopper: 50000, armyPower: 0 },
    };
    expect(recruitRebellionArmy(noBase).rebellion.armyPower).toBe(0);

    const withBase = {
      ...noBase,
      assets: { ...noBase.assets, properties: ['trang_vien_cho_thue'] },
    };
    const recruited = recruitRebellionArmy(withBase);
    expect(recruited.rebellion.armyPower).toBe(10);
    expect(recruited.rebellion.treasuryCopper).toBe(25000);
  });

  it('allows royal privilege at Lục phẩm / Ngũ phẩm', () => {
    const royal = { ...makeAdultLife('hoang_toc'), flags: [] };
    const off = grantRoyalPrivilege(royal);
    expect(off.officialRank).toBe(5);
    expect(off.official?.track).toBe('van');
    expect(launchRebellion(off).isAlive).toBeDefined();
  });

  it('assigns act_quan_vo_thao_luyen for Quan Võ, supports military gear/troops, and Kim cách tòng nhung', () => {
    const voBase = {
      ...makeAdultLife('ban_nong'),
      flags: ['trong_quan_ngu'],
      stats: { ...makeAdultLife('ban_nong').stats, martial: 75, education: 30, fame: 100 },
    };
    let vo = appointOrPromoteOfficial(voBase);
    expect(vo.official?.track).toBe('vo');
    expect(vo.schedule.morning).toBe('act_quan_vo_thao_luyen');

    const meritBefore = vo.official?.merit ?? 0;
    vo = rewardMilitaryTroops(vo);
    expect(vo.official?.merit).toBeGreaterThan(meritBefore);

    const martialBefore = vo.stats.martial;
    vo = equipMilitaryGear(vo);
    expect(vo.stats.martial).toBeGreaterThan(martialBefore);

    const mourningVo = triggerKimCachTongNhung(vo);
    expect(mourningVo.officialRank).toBe(vo.officialRank);
    expect(mourningVo.official?.imperialFavor).toBeGreaterThan(vo.official?.imperialFavor ?? 0);
  });

  it('supports high-risk bribeForEarlyPromotion after half tenure while respecting isHanhHam cap', () => {
    const cuNhan = { ...makeAdultLife(), flags: ['do_cu_nhan'] };
    const off = appointOrPromoteOfficial(cuNhan); // Rank 2, tenure 720 days
    expect(canBribeForPromotion(off).ok).toBe(false); // < half tenure (360 days)

    const halfTenureReady = {
      ...off,
      profile: { ...off.profile, totalDays: off.profile.totalDays + 360 },
      assets: { ...off.assets, wealthCopper: 100000 },
    };
    expect(canBribeForPromotion(halfTenureReady).ok).toBe(true);
    const result = bribeForEarlyPromotion(halfTenureReady);
    expect(result.assets.wealthCopper).toBeLessThan(100000);
    expect(result.official?.scandalRisk).toBeGreaterThan(0);

    // Quyên quan at Rank 5 cannot bribe past Ngũ phẩm
    const hanhHam5 = {
      ...halfTenureReady,
      officialRank: 5,
      official: { ...halfTenureReady.official!, rank: 5, isHanhHam: true },
    };
    expect(canBribeForPromotion(hanhHam5).ok).toBe(false);
  });
});
