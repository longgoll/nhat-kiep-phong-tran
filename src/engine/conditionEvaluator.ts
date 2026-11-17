import { getAgeYears, type ActiveLifeState } from '../types/activeLife';
import type { ConditionSpec, WeightSpec } from '../types/dsl';

export function evaluateConditions(state: ActiveLifeState, cond?: ConditionSpec): boolean {
  if (!cond) return true;

  const age = getAgeYears(state.profile.totalDays);

  if (cond.min_age !== undefined && age < cond.min_age) return false;
  if (cond.max_age !== undefined && age > cond.max_age) return false;
  if (cond.season_in && !cond.season_in.includes(state.world.season)) return false;

  if (cond.gender !== undefined && state.profile.gender !== cond.gender) return false;
  if (cond.origin_in && !cond.origin_in.includes(state.profile.originClass)) return false;
  if (cond.childhood_focus !== undefined && state.schedule.childhoodFocus !== cond.childhood_focus) return false;
  if (cond.housing_in && !cond.housing_in.includes(state.assets.housing)) return false;
  if (cond.world_state_in && !cond.world_state_in.includes(state.world.worldState)) return false;

  if (cond.min_health !== undefined && state.stats.health < cond.min_health) return false;
  if (cond.max_health !== undefined && state.stats.health > cond.max_health) return false;
  if (cond.min_happiness !== undefined && state.stats.happiness < cond.min_happiness) return false;
  if (cond.max_happiness !== undefined && state.stats.happiness > cond.max_happiness) return false;
  if (cond.min_relationships !== undefined && state.stats.relationships < cond.min_relationships) return false;
  if (cond.max_relationships !== undefined && state.stats.relationships > cond.max_relationships) return false;
  if (cond.min_education !== undefined && state.stats.education < cond.min_education) return false;
  if (cond.max_education !== undefined && state.stats.education > cond.max_education) return false;
  if (cond.min_stamina !== undefined && state.stats.stamina < cond.min_stamina) return false;
  if (cond.min_martial !== undefined && state.stats.martial < cond.min_martial) return false;
  if (cond.max_martial !== undefined && state.stats.martial > cond.max_martial) return false;
  if (cond.min_craft_trade !== undefined && state.stats.craftTrade < cond.min_craft_trade) return false;
  if (cond.max_craft_trade !== undefined && state.stats.craftTrade > cond.max_craft_trade) return false;
  if (cond.min_fame !== undefined && state.stats.fame < cond.min_fame) return false;
  if (cond.max_fame !== undefined && state.stats.fame > cond.max_fame) return false;
  if (cond.min_infamy !== undefined && state.stats.infamy < cond.min_infamy) return false;
  if (cond.max_infamy !== undefined && state.stats.infamy > cond.max_infamy) return false;

  if (cond.min_copper !== undefined && state.assets.wealthCopper < cond.min_copper) return false;
  if (cond.max_copper !== undefined && state.assets.wealthCopper > cond.max_copper) return false;
  if (cond.min_rice !== undefined && state.assets.rice < cond.min_rice) return false;
  if (cond.max_rice !== undefined && state.assets.rice > cond.max_rice) return false;

  if (cond.has_flags) {
    for (const flag of cond.has_flags) {
      if (!state.flags.includes(flag)) return false;
    }
  }

  if (cond.missing_flags) {
    for (const flag of cond.missing_flags) {
      if (state.flags.includes(flag)) return false;
    }
  }

  if (cond.has_any_flag && cond.has_any_flag.length > 0) {
    const hasOne = cond.has_any_flag.some((f) => state.flags.includes(f));
    if (!hasOne) return false;
  }

  if (cond.has_property !== undefined && !state.assets.properties.includes(cond.has_property)) {
    return false;
  }

  const traits = state.traits ?? [];
  const interests = state.interests ?? [];

  if (cond.has_traits) {
    for (const t of cond.has_traits) {
      if (!traits.includes(t)) return false;
    }
  }
  if (cond.has_any_trait && cond.has_any_trait.length > 0) {
    if (!cond.has_any_trait.some((t) => traits.includes(t))) return false;
  }
  if (cond.has_interests) {
    for (const i of cond.has_interests) {
      if (!interests.includes(i)) return false;
    }
  }
  if (cond.has_any_interest && cond.has_any_interest.length > 0) {
    if (!cond.has_any_interest.some((i) => interests.includes(i))) return false;
  }

  if (cond.family_occupation_in && cond.family_occupation_in.length > 0) {
    if (!state.family) return false;
    const matchFather = cond.family_occupation_in.includes(state.family.fatherOccupation);
    const matchMother = cond.family_occupation_in.includes(state.family.motherOccupation);
    if (!matchFather && !matchMother) return false;
  }
  if (cond.family_circumstance_in && cond.family_circumstance_in.length > 0) {
    if (!state.family || !cond.family_circumstance_in.includes(state.family.circumstance)) return false;
  }
  if (cond.birth_order_in && cond.birth_order_in.length > 0) {
    if (!state.family || !cond.birth_order_in.includes(state.family.birthOrder)) return false;
  }
  if (cond.family_tier_in && cond.family_tier_in.length > 0) {
    if (!state.family || !cond.family_tier_in.includes(state.family.familyLivingTier)) return false;
  }

  return true;
}

export function computeWeight(state: ActiveLifeState, spec: WeightSpec): number {
  let total = spec.base;
  if (spec.modifiers) {
    for (const mod of spec.modifiers) {
      if (evaluateConditions(state, mod.conditions)) {
        total += mod.addWeight;
      }
    }
  }
  return Math.max(0, total);
}
