import type { Gender, HousingTier, NPC, OriginClass, Season, WorldState } from '../types/activeLife';
import { getSeasonLabel, getWorldStateLabel } from '../engine/daySimulator';

interface FeudalSceneBannerProps {
  housing: HousingTier;
  season: Season;
  worldState: WorldState;
  ageYears: number;
  gender?: Gender;
  originClass?: OriginClass;
  birthPlace?: string;
  npcs?: NPC[];
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

interface SceneMember {
  id: string;
  label: string;
  age: number;
  gender: Gender;
  robeColor: string;
  trimColor: string;
  isPlayer?: boolean;
}

function PixelSprite({ member, x }: { member: SceneMember; x: number }) {
  const { age, gender, robeColor, trimColor, label, isPlayer } = member;

  // Baby / Toddler (0-2 tuổi) - swaddled pixel bundle standing/sitting at y=92
  if (age < 3) {
    return (
      <g transform={`translate(${x}, 80)`} shapeRendering="crispEdges">
        <title>{`${label} (${age} tuổi)`}</title>
        {/* Hair tuft */}
        <rect x="3" y="0" width="4" height="2" fill="#1c1917" />
        {/* Head */}
        <rect x="2" y="2" width="6" height="4" fill="#fde68a" />
        <rect x="3" y="3" width="1" height="1" fill="#1c1917" />
        <rect x="6" y="3" width="1" height="1" fill="#1c1917" />
        {/* Swaddle / Robe */}
        <rect x="1" y="6" width="8" height="5" fill={robeColor} />
        <rect x="2" y="7" width="6" height="1" fill={trimColor} />
        {/* Feet */}
        <rect x="2" y="11" width="2" height="1" fill="#292524" />
        <rect x="6" y="11" width="2" height="1" fill="#292524" />
      </g>
    );
  }

  // Child (3-12 tuổi) - height 16px, bottom at y=92 (92 - 16 = 76)
  if (age < 13) {
    return (
      <g transform={`translate(${x}, 76)`} shapeRendering="crispEdges">
        <title>{`${label} (${age} tuổi)`}</title>
        {/* Hair */}
        <rect x="2" y="0" width="6" height="2" fill="#1c1917" />
        {gender === 'female' && <rect x="1" y="1" width="1" height="3" fill="#1c1917" />}
        {gender === 'female' && <rect x="8" y="1" width="1" height="3" fill="#1c1917" />}
        {/* Face */}
        <rect x="2" y="2" width="6" height="4" fill="#fde68a" />
        <rect x="3" y="3" width="1" height="1" fill="#1c1917" />
        <rect x="6" y="3" width="1" height="1" fill="#1c1917" />
        {/* Tunic */}
        <rect x="1" y="6" width="8" height="6" fill={robeColor} />
        <rect x="3" y="6" width="4" height="1" fill={trimColor} />
        <rect x="1" y="10" width="8" height="1" fill={trimColor} />
        {/* Hands */}
        <rect x="0" y="7" width="1" height="3" fill="#fde68a" />
        <rect x="9" y="7" width="1" height="3" fill="#fde68a" />
        {/* Legs & shoes */}
        <rect x="2" y="12" width="2" height="4" fill="#292524" />
        <rect x="6" y="12" width="2" height="4" fill="#292524" />
        {isPlayer && <rect x="4" y="-3" width="2" height="2" fill="#fbbf24" />}
      </g>
    );
  }

  // Adult (13+ tuổi) - height 22px, bottom at y=92 (92 - 22 = 70)
  return (
    <g transform={`translate(${x}, 70)`} shapeRendering="crispEdges">
      <title>{`${label} (${age} tuổi)`}</title>
      {/* Topknot / Hair bun */}
      {gender === 'male' ? (
        <>
          <rect x="4" y="0" width="4" height="2" fill="#1c1917" />
          <rect x="2" y="2" width="8" height="2" fill="#1c1917" />
        </>
      ) : (
        <>
          <rect x="3" y="0" width="6" height="2" fill="#1c1917" />
          <rect x="2" y="2" width="8" height="2" fill="#1c1917" />
          <rect x="1" y="3" width="1" height="4" fill="#1c1917" />
          <rect x="10" y="3" width="1" height="4" fill="#1c1917" />
        </>
      )}
      {/* Face */}
      <rect x="3" y="4" width="6" height="4" fill="#fde68a" />
      <rect x="4" y="5" width="1" height="1" fill="#1c1917" />
      <rect x="7" y="5" width="1" height="1" fill="#1c1917" />
      {/* Traditional Robe */}
      <rect x="2" y="8" width="8" height="10" fill={robeColor} />
      {/* Collar & Sash */}
      <rect x="4" y="8" width="4" height="1" fill={trimColor} />
      <rect x="2" y="13" width="8" height="1" fill={trimColor} />
      {/* Sleeves & Hands */}
      <rect x="1" y="9" width="1" height="5" fill={robeColor} />
      <rect x="10" y="9" width="1" height="5" fill={robeColor} />
      <rect x="1" y="14" width="1" height="2" fill="#fde68a" />
      <rect x="10" y="14" width="1" height="2" fill="#fde68a" />
      {/* Boots */}
      <rect x="3" y="18" width="2" height="4" fill="#1c1917" />
      <rect x="7" y="18" width="2" height="4" fill="#1c1917" />
      {isPlayer && <rect x="5" y="-3" width="2" height="2" fill="#fbbf24" />}
    </g>
  );
}

function buildHouseholdDisplay(
  ageYears: number,
  gender: Gender,
  originClass: OriginClass,
  npcs: NPC[],
  housing: HousingTier,
  birthPlace?: string
): {
  members: SceneMember[];
  primaryLine: string;
  secondaryLine: string;
} {
  const livingNpcs = npcs.filter(
    (npc) => npc.isAlive && (npc.age === undefined || npc.age + ageYears >= 0)
  );

  const parents = livingNpcs.filter((n) => n.relation === 'parent');
  const siblings = livingNpcs.filter((n) => n.relation === 'sibling');
  const spouses = livingNpcs.filter((n) => n.relation === 'spouse');
  const children = livingNpcs.filter((n) => n.relation === 'child');

  const isChildhood = ageYears < 13;
  const members: SceneMember[] = [];

  const playerRobeByOrigin: Record<OriginClass, { robe: string; trim: string }> = {
    ban_nong: { robe: '#d97706', trim: '#fef3c7' },
    thu_cong: { robe: '#0284c7', trim: '#bae6fd' },
    dia_chu: { robe: '#059669', trim: '#fde68a' },
    quan_lai: { robe: '#1d4ed8', trim: '#fbbf24' },
    hoang_toc: { robe: '#b91c1c', trim: '#fbbf24' },
  };
  const pStyle = playerRobeByOrigin[originClass];

  // Decide who stands in the family portrait
  if (isChildhood) {
    // Parents first
    parents.slice(0, 3).forEach((p) => {
      const pAge = p.age !== undefined ? p.age + ageYears : 35;
      members.push({
        id: p.id,
        label: p.name,
        age: pAge,
        gender: p.gender,
        robeColor: p.gender === 'male' ? '#475569' : '#be123c',
        trimColor: '#e2e8f0',
      });
    });
    // Player
    members.push({
      id: 'player',
      label: 'Bạn',
      age: ageYears,
      gender,
      robeColor: pStyle.robe,
      trimColor: pStyle.trim,
      isPlayer: true,
    });
    // Siblings
    siblings.slice(0, 4).forEach((s) => {
      const sAge = s.age !== undefined ? s.age + ageYears : ageYears;
      members.push({
        id: s.id,
        label: s.name,
        age: sAge,
        gender: s.gender,
        robeColor: s.gender === 'male' ? '#0f766e' : '#9333ea',
        trimColor: '#fde68a',
      });
    });
  } else {
    // Adulthood: Player + Spouse + Children (or Parents if unmarried & young)
    members.push({
      id: 'player',
      label: 'Bạn',
      age: ageYears,
      gender,
      robeColor: pStyle.robe,
      trimColor: pStyle.trim,
      isPlayer: true,
    });
    spouses.slice(0, 1).forEach((sp) => {
      const spAge = sp.age !== undefined ? sp.age + ageYears : ageYears;
      members.push({
        id: sp.id,
        label: sp.name,
        age: spAge,
        gender: sp.gender,
        robeColor: sp.gender === 'male' ? '#334155' : '#be123c',
        trimColor: '#fde68a',
      });
    });
    children.slice(0, 4).forEach((ch) => {
      const chAge = ch.age !== undefined ? ch.age + ageYears : 1;
      members.push({
        id: ch.id,
        label: ch.name,
        age: chAge,
        gender: ch.gender,
        robeColor: ch.gender === 'male' ? '#0f766e' : '#db2777',
        trimColor: '#fef3c7',
      });
    });
    if (spouses.length === 0 && children.length === 0 && ageYears < 22) {
      parents.slice(0, 2).forEach((p) => {
        const pAge = p.age !== undefined ? p.age + ageYears : 45;
        members.push({
          id: p.id,
          label: p.name,
          age: pAge,
          gender: p.gender,
          robeColor: p.gender === 'male' ? '#475569' : '#be123c',
          trimColor: '#e2e8f0',
        });
      });
    }
  }

  // Primary info line (1in8b style): Địa điểm · Nhà ở · Sống cùng...
  const livingParts: string[] = [];
  if (isChildhood) {
    const hasFather = parents.some((p) => p.gender === 'male');
    const hasMother = parents.some((p) => p.gender === 'female');
    if (hasFather && hasMother) livingParts.push('cha mẹ');
    else if (hasFather) livingParts.push('cha');
    else if (hasMother) livingParts.push('mẹ');
    if (siblings.length > 0) livingParts.push(`${siblings.length} anh chị em`);
  } else {
    if (spouses.length > 0) {
      livingParts.push(spouses[0].gender === 'male' ? 'phu quân' : 'thê tử');
    }
    if (children.length > 0) {
      livingParts.push(`${children.length} con`);
    }
    if (livingParts.length === 0 && ageYears < 22 && parents.length > 0) {
      livingParts.push('cha mẹ');
    }
  }

  const livingText =
    livingParts.length > 0
      ? `sống cùng ${livingParts.join(' và ')}`
      : isChildhood
        ? 'tự lập sớm'
        : 'sống tự lập';

  const primaryParts = [birthPlace, HOUSING_LABELS[housing], livingText].filter(Boolean);
  const primaryLine = primaryParts.join(' · ');

  // Secondary info line (1in8b style): Bạn, X tuổi · Mẹ, Y tuổi · Cha, Z tuổi · ...
  const ageSummary: string[] = [`Bạn, ${ageYears} tuổi`];
  if (isChildhood || (spouses.length === 0 && children.length === 0 && ageYears < 22)) {
    const mother = parents.find(
      (p) => p.gender === 'female' && !p.role.toLowerCase().includes('thứ mẫu') && !p.role.toLowerCase().includes('phi tần')
    ) ?? parents.find((p) => p.gender === 'female');
    const father = parents.find((p) => p.gender === 'male');
    if (mother && mother.age !== undefined) {
      ageSummary.push(`Mẹ, ${mother.age + ageYears} tuổi`);
    }
    if (father && father.age !== undefined) {
      ageSummary.push(`Cha, ${father.age + ageYears} tuổi`);
    }
    if (siblings.length > 0) {
      const sibAges = siblings
        .map((s) => (s.age !== undefined ? s.age + ageYears : undefined))
        .filter((a): a is number => a !== undefined);
      if (sibAges.length === 1) {
        ageSummary.push(`Anh chị em, ${sibAges[0]} tuổi`);
      } else if (sibAges.length > 1) {
        const minA = Math.min(...sibAges);
        const maxA = Math.max(...sibAges);
        ageSummary.push(
          minA === maxA ? `Anh chị em, ${minA} tuổi` : `Anh chị em, ${minA}–${maxA} tuổi`
        );
      }
    }
  } else {
    if (spouses.length > 0 && spouses[0].age !== undefined) {
      const spLabel = spouses[0].gender === 'male' ? 'Phu quân' : 'Thê tử';
      ageSummary.push(`${spLabel}, ${spouses[0].age + ageYears} tuổi`);
    }
    if (children.length > 0) {
      const chAges = children
        .map((c) => (c.age !== undefined ? c.age + ageYears : undefined))
        .filter((a): a is number => a !== undefined);
      if (chAges.length === 1) {
        ageSummary.push(`Con, ${chAges[0]} tuổi`);
      } else if (chAges.length > 1) {
        const minC = Math.min(...chAges);
        const maxC = Math.max(...chAges);
        ageSummary.push(minC === maxC ? `${children.length} con, ${minC} tuổi` : `${children.length} con, ${minC}–${maxC} tuổi`);
      }
    }
  }

  return {
    members: members.slice(0, 7),
    primaryLine,
    secondaryLine: ageSummary.join(' · '),
  };
}

export function FeudalSceneBanner({
  housing,
  season,
  worldState,
  ageYears,
  gender = 'male',
  originClass = 'ban_nong',
  birthPlace,
  npcs = [],
}: FeudalSceneBannerProps) {
  const sky = SKY_BY_SEASON[season];
  const { members, primaryLine, secondaryLine } = buildHouseholdDisplay(
    ageYears,
    gender,
    originClass,
    npcs,
    housing,
    birthPlace
  );

  const startX = 188;
  const stepX = members.length > 5 ? 20 : 24;

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
        <rect x="0" y="92" width="400" height="2" fill="#292524" />

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

        {/* Pixel-art family lineup */}
        {members.map((member, idx) => (
          <PixelSprite key={member.id} member={member} x={startX + idx * stepX} />
        ))}
      </svg>

      {/* 1in8b-style caption: Line 1 (Location · Housing · Living with) + Season/World; Line 2 (Member ages) */}
      <div className="px-3.5 py-2 bg-stone-900/90 border-t border-stone-800 space-y-0.5">
        <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-0.5 text-[11px]">
          <span className="text-stone-200 font-medium">{primaryLine}</span>
          <span className="text-amber-300 shrink-0">
            {getSeasonLabel(season)} • {getWorldStateLabel(worldState)}
          </span>
        </div>
        <div className="text-[11px] text-stone-400 leading-snug">{secondaryLine}</div>
      </div>
    </div>
  );
}
