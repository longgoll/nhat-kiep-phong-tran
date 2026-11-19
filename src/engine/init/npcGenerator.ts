import type { BirthOrder, Gender, NPC, OriginClass } from '../../types/activeLife';
import { randomInt, mulberry32Next } from '../prng';
import {
  FEMALE_GIVEN_NAMES,
  MALE_GIVEN_NAMES,
  SIBLING_PERSONALITIES,
} from './originData';

export interface NpcGenInput {
  prng: number;
  originClass: OriginClass;
  gender: Gender;
  surname: string;
  fatherName: string;
  motherName: string;
  fatherOccLabel: string;
  motherOccLabel: string;
  motherStatus: string;
  hasConcubines: boolean;
  familyWealthCopper: number;
  isStartDeclined: boolean;
  circ: {
    id: string;
    parentAffDelta: number;
    fatherAlive?: boolean;
    isTonThat?: boolean;
  };
}

export function generateInitialFamilyNpcs(input: NpcGenInput) {
  let prng = input.prng;
  const {
    originClass,
    gender,
    surname,
    fatherName,
    motherName,
    fatherOccLabel,
    motherOccLabel,
    motherStatus,
    hasConcubines,
    familyWealthCopper,
    isStartDeclined,
    circ,
  } = input;
  const fatherOcc = { label: fatherOccLabel };
  const motherOcc = { label: motherOccLabel };

  const fAff = randomInt(prng, 45, 85);
  prng = fAff.nextState;
  const mAff = randomInt(prng, 55, 95);
  prng = mAff.nextState;

  const mAgePick = randomInt(prng, 19, 34);
  prng = mAgePick.nextState;
  const motherAgeAtBirth = mAgePick.value;
  const fAgeDiffPick = randomInt(prng, 2, 9);
  prng = fAgeDiffPick.nextState;
  const fatherAgeAtBirth = motherAgeAtBirth + fAgeDiffPick.value;

  const npcs: NPC[] = [
    {
      id: 'npc_father',
      name: fatherName,
      gender: 'male',
      relation: 'parent',
      affinity: Math.min(100, Math.max(-100, fAff.value + circ.parentAffDelta)),
      isAlive: circ.fatherAlive !== false,
      role: circ.fatherAlive === false ? `Cha ruột (Đã mất) • ${fatherOcc.label}` : `Cha ruột • ${fatherOcc.label}`,
      age: fatherAgeAtBirth,
    },
    {
      id: 'npc_mother',
      name: motherName,
      gender: 'female',
      relation: 'parent',
      affinity: Math.min(100, Math.max(-100, mAff.value + circ.parentAffDelta)),
      isAlive: true,
      role: `Mẹ ruột • ${motherOcc.label}`,
      age: motherAgeAtBirth,
    },
  ];

  if (motherStatus === 'thu_that') {
    npcs[1].role = `Mẹ ruột (Thứ thất / Di nương) • ${motherOcc.label}`;
  } else if (originClass === 'hoang_toc' && !circ.isTonThat) {
    if (motherStatus === 'chinh_that') {
      npcs[1].role = 'Mẹ ruột • Hoàng hậu';
    } else {
      npcs[1].role = circ.id === 'that_sung' ? 'Mẹ ruột (Phi tần thất sủng)' : 'Mẹ ruột (Phi tần)';
    }
  }

  if (hasConcubines && circ.fatherAlive !== false) {
    const concCountRoll = randomInt(prng, 1, originClass === 'hoang_toc' ? 2 : 1);
    prng = concCountRoll.nextState;
    for (let cIdx = 0; cIdx < concCountRoll.value; cIdx += 1) {
      const cnPick = randomInt(prng, 0, FEMALE_GIVEN_NAMES.length - 1);
      prng = cnPick.nextState;
      const cAff = randomInt(prng, 15, 55);
      prng = cAff.nextState;
      const cAgeDiff = randomInt(prng, 17, 29);
      prng = cAgeDiff.nextState;
      npcs.push({
        id: `npc_concubine_${cIdx + 1}`,
        name:
          originClass === 'hoang_toc'
            ? `${FEMALE_GIVEN_NAMES[cnPick.value]} Phi`
            : `Bà ${FEMALE_GIVEN_NAMES[cnPick.value]}`,
        gender: 'female',
        relation: 'parent',
        affinity: cAff.value,
        isAlive: true,
        role:
          originClass === 'hoang_toc'
            ? 'Phi tần của phụ hoàng'
            : motherStatus === 'chinh_that'
              ? 'Thứ mẫu (Vợ lẽ của cha)'
              : 'Chính thất / Vợ khác của cha',
        age: cAgeDiff.value,
      });
    }
  }

  // Siblings & Birth order (with staggered, realistic ages — never 0 for younger siblings)
  const sibCountRoll = randomInt(prng, 0, 3);
  prng = sibCountRoll.nextState;
  const sibCount = sibCountRoll.value;

  let birthOrder: BirthOrder = 'con_mot';
  let birthOrderLabel = 'Con một';
  if (sibCount > 0) {
    const orderRoll = randomInt(prng, 0, 2);
    prng = orderRoll.nextState;
    if (orderRoll.value === 0) {
      birthOrder = 'con_truong';
      birthOrderLabel = 'Con trưởng';
    } else if (orderRoll.value === 1 && sibCount >= 2) {
      birthOrder = 'con_thu';
      birthOrderLabel = 'Con thứ';
    } else {
      birthOrder = 'con_ut';
      birthOrderLabel = 'Con út';
    }
  }

  if (hasConcubines) {
    if (motherStatus === 'chinh_that' && (birthOrder === 'con_truong' || birthOrder === 'con_mot')) {
      birthOrderLabel = `${birthOrderLabel} (${gender === 'female' ? 'Đích nữ' : 'Đích tử'})`;
    } else if (motherStatus === 'thu_that' || motherStatus === 'phi_tan') {
      birthOrderLabel = `${birthOrderLabel} (Thứ xuất)`;
    }
  }

  let olderAgeOffset = 0;
  let youngerAgeOffset = 0;
  for (let i = 0; i < sibCount; i += 1) {
    const sgRoll = mulberry32Next(prng);
    prng = sgRoll.nextState;
    const sGender: Gender = sgRoll.value < 0.5 ? 'male' : 'female';
    const sPool = sGender === 'male' ? MALE_GIVEN_NAMES : FEMALE_GIVEN_NAMES;
    const snPick = randomInt(prng, 0, sPool.length - 1);
    prng = snPick.nextState;
    const spPick = randomInt(prng, 0, SIBLING_PERSONALITIES.length - 1);
    prng = spPick.nextState;
    const sAff = randomInt(prng, 30, 80);
    prng = sAff.nextState;

    const isOlder = birthOrder === 'con_ut' || (birthOrder === 'con_thu' && i === 0);
    const gapPick = randomInt(prng, 2, 4);
    prng = gapPick.nextState;
    let sibAge: number;
    if (isOlder) {
      olderAgeOffset += gapPick.value;
      sibAge = olderAgeOffset;
    } else {
      youngerAgeOffset -= gapPick.value;
      sibAge = youngerAgeOffset;
    }

    const halfSibRoll = mulberry32Next(prng);
    prng = halfSibRoll.nextState;
    const isHalfSibling = hasConcubines && halfSibRoll.value < 0.45;

    const sibTitle = isOlder
      ? sGender === 'male'
        ? 'Anh trai'
        : 'Chị gái'
      : sGender === 'male'
        ? 'Em trai'
        : 'Em gái';
    const halfTag = isHalfSibling ? ' cùng cha khác mẹ' : '';

    npcs.push({
      id: `npc_sibling_${i + 1}`,
      name: `${surname} ${sGender === 'male' ? 'Văn' : 'Thị'} ${sPool[snPick.value]}`,
      gender: sGender,
      relation: 'sibling',
      affinity: isHalfSibling ? Math.max(10, sAff.value - 12) : sAff.value,
      isAlive: true,
      role: `${sibTitle}${halfTag} (${SIBLING_PERSONALITIES[spPick.value]})`,
      age: sibAge,
    });
  }

  if (originClass === 'hoang_toc') {
    const rAff = randomInt(prng, -15, 15);
    prng = rAff.nextState;
    const rNamePick = randomInt(prng, 0, MALE_GIVEN_NAMES.length - 1);
    prng = rNamePick.nextState;
    const rAgePick = randomInt(prng, 2, 6);
    prng = rAgePick.nextState;
    npcs.push({
      id: 'npc_royal_rival',
      name: `${surname} ${MALE_GIVEN_NAMES[rNamePick.value]}`,
      gender: 'male',
      relation: 'rival',
      affinity: rAff.value,
      isAlive: true,
      role: circ.isTonThat ? 'Công tử Tôn thất cạnh tranh tước vị' : 'Hoàng huynh tranh đoạt ngôi vị',
      age: rAgePick.value,
    });
  }

  if (originClass === 'hoang_toc' && !circ.isTonThat) {
    const thNamePick = randomInt(prng, 0, FEMALE_GIVEN_NAMES.length - 1);
    prng = thNamePick.nextState;
    const thAff = randomInt(prng, 35, 65);
    prng = thAff.nextState;
    npcs.push({
      id: 'npc_grandmother',
      name: `${FEMALE_GIVEN_NAMES[thNamePick.value]} Thái Hậu`,
      gender: 'female',
      relation: 'parent',
      affinity: thAff.value,
      isAlive: true,
      role: 'Hoàng Thái Hậu (Tổ mẫu)',
      age: fatherAgeAtBirth + 24,
    });
  }

  // Household staff (Quản gia, Nhũ mẫu, Gia nhân) for affluent / noble families
  let servantCount = 0;
  if (!isStartDeclined) {
    if (originClass === 'thu_cong' && familyWealthCopper >= 800) {
      servantCount = 1;
    } else if (originClass === 'dia_chu') {
      const sCount = randomInt(prng, 3, 7);
      prng = sCount.nextState;
      servantCount = sCount.value;
      const bNamePick = randomInt(prng, 0, MALE_GIVEN_NAMES.length - 1);
      prng = bNamePick.nextState;
      npcs.push({
        id: 'npc_butler',
        name: `Ông ${MALE_GIVEN_NAMES[bNamePick.value]}`,
        gender: 'male',
        relation: 'household',
        affinity: 50,
        isAlive: true,
        role: `Quản gia điền trang (${servantCount} gia đinh)`,
        age: 38,
      });
    } else if (originClass === 'quan_lai') {
      const sCount = randomInt(prng, 6, 14);
      prng = sCount.nextState;
      servantCount = sCount.value;
      const bNamePick = randomInt(prng, 0, MALE_GIVEN_NAMES.length - 1);
      prng = bNamePick.nextState;
      const wNamePick = randomInt(prng, 0, FEMALE_GIVEN_NAMES.length - 1);
      prng = wNamePick.nextState;
      npcs.push(
        {
          id: 'npc_butler',
          name: `Tổng quản ${MALE_GIVEN_NAMES[bNamePick.value]}`,
          gender: 'male',
          relation: 'household',
          affinity: 48,
          isAlive: true,
          role: `Quản gia phủ đệ (${servantCount} người hầu)`,
          age: 40,
        },
        {
          id: 'npc_wetnurse',
          name: `Vú ${FEMALE_GIVEN_NAMES[wNamePick.value]}`,
          gender: 'female',
          relation: 'household',
          affinity: 68,
          isAlive: true,
          role: 'Nhũ mẫu chăm bẵm từ nhỏ',
          age: 34,
        },
      );
    } else if (originClass === 'hoang_toc') {
      const sCount = randomInt(prng, 14, 28);
      prng = sCount.nextState;
      servantCount = sCount.value;
      const bNamePick = randomInt(prng, 0, MALE_GIVEN_NAMES.length - 1);
      prng = bNamePick.nextState;
      const wNamePick = randomInt(prng, 0, FEMALE_GIVEN_NAMES.length - 1);
      prng = wNamePick.nextState;
      npcs.push(
        {
          id: 'npc_butler',
          name: `Thái giám ${MALE_GIVEN_NAMES[bNamePick.value]}`,
          gender: 'male',
          relation: 'household',
          affinity: 45,
          isAlive: true,
          role: `Thái giám tổng quản (${servantCount} cung nữ, thị vệ)`,
          age: 42,
        },
        {
          id: 'npc_wetnurse',
          name: `Nhũ mẫu ${FEMALE_GIVEN_NAMES[wNamePick.value]}`,
          gender: 'female',
          relation: 'household',
          affinity: 70,
          isAlive: true,
          role: 'Nhũ mẫu cung đình',
          age: 35,
        },
      );
    }
  } else if (originClass === 'hoang_toc') {
    servantCount = 2;
    const bNamePick = randomInt(prng, 0, MALE_GIVEN_NAMES.length - 1);
    prng = bNamePick.nextState;
    const wNamePick = randomInt(prng, 0, FEMALE_GIVEN_NAMES.length - 1);
    prng = wNamePick.nextState;
    npcs.push(
      {
        id: 'npc_butler',
        name: `Lão thái giám ${MALE_GIVEN_NAMES[bNamePick.value]}`,
        gender: 'male',
        relation: 'household',
        affinity: 68,
        isAlive: true,
        role: 'Thái giám cũ trung thành nơi lãnh cung',
        age: 52,
      },
      {
        id: 'npc_wetnurse',
        name: `Cung nữ ${FEMALE_GIVEN_NAMES[wNamePick.value]}`,
        gender: 'female',
        relation: 'household',
        affinity: 74,
        isAlive: true,
        role: 'Cung nữ thân cận theo hầu mẫu phi',
        age: 32,
      },
    );
  }

  return {
    npcs,
    prng,
    fatherAgeAtBirth,
    motherAgeAtBirth,
    birthOrder,
    birthOrderLabel,
    servantCount,
  };
}
