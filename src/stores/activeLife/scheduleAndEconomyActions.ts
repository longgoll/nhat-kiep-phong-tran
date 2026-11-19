import type { StoreApi } from 'zustand';
import {
  buyGoldReserve,
  executeInstantAdultAction,
  haveChild,
  marrySpouse,
  sellGoldReserve,
} from '../../engine/adultLifeActions';
import { appendLog, applyEffects } from '../../engine/effectApplier';
import type { ActiveLifeStore } from './types';

type SetState = StoreApi<ActiveLifeStore>['setState'];
type GetState = StoreApi<ActiveLifeStore>['getState'];

export function createScheduleAndEconomyActions(
  set: SetState,
  get: GetState,
): Pick<
  ActiveLifeStore,
  | 'setSlotAction'
  | 'setLifestyle'
  | 'setLifeFocus'
  | 'setGiftEtiquette'
  | 'setInvestmentChannel'
  | 'toggleAutoAction'
  | 'buyGold'
  | 'sellGold'
  | 'marrySpouseAction'
  | 'haveChildAction'
  | 'performInstantAction'
  | 'setAutoBuyRice'
  | 'setAutoPauseConfig'
  | 'addFallbackRule'
  | 'removeFallbackRule'
  | 'buyRice'
  | 'sellRice'
  | 'takeEmergencyLoan'
  | 'applyLifeMutation'
> {
  return {
      setSlotAction: (slot, actionId) => {
        const { life } = get();
        if (!life) return;
        set({
          life: {
            ...life,
            schedule: { ...life.schedule, [slot]: actionId },
          },
        });
      },

      setLifestyle: (tier) => {
        const { life } = get();
        if (!life) return;
        set({
          life: {
            ...life,
            schedule: { ...life.schedule, lifestyle: tier },
          },
        });
      },

      setLifeFocus: (focusId) => {
        const { life } = get();
        if (!life) return;
        set({
          life: {
            ...life,
            schedule: { ...life.schedule, lifeFocus: focusId },
          },
        });
      },

      setGiftEtiquette: (tier) => {
        const { life } = get();
        if (!life) return;
        set({
          life: {
            ...life,
            schedule: { ...life.schedule, giftEtiquette: tier },
          },
        });
      },

      setInvestmentChannel: (channel) => {
        const { life } = get();
        if (!life) return;
        set({
          life: {
            ...life,
            investmentChannel: channel,
          },
        });
      },

      toggleAutoAction: (actionId) => {
        const { life } = get();
        if (!life) return;
        const curr = life.autoActions ?? [];
        const next = curr.includes(actionId)
          ? curr.filter((id) => id !== actionId)
          : [...curr, actionId];
        set({
          life: {
            ...life,
            autoActions: next,
          },
        });
      },

      buyGold: (amountCopper) => {
        const { life } = get();
        if (!life || !life.isAlive) return;
        set({ life: buyGoldReserve(life, amountCopper) });
      },

      sellGold: (amountCopper) => {
        const { life } = get();
        if (!life || !life.isAlive) return;
        set({ life: sellGoldReserve(life, amountCopper) });
      },

      marrySpouseAction: () => {
        const { life } = get();
        if (!life || !life.isAlive) return;
        set({ life: marrySpouse(life) });
      },

      haveChildAction: () => {
        const { life } = get();
        if (!life || !life.isAlive) return;
        set({ life: haveChild(life) });
      },

      performInstantAction: (actionId) => {
        const { life } = get();
        if (!life || !life.isAlive) return;
        const res = executeInstantAdultAction(life, actionId);
        if (res.ok) {
          set({
            life: res.state,
            lastEventResult: res.message,
          });
        }
      },

      setAutoBuyRice: (enabled) => {
        const { life } = get();
        if (!life) return;
        set({
          life: {
            ...life,
            schedule: { ...life.schedule, autoBuyRice: enabled },
          },
        });
      },

      setAutoPauseConfig: (patch) => {
        set((s) => ({ autoPauseConfig: { ...s.autoPauseConfig, ...patch } }));
      },

      addFallbackRule: (rule) => {
        const { life } = get();
        if (!life) return;
        set({
          life: {
            ...life,
            schedule: {
              ...life.schedule,
              fallbackRules: [...life.schedule.fallbackRules, rule],
            },
          },
        });
      },

      removeFallbackRule: (id) => {
        const { life } = get();
        if (!life) return;
        set({
          life: {
            ...life,
            schedule: {
              ...life.schedule,
              fallbackRules: life.schedule.fallbackRules.filter((r) => r.id !== id),
            },
          },
        });
      },

      buyRice: (amount) => {
        const { life } = get();
        if (!life || amount <= 0) return;
        const cost = amount * life.world.ricePriceInCopper;
        if (life.assets.wealthCopper < cost) return;
        const next = applyEffects(life, { copper: -cost, rice: amount });
        set({
          life: {
            ...next,
            logs: appendLog(next.logs, next.profile.totalDays, 'survival', `Mua ${amount} đấu gạo với giá ${cost} đồng.`),
          },
        });
      },

      sellRice: (amount) => {
        const { life } = get();
        if (!life || amount <= 0 || life.assets.rice < amount) return;
        const gain = amount * life.world.ricePriceInCopper;
        const next = applyEffects(life, { copper: gain, rice: -amount });
        set({
          life: {
            ...next,
            logs: appendLog(next.logs, next.profile.totalDays, 'survival', `Bán ${amount} đấu gạo thu về ${gain} đồng.`),
          },
        });
      },

      takeEmergencyLoan: () => {
        const { life } = get();
        if (!life || life.flags.includes('dang_no_dia_chu')) return;
        const next = applyEffects(life, {
          copper: 500,
          rice: 5,
          add_flags: ['dang_no_dia_chu'],
          schedule_delayed: [{ event_id: 'evt_debt_collection_01', delay_days: 180 }],
        });
        set({
          life: {
            ...next,
            logs: appendLog(
              next.logs,
              next.profile.totalDays,
              'warning',
              'Vay nóng địa chủ 500 đồng và 5 đấu gạo. Sau 180 ngày phải trả đủ 800 đồng!',
            ),
          },
        });
      },

      applyLifeMutation: (mutator) => {
        const { life } = get();
        if (!life || !life.isAlive) return;
        set({ life: mutator(life) });
      },
  };
}
