# 04 — Sự Kiện Năm, Nghịch Cảnh, Gia Đình & Tử Vong (`planYear`, `deathProb`, `die`)

---

## 1. Bộ Lập Lịch Sự Kiện Năm (`planYear`)

- Mỗi năm chỉ tung ra:
  - **2–3 sự kiện đời sống (`chooseFeed`):** Rải đều trong năm (`t ∈ [0.08, 0.94]`), nhiều dòng có kèm số liệu thống kê thực tế (`Dữ liệu ...`).
  - **Tối đa 2 quyết định lớn (`scheduledDecisions`):** Hôn nhân, bệnh tật, vay nợ, lời mời việc làm, cột mốc con cái, thiên tai, chiến tranh. Nếu dư sẽ tự động hoãn sang năm sau bằng cờ (`huntAt`, `bizPlanAt`, `meetAt`...).
- **Cách cộng/trừ chỉ số trong sự kiện (`eff(n)`):**
  - Với `Sức khỏe (hl)`, `Hạnh phúc (h)`, `Quan hệ (so)`: **cộng/trừ thẳng** rồi `clamp(t[i] + n[i], 0, 100)` (không có diminishing returns theo ngưỡng; cân bằng dài hạn do Mean-reversion cuối năm đảm nhiệm).
  - Với `Kiến thức (sm)`: gọi `knowAdd(n.sm)` → `S.kE = clamp(S.kE + n.sm * 0.009, -1.4, 1.6)`, rồi quy đổi qua `100 * normCdf(kzOf())` (kẹp `[0.5, 99.9]`).
  - **Biên độ chuẩn (`vi.84480ea9ca.js`):**
    - `EVENTS` (sự kiện thường): `hl ∈ [-10, +6]` (median `-2`), `h ∈ [-20, +10]` (median `+2`), `sm ∈ [-3, +5]` (median `+2`), `so ∈ [-6, +8]` (median `+2`).
    - `DEC` (quyết định): `hl ∈ [-14, +6]` (median `-2`), `h ∈ [-25, +15]` (phổ biến `±2..±8`), `sm ∈ [+2, +6]` (median `+2`), `so ∈ [-8, +8]` (median `+2`).

---

## 2. Nghịch Cảnh & Phản Ánh Lên Hồ Sơ

- **Biến cố gia cảnh (`famFortuneYear`):** Nợ nần hoặc phá sản gia đình có thể làm tụt trực tiếp chỉ số **`Hoàn cảnh gia đình`** trên hộ chiếu (ví dụ `5/5 → 4/5`).
- **Nợ cá nhân (`S.money < 0`):**
  - `Tài sản ròng` chuyển sang số âm màu đỏ và hiện thêm dòng **`Nợ`**.
  - Khi nợ phình to (`debtHeavy()`), tự bật **`DEC.loan`** (*"Nợ đã phình to"*): xin gia đình hỗ trợ (`Quan hệ↓`), trả dần từ thu nhập, hoặc vay nặng lãi.
- **Thất nghiệp (`S.job = "seeking"`):**
  - Hồ sơ đổi thành **`Đang tìm việc`**, thu nhập ghi **`Không có thu nhập`**, bảng Trọng tâm tự chuyển sang nhóm cho người chưa có việc.
- **Bệnh tật / Tai nạn (`olfIllYear`, `DEC.illness`, `DEC.diag`):**
  - Sức khỏe `< 60` làm tăng gấp đôi nguy cơ đổ bệnh; bệnh nặng có thể buộc nghỉ việc về `seeking` (`sickOut`) và tốn viện phí tự chi trả theo tỷ lệ y tế của từng nước.
- **Trạng thái thân phận đặc biệt khác:** `homemaker` (*Nội trợ*), `prison` (*Trong tù* — tạm dừng học/việc), `student` (*Học viên*), `retired` (*Nghỉ hưu*).

---

## 3. Gia Đình, Hôn Nhân & Tài Chính Hộ (`finances`, `DEC.propose`, `DEC.kidtalk`)

- **Tác động chỉ số nền:** Có vợ/chồng còn sống cộng `+12` vào mức nền `Quan hệ`; mỗi con còn sống cộng `+4` (tối đa `+15`).
- **Tài chính:**
  - Vợ/chồng có thu nhập riêng (`partnerWork`), giúp người chọn `homemaker` vẫn có nguồn sống.
  - Con nhỏ (`< 18` tuổi) tốn chi phí nuôi dưỡng, học thêm/trường tư; nhưng khi con trưởng thành (`≥ 22` tuổi) có thể **gửi tiền phụng dưỡng cha mẹ già** (`kidHelpAmt`) nếu cha mẹ không có lương hưu.
- **Tài chính cuối năm (`taxRate`, `saveRate`):** Không trừ cơm áo từng ngày; cuối năm tính `Thu nhập − Thuế lũy tiến − Chi tiêu sinh hoạt (theo hàm log thu nhập)` cộng vào `S.money`.

---

## 4. Tử Vong & Tổng Kết Cuộc Đời (`deathProb`, `die`, `#dead`)

- **Xác suất tử vong (`deathProb`):**
  - Lấy xác suất nền `p0` từ bảng tuổi thọ thực tế (`LT().q[age]`), nhân với:
    - Chênh lệch sức khỏe: `exp((expectedHealth - S.st.hl) * (age < 5 ? 0.02 : 0.03))` (tối thiểu `0.5×`),
    - Phân vị thu nhập / giàu nghèo (`MORT_G`),
    - Thói quen hút thuốc (`1.7×` đang hút, `1.25×` từng hút).
  - Kết hợp với các rủi ro độc lập (HIV, chiến tranh, thiên tai, tai nạn giao thông/nghề nghiệp): `1 - (1 - p0)*(1 - hz)*(1 - rz)*(1 - sz)`. Giới hạn tối đa 122 tuổi.
- **Màn hình qua đời (`#dead`):**
  - Nếu có bảo hiểm nhân thọ (`18–69` tuổi) và còn vợ/chồng/con nhỏ, chi trả `4 × medianIncome`.
  - Hiển thị nguyên nhân mất, tổng hợp toàn bộ **Bản đồ cuộc đời** (`1 ô = 1 năm`), các cột mốc lớn, thẻ chia sẻ và lưu vào kho lưu trữ các kiếp trước.
