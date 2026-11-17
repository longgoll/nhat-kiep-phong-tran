/// <reference types="vite/client" />
import type {
  ActionDef,
  ChildhoodActivityDef,
  ChildhoodAmbientData,
  GameEventDef,
} from '../types/dsl';

function flattenArrayModules<T>(modules: Record<string, T[]>): T[] {
  return Object.keys(modules)
    .sort()
    .flatMap((key) => modules[key] ?? []);
}

const actionModules = import.meta.glob<ActionDef[]>('./actions/*.json', {
  eager: true,
  import: 'default',
});

const activityModules = import.meta.glob<ChildhoodActivityDef[]>('./activities/*.json', {
  eager: true,
  import: 'default',
});

const thoAuEventModules = import.meta.glob<GameEventDef[]>('./events/tho_au/*.json', {
  eager: true,
  import: 'default',
});

const dongAuEventModules = import.meta.glob<GameEventDef[]>('./events/dong_au/*.json', {
  eager: true,
  import: 'default',
});

const truongThanhEventModules = import.meta.glob<GameEventDef[]>('./events/truong_thanh/*.json', {
  eager: true,
  import: 'default',
});

const chainEventModules = import.meta.glob<GameEventDef[]>('./events/chains/*.json', {
  eager: true,
  import: 'default',
});

const ambientModules = import.meta.glob<Partial<ChildhoodAmbientData>>('./ambient/*.json', {
  eager: true,
  import: 'default',
});

export const ALL_ACTIONS: ActionDef[] = flattenArrayModules(actionModules);
export const CHILDHOOD_ACTIVITIES: ChildhoodActivityDef[] = flattenArrayModules(activityModules);

const THO_AU_EVENTS: GameEventDef[] = flattenArrayModules(thoAuEventModules);
const DONG_AU_EVENTS: GameEventDef[] = flattenArrayModules(dongAuEventModules);
const TRUONG_THANH_EVENTS: GameEventDef[] = flattenArrayModules(truongThanhEventModules);
const CHAIN_EVENTS: GameEventDef[] = flattenArrayModules(chainEventModules);

export const ALL_CHILDHOOD_EVENTS: GameEventDef[] = [
  ...THO_AU_EVENTS,
  ...DONG_AU_EVENTS,
  ...CHAIN_EVENTS.filter((e) => e.stage === 'infancy' || e.stage === 'childhood' || e.stage === 'any'),
];

export const ALL_ADULTHOOD_EVENTS: GameEventDef[] = [
  ...TRUONG_THANH_EVENTS,
  ...CHAIN_EVENTS.filter((e) => e.stage === 'adulthood' || e.stage === 'any'),
];

export const ALL_EVENTS: GameEventDef[] = [
  ...THO_AU_EVENTS,
  ...DONG_AU_EVENTS,
  ...TRUONG_THANH_EVENTS,
  ...CHAIN_EVENTS,
];

export const CHILDHOOD_AMBIENT_DATA: ChildhoodAmbientData = Object.keys(ambientModules)
  .sort()
  .reduce<ChildhoodAmbientData>(
    (acc, key) => {
      const mod = ambientModules[key];
      if (mod?.infancyMilestones) {
        acc.infancyMilestones.push(...mod.infancyMilestones);
      }
      if (mod?.focusAmbientLogs) {
        acc.focusAmbientLogs.push(...mod.focusAmbientLogs);
      }
      return acc;
    },
    { infancyMilestones: [], focusAmbientLogs: [] },
  );
