import type { Gender, HousingTier, OriginClass, Season, TimeSlot, WorldState } from './activeLife';

export interface ConditionSpec {
  min_age?: number;
  max_age?: number;
  season_in?: Season[];

  gender?: Gender;
  origin_in?: OriginClass[];
  childhood_focus?: string;
  housing_in?: HousingTier[];
  world_state_in?: WorldState[];

  min_health?: number;
  max_health?: number;
  min_happiness?: number;
  max_happiness?: number;
  min_relationships?: number;
  max_relationships?: number;
  min_education?: number;
  max_education?: number;
  min_stamina?: number;
  min_martial?: number;
  max_martial?: number;
  min_craft_trade?: number;
  max_craft_trade?: number;
  min_fame?: number;
  max_fame?: number;
  min_infamy?: number;
  max_infamy?: number;

  min_copper?: number;
  max_copper?: number;
  min_rice?: number;
  max_rice?: number;

  has_flags?: string[];
  missing_flags?: string[];
  has_any_flag?: string[];
  has_property?: string;
  has_any_property?: boolean;
  has_living_parent?: boolean;
  has_living_npc_id?: string;
  min_official_rank?: number;
  max_official_rank?: number;

  has_traits?: string[];
  has_any_trait?: string[];
  has_interests?: string[];
  has_any_interest?: string[];
  family_occupation_in?: string[];
  family_circumstance_in?: string[];
  birth_order_in?: string[];
  family_tier_in?: string[];
}

export interface EffectSpec {
  health?: number;
  happiness?: number;
  relationships?: number;
  education?: number;
  stamina?: number;
  martial?: number;
  craft_trade?: number;
  fame?: number;
  infamy?: number;

  copper?: number;
  rice?: number;
  set_housing?: HousingTier;
  add_property?: string;

  add_flags?: string[];
  remove_flags?: string[];
  reset_official_rank?: boolean;
  official_rank_delta?: number;
  add_traits?: string[];
  remove_traits?: string[];
  add_interests?: string[];
  family_copper?: number;
  scale_family_copper?: number;
  kill_npc_id?: string;
  set_circumstance?: {
    id: string;
    label: string;
  };

  npc_affinity?: Array<{
    relation?: 'parent' | 'sibling' | 'spouse' | 'child' | 'friend' | 'rival' | 'mentor' | 'household';
    npc_id?: string;
    delta: number;
  }>;

  schedule_delayed?: Array<{
    event_id: string;
    delay_days: number;
  }>;

  milestone_title?: string;
  kill_reason?: string;
}

export interface WeightModifier {
  conditions: ConditionSpec;
  addWeight: number;
}

export interface WeightSpec {
  base: number;
  modifiers?: WeightModifier[];
}

export interface EventOutcome {
  weight: WeightSpec;
  resultText: string;
  effects: EffectSpec;
}

export interface EventChoice {
  label: string;
  hint?: string;
  conditions?: ConditionSpec;
  outcomes: EventOutcome[];
}

export interface GameEventDef {
  id: string;
  stage: 'infancy' | 'childhood' | 'adulthood' | 'any';
  severity: 'minor' | 'major';
  isMilestone?: boolean;
  contextNote?: string;
  cooldownDays: number;
  oncePerLife?: boolean;
  title: string;
  conditions: ConditionSpec;
  weight: WeightSpec;
  description: string;
  choices: EventChoice[];
}

export interface InfancyMilestoneLogDef {
  day: number;
  text: string;
  tone: 'neutral' | 'positive' | 'negative' | 'milestone';
  conditions?: ConditionSpec;
}

export interface FocusAmbientLogDef {
  focusId: string;
  text: string;
  conditions?: ConditionSpec;
}

export interface ChildhoodAmbientData {
  infancyMilestones: InfancyMilestoneLogDef[];
  focusAmbientLogs: FocusAmbientLogDef[];
}

export interface ActionDef {
  id: string;
  name: string;
  category: string;
  allowedSlots: TimeSlot[];
  description: string;
  conditions: ConditionSpec;
  costs: EffectSpec;
  rewards: EffectSpec;
}

export interface ChildhoodActivityDef {
  id: string;
  name: string;
  category?: string;
  description: string;
  conditions: ConditionSpec;
  costCopper: number;
  effects: EffectSpec;
}
