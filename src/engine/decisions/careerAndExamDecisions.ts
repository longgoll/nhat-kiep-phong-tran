import { DAYS_PER_YEAR, getAgeYears, type ActiveLifeState } from '../../types/activeLife';
import type { GameEventDef } from '../../types/dsl';
import { formatCopper } from '../economy';
import {
  canPromoteCareer,
  getAvailableVentures,
  getRecommendedCareerOffers,
} from '../careerSystem';
import { hasActiveLivelihood } from '../lifeStatus';
import { getExamEligibility, type ExamLevel } from '../progressionModules';

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
  if (state.officialRank > 0) return null;
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

export function buildCareerAndExamDecision(
  state: ActiveLifeState,
  onlyId?: string,
): GameEventDef | null {
  const age = getAgeYears(state.profile.totalDays);
  const totalDays = state.profile.totalDays;

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
