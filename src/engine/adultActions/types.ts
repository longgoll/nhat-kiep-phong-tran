import type { HousingTier, LifeFocusId, OriginClass, WorldState } from '../../types/activeLife';
import type { EffectSpec } from '../../types/dsl';

export interface LifeFocusOption {
  id: LifeFocusId;
  label: string;
  effectHint: string;
  description: string;
}

export interface InstantAdultActionDef {
  id: string;
  title: string;
  subtitle: string;
  costCopper: number;
  cooldownDays: number;
  minAge?: number;
  maxAge?: number;
  minEducation?: number;
  minMartial?: number;
  minCraftTrade?: number;
  minFame?: number;
  minWealthCopper?: number;
  maxEducation?: number;
  blockedWorldStates?: WorldState[];
  requiresWorldStates?: WorldState[];
  category?: 'medical' | 'social' | 'economic' | 'growth';
  allowCredit?: boolean;
  prisonAllowed?: boolean;
  requiresNotHousing?: HousingTier;
  requiresHousingIn?: HousingTier[];
  requiresLivingFamily?: boolean;
  requiresLivingParent?: boolean;
  requiresLivingChild?: boolean;
  requiresFlag?: string;
  requiresOfficialOrNoble?: boolean;
  requiresOrigins?: OriginClass[];
  excludeOrigins?: OriginClass[];
  effects: EffectSpec;
  levelUpHobby?: boolean;
  isRental?: boolean;
  rentalExpiryLog?: string;
  logText: string;
}
