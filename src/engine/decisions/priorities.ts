import { type ActiveLifeState } from '../../types/activeLife';
import type { GameEventDef } from '../../types/dsl';
import { buildCareerAndExamDecision, getEligibleExamLevelForPrompt } from './careerAndExamDecisions';
import { buildLifeMilestoneDecision } from './lifeMilestoneDecisions';
import { buildOfficialDecision } from './officialDecisions';

export { getEligibleExamLevelForPrompt };

export interface DecisionCandidate {
  id: string;
  priority: number;
}

const DYNAMIC_DECISION_PRIORITIES: Array<{ id: string; priority: number }> = [
  { id: 'dec_loan_heavy', priority: 100 },
  { id: 'dec_official_censor_audit', priority: 95 },
  { id: 'dec_official_cong_cao_chan_chu', priority: 92 },
  { id: 'dec_college_18', priority: 90 },
  { id: 'dec_retire_60', priority: 85 },
  { id: 'dec_exam_prompt', priority: 84 },
  { id: 'dec_official_appoint', priority: 82 },
  { id: 'dec_official_family_move', priority: 80 },
  { id: 'dec_official_promote', priority: 78 },
  { id: 'dec_rankup', priority: 75 },
  { id: 'dec_job_offers', priority: 65 },
  { id: 'dec_biz_offers', priority: 55 },
];

export function collectDynamicDecisionCandidates(state: ActiveLifeState): DecisionCandidate[] {
  const candidates: DecisionCandidate[] = [];
  for (const spec of DYNAMIC_DECISION_PRIORITIES) {
    if (buildDynamicDecisionById(state, spec.id) !== null) {
      candidates.push({ id: spec.id, priority: spec.priority });
    }
  }
  return candidates.sort((a, b) => b.priority - a.priority);
}

export function buildDynamicDecisionById(
  state: ActiveLifeState,
  decisionId: string,
): GameEventDef | null {
  return (
    buildLifeMilestoneDecision(state, decisionId) ??
    buildOfficialDecision(state, decisionId) ??
    buildCareerAndExamDecision(state, decisionId)
  );
}

export function generateDynamicDecision(state: ActiveLifeState): GameEventDef | null {
  const candidates = collectDynamicDecisionCandidates(state);
  if (candidates.length === 0) return null;
  return buildDynamicDecisionById(state, candidates[0].id);
}
