import { DAYS_PER_YEAR, getAgeYears, type ActiveLifeState } from '../types/activeLife';
import type { GameEventDef } from '../types/dsl';
import { formatCopper } from './economy';
import {
  CAREER_CATALOG,
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
import {
  appointOrPromoteOfficial,
  getExamEligibility,
  sellProperty,
  takeExam,
  type ExamLevel,
} from './progressionModules';
import {
  canRequestKhaoKhoa,
  createOfficialProfile,
  getOfficialRankSpec,
  getOfficialTitle,
  setOfficialFamilyAccompany,
} from './officialSystem';

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

const EXAM_LABELS: Record<ExamLevel, { title: string; desc: string }> = {
  huong: {
    title: 'Kỳ Thi Hương Mùa Thu',
    desc: 'Trường thi hương mở cửa vào Mùa Thu năm nay. Bạn đã đủ học lực và lộ phí để lều chõng ứng thí, tranh bảng Tú tài / Cử nhân.',
  },
  hoi: {
    title: 'Kỳ Thi Hội Kinh Đô',
    desc: 'Mùa Xuân đã tới, triều đình mở khoa Thi Hội tại kinh thành cho các Cử nhân. Đây là bước ngoặt để đỗ Cống sĩ.',
  },
  dinh: {
    title: 'Điện Thí Thi Đình trước Ngự Tiền',
    desc: 'Sau khi đỗ Cống sĩ, bạn đã đủ thực lực bước vào Điện thí Thi Đình để tranh danh hiệu Tiến sĩ hoặc Tam khôi.',
  },
};

export function getEligibleExamLevelForPrompt(state: ActiveLifeState): ExamLevel | null {
  const age = getAgeYears(state.profile.totalDays);
  if (age < 13) return null;
  const currentYear = Math.floor(state.profile.totalDays / DAYS_PER_YEAR);
  for (const level of ['dinh', 'hoi', 'huong'] as const) {
    const promptCooldown = state.eventCooldowns[`dec_exam_${level}`];
    if (promptCooldown !== undefined && Math.floor(promptCooldown / DAYS_PER_YEAR) === currentYear) {
      continue;
    }
    if (getExamEligibility(state, level).ok) {
      return level;
    }
  }
  return null;
}

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
  const canAttendMaleAcademy =
    state.profile.gender === 'male' ||
    state.flags.includes('nu_cai_nam_trang') ||
    state.flags.includes('nu_quan_dac_xa');
  if (
    (!onlyId || onlyId === 'dec_college_18') &&
    age >= 18 &&
    age <= 20 &&
    !state.flags.includes('dec_college_done') &&
    !state.flags.includes('trong_hau_cung') &&
    !state.flags.includes('thai_giam') &&
    !state.flags.includes('trong_quan_ngu') &&
    !state.flags.includes('bi_ep_lam_gia_no') &&
    !state.flags.includes('dang_lam_quan') &&
    state.officialRank === 0 &&
    (state.eduLevel ?? 0) < 4 &&
    state.livelihoodStatus !== 'prison'
  ) {
    const maleAcademyLock = canAttendMaleAcademy
      ? undefined
      : { has_any_flag: ['nu_cai_nam_trang', 'nu_quan_dac_xa'] };
    return {
      id: 'dec_college_18',
      stage: 'adulthood',
      severity: 'major',
      conditions: {},
      isMilestone: true,
      title: canAttendMaleAcademy
        ? 'Ngã rẽ tuổi 18: Nhập học Quốc Tử Giám hay Ra đời lập nghiệp?'
        : 'Ngã rẽ tuổi 18: Học Y dược · Thương toán hay Ra đời tự lập?',
      description: canAttendMaleAcademy
        ? 'Bạn đã bước sang tuổi trưởng thành. Các kỳ khảo thí vào Quốc Tử Giám và Thư viện lớn đang mở cửa cho sĩ tử khắp nơi.'
        : 'Bạn đã bước sang tuổi trưởng thành. Theo lễ giáo đương thời, nữ nhi chưa cải nam trang không được dự thi Quốc Tử Giám hay Võ học đường, nhưng vẫn có thể theo học Y dược · Thương toán hoặc tự lập mưu sinh.',
      contextNote: `Học thức hiện tại: ${Math.round(state.stats.education)} · Hoàn cảnh gia đình quyết định phần lớn học phí ăn ở.`,
      cooldownDays: 99999,
      weight: { base: 100 },
      choices: [
        {
          label: 'Ứng thí Quốc Tử Giám — Kinh sử · Chính trị',
          hint: 'Học thức +6 · Mở rộng đường Khoa cử & Quan trường',
          ...(maleAcademyLock ? { conditions: maleAcademyLock } : {}),
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
          label: canAttendMaleAcademy
            ? 'Ứng thí Quốc Tử Giám — Y dược · Thương toán'
            : 'Theo học Nữ học — Y dược · Thương toán tại Thư viện',
          hint: 'Học thức +5 · Thương tài +4 · Thuận lợi làm thầy thuốc & buôn bán',
          outcomes: [
            {
              weight: { base: 100 },
              effects: {
                education: 5,
                craft_trade: 4,
                happiness: 3,
                add_flags: ['dec_college_done'],
                milestone_title: canAttendMaleAcademy
                  ? 'Nhập học Quốc Tử Giám (Y dược · Thương toán)'
                  : 'Theo học Y dược · Thương toán tại Thư viện',
              },
              resultText: 'Bạn theo học ngành Y dược · Thương toán tại Thư viện lớn.',
            },
          ],
        },
        {
          label: 'Ghi danh Võ học đường — Binh pháp & Võ nghệ',
          hint: 'Võ nghệ +6 · Sức khỏe +3 · Mở rộng đường Tòng quân',
          ...(maleAcademyLock ? { conditions: maleAcademyLock } : {}),
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
  const canBeOfficialByGender =
    state.profile.gender === 'male' ||
    state.flags.includes('nu_cai_nam_trang') ||
    state.flags.includes('nu_quan_dac_xa');
  const hasExamDegree = state.flags.includes('do_cu_nhan') || state.flags.includes('do_tien_si');
  const hasPatronEntry =
    (state.flags.includes('co_an_tap_am') ||
      state.flags.includes('duoc_quy_nhan_nang_do') ||
      state.profile.originClass === 'quan_lai' ||
      state.profile.originClass === 'hoang_toc') &&
    state.stats.education >= 24;
  if (
    (!onlyId || onlyId === 'dec_official_appoint') &&
    canBeOfficialByGender &&
    state.eventCooldowns['dec_official_appoint'] === undefined &&
    age >= 20 &&
    age < 60 &&
    state.officialRank === 0 &&
    (hasExamDegree || hasPatronEntry) &&
    !state.flags.includes('dec_official_declined') &&
    !state.flags.includes('trong_hau_cung') &&
    !state.flags.includes('thai_giam') &&
    state.livelihoodStatus !== 'retired' &&
    state.livelihoodStatus !== 'prison'
  ) {
    const previewRank = state.flags.includes('trang_nguyen') || state.flags.includes('bang_nhan')
      ? 5
      : state.flags.includes('tham_hoa') || state.flags.includes('hoang_giap')
        ? 4
        : state.flags.includes('do_tien_si') || state.flags.includes('giai_nguyen')
          ? 3
          : state.flags.includes('do_cu_nhan')
            ? 2
            : 1;
    const previewTrack = state.flags.includes('trong_quan_ngu') ? 'vo' : 'van';
    const startRankTitle = getOfficialTitle(previewRank, previewTrack);
    const entryReason = hasExamDegree
      ? 'Nhờ khoa bảng đỗ đạt, triều đình đã ban trát triệu tập bạn ra làm quan'
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

  // 2c. DEC.official_promote: Kỳ Khảo khóa 3 năm
  if (
    (!onlyId || onlyId === 'dec_official_promote') &&
    state.officialRank >= 1 &&
    state.officialRank < 9 &&
    canRequestKhaoKhoa(state).ok &&
    totalDays - (state.eventCooldowns['dec_official_promote'] ?? -99999) >= 360 &&
    state.livelihoodStatus !== 'prison'
  ) {
    const nextSpec = getOfficialRankSpec(state.officialRank + 1);
    const nextRankTitle = nextSpec ? `${nextSpec.gradeLabel} · ${nextSpec.titles[state.official?.track ?? 'van']}` : 'Đại thần';
    return {
      id: 'dec_official_promote',
      stage: 'adulthood',
      severity: 'major',
      isMilestone: true,
      conditions: {},
      title: `Kỳ Khảo khóa Triều đình: Xét thăng ${nextRankTitle}`,
      description: `Đã hết nhiệm kỳ 3 năm tại nhiệm sở. Bộ Lại/Bộ Binh mở sổ Khảo khóa đánh giá Chính tích (${state.official?.merit ?? 0}), Dân tâm (${state.official?.publicTrust ?? 0}), Thánh sủng (${state.official?.imperialFavor ?? 0}) và Án tích (${state.official?.scandalRisk ?? 0}).`,
      cooldownDays: 360,
      weight: { base: 100 },
      choices: [
        {
          label: `Nộp sổ Khảo khóa xin xét thăng ${nextRankTitle}`,
          hint: 'Thượng khảo: Thăng 1 phẩm · Trung khảo: Giữ nguyên · Hạ khảo: Giáng/Cách chức',
          outcomes: [
            {
              weight: { base: 100 },
              effects: {},
              resultText: `Triều đình đã tiếp nhận sổ Khảo khóa và công bố kết quả xét hạch của bạn.`,
            },
          ],
        },
        {
          label: 'Dâng sớ xin tạm giữ nguyên chức cũ để tránh mũi dùi phe phái',
          hint: 'Tránh bị soi xét kỳ này · Thanh danh +2',
          outcomes: [
            {
              weight: { base: 100 },
              effects: { fame: 2 },
              resultText: 'Bạn chủ động cáo từ thăng tiến, tiếp tục giữ vững vị trí hiện tại.',
            },
          ],
        },
      ],
    };
  }

  // 2d. DEC.official_family_move: An bài gia quyến khi nhậm chức xa (Phân biệt Văn vs Võ)
  const hasSpouseOrChild = state.npcs.some((n) => (n.relation === 'spouse' || n.relation === 'child') && n.isAlive);
  if (
    (!onlyId || onlyId === 'dec_official_family_move') &&
    state.officialRank > 0 &&
    state.official &&
    state.official.posting !== 'kinh_do' &&
    !state.official.familyAccompanied &&
    hasSpouseOrChild &&
    state.eventCooldowns['dec_official_family_move'] === undefined
  ) {
    const isMilitaryFrontline = state.official.track === 'vo' && state.official.posting === 'bien_ai';
    if (isMilitaryFrontline) {
      const supportCopper = Math.max(800, state.officialRank * 600);
      return {
        id: 'dec_official_family_move',
        stage: 'adulthood',
        severity: 'major',
        conditions: {},
        title: 'Quân Lệnh Biên Ải: An bài Gia quyến Nơi Hậu Phương',
        description: `Bạn được điều ra doanh trại Biên ải tiền tuyến. Theo quân kỷ, tướng sĩ không được mang gia quyến ra chiến trường. Bạn thu xếp cho vợ con ở quê thế nào?`,
        cooldownDays: 99999,
        weight: { base: 100 },
        choices: [
          {
            label: `Gửi ${supportCopper}đ bổng lộc & lễ vật về quê nhờ họ hàng chăm nom`,
            hint: `-${supportCopper}đ · Giữ vững Quan hệ +5 & Hạnh phúc +2`,
            outcomes: [
              {
                weight: { base: 100 },
                effects: { copper: -supportCopper, relationships: 5, happiness: 2 },
                resultText: 'Bạn gửi bạc và thư nhà về quê dặn dò gia quyến yên tâm ở hậu phương.',
              },
            ],
          },
          {
            label: 'Dặn gia quyến tự giữ nếp nhà, dồn toàn tâm cho quân vụ',
            hint: 'Tiết kiệm bạc · Quân công +3 · Hạnh phúc -4',
            outcomes: [
              {
                weight: { base: 100 },
                effects: { merit: 3, happiness: -4 },
                resultText: 'Bạn nén nỗi nhớ nhà, toàn tâm toàn ý lo việc phòng thủ biên cương.',
              },
            ],
          },
        ],
      };
    }

    const movingCost = state.officialRank * 600;
    const residenceLabel = state.official.track === 'vo' ? 'Tướng phủ' : 'phủ nha';
    return {
      id: 'dec_official_family_move',
      stage: 'adulthood',
      severity: 'major',
      conditions: {},
      title: 'Luật Hồi Tỵ: An bài Gia quyến khi Nhậm chức xa',
      description: `Bạn được điều đi trấn nhậm xa nguyên quán. Bạn định đón vợ/con lên ${residenceLabel} cùng ở hay để gia quyến ở lại quê nhà?`,
      cooldownDays: 99999,
      weight: { base: 100 },
      choices: [
        {
          label: `Đưa gia quyến cùng lên ${residenceLabel} nhậm chức (-${movingCost}đ lộ phí)`,
          hint: `Giữ trọn Hạnh phúc & Quan hệ · Vợ/chồng nghỉ nghề cũ để quản gia · Tốn thêm tiền phủ đệ`,
          outcomes: [
            {
              weight: { base: 100 },
              effects: {},
              resultText: `Bạn thu xếp xe ngựa đưa gia quyến cùng lên ${residenceLabel} nhậm chức.`,
            },
          ],
        },
        {
          label: 'Để gia quyến ở lại quê nhà giữ từ đường',
          hint: 'Tiết kiệm chi phí · Vợ/chồng giữ nghề ở quê · Hạnh phúc & Quan hệ giảm nhẹ',
          outcomes: [
            {
              weight: { base: 100 },
              effects: {},
              resultText: 'Bạn dặn dò gia quyến ở lại quê chăm lo hương hỏa, một thân lên đường nhậm chức.',
            },
          ],
        },
      ],
    };
  }

  // 2e. DEC.official_censor_audit: Ngự sử đàn hặc khi Hiềm nghi >= 65
  if (
    (!onlyId || onlyId === 'dec_official_censor_audit') &&
    state.officialRank > 0 &&
    state.official &&
    state.official.scandalRisk >= 65 &&
    totalDays - (state.eventCooldowns['dec_official_censor_audit'] ?? -99999) >= 360
  ) {
    const bribeCost = state.officialRank * 5000;
    return {
      id: 'dec_official_censor_audit',
      stage: 'adulthood',
      severity: 'major',
      isMilestone: true,
      conditions: {},
      title: 'Ngự Sử Đô Sát Viện Dâng Sớ Đàn Hặc!',
      description: `Án tích và hiềm nghi của bạn đã lên tới ${Math.round(state.official.scandalRisk)}/100. Đô Sát Viện vừa dâng sớ hạch tội bạn tham ô, kinh doanh ngầm hoặc vượt lễ chế!`,
      cooldownDays: 360,
      weight: { base: 100 },
      choices: [
        {
          label: state.official.hasAdvisor
            ? 'Nhờ Sư gia soạn sớ phản biện rõ ràng từng khoản sổ sách'
            : 'Tự dâng sớ nhận lỗi sơ suất, xin nộp phạt bổng để chuộc tội',
          hint: state.official.hasAdvisor ? 'Có Sư gia bảo vệ: Giảm mạnh Hiềm nghi' : 'Phạt bổng 180 ngày · Giảm Hiềm nghi',
          outcomes: [
            {
              weight: { base: state.official.hasAdvisor ? 80 : 50 },
              effects: {
                scandal_risk: -25,
                suspend_salary_days: state.official.hasAdvisor ? 0 : 180,
                imperial_favor: -5,
              },
              resultText: state.official.hasAdvisor
                ? 'Nhờ Sư gia chuẩn bị sổ sách kín kẽ, triều đình tạm gác án đàn hặc.'
                : 'Triều đình xét bạn thành khẩn, chỉ phạt cắt bổng 6 tháng để răn đe.',
            },
            {
              weight: { base: state.official.hasAdvisor ? 20 : 50 },
              effects: {
                official_rank_delta: -1,
                scandal_risk: -30,
                imperial_favor: -15,
              },
              resultText: 'Chứng cứ quá rõ ràng, bạn bị giáng 1 phẩm để làm gương cho bách quan!',
            },
          ],
        },
        {
          label: `Chạy cửa sau hối lộ quan thanh tra (${bribeCost}đ)`,
          hint: 'Rủi ro cực lớn nếu gặp phe Thanh lưu: Có thể bị tịch biên gia sản!',
          outcomes: [
            {
              weight: { base: state.world.worldState === 'binh_on' ? 40 : 65 },
              effects: {
                copper: -bribeCost,
                scandal_risk: -20,
                infamy: 6,
              },
              resultText: 'Tiền bạc mở đường, sớ đàn hặc bị ém nhẹm vào phút chót.',
            },
            {
              weight: { base: state.world.worldState === 'binh_on' ? 60 : 35 },
              effects: {
                reset_official_rank: true,
                confiscate_assets: true,
                infamy: 20,
                happiness: -30,
              },
              resultText: 'Gặp đúng Ngự sử Thanh lưu! Hối lộ bất thành, bạn bị cách chức và tịch biên gia sản!',
            },
          ],
        },
      ],
    };
  }

  // 2f. DEC.official_cong_cao_chan_chu: Công cao chấn chủ ở Nhị–Nhất phẩm
  if (
    (!onlyId || onlyId === 'dec_official_cong_cao_chan_chu') &&
    state.officialRank >= 8 &&
    state.official &&
    (state.stats.fame >= 400 || (state.rebellion?.armyPower ?? 0) >= 40) &&
    state.official.imperialFavor < 60 &&
    totalDays - (state.eventCooldowns['dec_official_cong_cao_chan_chu'] ?? -99999) >= 1080
  ) {
    const tributeCopper = 20000;
    return {
      id: 'dec_official_cong_cao_chan_chu',
      stage: 'adulthood',
      severity: 'major',
      isMilestone: true,
      conditions: {},
      title: 'Thánh Ý Khó Lường: Nỗi Lo "Công Cao Chấn Chủ"',
      description: `Uy danh của bạn đã vang dội thiên hạ trong khi Thánh sủng chỉ ở mức ${Math.round(state.official.imperialFavor)}/100. Hoàng đế bắt đầu e ngại quyền thế của bạn quá lớn!`,
      cooldownDays: 1080,
      weight: { base: 100 },
      choices: [
        {
          label: `Tự dâng sớ xin giao bớt thực quyền và quyên 20.000đ khao quân/đắp đê tỏ lòng trung`,
          hint: '-20.000đ · Thánh sủng +20 · Hiềm nghi -15 · An toàn',
          outcomes: [
            {
              weight: { base: 100 },
              effects: {
                copper: -tributeCopper,
                imperial_favor: 20,
                scandal_risk: -15,
              },
              resultText: 'Hoàng đế hài lòng trước sự khiêm nhường của bạn, tạm xóa bỏ nghi kỵ.',
            },
          ],
        },
        {
          label: 'Cương quyết giữ vững thực quyền và binh mã, không chịu nhún nhường',
          hint: 'Rủi ro cực cao: Bị Hoàng đế tước quyền, giáng chức hoặc ép Trí sĩ!',
          outcomes: [
            {
              weight: { base: 35 },
              effects: { fame: 15, imperial_favor: -10 },
              resultText: 'Bạn cứng rắn giữ vững thế trận triều đường, nhưng mối nghi kỵ với Hoàng đế càng sâu sắc.',
            },
            {
              weight: { base: 65 },
              effects: {
                official_rank_delta: -2,
                imperial_favor: -20,
                happiness: -15,
              },
              resultText: 'Thánh chỉ giáng xuống bất ngờ: bạn bị tước bớt binh quyền và giáng liền 2 phẩm!',
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
    age >= 13 &&
    !state.isStudent &&
    !state.flags.includes('trong_hau_cung') &&
    !state.flags.includes('thai_giam') &&
    !state.flags.includes('bi_ep_lam_gia_no') &&
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
    age >= 15 &&
    !state.isStudent &&
    state.flags.includes('cho_khoi_nghiep') &&
    !state.flags.includes('trong_hau_cung') &&
    !state.flags.includes('thai_giam') &&
    !state.flags.includes('bi_ep_lam_gia_no') &&
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

  // 7. DEC.exam_prompt when eligible for Thi Hương / Thi Hội / Thi Đình
  if (!onlyId || onlyId === 'dec_exam_prompt') {
    const examLevel = getEligibleExamLevelForPrompt(state);
    if (examLevel) {
      const elig = getExamEligibility(state, examLevel);
      const labelMeta = EXAM_LABELS[examLevel];
      const costText = elig.cost > 0 ? formatCopper(elig.cost) : 'Miễn lộ phí';
      return {
        id: 'dec_exam_prompt',
        stage: 'adulthood',
        severity: 'major',
        conditions: {},
        title: `Khoa cử: ${labelMeta.title}`,
        description: labelMeta.desc,
        cooldownDays: 360,
        weight: { base: 100 },
        choices: [
          {
            label: `Ứng thí ngay (${costText})`,
            hint: 'Bước vào trường thi kỳ này · Mỗi năm chỉ được dự thi 1 lần',
            outcomes: [
              {
                weight: { base: 100 },
                effects: {},
                resultText: 'Bạn thu xếp hành trang bước vào trường thi.',
              },
            ],
          },
          {
            label: 'Chưa dự thi kỳ này · Dùi mài thêm',
            hint: 'Giữ lại lộ phí · Có thể tự đăng ký lại trong mục Khoa cử nếu vẫn còn mùa thi',
            outcomes: [
              {
                weight: { base: 100 },
                effects: {},
                resultText: 'Bạn quyết định tích lũy thêm học vấn trước khi ứng thí.',
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
    const activeJob = state.activeCareer
      ? CAREER_CATALOG.find((j) => j.id === state.activeCareer!.jobId)
      : undefined;
    const baseState =
      choiceIndex <= 2 && activeJob && activeJob.slots.some((s) => s === 'morning' || s === 'afternoon')
        ? resignCareer(state)
        : state;

    if (choiceIndex === 0) {
      return {
        ...baseState,
        eduLevel: 4,
        isStudent: true,
        major: 'Kinh sử · Chính trị',
        livelihoodStatus: 'student',
        profile: { ...baseState.profile, currentRole: 'Giám sinh Quốc Tử Giám' },
      };
    }
    if (choiceIndex === 1) {
      return {
        ...baseState,
        eduLevel: 4,
        isStudent: true,
        major: 'Y dược · Thương toán',
        livelihoodStatus: 'student',
        profile: { ...baseState.profile, currentRole: 'Học trò Thư viện lớn' },
      };
    }
    if (choiceIndex === 2) {
      return {
        ...baseState,
        eduLevel: 4,
        isStudent: true,
        major: 'Binh pháp',
        livelihoodStatus: 'student',
        profile: { ...baseState.profile, currentRole: 'Võ sinh Võ học đường' },
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
        flags: resigned.flags.filter((f) => f !== 'dang_lam_quan'),
        livelihoodStatus: 'retired',
        officialRank: 0,
        profile: { ...resigned.profile, currentRole: 'Nghỉ hưu' },
      };
    }
    return next;
  }

  if (eventId === 'dec_official_appoint') {
    const stamped = {
      ...state,
      eventCooldowns: { ...state.eventCooldowns, dec_official_appoint: totalDays },
    };
    if (choiceIndex === 0) {
      if (
        stamped.flags.includes('do_tu_tai') ||
        stamped.flags.includes('do_cu_nhan') ||
        stamped.flags.includes('do_tien_si') ||
        stamped.flags.includes('trong_quan_ngu')
      ) {
        return appointOrPromoteOfficial(stamped);
      }
      const track = stamped.stats.martial > stamped.stats.education + 12 ? 'vo' : 'van';
      const { profile: offProfile, nextPrng } = createOfficialProfile(stamped, track, 1, false);
      const title = getOfficialTitle(1, track);
      const next = applyEffects(
        { ...stamped, prngState: nextPrng },
        {
          official_rank_delta: 1,
          add_flags: ['dang_lam_quan'],
          fame: 8,
          milestone_title: `Được tiến cử nhậm chức ${title}`,
        },
      );
      return {
        ...next,
        official: offProfile,
        profile: { ...next.profile, currentRole: title },
      };
    }
    return stamped;
  }

  if (eventId === 'dec_official_family_move') {
    const stamped = {
      ...state,
      eventCooldowns: { ...state.eventCooldowns, dec_official_family_move: totalDays },
    };
    if (stamped.official?.track === 'vo' && stamped.official.posting === 'bien_ai') {
      return stamped;
    }
    return setOfficialFamilyAccompany(stamped, choiceIndex === 0);
  }

  if (eventId === 'dec_official_censor_audit') {
    return {
      ...state,
      eventCooldowns: { ...state.eventCooldowns, dec_official_censor_audit: totalDays },
    };
  }

  if (eventId === 'dec_official_cong_cao_chan_chu') {
    return {
      ...state,
      eventCooldowns: { ...state.eventCooldowns, dec_official_cong_cao_chan_chu: totalDays },
    };
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

  if (eventId === 'dec_exam_prompt') {
    const examLevel = getEligibleExamLevelForPrompt(state);
    if (!examLevel) return state;
    const next = {
      ...state,
      eventCooldowns: { ...state.eventCooldowns, [`dec_exam_${examLevel}`]: totalDays },
    };
    if (choiceIndex === 0) {
      return takeExam(next, examLevel);
    }
    return {
      ...next,
      logs: appendLog(next.logs, totalDays, 'study', 'Bạn quyết định tạm gác kỳ thi năm nay để dùi mài thêm.'),
    };
  }

  return state;
}
