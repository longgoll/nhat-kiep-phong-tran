import { getAgeYears, type ActiveLifeState } from '../../types/activeLife';
import type { GameEventDef } from '../../types/dsl';
import { formatCopper } from '../economy';
import { hasActiveLivelihood } from '../lifeStatus';

export function buildLifeMilestoneDecision(
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
    !state.flags.includes('do_cu_nhan') &&
    !state.flags.includes('do_tien_si') &&
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


  return null;
}
