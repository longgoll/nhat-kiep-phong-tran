import { getAgeYears, type ActiveLifeState } from '../types/activeLife';
import type { ConditionSpec, EventChoice } from '../types/dsl';
import { evaluateConditions } from '../engine/conditionEvaluator';
import { formatCopper } from '../engine/economy';
import { useActiveLifeStore } from '../stores/useActiveLifeStore';

function buildChoiceHint(choice: EventChoice): string {
  if (choice.hint) return choice.hint;

  const tags = new Set<string>();
  const outcomes = choice.outcomes ?? [];
  const hasMultipleOutcomes = outcomes.length > 1;
  let hasRisk = false;

  for (const out of outcomes) {
    const e = out.effects;
    if (e.kill_reason) hasRisk = true;
    if ((e.copper ?? 0) > 0) tags.add('Có thu nhập');
    if ((e.copper ?? 0) < 0) tags.add(`Tốn ${formatCopper(Math.abs(e.copper!))}`);
    if ((e.family_copper ?? 0) > 0) tags.add('Tăng gia sản');
    if ((e.family_copper ?? 0) < 0) tags.add('Tốn kém gia đình');
    if ((e.rice ?? 0) > 0) tags.add('Thêm lương thực');
    if ((e.rice ?? 0) < 0) tags.add('Tiêu hao gạo');
    if ((e.education ?? 0) > 0) tags.add('Học thức↑');
    if ((e.education ?? 0) < 0) tags.add('Học thức↓');
    if ((e.health ?? 0) > 0) tags.add('Sức khỏe↑');
    if ((e.health ?? 0) < 0) {
      tags.add('Sức khỏe↓');
      hasRisk = true;
    }
    if ((e.happiness ?? 0) > 0) tags.add('Hạnh phúc↑');
    if ((e.happiness ?? 0) < 0) tags.add('Hạnh phúc↓');
    if ((e.relationships ?? 0) > 0 || (e.npc_affinity?.some((n) => n.delta > 0) ?? false)) {
      tags.add('Quan hệ↑');
    }
    if ((e.relationships ?? 0) < 0 || (e.npc_affinity?.some((n) => n.delta < 0) ?? false)) {
      tags.add('Quan hệ↓');
    }
    if ((e.martial ?? 0) > 0) tags.add('Võ nghệ↑');
    if ((e.craft_trade ?? 0) > 0) tags.add('Thương tài↑');
    if ((e.fame ?? 0) > 0) tags.add('Thanh danh↑');
    if ((e.infamy ?? 0) > 0) tags.add('Tai tiếng↑');
    if (e.add_property || e.set_housing) tags.add('Thay đổi điền sản / nhà ở');
    if (e.add_traits && e.add_traits.length > 0) tags.add('Định hình tính cách');
    if (e.add_interests && e.add_interests.length > 0) tags.add('Mở rộng sở thích');
  }

  const list = Array.from(tags).slice(0, 4);
  if (list.length === 0) {
    return hasMultipleOutcomes ? 'Kết quả tùy vào cơ duyên và vận may' : 'Thuận theo tự nhiên';
  }
  const summary = list.join(' · ');
  if (hasRisk) return `${summary} (Có rủi ro)`;
  if (hasMultipleOutcomes) return `Cơ hội: ${summary} (Tùy vận may & chỉ số)`;
  return summary;
}

function buildLockReason(state: ActiveLifeState, cond?: ConditionSpec): string {
  if (!cond) return 'Chưa đủ điều kiện để thực hiện';
  const reasons: string[] = [];
  if (cond.min_copper !== undefined && state.assets.wealthCopper < cond.min_copper) {
    reasons.push(`Cần ${formatCopper(cond.min_copper)}`);
  }
  if (cond.min_rice !== undefined && state.assets.rice < cond.min_rice) {
    reasons.push(`Cần ${cond.min_rice} đấu gạo`);
  }
  if (cond.min_education !== undefined && state.stats.education < cond.min_education) {
    reasons.push(`Cần Học thức ≥ ${cond.min_education}`);
  }
  if (cond.min_health !== undefined && state.stats.health < cond.min_health) {
    reasons.push(`Cần Sức khỏe ≥ ${cond.min_health}`);
  }
  if (cond.min_martial !== undefined && state.stats.martial < cond.min_martial) {
    reasons.push(`Cần Võ nghệ ≥ ${cond.min_martial}`);
  }
  if (cond.min_craft_trade !== undefined && state.stats.craftTrade < cond.min_craft_trade) {
    reasons.push(`Cần Thương tài ≥ ${cond.min_craft_trade}`);
  }
  if (cond.min_fame !== undefined && state.stats.fame < cond.min_fame) {
    reasons.push(`Cần Thanh danh ≥ ${cond.min_fame}`);
  }
  if (cond.min_relationships !== undefined && state.stats.relationships < cond.min_relationships) {
    reasons.push(`Cần Quan hệ ≥ ${cond.min_relationships}`);
  }
  return reasons.length > 0
    ? `Chưa đủ điều kiện: ${reasons.join(' · ')}`
    : 'Chưa đủ điều kiện xuất thân hoặc hoàn cảnh';
}

export function EventModal() {
  const life = useActiveLifeStore((s) => s.life);
  const pendingEvent = useActiveLifeStore((s) => s.pendingEvent);
  const chooseEventOption = useActiveLifeStore((s) => s.chooseEventOption);

  if (!life || !pendingEvent) return null;

  const ageYears = getAgeYears(life.profile.totalDays);
  const eventTag = pendingEvent.isMilestone
    ? 'Bước ngoặt cuộc đời'
    : pendingEvent.severity === 'major'
      ? 'Quyết định lớn'
      : 'Sự kiện thường nhật';

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="max-w-lg w-full bg-stone-900 border border-stone-700 rounded-xl shadow-2xl overflow-hidden">
        {/* 1in8b-style top meta header */}
        <div className="px-5 pt-4 pb-2 flex items-center justify-between text-[11px] font-mono">
          <span className="text-rose-400 font-semibold">{eventTag}</span>
          <span className="text-stone-400">
            {ageYears} tuổi · {life.world.dynastyName} năm thứ {life.world.yearInEra}
          </span>
        </div>

        <div className="px-5 pb-5 space-y-4">
          <div className="space-y-2">
            <h3 className="font-serif font-bold text-xl text-amber-100 leading-snug">
              {pendingEvent.title}
            </h3>
            <p className="text-sm leading-relaxed text-stone-300">{pendingEvent.description}</p>
          </div>

          {pendingEvent.contextNote && (
            <div className="px-3.5 py-2.5 rounded-r-lg border-l-2 border-emerald-500 bg-emerald-950/35 text-xs font-mono text-emerald-200 leading-relaxed">
              {pendingEvent.contextNote}
            </div>
          )}

          {/* Numbered choices with helpful subtitle lines */}
          <div className="space-y-2.5 pt-1">
            {pendingEvent.choices.map((choice, idx) => {
              const allowed = evaluateConditions(life, choice.conditions);
              const hintText = allowed
                ? buildChoiceHint(choice)
                : buildLockReason(life, choice.conditions);

              return (
                <button
                  key={idx}
                  type="button"
                  disabled={!allowed}
                  onClick={() => chooseEventOption(idx)}
                  className={`w-full text-left px-4 py-3 rounded-lg border transition flex items-start gap-3.5 ${
                    allowed
                      ? 'bg-stone-950/80 hover:bg-amber-950/35 border-stone-700/80 hover:border-amber-500 text-stone-100 cursor-pointer'
                      : 'bg-stone-950/40 border-stone-800 text-stone-500 cursor-not-allowed'
                  }`}
                >
                  <span className="text-xs font-mono text-stone-500 pt-0.5 shrink-0">
                    {idx + 1}
                  </span>
                  <div className="min-w-0 flex-1 space-y-0.5">
                    <div className="text-sm font-semibold leading-snug">{choice.label}</div>
                    <div
                      className={`text-xs leading-snug ${
                        allowed ? 'text-stone-400' : 'text-rose-400/80'
                      }`}
                    >
                      {hintText}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
