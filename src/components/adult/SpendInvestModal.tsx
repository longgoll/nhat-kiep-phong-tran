import { useState } from 'react';
import { X } from 'lucide-react';
import {
  getAgeYears,
  type GiftEtiquetteTier,
  type InvestmentChannel,
  type LifestyleTier,
} from '../../types/activeLife';
import { CAREER_CATALOG, VENTURE_CATALOG } from '../../engine/careerSystem';
import { getDailyFixedExpenseSummary } from '../../engine/daySimulator';
import { formatCopper } from '../../engine/economy';
import {
  AUTO_ACTION_CANDIDATES,
  GIFT_ETIQUETTE_OPTIONS,
  INSTANT_ADULT_ACTIONS,
  canAffordInstantAction,
  canHaveChild,
  canMarrySpouse,
  getAskFamilyMoneyProfile,
  getCreditLimitCopper,
  getInstantActionCooldownRemaining,
  rankInstantActions,
  type InstantAdultActionDef,
} from '../../engine/adultLifeActions';
import { useActiveLifeStore } from '../../stores/useActiveLifeStore';
import { LIFESTYLE_OPTIONS } from './constants';

export function SpendInvestModal({
  onClose,
  onOpenCareerModal,
}: {
  onClose: () => void;
  onOpenCareerModal: (tab: 'current' | 'jobs' | 'ventures') => void;
}) {
  const life = useActiveLifeStore((s) => s.life);
  const autoPauseConfig = useActiveLifeStore((s) => s.autoPauseConfig);
  const setLifestyle = useActiveLifeStore((s) => s.setLifestyle);
  const setGiftEtiquette = useActiveLifeStore((s) => s.setGiftEtiquette);
  const setInvestmentChannel = useActiveLifeStore((s) => s.setInvestmentChannel);
  const toggleAutoAction = useActiveLifeStore((s) => s.toggleAutoAction);
  const marrySpouseAction = useActiveLifeStore((s) => s.marrySpouseAction);
  const haveChildAction = useActiveLifeStore((s) => s.haveChildAction);
  const performInstantAction = useActiveLifeStore((s) => s.performInstantAction);
  const setAutoBuyRice = useActiveLifeStore((s) => s.setAutoBuyRice);
  const setAutoPauseConfig = useActiveLifeStore((s) => s.setAutoPauseConfig);
  const takeEmergencyLoan = useActiveLifeStore((s) => s.takeEmergencyLoan);
  const buyRice = useActiveLifeStore((s) => s.buyRice);
  const sellRice = useActiveLifeStore((s) => s.sellRice);
  const buyGold = useActiveLifeStore((s) => s.buyGold);
  const sellGold = useActiveLifeStore((s) => s.sellGold);

  const [showLifestyleDetails, setShowLifestyleDetails] = useState(false);
  const [showMoreSpendActions, setShowMoreSpendActions] = useState(false);

  if (!life) return null;

  const age = getAgeYears(life.profile.totalDays);
  const isInDebt = life.flags.includes('dang_no_dia_chu');
  const isInPrison = life.livelihoodStatus === 'prison' || life.flags.includes('dang_o_tu');
  const hasNegativeCash = life.assets.wealthCopper < 0;
  const creditLimitCopper = getCreditLimitCopper(life);
  const { recommended: recommendedSpendActions, others: moreSpendActions } = rankInstantActions(
    life,
    INSTANT_ADULT_ACTIONS,
    4,
  );
  const setShowActionModal = (v: boolean) => { if (!v) onClose(); };
  const openCareerModal = onOpenCareerModal;

  return (
        <div
          className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-3 sm:p-4"
          onClick={() => setShowActionModal(false)}
        >
          <div
            className="max-w-2xl w-full max-h-[88vh] bg-stone-900 border border-stone-700 rounded-xl flex flex-col overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-stone-800 bg-stone-950/60">
              <span className="text-xs font-semibold uppercase tracking-wider text-amber-300">
                Chi tiêu · Đầu tư
              </span>
              <button
                type="button"
                onClick={() => setShowActionModal(false)}
                className="inline-flex items-center gap-1 text-xs font-medium text-stone-300 hover:text-stone-100 cursor-pointer"
              >
                Đóng <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable Body */}
            <div className="p-5 space-y-4 overflow-y-auto">
              {/* Tier 1: Financial Header */}
              <div className="space-y-1">
                <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
                  <h2 className={`text-xl font-bold ${hasNegativeCash ? 'text-rose-400' : 'text-stone-100'}`}>
                    {hasNegativeCash ? `Đang nợ ${formatCopper(Math.abs(life.assets.wealthCopper))}` : `Tiền mặt ${formatCopper(life.assets.wealthCopper)}`}
                  </h2>
                  <span className="text-xs font-mono text-amber-300">
                    Gạo: {life.assets.rice.toFixed(1)} đấu
                  </span>
                  <span className="text-[11px] font-mono text-stone-400">
                    Hạn mức vay: {formatCopper(creditLimitCopper)}
                  </span>
                </div>
                {(() => {
                  const fixed = getDailyFixedExpenseSummary(life);
                  return (
                    <div className="text-[11px] text-stone-300 font-mono">
                      {fixed.isFamilyCovered
                        ? 'Chi cố định: 0đ/ngày (Đang được gia đình chu cấp)'
                        : `Chi cố định: ${fixed.totalCopper}đ/ngày (Ăn ${fixed.foodCopper}đ + ${fixed.ricePerDay} đấu gạo · Nhà ở ${fixed.housingCopper}đ)`}
                    </div>
                  );
                })()}
                <p className="text-xs text-stone-400">
                  Các lựa chọn hợp hoàn cảnh nhất được ưu tiên lên trên. Thời gian tự động tạm dừng khi bạn xem bảng này.
                </p>
              </div>

              {/* Tier 2: Nên làm lúc này (Top ranked) */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-sky-300">
                    Nên làm lúc này
                  </h3>
                  <span className="text-[10px] text-stone-400">
                    {isInPrison ? 'Đang trong ngục (PRISON_SHOP)' : 'Gợi ý theo hoàn cảnh'}
                  </span>
                </div>
                {(() => {
                  const renderActionCard = (act: InstantAdultActionDef) => {
                    const cd = getInstantActionCooldownRemaining(life, act.id, act.cooldownDays);
                    const ageBlocked = act.minAge !== undefined && age < act.minAge;
                    const maxAgeBlocked = act.maxAge !== undefined && age > act.maxAge;
                    const worldBlocked = act.blockedWorldStates?.includes(life.world.worldState) ?? false;
                    const houseBlocked =
                      act.requiresNotHousing !== undefined && life.assets.housing === act.requiresNotHousing;
                    const { canPay, onCredit, effectiveCost } = canAffordInstantAction(life, act);
                    const disabled =
                      cd > 0 || ageBlocked || maxAgeBlocked || worldBlocked || houseBlocked || !canPay;
                    const askProfile =
                      act.id === 'inst_ask_family_money' ? getAskFamilyMoneyProfile(life) : null;
                    const displaySubtitle = askProfile
                      ? `Xin khoảng ${formatCopper(askProfile.amount)} từ gia sản · Tỷ lệ thành công: ${askProfile.chancePct}%`
                      : act.subtitle;
                    return (
                      <button
                        key={act.id}
                        type="button"
                        disabled={disabled}
                        onClick={() => performInstantAction(act.id)}
                        className="text-left p-2.5 rounded-lg bg-stone-950/70 hover:bg-stone-800/70 border border-stone-800 hover:border-sky-600/60 disabled:opacity-45 disabled:cursor-not-allowed transition cursor-pointer space-y-1"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <span className="text-xs font-semibold text-stone-100 leading-snug">{act.title}</span>
                          <span className="shrink-0 text-[11px] font-mono text-amber-300">
                            {effectiveCost === 0 ? 'Miễn phí' : `${effectiveCost}đ`}
                          </span>
                        </div>
                        <div className="text-[11px] text-stone-400">{displaySubtitle}</div>
                        {onCredit && !disabled && (
                          <div className="text-[10px] text-amber-400 font-medium">
                            Thiếu tiền mặt · Có thể vay để thực hiện
                          </div>
                        )}
                        {worldBlocked && (
                          <div className="text-[10px] text-rose-400 font-medium">Tạm khóa do thời cuộc loạn lạc</div>
                        )}
                        {cd > 0 && (
                          <div className="text-[10px] text-sky-400 font-mono">
                            {act.isRental ? `Đang thuê · Hết hạn sau ${cd} ngày` : `Chờ ${cd} ngày`}
                          </div>
                        )}
                      </button>
                    );
                  };

                  return (
                    <>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {!isInPrison && (life.activeCareer || life.activeVenture) && (
                          <button
                            type="button"
                            onClick={() => openCareerModal('current')}
                            className="sm:col-span-2 text-left p-2.5 rounded-lg bg-emerald-950/30 hover:bg-emerald-950/50 border border-emerald-700/60 transition cursor-pointer flex items-center justify-between gap-3"
                          >
                            <div>
                              <div className="text-xs font-semibold text-emerald-200">
                                Công việc hiện tại:{' '}
                                {life.activeCareer
                                  ? CAREER_CATALOG.find((j) => j.id === life.activeCareer!.jobId)?.title
                                  : VENTURE_CATALOG.find((v) => v.id === life.activeVenture!.ventureId)?.title}
                              </div>
                              <div className="text-[11px] text-stone-400">
                                Bấm để học nâng cao chuyên môn, xin thăng tiến hoặc nghỉ việc
                              </div>
                            </div>
                            <span className="text-[11px] font-semibold text-emerald-300 shrink-0">Quản lý →</span>
                          </button>
                        )}

                        {recommendedSpendActions.map(renderActionCard)}
                      </div>

                      {!isInPrison && (
                        <>
                          {/* Tier 3: Xem thêm (Collapsible by default - 1in8b pattern) */}
                          <div className="border border-stone-800 rounded-xl bg-stone-950/40 mt-4">
                            <button
                              type="button"
                              onClick={() => setShowMoreSpendActions((v) => !v)}
                              className="w-full flex items-center justify-between px-4 py-2.5 text-left cursor-pointer hover:bg-stone-900/60 transition rounded-xl"
                            >
                              <span className="text-xs font-semibold text-stone-200">
                                Xem thêm ({moreSpendActions.length + 2} mục · Gạo &amp; Vàng · Gia thất · Vay nóng)
                              </span>
                              <span className="text-[11px] text-sky-400 font-medium">
                                {showMoreSpendActions ? 'Thu gọn' : 'Mở rộng'}
                              </span>
                            </button>

                            {showMoreSpendActions && (
                              <div className="px-4 pb-4 pt-2 border-t border-stone-800 space-y-4">
                                {moreSpendActions.length > 0 && (
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    {moreSpendActions.map(renderActionCard)}
                                  </div>
                                )}

                    {/* Gia thất & Con cái */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {(() => {
                        const m = canMarrySpouse(life);
                        const c = canHaveChild(life);
                        return (
                          <>
                            <button
                              type="button"
                              disabled={!m.ok}
                              onClick={marrySpouseAction}
                              className="text-left p-2.5 rounded-lg bg-rose-950/30 hover:bg-rose-950/50 border border-rose-800/40 disabled:opacity-45 disabled:cursor-not-allowed cursor-pointer"
                            >
                              <div className="flex justify-between text-xs font-semibold text-rose-200">
                                <span>Thành gia lập thất</span>
                                <span className="font-mono text-amber-300">{formatCopper(m.cost)}</span>
                              </div>
                              <div className="text-[10px] text-stone-400 mt-0.5">
                                {m.ok ? 'Cưới vợ / gả chồng, +14 Hạnh phúc' : m.reason}
                              </div>
                            </button>
                            <button
                              type="button"
                              disabled={!c.ok}
                              onClick={haveChildAction}
                              className="text-left p-2.5 rounded-lg bg-emerald-950/30 hover:bg-emerald-950/50 border border-emerald-800/40 disabled:opacity-45 disabled:cursor-not-allowed cursor-pointer"
                            >
                              <div className="flex justify-between text-xs font-semibold text-emerald-200">
                                <span>Sinh con nối dõi</span>
                                <span className="font-mono text-amber-300">150đ</span>
                              </div>
                              <div className="text-[10px] text-stone-400 mt-0.5">
                                {c.ok ? 'Thêm thành viên mới, +15 Hạnh phúc' : c.reason}
                              </div>
                            </button>
                          </>
                        );
                      })()}
                    </div>

                    {/* Giao dịch Gạo & Vàng tích trữ */}
                    <div className="p-3 rounded-lg bg-stone-950/60 border border-stone-800 space-y-2">
                      <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                        <span className="font-semibold text-amber-200">Chợ Gạo &amp; Đổi Vàng tích trữ</span>
                        <span className="font-mono text-[11px] text-stone-400">
                          Giá lúa: {life.world.ricePriceInCopper}đ/đấu · Vàng giữ: {formatCopper(life.assets.goldReserveCopper ?? 0)}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2 text-[11px]">
                        <button
                          type="button"
                          disabled={life.assets.wealthCopper < life.world.ricePriceInCopper * 10}
                          onClick={() => buyRice(10)}
                          className="px-2.5 py-1 rounded bg-stone-900 hover:bg-stone-800 disabled:opacity-40 border border-stone-700 text-emerald-300 cursor-pointer"
                        >
                          Mua 10 đấu gạo (-{life.world.ricePriceInCopper * 10}đ)
                        </button>
                        <button
                          type="button"
                          disabled={life.assets.rice < 10}
                          onClick={() => sellRice(10)}
                          className="px-2.5 py-1 rounded bg-stone-900 hover:bg-stone-800 disabled:opacity-40 border border-stone-700 text-amber-300 cursor-pointer"
                        >
                          Bán 10 đấu gạo
                        </button>
                        <button
                          type="button"
                          disabled={life.assets.wealthCopper < 1000}
                          onClick={() => buyGold(1000)}
                          className="px-2.5 py-1 rounded bg-stone-900 hover:bg-stone-800 disabled:opacity-40 border border-stone-700 text-sky-300 cursor-pointer"
                        >
                          Tích 1 Bạc vàng
                        </button>
                        <button
                          type="button"
                          disabled={(life.assets.goldReserveCopper ?? 0) < 1000}
                          onClick={() => sellGold(1000)}
                          className="px-2.5 py-1 rounded bg-stone-900 hover:bg-stone-800 disabled:opacity-40 border border-stone-700 text-amber-200 cursor-pointer"
                        >
                          Đổi 1 Bạc ra tiền
                        </button>
                      </div>
                    </div>

                    {/* Vay nóng địa chủ (khi túng quẫn) */}
                    <div className="pt-2 border-t border-stone-800 flex items-center justify-between gap-3">
                      <div className="text-[11px] text-stone-400">
                        <span className="font-semibold text-rose-400">Vay nóng Địa chủ:</span> Nhận 500đ khi túng quẫn (trả lãi 60% sau 180 ngày).
                      </div>
                      <button
                        type="button"
                        disabled={isInDebt}
                        onClick={takeEmergencyLoan}
                        className="shrink-0 px-3 py-1.5 rounded-lg bg-rose-950/70 hover:bg-rose-900/70 disabled:opacity-40 border border-rose-700/50 text-rose-100 text-xs font-semibold cursor-pointer"
                      >
                        {isInDebt ? 'Đang mang nợ' : 'Vay +500đ'}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Tier 4: Lối sống & Tự động (Collapsible by default) */}
              <div className="border border-stone-800 rounded-xl bg-stone-950/50">
                <button
                  type="button"
                  onClick={() => setShowLifestyleDetails((v) => !v)}
                  className="w-full flex items-center justify-between px-4 py-2.5 text-left cursor-pointer hover:bg-stone-900/60 transition rounded-xl"
                >
                  <div className="flex items-center gap-2 text-xs">
                    <span className="font-semibold text-amber-300">Lối sống &amp; Tự động hằng năm</span>
                    <span className="text-stone-400">
                      · {LIFESTYLE_OPTIONS.find((o) => o.value === life.schedule.lifestyle)?.label}
                    </span>
                  </div>
                  <span className="text-[11px] text-sky-400 font-medium">
                    {showLifestyleDetails ? 'Thu gọn' : 'Tùy chỉnh'}
                  </span>
                </button>

                {showLifestyleDetails && (
                  <div className="px-4 pb-4 pt-2 border-t border-stone-800 space-y-3">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-medium text-stone-300">Mức sống hàng ngày</label>
                        <label className="flex items-center gap-1.5 text-[11px] text-stone-400 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={life.schedule.autoBuyRice}
                            onChange={(e) => setAutoBuyRice(e.target.checked)}
                            className="accent-amber-500"
                          />
                          Tự động mua gạo khi thiếu
                        </label>
                      </div>
                      <select
                        value={life.schedule.lifestyle}
                        onChange={(e) => setLifestyle(e.target.value as LifestyleTier)}
                        className="w-full px-2.5 py-2 rounded-lg bg-stone-950 border border-stone-700 text-xs text-stone-100"
                      >
                        {LIFESTYLE_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label} — {opt.desc}
                          </option>
                        ))}
                      </select>

                      <div>
                        <label className="block text-[11px] font-medium text-stone-400 mb-1">
                          Đầu tư tiền nhàn rỗi (Sinh lời hằng năm)
                        </label>
                        <select
                          value={life.investmentChannel ?? 'cash'}
                          onChange={(e) => setInvestmentChannel(e.target.value as InvestmentChannel)}
                          className="w-full px-2.5 py-1.5 rounded-lg bg-stone-950 border border-stone-700 text-xs text-stone-100"
                        >
                          <option value="cash">Giữ tiền mặt (0%/năm · Thanh khoản tuyệt đối)</option>
                          <option value="bank">Gửi tiền trang (~1.5%/năm · An toàn)</option>
                          <option value="guild">Hùn vốn thương hội (~3.5%/năm · Ổn định)</option>
                          <option value="land_fund">Quỹ điền sản (~4.0%/năm · Dài hạn)</option>
                          <option value="caravan">Buôn chuyến đường dài (-2% đến +9%/năm · Rủi ro)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-medium text-stone-400 mb-1">
                          Tiền hiếu hỉ (ma chay, cưới hỏi họ hàng)
                        </label>
                        <select
                          value={life.schedule.giftEtiquette ?? 'tuy_kha_nang'}
                          onChange={(e) => setGiftEtiquette(e.target.value as GiftEtiquetteTier)}
                          className="w-full px-2.5 py-1.5 rounded-lg bg-stone-950 border border-stone-700 text-xs text-stone-100"
                        >
                          {GIFT_ETIQUETTE_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label} — {opt.desc}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Auto-Pause Toggles */}
                    <div className="pt-2 border-t border-stone-800 space-y-1.5">
                      <div className="text-[11px] text-stone-400">
                        Tự động dừng khi chạy tua nhanh:
                      </div>
                      <div className="flex flex-wrap gap-3 text-[11px] text-stone-400">
                        <label className="flex items-center gap-1 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={autoPauseConfig.pauseOnBirthday}
                            onChange={(e) => setAutoPauseConfig({ pauseOnBirthday: e.target.checked })}
                            className="accent-amber-500"
                          />
                          Dừng khi sinh nhật
                        </label>
                        <label className="flex items-center gap-1 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={autoPauseConfig.pauseOnLowHealth}
                            onChange={(e) => setAutoPauseConfig({ pauseOnLowHealth: e.target.checked })}
                            className="accent-amber-500"
                          />
                          Dừng khi HP &lt; 20%
                        </label>
                        <label className="flex items-center gap-1 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={autoPauseConfig.pauseOnNoFood}
                            onChange={(e) => setAutoPauseConfig({ pauseOnNoFood: e.target.checked })}
                            className="accent-amber-500"
                          />
                          Dừng khi hết gạo
                        </label>
                      </div>
                    </div>

                    {/* Tự động hằng năm */}
                    <div className="pt-2 border-t border-stone-800 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold uppercase tracking-wider text-stone-300">Tự động hằng năm</span>
                        <span className="text-[11px] text-stone-500">Chỉ chạy khi tiền mặt &gt; 3× chi phí</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                        {AUTO_ACTION_CANDIDATES.map((actId) => {
                          const def = INSTANT_ADULT_ACTIONS.find((a) => a.id === actId);
                          if (!def) return null;
                          const checked = (life.autoActions ?? []).includes(actId);
                          return (
                            <label
                              key={actId}
                              className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-stone-950/60 border border-stone-800 text-[11px] text-stone-300 cursor-pointer hover:border-stone-700"
                            >
                              <input
                                type="checkbox"
                                checked={checked}
                                onChange={() => toggleAutoAction(actId)}
                                className="accent-sky-500"
                              />
                              <span className="truncate">{def.title}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </div>
                        </>
                      )}
                    </>
                  );
                })()}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-5 py-2.5 border-t border-stone-800 bg-stone-950/60 flex justify-end">
              <button
                type="button"
                onClick={() => setShowActionModal(false)}
                className="px-4 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-xs font-semibold text-stone-200 cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
  );
}
