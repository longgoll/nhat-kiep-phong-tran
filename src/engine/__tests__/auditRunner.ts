import fs from 'node:fs';
import path from 'node:path';
import { expect } from 'vitest';
import {
  ALL_ACTIONS as ACTIONS,
  ALL_ADULTHOOD_EVENTS as EVENTS,
  ALL_CHILDHOOD_EVENTS as CHILDHOOD_EVENTS,
} from '../../data/registry';
import {
  DAYS_PER_YEAR,
  getAgeYears,
  type ActiveLifeState,
  type LifeFocusId,
  type OriginClass,
} from '../../types/activeLife';
import type { GameEventDef } from '../../types/dsl';
import {
  buyGoldReserve,
  canHaveChild,
  canMarrySpouse,
  executeInstantAdultAction,
  haveChild,
  marrySpouse,
} from '../adultLifeActions';
import { advanceChildhoodMonth, resolveEventChoice } from '../childhoodEngine';
import { advanceDays, type AutoPauseConfig } from '../daySimulator';
import { applyDynamicDecisionSideEffects } from '../decisionGenerator';
import { createNewLife } from '../lifeInitializer';
import {
  appointOrPromoteOfficial,
  buyProperty,
  getExamEligibility,
  getHousingMarketCost,
  getPropertyMarketCost,
  getVisibleProperties,
  takeExam,
  upgradeHousing,
} from '../progressionModules';

const SILENT_AUTOPAUSE: AutoPauseConfig = {
  pauseOnBirthday: false,
  pauseOnLowHealth: false,
  pauseOnLowHappiness: false,
  pauseOnNoFood: false,
};

export const ALL_ORIGINS: OriginClass[] = ['ban_nong', 'thu_cong', 'dia_chu', 'quan_lai', 'hoang_toc'];

export interface ArchetypeConfig {
  id: string;
  focus: LifeFocusId;
  morning: string;
  afternoon: string;
  preferCollegeChoice: number;
  tryMarriage: boolean;
  tryChildren: boolean;
  tryExams: boolean;
  tryVenture: boolean;
  tryPropertyAndGold: boolean;
  tryHobby: boolean;
  tryUpgradeLifestyle: boolean;
  riskyChoices: boolean;
}

export const ARCHETYPES: ArchetypeConfig[] = [
  {
    id: 'cong_danh_exam',
    focus: 'cong_danh',
    morning: 'act_tu_hoc_chu',
    afternoon: 'act_tu_hoc_chu',
    preferCollegeChoice: 0,
    tryMarriage: true,
    tryChildren: true,
    tryExams: true,
    tryVenture: false,
    tryPropertyAndGold: true,
    tryHobby: false,
    tryUpgradeLifestyle: true,
    riskyChoices: false,
  },
  {
    id: 'gia_dinh_marriage',
    focus: 'gia_dinh',
    morning: 'act_lam_thue_nong_vu',
    afternoon: 'act_nghi_ngoi',
    preferCollegeChoice: 1,
    tryMarriage: true,
    tryChildren: true,
    tryExams: false,
    tryVenture: false,
    tryPropertyAndGold: true,
    tryHobby: false,
    tryUpgradeLifestyle: true,
    riskyChoices: false,
  },
  {
    id: 'thuong_buon_venture',
    focus: 'lam_them',
    morning: 'act_lam_thue_nong_vu',
    afternoon: 'act_lam_thue_nong_vu',
    preferCollegeChoice: 1,
    tryMarriage: true,
    tryChildren: false,
    tryExams: false,
    tryVenture: true,
    tryPropertyAndGold: true,
    tryHobby: false,
    tryUpgradeLifestyle: true,
    riskyChoices: false,
  },
  {
    id: 'dien_san_gold',
    focus: 'can_bang',
    morning: 'act_lam_thue_nong_vu',
    afternoon: 'act_nghi_ngoi',
    preferCollegeChoice: 3,
    tryMarriage: true,
    tryChildren: true,
    tryExams: false,
    tryVenture: false,
    tryPropertyAndGold: true,
    tryHobby: false,
    tryUpgradeLifestyle: false,
    riskyChoices: false,
  },
  {
    id: 'suc_khoe_longevity',
    focus: 'suc_khoe',
    morning: 'act_lam_thue_nong_vu',
    afternoon: 'act_nghi_ngoi',
    preferCollegeChoice: 2,
    tryMarriage: false,
    tryChildren: false,
    tryExams: false,
    tryVenture: false,
    tryPropertyAndGold: false,
    tryHobby: false,
    tryUpgradeLifestyle: true,
    riskyChoices: false,
  },
  {
    id: 'tu_than_moral',
    focus: 'tu_than',
    morning: 'act_doc_sach_khoa_cu',
    afternoon: 'act_nghi_ngoi',
    preferCollegeChoice: 0,
    tryMarriage: false,
    tryChildren: false,
    tryExams: true,
    tryVenture: false,
    tryPropertyAndGold: false,
    tryHobby: false,
    tryUpgradeLifestyle: false,
    riskyChoices: false,
  },
  {
    id: 'so_thich_hobby',
    focus: 'so_thich',
    morning: 'act_lam_thue_nong_vu',
    afternoon: 'act_nghi_ngoi',
    preferCollegeChoice: 1,
    tryMarriage: true,
    tryChildren: false,
    tryExams: false,
    tryVenture: false,
    tryPropertyAndGold: false,
    tryHobby: true,
    tryUpgradeLifestyle: false,
    riskyChoices: false,
  },
  {
    id: 'nghi_ngoi_chill',
    focus: 'nghi_ngoi',
    morning: 'act_nghi_ngoi',
    afternoon: 'act_nghi_ngoi',
    preferCollegeChoice: 3,
    tryMarriage: false,
    tryChildren: false,
    tryExams: false,
    tryVenture: false,
    tryPropertyAndGold: false,
    tryHobby: false,
    tryUpgradeLifestyle: false,
    riskyChoices: false,
  },
  {
    id: 'hanh_thien_fame',
    focus: 'hanh_thien',
    morning: 'act_lam_thue_nong_vu',
    afternoon: 'act_nghi_ngoi',
    preferCollegeChoice: 0,
    tryMarriage: true,
    tryChildren: true,
    tryExams: false,
    tryVenture: false,
    tryPropertyAndGold: true,
    tryHobby: false,
    tryUpgradeLifestyle: true,
    riskyChoices: false,
  },
  {
    id: 'risk_debt_hardship',
    focus: 'lam_them',
    morning: 'act_lam_thue_nong_vu',
    afternoon: 'act_lam_thue_nong_vu',
    preferCollegeChoice: 3,
    tryMarriage: false,
    tryChildren: false,
    tryExams: false,
    tryVenture: true,
    tryPropertyAndGold: false,
    tryHobby: false,
    tryUpgradeLifestyle: false,
    riskyChoices: true,
  },
];

function createStarter(seed: number, originClass: OriginClass, arch: ArchetypeConfig): ActiveLifeState {
  let life = createNewLife(seed);
  for (let offset = 0; offset < 500; offset += 1) {
    const candidate = createNewLife(seed + offset);
    if (candidate.profile.originClass === originClass) {
      life = candidate;
      break;
    }
  }
  const childhoodPool = [...CHILDHOOD_EVENTS];
  let guard = 0;
  while (life.isAlive && getAgeYears(life.profile.totalDays) < 13 && guard < 200) {
    guard += 1;
    const step = advanceChildhoodMonth(life, childhoodPool);
    life = step.state;
    if (step.pendingEvent) {
      const idx = (life.profile.totalDays + arch.id.length) % step.pendingEvent.choices.length;
      life = resolveEventChoice(life, step.pendingEvent, idx).state;
    }
  }
  if (!life.isAlive) {
    life = createNewLife(seed);
    life = {
      ...life,
      profile: { ...life.profile, originClass, totalDays: 13 * DAYS_PER_YEAR, currentRole: 'Thiếu niên' },
    };
  }
  return {
    ...life,
    assets: {
      ...life.assets,
      rice: Math.max(life.assets.rice, 30),
      wealthCopper: Math.max(life.assets.wealthCopper, 150),
    },
    schedule: {
      ...life.schedule,
      lifeFocus: arch.focus,
      morning: arch.morning,
      afternoon: arch.afternoon,
      evening: 'act_nghi_ngoi',
      night: 'act_ngu',
    },
  };
}

function applyAnnualBotSpendAndInvest(state: ActiveLifeState, arch: ArchetypeConfig): ActiveLifeState {
  let s = state;
  const age = getAgeYears(s.profile.totalDays);
  if (age < 18 || !s.isAlive || s.livelihoodStatus === 'prison') return s;

  s = {
    ...s,
    schedule: {
      ...s.schedule,
      lifeFocus: arch.focus,
      lifestyle:
        arch.tryUpgradeLifestyle && s.assets.wealthCopper > 2000
          ? 'thit_ca'
          : s.assets.wealthCopper < 100
            ? 'chao_loang'
            : 'com_rau',
    },
  };

  if (arch.tryMarriage && age >= 20 && canMarrySpouse(s).ok) {
    s = marrySpouse(s);
  }
  if (arch.tryChildren && age >= 22 && age <= 45 && canHaveChild(s).ok) {
    s = haveChild(s);
  }

  if (arch.tryExams) {
    for (const lvl of ['huong', 'hoi', 'dinh'] as const) {
      if (getExamEligibility(s, lvl).ok) {
        s = takeExam(s, lvl);
        break;
      }
    }
    s = appointOrPromoteOfficial(s);
  }

  if (arch.tryHobby && s.assets.wealthCopper >= 200) {
    const res = executeInstantAdultAction(s, 'inst_hobby_practice');
    if (res.ok) s = res.state;
  }

  if (arch.tryPropertyAndGold) {
    if (s.assets.wealthCopper > 1500) {
      s = buyGoldReserve(s, 300);
    }
    const props = getVisibleProperties(s).filter((p) => !s.assets.properties.includes(p.id));
    if (props.length > 0) {
      const cost = getPropertyMarketCost(props[0], s.world.worldState);
      if (s.assets.wealthCopper > cost + 500) {
        s = buyProperty(s, props[0].id);
      }
    }
    if (s.assets.housing === 'nha_tranh') {
      const hCost = getHousingMarketCost('nha_gach', s.world.worldState);
      if (s.assets.wealthCopper > hCost + 800) {
        s = upgradeHousing(s, 'nha_gach');
      }
    }
  }

  if (
    arch.tryVenture &&
    !s.activeVenture &&
    !s.flags.includes('cho_khoi_nghiep') &&
    s.assets.wealthCopper >= 800 &&
    age >= 22
  ) {
    s = {
      ...s,
      investmentChannel: 'caravan',
      flags: [...s.flags, 'cho_khoi_nghiep'],
    };
  }

  return s;
}

function pickChoice(state: ActiveLifeState, event: GameEventDef, arch: ArchetypeConfig): number {
  if (event.choices.length <= 1) return 0;
  if (event.id === 'dec_college_18') {
    return Math.min(arch.preferCollegeChoice, event.choices.length - 1);
  }
  if (
    event.id === 'dec_job_offers' ||
    event.id === 'dec_rankup' ||
    event.id === 'dec_biz_offers' ||
    event.id === 'dec_official_appoint' ||
    event.id === 'dec_official_promote'
  ) {
    return 0;
  }
  if (event.id === 'dec_retire_60') {
    return arch.focus === 'lam_them' ? 1 : 0;
  }
  if (arch.riskyChoices) {
    return event.choices.length - 1;
  }
  return (state.profile.totalDays + arch.id.length) % event.choices.length;
}

export interface LifeAuditRecord {
  origin: OriginClass;
  archetype: string;
  focus: LifeFocusId;
  seed: number;
  finalAge: number;
  isAlive: boolean;
  deathReason: string;
  finalCopper: number;
  finalEducation: number;
  finalFame: number;
  officialRank: number;
  hadSpouse: boolean;
  childrenCount: number;
  propertiesCount: number;
  hadVenture: boolean;
  hadCareer: boolean;
  eventsFired: string[];
  decisionsFired: string[];
  anomalies: string[];
  timeline: string[];
}

export interface AuditShardOutput {
  origin: OriginClass;
  majorEventIds: string[];
  records: LifeAuditRecord[];
}

function runOneLife(seed: number, origin: OriginClass, arch: ArchetypeConfig): LifeAuditRecord {
  let state = createStarter(seed, origin, arch);
  const eventsFired: string[] = [];
  const decisionsFired: string[] = [];
  const anomalies: string[] = [];
  const timeline: string[] = [];

  let lastBotSeasonKey = '';
  let guard = 0;
  const maxDays = 80 * DAYS_PER_YEAR;

  while (state.isAlive && state.profile.totalDays < maxDays && guard < 1200) {
    guard += 1;
    const curAge = getAgeYears(state.profile.totalDays);
    const seasonKey = `${curAge}_${state.world.season}`;
    if (seasonKey !== lastBotSeasonKey) {
      lastBotSeasonKey = seasonKey;
      state = applyAnnualBotSpendAndInvest(state, arch);
      if (state.livelihoodStatus !== 'prison' && !state.flags.includes('trong_hau_cung')) {
        if (state.assets.wealthCopper < 40 && state.assets.rice < 5) {
          state = {
            ...state,
            schedule: { ...state.schedule, afternoon: 'act_lam_thue_nong_vu' },
          };
        } else if (state.assets.wealthCopper >= 120 && state.schedule.afternoon !== arch.afternoon) {
          state = {
            ...state,
            schedule: { ...state.schedule, afternoon: arch.afternoon },
          };
        }
      }
    }

    const stepDays = Math.min(90, maxDays - state.profile.totalDays);
    const res = advanceDays(state, stepDays, ACTIONS, EVENTS, SILENT_AUTOPAUSE);
    state = res.state;

    if (
      Number.isNaN(state.stats.health) ||
      Number.isNaN(state.stats.happiness) ||
      Number.isNaN(state.stats.education) ||
      Number.isNaN(state.assets.wealthCopper)
    ) {
      anomalies.push(`NaN_DETECTED_AT_AGE_${getAgeYears(state.profile.totalDays)}`);
      break;
    }

    if (res.pendingEvent) {
      const evt = res.pendingEvent;
      const age = getAgeYears(state.profile.totalDays);

      if (state.livelihoodStatus === 'prison' && evt.id === 'dec_college_18') {
        anomalies.push(`PRISON_COLLEGE_CONFLICT_AGE_${age}`);
      }
      if (
        state.flags.includes('trong_hau_cung') &&
        (evt.id === 'dec_college_18' || evt.id === 'dec_job_offers' || evt.id === 'dec_biz_offers')
      ) {
        anomalies.push(`PALACE_CONCUBINE_CONFLICT_${evt.id}_AGE_${age}`);
      }
      const livingSpouse = state.npcs.some((n) => n.relation === 'spouse' && n.isAlive);
      if (evt.id.includes('spouse') && !livingSpouse) {
        anomalies.push(`NO_LIVING_SPOUSE_FOR_${evt.id}_AGE_${age}`);
      }

      const idx = pickChoice(state, evt, arch);
      const resolved = resolveEventChoice(state, evt, idx);
      state = evt.id.startsWith('dec_')
        ? applyDynamicDecisionSideEffects(resolved.state, evt.id, idx)
        : resolved.state;

      if (evt.id.startsWith('dec_')) decisionsFired.push(evt.id);
      else eventsFired.push(evt.id);

      timeline.push(`[Tuổi ${age}] ${evt.id} (${evt.title}) -> #${idx}`);
    }
  }

  return {
    origin,
    archetype: arch.id,
    focus: arch.focus,
    seed,
    finalAge: getAgeYears(state.profile.totalDays),
    isAlive: state.isAlive,
    deathReason: state.deathReason ?? (state.isAlive ? 'Sống qua 80 tuổi' : 'Không rõ'),
    finalCopper: state.assets.wealthCopper,
    finalEducation: state.stats.education,
    finalFame: state.stats.fame,
    officialRank: state.officialRank,
    hadSpouse: state.npcs.some((n) => n.relation === 'spouse'),
    childrenCount: state.npcs.filter((n) => n.relation === 'child').length,
    propertiesCount: state.assets.properties.length,
    hadVenture: Boolean(state.activeVenture),
    hadCareer: Boolean(state.activeCareer) || state.livelihoodStatus === 'retired',
    eventsFired,
    decisionsFired,
    anomalies,
    timeline,
  };
}

export function getAuditConfigFromEnv(): {
  seedsPerCombo: number;
  origins: OriginClass[];
  archetypes: ArchetypeConfig[];
} {
  const seedsPerCombo = Math.max(1, Number(process.env.AUDIT_SEEDS ?? '4'));
  const rawOrigins = process.env.AUDIT_ORIGINS?.trim();
  const rawArchs = process.env.AUDIT_ARCHS?.trim();

  const origins = rawOrigins
    ? (rawOrigins.split(',').map((s) => s.trim()).filter(Boolean) as OriginClass[])
    : ALL_ORIGINS;
  const archFilter = rawArchs
    ? new Set(rawArchs.split(',').map((s) => s.trim()).filter(Boolean))
    : null;
  const archetypes = archFilter
    ? ARCHETYPES.filter((a) => archFilter.has(a.id))
    : ARCHETYPES;

  return { seedsPerCombo, origins, archetypes };
}

export const AUDIT_SHARDS_DIR = path.resolve(process.cwd(), 'docs', '.audit-shards');

export async function runAuditForOrigin(origin: OriginClass): Promise<void> {
  const { seedsPerCombo, origins, archetypes } = getAuditConfigFromEnv();
  const majorEventIds = EVENTS.filter(
    (e) => (e.stage === 'adulthood' || e.stage === 'any') && e.severity === 'major' && e.cooldownDays > 0,
  ).map((e) => e.id);

  if (!origins.includes(origin) || archetypes.length === 0) {
    fs.mkdirSync(AUDIT_SHARDS_DIR, { recursive: true });
    const emptyPayload: AuditShardOutput = { origin, majorEventIds, records: [] };
    fs.writeFileSync(path.join(AUDIT_SHARDS_DIR, `${origin}.json`), JSON.stringify(emptyPayload), 'utf8');
    return;
  }

  const originIdx = ALL_ORIGINS.indexOf(origin);
  const records: LifeAuditRecord[] = [];

  for (const arch of archetypes) {
    const archIdx = ARCHETYPES.findIndex((a) => a.id === arch.id);
    for (let i = 0; i < seedsPerCombo; i++) {
      const seed = 5000 + ((originIdx * ARCHETYPES.length + archIdx) * seedsPerCombo + i + 1) * 13;
      const rec = runOneLife(seed, origin, arch);
      records.push(rec);
      if (records.length % 10 === 0) {
        await new Promise((r) => setTimeout(r, 0));
      }
    }
  }

  expect(records.length).toBe(archetypes.length * seedsPerCombo);
  const allAnomalies = records.flatMap((r) =>
    r.anomalies.map((a) => `${r.origin}/${r.archetype}#${r.seed}: ${a}`),
  );
  expect(allAnomalies).toEqual([]);

  fs.mkdirSync(AUDIT_SHARDS_DIR, { recursive: true });
  const payload: AuditShardOutput = { origin, majorEventIds, records };
  fs.writeFileSync(path.join(AUDIT_SHARDS_DIR, `${origin}.json`), JSON.stringify(payload), 'utf8');
}
