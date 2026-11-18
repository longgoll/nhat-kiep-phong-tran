import { useState } from 'react';
import { GraduationCap, Store, Landmark, Flame } from 'lucide-react';
import { formatCopper } from '../engine/economy';
import {
  appointOrPromoteOfficial,
  buyOfficialTitle,
  buyProperty,
  contributeRebellionTreasury,
  getExamEligibility,
  getRebellionSuccessChance,
  HOUSING_UPGRADES,
  launchRebellion,
  OFFICIAL_RANKS,
  PROPERTY_CATALOG,
  recruitRebellionArmy,
  takeExam,
  toggleCrossDress,
  upgradeHousing,
} from '../engine/progressionModules';
import { useActiveLifeStore } from '../stores/useActiveLifeStore';

export function ProgressionModules() {
  const life = useActiveLifeStore((s) => s.life);
  const applyLifeMutation = useActiveLifeStore((s) => s.applyLifeMutation);
  const [activeTab, setActiveTab] = useState<'exam' | 'trade' | 'court' | 'rebel' | null>('trade');

  if (!life) return null;

  const canExam = life.stats.education >= 10 || life.flags.includes('duoc_thay_do_quy');
  const canTrade = true;
  const canCourt =
    life.officialRank > 0 ||
    life.flags.includes('do_cu_nhan') ||
    life.flags.includes('do_tien_si');
  const canRebel = life.stats.fame >= 70 || life.stats.infamy >= 70;

  if (!canExam && !canTrade && !canCourt && !canRebel) {
    return null;
  }

  const huongElig = getExamEligibility(life, 'huong');
  const hoiElig = getExamEligibility(life, 'hoi');
  const dinhElig = getExamEligibility(life, 'dinh');
  const rebelChance = Math.round(getRebellionSuccessChance(life) * 100);

  return (
    <div className="bg-stone-900/75 border border-stone-800 rounded-xl p-4 space-y-3">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-stone-400">
        Sự Nghiệp · Sản Nghiệp
      </h3>

      {/* Module Selector Pills */}
      <div className="flex flex-wrap gap-2">
        {canExam && (
          <button
            type="button"
            onClick={() => setActiveTab(activeTab === 'exam' ? null : 'exam')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border cursor-pointer transition ${
              activeTab === 'exam'
                ? 'bg-emerald-950/60 border-emerald-500 text-emerald-200'
                : 'bg-stone-950 border-stone-700 text-stone-300 hover:border-stone-500'
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5" /> Khoa cử
          </button>
        )}
        {canTrade && (
          <button
            type="button"
            onClick={() => setActiveTab(activeTab === 'trade' ? null : 'trade')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border cursor-pointer transition ${
              activeTab === 'trade'
                ? 'bg-amber-950/60 border-amber-500 text-amber-200'
                : 'bg-stone-950 border-stone-700 text-stone-300 hover:border-stone-500'
            }`}
          >
            <Store className="w-3.5 h-3.5" /> Đầu tư &amp; Cho thuê
          </button>
        )}
        {canCourt && (
          <button
            type="button"
            onClick={() => setActiveTab(activeTab === 'court' ? null : 'court')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border cursor-pointer transition ${
              activeTab === 'court'
                ? 'bg-sky-950/60 border-sky-500 text-sky-200'
                : 'bg-stone-950 border-stone-700 text-stone-300 hover:border-stone-500'
            }`}
          >
            <Landmark className="w-3.5 h-3.5" /> Công đường
          </button>
        )}
        {canRebel && (
          <button
            type="button"
            onClick={() => setActiveTab(activeTab === 'rebel' ? null : 'rebel')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border cursor-pointer transition ${
              activeTab === 'rebel'
                ? 'bg-rose-950/60 border-rose-500 text-rose-200'
                : 'bg-stone-950 border-stone-700 text-stone-300 hover:border-stone-500'
            }`}
          >
            <Flame className="w-3.5 h-3.5" /> Mật thất Khởi nghĩa
          </button>
        )}
      </div>

      {/* KHOA CỬ PANEL */}
      {activeTab === 'exam' && (
        <div className="p-3 rounded-lg bg-stone-950/80 border border-stone-800 space-y-2.5 text-xs">
          {life.profile.gender === 'female' &&
            !life.flags.includes('nu_cai_nam_trang') &&
            !life.flags.includes('nu_quan_dac_xa') && (
              <div className="flex items-center justify-between gap-2 p-2 rounded bg-amber-950/30 border border-amber-700/40">
                <span className="text-amber-200">
                  Nữ giới muốn dự thi cần cải nam trang (rủi ro bại lộ tăng dần).
                </span>
                <button
                  type="button"
                  disabled={life.stats.education < 15}
                  onClick={() => applyLifeMutation(toggleCrossDress)}
                  className="px-2.5 py-1 rounded bg-amber-600 text-stone-950 font-bold shrink-0 cursor-pointer disabled:opacity-40"
                >
                  Cải nam trang
                </button>
              </div>
            )}

          {life.flags.includes('nu_cai_nam_trang') && (
            <div className="text-rose-300">
              Rủi ro bại lộ thân phận nữ nhi hiện tại: <strong>{life.exposureRisk}% / năm</strong>
            </div>
          )}

          <div className="grid gap-2">
            <button
              type="button"
              disabled={!huongElig.ok}
              onClick={() => applyLifeMutation((s) => takeExam(s, 'huong'))}
              className="w-full text-left p-2.5 rounded bg-stone-900 border border-stone-700 hover:border-emerald-500 disabled:opacity-45 cursor-pointer"
            >
              <div className="font-semibold text-emerald-300">Ứng thí Thi Hương (-200đ)</div>
              <div className="text-[11px] text-stone-400">
                {huongElig.ok ? 'Đủ điều kiện ứng thí ngay!' : huongElig.reason}
              </div>
            </button>

            <button
              type="button"
              disabled={!hoiElig.ok}
              onClick={() => applyLifeMutation((s) => takeExam(s, 'hoi'))}
              className="w-full text-left p-2.5 rounded bg-stone-900 border border-stone-700 hover:border-emerald-500 disabled:opacity-45 cursor-pointer"
            >
              <div className="font-semibold text-emerald-300">Ứng thí Thi Hội (-1.000đ)</div>
              <div className="text-[11px] text-stone-400">
                {hoiElig.ok ? 'Đủ điều kiện vào trường thi Kinh đô!' : hoiElig.reason}
              </div>
            </button>

            <button
              type="button"
              disabled={!dinhElig.ok}
              onClick={() => applyLifeMutation((s) => takeExam(s, 'dinh'))}
              className="w-full text-left p-2.5 rounded bg-stone-900 border border-stone-700 hover:border-emerald-500 disabled:opacity-45 cursor-pointer"
            >
              <div className="font-semibold text-emerald-300">Vào Điện thí Thi Đình</div>
              <div className="text-[11px] text-stone-400">
                {dinhElig.ok ? 'Hoàng thượng đang chờ ngự thí!' : dinhElig.reason}
              </div>
            </button>
          </div>
        </div>
      )}

      {/* THƯƠNG HỘI & ĐIỀN SẢN PANEL */}
      {activeTab === 'trade' && (
        <div className="p-3 rounded-lg bg-stone-950/80 border border-stone-800 space-y-3 text-xs">
          <div className="space-y-1.5">
            <div className="font-semibold text-amber-200">Tậu Điền Sản & Cửa Hiệu (Thu nhập mỗi mùa)</div>
            {PROPERTY_CATALOG.map((prop) => {
              const owned = life.assets.properties.includes(prop.id);
              return (
                <div
                  key={prop.id}
                  className="flex items-center justify-between gap-2 p-2 rounded bg-stone-900 border border-stone-800"
                >
                  <div>
                    <div className="font-medium text-stone-200">{prop.name}</div>
                    <div className="text-[11px] text-stone-400">{prop.description}</div>
                  </div>
                  <button
                    type="button"
                    disabled={owned || life.assets.wealthCopper < prop.costCopper}
                    onClick={() => applyLifeMutation((s) => buyProperty(s, prop.id))}
                    className="px-2.5 py-1.5 rounded bg-amber-600 text-stone-950 font-bold shrink-0 disabled:opacity-40 cursor-pointer"
                  >
                    {owned ? 'Đã sở hữu' : formatCopper(prop.costCopper)}
                  </button>
                </div>
              );
            })}
          </div>

          <div className="space-y-1.5 pt-2 border-t border-stone-800">
            <div className="font-semibold text-amber-200">Nâng cấp chỗ ở ({life.assets.housing})</div>
            <div className="flex flex-wrap gap-2">
              {HOUSING_UPGRADES.map((h) => (
                <button
                  key={h.tier}
                  type="button"
                  disabled={life.assets.housing === h.tier || life.assets.wealthCopper < h.cost}
                  onClick={() => applyLifeMutation((s) => upgradeHousing(s, h.tier))}
                  className="px-2.5 py-1.5 rounded bg-stone-800 hover:bg-stone-700 disabled:opacity-40 text-stone-200 cursor-pointer"
                >
                  {h.label} ({formatCopper(h.cost)})
                </button>
              ))}
            </div>
          </div>

          {life.officialRank === 0 && (
            <div className="pt-2 border-t border-stone-800 flex items-center justify-between gap-2">
              <span className="text-stone-300">Quyên quan (Mua hàm Tri huyện bằng bạc)</span>
              <button
                type="button"
                disabled={life.assets.wealthCopper < 50000}
                onClick={() => applyLifeMutation(buyOfficialTitle)}
                className="px-3 py-1.5 rounded bg-amber-600 text-stone-950 font-bold disabled:opacity-40 cursor-pointer"
              >
                5 Vàng (50.000đ)
              </button>
            </div>
          )}
        </div>
      )}

      {/* CÔNG ĐƯỜNG PANEL */}
      {activeTab === 'court' && (
        <div className="p-3 rounded-lg bg-stone-950/80 border border-stone-800 space-y-2.5 text-xs">
          <div>
            Chức vị hiện tại:{' '}
            <strong className="text-sky-300">{OFFICIAL_RANKS[life.officialRank]}</strong>
          </div>
          {life.officialRank < 5 && (
            <button
              type="button"
              disabled={
                life.officialRank > 0 && life.stats.fame < life.officialRank * 25
              }
              onClick={() => applyLifeMutation(appointOrPromoteOfficial)}
              className="w-full py-2 rounded bg-sky-600 hover:bg-sky-500 disabled:opacity-40 text-stone-950 font-bold cursor-pointer"
            >
              {life.officialRank === 0
                ? 'Xin triều đình bổ nhiệm làm quan'
                : `Thăng chức lên ${OFFICIAL_RANKS[life.officialRank + 1]} (Cần Thanh danh >= ${life.officialRank * 25})`}
            </button>
          )}
        </div>
      )}

      {/* MẬT THẤT KHỞI NGHĨA PANEL */}
      {activeTab === 'rebel' && (
        <div className="p-3 rounded-lg bg-stone-950/80 border border-rose-900/50 space-y-3 text-xs">
          <div className="grid grid-cols-2 gap-2">
            <div className="p-2 rounded bg-stone-900 border border-stone-800">
              <div className="text-stone-400">Ngân khố mật thất</div>
              <div className="font-mono text-amber-300 font-bold">
                {formatCopper(life.rebellion?.treasuryCopper ?? 0)} / 10 Vàng
              </div>
            </div>
            <div className="p-2 rounded bg-stone-900 border border-stone-800">
              <div className="text-stone-400">Binh quyền & Tử sĩ</div>
              <div className="font-mono text-rose-300 font-bold">
                {life.rebellion?.armyPower ?? 0} / 100
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={life.assets.wealthCopper < 5000}
              onClick={() => applyLifeMutation((s) => contributeRebellionTreasury(s, 5000))}
              className="px-3 py-1.5 rounded bg-stone-800 hover:bg-stone-700 disabled:opacity-40 cursor-pointer"
            >
              Góp 5.000đ vào mật thất
            </button>
            <button
              type="button"
              disabled={(life.rebellion?.treasuryCopper ?? 0) < 2000}
              onClick={() => applyLifeMutation(recruitRebellionArmy)}
              className="px-3 py-1.5 rounded bg-stone-800 hover:bg-stone-700 disabled:opacity-40 cursor-pointer"
            >
              Chiêu mộ tử sĩ (-2.000đ kho, +20 Binh quyền)
            </button>
          </div>

          <button
            type="button"
            onClick={() => applyLifeMutation(launchRebellion)}
            className="w-full py-2.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold cursor-pointer"
          >
            Phất Cờ Khởi Nghĩa! (Tỷ lệ thành công ước tính: {rebelChance}%)
          </button>
        </div>
      )}
    </div>
  );
}
