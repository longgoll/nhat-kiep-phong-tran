# 07 — Kiến Trúc `planYear` & Quy Chuẩn Auto-Test Giả Lập

> Tài liệu mô tả cơ chế lập lịch sự kiện/quyết định theo năm (`planYear`) và bộ kiểm thử giả lập cuộc đời (`lifeAuditSimulation.test.ts`), giúp kiểm soát nhịp độ câu chuyện theo chuẩn `1in8b` mà vẫn giữ nguyên tính ngẫu nhiên theo vùng miền & xuất thân.

---

## 1. Tại Sao Phải Chuyển Sang `planYear`?

Trước đây, `daySimulator.ts` tung xúc xắc `12/988` mỗi ngày trên một pool phẳng (`eventsPool`) và chỉ gọi `generateDynamicDecision` 1 lần vào ngày sinh nhật (`isBirthday`) theo chuỗi `if ... return`. Cách đó gây ra 2 vấn đề:
1. **Mất kiểm soát nhịp độ:** Năm thì trống trơn, năm thì sự kiện dồn cục; các quyết định định hình nhân vật dễ bị sự kiện lặt vặt làm loãng hoặc bị `if` đứng trên nuốt mất.
2. **Khó mở rộng theo vùng/giai đoạn:** Càng thêm nhiều sự kiện vùng miền, xác suất nổ của từng nhóm càng khó đoán.

Giải pháp là tách luồng trưởng thành (`age >= 13`) thành **Bộ Lập Lịch Năm (`src/engine/yearPlanner.ts`)** chạy mỗi đầu năm (`isBirthday`) hoặc ngày đầu tiên bước vào tuổi trưởng thành.

---

## 2. Kiến Trúc 2 Kênh Của `planYear`

Dữ liệu kế hoạch năm hiện tại được lưu trong `ActiveLifeState.yearPlan` (`YearPlanSnapshot` trong `src/types/activeLife.ts`):

| Trường | Ý nghĩa |
| :--- | :--- |
| `yearAge` | Tuổi của năm đã lập lịch (dùng để kiểm tra đã `planYear` cho năm này chưa). |
| `plannedAtDay` | `totalDays` tại thời điểm lập lịch. |
| `scheduledDecisions` | Tối đa **2 quyết định lớn** trong năm (`status`: `'pending' \| 'triggered' \| 'skipped'`). |
| `postponedDecisionIds` | Danh sách `decisionId` bị dư trong năm nay, sẽ được cộng `+15 priority` ở năm sau. |
| `feedEventIds` | Danh sách **2–3 sự kiện đời sống/vùng miền** đã rải vào `delayedEvents`. |

### Kênh 1 — `scheduledDecisions` (Tối đa 2 Quyết định định hình nhân vật / năm)
- Nguồn: `collectDynamicDecisionCandidates(state)` trong `src/engine/decisionGenerator.ts`.
- Bảng độ ưu tiên gốc (`DYNAMIC_DECISION_PRIORITIES`):
  1. `dec_loan_heavy` (`100`) — Khủng hoảng nợ nặng.
  2. `dec_college_18` (`90`) — Ngã rẽ tuổi 18 (Quốc Tử Giám / Võ học đường / Ra đời).
  3. `dec_retire_60` (`85`) — Nghỉ hưu tuổi 60+.
  4. `dec_rankup` (`75`) — Đề bạt thăng chức nghề nghiệp.
  5. `dec_job_offers` (`65`) — Tìm kiếm sinh kế / 3 lời mời việc làm.
  6. `dec_biz_offers` (`55`) — Cơ hội khởi nghiệp.
- **Cơ chế chống bỏ sót (Starvation Guard):** Nếu năm nay có > 2 quyết định cùng đủ điều kiện, 2 cái cao điểm nhất được rải vào nửa đầu (`~18..42%` năm) và nửa cuối (`~55..88%` năm). Các cái còn lại vào `postponedDecisionIds` và được **cộng `+15` điểm ưu tiên** ở năm kế tiếp.
- **Kích hoạt tức thì theo thao tác người chơi:** Nếu người chơi chủ động bấm Tìm việc (`cho_tim_viec_moi`) hoặc Khởi nghiệp (`cho_khoi_nghiep`) trong *Chi tiêu · Đầu tư*, `daySimulator.ts` kích hoạt ngay lập tức ở bước 4 mà không bắt chờ đến lịch năm sau.
- **Materialize tại thời điểm nổ:** Khi đến `triggerDay`, `daySimulator.ts` gọi `buildDynamicDecisionById(state, slot.decisionId)` để tạo `GameEventDef` với chỉ số mới nhất tại ngày đó. Nếu nhân vật không còn đủ điều kiện nữa (VD: đã tự trả hết nợ), slot tự chuyển sang `'skipped'`.

### Kênh 2 — `chooseFeed` (2–3 Sự kiện đời sống & vùng miền / năm)
- Mỗi năm PRNG chọn ngẫu nhiên `2` hoặc `3` sự kiện từ `eventsPool` thỏa mãn:
  - `stage === 'adulthood' || 'any'`
  - `cooldownDays > 0` (sự kiện `cooldownDays === 0` chỉ dành cho chuỗi `schedule_delayed`)
  - Chưa vi phạm `oncePerLife`, `cooldownDays`, chưa nằm trong `delayedEvents`, và đạt `evaluateConditions(state, evt.conditions)`.
- **Van chống spam Major Event:** Tối đa **1 sự kiện `severity === 'major'`** được chọn vào feed mỗi năm (tuân thủ `MAJOR_EVENT_COOLDOWN_DAYS = 90`); các slot còn lại ưu tiên sự kiện `minor` / đời sống.
- Các sự kiện được rải đều trong khoảng `[0.08, 0.94]` của năm (`ngày 28 → 338`), tự động né ngày trùng với `scheduledDecisions`.
- Khi `delayedEvents` kích hoạt trong `daySimulator.ts`, `eventCooldowns[target.id]` được ghi nhận ngay để đảm bảo `oncePerLife` và `cooldownDays` luôn chính xác.

---

## 3. Hướng Dẫn Mở Rộng (Thêm Quyết Định / Sự Kiện Mới)

### Thêm Quyết định động mới (`dec_*`)
1. Thêm ID và `priority` vào `DYNAMIC_DECISION_PRIORITIES` trong `src/engine/decisionGenerator.ts`.
2. Thêm nhánh `if ((!onlyId || onlyId === 'dec_moi') && ...)` trong `generateDynamicDecisionInternal`.
3. Xử lý hậu quả đặc thù (nếu có) trong `applyDynamicDecisionSideEffects`.
4. `planYear` sẽ tự động thu thập, xếp hạng và chống trùng lặp với các quyết định khác.

### Thêm Sự kiện vùng miền / chuỗi mới (JSON)
- **Sự kiện ngẫu nhiên theo vùng/ngữ cảnh:** Đặt `cooldownDays > 0` (VD: `360` hoặc `720`), khai báo điều kiện `origin_in`, `world_state_in`, `season_in`, `min_age`... `planYear` sẽ tự bốc vào Kênh 2 (`chooseFeed`).
- **Sự kiện chuỗi (Chain Event):** Bước 1 có `cooldownDays > 0`; các bước tiếp theo (`step_2`, `step_3`) đặt `cooldownDays: 0` và gọi qua `schedule_delayed` trong `effects` của bước trước.

---

## 4. Quy Chuẩn & Luật Auto-Test (`vitest`)

Mọi thay đổi liên quan đến `daySimulator`, `yearPlanner`, `decisionGenerator`, hoặc dữ liệu sự kiện JSON **bắt buộc phải pass cả 2 lệnh**:
```bash
npm run build   # tsc -b && vite build (0 lỗi TypeScript)
npm test        # vitest run (pass toàn bộ unit test & batch simulation)
```

### Cấu trúc bộ Test hiện tại
1. **Unit Test Cô Lập (`daySimulator.test.ts`, `coreEngine.test.ts`, `careerSystem.test.ts`, `progressionModules.test.ts`, `dataIntegrity.test.ts`):**
   - Lưu ý khi viết unit test cô lập cho `delayedEvents` ở tuổi 18+: `planYear` sẽ tự động lên lịch `dec_college_18` và `dec_job_offers` trong năm tuổi 18. Nếu test chỉ muốn chờ 1 delayed event cụ thể mà không muốn bị pause sớm, hãy gắn cờ `'dec_college_done'` và đặt `livelihoodStatus: 'homemaker'` (như mẫu trong `daySimulator.test.ts`).
2. **Bộ Kiểm Định Giả Lập Cuộc Đời (`src/engine/__tests__/lifeAuditSimulation.test.ts`):**
   - **Test 1 (Contract `planYear`):** Đảm bảo tối đa 2 `scheduledDecisions`, có đẩy dư sang `postponedDecisionIds`, và 2–3 `feedEventIds` không trùng lặp.
   - **Test 2 (Headless Batch Audit — 30 kiếp):** Chạy 5 xuất thân (`ban_nong`, `thu_cong`, `dia_chu`, `quan_lai`, `hoang_toc`) × 3 persona (`scholar`, `worker`, `balanced`) × 2 seeds từ tuổi 13 đến tối đa 75 tuổi.
   - **Các Invariant bắt buộc:**
     - Không có `NaN` ở bất kỳ chỉ số (`health`, `happiness`, `education`) hoặc `wealthCopper` nào.
     - `dec_college_18` phải nổ ổn định cho nhóm đủ điều kiện (`>= 20/30` kiếp).
     - Nhịp độ trung bình (`avgMajorTriggersPerYear`) phải nằm trong vùng lành mạnh `(0.2, 5.0)`.
     - Tuổi thọ trung bình trưởng thành phải `> 20` năm (không chết đói hàng loạt phi lý).
   - **Cách đọc báo cáo Audit khi chạy `npm test`:**
     - `Per-origin`: Kiểm tra xem các tầng lớp có phân hóa hợp lý không (`ban_nong` vất vả hơn `hoang_toc` nhưng vẫn sống được).
     - `Decision hits`: Kiểm tra các `dec_*` có nổ đúng kỳ vọng không.
     - `Untriggered major pool events`: Liệt kê các event chưa từng nổ trong 30 kiếp mẫu để phát hiện event bị khóa chết điều kiện.
     - `Sample chronicle`: In ra dòng thời gian tuổi → sự kiện → lựa chọn để dev hoặc Agent đọc rà soát lỗi vô lý về mặt mạch truyện.

---

## 5. Việc Cần Làm Tiếp Theo (Roadmap)
- [ ] **Mở rộng Bot Persona trong `lifeAuditSimulation.test.ts`:** Thêm persona chủ động *kết hôn / sinh con* (`marrySpouse`, `haveChild`) và persona *bấm khởi nghiệp* (`cho_khoi_nghiep`) để phủ nốt nhóm sự kiện `evt_adult_family_*` và `evt_biz_*` đang nằm trong danh sách `Untriggered`.
- [ ] **Dev Event Inspector (tùy chọn khi cần UI debug):** Tạo panel chỉ mount khi `import.meta.env.DEV` đọc trực tiếp `life.yearPlan` để xem lịch năm hiện tại, soi điều kiện `evaluateConditions` từng event và nút `Force Trigger`.
