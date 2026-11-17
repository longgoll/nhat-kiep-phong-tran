import { Dices, Play, ScrollText, Users, Sparkles } from 'lucide-react';
import type { FamilyLivingTier, HousingTier } from '../types/activeLife';
import { formatCopper } from '../engine/economy';
import { FAMILY_TIER_LABELS, ORIGIN_METADATA } from '../engine/lifeInitializer';
import { useActiveLifeStore } from '../stores/useActiveLifeStore';
import { getThemeWrapperClass, useLegacyArchiveStore } from '../stores/useLegacyArchiveStore';
import { ColorModeToggle } from './ColorModeToggle';

const HOUSING_LABELS: Record<HousingTier, string> = {
  gam_cau: 'Gầm cầu / Lều tạm',
  nha_tranh: 'Nhà tranh vách đất',
  nha_gach: 'Nhà gạch khang trang',
  phu_de: 'Phủ đệ / Cung cấm',
};

const TIER_DOTS: Record<FamilyLivingTier, number> = {
  tung_thieu: 1,
  du_an: 2,
  kha_gia: 3,
  sung_tuc: 4,
  hoang_gia: 5,
};

function LivingTierDots({ tier }: { tier: FamilyLivingTier }) {
  const count = TIER_DOTS[tier] ?? 1;
  return (
    <span className="inline-flex items-center gap-1 mr-1.5" aria-hidden="true">
      {[1, 2, 3, 4, 5].map((idx) => (
        <span
          key={idx}
          className={`inline-block w-2 h-2 rounded-full ${
            idx <= count ? 'bg-amber-400' : 'bg-stone-700'
          }`}
        />
      ))}
    </span>
  );
}

export function BirthCertificateView() {
  const life = useActiveLifeStore((s) => s.life);
  const confirmBirthCertificate = useActiveLifeStore((s) => s.confirmBirthCertificate);
  const startNewLife = useActiveLifeStore((s) => s.startNewLife);
  const activeTheme = useLegacyArchiveStore((s) => s.activeTheme);
  const colorMode = useLegacyArchiveStore((s) => s.colorMode ?? 'dark');
  const themeClass = getThemeWrapperClass(activeTheme, colorMode);

  if (!life) return null;

  const originMeta = ORIGIN_METADATA[life.profile.originClass];
  const family = life.family;
  const fatherNpc = life.npcs.find((n) => n.id === 'npc_father');
  const fatherAlive = fatherNpc?.isAlive !== false;
  const peers = life.cohortPeers ?? [];

  const birthPlace = family?.birthPlace ?? 'Làng quê Đại Việt';
  const fatherAge = family?.fatherAgeAtBirth ?? 28;
  const motherAge = family?.motherAgeAtBirth ?? 24;
  const familyTier = family?.familyLivingTier ?? 'tung_thieu';

  return (
    <div className={`min-h-screen ${themeClass} flex items-center justify-center p-4 sm:p-8`}>
      <div className="max-w-3xl w-full bg-stone-900/90 border border-stone-800 rounded-xl overflow-hidden shadow-2xl">
        {/* Top Imperial Header */}
        <div className="bg-gradient-to-r from-rose-900 via-amber-800 to-rose-900 px-5 py-2.5 flex items-center justify-between text-xs font-semibold tracking-wider text-amber-100 uppercase">
          <span className="flex items-center gap-2">
            <ScrollText className="w-4 h-4 text-amber-300" />
            Sổ Bộ Triều Đình • Tờ Khai Sinh
          </span>
          <span className="font-mono text-amber-200/90">Số hiệu: NK-{life.seed}</span>
        </div>

        <div className="p-5 sm:p-7 space-y-6">
          {/* Name & Narrative Intro */}
          <div className="space-y-2 border-b border-stone-800 pb-5">
            <div className="flex items-center justify-between gap-2">
              <div className="text-[11px] uppercase tracking-widest text-stone-400">Họ và Tên</div>
              <ColorModeToggle compact />
            </div>
            <h1 className="text-3xl sm:text-4xl font-serif font-bold text-amber-100 tracking-tight">
              {life.profile.fullName}
            </h1>
            <p className="text-sm text-stone-300 leading-relaxed pt-1">
              Triều <strong className="text-amber-200">{life.world.dynastyName}</strong> năm thứ{' '}
              {life.world.yearInEra}, bạn cất tiếng khóc chào đời tại{' '}
              <strong className="text-stone-100">{birthPlace}</strong> trong một gia đình{' '}
              <strong className="text-amber-200">{originMeta.label.toLowerCase()}</strong>. Bạn là{' '}
              <strong className="text-stone-100">{family?.birthOrderLabel.toLowerCase() ?? 'con một'}</strong>.{' '}
              {family?.circumstanceLabel}.
            </p>
            <p className="text-xs text-stone-400">
              {originMeta.summary} Tuy nhiên: <span className="text-rose-300/90">{originMeta.riskSummary}</span>
            </p>
          </div>

          {/* 3-Column Structured Facts Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-6 gap-y-4 text-xs">
            <div>
              <div className="text-[10px] uppercase tracking-wider text-stone-500">Giới tính</div>
              <div className="font-semibold text-stone-100 mt-0.5">
                {life.profile.gender === 'male' ? 'Nam' : 'Nữ'}
              </div>
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-wider text-stone-500">Triều đại & Niên hiệu</div>
              <div className="font-semibold text-stone-100 mt-0.5">
                {life.world.dynastyName} • Năm thứ {life.world.yearInEra}
              </div>
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-wider text-stone-500">Nơi sinh</div>
              <div className="font-semibold text-stone-100 mt-0.5">{birthPlace}</div>
            </div>

            <div>
              <div className="text-[10px] uppercase tracking-wider text-stone-500">Xuất thân gia đình</div>
              <div className="font-semibold text-amber-200 mt-0.5">{originMeta.label}</div>
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-wider text-stone-500">Gia sản & Mức sống</div>
              <div className="font-semibold text-stone-100 mt-0.5 flex items-center flex-wrap">
                <LivingTierDots tier={familyTier} />
                <span>{FAMILY_TIER_LABELS[familyTier]}</span>
                {family && (
                  <span className="text-stone-400 font-normal ml-1">
                    ({formatCopper(family.familyWealthCopper)})
                  </span>
                )}
              </div>
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-wider text-stone-500">Tuổi cha mẹ lúc sinh</div>
              <div className="font-semibold text-stone-100 mt-0.5">
                Mẹ {motherAge} tuổi • Cha {fatherAge} tuổi{!fatherAlive ? ' (đã mất)' : ''}
              </div>
            </div>

            <div>
              <div className="text-[10px] uppercase tracking-wider text-stone-500">Nghề của cha</div>
              <div className="font-semibold text-stone-100 mt-0.5">
                {family?.fatherOccupationLabel ?? 'Không rõ'}
                {!fatherAlive && <span className="text-rose-400 ml-1">(Đã mất)</span>}
              </div>
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-wider text-stone-500">Nghề của mẹ</div>
              <div className="font-semibold text-stone-100 mt-0.5">
                {family?.motherOccupationLabel ?? 'Nội trợ'}
              </div>
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-wider text-stone-500">Nhà cửa gia đình</div>
              <div className="font-semibold text-stone-100 mt-0.5">
                {HOUSING_LABELS[life.assets.housing]}
              </div>
            </div>

            <div>
              <div className="text-[10px] uppercase tracking-wider text-stone-500">Tuổi thọ kỳ vọng</div>
              <div className="font-semibold text-stone-100 mt-0.5">{originMeta.expectedLifespan} tuổi</div>
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-wider text-stone-500">Rủi ro yểu mệnh (&lt;5 tuổi)</div>
              <div className="font-semibold text-rose-300 mt-0.5">{originMeta.childMortalityRate}</div>
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-wider text-stone-500">Thứ bậc trong nhà</div>
              <div className="font-semibold text-stone-100 mt-0.5">
                {family?.birthOrderLabel ?? 'Con một'} ({life.profile.currentRole})
              </div>
            </div>
          </div>

          {/* Demographic Callout Box */}
          <div className="rounded-lg bg-emerald-950/40 border border-emerald-800/60 px-4 py-3 text-xs text-emerald-200 flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span>
              Trong số 100 hài nhi chào đời cùng ngày dưới triều <strong>{life.world.dynastyName}</strong>, có{' '}
              <strong className="text-emerald-100">{originMeta.rateLabel}</strong> sinh ra trong{' '}
              <strong>{originMeta.label.toLowerCase()}</strong> giống như bạn. Mọi chỉ số khởi đầu và chức quan đều
              bắt đầu từ con số 0 — bạn vẫn phải tự đi qua tuổi thơ để lập thân.
            </span>
          </div>

          {/* Cohort Peers */}
          {peers.length > 0 && (
            <div className="space-y-2.5">
              <div className="text-[11px] uppercase tracking-wider text-stone-400 font-semibold flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-amber-400" />
                Những hài nhi chào đời cùng thời khắc trong thiên hạ
              </div>
              <div className="divide-y divide-stone-800/80 rounded-lg border border-stone-800 bg-stone-950/50">
                {peers.map((peer) => (
                  <div
                    key={peer.id}
                    className="px-3.5 py-2 flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs"
                  >
                    <span className="font-semibold text-stone-200">{peer.name}</span>
                    <span className="text-stone-400">
                      {peer.birthPlace} • {peer.gender === 'male' ? 'Nam' : 'Nữ'} •{' '}
                      <span className="text-amber-300/90">{peer.originLabel}</span>
                    </span>
                  </div>
                ))}
              </div>
              <p className="text-[11px] text-stone-500">
                Cuộc đời của những người đồng niên này cũng sẽ trôi qua song song bên cạnh hành trình của bạn.
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3 pt-2 border-t border-stone-800">
            <button
              type="button"
              onClick={() => startNewLife()}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-stone-800 hover:bg-stone-700 border border-stone-700 text-stone-200 text-sm font-semibold transition cursor-pointer"
            >
              <Dices className="w-4 h-4 text-amber-400" />
              Đầu thai lại
            </button>
            <button
              type="button"
              onClick={confirmBirthCertificate}
              className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg bg-rose-600 hover:bg-rose-500 active:bg-rose-700 text-white text-sm font-bold transition cursor-pointer shadow-lg shadow-rose-950/40"
            >
              <Play className="w-4 h-4" />
              Bắt đầu cuộc đời này
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
