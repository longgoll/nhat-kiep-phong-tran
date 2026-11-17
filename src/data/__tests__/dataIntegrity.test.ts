import { describe, expect, it } from 'vitest';
import {
  ALL_ACTIONS,
  ALL_ADULTHOOD_EVENTS,
  ALL_CHILDHOOD_EVENTS,
  ALL_EVENTS,
  CHILDHOOD_ACTIVITIES,
  CHILDHOOD_AMBIENT_DATA,
} from '../registry';

describe('Data Registry & Integrity', () => {
  it('loads non-empty collections from modular data folders', () => {
    expect(ALL_ACTIONS.length).toBeGreaterThan(0);
    expect(CHILDHOOD_ACTIVITIES.length).toBeGreaterThan(0);
    expect(ALL_CHILDHOOD_EVENTS.length).toBeGreaterThan(0);
    expect(ALL_ADULTHOOD_EVENTS.length).toBeGreaterThan(0);
    expect(CHILDHOOD_AMBIENT_DATA.infancyMilestones.length).toBeGreaterThan(0);
    expect(CHILDHOOD_AMBIENT_DATA.focusAmbientLogs.length).toBeGreaterThan(0);
  });

  it('has unique IDs across all events, actions, and childhood activities', () => {
    const checkUniqueIds = (items: Array<{ id: string }>, label: string) => {
      const seen = new Set<string>();
      for (const item of items) {
        expect(item.id, `${label} missing id`).toBeTruthy();
        expect(seen.has(item.id), `Duplicate ${label} id: ${item.id}`).toBe(false);
        seen.add(item.id);
      }
    };

    checkUniqueIds(ALL_EVENTS, 'event');
    checkUniqueIds(ALL_ACTIONS, 'action');
    checkUniqueIds(CHILDHOOD_ACTIVITIES, 'childhood activity');
  });

  it('validates event structure, choices, outcomes, and delayed event references', () => {
    const allEventIds = new Set(ALL_EVENTS.map((e) => e.id));
    const validStages = new Set(['infancy', 'childhood', 'adulthood', 'any']);
    const validSeverities = new Set(['minor', 'major']);
    const validOrigins = new Set(['ban_nong', 'thu_cong', 'dia_chu', 'quan_lai', 'hoang_toc']);

    for (const evt of ALL_EVENTS) {
      expect(validStages.has(evt.stage), `Invalid stage on ${evt.id}`).toBe(true);
      expect(validSeverities.has(evt.severity), `Invalid severity on ${evt.id}`).toBe(true);
      if (evt.conditions?.origin_in) {
        for (const origin of evt.conditions.origin_in) {
          expect(validOrigins.has(origin), `Invalid origin_in "${origin}" on ${evt.id}`).toBe(true);
        }
      }
      expect(evt.title.trim().length, `Empty title on ${evt.id}`).toBeGreaterThan(0);
      expect(evt.choices.length, `No choices on ${evt.id}`).toBeGreaterThan(0);

      for (const choice of evt.choices) {
        expect(choice.label.trim().length, `Empty choice label on ${evt.id}`).toBeGreaterThan(0);
        expect(choice.outcomes.length, `No outcomes on ${evt.id}`).toBeGreaterThan(0);

        for (const outcome of choice.outcomes) {
          expect(outcome.resultText.trim().length, `Empty resultText on ${evt.id}`).toBeGreaterThan(0);
          if (outcome.effects.schedule_delayed) {
            for (const delayed of outcome.effects.schedule_delayed) {
              expect(
                allEventIds.has(delayed.event_id),
                `Broken schedule_delayed reference "${delayed.event_id}" in event "${evt.id}"`,
              ).toBe(true);
            }
          }
        }
      }
    }
  });
});
