import type {
  ActiveLifeState,
  FallbackRule,
  GiftEtiquetteTier,
  InvestmentChannel,
  LifestyleTier,
  TimeSlot,
} from '../../types/activeLife';
import type { GameEventDef } from '../../types/dsl';
import type { AutoPauseConfig, AutoPauseReason } from '../../engine/daySimulator';

export interface ActiveLifeStore {
  life: ActiveLifeState | null;
  pendingEvent: GameEventDef | null;
  lastEventResult: string | null;
  isSimulating: boolean;
  hasConfirmedBirthCertificate: boolean;
  autoPauseConfig: AutoPauseConfig;
  lastPauseReason: AutoPauseReason | null;
  autoDecide: boolean;
  autoPlaySpeed: 0 | 1 | 2 | 4 | 8 | 12 | 16;

  startNewLife: (customSeed?: number) => void;
  setAutoPlaySpeed: (speed: 0 | 1 | 2 | 4 | 8 | 12 | 16) => void;
  confirmBirthCertificate: () => void;
  stepChildhoodMonth: () => void;
  advanceToNextDecision: () => void;
  toggleAutoDecide: () => void;
  togglePinLog: (logIndex: number) => void;
  addPlayerThought: (text: string) => void;
  setChildhoodFocus: (focusId: string) => void;
  advanceAdultDays: (days: number) => void;
  chooseEventOption: (choiceIndex: number) => void;
  clearLastEventResult: () => void;
  clearPauseReason: () => void;

  setSlotAction: (slot: TimeSlot, actionId: string) => void;
  setLifestyle: (tier: LifestyleTier) => void;
  setLifeFocus: (focusId: string) => void;
  setGiftEtiquette: (tier: GiftEtiquetteTier) => void;
  setInvestmentChannel: (channel: InvestmentChannel) => void;
  toggleAutoAction: (actionId: string) => void;
  buyGold: (amountCopper: number) => void;
  sellGold: (amountCopper: number) => void;
  marrySpouseAction: () => void;
  haveChildAction: () => void;
  performInstantAction: (actionId: string) => void;
  setAutoBuyRice: (enabled: boolean) => void;
  setAutoPauseConfig: (patch: Partial<AutoPauseConfig>) => void;
  addFallbackRule: (rule: FallbackRule) => void;
  removeFallbackRule: (id: string) => void;
  buyRice: (amount: number) => void;
  sellRice: (amount: number) => void;
  takeEmergencyLoan: () => void;
  applyLifeMutation: (mutator: (life: ActiveLifeState) => ActiveLifeState) => void;
  exportSaveJson: () => string | null;
  importSaveJson: (raw: string) => { ok: boolean; error?: string };
  resetLife: () => void;
}
