import { getAgeYears, type ActiveLifeState } from '../../types/activeLife';
import type { EffectSpec } from '../../types/dsl';
import {
  MAX_MILESTONES,
  appendLog,
  applyDirectStatDelta,
  applyMoodSocialDelta,
  applyStatDelta,
  clamp,
  computeFamilyLivingTier,
} from './statAndLogHelpers';

export function applyEffects(state: ActiveLifeState, effects: EffectSpec): ActiveLifeState {
  const stats = { ...state.stats };
  const assets = {
    ...state.assets,
    properties: [...state.assets.properties],
  };
  let flags = [...state.flags];
  let officialRank = state.officialRank;
  let official = state.official ? { ...state.official } : undefined;
  let currentRole = state.profile.currentRole;
  let traits = [...(state.traits ?? [])];
  let interests = [...(state.interests ?? [])];
  let family = state.family ? { ...state.family } : undefined;
  let npcs = state.npcs.map((n) => ({ ...n }));
  const delayedEvents = [...state.delayedEvents];
  let milestones = [...state.milestones];
  let isAlive = state.isAlive;
  let deathReason = state.deathReason;

  if (effects.health !== undefined) stats.health = applyDirectStatDelta(stats.health, effects.health);
  if (effects.happiness !== undefined) stats.happiness = applyMoodSocialDelta(stats.happiness, effects.happiness);
  if (effects.relationships !== undefined) stats.relationships = applyMoodSocialDelta(stats.relationships, effects.relationships);
  if (effects.education !== undefined) stats.education = applyStatDelta(stats.education, effects.education);
  if (effects.stamina !== undefined) stats.stamina = clamp(stats.stamina + effects.stamina, 0, stats.maxStamina);
  if (effects.martial !== undefined) stats.martial = Math.max(0, stats.martial + effects.martial);
  if (effects.craft_trade !== undefined) stats.craftTrade = applyStatDelta(stats.craftTrade, effects.craft_trade);
  if (effects.fame !== undefined) stats.fame = Math.max(0, stats.fame + effects.fame);
  if (effects.infamy !== undefined) stats.infamy = Math.max(0, stats.infamy + effects.infamy);

  if (effects.copper !== undefined) assets.wealthCopper = Math.round(assets.wealthCopper + effects.copper);
  if (effects.rice !== undefined) assets.rice = Math.max(0, Number((assets.rice + effects.rice).toFixed(2)));
  if (effects.set_housing !== undefined) assets.housing = effects.set_housing;
  if (effects.add_property && !assets.properties.includes(effects.add_property)) {
    assets.properties.push(effects.add_property);
  }

  let activeCareer = state.activeCareer;
  let schedule = state.schedule;

  if (effects.add_flags) {
    for (const f of effects.add_flags) {
      if (!flags.includes(f)) flags.push(f);
    }
    if (effects.add_flags.includes('gia_toc_sa_sut') && !state.flags.includes('gia_toc_sa_sut')) {
      npcs = npcs.filter((npc) => npc.relation !== 'household');
      if (family) {
        const keptAssets = (family.familyAssetsSummary ?? []).filter(
          (item) =>
            !item.includes('Phủ đệ') &&
            !item.includes('gia nhân') &&
            !item.includes('Quản gia') &&
            !item.includes('gia đinh') &&
            !item.includes('hòm bạc') &&
            !item.includes('Kho bạc'),
        );
        family = {
          ...family,
          familyAssetsSummary: ['Gian nhà nhỏ nơi quê cũ', ...keptAssets, 'Gia nhân đã ly tán'],
        };
      }
      if (state.profile.originClass === 'quan_lai' && officialRank === 0) {
        currentRole = 'Con nhà quan sa sút';
      }
    }
    if (
      effects.add_flags.includes('that_sung_cung_dinh') &&
      !state.flags.includes('that_sung_cung_dinh') &&
      state.profile.originClass === 'hoang_toc'
    ) {
      npcs = npcs.map((npc) => {
        if (npc.id === 'npc_butler' && npc.isAlive) {
          return { ...npc, role: 'Thái giám cũ trung thành nơi lãnh cung' };
        }
        if (npc.id === 'npc_wetnurse' && npc.isAlive) {
          return { ...npc, role: 'Cung nữ thân cận theo hầu mẫu phi' };
        }
        return npc;
      });
      if (family) {
        family = {
          ...family,
          familyAssetsSummary: [
            'Tẩm cung hẻo lánh',
            'Bổng lộc bị cắt giảm',
            'Lão thái giám & cung nữ trung thành',
          ],
        };
      }
    }

    // Sync special fate / servitude roles & clear civilian career
    if (effects.add_flags.includes('bi_ep_lam_gia_no')) {
      currentRole = 'Gia nô trừ nợ';
      activeCareer = null;
      flags = flags.filter((f) => !f.startsWith('career_'));
      schedule = { ...schedule, morning: 'act_lam_gia_no', afternoon: 'act_lam_gia_no' };
    } else if (effects.add_flags.includes('thai_giam')) {
      currentRole = 'Thái giám nội đình';
      activeCareer = null;
      flags = flags.filter((f) => !f.startsWith('career_'));
      schedule = { ...schedule, morning: 'act_hau_can_noi_dinh', afternoon: 'act_hau_can_noi_dinh' };
    } else if (effects.add_flags.includes('trong_hau_cung')) {
      currentRole = 'Cung nữ · Phi tần';
      activeCareer = null;
      flags = flags.filter((f) => !f.startsWith('career_'));
      schedule = { ...schedule, morning: 'act_hau_can_noi_dinh', afternoon: 'act_hau_can_noi_dinh' };
    } else if (effects.add_flags.includes('trong_quan_ngu')) {
      currentRole = 'Binh sĩ tại ngũ';
      activeCareer = null;
      flags = flags.filter((f) => !f.startsWith('career_'));
      schedule = { ...schedule, morning: 'act_tuan_tra_quan_ngu', afternoon: 'act_tuan_tra_quan_ngu' };
    } else if (
      effects.add_flags.includes('tung_o_do') &&
      Math.floor(state.profile.totalDays / 360) < 13
    ) {
      currentRole = 'Đi ở đợ nhà địa chủ';
    }
  }
  if (effects.remove_flags) {
    flags = flags.filter((f) => !effects.remove_flags!.includes(f));
    if (effects.remove_flags.includes('bi_ep_lam_gia_no') && currentRole === 'Gia nô trừ nợ') {
      currentRole = 'Dân thường';
      if (schedule.morning === 'act_lam_gia_no') schedule = { ...schedule, morning: 'act_nghi_ngoi' };
      if (schedule.afternoon === 'act_lam_gia_no') schedule = { ...schedule, afternoon: 'act_nghi_ngoi' };
    }
    if (effects.remove_flags.includes('trong_quan_ngu') && currentRole === 'Binh sĩ tại ngũ') {
      currentRole = 'Dân thường';
      if (schedule.morning === 'act_tuan_tra_quan_ngu') schedule = { ...schedule, morning: 'act_nghi_ngoi' };
      if (schedule.afternoon === 'act_tuan_tra_quan_ngu') schedule = { ...schedule, afternoon: 'act_nghi_ngoi' };
    }
    if (effects.remove_flags.includes('tung_o_do') && currentRole === 'Đi ở đợ nhà địa chủ') {
      currentRole = 'Thiếu niên';
    }
  }
  if (effects.reset_official_rank) {
    officialRank = 0;
    official = undefined;
    currentRole = 'Dân thường';
    flags = flags.filter((f) => f !== 'dang_lam_quan');
  }
  if (effects.official_rank_delta !== undefined && effects.official_rank_delta !== 0) {
    const rankNamesByTrack = {
      van: [
        'Dân thường',
        'Điển sử / Thư lại huyện',
        'Huyện thừa / Huấn đạo',
        'Tri huyện / Hàn lâm Biên tu',
        'Tri châu / Chủ sự Lục bộ',
        'Tri phủ / Lang trung',
        'Án sát sứ / Thiếu khanh',
        'Bố chính sứ / Tuần phủ',
        'Tổng đốc / Thượng thư Lục bộ',
        'Tể tướng / Thái sư / Đại học sĩ',
      ],
      vo: [
        'Dân thường',
        'Đội trưởng / Bách hộ',
        'Phó Thiên hộ / Bả tổng',
        'Thiên hộ / Thủ bị',
        'Du kích / Chỉ huy Thiêm sự',
        'Tham tướng / Chỉ huy sứ',
        'Phó tướng / Phó Đô đốc',
        'Tổng binh / Đô đốc Đồng tri',
        'Ngũ quân Đô đốc / Binh bộ Thượng thư',
        'Đại Nguyên soái / Thái úy',
      ],
      hoan_quan: [
        'Dân thường',
        'Tiểu Thái giám',
        'Thủ lĩnh Thái giám',
        'Giám thừa Nội đình',
        'Thiếu giám',
        'Đốc công Thái giám',
        'Bỉnh bút Thái giám',
        'Chưởng ấn Thái giám',
        'Đề đốc Đông Xưởng',
        'Cửu Thiên Tuế',
      ],
    };
    const track = official?.track ?? (flags.includes('thai_giam') ? 'hoan_quan' : 'van');
    const maxCap = official?.isHanhHam ? 5 : 9;
    officialRank = Math.max(0, Math.min(maxCap, officialRank + effects.official_rank_delta));
    currentRole = rankNamesByTrack[track][officialRank] ?? 'Dân thường';
    if (officialRank === 0) {
      flags = flags.filter((f) => f !== 'dang_lam_quan');
      official = undefined;
    } else {
      if (!flags.includes('dang_lam_quan')) {
        flags.push('dang_lam_quan');
      }
      if (official) {
        official.rank = officialRank;
        official.title = currentRole;
      } else {
        const inferredTrack = flags.includes('thai_giam')
          ? 'hoan_quan'
          : flags.includes('trong_quan_ngu')
            ? 'vo'
            : 'van';
        official = {
          track: inferredTrack,
          rank: officialRank,
          title: rankNamesByTrack[inferredTrack][officialRank] ?? currentRole,
          posting: inferredTrack === 'vo' ? 'bien_ai' : 'dong_bang',
          tenureStartDay: state.profile.totalDays,
          lastReviewDay: state.profile.totalDays,
          merit: 15,
          publicTrust: 10,
          imperialFavor: 15,
          scandalRisk: 0,
          faction: inferredTrack === 'hoan_quan' ? 'yem_dang' : 'chua_dung_phe',
          familyAccompanied: false,
          maidsCount: 0,
          guardsCount: 0,
          hasAdvisor: false,
          proxyBusinessIds: [],
        };
        currentRole = official.title;
      }
    }
  }
  if (official) {
    if (effects.merit !== undefined) {
      official.merit = Math.max(0, official.merit + effects.merit);
    }
    if (effects.public_trust !== undefined) {
      official.publicTrust = Math.max(-100, Math.min(100, official.publicTrust + effects.public_trust));
    }
    if (effects.imperial_favor !== undefined) {
      official.imperialFavor = Math.max(0, Math.min(100, official.imperialFavor + effects.imperial_favor));
    }
    if (effects.scandal_risk !== undefined) {
      official.scandalRisk = Math.max(0, Math.min(100, official.scandalRisk + effects.scandal_risk));
    }
    if (effects.official_faction !== undefined) {
      official.faction = effects.official_faction;
    }
    if (effects.suspend_salary_days !== undefined && effects.suspend_salary_days > 0) {
      official.salarySuspendedUntilDay = state.profile.totalDays + effects.suspend_salary_days;
    }
  }
  if (effects.confiscate_assets) {
    assets.wealthCopper = Math.min(assets.wealthCopper, 500);
    assets.properties = [];
    if (official) {
      official.proxyBusinessIds = [];
    }
  }

  if (effects.add_traits) {
    for (const t of effects.add_traits) {
      if (!traits.includes(t)) traits.push(t);
    }
  }
  if (effects.remove_traits) {
    traits = traits.filter((t) => !effects.remove_traits!.includes(t));
  }
  if (effects.add_interests) {
    for (const i of effects.add_interests) {
      if (!interests.includes(i)) interests.push(i);
    }
  }
  if (effects.family_copper !== undefined && family) {
    family.familyWealthCopper = Math.max(0, family.familyWealthCopper + effects.family_copper);
    family.familyLivingTier = computeFamilyLivingTier(family.familyWealthCopper, state.profile.originClass);
  }
  if (effects.scale_family_copper !== undefined && family) {
    family.familyWealthCopper = Math.max(0, Math.round(family.familyWealthCopper * effects.scale_family_copper));
    family.familyLivingTier = computeFamilyLivingTier(family.familyWealthCopper, state.profile.originClass);
  }
  if (effects.set_circumstance && family) {
    family.circumstance = effects.set_circumstance.id;
    family.circumstanceLabel = effects.set_circumstance.label;
  }
  if (effects.kill_npc_id) {
    npcs = npcs.map((npc) => {
      if (npc.id === effects.kill_npc_id && npc.isAlive) {
        const cleanRole = npc.role.includes('(Đã mất)') ? npc.role : `${npc.role} (Đã mất)`;
        return { ...npc, isAlive: false, role: cleanRole };
      }
      return npc;
    });
    if (effects.kill_npc_id === 'npc_father' && !flags.includes('mo_coi_cha')) {
      flags.push('mo_coi_cha');
    }
    if (effects.kill_npc_id === 'npc_mother' && !flags.includes('mo_coi_me')) {
      flags.push('mo_coi_me');
    }
  }

  if (effects.npc_affinity) {
    for (const mod of effects.npc_affinity) {
      let totalDelta = 0;
      let matched = 0;
      npcs = npcs.map((npc) => {
        const matchId = mod.npc_id && npc.id === mod.npc_id && npc.isAlive;
        const matchRel = mod.relation && npc.relation === mod.relation && npc.isAlive;
        if (matchId || matchRel) {
          matched += 1;
          totalDelta += mod.delta;
          return { ...npc, affinity: clamp(npc.affinity + mod.delta, -100, 100) };
        }
        return npc;
      });
      // Sync 20% of NPC affinity delta to general relationships stat (with diminishing returns above 70)
      if (matched > 0) {
        const avgDelta = totalDelta / matched;
        stats.relationships = Math.round(applyStatDelta(stats.relationships, avgDelta * 0.2));
      }
    }
  }

  if (effects.schedule_delayed) {
    for (const item of effects.schedule_delayed) {
      delayedEvents.push({
        eventId: item.event_id,
        triggerDay: state.profile.totalDays + item.delay_days,
      });
    }
  }

  if (effects.milestone_title && milestones.length < MAX_MILESTONES) {
    milestones = [
      ...milestones,
      {
        totalDays: state.profile.totalDays,
        ageYears: getAgeYears(state.profile.totalDays),
        title: effects.milestone_title,
        netWorthInCopper: assets.wealthCopper + Math.round(assets.rice * state.world.ricePriceInCopper),
        fame: stats.fame,
      },
    ];
  }

  if (effects.kill_reason) {
    stats.health = 0;
    isAlive = false;
    deathReason = effects.kill_reason;
  } else if (stats.health <= 0) {
    isAlive = false;
    deathReason = deathReason ?? 'Sức khỏe suy kiệt qua đời';
  }

  let nextLogs = state.logs;
  if (state.isAlive && !isAlive && deathReason) {
    nextLogs = appendLog(
      nextLogs,
      state.profile.totalDays,
      'warning',
      `Qua đời ở tuổi ${getAgeYears(state.profile.totalDays)}: ${deathReason}.`,
      { tone: 'negative' },
    );
  }

  return {
    ...state,
    profile: {
      ...state.profile,
      currentRole,
    },
    officialRank,
    official,
    isAlive,
    deathReason,
    stats,
    assets,
    family,
    traits,
    interests,
    flags,
    activeCareer,
    schedule,
    npcs,
    delayedEvents,
    milestones,
    logs: nextLogs,
  };
}
