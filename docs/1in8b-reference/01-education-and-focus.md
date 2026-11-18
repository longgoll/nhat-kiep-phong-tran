# 01 — Học Vấn & Trọng Tâm Năm (`S.edu`, `S.fT`, `endYear`)

---

## 1. Hệ Thống Học Vấn (`S.edu` 0–5 & `S.school`)

### Các bậc học theo tuổi
- **0–5 tuổi (`baby`):** Chưa đi học; hình thành tính khí quanh tuổi lên 5 qua các lựa chọn đầu đời (đồ chơi, tiền tiêu vặt).
- **6+ tuổi:**
  - `edu = 1`: Tiểu học (`prim`)
  - `edu = 2`: THCS (`lsec`)
  - `edu = 3`: THPT (`usec`) hoặc Đào tạo nghề (`voc`)
  - `edu = 4`: Đại học (`uni`, chọn chuyên ngành `S.major` từ ~13+ ngành như Sư phạm, KHTN, KHXH, Luật, Y khoa, Nghệ thuật, Báo chí, Kiến trúc, Du lịch, Quân sự...)
  - `edu = 5`: Cao học / Thạc sĩ (`grad`) → Tiến sĩ (`S.flags.dr`)

### Công thức xác suất lên lớp & đỗ đại học (`eduModel` & `eduProbs`)
- Tính xác suất nền theo chỉ số giáo dục quốc gia (`eys` — số năm đi học kỳ vọng, `ter` — tỷ lệ vào đại học):
  - Tiểu học: `1 / (1 + exp(-(eys - 7) / 1.3))`
  - THCS: `1 / (1 + exp(-(eys - 10) / 1.4))`
  - THPT: `1 / (1 + exp(-(eys - 12) / 1.5))`
- Nhân với **phân vị giàu nghèo gia đình (`S.q` 1–5)** qua `exp(f * (q - 3))` (`f = 0.6` ở nước thu nhập thấp `< $15k PPP`, `0.45` ở nước khác) và hệ số thành thị/nông thôn (`1.4` vs `0.75`).
- Cộng thêm rào cản đặc thù (giới tính ở một số nước, tảo hôn, lao động trẻ em, khuyết tật).

### Thi trượt, Thi lại & Học bổ túc khi trưởng thành
- **Thi đại học (`DEC.college`):** Tung xúc xắc dựa trên xác suất nền cộng thêm nỗ lực (`Kiến thức` + trọng tâm `Học tập`).
- **Thi lại (`DEC.retake`):** Nếu trượt, bật quyết định *"Thi lại?"* (tối đa 3 lần: ôn thêm 1 năm hoặc đi làm ngay).
- **Học bổ túc (`DEC.adultedu`):** Người từng bỏ học sớm (nghèo, tảo hôn, lao động sớm) có thể học lớp đêm / thi bằng tương đương (`S.flags.gedAt`), mở lại đường vào đại học mở (`openUni`) hoặc xin việc bậc cao hơn.

---

## 2. Cơ Chế Trọng Tâm Năm (`S.focus`, `S.fT`, `endYear`)

### Ngữ cảnh tự đổi danh sách Trọng tâm
- **Đang đi học:** `Học tập` (`Kiến thức↑ Hạnh phúc↓`), `Bạn bè·vui chơi`, `Giúp việc nhà`, `Thể thao`, `Sở thích` (đại học có thêm `Làm thêm` / `Chuẩn bị nghề nghiệp`).
- **Đang đi làm:** `Dồn sức cho công việc` (`Thu nhập·Thăng tiến↑ Sức khỏe·Quan hệ↓`), `Cân bằng`, `Gia đình·bạn bè`, `Chăm sóc sức khỏe`, `Phát triển bản thân` (`Kiến thức↑ Lời mời chuyển việc↑`), `Sở thích`.
- **Thất nghiệp (`seeking`) / Nghỉ hưu / Nội trợ:** `Nghỉ ngơi`, `Học hỏi·rèn trí não`, `Tôn giáo·tình nguyện`...

### Thuật toán chia tỷ lệ thời gian (`endYear`)
- Trong suốt năm, hệ thống cộng dồn thời gian thực tế vào `S.fT[focus]`.
- Cuối năm (`a = sum(S.fT)`):
  - Với mỗi trọng tâm `u`, tỷ trọng `p = S.fT[u] / a`.
  - Áp dụng thay đổi chỉ số theo tỷ trọng: `stat = clamp(stat + delta * p, 0, 100)`.
  - Trọng tâm `Sở thích` / `Thể thao` cộng thêm `+1.2 * p * talK(id)` vào kỹ năng sở thích.
- **Hồi quy về mức nền (Mean-reversion):** Cuối năm, `Sức khỏe`, `Hạnh phúc`, `Quan hệ` kéo dần (`12–25%`) về mức nền thực tế (tính từ tuổi tác, tài sản, nợ nần, vợ/chồng, con cái, bệnh mãn tính).
