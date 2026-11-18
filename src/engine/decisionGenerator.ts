import { getAgeYears, type ActiveLifeState } from '../types/activeLife';
import type { GameEventDef } from '../types/dsl';
import { formatCopper } from './economy';
import {
  applyForCareer,
  canPromoteCareer,
  getAvailableVentures,
  getRecommendedCareerOffers,
  promoteCareer,
  resignCareer,
  startVenture,
} from './careerSystem';
import { hasActiveLivelihood } from './lifeStatus';
import { appendLog, applyEffects } from './effectApplier';
import { OFFICIAL_RANKS, appointOrPromoteOfficial, sellProperty } from './progressionModules';

export interface DecisionCandidate {
  id: string;
  priority: number;
}

const DYNAMIC_DECISION_PRIORITIES: Array<{ id: string; priority: number }> = [
  { id: 'dec_loan_heavy', priority: 100 },
  { id: 'dec_college_18', priority: 90 },
  { id: 'dec_retire_60', priority: 85 },
  { id: 'dec_official_appoint', priority: 82 },
  { id: 'dec_official_promote', priority: 78 },
  { id: 'dec_rankup', priority: 75 },
  { id: 'dec_job_offers', priority: 65 },
  { id: 'dec_biz_offers', priority: 55 },
];

/**
 * Collects all currently eligible dynamic decision candidates sorted by priority (highest first).
 */
export function collectDynamicDecisionCandidates(state: ActiveLifeState): DecisionCandidate[] {
  const candidates: DecisionCandidate[] = [];
  for (const spec of DYNAMIC_DECISION_PRIORITIES) {
    if (buildDynamicDecisionById(state, spec.id) !== null) {
      candidates.push({ id: spec.id, priority: spec.priority });
    }
  }
  return candidates.sort((a, b) => b.priority - a.priority);
}

/**
 * Materializes a specific dynamic decision card by ID if it is still eligible for `state`.
 */
export function buildDynamicDecisionById(
  state: ActiveLifeState,
  decisionId: string,
): GameEventDef | null {
  return generateDynamicDecisionInternal(state, decisionId);
}

/**
 * 1in8b-style Dynamic Decision Card Generator (`DEC.college`, `DEC.job`, `DEC.rankup`, `DEC.retire`, `DEC.loan`).
 * Returns the highest-priority contextual GameEventDef on annual milestones or life transitions.
 */
export function generateDynamicDecision(state: ActiveLifeState): GameEventDef | null {
  const candidates = collectDynamicDecisionCandidates(state);
  if (candidates.length === 0) return null;
  return buildDynamicDecisionById(state, candidates[0].id);
}

function generateDynamicDecisionInternal(
  state: ActiveLifeState,
  onlyId?: string,
): GameEventDef | null {
  const age = getAgeYears(state.profile.totalDays);
  const totalDays = state.profile.totalDays;

  // 1. DEC.college at age 18 (or 18-20 if not yet decided)
  if (
    (!onlyId || onlyId === 'dec_college_18') &&
    age >= 18 &&
    age <= 20 &&
    !state.flags.includes('dec_college_done') &&
    !state.flags.includes('trong_hau_cung') &&
    (state.eduLevel ?? 0) < 4 &&
    state.livelihoodStatus !== 'prison'
  ) {
    return {
      id: 'dec_college_18',
      stage: 'adulthood',
      severity: 'major',
      conditions: {},
      isMilestone: true,
      title: 'Ngã rẽ tuổi 18: Nhập học Quốc Tử Giám hay Ra đời lập nghiệp?',
      description:
        'Bạn đã bước sang tuổi trưởng thành. Các kỳ khảo thí vào Quốc Tử Giám và Thư viện lớn đang mở cửa cho sĩ tử khắp nơi.',
      contextNote: `Học thức hiện tại: ${Math.round(state.stats.education)} · Hoàn cảnh gia đình quyết định phần lớn học phí ăn ở.`,
      cooldownDays: 99999,
      weight: { base: 100 },
      choices: [
        {
          label: 'Ứng thí Quốc Tử Giám — Kinh sử · Chính trị',
          hint: 'Học thức +6 · Mở rộng đường Khoa cử & Quan trường',
          outcomes: [
            {
              weight: { base: 100 },
              effects: {
                education: 6,
                happiness: 3,
                add_flags: ['dec_college_done'],
                milestone_title: 'Nhập học Quốc Tử Giám (Kinh sử · Chính trị)',
              },
              resultText: 'Bạn trúng tuyển vào Quốc Tử Giám, chuyên tâm ngành Kinh sử · Chính trị.',
            },
          ],
        },
        {
          label: 'Ứng thí Quốc Tử Giám — Y dược · Thương toán',
          hint: 'Học thức +5 · Thương tài +4 · Thuận lợi làm thầy thuốc & buôn bán',
          outcomes: [
            {
              weight: { base: 100 },
              effects: {
                education: 5,
                craft_trade: 4,
                happiness: 3,
                add_flags: ['dec_college_done'],
                milestone_title: 'Nhập học Quốc Tử Giám (Y dược · Thương toán)',
              },
              resultText: 'Bạn theo học ngành Y dược · Thương toán tại Thư viện lớn.',
            },
          ],
        },
        {
          label: 'Ghi danh Võ học đường — Binh pháp & Võ nghệ',
          hint: 'Võ nghệ +6 · Sức khỏe +3 · Mở rộng đường Tòng quân',
          outcomes: [
            {
              weight: { base: 100 },
              effects: {
                martial: 6,
                health: 3,
                add_flags: ['dec_college_done'],
                milestone_title: 'Nhập học Võ học đường (Binh pháp)',
              },
              resultText: 'Bạn ghi danh vào Võ học đường, rèn luyện binh pháp và võ nghệ.',
            },
          ],
        },
        {
          label: 'Thôi học, ra đời kiếm sống ngay',
          hint: 'Bắt đầu tìm việc làm ngay lập tức',
          outcomes: [
            {
              weight: { base: 100 },
              effects: {
                add_flags: ['dec_college_done'],
              },
              resultText: 'Bạn quyết định rời ghế nhà trường, bắt đầu tự lập mưu sinh.',
            },
          ],
        },
      ],
    };
  }

  // 2. DEC.retire around age 60-65
  if (
    (!onlyId || onlyId === 'dec_retire_60') &&
    age >= 60 &&
    hasActiveLivelihood(state) &&
    !state.flags.includes('dec_retire_asked') &&
    state.livelihoodStatus !== 'prison'
  ) {
    const hasPension = (state.activeCareer?.daysWorked ?? 0) >= 1800 || state.officialRank > 0;
    return {
      id: 'dec_retire_60',
      stage: 'adulthood',
      severity: 'major',
      conditions: {},
      isMilestone: true,
      title: 'Tuổi xế chiều: Cáo lão hồi hương hay Tiếp tục cống hiến?',
      description:
        'Bạn đã bước sang tuổi lục tuần. Triều đình và hương lý đều hỏi ý bạn về việc nghỉ ngơi an dưỡng tuổi già.',
      contextNote: hasPension
        ? 'Bạn đủ thâm niên để nhận bổng lộc hưu trí hằng năm khi nghỉ hưu.'
        : 'Bạn chưa đủ thâm niên hưởng lương hưu; nghỉ hưu sẽ sống bằng tài sản tích lũy và sự phụng dưỡng của con cháu.',
      cooldownDays: 99999,
      weight: { base: 100 },
      choices: [
        {
          label: 'Cáo lão hồi hương · Nghỉ hưu an dưỡng',
          hint: hasPension ? 'Hưởng lương hưu hằng năm · Hạnh phúc +6' : 'Nghỉ ngơi hoàn toàn · Hạnh phúc +5',
          outcomes: [
            {
              weight: { base: 100 },
              effects: {
                happiness: 6,
                health: 3,
                add_flags: hasPension ? ['dec_retire_asked', 'co_luong_huu'] : ['dec_retire_asked'],
                milestone_title: 'Cáo lão hồi hương, an hưởng tuổi già',
              },
              resultText: 'Bạn chính thức cáo lão hồi hương, khép lại những năm tháng bôn ba.',
            },
          ],
        },
        {
          label: 'Tiếp tục làm việc thêm vài năm',
          hint: 'Giữ nguyên công việc & thu nhập hiện tại',
          outcomes: [
            {
              weight: { base: 100 },
              effects: {
                add_flags: ['dec_retire_asked'],
              },
              resultText: 'Bạn quyết định tiếp tục gắn bó với công việc hiện tại.',
            },
          ],
        },
      ],
    };
  }

  // 2b. DEC.official_appoint when eligible for officialdom via exam degree, tap am, or recommendation
  const hasExamDegree = state.flags.includes('do_cu_nhan') || state.flags.includes('do_tien_si');
  const hasPatronEntry =
    (state.flags.includes('co_an_tap_am') ||
      state.flags.includes('duoc_quy_nhan_nang_do') ||
      state.profile.originClass === 'quan_lai' ||
      state.profile.originClass === 'hoang_toc') &&
    state.stats.education >= 24;
  if (
    (!onlyId || onlyId === 'dec_official_appoint') &&
    age >= 20 &&
    age < 60 &&
    state.officialRank === 0 &&
    (hasExamDegree || hasPatronEntry) &&
    !state.flags.includes('dec_official_declined') &&
    !state.flags.includes('trong_hau_cung') &&
    state.livelihoodStatus !== 'retired' &&
    state.livelihoodStatus !== 'prison'
  ) {
    const startRankTitle = state.flags.includes('do_tien_si') ? 'Tri phủ' : 'Tri huyện';
    const entryReason = hasExamDegree
      ? 'Nhờ khoa bảng đỗ đạt, bộ Lại đã gửi trát triệu tập bạn ra làm quan'
      : 'Nhờ ân trạch thế gia và sự tiến cử của quý nhân, bộ Lại ban trát bổ nhiệm bạn ra làm quan';
    return {
      id: 'dec_official_appoint',
      stage: 'adulthood',
      severity: 'major',
      isMilestone: true,
      conditions: {},
      title: `Triều đình bổ nhiệm: Nhậm chức ${startRankTitle}`,
      description: `${entryReason}, khởi đầu ở chức ${startRankTitle}.`,
      cooldownDays: 99999,
      weight: { base: 100 },
      choices: [
        {
          label: `Nhận sắc phong nhậm chức ${startRankTitle}`,
          hint: 'Chính thức bước vào quan trường · Thanh danh +10',
          outcomes: [
            {
              weight: { base: 100 },
              effects: { happiness: 6 },
              resultText: `Bạn bái lạy nhận sắc phong, chính thức nhậm chức ${startRankTitle}.`,
            },
          ],
        },
        {
          label: 'Từ chối làm quan, giữ chí ẩn dật hoặc tự lập',
          hint: 'Không tham gia quan trường',
          outcomes: [
            {
              weight: { base: 100 },
              effects: { fame: 3, add_flags: ['dec_official_declined'] },
              resultText: 'Bạn khéo léo cáo từ sắc phong, chọn cuộc sống tự do ngoài chốn quan trường.',
            },
          ],
        },
      ],
    };
  }

  // 2c. DEC.official_promote when official meets fame requirement for next rank
  if (
    (!onlyId || onlyId === 'dec_official_promote') &&
    state.officialRank >= 1 &&
    state.officialRank < 5 &&
    state.stats.fame >= state.officialRank * 25 &&
    totalDays - (state.eventCooldowns['dec_official_promote'] ?? -99999) >= 720 &&
    state.livelihoodStatus !== 'prison'
  ) {
    const nextRankTitle = OFFICIAL_RANKS[state.officialRank + 1] ?? 'Đại thần';
    return {
      id: 'dec_official_promote',
      stage: 'adulthood',
      severity: 'major',
      isMilestone: true,
      conditions: {},
      title: `Thăng tiến quan trường: Đề bạt chức ${nextRankTitle}`,
      description: `Nhờ công trạng và thanh danh tích lũy (${Math.round(state.stats.fame)}), triều đình xét thăng bạn lên chức ${nextRankTitle}.`,
      cooldownDays: 720,
      weight: { base: 100 },
      choices: [
        {
          label: `Tiếp nhận chiếu chỉ thăng chức ${nextRankTitle}`,
          hint: 'Phẩm hàm +1 · Thanh danh +10 · Hạnh phúc +12',
          outcomes: [
            {
              weight: { base: 100 },
              effects: {},
              resultText: `Bạn tạ ân nhận ấn tín, chính thức thăng lên chức ${nextRankTitle}.`,
            },
          ],
        },
        {
          label: 'Khiêm nhường xin giữ nguyên chức cũ để tránh mũi dùi phe phái',
          hint: 'Giữ nguyên phẩm hàm hiện tại · Thanh danh +2',
          outcomes: [
            {
              weight: { base: 100 },
              effects: { fame: 2 },
              resultText: 'Bạn dâng sớ xin tạm giữ chức cũ để tránh gây chú ý nơi triều đường.',
            },
          ],
        },
      ],
    };
  }

  // 3. DEC.rankup when current career is ready for promotion
  if ((!onlyId || onlyId === 'dec_rankup') && state.activeCareer && canPromoteCareer(state).ok) {
    const promo = canPromoteCareer(state);
    if (promo.targetJob && totalDays - (state.eventCooldowns['dec_rankup'] ?? -99999) >= 360) {
      return {
        id: 'dec_rankup',
        stage: 'adulthood',
        severity: 'major',
        conditions: {},
        title: `Cơ hội thăng tiến: ${promo.targetJob.title}`,
        description: `Nhờ thâm niên và năng lực nổi bật, bạn được đề bạt lên vị trí ${promo.targetJob.title} (${promo.targetJob.baseDailyCopper}đ/buổi).`,
        cooldownDays: 360,
        weight: { base: 100 },
        choices: [
          {
            label: `Nhận chức ${promo.targetJob.title}`,
            hint: `Thu nhập tăng lên ${promo.targetJob.baseDailyCopper}đ/buổi · Thanh danh +3`,
            outcomes: [
              {
                weight: { base: 100 },
                effects: { fame: 3, happiness: 5 },
                resultText: `Bạn vui vẻ nhận chức ${promo.targetJob.title}.`,
              },
            ],
          },
          {
            label: 'Từ chối, giữ vị trí hiện tại',
            hint: 'Không thay đổi công việc',
            outcomes: [
              {
                weight: { base: 100 },
                effects: {},
                resultText: 'Bạn khiêm nhường từ chối lời đề bạt lần này.',
              },
            ],
          },
        ],
      };
    }
  }

  // 4. DEC.loan when deeply in debt
  if (
    (!onlyId || onlyId === 'dec_loan_heavy') &&
    state.assets.wealthCopper < -300 &&
    totalDays - (state.eventCooldowns['dec_loan_heavy'] ?? -99999) >= 360
  ) {
    const canFamilyHelp = (state.family?.familyWealthCopper ?? 0) >= 400;
    const hasProp = state.assets.properties.length > 0;
    return {
      id: 'dec_loan_heavy',
      stage: 'adulthood',
      severity: 'major',
      conditions: {},
      title: 'Nợ nần chồng chất!',
      description: `Khoản nợ của bạn đã lên tới ${formatCopper(Math.abs(state.assets.wealthCopper))}. Chủ nợ và quan nha bắt đầu thúc ép thanh toán.`,
      cooldownDays: 360,
      weight: { base: 100 },
      choices: [
        ...(canFamilyHelp
          ? [
              {
                label: 'Về quê xin gia đình cứu trợ trả nợ',
                hint: 'Nhận +500đ · Quan hệ -6',
                outcomes: [
                  {
                    weight: { base: 100 },
                    effects: { copper: 500, relationships: -6 },
                    resultText: 'Gia đình đành dốc tiền tích góp giúp bạn trang trải một phần nợ nần.',
                  },
                ],
              },
            ]
          : []),
        ...(hasProp
          ? [
              {
                label: 'Bán bớt một điền sản để trang trải nợ',
                hint: 'Thu tiền mặt từ điền sản hiện có',
                outcomes: [
                  {
                    weight: { base: 100 },
                    effects: {},
                    resultText: 'Bạn đành bán bớt một phần điền sản để giảm bớt gánh nặng nợ nần.',
                  },
                ],
              },
            ]
          : []),
        {
          label: 'Cắn răng chịu đựng, tìm việc làm trả nợ dần',
          hint: 'Hạnh phúc -5',
          outcomes: [
            {
              weight: { base: 100 },
              effects: { happiness: -5 },
              resultText: 'Bạn quyết tâm thắt lưng buộc bụng để tự mình trả hết nợ.',
            },
          ],
        },
        {
          label: 'Vay nóng lãi nặng để đảo nợ qua cơn bĩ cực',
          hint: 'Nhận +400đ tiền mặt · Ác danh +2 · Nợ lãi nặng',
          outcomes: [
            {
              weight: { base: 100 },
              effects: { copper: 400, infamy: 2, happiness: -4, add_flags: ['dang_no_dia_chu'] },
              resultText: 'Bạn cắn răng ký giấy vay nặng lãi lấy tiền xoay xở trước mắt, nhưng gánh nặng lãi mẹ đẻ lãi con sẽ đè nặng về sau.',
            },
          ],
        },
      ],
    };
  }

  // 5. DEC.job when unemployed (`seeking`) OR explicitly hunting via Chi tiêu · đầu tư (`cho_tim_viec_moi`)
  const wantsNewJob = state.flags.includes('cho_tim_viec_moi');
  if (
    (!onlyId || onlyId === 'dec_job_offers') &&
    age >= 18 &&
    !state.isStudent &&
    !state.flags.includes('trong_hau_cung') &&
    (wantsNewJob ||
      (!hasActiveLivelihood(state) &&
        state.livelihoodStatus !== 'homemaker' &&
        state.livelihoodStatus !== 'retired')) &&
    state.livelihoodStatus !== 'prison' &&
    (wantsNewJob || totalDays - (state.eventCooldowns['dec_job_offers'] ?? -99999) >= 360)
  ) {
    const offers = getRecommendedCareerOffers(state, 3);
    if (offers.length > 0) {
      return {
        id: 'dec_job_offers',
        stage: 'adulthood',
        severity: 'major',
        conditions: {},
        title: wantsNewJob
          ? 'Cơ hội mới: 3 lời mời việc làm phù hợp'
          : 'Tìm kiếm sinh kế: 3 lời mời việc làm phù hợp',
        description:
          'Nhờ học vấn, tay nghề và các mối quen biết, hiện có 3 chỗ làm đang mở lời với bạn:',
        cooldownDays: 360,
        weight: { base: 100 },
        choices: [
          ...offers.map((o) => ({
            label: `${o.job.title} (${o.job.baseDailyCopper}đ/buổi)`,
            hint: o.unlockedVia ? `Qua mối quen: ${o.unlockedVia}` : o.job.description,
            outcomes: [
              {
                weight: { base: 100 },
                effects: {},
                resultText: `Bạn nhận lời làm ${o.job.title}.`,
              },
            ],
          })),
          {
            label: 'Chờ thêm một năm để tìm công việc tốt hơn',
            hint: 'Giữ nguyên trạng thái Đang tìm việc',
            outcomes: [
              {
                weight: { base: 100 },
                effects: {},
                resultText: 'Bạn quyết định chờ thêm thời cơ phù hợp hơn.',
              },
            ],
          },
          {
            label: 'Ở nhà lo việc gia đình (Nội trợ)',
            hint: 'Chuyển sang trạng thái Nội trợ · Không có thu nhập riêng',
            outcomes: [
              {
                weight: { base: 100 },
                effects: { happiness: 2 },
                resultText: 'Bạn chọn ở nhà thu vén việc gia đình.',
              },
            ],
          },
        ],
      };
    }
  }

  // 6. DEC.biz when triggered via Chi tiêu · đầu tư (`cho_khoi_nghiep`)
  if (
    (!onlyId || onlyId === 'dec_biz_offers') &&
    age >= 18 &&
    state.flags.includes('cho_khoi_nghiep') &&
    !state.flags.includes('trong_hau_cung') &&
    state.livelihoodStatus !== 'prison'
  ) {
    const bizOffers = getAvailableVentures(state)
      .filter((v) => !v.isCurrent && v.eligible)
      .slice(0, 3);
    if (bizOffers.length > 0) {
      return {
        id: 'dec_biz_offers',
        stage: 'adulthood',
        severity: 'major',
        conditions: {},
        title: 'Cơ hội lập nghiệp: 3 mô hình kinh doanh khả thi',
        description:
          'Sau khi thăm dò thị trường và cân nhắc vốn liếng, bạn thấy có thể mở một trong các cơ sở sau:',
        cooldownDays: 360,
        weight: { base: 100 },
        choices: [
          ...bizOffers.map((v) => ({
            label: `Mở ${v.venture.title} (Vốn ${formatCopper(v.effectiveCapitalCopper)})`,
            hint: `${v.hasSpinoffDiscount ? 'Giảm 30% vốn do đúng nghề · ' : ''}+${v.venture.baseDailyCopper}đ/buổi`,
            outcomes: [
              {
                weight: { base: 100 },
                effects: {},
                resultText: `Bạn quyết định xuất vốn mở ${v.venture.title}.`,
              },
            ],
          })),
          {
            label: 'Chưa vội khởi nghiệp lúc này',
            hint: 'Giữ nguyên tiền mặt và công việc hiện tại',
            outcomes: [
              {
                weight: { base: 100 },
                effects: {},
                resultText: 'Bạn quyết định tích lũy thêm vốn liếng và kinh nghiệm trước khi ra làm riêng.',
              },
            ],
          },
        ],
      };
    }
  }

  return null;
}

/**
 * Applies post-choice side effects specific to dynamic 1in8b decision cards.
 */
export function applyDynamicDecisionSideEffects(
  state: ActiveLifeState,
  eventId: string,
  choiceIndex: number,
): ActiveLifeState {
  const totalDays = state.profile.totalDays;

  if (eventId === 'dec_college_18') {
    if (choiceIndex === 0) {
      return {
        ...state,
        eduLevel: 4,
        isStudent: true,
        major: 'Kinh sử · Chính trị',
        livelihoodStatus: 'student',
        profile: { ...state.profile, currentRole: 'Giám sinh Quốc Tử Giám' },
      };
    }
    if (choiceIndex === 1) {
      return {
        ...state,
        eduLevel: 4,
        isStudent: true,
        major: 'Y dược · Thương toán',
        livelihoodStatus: 'student',
        profile: { ...state.profile, currentRole: 'Học trò Thư viện lớn' },
      };
    }
    if (choiceIndex === 2) {
      return {
        ...state,
        eduLevel: 4,
        isStudent: true,
        major: 'Binh pháp',
        livelihoodStatus: 'student',
        profile: { ...state.profile, currentRole: 'Võ sinh Võ học đường' },
      };
    }
    return {
      ...state,
      eduLevel: Math.max(state.eduLevel ?? 2, 3),
      isStudent: false,
      livelihoodStatus: 'seeking',
      profile: { ...state.profile, currentRole: 'Đang tìm việc' },
    };
  }

  if (eventId === 'dec_retire_60') {
    const next = {
      ...state,
      eventCooldowns: { ...state.eventCooldowns, dec_retire_60: totalDays },
    };
    if (choiceIndex === 0) {
      const resigned = resignCareer(next);
      return {
        ...resigned,
        livelihoodStatus: 'retired',
        officialRank: 0,
        profile: { ...resigned.profile, currentRole: 'Nghỉ hưu' },
      };
    }
    return next;
  }

  if (eventId === 'dec_official_appoint') {
    if (choiceIndex === 0) {
      if (state.flags.includes('do_cu_nhan') || state.flags.includes('do_tien_si')) {
        return appointOrPromoteOfficial(state);
      }
      return applyEffects(state, {
        official_rank_delta: 1,
        fame: 10,
        milestone_title: 'Được tiến cử nhậm chức Tri huyện',
      });
    }
    return state;
  }

  if (eventId === 'dec_official_promote') {
    const next = {
      ...state,
      eventCooldowns: { ...state.eventCooldowns, dec_official_promote: totalDays },
    };
    if (choiceIndex === 0) {
      return appointOrPromoteOfficial(next);
    }
    return next;
  }

  if (eventId === 'dec_rankup') {
    const next = {
      ...state,
      eventCooldowns: { ...state.eventCooldowns, dec_rankup: totalDays },
    };
    if (choiceIndex === 0) {
      return promoteCareer(next);
    }
    return next;
  }

  if (eventId === 'dec_loan_heavy') {
    const next = {
      ...state,
      eventCooldowns: { ...state.eventCooldowns, dec_loan_heavy: totalDays },
    };
    const canFamilyHelp = (state.family?.familyWealthCopper ?? 0) >= 400;
    const hasProp = state.assets.properties.length > 0;
    if (hasProp && ((canFamilyHelp && choiceIndex === 1) || (!canFamilyHelp && choiceIndex === 0))) {
      return sellProperty(next, state.assets.properties[0]);
    }
    return next;
  }

  if (eventId === 'dec_job_offers') {
    const offers = getRecommendedCareerOffers(state, 3);
    const next = {
      ...state,
      flags: state.flags.filter((f) => f !== 'cho_tim_viec_moi'),
      eventCooldowns: { ...state.eventCooldowns, dec_job_offers: totalDays },
    };
    if (choiceIndex < offers.length) {
      const chosen = offers[choiceIndex];
      const hired = applyForCareer(next, chosen.job.id);
      return { ...hired, livelihoodStatus: 'employed' };
    }
    if (choiceIndex === offers.length + 1) {
      return {
        ...next,
        livelihoodStatus: 'homemaker',
        profile: { ...next.profile, currentRole: 'Nội trợ' },
      };
    }
    return {
      ...next,
      logs: appendLog(next.logs, totalDays, 'survival', 'Bạn tạm thời chưa nhận lời mời việc làm nào.'),
    };
  }

  if (eventId === 'dec_biz_offers') {
    const bizOffers = getAvailableVentures(state)
      .filter((v) => !v.isCurrent && v.eligible)
      .slice(0, 3);
    const next = {
      ...state,
      flags: state.flags.filter((f) => f !== 'cho_khoi_nghiep'),
      eventCooldowns: { ...state.eventCooldowns, dec_biz_offers: totalDays },
    };
    if (choiceIndex < bizOffers.length) {
      const chosen = bizOffers[choiceIndex];
      const started = startVenture(next, chosen.venture.id);
      return { ...started, livelihoodStatus: 'venture' };
    }
    return {
      ...next,
      logs: appendLog(next.logs, totalDays, 'survival', 'Bạn tạm gác ý định khởi nghiệp lúc này.'),
    };
  }

  return state;
}
