import {
  type ActiveLifeState,
  type CohortPeer,
  type FamilyContext,
  type Gender,
  type OriginClass,
} from '../../types/activeLife';
import { calculateRicePrice } from '../economy';
import { ORIGIN_CORE_CONFIG } from '../originConfigs';
import { generateRandomSeed, mulberry32Next, pickWeightedIndex, randomInt } from '../prng';
import {
  BIRTH_PLACES_BY_ORIGIN,
  CIRCUMSTANCES_BY_ORIGIN,
  DYNASTY_NAMES,
  FAMILY_NAMES_BY_ORIGIN,
  FATHER_OCCUPATIONS,
  FEMALE_GIVEN_NAMES,
  MALE_GIVEN_NAMES,
  MOTHER_OCCUPATIONS,
  ORIGIN_METADATA,
  RUSTIC_FEMALE_NICKNAMES,
  RUSTIC_MALE_NICKNAMES,
  computeLivingTier,
} from './originData';
import { generateInitialFamilyNpcs } from './npcGenerator';

export function createNewLife(customSeed?: number): ActiveLifeState {
  const seed = customSeed !== undefined ? customSeed >>> 0 : generateRandomSeed();

  let prng = seed;

  // 1. Gender (50/50)
  const gRoll = mulberry32Next(prng);
  prng = gRoll.nextState;
  const gender: Gender = gRoll.value < 0.5 ? 'male' : 'female';

  // 2. Origin Class (weighted)
  const origins: OriginClass[] = ['ban_nong', 'thu_cong', 'dia_chu', 'quan_lai', 'hoang_toc'];
  const weights = origins.map((o) => ORIGIN_METADATA[o].weight);
  const oPick = pickWeightedIndex(prng, weights);
  prng = oPick.nextState;
  const originClass = origins[oPick.index];

  // 3. Name generation
  const surnames = FAMILY_NAMES_BY_ORIGIN[originClass];
  const sPick = randomInt(prng, 0, surnames.length - 1);
  prng = sPick.nextState;
  const surname = surnames[sPick.value];

  let fullName: string;
  if (originClass === 'ban_nong') {
    const nickRoll = mulberry32Next(prng);
    prng = nickRoll.nextState;
    if (nickRoll.value < 0.35) {
      const nickPool = gender === 'male' ? RUSTIC_MALE_NICKNAMES : RUSTIC_FEMALE_NICKNAMES;
      const nPick = randomInt(prng, 0, nickPool.length - 1);
      prng = nPick.nextState;
      fullName = `${surname} ${nickPool[nPick.value]}`;
    } else {
      const pool = gender === 'male' ? MALE_GIVEN_NAMES : FEMALE_GIVEN_NAMES;
      const nPick = randomInt(prng, 0, pool.length - 1);
      prng = nPick.nextState;
      fullName = `${surname} Văn ${pool[nPick.value]}`.replace('Văn ', gender === 'male' ? 'Văn ' : 'Thị ');
    }
  } else {
    const pool = gender === 'male' ? MALE_GIVEN_NAMES : FEMALE_GIVEN_NAMES;
    const nPick = randomInt(prng, 0, pool.length - 1);
    prng = nPick.nextState;
    const middle = gender === 'male' ? 'Quang' : 'Ngọc';
    fullName = `${surname} ${middle} ${pool[nPick.value]}`;
  }

  // 4. Starting family wealth, stats, occupations & circumstances (Core Cứng + Core Động)
  const coreCfg = ORIGIN_CORE_CONFIG[originClass];
  const wealthRoll = randomInt(prng, coreCfg.wealthRange[0], coreCfg.wealthRange[1]);
  prng = wealthRoll.nextState;
  let familyWealthCopper = wealthRoll.value;

  let health = coreCfg.baseStats.health;
  let happiness = coreCfg.baseStats.happiness;
  let relationships = coreCfg.baseStats.relationships;
  let education = coreCfg.baseStats.education;
  let martial = coreCfg.baseStats.martial;
  let craftTrade = coreCfg.baseStats.craftTrade;
  let fame = coreCfg.baseStats.fame;

  // Parent occupations
  const fOccList = FATHER_OCCUPATIONS[originClass];
  const fOccPick = randomInt(prng, 0, fOccList.length - 1);
  prng = fOccPick.nextState;
  let fatherOcc = fOccList[fOccPick.value];

  const mOccList = MOTHER_OCCUPATIONS[originClass];
  const mOccPick = randomInt(prng, 0, mOccList.length - 1);
  prng = mOccPick.nextState;
  let motherOcc = mOccList[mOccPick.value];

  if (fatherOcc.wealthMult !== undefined) {
    familyWealthCopper = Math.max(10, Math.round(familyWealthCopper * fatherOcc.wealthMult));
  }
  if (fatherOcc.bonusStats) {
    health += fatherOcc.bonusStats.health ?? 0;
    education += fatherOcc.bonusStats.education ?? 0;
    martial += fatherOcc.bonusStats.martial ?? 0;
    craftTrade += fatherOcc.bonusStats.craftTrade ?? 0;
    fame += fatherOcc.bonusStats.fame ?? 0;
  }

  // Family circumstance (origin-specific)
  const circList = CIRCUMSTANCES_BY_ORIGIN[originClass];
  const circPick = randomInt(prng, 0, circList.length - 1);
  prng = circPick.nextState;
  const circ = circList[circPick.value];

  if (circ.isTonThat) {
    fatherOcc = { id: 'quan_vuong', label: 'Quận vương Tôn thất', monthlyIncome: 850 };
    motherOcc = { id: 'vuong_phi', label: 'Vương phi', monthlyIncome: 140 };
  } else if (originClass === 'hoang_toc' && circ.fatherAlive === false) {
    fatherOcc = { id: 'tien_de', label: 'Tiên đế quá cố', monthlyIncome: 0 };
  }

  familyWealthCopper = Math.max(10, Math.round(familyWealthCopper * circ.wealthMult));
  happiness = Math.max(30, Math.min(95, happiness + circ.happinessDelta));
  fame = Math.max(0, fame + (circ.fameDelta ?? 0));

  const initialFlags: string[] = [...(circ.extraFlags ?? [])];
  const initialTraits: string[] = [];
  const initialInterests: string[] = [...coreCfg.innateInterests];
  const pushUnique = (arr: string[], val: string) => {
    if (!arr.includes(val)) arr.push(val);
  };

  if (initialFlags.includes('gia_phong_thu_huong')) {
    education += 3;
    pushUnique(initialTraits, 'ham_hoc');
    pushUnique(initialInterests, 'kinh_su');
  }
  if (initialFlags.includes('gia_phong_vo_hoc')) {
    martial += 3;
    pushUnique(initialTraits, 'hieu_dong');
    pushUnique(initialInterests, 'vo_nghe');
  }
  if (
    (originClass === 'ban_nong' || originClass === 'thu_cong') &&
    (initialFlags.includes('gia_dinh_mac_no') || initialFlags.includes('mo_coi_cha'))
  ) {
    pushUnique(initialTraits, 'kien_cuong');
  }
  if (
    (originClass === 'quan_lai' || originClass === 'hoang_toc') &&
    (initialFlags.includes('gia_toc_sa_sut') || initialFlags.includes('that_sung_cung_dinh'))
  ) {
    pushUnique(initialTraits, 'da_nghi');
    relationships = Math.max(25, relationships - 10);
  }
  if (originClass === 'hoang_toc' && circ.id === 'duoc_sung_ai') {
    happiness = Math.min(95, happiness + 6);
    relationships = Math.min(100, relationships + 4);
  }
  if (circ.id === 'hoa_thuan') {
    relationships = Math.min(86, relationships + 6);
  }

  // Controlled natural birth variance (±5) so every life starts uniquely without maxing out
  const varHealth = randomInt(prng, -5, 5);
  prng = varHealth.nextState;
  const varHappy = randomInt(prng, -5, 5);
  prng = varHappy.nextState;
  const varRel = randomInt(prng, -5, 5);
  prng = varRel.nextState;

  // Natural intellectual variance + rare prodigy ("thần đồng") roll across all origins
  const eduRangeByOrigin: Record<OriginClass, [number, number]> = {
    ban_nong: [0, 3],
    thu_cong: [0, 4],
    dia_chu: [-3, 3],
    quan_lai: [-5, 4],
    hoang_toc: [-6, 4],
  };
  const [eduMin, eduMax] = eduRangeByOrigin[originClass];
  const varEdu = randomInt(prng, eduMin, eduMax);
  prng = varEdu.nextState;

  const prodigyRoll = mulberry32Next(prng);
  prng = prodigyRoll.nextState;
  const isProdigy = prodigyRoll.value < 0.07;
  let prodigyEduBonus = 0;
  if (isProdigy) {
    const bonusPick = randomInt(prng, 5, 8);
    prng = bonusPick.nextState;
    prodigyEduBonus = bonusPick.value;
    pushUnique(initialTraits, 'than_dong');
    pushUnique(initialInterests, 'kinh_su');
    pushUnique(initialFlags, 'than_dong_bam_sinh');
  }

  health = Math.max(40, Math.min(86, health + varHealth.value));
  happiness = Math.max(38, Math.min(84, happiness + varHappy.value));
  relationships = Math.max(35, Math.min(84, relationships + varRel.value));
  education = Math.max(0, Math.min(30, education + varEdu.value + prodigyEduBonus));

  const isStartDeclined =
    initialFlags.includes('gia_toc_sa_sut') ||
    initialFlags.includes('that_sung_cung_dinh') ||
    initialFlags.includes('gia_dinh_mac_no') ||
    initialFlags.includes('mo_coi_cha');
  const initialLifestyle = isStartDeclined ? coreCfg.declinedLifestyle : coreCfg.defaultLifestyle;

  // 5. Initial NPCs (Named Parents + Siblings)
  const fNamePick = randomInt(prng, 0, MALE_GIVEN_NAMES.length - 1);
  prng = fNamePick.nextState;
  const fatherName =
    originClass === 'hoang_toc'
      ? circ.isTonThat
        ? `${surname} Quận Vương`
        : circ.fatherAlive === false
          ? `Tiên đế ${surname} ${MALE_GIVEN_NAMES[fNamePick.value]}`
          : `Hoàng đế ${surname} ${MALE_GIVEN_NAMES[fNamePick.value]}`
      : `${surname} Văn ${MALE_GIVEN_NAMES[fNamePick.value]}`;

  const mNamePick = randomInt(prng, 0, FEMALE_GIVEN_NAMES.length - 1);
  prng = mNamePick.nextState;

  // Feudal polygamy (Vợ lẽ / Phi tần) for wealthy/noble families
  const canHaveConcubines =
    originClass === 'hoang_toc' ||
    ((originClass === 'quan_lai' || originClass === 'dia_chu') && !isStartDeclined);
  const concubineRoll = mulberry32Next(prng);
  prng = concubineRoll.nextState;
  const concubineChance =
    originClass === 'hoang_toc' ? 0.85 : originClass === 'quan_lai' ? 0.55 : 0.35;
  const hasConcubines = canHaveConcubines && concubineRoll.value < concubineChance;

  const motherStatusRoll = mulberry32Next(prng);
  prng = motherStatusRoll.nextState;
  let motherStatus: 'chinh_that' | 'thu_that' | 'phi_tan' = 'chinh_that';
  if (originClass === 'hoang_toc' && !circ.isTonThat) {
    if (circ.id === 'duoc_sung_ai') {
      motherStatus = 'chinh_that';
    } else if (circ.id === 'that_sung') {
      motherStatus = 'phi_tan';
    } else {
      motherStatus = motherStatusRoll.value < 0.28 ? 'chinh_that' : 'phi_tan';
    }
  } else if (hasConcubines && motherStatusRoll.value < 0.35) {
    motherStatus = 'thu_that';
  }

  const motherGivenName = FEMALE_GIVEN_NAMES[mNamePick.value];
  const motherName =
    originClass === 'hoang_toc'
      ? circ.isTonThat
        ? `${motherGivenName} Vương Phi`
        : motherStatus === 'chinh_that'
          ? `${motherGivenName} Hoàng Hậu`
          : circ.id === 'that_sung'
            ? `${motherGivenName} Tài Nhân`
            : `${motherGivenName} Phi`
      : `${motherGivenName} ${surname}`;
  const npcRes = generateInitialFamilyNpcs({
    prng,
    originClass,
    gender,
    surname,
    fatherName,
    motherName,
    fatherOccLabel: fatherOcc.label,
    motherOccLabel: motherOcc.label,
    motherStatus,
    hasConcubines,
    familyWealthCopper,
    isStartDeclined,
    circ,
  });
  prng = npcRes.prng;
  const { npcs, fatherAgeAtBirth, motherAgeAtBirth, birthOrder, birthOrderLabel, servantCount } = npcRes;

  const bpPool = BIRTH_PLACES_BY_ORIGIN[originClass];
  const bpPick = randomInt(prng, 0, bpPool.length - 1);
  prng = bpPick.nextState;
  const birthPlace =
    originClass === 'hoang_toc'
      ? circ.isTonThat
        ? 'Phủ Tôn thất Kinh thành'
        : 'Hoàng cung Tử Cấm Thành'
      : originClass === 'quan_lai' && initialFlags.includes('gia_toc_sa_sut')
        ? 'Quê cũ vùng ngoại ô'
        : bpPool[bpPick.value];

  const familyAssetsSummary: string[] = [];
  if (originClass === 'ban_nong') {
    familyAssetsSummary.push(
      circ.id === 'mac_no' ? 'Mái nhà tranh dột nát' : 'Mái nhà tranh vách đất',
    );
    if (fatherOcc.id === 'ngu_dan') {
      familyAssetsSummary.push('Thuyền nan cũ & lưới đánh cá');
    } else if (fatherOcc.id === 'tho_san') {
      familyAssetsSummary.push('Cung nỏ & bẫy thú rừng');
    } else if (fatherOcc.id === 'thay_do_ngheo') {
      familyAssetsSummary.push('Vài hòm sách cũ & nghiên mực sứt');
    } else if (familyWealthCopper >= 85 && circ.id !== 'mac_no') {
      const saoRoll = randomInt(prng, 1, 3);
      prng = saoRoll.nextState;
      familyAssetsSummary.push(`${saoRoll.value} sào ruộng xấu & nông cụ`);
    } else {
      familyAssetsSummary.push('Vài sào ruộng cấy rẽ');
    }
    if (circ.id === 'mac_no') {
      familyAssetsSummary.push('Văn tự nợ nhà địa chủ');
    }
  } else if (originClass === 'thu_cong') {
    familyAssetsSummary.push(
      isStartDeclined
        ? 'Nhà tranh nhỏ cạnh chợ'
        : familyWealthCopper >= 900
          ? 'Nhà ngói nhỏ & sân phơi'
          : 'Nhà gỗ vách ván',
    );
    const craftAssetByOcc: Record<string, string> = {
      tho_ren: 'Lò rèn & bễ thổi gia truyền',
      tho_moc: 'Xưởng mộc & bộ đục chạm',
      thay_lang: 'Tủ thuốc bắc & sách y',
      lai_buon: 'Sạp hàng & ghe buôn nhỏ',
      tho_gom: 'Bàn xoay & lò gốm nhỏ',
    };
    familyAssetsSummary.push(craftAssetByOcc[fatherOcc.id] ?? 'Đồ nghề mưu sinh tổ truyền');
    if (circ.id === 'mac_no' || circ.id === 'bi_chen_ep') {
      familyAssetsSummary.push('Đồ nghề cầm cố một phần');
    } else if (servantCount > 0) {
      familyAssetsSummary.push(`${servantCount} thợ phụ lành nghề`);
    }
  } else if (originClass === 'dia_chu') {
    const minAcres = isStartDeclined ? 2 : familyWealthCopper >= 12000 ? 16 : 7;
    const maxAcres = isStartDeclined ? 5 : familyWealthCopper >= 12000 ? 28 : 15;
    const acresRoll = randomInt(prng, minAcres, maxAcres);
    prng = acresRoll.nextState;
    familyAssetsSummary.push(
      isStartDeclined ? 'Nhà gạch cũ xuống cấp' : 'Nhà gạch 5 gian khang trang',
      `${acresRoll.value} mẫu ruộng tư & kho thóc`,
    );
    if (!isStartDeclined) {
      const bonusRoll = mulberry32Next(prng);
      prng = bonusRoll.nextState;
      if (bonusRoll.value < 0.5) {
        familyAssetsSummary.push('Ao cá & vườn cây ăn quả');
      } else {
        familyAssetsSummary.push('Vài gian ki-ốt cho thuê ngoài chợ');
      }
    }
    familyAssetsSummary.push(
      servantCount > 0 ? `Quản gia & ${servantCount} gia đinh` : 'Ít người làm thuê',
    );
  } else if (originClass === 'quan_lai') {
    familyAssetsSummary.push(
      isStartDeclined ? 'Gian nhà nhỏ nơi quê cũ' : 'Phủ đệ rộng rãi chốn quan trường',
      fatherOcc.id === 'quan_vo'
        ? 'Binh thư & binh khí gia truyền'
        : fatherOcc.id === 'tham_quan'
          ? 'Thư phòng & hòm bạc tích trữ'
          : 'Thư viện kinh sử gia truyền',
      servantCount > 0 ? `Tổng quản, vú em & ${servantCount} gia nhân` : 'Gia nhân đã ly tán',
    );
  } else {
    const royalAcres = randomInt(prng, 15, 35);
    prng = royalAcres.nextState;
    familyAssetsSummary.push(
      circ.isTonThat
        ? 'Phủ Tôn thất Kinh thành'
        : circ.id === 'that_sung'
          ? 'Tẩm cung hẻo lánh'
          : 'Cung điện trong Tử Cấm Thành',
      isStartDeclined
        ? 'Bổng lộc bị cắt giảm'
        : circ.isTonThat
          ? `${royalAcres.value} mẫu đất phong & bổng lộc`
          : 'Đất phong & bổng lộc Hoàng gia',
      isStartDeclined
        ? 'Lão thái giám & cung nữ trung thành'
        : servantCount > 0
          ? `Thái giám, nhũ mẫu & ${servantCount} cung nữ`
          : 'Ít người hầu hạ',
    );
  }

  const family: FamilyContext = {
    fatherOccupation: fatherOcc.id,
    fatherOccupationLabel: fatherOcc.label,
    motherOccupation: motherOcc.id,
    motherOccupationLabel: motherOcc.label,
    circumstance: circ.id,
    circumstanceLabel: circ.label,
    birthOrder,
    birthOrderLabel,
    familyWealthCopper,
    familyLivingTier: computeLivingTier(familyWealthCopper, originClass),
    birthPlace,
    fatherAgeAtBirth,
    motherAgeAtBirth,
    motherStatus,
    servantCount,
    familyAssetsSummary,
  };

  // Generate 4 cohort peers born at the exact same moment across the realm
  const peerOrigins: OriginClass[] = ['ban_nong', 'thu_cong', 'dia_chu', 'quan_lai'];
  const cohortPeers: CohortPeer[] = peerOrigins.map((pOrigin, idx) => {
    const pgRoll = mulberry32Next(prng);
    prng = pgRoll.nextState;
    const pGender: Gender = pgRoll.value < 0.5 ? 'male' : 'female';
    const pSurnames = FAMILY_NAMES_BY_ORIGIN[pOrigin];
    const psPick = randomInt(prng, 0, pSurnames.length - 1);
    prng = psPick.nextState;
    const pGivenPool = pGender === 'male' ? MALE_GIVEN_NAMES : FEMALE_GIVEN_NAMES;
    const pnPick = randomInt(prng, 0, pGivenPool.length - 1);
    prng = pnPick.nextState;
    const pName = `${pSurnames[psPick.value]} ${pGender === 'male' ? 'Văn' : 'Thị'} ${pGivenPool[pnPick.value]}`;
    const pPlacePool = BIRTH_PLACES_BY_ORIGIN[pOrigin];
    const pbPick = randomInt(prng, 0, pPlacePool.length - 1);
    prng = pbPick.nextState;
    const pCircPool = CIRCUMSTANCES_BY_ORIGIN[pOrigin];
    const pcPick = randomInt(prng, 0, Math.min(2, pCircPool.length - 1));
    prng = pcPick.nextState;
    const deathRoll = randomInt(prng, 28, 78);
    prng = deathRoll.nextState;

    return {
      id: `peer_${idx + 1}`,
      name: pName,
      gender: pGender,
      originClass: pOrigin,
      originLabel: ORIGIN_METADATA[pOrigin].label,
      birthPlace: pPlacePool[pbPick.value],
      circumstanceSummary: pCircPool[pcPick.value].label,
      deathAge: deathRoll.value,
    };
  });

  // Personal pocket assets at birth = 0 (family manages finances during 0-12)
  const wealthCopper = 0;
  const personalRice = 0;

  // 6. Dynasty
  const dPick = randomInt(prng, 0, DYNASTY_NAMES.length - 1);
  prng = dPick.nextState;
  const yPick = randomInt(prng, 1, 25);
  prng = yPick.nextState;

  const dynastyName = DYNASTY_NAMES[dPick.value];
  const meta = ORIGIN_METADATA[originClass];
  const initialHousing =
    circ.housingOverride ??
    (originClass === 'thu_cong' && !isStartDeclined && familyWealthCopper >= 900 ? 'nha_gach' : meta.housing);
  let initialRoleLabel = meta.roleLabel;
  if (originClass === 'dia_chu') {
    initialRoleLabel = gender === 'female' ? 'Tiểu thư nhà địa chủ' : 'Thiếu gia nhà địa chủ';
  } else if (originClass === 'quan_lai') {
    initialRoleLabel = initialFlags.includes('gia_toc_sa_sut')
      ? 'Con nhà quan sa sút'
      : gender === 'female'
        ? 'Thiên kim phủ quan'
        : 'Công tử phủ quan';
  } else if (originClass === 'hoang_toc') {
    if (circ.isTonThat) {
      initialRoleLabel = gender === 'male' ? 'Thế tử phủ Tôn thất' : 'Quận chúa phủ Tôn thất';
    } else {
      initialRoleLabel = gender === 'female' ? 'Công chúa' : 'Hoàng tử';
    }
  }
  const fatherLogDesc =
    circ.fatherAlive === false
      ? `Cha (${fatherOcc.label.toLowerCase()}) đã mất sớm`
      : originClass === 'hoang_toc' && !circ.isTonThat
        ? 'Phụ hoàng đang trị vì'
        : `Cha làm ${fatherOcc.label.toLowerCase()}`;
  const motherLogDesc =
    originClass === 'hoang_toc' && !circ.isTonThat
      ? motherStatus === 'chinh_that'
        ? 'mẫu hậu là Hoàng hậu'
        : 'mẫu phi là phi tần'
      : `mẹ là ${motherOcc.label.toLowerCase()}`;

  return {
    schemaVersion: 1,
    seed,
    prngState: prng,
    isAlive: true,
    profile: {
      fullName,
      gender,
      originClass,
      currentRole: initialRoleLabel,
      totalDays: 0,
    },
    family,
    traits: initialTraits,
    interests: initialInterests,
    stats: {
      health: Math.max(25, Math.min(100, health)),
      happiness,
      relationships,
      education,
      stamina: 100,
      maxStamina: 100,
      martial,
      craftTrade,
      fame,
      infamy: 0,
    },
    assets: {
      wealthCopper,
      rice: personalRice,
      housing: initialHousing,
      properties: [],
    },
    world: {
      dynastyName,
      yearInEra: yPick.value,
      season: 'spring',
      ricePriceInCopper: calculateRicePrice('spring', 'binh_on'),
      worldState: 'binh_on',
    },
    schedule: {
      childhoodFocus: coreCfg.defaultChildhoodFocus,
      morning: 'act_nghi_ngoi',
      afternoon: 'act_nghi_ngoi',
      evening: 'act_nghi_ngoi',
      night: 'act_ngu',
      lifestyle: initialLifestyle,
      lifeFocus: 'sinh_ton',
      fallbackRules: [],
      autoBuyRice: true,
    },
    npcs,
    cohortPeers,
    flags: initialFlags,
    officialRank: 0,
    exposureRisk: 0,
    rebellion: {
      treasuryCopper: 0,
      armyPower: 0,
    },
    delayedEvents: [],
    eventCooldowns: {},
    milestones: [
      {
        totalDays: 0,
        ageYears: 0,
        title: `Chào đời (${meta.label})`,
        netWorthInCopper: familyWealthCopper,
        fame,
      },
    ],
    yearlyHappiness: { 0: happiness },
    logs: [
      {
        day: 0,
        category: 'birth',
        text: `Năm ${dynastyName} thứ ${yPick.value}, ${fullName} chào đời tại ${birthPlace} trong ${meta.label.toLowerCase()} (${birthOrderLabel}). ${fatherLogDesc}, ${motherLogDesc}. ${circ.label}.${isProdigy ? ' Từ thuở lọt lòng đã lộ ánh mắt tinh anh, tư chất thần đồng khác thường.' : ''}`,
      },
    ],
  };
}

