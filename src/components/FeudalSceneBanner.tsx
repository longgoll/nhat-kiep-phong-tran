import type { HousingTier, Season, WorldState } from '../types/activeLife';
import { getSeasonLabel, getWorldStateLabel } from '../engine/daySimulator';

interface FeudalSceneBannerProps {
  housing: HousingTier;
  season: Season;
  worldState: WorldState;
  ageYears: number;
}

const HOUSING_LABELS: Record<HousingTier, string> = {
  gam_cau: 'Gầm cầu / Mái hiên tạm',
  nha_tranh: 'Nhà tranh vách đất',
  nha_gach: 'Nhà gạch khang trang',
  phu_de: 'Phủ đệ son thiếp',
};

const SKY_BY_SEASON: Record<Season, { from: string; to: string; accent: string }> = {
  spring: { from: '#1e293b', to: '#334155', accent: '#f472b6' },
  summer: { from: '#0c4a6e', to: '#1e3a8a', accent: '#fbbf24' },
  autumn: { from: '#451a03', to: '#78350f', accent: '#f59e0b' },
  winter: { from: '#0f172a', to: '#1e293b', accent: '#cbd5e1' },
};

export function FeudalSceneBanner({
  housing,
  season,
  worldState,
  ageYears,
}: FeudalSceneBannerProps) {
  const sky = SKY_BY_SEASON[season];

  return (
    <div className="relative rounded-xl overflow-hidden border border-stone-800 bg-stone-950">
      <svg viewBox="0 0 400 120" className="w-full h-28 sm:h-32 block">
        <defs>
          <linearGradient id="feudalSky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={sky.from} />
            <stop offset="100%" stopColor={sky.to} />
          </linearGradient>
        </defs>
        <rect width="400" height="120" fill="url(#feudalSky)" />

        {/* Moon / Sun */}
        <circle cx="340" cy="30" r="14" fill={sky.accent} opacity="0.85" />

        {/* Distant Mountains */}
        <path d="M0 95 L70 50 L145 95 Z" fill="#1c1917" opacity="0.55" />
        <path d="M100 95 L195 40 L290 95 Z" fill="#1c1917" opacity="0.7" />
        <path d="M240 95 L330 55 L400 95 Z" fill="#1c1917" opacity="0.55" />

        {/* Ground */}
        <rect x="0" y="92" width="400" height="28" fill="#1c1917" />

        {/* Housing silhouette */}
        {housing === 'nha_tranh' && (
          <g transform="translate(55, 52)">
            <polygon points="0,20 35,0 70,20" fill="#92400e" />
            <rect x="8" y="20" width="54" height="22" fill="#44403c" />
            <rect x="28" y="27" width="12" height="15" fill="#1c1917" />
          </g>
        )}
        {housing === 'nha_gach' && (
          <g transform="translate(50, 44)">
            <polygon points="-4,22 40,0 84,22" fill="#7f1d1d" />
            <rect x="6" y="22" width="68" height="28" fill="#57534e" />
            <rect x="18" y="29" width="10" height="10" fill="#fbbf24" opacity="0.7" />
            <rect x="35" y="30" width="12" height="20" fill="#292524" />
          </g>
        )}
        {housing === 'phu_de' && (
          <g transform="translate(38, 34)">
            <polygon points="0,24 55,0 110,24" fill="#991b1b" />
            <polygon points="15,14 55,-2 95,14" fill="#b45309" />
            <rect x="12" y="24" width="86" height="36" fill="#44403c" />
            <rect x="26" y="33" width="12" height="12" fill="#fbbf24" opacity="0.85" />
            <rect x="72" y="33" width="12" height="12" fill="#fbbf24" opacity="0.85" />
            <rect x="47" y="36" width="16" height="24" fill="#1c1917" />
          </g>
        )}
        {housing === 'gam_cau' && (
          <g transform="translate(40, 62)">
            <path d="M0 30 Q45 5 90 30" fill="none" stroke="#57534e" strokeWidth="6" />
            <circle cx="45" cy="24" r="3" fill="#f97316" />
          </g>
        )}

        {/* Seasonal particles */}
        {season === 'spring' && (
          <g fill="#f9a8d4" opacity="0.75">
            <circle cx="150" cy="28" r="2" />
            <circle cx="210" cy="48" r="2.2" />
            <circle cx="280" cy="24" r="1.8" />
            <circle cx="315" cy="60" r="2" />
          </g>
        )}
        {season === 'winter' && (
          <g fill="#e2e8f0" opacity="0.7">
            <circle cx="130" cy="22" r="1.8" />
            <circle cx="205" cy="38" r="2" />
            <circle cx="265" cy="18" r="1.5" />
            <circle cx="305" cy="52" r="2" />
          </g>
        )}

        {/* Character silhouette walking */}
        <g transform="translate(225, 72)">
          <circle cx="8" cy={ageYears < 6 ? 9 : 5} r={ageYears < 6 ? 3.5 : 4} fill="#fde68a" />
          <rect
            x="4"
            y={ageYears < 6 ? 12 : 9}
            width="8"
            height={ageYears < 6 ? 8 : 12}
            rx="2"
            fill="#d97706"
          />
        </g>
      </svg>

      {/* Overlay caption */}
      <div className="px-3.5 py-2 bg-stone-900/90 border-t border-stone-800 flex items-center justify-between text-[11px]">
        <span className="text-stone-300 font-medium">{HOUSING_LABELS[housing]}</span>
        <span className="text-amber-300">
          {getSeasonLabel(season)} • {getWorldStateLabel(worldState)}
        </span>
      </div>
    </div>
  );
}
