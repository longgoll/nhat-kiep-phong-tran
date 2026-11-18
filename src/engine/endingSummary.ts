import { getAgeYears, type ActiveLifeState } from '../types/activeLife';
import { formatCopper } from './economy';
import { INTEREST_LABELS, ORIGIN_METADATA, TRAIT_LABELS } from './lifeInitializer';
import { getCurrentLivelihoodLabel, getEducationLabel } from './lifeStatus';

export interface EndingSummary {
  ageYears: number;
  totalDays: number;
  birthPlace: string;
  titleAwarded: string;
  epitaphLines: string[];
  lastWords: string | null;
  mourners: string[];
  attendLine: string;
  seeOffCell: string;
  saidLine: string;
  happiestYear: { age: number; score: number } | null;
  educationLabel: string;
  lastWorkLabel: string;
  partnerCell: string;
  kidsCell: string;
  traitsAndHobbies: string;
  netWorthCopper: number;
  assetsLeftLabel: string;
  lifeExpectancyDiff: number;
}

const FEUDAL_AVG_LIFESPAN = 55;

export function computeFinalTitle(ageYears: number, fame: number, originLabel: string): string {
  if (ageYears < 13) return 'Yểu mệnh thuở thiếu thời';
  if (fame >= 80) return 'Danh chấn thiên hạ';
  if (ageYears >= 70) return `Thọ chung chính tẩm (${originLabel})`;
  return `Một kiếp phong trần (${originLabel})`;
}

export function buildEndingSummary(life: ActiveLifeState): EndingSummary {
  const ageYears = getAgeYears(life.profile.totalDays);
  const totalDays = life.profile.totalDays;
  const originMeta = ORIGIN_METADATA[life.profile.originClass];
  const birthPlace = life.family?.birthPlace ?? 'Chốn hương thôn Đại Việt';
  const titleAwarded = computeFinalTitle(ageYears, life.stats.fame, originMeta.label);

  const livingSpouse = life.npcs.find((n) => n.relation === 'spouse' && n.isAlive);
  const anySpouse = life.npcs.find((n) => n.relation === 'spouse');
  const livingChildren = life.npcs.filter((n) => n.relation === 'child' && n.isAlive);
  const allChildren = life.npcs.filter((n) => n.relation === 'child');
  const livingParents = life.npcs.filter((n) => n.relation === 'parent' && n.isAlive);
  const livingSiblings = life.npcs.filter((n) => n.relation === 'sibling' && n.isAlive);
  const livingFriends = life.npcs.filter(
    (n) => (n.relation === 'friend' || n.relation === 'mentor') && n.isAlive,
  );

  // 1. Văn bia (Epitaph lines, 1in8b-style)
  const epitaphLines: string[] = [];
  epitaphLines.push(`Sinh ra tại ${birthPlace} và yên nghỉ nơi cố hương.`);
  if (ageYears < 1) {
    epitaphLines.push('Những ngày bạn có mặt trên thế gian chưa tròn một năm.');
  } else {
    epitaphLines.push(
      `Đã sống ${ageYears} năm, tức khoảng ${totalDays.toLocaleString('vi-VN')} ngày nơi hồng trần.`,
    );
  }
  if (livingChildren.length > 0) {
    epitaphLines.push(`Để lại ${livingChildren.length} người con nối dõi tông đường.`);
  } else if (ageYears >= 18) {
    epitaphLines.push('Ra đi không để lại hậu duệ trực hệ.');
  }
  if (ageYears < 5) {
    epitaphLines.push('Tuy ngắn ngủi, nhưng đó là một kiếp người đã thật sự hiện hữu.');
  }

  // 2. Lời trăn trối (Last words)
  let lastWords: string | null = null;
  if (ageYears >= 13) {
    if (livingSpouse && livingChildren.length > 0) {
      lastWords = '“Mọi người ở lại giữ gìn sức khỏe, đừng quá đau buồn vì ta...”';
    } else if (livingChildren.length > 0) {
      lastWords = '“Cha mẹ chỉ mong các con sống ngay thẳng, thuận hòa với nhau...”';
    } else if (livingSpouse) {
      lastWords = '“Kiếp này được cùng mình đi qua sương gió, ta không còn điều gì hối tiếc.”';
    } else if (life.officialRank > 0) {
      lastWords = '“Một đời giữ tròn tiết tháo kẻ sĩ, nay xin gác lại bút nghiên.”';
    } else {
      lastWords = '“Một kiếp phong trần nay đã mãn, xin gửi lại gió mây.”';
    }
  }

  // 3. Người dự tang lễ (Mourners - up to 10 like 1in8b)
  const mourners: string[] = [];
  if (ageYears < 25) {
    for (const p of livingParents) mourners.push(`${p.name} (Cha/Mẹ)`);
  }
  if (livingSpouse) mourners.push(`${livingSpouse.name} (Bạn đời)`);
  for (const c of livingChildren.slice(0, 4)) mourners.push(`${c.name} (Con)`);
  for (const s of livingSiblings.slice(0, 2)) mourners.push(`${s.name} (Anh/Chị/Em)`);
  for (const f of livingFriends.slice(0, 2)) {
    if (mourners.length < 10) mourners.push(`${f.name} (Bằng hữu)`);
  }

  const attendLine =
    mourners.length > 0
      ? `Có ${mourners.length} người thân quen đến tiễn đưa bạn đoạn đường cuối.`
      : 'Vài người hàng xóm láng giềng đã lặng lẽ tiễn bạn đoạn đường cuối.';

  const seeOffCell =
    mourners.length > 0 ? mourners.slice(0, 3).join(', ') + (mourners.length > 3 ? ` và ${mourners.length - 3} người khác` : '') : 'Vài người hàng xóm';

  // 4. Lời nhận xét sau cùng từ người gắn bó nhất
  let saidLine = '“Một kiếp người lặng lẽ đi qua, nay đã về với đất mẹ.”';
  if (livingChildren.length > 0) {
    saidLine = `${livingChildren[0].name} nghẹn ngào nhắc lại: “Người cả đời tảo tần, chưa từng than vãn nửa lời.”`;
  } else if (livingSpouse) {
    saidLine = `${livingSpouse.name} lặng người bên linh cữu: “Thiếu người bên cạnh, mái nhà này từ nay vắng lặng lắm.”`;
  } else if (livingParents.length > 0) {
    saidLine = `${livingParents[0].name} khóc nấc: “Lá xanh chưa kịp rụng mà người đầu bạc đã phải tiễn kẻ đầu xanh.”`;
  } else if (livingFriends.length > 0) {
    saidLine = `${livingFriends[0].name} rót chén rượu tiễn biệt: “Kiếp này kết giao cùng nhau, thật đáng trân trọng.”`;
  }

  // 5. Năm hạnh phúc nhất
  let happiestYear: { age: number; score: number } | null = null;
  if (life.yearlyHappiness) {
    for (const [yrStr, val] of Object.entries(life.yearlyHappiness)) {
      const yr = Number(yrStr);
      if (!happiestYear || val > happiestYear.score) {
        happiestYear = { age: yr, score: Math.round(val) };
      }
    }
  }

  // 6. Các ô tóm tắt
  const partnerCell = anySpouse
    ? `${anySpouse.name} (${anySpouse.isAlive ? 'Còn sống' : 'Đã mất trước'})`
    : 'Sống độc thân trọn kiếp';

  const kidsCell =
    allChildren.length > 0
      ? `${livingChildren.length} người con còn sống` +
        (allChildren.length > livingChildren.length
          ? ` (${allChildren.length - livingChildren.length} mất sớm)`
          : '')
      : 'Không có con';

  const traitNames = (life.traits ?? []).map((t) => TRAIT_LABELS[t] ?? t);
  const hobbyNames = (life.interests ?? []).map((i) => INTEREST_LABELS[i] ?? i);
  const traitsAndHobbies = [...traitNames, ...hobbyNames].join(' · ') || 'Giản dị, bình lặng';

  const netWorthCopper =
    life.assets.wealthCopper +
    (life.assets.goldReserveCopper ?? 0) +
    Math.round(life.assets.rice * life.world.ricePriceInCopper);

  const assetsLeftLabel =
    netWorthCopper > 0
      ? `${formatCopper(netWorthCopper)}${
          life.assets.properties.length > 0 ? ` · ${life.assets.properties.length} điền sản` : ''
        }`
      : netWorthCopper < 0
        ? `Nợ ${formatCopper(Math.abs(netWorthCopper))}`
        : 'Tay trắng';

  return {
    ageYears,
    totalDays,
    birthPlace,
    titleAwarded,
    epitaphLines,
    lastWords,
    mourners,
    attendLine,
    seeOffCell,
    saidLine,
    happiestYear,
    educationLabel: getEducationLabel(life),
    lastWorkLabel: getCurrentLivelihoodLabel(life),
    partnerCell,
    kidsCell,
    traitsAndHobbies,
    netWorthCopper,
    assetsLeftLabel,
    lifeExpectancyDiff: ageYears - FEUDAL_AVG_LIFESPAN,
  };
}
