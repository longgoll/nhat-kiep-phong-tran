import type { ActiveLifeState } from '../../types/activeLife';
import { formatCopper } from '../../engine/economy';
import { getWorldStateLabel } from '../../engine/daySimulator';
import {
  COMMERCIAL_PROPERTY_IDS,
  checkHousingTiemLe,
  checkOfficialPropertyRule,
} from '../../engine/officialSystem';
import {
  HOUSING_ORDER,
  HOUSING_UPGRADES,
  buyOfficialTitle,
  buyProperty,
  canBuyOfficialTitle,
  getHousingMarketCost,
  getPropertyMarketCost,
  getPropertySeasonalIncome,
  getPropertySeasonalSocial,
  getVisibleProperties,
  sellProperty,
  upgradeHousing,
} from '../../engine/progressionModules';

export function GuildAndPropertyPanel({
  life,
  applyLifeMutation,
}: {
  life: ActiveLifeState;
  applyLifeMutation: (fn: (s: ActiveLifeState) => ActiveLifeState) => void;
}) {
  const visibleProperties = getVisibleProperties(life);

  return (
        <div className="p-3 rounded-lg bg-stone-950/80 border border-stone-800 space-y-3 text-xs">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="font-semibold text-amber-200">
                {life.officialRank > 0
                  ? 'Điền Sản & Cơ Sở Công Ích (Thu mỗi mùa)'
                  : 'Tậu Điền Sản & Cửa Hiệu (Mua nhiều · Thu mỗi mùa)'}
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded bg-stone-800 text-stone-300">
                Thời thế: {getWorldStateLabel(life.world.worldState)}
              </span>
            </div>
            {life.officialRank > 0 && (
              <div className="p-2 rounded bg-sky-950/30 border border-sky-800/60 text-[11px] text-sky-200">
                <strong>Luật Quan trường:</strong> Cấm quan đương chức trực tiếp buôn bán ("Dữ dân tranh lợi"), các sản nghiệp thương mại đã được ẩn khỏi danh mục mua mới. Điền sản chịu giới hạn <em>Hạn điền</em> theo phẩm hàm.
              </div>
            )}
            {visibleProperties.map((prop) => {
              const ownedCount = life.assets.properties.filter((id) => id === prop.id).length;
              const marketCost = getPropertyMarketCost(prop, life.world.worldState);
              const seasonIncome = getPropertySeasonalIncome(prop, life.world.worldState, life.stats.craftTrade);
              const social = getPropertySeasonalSocial(prop);
              const sellValue = Math.round(marketCost * 0.7);
              const isCommercial = life.officialRank > 0 && COMMERCIAL_PROPERTY_IDS.has(prop.id);
              const effectiveCost = isCommercial ? Math.round(marketCost * 1.15) : marketCost;
              const propRule = checkOfficialPropertyRule(life, prop.id, isCommercial);
              return (
                <div
                  key={prop.id}
                  className="flex items-center justify-between gap-2 p-2 rounded bg-stone-900 border border-stone-800"
                >
                  <div className="min-w-0">
                    <div className="font-medium text-stone-200 flex items-center gap-1.5">
                      <span>{prop.name}</span>
                      {ownedCount > 0 && (
                        <span className="px-1.5 py-0.5 rounded bg-emerald-950/80 border border-emerald-700/50 text-emerald-300 text-[10px] font-mono">
                          x{ownedCount}
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-stone-400">
                      {prop.description} · Thu mùa này:{' '}
                      <span className="text-emerald-300 font-mono">
                        +{formatCopper(isCommercial ? Math.round(seasonIncome * 0.7) : seasonIncome)}
                      </span>
                      {social.fame > 0 && (
                        <span className="text-amber-300 font-mono"> · Thanh danh +{social.fame}</span>
                      )}
                      {social.relationships > 0 && (
                        <span className="text-sky-300 font-mono"> · Quan hệ +{social.relationships}</span>
                      )}
                    </div>
                    {!propRule.allowed && propRule.reason && (
                      <div className="text-[10px] text-rose-400 mt-0.5">{propRule.reason}</div>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    {ownedCount > 0 && (
                      <button
                        type="button"
                        onClick={() => applyLifeMutation((s) => sellProperty(s, prop.id))}
                        className="px-2 py-1.5 rounded bg-stone-800 hover:bg-rose-950/70 border border-stone-700 hover:border-rose-700 text-rose-300 text-[11px] font-semibold cursor-pointer"
                        title={`Bán lại 1 ${prop.name} (+${formatCopper(sellValue)})`}
                      >
                        Bán +{formatCopper(sellValue)}
                      </button>
                    )}
                    <button
                      type="button"
                      disabled={!propRule.allowed || life.assets.wealthCopper < effectiveCost}
                      onClick={() => applyLifeMutation((s) => buyProperty(s, prop.id, isCommercial))}
                      className={`px-2.5 py-1.5 rounded font-bold disabled:opacity-40 cursor-pointer ${
                        isCommercial
                          ? 'bg-rose-700 hover:bg-rose-600 text-white'
                          : 'bg-amber-600 hover:bg-amber-500 text-stone-950'
                      }`}
                    >
                      {isCommercial ? `Đứng tên ngầm ${formatCopper(effectiveCost)}` : `Mua ${formatCopper(effectiveCost)}`}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="space-y-1.5 pt-2 border-t border-stone-800">
            <div className="font-semibold text-amber-200">Nâng cấp chỗ ở</div>
            <div className="flex flex-wrap gap-2">
              {HOUSING_UPGRADES.map((h) => {
                const currentRank = HOUSING_ORDER[life.assets.housing];
                const targetRank = HOUSING_ORDER[h.tier];
                const isCurrentOrLower = targetRank <= currentRank;
                const tiemLe = checkHousingTiemLe(life, h.tier);
                const cost = getHousingMarketCost(h.tier, life.world.worldState);
                return (
                  <button
                    key={h.tier}
                    type="button"
                    title={tiemLe.reason}
                    disabled={isCurrentOrLower || !tiemLe.allowed || life.assets.wealthCopper < cost}
                    onClick={() => applyLifeMutation((s) => upgradeHousing(s, h.tier))}
                    className="px-2.5 py-1.5 rounded bg-stone-800 hover:bg-stone-700 disabled:opacity-40 text-stone-200 cursor-pointer"
                  >
                    {life.assets.housing === h.tier
                      ? `${h.label} (Đang ở)`
                      : targetRank < currentRank
                        ? `${h.label} (Đã vượt cấp)`
                        : !tiemLe.allowed
                          ? `${h.label} (Cấm Tiếm lễ)`
                          : `${h.label} (${formatCopper(cost)})`}
                  </button>
                );
              })}
            </div>
          </div>

          {life.officialRank === 0 && life.profile.originClass !== 'hoang_toc' && (() => {
            const buyTitleElig = canBuyOfficialTitle(life);
            return (
              <div className="pt-2 border-t border-stone-800 flex items-center justify-between gap-2">
                <div>
                  <div className="text-stone-300">Quyên quan (Mua Cửu phẩm hư hàm bằng bạc)</div>
                  {!buyTitleElig.ok && buyTitleElig.reason && (
                    <div className="text-[11px] text-stone-500">{buyTitleElig.reason}</div>
                  )}
                </div>
                <button
                  type="button"
                  disabled={!buyTitleElig.ok}
                  onClick={() => applyLifeMutation(buyOfficialTitle)}
                  className="px-3 py-1.5 rounded bg-amber-600 text-stone-950 font-bold disabled:opacity-40 cursor-pointer shrink-0"
                >
                  15 Vàng (150.000đ)
                </button>
              </div>
            );
          })()}
        </div>
  );
}
