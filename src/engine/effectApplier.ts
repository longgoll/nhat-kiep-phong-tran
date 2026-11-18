import { getAgeYears, type ActiveLifeState, type LogEntry } from '../types/activeLife';
import type { EffectSpec } from '../types/dsl';

const MAX_LOGS = 150;
const MAX_MILESTONES = 30;

function clamp(val: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, val));
}

/**
 * Applies a delta to a 0-100 core stat with diminishing returns above 70
 * (inspired by 1in8b.life: easy to recover when low, progressively harder to push past 70/80/90).
 */
export function applyStatDelta(current: number, delta: number): number {
  if (delta <= 0) {
    return clamp(Number((current + delta).toFixed(2)), 0, 100);
  }
  let mult = 1.0;
  if (current >= 95) mult = 0.06;
  else if (current >= 90) mult = 0.15;
  else if (current >= 80) mult = 0.30;
  else if (current >= 70) mult = 0.55;
  return clamp(Number((current + delta * mult).toFixed(2)), 0, 100);
}

export function appendLog(
  logs: LogEntry[],
  day: number,
  category: LogEntry['category'],
  text: string,
  options?: { tone?: LogEntry['tone']; subNote?: string },
): LogEntry[] {
  const entry: LogEntry = {
    day,
    category,
    text,
    ...(options?.tone ? { tone: options.tone } : {}),
    ...(options?.subNote ? { subNote: options.subNote } : {}),
  };
  const next = [...logs, entry];
  if (next.length > MAX_LOGS) {
    return next.slice(next.length - MAX_LOGS);
  }
  return next;
}

function computeFamilyLivingTier(
  wealthCopper: number,
  originClass: ActiveLifeState['profile']['originClass'],
): NonNullable<ActiveLifeState['family']>['familyLivingTier'] {
  if (originClass === 'hoang_toc') return 'hoang_gia';
  if (wealthCopper >= 12000) return 'sung_tuc';
  if (wealthCopper >= 3000) return 'kha_gia';
  if (wealthCopper >= 350) return 'du_an';
  return 'tung_thieu';
}

export function applyEffects(state: ActiveLifeState, effects: EffectSpec): ActiveLifeState {
  const stats = { ...state.stats };
  const assets = {
    ...state.assets,
    properties: [...state.assets.properties],
  };
  let flags = [...state.flags];
  let traits = [...(state.traits ?? [])];
  let interests = [...(state.interests ?? [])];
  let family = state.family ? { ...state.family } : undefined;
  let npcs = state.npcs.map((n) => ({ ...n }));
  const delayedEvents = [...state.delayedEvents];
  let milestones = [...state.milestones];
  let isAlive = state.isAlive;
  let deathReason = state.deathReason;

  if (effects.health !== undefined) stats.health = applyStatDelta(stats.health, effects.health);
  if (effects.happiness !== undefined) stats.happiness = applyStatDelta(stats.happiness, effects.happiness);
  if (effects.relationships !== undefined) stats.relationships = applyStatDelta(stats.relationships, effects.relationships);
  if (effects.education !== undefined) stats.education = applyStatDelta(stats.education, effects.education);
  if (effects.stamina !== undefined) stats.stamina = clamp(stats.stamina + effects.stamina, 0, stats.maxStamina);
  if (effects.martial !== undefined) stats.martial = Math.max(0, stats.martial + effects.martial);
  if (effects.craft_trade !== undefined) stats.craftTrade = Math.max(0, stats.craftTrade + effects.craft_trade);
  if (effects.fame !== undefined) stats.fame = Math.max(0, stats.fame + effects.fame);
  if (effects.infamy !== undefined) stats.infamy = Math.max(0, stats.infamy + effects.infamy);

  if (effects.copper !== undefined) assets.wealthCopper = Math.max(0, assets.wealthCopper + effects.copper);
  if (effects.rice !== undefined) assets.rice = Math.max(0, Number((assets.rice + effects.rice).toFixed(2)));
  if (effects.set_housing !== undefined) assets.housing = effects.set_housing;
  if (effects.add_property && !assets.properties.includes(effects.add_property)) {
    assets.properties.push(effects.add_property);
  }

  if (effects.add_flags) {
    for (const f of effects.add_flags) {
      if (!flags.includes(f)) flags.push(f);
    }
  }
  if (effects.remove_flags) {
    flags = flags.filter((f) => !effects.remove_flags!.includes(f));
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
  }

  if (effects.npc_affinity) {
    for (const mod of effects.npc_affinity) {
      let totalDelta = 0;
      let matched = 0;
      npcs = npcs.map((npc) => {
        const matchId = mod.npc_id && npc.id === mod.npc_id;
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

  return {
    ...state,
    isAlive,
    deathReason,
    stats,
    assets,
    family,
    traits,
    interests,
    flags,
    npcs,
    delayedEvents,
    milestones,
  };
}
