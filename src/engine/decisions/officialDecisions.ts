import { getAgeYears, type ActiveLifeState } from '../../types/activeLife';
import type { GameEventDef } from '../../types/dsl';
import {
  canRequestKhaoKhoa,
  getOfficialRankSpec,
  getOfficialTitle,
} from '../officialSystem';

export function buildOfficialDecision(
  state: ActiveLifeState,
  onlyId?: string,
): GameEventDef | null {
  const age = getAgeYears(state.profile.totalDays);
  const totalDays = state.profile.totalDays;

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
  const canReofferAfterDeferral =
    state.flags.includes('hoan_nham_chuc_de_thi') && state.flags.includes('do_tien_si');
  if (
    (!onlyId || onlyId === 'dec_official_appoint') &&
    canBeOfficialByGender &&
    (state.eventCooldowns['dec_official_appoint'] === undefined || canReofferAfterDeferral) &&
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
    const choices: GameEventDef['choices'] = [
      {
        label: `Nhận sắc phong nhậm chức ${startRankTitle}`,
        hint: 'Chính thức bước vào quan trường · Ngừng thi Khoa cử, thăng tiến qua Khảo khóa',
        outcomes: [
          {
            weight: { base: 100 },
            effects: { happiness: 6, remove_flags: ['hoan_nham_chuc_de_thi'] },
            resultText: `Bạn bái lạy nhận sắc phong, chính thức nhậm chức ${startRankTitle}.`,
          },
        ],
      },
    ];
    if (!state.flags.includes('do_tien_si')) {
      choices.push({
        label: 'Hoãn nhậm chức, tiếp tục dùi mài thi Hội / Thi Đình',
        hint: 'Chưa làm quan ngay · Đỗ Tiến sĩ sẽ khởi đầu ở phẩm hàm cao hơn',
        outcomes: [
          {
            weight: { base: 100 },
            effects: { add_flags: ['hoan_nham_chuc_de_thi'] },
            resultText: 'Bạn xin triều đình tạm hoãn nhậm chức để tiếp tục dùi mài kinh sử chờ kỳ thi cao hơn.',
          },
        ],
      });
    }
    choices.push({
      label: 'Từ chối làm quan, giữ chí ẩn dật hoặc tự lập',
      hint: 'Không tham gia quan trường',
      outcomes: [
        {
          weight: { base: 100 },
          effects: { fame: 3, add_flags: ['dec_official_declined'], remove_flags: ['hoan_nham_chuc_de_thi'] },
          resultText: 'Bạn khéo léo cáo từ sắc phong, chọn cuộc sống tự do ngoài chốn quan trường.',
        },
      ],
    });
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
      choices,
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


  return null;
}
