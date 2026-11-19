import { getAgeYears, type ActiveLifeState } from '../../types/activeLife';
import { formatCopper } from '../../engine/economy';
import {
  FACTION_LABELS,
  bribeForEarlyPromotion,
  canBribeForPromotion,
  canRequestKhaoKhoa,
  donateDisasterReliefAsOfficial,
  equipMilitaryGear,
  getOfficialGradeAndTitle,
  getOfficialMonthlyUpkeepCopper,
  getOfficialPostingLabel,
  getOfficialRankSpec,
  getOfficialResidenceLabel,
  isOfficialPostedAway,
  manageOfficialStaff,
  rewardMilitaryTroops,
  sendSeasonalSuperiorGift,
  setOfficialFamilyAccompany,
} from '../../engine/officialSystem';
import {
  appointOrPromoteOfficial,
  canGrantRoyalPrivilege,
  grantRoyalPrivilege,
} from '../../engine/progressionModules';

export function OfficialCourtPanel({
  life,
  applyLifeMutation,
}: {
  life: ActiveLifeState;
  applyLifeMutation: (fn: (s: ActiveLifeState) => ActiveLifeState) => void;
}) {
  const ageYears = getAgeYears(life.profile.totalDays);
  const royalPrivilege = canGrantRoyalPrivilege(life);

  return (
        <div className="p-3 rounded-lg bg-stone-950/80 border border-stone-800 space-y-3 text-xs">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              Chức vị:{' '}
              <strong className="text-sky-300">{getOfficialGradeAndTitle(life)}</strong>
              {life.official?.isHanhHam && (
                <span className="ml-1.5 px-1.5 py-0.5 rounded bg-amber-950 text-amber-300 text-[10px]">
                  Quyên quan (Trần Ngũ phẩm)
                </span>
              )}
            </div>
            {life.official && (
              <span className="text-[11px] text-stone-400">
                {getOfficialPostingLabel(life.official.track, life.official.posting)} ·{' '}
                {isOfficialPostedAway(life)
                  ? `${getOfficialResidenceLabel(life)} · ${life.official.familyAccompanied ? 'Cùng gia quyến tại phủ' : 'Gia quyến ở quê'}`
                  : 'Nhậm chức tại quê nhà / Kinh thành (Không phải đi xa)'}{' '}
                · {FACTION_LABELS[life.official.faction]}
              </span>
            )}
          </div>

          {life.official && life.officialRank > 0 && (() => {
            const off = life.official;
            const isVo = off.track === 'vo';
            const spec = getOfficialRankSpec(life.officialRank);
            const khaoKhoa = canRequestKhaoKhoa(life);
            const upkeep = getOfficialMonthlyUpkeepCopper(off);
            const seasonKey = `${ageYears}_${life.world.season}`;
            const sentBangKinh = off.lastSeasonalGiftKey === seasonKey;
            const sentNhaHoi = off.lastNhaHoiSeasonKey === seasonKey;
            const sentRelief = off.lastReliefSeasonKey === seasonKey;
            const sentMilReward = off.lastMilitaryRewardSeasonKey === seasonKey;
            const sentMilGear = off.lastMilitaryGearSeasonKey === seasonKey;
            const bangKinhCost = life.officialRank * 800;
            const nhaHoiCost = life.officialRank * 2200;
            const reliefCost = Math.max(1500, life.officialRank * 1200);
            const gearCost = Math.max(2000, life.officialRank * 1500);
            return (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <div className="p-2 rounded bg-stone-900 border border-stone-800">
                    <div className="text-[10px] text-stone-400">{isVo ? 'Quân công' : 'Chính tích'}</div>
                    <div className="font-mono text-emerald-300 font-bold">{Math.round(off.merit)}</div>
                  </div>
                  <div className="p-2 rounded bg-stone-900 border border-stone-800">
                    <div className="text-[10px] text-stone-400">{isVo ? 'Quân tâm / Dân tâm' : 'Dân tâm'}</div>
                    <div className={`font-mono font-bold ${off.publicTrust >= 0 ? 'text-sky-300' : 'text-rose-400'}`}>
                      {Math.round(off.publicTrust)}
                    </div>
                  </div>
                  <div className="p-2 rounded bg-stone-900 border border-stone-800">
                    <div className="text-[10px] text-stone-400">Thánh sủng</div>
                    <div className="font-mono text-amber-300 font-bold">{Math.round(off.imperialFavor)} / 100</div>
                  </div>
                  <div className="p-2 rounded bg-stone-900 border border-stone-800">
                    <div className="text-[10px] text-stone-400">Án tích / Hiềm nghi</div>
                    <div className={`font-mono font-bold ${off.scandalRisk >= 50 ? 'text-rose-400' : 'text-stone-300'}`}>
                      {Math.round(off.scandalRisk)} / 100
                    </div>
                  </div>
                </div>

                {/* Phủ đệ & Người hầu */}
                <div className="p-2.5 rounded bg-stone-900/70 border border-stone-800 space-y-2">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-semibold text-amber-200">
                      Phủ đệ &amp; Nhân khẩu (Chi phí: {formatCopper(upkeep)}/tháng · Bổng: {formatCopper(spec?.monthlySalaryCopper ?? 0)}/tháng)
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      disabled={off.maidsCount >= (spec?.maxMaids ?? 0) || life.assets.wealthCopper < 300}
                      onClick={() => applyLifeMutation((s) => manageOfficialStaff(s, 'hire_maid'))}
                      className="px-2 py-1 rounded bg-stone-800 hover:bg-stone-700 disabled:opacity-40 cursor-pointer"
                    >
                      + Nha hoàn ({off.maidsCount}/{spec?.maxMaids ?? 0}) -300đ
                    </button>
                    <button
                      type="button"
                      disabled={off.guardsCount >= (spec?.maxGuards ?? 0) || life.assets.wealthCopper < 450}
                      onClick={() => applyLifeMutation((s) => manageOfficialStaff(s, 'hire_guard'))}
                      className="px-2 py-1 rounded bg-stone-800 hover:bg-stone-700 disabled:opacity-40 cursor-pointer"
                    >
                      + Gia đinh ({off.guardsCount}/{spec?.maxGuards ?? 0}) -450đ
                    </button>
                    {!off.hasAdvisor && life.officialRank >= 2 && (
                      <button
                        type="button"
                        disabled={life.assets.wealthCopper < 1500}
                        onClick={() => applyLifeMutation((s) => manageOfficialStaff(s, 'hire_advisor'))}
                        className="px-2 py-1 rounded bg-sky-900/60 hover:bg-sky-800/60 border border-sky-700/50 text-sky-200 disabled:opacity-40 cursor-pointer"
                      >
                        {isVo ? 'Mời Mạc liêu quân vụ (-1.500đ, 600đ/tháng)' : 'Thuê Sư gia (-1.500đ, 600đ/tháng)'}
                      </button>
                    )}
                    {off.hasAdvisor && (
                      <span className="px-2 py-1 rounded bg-emerald-950/60 border border-emerald-800 text-emerald-300">
                        {isVo ? 'Đã có Mạc liêu hỗ trợ' : 'Đã có Sư gia hỗ trợ'}
                      </span>
                    )}
                    {isOfficialPostedAway(life) && !(isVo && off.posting === 'bien_ai') && (
                      <button
                        type="button"
                        disabled={!off.familyAccompanied && life.assets.wealthCopper < life.officialRank * 600}
                        onClick={() => applyLifeMutation((s) => setOfficialFamilyAccompany(s, !off.familyAccompanied))}
                        className="px-2 py-1 rounded bg-amber-950/70 hover:bg-amber-900/70 border border-amber-700/50 text-amber-200 disabled:opacity-40 cursor-pointer"
                      >
                        {off.familyAccompanied
                          ? 'Đưa gia quyến về quê giữ từ đường'
                          : `Đón gia quyến lên phủ (-${formatCopper(life.officialRank * 600)})`}
                      </button>
                    )}
                  </div>
                </div>

                {/* Tương tác Quan trường */}
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    disabled={sentBangKinh || life.assets.wealthCopper < bangKinhCost}
                    onClick={() => applyLifeMutation((s) => sendSeasonalSuperiorGift(s, 'bang_kinh'))}
                    className="px-2.5 py-1.5 rounded bg-stone-800 hover:bg-stone-700 disabled:opacity-40 cursor-pointer"
                  >
                    {sentBangKinh ? 'Đã gửi Băng/Thán kính mùa này' : `Gửi Băng/Thán kính (-${formatCopper(bangKinhCost)})`}
                  </button>
                  {isVo ? (
                    <>
                      <button
                        type="button"
                        disabled={sentMilReward || life.assets.wealthCopper < reliefCost}
                        onClick={() => applyLifeMutation(rewardMilitaryTroops)}
                        className="px-2.5 py-1.5 rounded bg-emerald-900/60 hover:bg-emerald-800/60 border border-emerald-700/50 text-emerald-200 disabled:opacity-40 cursor-pointer"
                      >
                        {sentMilReward ? 'Đã khao quân mùa này' : `Khao thưởng quân sĩ (-${formatCopper(reliefCost)})`}
                      </button>
                      <button
                        type="button"
                        disabled={sentMilGear || life.assets.wealthCopper < gearCost}
                        onClick={() => applyLifeMutation(equipMilitaryGear)}
                        className="px-2.5 py-1.5 rounded bg-amber-900/50 hover:bg-amber-800/50 border border-amber-700/50 text-amber-200 disabled:opacity-40 cursor-pointer"
                      >
                        {sentMilGear ? 'Đã sắm quân khí mùa này' : `Sắm chiến mã & Giáp trụ (-${formatCopper(gearCost)})`}
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        type="button"
                        disabled={sentNhaHoi || life.assets.wealthCopper < nhaHoiCost}
                        onClick={() => applyLifeMutation((s) => sendSeasonalSuperiorGift(s, 'nha_hoi'))}
                        className="px-2.5 py-1.5 rounded bg-stone-800 hover:bg-stone-700 disabled:opacity-40 cursor-pointer"
                      >
                        {sentNhaHoi ? 'Đã tặng Nhã hối mùa này' : `Tặng Nhã hối cổ vật (-${formatCopper(nhaHoiCost)})`}
                      </button>
                      <button
                        type="button"
                        disabled={sentRelief || life.assets.wealthCopper < reliefCost}
                        onClick={() => applyLifeMutation(donateDisasterReliefAsOfficial)}
                        className="px-2.5 py-1.5 rounded bg-emerald-900/60 hover:bg-emerald-800/60 border border-emerald-700/50 text-emerald-200 disabled:opacity-40 cursor-pointer"
                      >
                        {sentRelief ? 'Đã phát chẩn mùa này' : `Phát chẩn cứu dân (-${formatCopper(reliefCost)})`}
                      </button>
                    </>
                  )}
                </div>

                {life.officialRank < 9 && (() => {
                  const bribeElig = canBribeForPromotion(life);
                  return (
                    <div className="space-y-2">
                      <button
                        type="button"
                        disabled={!khaoKhoa.ok}
                        onClick={() => applyLifeMutation(appointOrPromoteOfficial)}
                        className="w-full py-2 rounded bg-sky-600 hover:bg-sky-500 disabled:opacity-40 text-stone-950 font-bold cursor-pointer"
                      >
                        {khaoKhoa.ok
                          ? `Dâng sớ xin Khảo khóa xét thăng ${getOfficialRankSpec(life.officialRank + 1)?.gradeLabel ?? 'Đại thần'}`
                          : khaoKhoa.reason}
                      </button>
                      <button
                        type="button"
                        disabled={!bribeElig.ok}
                        onClick={() => applyLifeMutation(bribeForEarlyPromotion)}
                        className="w-full py-1.5 rounded bg-rose-950/70 hover:bg-rose-900/70 border border-rose-700/60 disabled:opacity-40 text-rose-200 font-semibold cursor-pointer"
                      >
                        {bribeElig.ok
                          ? `Chạy chức / Đặc cách đề bạt (-${formatCopper(bribeElig.cost)} · Thành công ~${Math.round(bribeElig.successChance * 100)}% · Hiềm nghi +20)`
                          : `Chạy chức (${bribeElig.reason})`}
                      </button>
                    </div>
                  );
                })()}
              </>
            );
          })()}

          {life.officialRank === 0 && life.profile.originClass === 'hoang_toc' && (
            <button
              type="button"
              disabled={!royalPrivilege.ok}
              onClick={() => applyLifeMutation(grantRoyalPrivilege)}
              className="w-full py-2 rounded bg-amber-600 hover:bg-amber-500 disabled:opacity-40 text-stone-950 font-bold cursor-pointer"
            >
              {royalPrivilege.ok
                ? 'Thỉnh phong Tập ấm Hoàng thất (Vào triều nhậm chức)'
                : `Thỉnh phong Tập ấm (${royalPrivilege.reason})`}
            </button>
          )}
          {life.officialRank === 0 &&
            (life.flags.includes('do_tu_tai') ||
              life.flags.includes('do_cu_nhan') ||
              life.flags.includes('do_tien_si') ||
              life.flags.includes('trong_quan_ngu')) && (
            <button
              type="button"
              onClick={() => applyLifeMutation(appointOrPromoteOfficial)}
              className="w-full py-2 rounded bg-sky-600 hover:bg-sky-500 text-stone-950 font-bold cursor-pointer"
            >
              Xin triều đình bổ nhiệm làm quan
            </button>
          )}
        </div>
  );
}
