import type { Gender, OriginClass } from '../types/activeLife';

interface FeudalPortraitProps {
  gender: Gender;
  ageYears: number;
  originClass: OriginClass;
  officialRank: number;
}

export function FeudalPortrait({
  gender,
  ageYears,
  originClass,
  officialRank,
}: FeudalPortraitProps) {
  const isElder = ageYears >= 56;
  const isChild = ageYears < 13;
  const isBaby = ageYears < 3;

  // Outfit color by rank / origin
  let robeColor = '#78716c'; // bần nông áo nâu sòng
  let trimColor = '#57534e';
  if (officialRank >= 6) {
    robeColor = '#b45309'; // Hoàng bào vàng
    trimColor = '#fbbf24';
  } else if (officialRank >= 1) {
    robeColor = '#1e3a8a'; // Quan phục xanh lam
    trimColor = '#f59e0b';
  } else if (originClass === 'hoang_toc') {
    robeColor = '#991b1b'; // Áo gấm đỏ
    trimColor = '#fbbf24';
  } else if (originClass === 'quan_lai' || originClass === 'dia_chu') {
    robeColor = '#065f46'; // Áo gấm xanh ngọc
    trimColor = '#d97706';
  } else if (originClass === 'thu_cong') {
    robeColor = '#475569';
    trimColor = '#94a3b8';
  }

  const hairColor = isElder ? '#e7e5e4' : '#1c1917';
  const skinColor = '#fde68a';

  return (
    <div className="w-16 h-16 rounded-xl bg-stone-950 border border-amber-700/40 flex items-center justify-center overflow-hidden shrink-0 shadow-inner">
      <svg viewBox="0 0 64 64" className="w-full h-full">
        {/* Background halo */}
        <rect width="64" height="64" fill="#1c1917" />
        <circle cx="32" cy="32" r="24" fill="#292524" />

        {/* Shoulders / Robe */}
        <path d="M12 64 C12 46, 52 46, 52 64 Z" fill={robeColor} />
        <path d="M24 48 L32 58 L40 48" fill="none" stroke={trimColor} strokeWidth="2.5" />

        {/* Head */}
        <circle cx="32" cy={isBaby ? 33 : 29} r={isBaby ? 11 : 12} fill={skinColor} />

        {/* Hair / Bun */}
        {!isBaby && (
          <>
            <path d="M20 28 C20 16, 44 16, 44 28 C40 22, 24 22, 20 28 Z" fill={hairColor} />
            {gender === 'female' && !isChild && (
              <circle cx="32" cy="15" r="4.5" fill={hairColor} />
            )}
          </>
        )}

        {/* Official Hat (Mũ cánh chuồn) */}
        {officialRank >= 1 && officialRank < 6 && (
          <g>
            <rect x="22" y="14" width="20" height="7" rx="2" fill="#1c1917" stroke="#f59e0b" strokeWidth="1" />
            <line x1="10" y1="18" x2="22" y2="18" stroke="#1c1917" strokeWidth="2.5" />
            <line x1="42" y1="18" x2="54" y2="18" stroke="#1c1917" strokeWidth="2.5" />
          </g>
        )}

        {/* Emperor Crown */}
        {officialRank >= 6 && (
          <g>
            <rect x="21" y="12" width="22" height="6" rx="1" fill="#fbbf24" />
            <circle cx="32" cy="12" r="2.5" fill="#ef4444" />
          </g>
        )}

        {/* Eyes */}
        <circle cx="27.5" cy={isBaby ? 33 : 29.5} r="1.4" fill="#1c1917" />
        <circle cx="36.5" cy={isBaby ? 33 : 29.5} r="1.4" fill="#1c1917" />

        {/* Smile / Beard */}
        {isElder && gender === 'male' ? (
          <path d="M28 36 Q32 45 36 36" fill="none" stroke={hairColor} strokeWidth="2" />
        ) : (
          <path d="M29 34 Q32 36.5 35 34" fill="none" stroke="#92400e" strokeWidth="1.3" strokeLinecap="round" />
        )}
      </svg>
    </div>
  );
}
